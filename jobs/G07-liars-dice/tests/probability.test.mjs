import test from 'node:test';
import assert from 'node:assert/strict';
import { probabilityCore, core, writeEvidence } from './helpers.mjs';
import { referenceProbability, referenceBidProbability } from './probability-reference.mjs';

test('exact probability matches independent outcome-convolution oracle over its complete boundary domain and 10,000 random conditional cases', () => {
  const rng = core.createRng(0x70d1ce);
  let boundaryCases = 0;
  const referenceCache = new Map();
  for (let n = 0; n <= 40; n += 1) for (const matching of [1, 2]) for (let needed = -5; needed <= 45; needed += 1) {
    const expected = referenceProbability(n, needed, matching);
    assert.deepEqual(probabilityCore.probability(n, needed, matching), expected, `n=${n} k=${needed} faces=${matching}`);
    referenceCache.set(`${n}/${needed}/${matching}`, expected);
    boundaryCases += 1;
  }
  for (let i = 0; i < 10000; i += 1) {
    const n = rng.int(0, 40), needed = rng.int(-5, 45), matching = rng.int(1, 2);
    assert.deepEqual(probabilityCore.probability(n, needed, matching), referenceCache.get(`${n}/${needed}/${matching}`));
    const own = Array.from({ length: rng.int(0, 5) }, () => rng.int(1, 6));
    const total = rng.int(own.length, 40), quantity = rng.int(-5, 45), face = rng.int(1, 6), wild = rng.chance(0.5);
    const before = JSON.stringify(own);
    assert.deepEqual(probabilityCore.bidProbability(own, total, quantity, face, wild), referenceBidProbability(own, total, quantity, face, wild), `conditional case ${i}`);
    assert.equal(JSON.stringify(own), before);
  }
  writeEvidence('probability.json', { result: 'PASS', oracle: 'Independent labelled-outcome polynomial convolution; oracle self-check runs separately', boundaryCases, randomUnconditionalCases: 10000, randomConditionalCases: 10000, seed: 0x70d1ce });
});

test('probability handles certainty, impossible bids, ones, raw exact mass and invalid arguments', () => {
  assert.deepEqual(probabilityCore.probability(0, 0, 1), { atLeastNumerator: '1', exactNumerator: '1', total: '1', atLeast: 1, exact: 1 });
  assert.equal(probabilityCore.probability(3, -1, 2).atLeast, 1);
  assert.equal(probabilityCore.probability(3, 4, 2).atLeast, 0);
  assert.equal(probabilityCore.probability(40, 40, 2).exactNumerator, '1099511627776');
  assert.equal(probabilityCore.probability(40, 40, 1).total, '13367494538843734067838845976576');
  assert.equal(probabilityCore.bidProbability([1, 2, 2], 5, 4, 2, true).atLeastNumerator, '20');
  assert.equal(probabilityCore.bidProbability([1, 2, 2], 5, 4, 2, false).atLeastNumerator, '1');
  assert.equal(probabilityCore.bidProbability([1, 2, 2], 5, 2, 1, true).atLeastNumerator, '11');
  for (const args of [[-1, 1, 1], [41, 1, 1], [1.5, 1, 1], [1, NaN, 1], [1, Infinity, 1], [1, 1, 0], [1, 1, 3]]) assert.throws(() => probabilityCore.probability(...args));
  for (const args of [[[0], 1, 1, 1, false], [[7], 1, 1, 1, false], [[1], 0, 1, 1, false], [[], 41, 1, 1, false], [[], 1, 1, 0, false], [[], 1, 1, 7, false], [[], 1, 1, 1, 'true'], [[], 1.5, 1, 1, false], [[], 1, 1.5, 1, false]]) assert.throws(() => probabilityCore.bidProbability(...args));
});
