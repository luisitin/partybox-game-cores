import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateLevel, seedRng, templateLevel, referenceOptimum, solveExact, certify } from './helpers.mjs';
test('all 240 calibrated templates independently prove optimum and monotone edition-specific solve rates', () => {
  const data = JSON.parse(readFileSync('data/calibration.json', 'utf8'));
  for (const [edition, tiers] of [['normal', data.tiers], ['mirrored', data.flip]]) {
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i]; if (i) assert.ok(tiers[i - 1].solveRate >= tier.solveRate);
      assert.equal(tier.templates.length, 12); assert.equal(tier.trials, 2000);
      for (const template of tier.templates) {
        const level = templateLevel(template, tier.difficulty, edition === 'mirrored');
        const witness = template.anchors.map(([x, y], index) => ({ crateId: `crate-${index + 1}`, x, y, rotation: 0 }));
        assert.equal(certify(level, witness), 200); assert.equal(referenceOptimum(level), 200); assert.equal(solveExact(level).value, 200);
      }
    }
  }
});
test('200 seeds expose all twelve distinct holds at every difficulty in both editions', () => {
  for (const flip of [false, true]) for (let difficulty = 1; difficulty <= 10; difficulty++) {
    const holds = new Set();
    for (let seed = 0; seed < 200; seed++) {
      const generated = generateLevel(seedRng(seed), difficulty, flip);
      holds.add(JSON.stringify(generated.level.cells)); assert.equal(generated.optimum, 200);
    }
    assert.equal(holds.size, 12, `difficulty ${difficulty}, mirrors ${flip}`);
  }
});
