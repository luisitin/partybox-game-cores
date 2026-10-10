import test from 'node:test';
import assert from 'node:assert/strict';
import { core, probabilityCore, makeState, input, clone, deepFreeze, skills, sample, assertJson, checkResults } from './helpers.mjs';

function table({ counts = [3, 3, 3], cups = [[2, 3, 4], [2, 5, 6], [3, 4, 6]], settings = {}, bid = { quantity: 3, face: 2, playerId: 'p0' }, turn = 'p1' } = {}) {
  const state = makeState(counts.length, 71, settings);
  state.turn = turn;
  state.bid = bid;
  state.bidLog = bid ? [bid] : [];
  counts.forEach((count, i) => { state.diceCount[`p${i}`] = count; state.cups[`p${i}`] = cups[i]; });
  return state;
}
const revealContinue = (state) => core.reduce(state, input(state, { type: 'continue' }, state.order.find((id) => state.players[id].connected && !state.left.includes(id))));

test('initial rolls, defaults, finite deadlines and starting seats are deterministic', () => {
  const a = makeState(8, 14), b = makeState(8, 14);
  assert.deepEqual(a, b);
  assert.equal(a.phase.id, 'bid');
  assert.equal(a.phase.deadline, null);
  assert.equal(a.bid, null);
  assert.equal(a.round, 1);
  assert.equal(a.settings.onesWild, true);
  assert.equal(a.settings.palificoEnabled, true);
  assert.equal(a.settings.calzaEnabled, false);
  assert.equal(a.settings.turnSeconds, 0);
  assert.ok(a.order.includes(a.turn));
  assert.ok(a.rng.step >= 41);
  for (const id of a.order) {
    assert.equal(a.diceCount[id], 5);
    assert.equal(a.cups[id].length, 5);
    assert.ok(a.cups[id].every((die) => Number.isInteger(die) && die >= 1 && die <= 6));
  }
  const timed = makeState(2, 4, { turnSeconds: 9 });
  assert.equal(timed.phase.deadline, timed.phase.startedAt + 9000);
  assertJson(a);
});

test('only the current connected active seat bids; bids must raise and preserve the old state', () => {
  const state = table({ bid: null });
  const before = JSON.stringify(state);
  const next = core.reduce(deepFreeze(state), deepFreeze(input(state, { type: 'bid', quantity: 2, face: 3 })));
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(next.bid, { quantity: 2, face: 3, playerId: 'p1' });
  assert.equal(next.turn, 'p2');
  assert.equal(next.bidLog.length, 1);
  assert.equal(core.reduce(next, input(next, { type: 'bid', quantity: 2, face: 2 })), next);
  assert.equal(core.reduce(next, input(next, { type: 'bid', quantity: 2, face: 3 })), next);
  assert.equal(core.reduce(next, input(next, { type: 'bid', quantity: 3, face: 6 }, 'p0')), next);
  const raised = core.reduce(next, input(next, { type: 'bid', quantity: 2, face: 4 }));
  assert.equal(raised.bid.face, 4);
  assert.equal(raised.turn, 'p0');
  assert.equal(raised.bidLog.length, 2);
  for (const bad of [{ type: 'bid', quantity: 0, face: 1 }, { type: 'bid', quantity: 2.5, face: 2 }, { type: 'bid', quantity: 1, face: 7 }, { type: 'bid', quantity: NaN, face: 2 }]) assert.equal(core.reduce(next, input(next, bad)), next);
});

test('impossible bluff quantities remain finite and a bot can challenge them without an unbounded legal-bid list', () => {
  const state = table({ bid: null });
  const huge = core.reduce(state, input(state, { type: 'bid', quantity: 1000000, face: 6 }));
  assert.equal(huge.bid.quantity, 1000000);
  assert.equal(core.controllerView(huge, huge.turn).odds.atLeast, 0);
  assert.ok(core.legalBids(huge, huge.turn).length <= 24);
  for (const skill of skills) assert.deepEqual(sample(huge, huge.turn, 4, skill), { type: 'dudo' });
  const revealed = core.reduce(huge, input(huge, { type: 'dudo' }));
  assert.equal(revealed.reveal.correct, true);
  assert.equal(revealed.reveal.loser, state.turn);
  assertJson(huge);
});

