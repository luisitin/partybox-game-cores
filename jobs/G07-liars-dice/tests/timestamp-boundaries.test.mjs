import test from 'node:test';
import assert from 'node:assert/strict';
import { core, context, makeState, input, clone, deepFreeze, assertJson, checkResults, sample } from './helpers.mjs';

const MAX_HOST_TIME = 1e15;
function phases() {
  const bid = makeState(3, 7, { turnSeconds: 10 });
  const raised = core.reduce(bid, input(bid, { type: 'bid', quantity: 1, face: 2 }));
  const reveal = core.reduce(raised, input(raised, { type: 'dudo' }));
  assert.equal(reveal.phase.id, 'reveal');
  return [bid, reveal, core.reduce(reveal, { type: 'vip', now: 4000, action: 'end' })];
}

test('unsupported timestamps cannot corrupt state, change player presence, or consume any phase event', () => {
  const invalidTimes = [-Number.MAX_VALUE, Number.MAX_VALUE, 1e20, MAX_HOST_TIME + 1, -1, -0, NaN, Infinity, -Infinity, '1000', null, undefined];
  let cases = 0;
  for (const state of phases()) {
    deepFreeze(state);
    const before = JSON.stringify(state);
    for (const now of invalidTimes) {
      const events = [
        { ...input(state, { type: 'bid', quantity: 1, face: 2 }, state.turn), now },
        { ...input(state, { type: 'continue' }, state.order[0]), now },
        { type: 'timer', now, phaseId: state.phase.id, startedAt: state.phase.startedAt },
        { type: 'player', now, playerId: state.turn, connected: false, gone: 'left' },
        ...['pause', 'resume', 'skip', 'end'].map(action => ({ type: 'vip', now, action })),
        { type: 'speech', now, key: 'unknown', ms: -1 },
        { type: 'speechStart', now, key: 'unknown' },
      ];
      for (const event of events) {
        assert.equal(core.reduce(state, event), state, `accepted ${event.type} with unsupported host time`);
        cases += 1;
      }
    }
    assert.equal(JSON.stringify(state), before);
  }
  for (const now of invalidTimes) assert.throws(() => core.init({ ...context(), now }), RangeError);
  assert.equal(cases, 360);
});

test('valid zero, fractional and upper-bound timestamps preserve finite JSON and distinct phase identities', () => {
  for (const now of [0, Number.MIN_VALUE, 0.125, 1000.5, MAX_HOST_TIME]) {
    const state = core.init({ ...context(3, 7, { turnSeconds: 1 }), now });
    assert.equal(state.phase.startedAt, now);
    assert.ok(Number.isFinite(state.phase.deadline));
    assertJson(state);
  }
  let state = core.init({ ...context(3, 7, { turnSeconds: 1 }), now: MAX_HOST_TIME - 5000 });
  const timer = { type: 'timer', now: state.phase.deadline, phaseId: state.phase.id, startedAt: state.phase.startedAt };
  const advanced = core.reduce(deepFreeze(state), timer);
  assert.notEqual(advanced, state);
  assert.notEqual(advanced.phase.startedAt, state.phase.startedAt);
  assert.equal(core.reduce(advanced, timer), advanced, 'a timer may be applied only to its original phase instance');
  state = advanced;
  const seen = new Set([state.phase.startedAt]);
  for (let i = 0; i < 100 && state.phase.id !== 'done'; i += 1) {
    const next = core.reduce(state, { type: 'vip', now: MAX_HOST_TIME, action: 'skip' });
    assert.notEqual(next, state);
    assert.ok(next.phase.startedAt > state.phase.startedAt);
    assert.ok(!seen.has(next.phase.startedAt), 'same event time reused an old phase stamp');
    seen.add(next.phase.startedAt);
    assert.ok(next.phase.deadline === null || Number.isFinite(next.phase.deadline));
    assertJson(next);
    state = next;
  }
  assert.ok(seen.size > 10);
  const fractional = core.init({ ...context(3, 7, { turnSeconds: 1 }), now: 1000.125 });
  const raised = core.reduce(fractional, input(fractional, { type: 'bid', quantity: 1, face: 2 }, fractional.turn, 1000.625));
  assert.notEqual(raised, fractional);
  assert.equal(raised.phase.deadline, 2000.625);
  assertJson(raised);
});

test('pause/resume and empty-room reconnect shifts remain finite and replay identically near the host-time limit', () => {
  for (const [start, pauseAt, resumeAt] of [[0, 0.125, MAX_HOST_TIME], [MAX_HOST_TIME - 5000, MAX_HOST_TIME - 4000.5, MAX_HOST_TIME]]) {
    const state = core.init({ ...context(3, 7, { turnSeconds: 120 }), now: start });
    const held = core.reduce(state, { type: 'vip', now: pauseAt, action: 'pause' });
    const event = { type: 'vip', now: resumeAt, action: 'resume' };
    const resumed = core.reduce(deepFreeze(held), event);
    assert.equal(resumed.phase.deadline, state.phase.deadline + resumeAt - pauseAt);
    assert.ok(Number.isFinite(resumed.phase.deadline));
    assert.ok(!resumed.phase.paused);
    assertJson(resumed);
    assert.deepEqual(core.reduce(clone(held), clone(event)), resumed);

    let empty = state;
    for (const id of state.order) empty = core.reduce(empty, { type: 'player', now: pauseAt, playerId: id, connected: false });
    assert.ok(empty.autoPaused && empty.phase.paused);
    const rejoined = core.reduce(deepFreeze(empty), { type: 'player', now: resumeAt, playerId: empty.turn, connected: true });
    assert.ok(!rejoined.phase.paused);
    assert.equal(rejoined.autoPaused, false);
    assert.ok(rejoined.phase.deadline === null || Number.isFinite(rejoined.phase.deadline));
    assertJson(rejoined);
    assert.deepEqual(core.reduce(clone(empty), { type: 'player', now: resumeAt, playerId: empty.turn, connected: true }), rejoined);
  }
});

