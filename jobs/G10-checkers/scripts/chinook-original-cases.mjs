// Original deterministic reference cases for the external original-C audit.
// Test-time file I/O only; no production game module is imported.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { createReferenceChinook } from '../tests/reference-chinook.mjs';

const options = {};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  if (!['--data', '--index', '--out'].includes(key) || !process.argv[index + 1]) throw new Error('Expected --data PATH --index PATH --out DIRECTORY');
  options[key] = resolve(process.argv[index + 1]);
}
if (Object.keys(options).length !== 3) throw new Error('Expected --data PATH --index PATH --out DIRECTORY');

const reader = createReferenceChinook(new Uint8Array(readFileSync(options['--data'])), readFileSync(options['--index'], 'ascii'));
assert.equal(reader.coverage.sliceCount, 3935);
assert.equal(reader.coverage.pieceTypeTuples.length, 155);
const seed = 0x4f43a319;
let state = seed;
function random(limit) {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  return (state >>> 0) % limit;
}
const cases = [], material = {}, outcomes = { win: 0, loss: 0, draw: 0 };
let attempts = 0;
for (let id = 0; id < 10000;) {
  if (++attempts > 200000) throw new Error('Could not generate sufficient quiet cases');
  const count = 3 + id % 4;
  const board = Array(32).fill(0), vacant = Array.from({ length: 32 }, (_, i) => i);
  for (let piece = 0; piece < count; piece++) {
    const index = vacant.splice(random(vacant.length), 1)[0];
    const color = piece === 0 ? 1 : piece === 1 ? -1 : random(2) ? 1 : -1;
    const crown = color === 1 ? index < 4 : index >= 28;
    board[index] = color * (crown || random(3) === 0 ? 2 : 1);
  }
  const side = random(2) ? 1 : -1;
  const value = reader.probe(board, side);
  if (value === null) continue;
  const location = reader.locate(board, side);
  const own = board.filter(piece => piece * side > 0).length;
  const split = `${count}:${own}v${count - own}`;
  material[split] = (material[split] ?? 0) + 1;
  outcomes[value]++;
  cases.push({ id, board, side, value, key: location.key, ordinal: location.ordinal });
  id++;
}
const input = cases.map(row => `${row.id} ${row.side} ${row.board.join(' ')}\n`).join('');
const records = cases.map(row => JSON.stringify(row)).join('\n') + '\n';
mkdirSync(options['--out'], { recursive: true });
writeFileSync(resolve(options['--out'], 'chinook-original-queries.txt'), input);
writeFileSync(resolve(options['--out'], 'chinook-original-expected.jsonl'), records);
const report = {
  schemaVersion: 1, seed, cases: cases.length, attempts, materialSplits: material, outcomes,
  queryInputSha256: createHash('sha256').update(input).digest('hex'),
  expectedRecordsSha256: createHash('sha256').update(records).digest('hex'),
  referenceSourceSha256: createHash('sha256').update(readFileSync(new URL('../tests/reference-chinook.mjs', import.meta.url))).digest('hex'),
  contract: 'American theoretical WDL for direct stored positions with neither side having a capture; no draw-history proof.'
};
writeFileSync(resolve(options['--out'], 'chinook-original-cases.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