test('dudo counts wild ones and assigns exactly one die loss to the right participant', () => {
  const truthful = table({ cups: [[1, 2, 4], [2, 5, 6], [3, 4, 6]] });
  const revealed = core.reduce(truthful, input(truthful, { type: 'dudo' }));
  assert.equal(revealed.phase.id, 'reveal');
  assert.equal(revealed.reveal.matches, 3);
  assert.equal(revealed.reveal.correct, false);
  assert.equal(revealed.reveal.loser, 'p1');
  assert.equal(revealed.diceCount.p1, 2);
  assert.equal(revealed.diceCount.p0, 3);
  assert.deepEqual(revealed.reveal.dice, truthful.cups);
  assert.equal(revealed.nextStarter, 'p1');
  assert.equal(revealed.phase.deadline, null);
  const falseBid = table();
  const dudo = core.reduce(falseBid, input(falseBid, { type: 'dudo' }));
  assert.equal(dudo.reveal.matches, 2);
  assert.equal(dudo.reveal.correct, true);
  assert.equal(dudo.reveal.loser, 'p0');
  assert.equal(dudo.diceCount.p0, 2);
  assert.equal(dudo.nextStarter, 'p0');
  const literalOnes = table({ bid: { quantity: 2, face: 1, playerId: 'p0' }, cups: [[1, 2, 4], [2, 5, 6], [3, 4, 6]] });
  assert.equal(core.reduce(literalOnes, input(literalOnes, { type: 'dudo' })).reveal.matches, 1);
  const nonWild = table({ settings: { onesWild: false }, cups: [[1, 2, 4], [2, 5, 6], [3, 4, 6]] });
  assert.equal(core.reduce(nonWild, input(nonWild, { type: 'dudo' })).reveal.matches, 2);
  assert.equal(core.reduce(table({ bid: null }), input(table({ bid: null }), { type: 'dudo' })).phase.id, 'bid');
});

test('reveal continuation rerolls the public new counts, clears the bid, and advances the round', () => {
  const state = table();
  const revealed = core.reduce(state, input(state, { type: 'dudo' }));
  const next = revealContinue(revealed);
  assert.equal(next.phase.id, 'bid');
  assert.equal(next.round, state.round + 1);
  assert.equal(next.turn, 'p0');
  assert.equal(next.bid, null);
  assert.deepEqual(next.bidLog, []);
  assert.equal(next.reveal, null);
  assert.ok(next.rng.step > revealed.rng.step);
  for (const id of next.order) assert.equal(next.cups[id].length, next.diceCount[id]);
  assert.equal(core.reduce(revealed, input(revealed, { type: 'bid', quantity: 1, face: 2 })), revealed);
});

test('elimination removes a seat from turn rotation, clockwise survivor starts, and all original players stay in results', () => {
  const state = table({ counts: [1, 2, 2], cups: [[3], [3, 4], [5, 6]], bid: { quantity: 1, face: 2, playerId: 'p0' } });
  const revealed = core.reduce(state, input(state, { type: 'dudo' }));
  assert.equal(revealed.diceCount.p0, 0);
  assert.deepEqual(revealed.eliminated, ['p0']);
  assert.equal(revealed.nextStarter, 'p1');
  const next = revealContinue(revealed);
  assert.equal(next.turn, 'p1');
  assert.deepEqual(next.cups.p0, []);
  assert.equal(sample(next, 'p0', 7), null);
  const ended = core.reduce(next, { type: 'vip', now: 2000, action: 'end' });
  assert.equal(ended.phase.id, 'done');
  checkResults(ended);
  const duel = table({ counts: [1, 1], cups: [[3], [4]], bid: { quantity: 1, face: 2, playerId: 'p0' } });
  const lastReveal = core.reduce(duel, input(duel, { type: 'dudo' }));
  const done = lastReveal.phase.id === 'done' ? lastReveal : revealContinue(lastReveal);
  assert.equal(done.phase.id, 'done');
  assert.equal(done.winner, 'p1');
  assert.deepEqual(checkResults(done).winnerIds, ['p1']);
});

