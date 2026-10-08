import test from 'node:test';
import assert from 'node:assert/strict';
import { game, solveExact, referenceOptimum, orient, evaluateLayout, legalPlacements, generateLevel, certify, seedRng, createRng, start, players, input, timer, finish } from './helpers.mjs';

const rectangle = (width, height) => Array.from({ length: width * height }, (_, i) => [i % width, Math.floor(i / width)]);
const level = (width, height, crates, cells = rectangle(width, height), allowFlip = false) => ({ width, height, crates, cells, allowFlip, difficulty: 1 });
const piece = (id, cells, value) => ({ id, cells, value });
test('exact solver handles weighted skipping, holes, overlap, impossible cargo and empty packing', () => {
  const cases = [
    [level(2, 1, [piece('heavy', [[0, 0], [1, 0]], 11), piece('a', [[0, 0]], 8), piece('b', [[0, 0]], 8)]), 16],
    [level(3, 2, [piece('square', [[0, 0], [1, 0], [0, 1], [1, 1]], 10), piece('line', [[0, 0], [1, 0], [2, 0]], 9)]), 10],
    [level(2, 2, [piece('L', [[0, 0], [1, 0], [0, 1]], 7)], [[1, 0], [0, 1], [1, 1]]), 7],
    [level(2, 1, [piece('big', [[0, 0], [1, 0], [2, 0]], 500), piece('fit', [[0, 0]], 2)]), 2],
    [level(1, 1, [piece('big', [[0, 0], [1, 0]], 500)]), 0],
    [level(1, 1, []), 0], [level(1, 1, [piece('a', [[0, 0]], 1)], []), 0],
  ];
  for (const [puzzle, expected] of cases) {
    const actual = solveExact(puzzle);
    assert.equal(actual.value, expected); assert.equal(referenceOptimum(puzzle), expected);
    assert.equal(evaluateLayout(puzzle, actual.placements).value, expected);
    assert.ok(evaluateLayout(puzzle, actual.placements).valid);
  }
});
test('all quarter turns and reflection restrictions are geometric, not metadata', () => {
  assert.deepEqual(orient([[0, 0], [0, 1], [1, 1]], 1), [[0, 0], [1, 0], [0, 1]]);
  const chiral = [[0, 0], [0, 1], [0, 2], [1, 2]];
  const mirrored = orient(chiral, 4);
  const puzzle = level(2, 3, [piece('J', chiral, 12)], mirrored);
  assert.equal(solveExact(puzzle).value, 0);
  assert.equal(solveExact({ ...puzzle, allowFlip: true }).value, 12);
  assert.equal(evaluateLayout(puzzle, [{ crateId: 'J', x: 0, y: 0, rotation: 4 }]).valid, false);
  assert.equal(legalPlacements({ ...puzzle, allowFlip: true }, puzzle.crates[0]).length, 1);
});
test('layout evaluator rejects duplicate, overlap, holes, forged ids and malformed coordinates', () => {
  const puzzle = level(2, 2, [piece('a', [[0, 0]], 4), piece('b', [[0, 0]], 5)], [[0, 0], [1, 0], [0, 1]]);
  const a = { crateId: 'a', x: 0, y: 0, rotation: 0 };
  assert.equal(evaluateLayout(puzzle, [a, { ...a, x: 1 }]).valid, false, 'same crate twice at disjoint coordinates');
  for (const placements of [[a, a], [a, { ...a, crateId: 'b' }], [{ ...a, x: 1, y: 1 }], [{ ...a, crateId: 'ghost' }], [{ ...a, x: 0.5 }], [{ ...a, rotation: 0.5 }], [{ ...a, rotation: -1 }], [{ ...a, x: -1 }], [{ ...a, rotation: 4 }]]) assert.equal(evaluateLayout(puzzle, placements).valid, false);
  assert.deepEqual(evaluateLayout(puzzle, [a]), { valid: true, value: 4, cells: [[0, 0]] });
});
test('generator proves every tier and both reflection settings; all input crate counts occur', () => {
  const counts = new Set(); const fingerprints = new Set();
  for (let difficulty = 1; difficulty <= 10; difficulty++) for (let seed = 0; seed < 20; seed++) for (const flip of [false, true]) {
    const g = generateLevel(seedRng(seed), difficulty, flip);
    assert.equal(g.level.difficulty, difficulty); assert.equal(g.level.allowFlip, flip);
    assert.equal(g.optimum, 200); assert.equal(certify(g.level, g.solution), 200);
    assert.equal(evaluateLayout(g.level, g.solution).value, 200);
    counts.add(g.level.crates.length); fingerprints.add(JSON.stringify(g.level));
    assert.deepEqual(generateLevel(seedRng(seed), difficulty, flip), g);
  }
  assert.deepEqual([...counts].sort((a, b) => a - b), [6, 7, 8, 9, 10, 11, 12]); assert.ok(fingerprints.size > 100);
});
test('bots independently solve the public puzzle and hit exact 60/80/95 percent', () => {
  for (let difficulty = 1; difficulty <= 10; difficulty++) for (const flip of [false, true]) {
    const s = start(123, 2, { difficulty, allowFlip: flip });
    for (const [skill, expected] of [['easy', 120], ['normal', 160], ['sharp', 190]]) {
      const poisoned = { ...s, optimum: 999_999, solution: [] };
      const action = game.bot.sampleInput(poisoned, 'p0', createRng(7), skill);
      assert.ok(game.inputSchema.safeParse(action).success);
      assert.equal(evaluateLayout(s.level, action.placements).value, expected);
      assert.deepEqual(game.bot.sampleInput(s, 'p0', createRng(7), skill), action);
    }
  }
});
test('timers, repeated packing instances, pause/resume and deadlines resist stale events', () => {
  const s = start();
  const stale = { type: 'timer', phaseId: s.phase.id, startedAt: s.phase.startedAt - 1, now: s.phase.deadline };
  assert.equal(game.reduce(s, stale), s);
  assert.equal(game.reduce(s, { ...stale, startedAt: s.phase.startedAt, now: s.phase.deadline - 1 }), s);
  const paused = game.reduce(s, { type: 'vip', action: 'pause', now: 2000 });
  assert.ok(paused.phase.paused);
  assert.equal(timer(paused), paused); assert.equal(input(paused, { type: 'clear' }), paused);
  const resumed = game.reduce(paused, { type: 'vip', action: 'resume', now: 12_000 });
  assert.equal(resumed.phase.deadline, s.phase.deadline + 10_000); assert.equal(resumed.phase.paused, undefined);
  assert.equal(game.reduce(resumed, { ...stale, startedAt: s.phase.startedAt }), resumed);
  const next = timer(resumed); assert.equal(next.seat, 1); assert.notEqual(next.phase.startedAt, s.phase.startedAt);
  assert.equal(game.reduce(next, { ...stale, startedAt: s.phase.startedAt, now: next.phase.deadline }), next);
  assert.equal(game.reduce(next, { type: 'input', playerId: 'p1', input: { type: 'clear' }, now: next.phase.deadline }), next);
  assert.equal(timer(next).phase.id, 'reveal'); assert.equal(timer(timer(next)).phase.id, 'done');
});
test('private layouts and optimum witnesses are hidden until reveal; view mutation is harmless', () => {
  const s = start(); const placement = s.solution[0];
  const altered = { ...s, layouts: { ...s.layouts, p1: [placement] }, solution: [], optimum: 999 };
  assert.deepEqual(game.tvView(s), game.tvView(altered));
  assert.deepEqual(game.controllerView(s, 'p0'), game.controllerView(altered, 'p0'));
  assert.deepEqual(game.controllerView(s, 'spectator'), game.controllerView(altered, 'spectator'));
  assert.notDeepEqual(game.controllerView(s, 'p1'), game.controllerView(altered, 'p1'));
  for (const id of ['spectator', '__proto__', 'constructor']) assert.deepEqual(game.controllerView(s, id).ownLayout, []);
  const before = JSON.stringify(s); const view = game.tvView(s); view.level.crates[0].value = 999; view.level.cells[0][0] = 999; assert.equal(JSON.stringify(s), before);
  const reveal = timer(timer(s)); assert.equal(game.tvView(reveal).optimum, 200); assert.ok(game.tvView(reveal).solution.length);
});
test('only active players edit, illegal cargo is ignored, immutable submit advances and exact ratio scores', () => {
  const s = start(); const before = JSON.stringify(s); const legal = s.solution[0];
  assert.equal(input(s, { type: 'place', placement: legal }, 'p1'), s);
  assert.equal(input(s, { type: 'place', placement: legal }, 'ghost'), s);
  assert.equal(input(s, { type: 'place', placement: { ...legal, x: 100 } }), s);
  assert.equal(input(s, { type: 'next' }), s);
  let next = input(s, { type: 'place', placement: legal }); assert.equal(next.layouts.p0.length, 1);
  next = input(next, { type: 'remove', crateId: legal.crateId }); assert.equal(next.layouts.p0.length, 0);
  next = input(s, { type: 'submit', placements: s.solution }); assert.equal(next.seat, 1); assert.deepEqual(next.submitted, ['p0']);
  assert.equal(input(next, { type: 'clear' }, 'p0'), next); assert.equal(JSON.stringify(s), before);
  const reveal = timer(next); assert.equal(reveal.scores.p0, 1); assert.equal(reveal.scores.p1, 0);
  const done = timer(reveal); assert.equal(game.results(done).ranking[0].playerId, 'p0'); assert.deepEqual(game.results(done).winnerIds, ['p0']);
});
test('leave and disconnect preserve all results and recheck the active seat on resume', () => {
  let s = start(7, 3); s = game.reduce(s, { type: 'vip', action: 'pause', now: 2000 });
  s = game.reduce(s, { type: 'player', playerId: 'p0', connected: false, gone: 'left', now: 3000 }); assert.equal(s.seat, 0);
  s = game.reduce(s, { type: 'vip', action: 'resume', now: 4000 }); assert.equal(s.seat, 1);
  assert.deepEqual(s.left, ['p0']); assert.equal(game.controllerView(s, 'p0').me.role, 'spectator');
  assert.equal(game.bot.sampleInput(s, 'p0', createRng(0)), null);
  const done = finish(s).state; assert.deepEqual(Object.keys(game.results(done).scores).sort(), ['p0', 'p1', 'p2']); assert.equal(game.results(done).scores.p0, 0);
  const ended = game.reduce(start(), { type: 'vip', action: 'end', now: 3000 }); assert.equal(ended.phase.id, 'done'); assert.equal(ended.phase.deadline, null); assert.ok(game.results(ended));
  let tie = start(); tie = timer(timer(timer(tie))); assert.deepEqual(game.results(tie).winnerIds, ['p0', 'p1']); assert.deepEqual(game.results(tie).ranking.map(r => r.rank), [1, 1]);
});
test('prototype-like actual player IDs remain valid own properties', () => {
  const s = game.init({ players: players(2, ['__proto__', 'constructor']), settings: { rounds: 1 }, seed: 4, now: 0 });
  const done = finish(s).state; assert.deepEqual(Object.keys(game.results(done).scores), ['__proto__', 'constructor']);
  assert.equal(game.controllerView(s, '__proto__').me.role, 'player');
});
