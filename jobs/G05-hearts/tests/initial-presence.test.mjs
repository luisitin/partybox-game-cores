import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { game, players, stateSchema, createRng, propertySeeds, rules } from './helpers.mjs';

function context(count, mask, settings, seed = 1, now = 1000) {
  return { players: players(count).map((p, i) => ({ ...p, bot: false, connected: Boolean(mask & (1 << i)) })), settings, seed, now };
}

// Independent public-policy oracle: deal to present seats, attach the supplied
// presence, and exercise the existing ordinary disconnect event. This does not
// call init with missing seats or duplicate its new startup implementation.
function ordinaryDrop(ctx) {
  const present = game.init({ ...ctx, players: ctx.players.map(p => ({ ...p, connected: true })) });
  const state = { ...present, players: Object.fromEntries(ctx.players.map(p => [p.id, { ...present.players[p.id], connected: p.connected }])) };
  return ctx.players.some(p => p.connected) && !state.players[state.actor].connected
    ? game.reduce(state, { type: 'player', playerId: state.actor, connected: false, now: ctx.now })
    : state;
}

function configurations() {
  const out = [];
  for (const noPass of [false, true]) for (const moon of ['add', 'subtract'])
    for (const jack of [false, true]) for (const queenBreaks of [false, true])
      for (const threeDeck of ['diamonds', 'clubs']) for (const turnSeconds of [0, 1, 60])
        out.push({ target: 25, noPass, moon, jack, queenBreaks, threeDeck, turnSeconds });
  return out;
}

function validStart(state) {
  assert.ok(stateSchema.safeParse(state).success);
  const cards = [...Object.values(state.hands).flat(), ...state.played.map(p => p.card)].sort((a, b) => a - b);
  assert.deepEqual(cards, rules.deckFor(state.order.length, state.settings.threeDeck));
  assert.equal(new Set(cards).size, cards.length);
  assert.ok(Buffer.byteLength(JSON.stringify(state)) < 256 * 1024);
  if (state.order.some(id => state.players[id].connected)) {
    assert.ok(state.players[state.actor].connected, 'a nonempty startup reaches a connected actor');
    assert.ok(state.phase.id === 'pass' || state.phase.id === 'play');
    const view = game.controllerView(state, state.actor);
    assert.ok(state.phase.id === 'pass' ? view.canPass : view.legal.length > 0);
  }
}

test('disconnected opening seat starts an untimed no-pass table with the existing legal takeover', () => {
  const ctx = context(4, 0b0111, { noPass: true, turnSeconds: 0 });
  const before = JSON.stringify(ctx);
  const state = game.init(ctx);
  assert.equal(state.actor, 'p0');
  assert.deepEqual(state.trick, [{ playerId: 'p3', card: 0 }]);
  assert.equal(state.phase.deadline, null);
  assert.equal(state.players.p3.connected, false);
  assert.deepEqual(state.order, ['p0', 'p1', 'p2', 'p3']);
  assert.deepEqual(state, ordinaryDrop(ctx));
  assert.equal(JSON.stringify(ctx), before);
  validStart(state);
});

test('every 3–6-seat presence mask and declared initial setting follows ordinary departure policy', () => {
  let cases = 0, changed = 0, empty = 0;
  const transcript = createHash('sha256');
  for (const count of [3, 4, 5, 6]) for (let mask = 0; mask < 2 ** count; mask++)
    for (const settings of configurations()) for (const now of [0, 1000, 1e12]) {
      const ctx = context(count, mask, settings, 17 + cases, now);
      const before = JSON.stringify(ctx);
      const state = game.init(ctx), expected = ordinaryDrop(ctx);
      assert.deepEqual(state, expected);
      assert.equal(JSON.stringify(ctx), before);
      validStart(state);
      if (!mask) empty++;
      if (state.played.length || Object.keys(state.passes).length) changed++;
      transcript.update(JSON.stringify({ ctx, state }) + '\n');
      cases++;
    }
  assert.equal(cases, 34560);
  console.log(JSON.stringify({ initialPresenceCases: cases, configurationsPerMask: 96, nowProfiles: 3, emptyRoomCases: empty, appliedTakeovers: changed, transcriptSha256: transcript.digest('hex') }));
});