test('first one-die loss triggers one palifico round, locks face, disables wild ones, and never repeats for that starter', () => {
  const state = table({ counts: [2, 3, 3], cups: [[3, 4], [3, 4, 5], [4, 5, 6]], bid: { quantity: 1, face: 2, playerId: 'p0' } });
  const revealed = core.reduce(state, input(state, { type: 'dudo' }));
  assert.equal(revealed.diceCount.p0, 1);
  assert.equal(revealed.nextPalifico, 'p0');
  let next = revealContinue(revealed);
  assert.equal(next.palifico, true);
  assert.equal(next.palificoStarter, 'p0');
  assert.equal(next.seenPalifico.p0, true);
  assert.equal(core.effectiveWild(next), false);
  assert.equal(core.canChangePalificoFace(next, 'p1'), false);
  next = core.reduce(next, input(next, { type: 'bid', quantity: 1, face: 3 }));
  assert.equal(core.reduce(next, input(next, { type: 'bid', quantity: 2, face: 4 })), next);
  assert.ok(core.legalBids(next, next.turn).every((bid) => bid.face === 3 && bid.quantity > 1));
  const noRepeat = table({ counts: [2, 3, 3], cups: [[3, 4], [3, 4, 5], [4, 5, 6]], bid: { quantity: 1, face: 2, playerId: 'p0' } });
  noRepeat.seenPalifico.p0 = true;
  assert.equal(core.reduce(noRepeat, input(noRepeat, { type: 'dudo' })).nextPalifico, null);
  const disabled = clone(state); disabled.settings.palificoEnabled = false;
  assert.equal(core.reduce(disabled, input(disabled, { type: 'dudo' })).nextPalifico, null);
  const oneDie = clone(next); oneDie.settings.palificoExemption = 'oneDie'; oneDie.diceCount.p1 = 1; oneDie.seenPalifico.p1 = true;
  assert.equal(core.canChangePalificoFace(oneDie, 'p1'), true);
  const experienced = clone(next); experienced.settings.palificoExemption = 'experienced'; experienced.seenPalifico.p1 = true;
  assert.equal(core.canChangePalificoFace(experienced, 'p1'), true);
});

test('calza exact success gains one capped die; failure loses one; policy and two-player restrictions bind', () => {
  const exact = table({ settings: { calzaEnabled: true }, bid: { quantity: 2, face: 2, playerId: 'p0' } });
  assert.equal(core.canCalza(exact, 'p1'), true);
  assert.equal(core.canCalza(exact, 'p0'), false);
  let revealed = core.reduce(exact, input(exact, { type: 'calza' }));
  assert.equal(revealed.reveal.kind, 'calza');
  assert.equal(revealed.reveal.correct, true);
  assert.equal(revealed.reveal.gained, true);
  assert.equal(revealed.reveal.loser, null);
  assert.equal(revealed.diceCount.p1, 4);
  assert.equal(revealed.nextStarter, 'p1');
  const capped = table({ settings: { calzaEnabled: true }, counts: [3, 5, 3], cups: [[2, 3, 4], [2, 3, 4, 5, 6], [3, 4, 6]], bid: { quantity: 2, face: 2, playerId: 'p0' } });
  revealed = core.reduce(capped, input(capped, { type: 'calza' }));
  assert.equal(revealed.diceCount.p1, 5);
  assert.equal(revealed.reveal.gained, false);
  const wrong = table({ settings: { calzaEnabled: true } });
  revealed = core.reduce(wrong, input(wrong, { type: 'calza' }));
  assert.equal(revealed.reveal.correct, false);
  assert.equal(revealed.reveal.loser, 'p1');
  assert.equal(revealed.diceCount.p1, 2);
  const policy = clone(exact); policy.settings.calzaPolicy = 'interruptOnly';
  assert.equal(core.canCalza(policy, 'p1'), false);
  assert.equal(core.canCalza(policy, 'p2'), true);
  const palifico = clone(exact); palifico.palifico = true;
  assert.equal(core.canCalza(palifico, 'p1'), false);
  const duel = table({ counts: [3, 3], cups: [[2, 3, 4], [2, 5, 6]], settings: { calzaEnabled: true } });
  assert.equal(core.canCalza(duel, 'p1'), false);
  const disabled = clone(exact); disabled.settings.calzaEnabled = false;
  assert.equal(core.canCalza(disabled, 'p1'), false);
  assert.equal(core.reduce(disabled, input(disabled, { type: 'calza' })), disabled);
});

