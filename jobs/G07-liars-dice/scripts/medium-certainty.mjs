import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { core, probabilityCore, context, root, clone } from '../tests/helpers.mjs';

export const transcript = JSON.parse(readFileSync(resolve(root, 'evidence/checks/round-2-medium-transcript.json')));
export function replayTranscript(implementation = core) {
  let state = implementation.init(transcript.context);
  for (const event of transcript.events) {
    const previous = state;
    state = implementation.reduce(state, clone(event));
    assert.notEqual(state, previous, `Rejected transcript event: ${JSON.stringify(event)}`);
  }
  assert.deepEqual(state, transcript.expectedState);
  return state;
}
export function mediumAction(state, implementation = core, seed = transcript.externalBotRngSeed) {
  return implementation.sampleInput(state, 'p0', implementation.createRng(seed), 'normal');
}
export function uncertainControls(state) {
  const controls = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a !== 1 || b !== 1) {
    controls.push({ ...clone(state), cups: { ...clone(state.cups), p0: [a, b] } });
  }
  return controls;
}
export function nearCertainControl(implementation = core) {
  const state = implementation.init(context(8, 71));
  state.cups.p0 = [2, 2, 2, 2, 2];
  state.turn = 'p0';
  state.bid = { quantity: 6, face: 2, playerId: 'p7' };
  state.bidLog = [state.bid];
  return state;
}
export function privateInformationTrap(state) {
  return {
    ...state,
    cups: new Proxy(state.cups, { get(target, key) {
      assert.equal(key, 'p0', 'Bot read another private cup');
      return target.p0;
    } }),
    rng: new Proxy({}, { get() { throw new Error('Bot read game RNG'); } }),
    nextStarter: 'p1', nextPalifico: 'p1',
  };
}