test('hostile metadata, throwing getters and unknown identities are ignored by reference without coercion', () => {
  let coercions = 0, cases = 0;
  const poison = {
    [Symbol.toPrimitive]() { coercions += 1; throw new Error('metadata coercion'); },
    toString() { coercions += 1; throw new Error('metadata stringification'); },
  };
  for (const state of phases()) {
    deepFreeze(state);
    const before = JSON.stringify(state);
    const unexpected = [
      undefined, null, 3, 'input', Symbol('event'), {},
      { type: 'input', now: poison, playerId: state.turn, input: { type: 'dudo' } },
      { type: 'input', now: 2000, playerId: poison, input: { type: 'dudo' } },
      { type: poison, now: 2000 },
      { type: 'vip', now: 2000, action: poison },
      { type: 'timer', now: 2000, phaseId: poison, startedAt: state.phase.startedAt },
      { type: 'timer', now: 2000, phaseId: state.phase.id, startedAt: poison },
      { type: 'player', now: 2000, playerId: state.turn, connected: poison },
      { type: 'player', now: 2000, playerId: poison, connected: false },
      { type: 'input', now: NaN, playerId: state.turn, input: { type: 'dudo' } },
      { type: 'input', now: Infinity, playerId: state.turn, input: { type: 'dudo' } },
      { type: 'input', now: 2000, playerId: state.turn, input: { get type() { throw new Error('input getter'); } } },
      { get type() { throw new Error('event getter'); }, now: 2000 },
      { type: 'vip', get now() { throw new Error('now getter'); }, action: 'end' },
      { type: 'vip', now: 2000, get action() { throw new Error('action getter'); } },
      { type: 'player', now: 2000, get playerId() { throw new Error('playerId getter'); }, connected: false },
      { type: 'timer', now: 2000, get phaseId() { throw new Error('phaseId getter'); }, startedAt: state.phase.startedAt },
      { type: 'input', now: 2000, playerId: 'spectator', input: { type: 'continue' } },
    ];
    for (const event of unexpected) { assert.equal(core.reduce(state, event), state); cases += 1; }
    for (const id of ['spectator', '__proto__', 'constructor', 'toString', '']) {
      for (const move of [{ type: 'bid', quantity: 1, face: 2 }, { type: 'dudo' }, { type: 'calza' }, { type: 'continue' }]) {
        assert.equal(core.reduce(state, input(state, move, id)), state);
        cases += 1;
      }
    }
    assert.equal(JSON.stringify(state), before);
  }
  assert.equal(coercions, 0);
  assert.equal(cases, 129);
});

test('mutating every nested public or controller view container cannot mutate a frozen source state', () => {
  const mutate = value => {
    if (Array.isArray(value)) { [...value].forEach(mutate); value.push('changed'); }
    else if (value && typeof value === 'object') { Object.values(value).forEach(mutate); value.changed = true; }
  };
  let views = 0;
  for (const state of phases()) {
    deepFreeze(state);
    const before = JSON.stringify(state);
    mutate(core.tvView(state));
    assert.equal(JSON.stringify(state), before);
    views += 1;
    for (const id of [...state.order, 'spectator', '__proto__', 'constructor', 'toString', '', null, Symbol('viewer')]) {
      const view = core.controllerView(state, id);
      assertJson(view);
      mutate(view);
      assert.equal(JSON.stringify(state), before);
      views += 1;
    }
  }
  assert.equal(views, 33);
});

test('empty and prototype-named legitimate seats complete entire games with the actual winner and all scores', () => {
  for (const ids of [['', 'other', 'third'], ['__proto__', 'constructor', 'toString']]) {
    let state = makeState(3, 7, {}, ids);
    for (let step = 1; state.phase.id !== 'done' && step <= 4000; step += 1) {
      const id = state.phase.id === 'reveal' ? state.order[0] : state.turn;
      const action = sample(state, id, step, 'normal');
      assert.ok(action !== null);
      assert.equal(core.game.inputSchema.safeParse(action).success, true);
      const next = core.reduce(deepFreeze(state), input(state, action, id, 1000 + step));
      assert.notEqual(next, state);
      assertJson(next);
      state = next;
    }
    assert.equal(state.phase.id, 'done');
    const result = checkResults(state, ids);
    assert.deepEqual(result.winnerIds, [state.winner]);
    assert.deepEqual(result.ranking.filter(entry => entry.rank === 1).map(entry => entry.playerId), [state.winner]);
  }
});