test('fully connected starts retain every supported target, clock and rule configuration', () => {
  let cases = 0;
  for (const count of [3, 4, 5, 6]) for (const settings of configurations())
    for (const target of [25, 50, 75, 100, 125, 150, 175, 200]) for (const now of [0, 1000, 1e12]) {
      const ctx = context(count, 2 ** count - 1, { ...settings, target }, 40000 + cases, now);
      const state = game.init(ctx);
      assert.deepEqual(state, ordinaryDrop(ctx));
      assert.equal(state.played.length, 0);
      assert.equal(Object.keys(state.passes).length, 0);
      assert.equal(state.settings.target, target);
      assert.equal(state.phase.deadline, settings.turnSeconds ? state.phase.startedAt + settings.turnSeconds * 1000 : null);
      cases++;
    }
  assert.equal(cases, 9216);
  console.log(JSON.stringify({ fullyConnectedTargetControls: cases }));
});

test('1003 seeded missing-seat starts preserve private views and all three bot information boundaries', () => {
  let starts = 0, viewChecks = 0, botChecks = 0;
  for (const seed of propertySeeds()) {
    const count = 3 + seed % 4, mask = 1 + seed % (2 ** count - 1);
    const ctx = context(count, mask, { noPass: Boolean(seed & 1), moon: seed & 2 ? 'subtract' : 'add', jack: Boolean(seed & 4), queenBreaks: Boolean(seed & 8), threeDeck: seed & 16 ? 'clubs' : 'diamonds', turnSeconds: [0, 1, 60][seed % 3] }, seed, seed & 32 ? 0 : 1e12);
    const state = game.init(ctx);
    assert.deepEqual(state, ordinaryDrop(ctx));
    validStart(state);
    for (const owner of state.order) {
      const altered = { ...state, hands: { ...state.hands, [owner]: [...state.hands[owner]].reverse() } };
      assert.deepEqual(game.tvView(altered), game.tvView(state));
      for (const viewer of [...state.order.filter(id => id !== owner), 'spectator', '__proto__']) {
        assert.deepEqual(game.controllerView(altered, viewer), game.controllerView(state, viewer));
        viewChecks++;
        for (const skill of ['easy', 'normal', 'sharp']) {
          assert.deepEqual(game.bot.sampleInput(altered, viewer, createRng(37), skill), game.bot.sampleInput(state, viewer, createRng(37), skill));
          botChecks++;
        }
      }
    }
    starts++;
  }
  assert.equal(starts, 1003);
  console.log(JSON.stringify({ seededMissingSeatStarts: starts, privateViewChecks: viewChecks, allSkillHiddenHandChecks: botChecks }));
});

test('one connected human completes whole matches without administrative skips after initial takeovers', () => {
  let games = 0, playerInputs = 0;
  for (const count of [3, 4, 5, 6]) for (let seat = 0; seat < count; seat++)
    for (const noPass of [false, true]) for (const moon of ['add', 'subtract']) for (const jack of [false, true]) {
      const ctx = context(count, 1 << seat, { target: 25, noPass, moon, jack, turnSeconds: 0 }, 50000 + games);
      let state = game.init(ctx), steps = 0;
      const id = `p${seat}`;
      while (state.phase.id !== 'done' && steps++ < 30000) {
        const input = state.phase.id === 'trick' || state.phase.id === 'hand'
          ? { type: 'next' }
          : game.bot.sampleInput(state, id, createRng(steps), ['easy', 'normal', 'sharp'][steps % 3]);
        assert.ok(input && game.inputSchema.safeParse(input).success, 'the remaining human always has a legal input or Continue');
        const next = game.reduce(state, { type: 'input', playerId: id, input, now: state.phase.startedAt + 1 });
        assert.notEqual(next, state);
        state = next;
        playerInputs++;
      }
      assert.equal(state.phase.id, 'done');
      const result = game.results(state);
      assert.deepEqual(Object.keys(result.scores).sort(), ctx.players.map(p => p.id));
      assert.ok(Object.values(result.scores).every(Number.isFinite));
      assert.equal(state.order.length, count);
      assert.equal(state.players[id].connected, true);
      games++;
    }
  assert.equal(games, 144);
  console.log(JSON.stringify({ completeOneConnectedHumanMatches: games, realPlayerInputs: playerInputs, administrativeSkips: 0 }));
});

