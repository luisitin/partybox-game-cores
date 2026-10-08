import test from 'node:test';
import assert from 'node:assert/strict';
import { solveExact, referenceOptimum, evaluateLayout, createRng } from './helpers.mjs';
test('10,000 independent weighted-packing differential cases', () => {
  const rng = createRng(0x103d1ff);
  const shapes = [[[0, 0]], [[0, 0], [1, 0]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [0, 1], [1, 1]]];
  for (let trial = 0; trial < 10_000; trial++) {
    const width = rng.int(1, 3); const height = rng.int(1, 3);
    const cells = Array.from({ length: width * height }, (_, i) => [i % width, Math.floor(i / width)]).filter(() => rng.chance(0.8));
    const puzzle = { width, height, cells, crates: Array.from({ length: rng.int(0, trial % 10 === 0 ? 4 : 3) }, (_, i) => ({ id: `p${i}`, value: rng.int(1, 50), cells: rng.pick(shapes) })), allowFlip: rng.chance(0.5), difficulty: 1 };
    const expected = referenceOptimum(puzzle); const actual = solveExact(puzzle); const packed = evaluateLayout(puzzle, actual.placements);
    assert.equal(actual.value, expected, `case ${trial}: ${JSON.stringify(puzzle)}`);
    assert.ok(packed.valid); assert.equal(packed.value, expected);
  }
});
