import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createReferenceInternational, referenceInternationalRank } from './reference-international.mjs';

function position(entries) {
  const board = Array(50).fill(0);
  for (const [index, piece] of Object.entries(entries)) board[Number(index)] = piece;
  return board;
}

function syntheticTables(twoCatalogues = false) {
  return {
    lengths: Array.from({ length: 50 }, () => Array(256).fill(twoCatalogues ? 2 : 1)),
    offsets: Array.from({ length: 50 }, (_, catalogue) => Array(256).fill(twoCatalogues && catalogue === 1 ? 4 : 0)),
    valueRuns: twoCatalogues ? [0, 2, 0, 6, 1, 2, 0, 6] : [0, 1, 0, 6]
  };
}

test('independent International rank has exact back-rank group boundaries', () => {
  const first = referenceInternationalRank(position({ 0: -1, 49: 1 }), -1);
  const endBack = referenceInternationalRank(position({ 4: -1, 5: 1 }), -1);
  const firstOuter = referenceInternationalRank(position({ 5: -1, 49: 1 }), -1);
  const last = referenceInternationalRank(position({ 44: -1, 5: 1 }), -1);
  assert.equal(first.index, 0);
  assert.equal(endBack.index, 224);
  assert.equal(firstOuter.index, 225);
  assert.equal(last.index, 1984);
  assert.equal(last.positions, 1985);
  assert.equal(last.key, 'BASE1,0,1,0,0,b');
});

test('all two-piece material ranks are complete independent bijections', () => {
  for (const [black, white, expected] of [[-1, 1, 1985], [-2, 2, 2450], [-2, 1, 2205]]) {
    const ranks = new Set();
    for (let b = 0; b < 50; b++) {
      if (black === -1 && b >= 45) continue;
      for (let w = 0; w < 50; w++) {
        if (w === b || (white === 1 && w < 5)) continue;
        const rank = referenceInternationalRank(position({ [b]: black, [w]: white }), -1);
        assert.equal(rank.reversed, false);
        assert.equal(rank.positions, expected);
        assert.ok(!ranks.has(rank.index));
        ranks.add(rank.index);
      }
    }
    assert.equal(ranks.size, expected);
    assert.equal(Math.min(...ranks), 0);
    assert.equal(Math.max(...ranks), expected - 1);
  }
});

test('rotation and colour reversal preserve canonical location', () => {
  for (const entries of [{ 0: -2, 49: 2 }, { 44: -1, 49: 2 }, { 0: -2, 1: -2, 2: -2, 14: 2, 27: 2, 41: 2 }]) {
    const board = position(entries);
    for (const side of [1, -1]) {
      const rotated = board.map((_, index) => -board[49 - index]);
      const first = referenceInternationalRank(board, side);
      const second = referenceInternationalRank(rotated, -side);
      assert.equal(first.key, second.key);
      assert.equal(first.index, second.index);
      assert.equal(first.file, second.file);
    }
  }
});

test('six-piece ranks include 3v3 and 5v1 kings', () => {
  const balanced = referenceInternationalRank(position({ 0: -2, 1: -2, 2: -2, 47: 2, 48: 2, 49: 2 }), -1);
  assert.equal(balanced.file, 'db6-0303');
  assert.equal(balanced.index, 16214);
  assert.equal(balanced.positions, 317814000);
  const uneven = referenceInternationalRank(position({ 0: -2, 1: -2, 2: -2, 3: -2, 4: -2, 49: 2 }), -1);
  assert.equal(uneven.file, 'db6-0501');
  assert.equal(uneven.index, 44);
  assert.equal(uneven.positions, 95344200);
});

test('invalid crowns, side, board and out-of-scope material do not produce ranks', () => {
  assert.equal(referenceInternationalRank(position({ 0: 1, 49: -1 }), 1), null);
  assert.equal(referenceInternationalRank(Array(49).fill(0), 1), null);
  assert.equal(referenceInternationalRank(position({ 0: -2, 49: 2 }), 0), null);
  assert.equal(referenceInternationalRank(position({ 0: -2, 1: -2, 2: -2, 3: -2, 4: -2, 5: -2, 49: 2 }), -1), null);
});

test('synthetic token mapping and uniform slice decode without mutation', () => {
  const data = new Uint8Array(2450);
  const before = [...data];
  const board = position({ 0: -2, 49: 2 });
  const reader = createReferenceInternational(new Map([['db2', { data, indexText: 'BASE0,1,0,1,0,b:0/0,0,39\n' }]]), syntheticTables());
  assert.equal(reader.probe(board, -1), 'draw');
  assert.equal(reader.probe(board, 1), 'draw');
  assert.deepEqual([...data], before);
  assert.deepEqual(board, position({ 0: -2, 49: 2 }));
  const uniform = createReferenceInternational(new Map([['db2', { data: new Uint8Array(), indexText: 'BASE0,1,0,1,0,b:+\n' }]]), syntheticTables());
  assert.equal(uniform.probe(board, -1), 'win');
});