test('finishing missing-seat passes also drains the disconnected opening-card turns', () => {
  const ctx = context(3, 0b001, { target: 25, noPass: false, turnSeconds: 0 }, 50000);
  const initial = game.init(ctx);
  const input = game.bot.sampleInput(initial, 'p0', createRng(1), 'normal');
  const now = initial.phase.startedAt + 1;
  const after = game.reduce(initial, { type: 'input', playerId: 'p0', input, now });
  assert.equal(after.phase.id, 'play');
  assert.equal(after.actor, 'p0');
  assert.deepEqual(after.played.map(p => p.playerId), ['p1', 'p2']);
  assert.ok(game.controllerView(after, 'p0').legal.length > 0);

  // Independently perform the same legal passing and card actions as ordinary
  // player inputs at one supplied time, then restore the supplied presence.
  let manual = game.init({ ...ctx, players: ctx.players.map(p => ({ ...p, connected: true })) });
  manual = game.reduce(manual, { type: 'input', playerId: 'p0', input, now });
  for (const id of ['p1', 'p2']) manual = game.reduce(manual, { type: 'input', playerId: id, input: { type: 'pass', cards: manual.hands[id].slice(-3) }, now });
  for (const id of ['p1', 'p2']) {
    const legal = rules.legalCards(manual.hands[id], manual.trick, manual.trickNumber === 0, manual.heartsBroken, manual.opening);
    manual = game.reduce(manual, { type: 'input', playerId: id, input: { type: 'play', card: legal[0] }, now });
  }
  manual = { ...manual, players: Object.fromEntries(ctx.players.map(p => [p.id, { ...manual.players[p.id], connected: p.connected }])) };
  assert.deepEqual(after, manual);
});

test('empty-room persistence, stale events and paused reconnects retain existing behavior', () => {
  let cases = 0;
  for (const count of [3, 4, 5, 6]) for (const noPass of [false, true]) for (const turnSeconds of [0, 1, 60]) {
    const empty = game.init(context(count, 0, { noPass, turnSeconds }));
    assert.deepEqual(empty, ordinaryDrop(context(count, 0, { noPass, turnSeconds })));
    assert.equal(empty.played.length, 0);
    assert.equal(Object.keys(empty.passes).length, 0);
    assert.equal(game.reduce(empty, { type: 'timer', phaseId: empty.phase.id, startedAt: empty.phase.startedAt - 1, now: 1e12 }), empty);
    assert.equal(game.reduce(empty, { type: 'input', playerId: 'spectator', input: { type: 'next' }, now: 1002 }), empty);
    const paused = game.reduce(empty, { type: 'vip', action: 'pause', now: 2000 });
    const rejoined = game.reduce(paused, { type: 'player', playerId: `p${count - 1}`, connected: true, now: 3000 });
    assert.deepEqual(rejoined.played, []);
    assert.deepEqual(rejoined.passes, {});
    assert.deepEqual(rejoined.phase, paused.phase);
    const resumed = game.reduce(rejoined, { type: 'vip', action: 'resume', now: 4000 });
    assert.equal(resumed.phase.paused, undefined);
    validStart(resumed);
    const done = game.reduce(empty, { type: 'vip', action: 'end', now: 5000 });
    assert.equal(Object.keys(game.results(done).scores).length, count);
    cases++;
  }
  assert.equal(cases, 24);
  console.log(JSON.stringify({ emptyRoomAndPauseControls: cases }));
});
