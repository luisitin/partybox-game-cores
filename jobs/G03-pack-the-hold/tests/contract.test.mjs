import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { game, stateSchema, evaluateLayout, createRng, start, timer, finish, propertySeeds, players } from './helpers.mjs';

function jsonSafe(value) { assert.deepEqual(JSON.parse(JSON.stringify(value)), value); }
function checkState(s) {
  assert.ok(Buffer.byteLength(JSON.stringify(s)) <= 256 * 1024);
  assert.ok(stateSchema.safeParse(s).success, JSON.stringify(stateSchema.safeParse(s).error));
  jsonSafe(s); jsonSafe(game.tvView(s));
  for (const id of [...s.order, 'unknown', '__proto__', 'constructor']) {
    jsonSafe(game.controllerView(s, id));
    const value = game.bot.sampleInput(s, id, createRng(1), 'normal');
    assert.ok(value === null || game.inputSchema.safeParse(value).success);
  }
}
test('invariants 1,3,4,5,7,8: property seeds 1/2/3 plus 1,000 pseudorandom seeds and replay after every event', () => {
  for (const seed of propertySeeds()) {
    let s = start(seed, 2 + seed % 7, { difficulty: 1 + seed % 10, allowFlip: (seed & 1) === 1, rounds: 1 + seed % 3 });
    let replay = JSON.parse(JSON.stringify(s)); checkState(s);
    const unexpected = [
      { type: 'input', playerId: 'unknown', input: { type: 'clear' }, now: s.phase.startedAt },
      { type: 'input', playerId: '__proto__', input: { type: 'clear' }, now: s.phase.startedAt },
      { type: 'input', playerId: s.order[0], input: { type: 'not-a-command' }, now: s.phase.startedAt },
      { type: 'timer', phaseId: 'not-a-phase', startedAt: s.phase.startedAt, now: s.phase.deadline },
      { type: 'timer', phaseId: s.phase.id, startedAt: s.phase.startedAt - 1, now: s.phase.deadline },
      { type: 'player', playerId: 'unknown', connected: false, now: s.phase.startedAt },
      { type: 'speech', key: 'unrelated', ms: 1000, now: s.phase.startedAt },
      { type: 'speechStart', key: 'unrelated', now: s.phase.startedAt },
      { type: 'vip', action: 'resume', now: s.phase.startedAt },
    ];
    for (const event of unexpected) assert.equal(game.reduce(s, event), s);
    const { events } = finish(s);
    for (const event of events) {
      const before = JSON.stringify(s); const eventBefore = JSON.stringify(event);
      const next = game.reduce(s, event); replay = game.reduce(replay, JSON.parse(eventBefore));
      assert.equal(JSON.stringify(s), before); assert.equal(JSON.stringify(event), eventBefore);
      assert.equal(JSON.stringify(next), JSON.stringify(replay)); s = next;
      assert.ok(Buffer.byteLength(JSON.stringify(s)) < 256 * 1024);
      jsonSafe(game.tvView(s));
    }
    const r = game.results(s); assert.deepEqual(Object.keys(r.scores).sort(), [...s.order].sort());
    for (const score of Object.values(r.scores)) assert.ok(Number.isFinite(score));
    checkState(s);
  }
});
test('invariants 6,7,8: 1,000 seeded bot games at EACH valid player count 2–8', () => {
  for (let count = 2; count <= 8; count++) {
    for (let seed = 0; seed < 1000; seed++) {
      const initial = start(seed, count, { difficulty: 1 + seed % 10, allowFlip: Boolean(seed % 2) });
      const skills = Object.fromEntries(initial.order.map((id, i) => [id, ['easy', 'normal', 'sharp'][i % 3]]));
      const { state: done, events } = finish(initial, skills);
      for (const event of events) if (event.type === 'input') assert.ok(game.inputSchema.safeParse(event.input).success);
      assert.equal(done.phase.id, 'done');
      assert.ok(done.phase.startedAt - initial.phase.startedAt <= game.manifest.estimatedMinutes * 3 * 60_000);
      const results = game.results(done); assert.equal(Object.keys(results.scores).length, count);
      for (const id of initial.order) assert.equal(results.scores[id], skills[id] === 'easy' ? 0.6 : skills[id] === 'sharp' ? 0.95 : 0.8);
    }
  }
});
test('invariant 6: idle games, all settings extremes, departures, VIP actions and every phase terminate', () => {
  for (const count of [2, 5, 8]) for (const turnSeconds of [20, 60]) for (const rounds of [1, 3]) {
    let s = start(32, count, { turnSeconds, rounds }); const at = s.phase.startedAt;
    for (let steps = 0; s.phase.id !== 'done' && steps < 100; steps++) s = timer(s);
    assert.equal(s.phase.id, 'done'); assert.ok(s.phase.startedAt - at < game.manifest.estimatedMinutes * 3 * 60_000);
    const original = start(0, count, { rounds }); let left = original;
    for (const p of original.order) left = game.reduce(left, { type: 'player', playerId: p, connected: false, gone: 'kicked', now: left.phase.startedAt + 1 });
    assert.equal(finish(left).state.phase.id, 'done');
  }
  for (const s of [start(), timer(timer(start())), finish(start()).state]) for (const action of ['pause', 'resume', 'skip', 'end']) {
    const next = game.reduce(s, { type: 'vip', action, now: s.phase.startedAt + 1 }); jsonSafe(next); assert.ok(game.controllerView(next, 'spectator'));
  }
});
test('invariant 5: every opponent layout can change without changing another player or TV view', () => {
  for (let count = 2; count <= 8; count++) {
    const s = start(42, count);
    for (const owner of s.order) {
      const altered = { ...s, layouts: { ...s.layouts, [owner]: s.solution } };
      assert.deepEqual(game.tvView(s), game.tvView(altered));
      for (const viewer of [...s.order.filter(id => id !== owner), 'spectator']) assert.deepEqual(game.controllerView(s, viewer), game.controllerView(altered, viewer));
    }
    const reveal = finish(start(42, count)).state; const before = JSON.stringify(reveal);
    const view = game.tvView(reveal); const id = s.order[0]; view.roundScores[id].value = 999;
    assert.equal(JSON.stringify(reveal), before);
  }
});
test('invariant 2: AST purity checks core modules and seeded randomness only', () => {
  const banned = /^(?:(?:Math\.random|Date\.now|performance\.now|setTimeout|setInterval|fetch|require|eval|Function|XMLHttpRequest|WebSocket)$|console\.)/;
  for (const name of readdirSync('src').filter(name => name.endsWith('.ts') && name !== 'browser.ts')) {
    const source = readFileSync(`src/${name}`, 'utf8'); const ast = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true);
    function walk(node) {
      if (ts.isCallExpression(node) || ts.isNewExpression(node)) assert.ok(!banned.test(node.expression.getText(ast)), `${name}: forbidden call ${node.expression.getText(ast)}`);
      if (ts.isImportDeclaration(node)) assert.ok(!/['"](?:node:|https?:)/.test(node.moduleSpecifier.getText(ast)), `${name}: I/O import`);
      if (ts.isVariableStatement(node) && node.parent === ast) assert.ok(node.declarationList.flags & ts.NodeFlags.Const, `${name}: mutable module global`);
      ts.forEachChild(node, walk);
    }
    walk(ast);
  }
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')); assert.deepEqual(Object.keys(pkg.dependencies), ['zod']);
});
test('invariant 9: exact public manifest validation, phase fixtures, real played-out done fixture', async () => {
  const { gameManifestSchema } = await import('../.build/contract-validation.mjs');
  assert.ok(gameManifestSchema.safeParse(game.manifest).success);
  assert.deepEqual(JSON.parse(readFileSync('manifest.json', 'utf8')), game.manifest);
  const fixtures = Object.fromEntries(game.phases.map(phase => [phase, JSON.parse(readFileSync(`fixtures/${phase}.json`, 'utf8'))]));
  for (const [phase, fixture] of Object.entries(fixtures)) { assert.equal(fixture.phase.id, phase); checkState(fixture); assert.ok(game.results(finish(fixture).state)); }
  assert.deepEqual(finish(fixtures.reveal).state, fixtures.done);
});
test('2,000 sharp-versus-normal games and 2,000 normal-versus-easy games; seat parity randomized', () => {
  for (const [strong, weak] of [['sharp', 'normal'], ['normal', 'easy']]) {
    let wins = 0; let ties = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const initial = start(seed, 2, { difficulty: 1 + seed % 10, allowFlip: Boolean(seed % 2), rounds: 1 + seed % 3 });
      const stronger = initial.order[seed % 2]; const other = initial.order[1 - seed % 2];
      const done = finish(initial, { [stronger]: strong, [other]: weak }).state;
      const r = game.results(done); if (r.scores[stronger] > r.scores[other]) wins++; else if (r.scores[stronger] === r.scores[other]) ties++;
      for (const row of done.history[stronger]) assert.equal(row.ratio, strong === 'sharp' ? 0.95 : 0.8);
    }
    assert.equal(wins, 2000); assert.equal(ties, 0);
    console.log(JSON.stringify({ league: `${strong} vs ${weak}`, games: 2000, wins, ties, winRate: wins / 2000 }));
  }
});