test('synthetic checkpoint changes catalogue at the physical block boundary', () => {
  const reader = createReferenceInternational(new Map([['db6-0303', {
    data: new Uint8Array(8192), indexText: 'BASE0,3,0,3,0,b:0/0,0,39\n8192,1,39\n'
  }]]), syntheticTables(true));
  assert.equal(reader.probe(position({ 0: -2, 1: -2, 2: -2, 3: 2, 4: 2, 5: 2 }), -1), 'draw');
  const later = position({ 0: -2, 1: -2, 2: -2, 14: 2, 27: 2, 41: 2 });
  assert.equal(reader.locate(later, -1).ordinal, 8723);
  assert.equal(reader.probe(later, -1), 'win');
});

test('a token uses a declared-length prefix of a longer shared run record', () => {
  const tables = syntheticTables();
  tables.valueRuns = [0, 2, 0, 6];
  const reader = createReferenceInternational(new Map([['db2', {
    data: new Uint8Array(2450), indexText: 'BASE0,1,0,1,0,b:0/0,0,39\n'
  }]]), tables);
  assert.equal(reader.probe(position({ 0: -2, 49: 2 }), -1), 'draw');
});

test('current captures are excluded but opponent-only threats are valid for v2 at <=6', () => {
  const reader = createReferenceInternational(new Map([['db2', {
    data: new Uint8Array(), indexText: 'BASE0,1,0,1,0,b:=\n'
  }]]), syntheticTables());
  const threat = position({ 0: -2, 6: 2 });
  assert.equal(reader.probe(threat, -1), null);
  assert.equal(reader.probe(threat, 1), 'draw');
  assert.equal(reader.probe(position({ 0: -1, 49: 1 }), -1), null);
});

test('malformed dictionary, permutation and checkpoint are rejected', () => {
  const valid = new Map([['db2', { data: new Uint8Array(), indexText: 'BASE0,1,0,1,0,b:=\n' }]]);
  const bad = syntheticTables();
  bad.valueRuns = [0, 0, 0, 6];
  assert.throws(() => createReferenceInternational(valid, bad), /run length/u);
  assert.throws(() => createReferenceInternational(new Map([['db2', {
    data: new Uint8Array(2), indexText: 'BASE0,1,0,1,0,b:0/0,0,0\n'
  }]]), syntheticTables()), /permutation/u);
  assert.throws(() => createReferenceInternational(new Map([['db2', {
    data: new Uint8Array(8192), indexText: 'BASE0,1,0,1,0,b:0/0,0,39\n0,0,39\n'
  }]]), syntheticTables()), /Unordered/u);
});

const actualDirectory = process.env.G10_INTL_DB_DIR;
const actualTables = process.env.G10_INTL_TABLES;
test('actual licensed two-piece sample agrees with exact corner and quiet-king cases', {
  skip: !actualDirectory || !actualTables
}, () => {
  const bytes = readFileSync(resolve(actualDirectory, 'db2.cpr1'));
  const index = readFileSync(resolve(actualDirectory, 'db2.idx1'));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '305a1e7eabb4bab13577774009592e1614ddf8a4efe334d6fe3cb8221000b4ed');
  assert.equal(createHash('sha256').update(index).digest('hex'), '9622e861c67ea250396b384bb95fec00fd541964c3109bdc1b27ae7aae1f73f2');
  const reader = createReferenceInternational(new Map([['db2', {
    data: new Uint8Array(bytes), indexText: index.toString('ascii')
  }]]), JSON.parse(readFileSync(actualTables, 'utf8')));
  assert.equal(reader.coverage.sliceCount, 4);
  assert.equal(reader.probe(position({ 0: -2, 49: 2 }), -1), 'draw');
  assert.equal(reader.probe(position({ 0: -2, 49: 2 }), 1), 'draw');
  assert.equal(reader.probe(position({ 44: -1, 49: 2 }), -1), 'loss');
  assert.equal(reader.probe(position({ 44: -1, 49: 2 }), 1), 'draw');
  assert.equal(reader.probe(position({ 0: -2, 6: 2 }), -1), null);
  assert.equal(reader.probe(position({ 0: -2, 6: 2 }), 1), 'draw');
});
