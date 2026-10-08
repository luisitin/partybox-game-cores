import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { referenceWdl, referenceTwoPieceRoots, referenceCertificateErrors, referencePositionKey } from './reference-endgame.mjs';
import { sparseBoard } from './reference-rule-cases.mjs';

test('independent WDL never labels a truncated king graph as draw', () => {
  const result = referenceWdl([{ board: sparseBoard('american', { 0: 2, 31: -2 }), side: 1 }], 'american', 1);
  assert.equal(result.complete, false);
  assert.deepEqual(result.entries, []);
  assert.equal(result.enumeratedNodes, 1);
});

test('independent WDL certifies complete six-piece forced-capture components', () => {
  const fixtures = [
    { variant: 'american', board: sparseBoard('american', { 17: 2, 31: 1, 14: -1, 15: -1, 23: -1, 22: -1 }) },
    { variant: 'international', board: sparseBoard('international', { 40: 1, 49: 1, 36: -1, 27: -1, 18: -1, 9: -1 }) }
  ];
  for (const { variant, board } of fixtures) {
    assert.equal(board.filter(Boolean).length, 6);
    const result = referenceWdl([{ board, side: 1 }], variant, 1000);
    assert.equal(result.complete, true);
    assert.deepEqual(referenceCertificateErrors(result), []);
    const root = result.entries.find(entry => entry.key === referencePositionKey(board, variant, 1));
    assert.equal(root.value, 'win');
    assert.equal(root.distance, 1, 'One complete multi-jump is one turn');
    assert(root.moves.every(move => move.captures.length === 4));
  }
});

test('independent complete one-vs-one man/king domains have valid WDL and distance certificates', () => {
  const reports = [];
  for (const variant of ['american', 'international']) {
    const roots = [...referenceTwoPieceRoots(variant)];
    const result = referenceWdl(roots, variant, 50000);
    assert.equal(result.complete, true, `${variant} exhaustive domain is fully closed`);
    assert.deepEqual(referenceCertificateErrors(result), []);
    const counts = { win: 0, loss: 0, draw: 0 };
    const transcript = createHash('sha256');
    let maximumDistance = 0;
    for (const entry of result.entries) {
      counts[entry.value]++;
      if (entry.distance !== null) maximumDistance = Math.max(maximumDistance, entry.distance);
      transcript.update(JSON.stringify([entry.key, entry.value, entry.distance]));
    }
    reports.push({ variant, rootPositions: roots.length, closedNodes: result.entries.length, rounds: result.rounds,
      scope: result.scope, outcomes: counts, maximumDistance, transcriptSha256: transcript.digest('hex') });
  }
  const report = {
    schemaVersion: 1,
    command: 'node --test tests/endgame-reference.test.mjs',
    algorithms: 'Independent coordinate move oracle plus synchronous whole-graph scans and regenerated-edge Bellman certificates.',
    referenceSourceSha256: createHash('sha256').update(readFileSync(new URL('./reference-endgame.mjs', import.meta.url))).digest('hex'),
    moveReferenceSha256: createHash('sha256').update(readFileSync(new URL('./reference-moves.mjs', import.meta.url))).digest('hex'),
    variants: reports,
    sixPieceScope: 'Two explicitly tested fully closed forced-capture roots; not global six-piece coverage.'
  };
  const destination = new URL('../evidence/checks/endgame-independent.json', import.meta.url);
  mkdirSync(new URL('.', destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
});