async function baselineCore() {
  // The override allows measurement against the already archived old bundle
  // while browser timing is isolated. Default reproduction builds the old
  // committed source into ignored .work, without production test hooks.
  if (process.env.G07_MEDIUM_BASELINE_CORE) {
    const path = resolve(process.env.G07_MEDIUM_BASELINE_CORE);
    const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
    assert.equal(hash, transcript.provenance.beforeCoreSha256);
    return import(pathToFileURL(path).href);
  }
  const source = execFileSync('git', ['show', `${transcript.provenance.beforeRevision}:jobs/G07-liars-dice/src/core.ts`], { encoding: 'utf8', cwd: root });
  assert.equal(createHash('sha256').update(source).digest('hex'), transcript.provenance.beforeSourceSha256);
  const outfile = resolve(root, '.work/round-2-medium-baseline.mjs');
  mkdirSync(resolve(root, '.work'), { recursive: true });
  await build({ stdin: { contents: source, resolveDir: resolve(root, 'src'), sourcefile: 'core.ts', loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', target: 'es2022', outfile, alias: { zod: resolve(root, 'node_modules/zod') } });
  return import(pathToFileURL(outfile).href);
}
export async function measureCertaintyCorrection(before) {
  const state = replayTranscript();
  assert.deepEqual(replayTranscript(before), state);
  const alternatives = core.legalBids(state, 'p0').map(bid => ({ ...bid, odds: probabilityCore.bidProbability(state.cups.p0, 3, bid.quantity, bid.face, true) }));
  assert.deepEqual(alternatives.filter(bid => bid.odds.atLeastNumerator !== '0').map(({ quantity, face }) => ({ quantity, face })), [{ quantity: 3, face: 1 }]);
  const cases = [];
  for (let hiddenFace = 1; hiddenFace <= 6; hiddenFace++) {
    const counterfactual = { ...clone(state), cups: { ...clone(state.cups), p1: [hiddenFace] } };
    const odds = core.controllerView(counterfactual, 'p0').odds;
    assert.equal(odds.atLeastNumerator, odds.total);
    const oldAction = mediumAction(counterfactual, before), newAction = mediumAction(counterfactual);
    assert.deepEqual(oldAction, { type: 'dudo' });
    assert.deepEqual(newAction, transcript.expectedMediumAction);
    assert.deepEqual(mediumAction(privateInformationTrap(counterfactual)), newAction);
    const oldReveal = before.reduce(counterfactual, { type: 'input', now: 2000, playerId: 'p0', input: oldAction });
    assert.equal(oldReveal.reveal.loser, 'p0');
    const raised = core.reduce(counterfactual, { type: 'input', now: 2000, playerId: 'p0', input: newAction });
    assert.equal(raised.phase.id, 'bid'); assert.equal(raised.turn, 'p1');
    const newReveal = core.reduce(raised, { type: 'input', now: 2001, playerId: 'p1', input: { type: 'dudo' } });
    cases.push({ hiddenFace, currentBidOdds: odds, beforeAction: oldAction, afterAction: newAction, beforeHeroLostDie: oldReveal.diceCount.p0 === 1, afterHeroLostDieIfRaiseChallenged: newReveal.diceCount.p0 === 1, afterWinnerIfRaiseChallenged: newReveal.winner });
    for (const skill of ['easy', 'sharp']) assert.deepEqual(core.sampleInput(counterfactual, 'p0', core.createRng(6789), skill), before.sampleInput(counterfactual, 'p0', before.createRng(6789), skill));
  }
  const uncertain = uncertainControls(state).map(control => {
    const odds = core.controllerView(control, 'p0').odds;
    assert.notEqual(odds.atLeastNumerator, odds.total);
    const oldAction = mediumAction(control, before), newAction = mediumAction(control);
    assert.deepEqual(newAction, oldAction); assert.deepEqual(newAction, { type: 'dudo' });
    return { ownDice: control.cups.p0, odds, beforeAction: oldAction, afterAction: newAction };
  });
  const near = nearCertainControl();
  const nearOdds = core.controllerView(near, 'p0').odds;
  assert.notEqual(nearOdds.atLeastNumerator, nearOdds.total); assert.ok(nearOdds.atLeast > .999999 && nearOdds.atLeast < 1);
  const nearBefore = mediumAction(near, before), nearAfter = mediumAction(near);
  assert.deepEqual(nearAfter, nearBefore);
  return {
    suite: 'round-2-medium-certainty', beforeRevision: transcript.provenance.beforeRevision,
    beforeCoreSha256: transcript.provenance.beforeCoreSha256,
    afterCoreSha256: createHash('sha256').update(readFileSync(resolve(root, 'dist/core.mjs'))).digest('hex'),
    afterSourceSha256: createHash('sha256').update(readFileSync(resolve(root, 'src/core.ts'))).digest('hex'),
    transcript: { seed: transcript.context.seed, acceptedEvents: transcript.events.length, round: state.round, diceCount: state.diceCount, ownDice: state.cups.p0, bid: state.bid, externalBotRngSeed: transcript.externalBotRngSeed },
    alternatives, cases, uncertainControls: uncertain,
    nearCertainty: { description: 'Eight seats with five dice each; own five twos, opposing six-twos bid. A supported near-certain case, with no production hooks.', odds: nearOdds, beforeAction: nearBefore, afterAction: nearAfter },
    measuredBenefit: { beforeHeroDieLossesOnSelectedInput: cases.filter(c => c.beforeHeroLostDie).length, afterHeroDieLossesOnSelectedInput: 0, afterLegalRaisesAccepted: cases.length, afterHeroDieLossesIfRaisesImmediatelyChallenged: cases.filter(c => c.afterHeroLostDieIfRaiseChallenged).length, afterHeroKeepsDiceIfRaisesImmediatelyChallenged: cases.filter(c => !c.afterHeroLostDieIfRaiseChallenged).length, compatibleHiddenCases: cases.length, solePositiveRaiseRawProbability: '1/6' },
    unchangedPolicies: ['Easy', 'Strong'], privacy: 'Opposing-cup and game-RNG read traps pass in all six cases',
    limits: 'The six after-action zero losses refer only to accepting the bid input; they do not certify eventual survival. Standardized opposing dudo loses the hero a die in five of six hidden cases and preserves both dice in one. Exhaustive immediate decision comparison in this information set; not a new league estimate. Existing uncertain thresholds and support likelihood are unchanged. Default baseline reproduction requires the old commit object; tests need only the published transcript.',
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await measureCertaintyCorrection(await baselineCore());
  writeFileSync(resolve(root, 'evidence/checks/round-2-medium-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ suite: report.suite, measuredBenefit: report.measuredBenefit, uncertainControls: report.uncertainControls.length, nearCertainty: report.nearCertainty, privacy: report.privacy }));
}
