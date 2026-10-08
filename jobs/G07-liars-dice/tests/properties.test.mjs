import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { core, makeState, input, skills, sample, checkReplayStep, clone, checkResults, writeEvidence } from './helpers.mjs';

test('properties: seeds 1, 2, 3 plus 1,000 fixed random seeds preserve dice, turns, conservation, secrecy and totality', () => {
  const seedSource = core.createRng(0x6707);
  const seeds = [1, 2, 3, ...Array.from({ length: 1000 }, () => seedSource.int(0, 0xffffffff))];
  const stats = { events: 0, maxStateBytes: 0, transcript: createHash('sha256') };
  for (const seed of seeds) {
    const rng = core.createRng(seed), count = rng.int(2, 8);
    const settings = { onesWild: rng.chance(0.5), palificoEnabled: rng.chance(0.75), palificoExemption: rng.pick(['none', 'oneDie', 'experienced']), calzaEnabled: rng.chance(0.5), calzaPolicy: rng.pick(['anyOther', 'interruptOnly']), turnSeconds: rng.pick([0, 5, 30]) };
    let state = makeState(count, seed, settings), twin = clone(state);
    for (let step = 0; step < 80 && state.phase.id !== 'done'; step += 1) {
      for (const id of state.order) {
        assert.ok(Number.isInteger(state.diceCount[id]) && state.diceCount[id] >= 0 && state.diceCount[id] <= 5);
        if (state.phase.id === 'bid') assert.equal(state.cups[id].length, state.diceCount[id]);
        assert.ok(state.cups[id].every((die) => Number.isInteger(die) && die >= 1 && die <= 6));
      }
      if (state.phase.id === 'bid') {
        assert.ok(state.order.includes(state.turn));
        assert.ok(state.diceCount[state.turn] > 0);
        assert.equal(core.effectiveWild(state), state.settings.onesWild && !state.palifico);
      }
      const old = state;
      let event;
      const choice = rng.int(0, 9);
      if (choice === 0) event = { type: 'speech', now: 1001 + step * 1000, key: 'unknown-reading', ms: -1 };
      else if (choice === 1) event = { type: 'timer', now: 1001 + step * 1000, phaseId: state.phase.id, startedAt: state.phase.startedAt - 1 };
      else if (choice === 2) event = input(state, { type: 'bid', quantity: rng.int(1, 40), face: rng.int(1, 6) }, '__proto__', 1001 + step * 1000);
      else if (choice === 3) event = { type: 'vip', now: 1001 + step * 1000, action: state.phase.paused ? 'resume' : 'pause' };
      else if (state.phase.paused) event = { type: 'vip', now: 1001 + step * 1000, action: 'resume' };
      else {
        const id = state.phase.id === 'reveal' ? state.order[0] : state.turn;
        const action = sample(state, id, seed ^ step, rng.pick(skills));
        assert.ok(action !== null && core.game.inputSchema.safeParse(action).success);
        event = input(state, action, id, 1001 + step * 1000);
      }
      [state, twin] = checkReplayStep(state, twin, event, stats);
      if (event.type === 'input' && event.playerId !== '__proto__' && old.phase.id === 'bid' && state.phase.id === 'reveal') {
        const before = Object.values(old.diceCount).reduce((n, x) => n + x, 0), after = Object.values(state.diceCount).reduce((n, x) => n + x, 0);
        const expectedDelta = state.reveal.gained ? 1 : state.reveal.loser === null ? 0 : -1;
        assert.equal(after - before, expectedDelta);
      }
      for (const secret of ['cups', 'rng', 'models']) assert.ok(!Object.hasOwn(core.tvView(state), secret));
    }
    if (state.phase.id !== 'done') [state, twin] = checkReplayStep(state, twin, { type: 'vip', now: 100000, action: 'end' }, stats);
    checkResults(state);
  }
  writeEvidence('properties.json', { result: 'PASS', explicitSeeds: [1, 2, 3], randomSeeds: 1000, randomSeedGenerator: 0x6707, events: stats.events, maxStateBytes: stats.maxStateBytes, everyEventReplaySha256: stats.transcript.digest('hex') });
});