test('controller odds are exact raw conditional probabilities; model learning uses revealed public truth', () => {
  const state = table();
  const cv = core.controllerView(state, 'p1');
  assert.deepEqual(cv.odds, probabilityCore.bidProbability(state.cups.p1, 9, 3, 2, true));
  const revealed = core.reduce(state, input(state, { type: 'dudo' }));
  assert.ok(revealed.models.p0.false > state.models.p0.false, 'false bidder model not updated');
  const truthful = table({ bid: { quantity: 2, face: 2, playerId: 'p0' } });
  const good = core.reduce(truthful, input(truthful, { type: 'dudo' }));
  assert.ok(good.models.p0.truth > truthful.models.p0.truth, 'truthful bidder model not updated');
});

test('sharp bots can call an eligible out-of-turn calza; interrupted caller conditions on only its own cup', () => {
  const state = table({ counts: [1, 1, 1], cups: [[3], [4], [2]], settings: { onesWild: false, calzaEnabled: true, calzaPolicy: 'interruptOnly' }, bid: { quantity: 1, face: 2, playerId: 'p0' } });
  assert.equal(core.canCalza(state, 'p2'), true);
  assert.equal(core.canCalza(state, 'p1'), false);
  assert.equal(probabilityCore.bidProbability(state.cups.p2, 3, 1, 2, false).exactNumerator, '25');
  const action = sample(state, 'p2', 9, 'sharp');
  assert.deepEqual(action, { type: 'calza' });
  const alternative = clone(state); alternative.cups.p0 = [2]; alternative.cups.p1 = [2];
  assert.deepEqual(sample(alternative, 'p2', 9, 'sharp'), action);
  assert.notDeepEqual(core.reduce(state, input(state, action, 'p2')), state);
});

test('all skills are deterministic and ignore counterfactual unseen cups, hidden PRNG and future starter', () => {
  const state = table();
  const counterfactual = clone(state);
  counterfactual.cups.p0 = [6, 6, 6];
  counterfactual.cups.p2 = [1, 1, 1];
  counterfactual.rng = { seed: 999, step: 9999 };
  counterfactual.nextStarter = 'p2';
  for (const skill of skills) for (let seed = 1; seed <= 40; seed += 1) {
    const action = sample(deepFreeze(state), 'p1', seed, skill);
    assert.deepEqual(action, sample(state, 'p1', seed, skill));
    assert.deepEqual(action, sample(counterfactual, 'p1', seed, skill), `bot read hidden information: ${skill} seed=${seed}`);
    assert.ok(core.game.inputSchema.safeParse(action).success);
  }
});

test('sharp decisions adapt to publicly learned truthful and bluffing histories', () => {
  const state = table({ counts: [2, 3], cups: [[4, 5], [6, 2, 3]], bid: { quantity: 1, face: 1, playerId: 'p0' } });
  state.bidLog = [{ quantity: 1, face: 2, playerId: 'p0' }, { quantity: 1, face: 3, playerId: 'p1' }, state.bid];
  const trusted = clone(state); trusted.models.p0 = { truth: 103, false: 2 };
  const bluffing = clone(state); bluffing.models.p0 = { truth: 3, false: 102 };
  const trustAction = sample(trusted, 'p1', 6789, 'sharp');
  const bluffAction = sample(bluffing, 'p1', 6789, 'sharp');
  assert.equal(trustAction.type, 'bid');
  assert.deepEqual(bluffAction, { type: 'dudo' });
  assert.notDeepEqual(trustAction, bluffAction);
  assert.ok(core.game.inputSchema.safeParse(trustAction).success);
});
