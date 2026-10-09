import test from 'node:test';
import assert from 'node:assert/strict';
import { createReferenceChinook } from './reference-chinook.mjs';
import { sparseBoard } from './reference-rule-cases.mjs';

// These are original synthetic wire-format records, not realistic game WDL.
// Their purpose is to test interpretation of ternary packing/default runs.
test('independent Chinook reader decodes high-to-low ternary digits', () => {
  const reader = createReferenceChinook(Uint8Array.of(140), 'BASE1100.00 =\nS0 0/0\nE5 0/1\n');
  for (const [opponent, ordinal, value] of [[29, 0, 'win'], [30, 1, 'loss'], [31, 2, 'draw'], [25, 4, 'loss']]) {
    const board = sparseBoard('american', { 28: 2, [opponent]: -2 });
    assert.equal(reader.locate(board, 1).ordinal, ordinal);
    assert.equal(reader.probe(board, 1), value);
  }
});

test('independent Chinook reader consumes default runs before ordinary records', () => {
  const reader = createReferenceChinook(Uint8Array.of(243, 85), 'BASE1100.00 =\nS0 0/0\nE15 0/2\n');
  assert.equal(reader.probe(sparseBoard('american', { 28: 2, 29: -2 }), 1), 'draw');
  const board = sparseBoard('american', { 28: 2, 23: -2 });
  assert.equal(reader.locate(board, 1).ordinal, 10);
  assert.equal(reader.probe(board, 1), 'win');
});

test('independent Chinook uniform records need no binary payload', () => {
  const reader = createReferenceChinook(new Uint8Array(), 'BASE1100.00 ==\n');
  assert.equal(reader.probe(sparseBoard('american', { 28: 2, 29: -2 }), 1), 'draw');
});

test('independent Chinook raw stored probe rejects current-side and opponent-only captures', () => {
  const reader = createReferenceChinook(new Uint8Array(), 'BASE1100.00 ==\n');
  // Adjacent kings on a diagonal, with clear landing beyond for both sides.
  const board = sparseBoard('american', { 17: 2, 14: -2 });
  assert.equal(reader.probe(board, 1), null);
  assert.equal(reader.probe(board, -1), null);
  // Own man may not capture backwards, but enemy king may capture it.
  const asymmetric = createReferenceChinook(new Uint8Array(), 'BASE0110.40 ==\n');
  assert.equal(asymmetric.probe(sparseBoard('american', { 14: 1, 17: -2 }), 1), null);
});

test('independent Chinook reader rejects malformed or out-of-bounds index records', () => {
  assert.throws(() => createReferenceChinook(new Uint8Array(), 'BASE1100.00 =\n'));
  assert.throws(() => createReferenceChinook(Uint8Array.of(0), 'BASE1100.00 =\nS0 0/0\nE5 0/2\n'));
  assert.throws(() => createReferenceChinook(new Uint8Array(), 'BASE1100.00 +-\n'));
});
