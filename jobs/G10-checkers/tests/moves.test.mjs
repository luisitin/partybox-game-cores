import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legalMoves, applyMove } from '../dist/moves.mjs';
import { referenceMoves, referenceAfter, referenceMoveKey } from './reference-moves.mjs';
import { REFERENCE_RULE_CASES, sparseBoard } from './reference-rule-cases.mjs';

function sortedKeys(moves) { return moves.map(referenceMoveKey).sort(); }

for (const fixture of REFERENCE_RULE_CASES) test(`production rules: ${fixture.name}`, () => {
  const board = Object.freeze(sparseBoard(fixture.variant, fixture.pieces));
  const actual = legalMoves(board, fixture.variant, fixture.side);
  assert.deepEqual(sortedKeys(actual), sortedKeys(fixture.exact));
  for (const move of actual) assert.deepEqual(applyMove(board, move), referenceAfter(board, move, fixture.side));
});

test('10,000 independent move differentials plus color-rotated twins and every resulting board', () => {
  const seed = 0x6c18b5a3;
  let randomState = seed;
  function random() {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) / 4294967296;
  }
  function choose(n) { return Math.floor(random() * n); }
  const digest = createHash('sha256');
  let americanCases = 0, internationalCases = 0, appliedMoves = 0, captureMoves = 0, returningCaptures = 0;
  for (let index = 0; index < 10000; index++) {
    const variant = index % 2 === 0 ? 'american' : 'international';
    const width = variant === 'american' ? 8 : 10;
    const board = Array(width * width / 2).fill(0);
    const pieceCount = 2 + choose(variant === 'american' ? 23 : 39);
    const vacant = board.map((_, square) => square);
    for (let pieceIndex = 0; pieceIndex < pieceCount; pieceIndex++) {
      const slot = choose(vacant.length);
      const square = vacant.splice(slot, 1)[0];
      const color = random() < 0.5 ? 1 : -1;
      const row = Math.floor(square / (width / 2));
      const onCrownRow = row === (color === 1 ? 0 : width - 1);
      board[square] = color * (onCrownRow || random() < 0.35 ? 2 : 1);
    }
    const side = random() < 0.5 ? 1 : -1;
    Object.freeze(board);
    const before = JSON.stringify(board);
    const expected = referenceMoves(board, variant, side);
    const actual = legalMoves(board, variant, side);
    assert.deepEqual(sortedKeys(actual), sortedKeys(expected), `${variant} random case ${index}, side ${side}, board ${before}`);
    if (variant === 'american') americanCases++; else internationalCases++;
    for (const move of actual) {
      assert.equal(new Set(move.captures).size, move.captures.length, 'No repeated capture');
      assert.deepEqual(applyMove(board, move), referenceAfter(board, move, side), `Move application at random case ${index}`);
      appliedMoves++;
      if (move.captures.length) captureMoves++;
      if (move.captures.length && move.path[0] === move.path.at(-1)) returningCaptures++;
    }
    assert.equal(JSON.stringify(board), before, 'Frozen input unchanged');

    const rotated = Object.freeze([...board].reverse().map(piece => piece === 0 ? 0 : -piece));
    const rotatedExpected = expected.map(move => ({
      path: move.path.map(square => board.length - 1 - square),
      captures: move.captures.map(square => board.length - 1 - square),
      promotes: move.promotes
    }));
    assert.deepEqual(sortedKeys(referenceMoves(rotated, variant, -side)), sortedKeys(rotatedExpected), `Independent color rotation ${index}`);
    assert.deepEqual(sortedKeys(legalMoves(rotated, variant, -side)), sortedKeys(rotatedExpected), `Production color rotation ${index}`);
    digest.update(JSON.stringify([index, variant, board, side, sortedKeys(expected)]));
  }
  const report = {
    schemaVersion: 1,
    independentAuthorship: 'Reference source authored before production; checkpoint f171da4.',
    seed, randomCases: 10000, americanCases, internationalCases,
    rotatedTwins: 10000, appliedMoves, captureMoves, returningCaptures,
    transcriptSha256: digest.digest('hex'),
    referenceSourceSha256: createHash('sha256').update(readFileSync(new URL('./reference-moves.mjs', import.meta.url))).digest('hex'),
    productionModuleSha256: createHash('sha256').update(readFileSync(new URL('../dist/moves.mjs', import.meta.url))).digest('hex')
  };
  const evidenceDirectory = process.env.G10_EVIDENCE_DIR ? resolve(process.env.G10_EVIDENCE_DIR) :
    fileURLToPath(new URL('../evidence/checks/', import.meta.url));
  mkdirSync(evidenceDirectory, { recursive: true });
  writeFileSync(resolve(evidenceDirectory, 'moves-reference.json'), JSON.stringify(report, null, 2) + '\n');
  assert.equal(americanCases, 5000);
  assert.equal(internationalCases, 5000);
});
