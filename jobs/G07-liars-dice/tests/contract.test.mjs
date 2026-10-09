import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { core, contract, root, makeState, input, clone, deepFreeze, assertJson, sample, skills, checkResults, playGame, validateJsonSchema, writeEvidence } from './helpers.mjs';

function phaseExamples() {
  const bid = makeState(3, 3);
  let reveal = core.reduce(bid, input(bid, { type: 'bid', quantity: 1, face: 2 }));
  reveal = core.reduce(reveal, input(reveal, { type: 'dudo' }));
  assert.equal(reveal.phase.id, 'reveal');
  const done = core.reduce(reveal, { type: 'vip', now: 3000, action: 'end' });
  return { bid, reveal, done };
}

test('contract 1: total, immutable reducer handles every event type in every phase and rejects unknown prototype ids', () => {
  let cases = 0;
  for (const [phase, state] of Object.entries(phaseExamples())) {
    const unexpected = [
      null, {}, { type: 'unknown', now: 2000 },
      { type: 'input', now: 2000, playerId: state.turn, input: null },
      { type: 'vip', now: 2000, action: 'unknown' },
      { type: 'player', now: 2000, playerId: state.turn, connected: false, gone: 'unknown' },
      { type: 'speech', now: 2000, key: 'missing-key', ms: 900 },
      { type: 'speechStart', now: 2000, key: 'missing-key' },
      { type: 'timer', now: 100000, phaseId: phase, startedAt: state.phase.startedAt - 1 },
      { type: 'timer', now: 100000, phaseId: 'nonexistent', startedAt: state.phase.startedAt },
    ];
    for (const id of ['spectator', '__proto__', 'constructor', 'toString', '']) {
      unexpected.push({ type: 'player', now: 2000, playerId: id, connected: false, gone: 'left' });
      for (const value of [{ type: 'bid', quantity: 1, face: 2 }, { type: 'dudo' }, { type: 'calza' }, { type: 'continue' }]) unexpected.push(input(state, value, id, 2000));
    }
    for (const event of unexpected) {
      assert.doesNotThrow(() => core.reduce(deepFreeze(state), deepFreeze(event)));
      assert.deepEqual(core.reduce(state, event), state, `${phase} unexpectedly accepted ${JSON.stringify(event)}`);
      cases += 1;
    }
    for (const id of [...state.order, 'spectator', '__proto__', 'constructor', 'toString', '']) {
      assert.doesNotThrow(() => core.controllerView(state, id));
      assertJson(core.controllerView(state, id), `${phase} controller ${id}`);
      for (const skill of skills) {
        const action = sample(state, id, 13, skill);
        assert.ok(action === null || core.game.inputSchema.safeParse(action).success);
      }
    }
    for (const action of ['pause', 'resume', 'skip', 'end']) assert.doesNotThrow(() => core.reduce(state, { type: 'vip', now: 2000, action }));
    for (const id of state.order) for (const connected of [true, false]) assert.doesNotThrow(() => core.reduce(state, { type: 'player', now: 2000, playerId: id, connected }));
    assert.doesNotThrow(() => core.tvView(state));
  }
  writeEvidence('contract-fuzz.json', { result: 'PASS', immutableUnexpectedEvents: cases, phases: Object.keys(phaseExamples()), hostileIds: ['spectator', '__proto__', 'constructor', 'toString', ''] });
});

