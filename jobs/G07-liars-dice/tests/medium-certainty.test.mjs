import test from 'node:test';
import assert from 'node:assert/strict';
import { core, probabilityCore, clone } from './helpers.mjs';
import { transcript, replayTranscript, mediumAction, uncertainControls, nearCertainControl, privateInformationTrap } from '../scripts/medium-certainty.mjs';

test('Medium raises the sole positive alternative to an own-cup-guaranteed bid after 27 accepted actual-init inputs', () => {
  const state = replayTranscript();
  assert.equal(state.round, 8); assert.equal(transcript.events.length, 27);
  assert.deepEqual(state.cups.p0, [1, 1]); assert.deepEqual(state.diceCount, { p0: 2, p1: 1 });
  const alternatives = core.legalBids(state, 'p0').map(bid => ({ ...bid, odds: probabilityCore.bidProbability(state.cups.p0, 3, bid.quantity, bid.face, true) }));
  const positive = alternatives.filter(bid => bid.odds.atLeastNumerator !== '0');
  assert.deepEqual(positive.map(({ quantity, face }) => ({ quantity, face })), [{ quantity: 3, face: 1 }]);
  assert.equal(positive[0].odds.atLeastNumerator, '1'); assert.equal(positive[0].odds.total, '6');
  for (let face = 1; face <= 6; face++) {
    const counterfactual = { ...clone(state), cups: { ...clone(state.cups), p1: [face] } };
    const odds = core.controllerView(counterfactual, 'p0').odds;
    assert.equal(odds.atLeastNumerator, odds.total);
    assert.notEqual(odds.exactNumerator, odds.total, 'At-least certainty differs from exact-count certainty');
    const action = mediumAction(counterfactual);
    assert.deepEqual(action, transcript.expectedMediumAction);
    assert.deepEqual(mediumAction(privateInformationTrap(counterfactual)), action);
    const raised = core.reduce(counterfactual, { type: 'input', now: 2000, playerId: 'p0', input: action });
    assert.equal(raised.phase.id, 'bid'); assert.equal(raised.turn, 'p1');
  }
});

test('Medium keeps its uncertain dudo behavior for every other two-die cup in the same public information set', () => {
  const controls = uncertainControls(replayTranscript());
  assert.equal(controls.length, 35);
  for (const control of controls) {
    const odds = core.controllerView(control, 'p0').odds;
    assert.notEqual(odds.atLeastNumerator, odds.total);
    assert.deepEqual(mediumAction(control), { type: 'dudo' });
  }
});

test('a supported near-certain bid remains uncertain by exact integer counts and keeps the prior legal raise', () => {
  const control = nearCertainControl();
  const odds = core.controllerView(control, 'p0').odds;
  assert.notEqual(odds.atLeastNumerator, odds.total);
  assert.ok(odds.atLeast > .999999 && odds.atLeast < 1);
  assert.deepEqual(mediumAction(control), { type: 'bid', quantity: 7, face: 2 });
});
