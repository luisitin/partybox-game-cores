import test from 'node:test';
import assert from 'node:assert/strict';
import { referenceMoves, referenceAfter, referenceMoveKey } from './reference-moves.mjs';
import { REFERENCE_RULE_CASES, PUBLISHED_DRAW_REGRESSION, sparseBoard } from './reference-rule-cases.mjs';

for (const fixture of REFERENCE_RULE_CASES) test(`independent oracle: ${fixture.name}`, () => {
  const board = Object.freeze(sparseBoard(fixture.variant, fixture.pieces));
  const before = JSON.stringify(board);
  const actual = referenceMoves(board, fixture.variant, fixture.side);
  assert.deepEqual(actual.map(referenceMoveKey).sort(), fixture.exact.map(referenceMoveKey).sort());
  for (const move of actual) {
    assert.equal(new Set(move.captures).size, move.captures.length);
    const next = referenceAfter(board, move, fixture.side);
    assert.equal(next[move.path.at(-1)], move.promotes ? fixture.side * 2 : board[move.path[0]]);
    assert.equal(next.filter(Boolean).length, board.filter(Boolean).length - move.captures.length);
  }
  assert.equal(JSON.stringify(board), before);
});

test('independent oracle: flying king has all seventeen quiet ray destinations', () => {
  const moves = referenceMoves(sparseBoard('international', { 22: 2 }), 'international', 1);
  assert.equal(moves.length, 17);
  assert(moves.some(move => move.path.at(-1) === 45));
  assert(moves.every(move => move.captures.length === 0 && !move.promotes));
});

test('independent oracle: International complete capture can return to its origin', () => {
  const board = sparseBoard('international', { 21: 2, 17: -1, 18: -1, 28: -1, 27: -1 });
  const moves = referenceMoves(board, 'international', 1);
  assert(moves.every(move => move.captures.length === 4));
  assert(moves.some(move => move.path[0] === move.path.at(-1)));
});

test('independent oracle: full published 16-each draw regression consists of legal turns', () => {
  let board = sparseBoard('international', PUBLISHED_DRAW_REGRESSION.pieces);
  let side = 1;
  for (const [ply, path] of PUBLISHED_DRAW_REGRESSION.paths.entries()) {
    const zeroBased = path.map(square => square - 1);
    const candidates = referenceMoves(board, 'international', side);
    const matching = candidates.filter(move => JSON.stringify(move.path) === JSON.stringify(zeroBased));
    assert.equal(matching.length, 1, `Published ply ${ply + 1} is one complete legal turn`);
    assert.equal(matching[0].captures.length, ply + 1 === PUBLISHED_DRAW_REGRESSION.captureAtPly ? 1 : 0);
    board = referenceAfter(board, matching[0], side);
    side = -side;
  }
  assert.equal(board.filter(Boolean).length, 3);
  assert.equal(PUBLISHED_DRAW_REGRESSION.paths.length, 32);
});