test('contract 2: game modules contain no clocks, unseeded randomness, I/O, or module mutable declarations', () => {
  const files = ['core.ts', 'probability.ts', 'rules.ts'];
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = readFileSync(resolve(root, 'src', file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    assert.doesNotMatch(source, /\b(?:Date\.now|Math\.random|setTimeout|setInterval|fetch|XMLHttpRequest|WebSocket)\s*\(/, file);
    assert.doesNotMatch(source, /(?:from\s*|import\s*\()\s*['"](?:node:)?(?:fs|http|https|net|child_process|worker_threads|timers|process)(?:\/|['"])/, file);
    assert.doesNotMatch(source, /^(?:export\s+)?(?:let|var)\s+/m, `${file} has module-level mutable variable`);
    assert.doesNotMatch(source, /^(?:export\s+)?const\s+\w+\s*=\s*new\s+(?:Map|Set|WeakMap|WeakSet)\s*\(/m, `${file} has module-level mutable collection`);
  }
});

test('contract 3: timer identity, deadline, pause duration, stale replay and no-clock unlimited idle behavior', () => {
  const state = makeState(3, 16, { turnSeconds: 10 });
  const event = { type: 'timer', now: state.phase.deadline, phaseId: state.phase.id, startedAt: state.phase.startedAt };
  assert.equal(core.reduce(state, { ...event, startedAt: state.phase.startedAt - 1 }), state);
  assert.equal(core.reduce(state, { ...event, phaseId: 'reveal' }), state);
  assert.equal(core.reduce(state, { ...event, now: state.phase.deadline - 1 }), state);
  const advanced = core.reduce(state, event);
  assert.notDeepEqual(advanced, state, 'a live timer must act');
  assert.equal(core.reduce(advanced, event), advanced, 'old phase-instance timer fired twice');
  const held = core.reduce(state, { type: 'vip', now: 2000, action: 'pause' });
  assert.deepEqual(held.phase.paused, { at: 2000 });
  assert.equal(core.reduce(held, event), held);
  assert.equal(core.reduce(held, input(held, { type: 'bid', quantity: 1, face: 2 })), held);
  const resumed = core.reduce(held, { type: 'vip', now: 7000, action: 'resume' });
  assert.equal(resumed.phase.deadline, state.phase.deadline + 5000);
  assert.ok(!resumed.phase.paused);
  assert.equal(core.reduce(resumed, { ...event, now: state.phase.deadline }), resumed);
  const noClock = makeState(3, 16);
  assert.equal(noClock.phase.deadline, null);
  assert.equal(core.reduce(noClock, { type: 'timer', now: 100000000, phaseId: noClock.phase.id, startedAt: noClock.phase.startedAt }), noClock);
  assert.equal(noClock.phase.id, 'bid');
});

test('empty rooms pause without a fallback, reconnect resumes auto-hold, intentional VIP hold remains', () => {
  let state = makeState(3, 11, {}, null, false);
  const original = clone(state);
  for (let i = 0; i < state.order.length; i += 1) state = core.reduce(state, { type: 'player', now: 2000 + i, playerId: state.order[i], connected: false });
  assert.ok(state.phase.paused);
  assert.equal(state.autoPaused, true);
  assert.equal(state.phase.deadline, null);
  assert.equal(core.reduce(state, { type: 'timer', now: 1000000, phaseId: state.phase.id, startedAt: state.phase.startedAt }), state);
  const connected = core.reduce(state, { type: 'player', now: 9000, playerId: state.turn, connected: true });
  assert.ok(!connected.phase.paused);
  assert.equal(connected.autoPaused, false);
  let held = core.reduce(original, { type: 'vip', now: 1500, action: 'pause' });
  for (const id of held.order) held = core.reduce(held, { type: 'player', now: 2000, playerId: id, connected: false });
  held = core.reduce(held, { type: 'player', now: 9000, playerId: held.turn, connected: true });
  assert.deepEqual(held.phase.paused, { at: 1500 });
  assert.equal(held.autoPaused, false);
  const drop = core.reduce(original, { type: 'player', now: 2000, playerId: original.turn, connected: false });
  assert.equal(drop.phase.deadline, null);
  assert.equal(sample(drop, original.turn, 3), null);
});

test('permanent leavers play automatically while room occupied and cannot reclaim a departed seat', () => {
  const state = makeState(3, 17, {}, null, false);
  const left = core.reduce(state, { type: 'player', now: 2000, playerId: state.turn, connected: false, gone: 'left' });
  assert.ok(left.left.includes(state.turn));
  assert.equal(left.players[state.turn].connected, false);
  assert.ok(left.turn !== state.turn || left.phase.id !== 'bid', 'departed current turn was not automated');
  const again = core.reduce(left, { type: 'player', now: 3000, playerId: state.turn, connected: true });
  assert.equal(again.players[state.turn].connected, false);
  assert.equal(core.reduce(again, input(again, { type: 'bid', quantity: 1, face: 6 }, state.turn)), again);
  const ended = core.reduce(again, { type: 'vip', now: 4000, action: 'end' });
  checkResults(ended, state.order);
});

test('legitimate empty-string and prototype-named seats remain playable and ranked', () => {
  for (const ids of [['', 'other', 'third'], ['__proto__', 'constructor', 'toString']]) {
    let state = makeState(3, 2, {}, ids);
    assert.deepEqual(state.order, ids);
    for (const id of ids) {
      assert.ok(Object.hasOwn(state.players, id));
      assert.equal(core.controllerView(state, id).me.role, 'player');
      assert.equal(core.controllerView(state, id).ownDice.length, 5);
    }
    state.turn = ids[0];
    state = core.reduce(state, input(state, { type: 'bid', quantity: 1, face: 2 }));
    assert.equal(state.bid.playerId, ids[0]);
    assert.equal(state.turn, ids[1]);
    state = core.reduce(state, { type: 'vip', now: 2000, action: 'end' });
    checkResults(state, ids);
  }
});

test('contract 5: counterfactual private cups and RNG cannot alter public or another player view; reveals become public', () => {
  let state = makeState(3, 21);
  state = core.reduce(state, input(state, { type: 'bid', quantity: 2, face: 3 }));
  for (const viewer of [...state.order, 'spectator', '__proto__', 'constructor', '']) {
    const cv = core.controllerView(state, viewer);
    assertJson(cv);
    assert.equal(cv.gameId, core.game.manifest.id);
    assert.equal(cv.phaseId, state.phase.id);
    assert.equal(cv.deadline, state.phase.deadline);
    assert.equal(cv.paused, Boolean(state.phase.paused));
    for (const secret of ['cups', 'rng', 'models', 'nextStarter', 'nextPalifico']) assert.ok(!Object.hasOwn(cv, secret), `${viewer} exposes ${secret}`);
    const known = state.order.includes(viewer);
    assert.deepEqual(cv.ownDice, known ? state.cups[viewer] : []);
    if (!known) { assert.equal(cv.odds, null); assert.deepEqual(cv.legalBids, []); assert.equal(cv.me.role, 'spectator'); }
    const alternative = clone(state);
    for (const id of state.order) if (id !== viewer) alternative.cups[id] = alternative.cups[id].map((die) => die % 6 + 1);
    alternative.rng = { seed: 321, step: 654 };
    alternative.models.p0 = { truth: 543, false: 876 };
    assert.deepEqual(core.controllerView(alternative, viewer), cv, `${viewer} view depends on unseen information`);
  }
  const tv = core.tvView(state);
  assertJson(tv);
  for (const secret of ['cups', 'rng', 'models', 'ownDice', 'nextStarter', 'nextPalifico']) assert.ok(!Object.hasOwn(tv, secret));
  const alternative = clone(state);
  for (const id of state.order) alternative.cups[id] = alternative.cups[id].map((die) => die % 6 + 1);
  alternative.rng = { seed: 321, step: 654 };
  assert.deepEqual(core.tvView(alternative), tv);
  const reveal = core.reduce(state, input(state, { type: 'dudo' }));
  assert.deepEqual(core.tvView(reveal).reveal.dice, state.cups);
  for (const id of state.order) assert.deepEqual(core.controllerView(reveal, id).reveal.dice, state.cups);
  assert.notDeepEqual(core.controllerView(state, 'p0').ownDice, core.controllerView(state, 'p1').ownDice);
});

test('contract 6 and 7: each phase accepts explicit end and skip makes progress; unlimited idle never silently ends', () => {
  for (const [phase, state] of Object.entries(phaseExamples())) {
    const ended = core.reduce(state, { type: 'vip', now: 9999, action: 'end' });
    assert.equal(ended.phase.id, 'done');
    checkResults(ended);
    if (phase !== 'done') assert.notDeepEqual(core.reduce(state, { type: 'vip', now: 9999, action: 'skip' }), state);
  }
  assert.equal(core.game.manifest.unlimitedDuration, true);
  assert.equal(core.results(makeState()), null);
});

test('contract 8: every skill supplies legal schema-valid action or null in every phase and inactive seat', () => {
  for (const state of Object.values(phaseExamples())) for (const id of [...state.order, 'spectator', '__proto__', '']) for (const skill of skills) {
    const action = sample(deepFreeze(state), id, 23, skill);
    assert.ok(action === null || core.game.inputSchema.safeParse(action).success);
    if (action) assert.notDeepEqual(core.reduce(state, input(state, action, id)), state);
  }
  for (const bad of [{}, { type: 'bid', quantity: 0, face: 1 }, { type: 'bid', quantity: 1000001, face: 1 }, { type: 'bid', quantity: 1, face: 0 }, { type: 'bid', quantity: 1, face: 7 }, { type: 'bid', quantity: 1.5, face: 1 }, { type: 'dudo', extra: 'oops' }, { type: 'bogus' }]) assert.equal(core.game.inputSchema.safeParse(bad).success, false, JSON.stringify(bad));
});

test('contract 9: exact shared manifest schema, exact disk equality, phase fixture JSON schemas and continued games', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
  assert.ok(contract.gameManifestSchema.safeParse(manifest).success);
  assert.deepEqual(core.game.manifest, manifest);
  assert.deepEqual(core.game.phases, ['bid', 'reveal', 'done']);
  const schema = JSON.parse(readFileSync(resolve(root, 'fixtures/schema.json'), 'utf8'));
  const validBidFixture = JSON.parse(readFileSync(resolve(root, 'fixtures/bid.json'), 'utf8'));
  for (const corrupt of [
    (state) => { delete state.round; },
    (state) => { state.diceCount[state.order[0]] = 6; },
    (state) => { state.cups[state.order[0]][0] = 7; },
    (state) => { state.settings.turnSeconds = 121; },
    (state) => { state.unrecognized = true; },
    (state) => { state.constructor = true; },
    (state) => { Object.defineProperty(state, '__proto__', { value: true, enumerable: true }); },
    (state) => { delete state.players[state.order[0]].connected; },
  ]) {
    const invalid = clone(validBidFixture); corrupt(invalid);
    assert.throws(() => validateJsonSchema(schema, invalid), 'fixture schema accepted corrupt saved state');
  }
  const fixtureFiles = readdirSync(resolve(root, 'fixtures')).filter((file) => file.endsWith('.json') && file !== 'schema.json').sort();
  assert.deepEqual(fixtureFiles, [...core.game.phases].map((phase) => `${phase}.json`).sort());
  const phases = [];
  let finalFromReveal = null;
  for (const phase of core.game.phases) {
    let state = JSON.parse(readFileSync(resolve(root, 'fixtures', `${phase}.json`), 'utf8'));
    validateJsonSchema(schema, state);
    assert.equal(state.phase.id, phase);
    assertJson(state);
    for (const id of [...state.order, 'unknown']) assertJson(core.controllerView(state, id));
    assertJson(core.tvView(state));
    const nowStart = state.phase.startedAt;
    for (let step = 0; state.phase.id !== 'done' && step < 5000; step += 1) {
      const id = state.phase.id === 'reveal' ? state.order.find((seat) => state.players[seat].connected && !state.left.includes(seat)) : state.turn;
      const action = sample(state, id, 0xf17e ^ Math.imul(step + 1, 0x9e3779b1), 'normal');
      assert.ok(action !== null && core.game.inputSchema.safeParse(action).success);
      state = core.reduce(state, input(state, action, id, nowStart + 1000 + step * 1000));
      validateJsonSchema(schema, state);
    }
    assert.equal(state.phase.id, 'done');
    checkResults(state);
    phases.push(phase);
    if (phase === 'reveal') finalFromReveal = state;
    if (phase === 'done') assert.deepEqual(state, finalFromReveal, 'done fixture is not the played-out final scores state from reveal');
  }
  writeEvidence('fixtures.json', { result: 'PASS', phases, manifestSchema: 'exact repository gameManifestSchema', schema: 'fixtures/schema.json', doneEqualsContinuedReveal: true });
});
