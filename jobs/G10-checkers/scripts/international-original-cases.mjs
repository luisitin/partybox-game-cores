// Original fixed-seed queries for the external author's Boost C++ driver.
// This test-time adapter imports only the independently authored reference.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { createReferenceInternational, unpackReferenceInternationalDictionary } from '../tests/reference-international.mjs';

const options = { databases: [], pieces: [2, 3, 4, 5], cases: 10000 };
for (let index = 2; index < process.argv.length; index += 2) {
  const flag = process.argv[index], value = process.argv[index + 1];
  if (!value) throw new Error('Expected a value after each option');
  if (flag === '--database') options.databases.push(resolve(value));
  else if (flag === '--dictionary' || flag === '--out') options[flag.slice(2)] = resolve(value);
  else if (flag === '--pieces') options.pieces = value.split(',').map(Number);
  else if (flag === '--cases') options.cases = Number(value);
  else throw new Error('Unknown query-generation option');
}
if (!options.databases.length || !options.dictionary || !options.out
  || !options.pieces.length || options.pieces.some(n => !Number.isInteger(n) || n < 2 || n > 6)
  || !Number.isInteger(options.cases) || options.cases < 1) throw new Error('Invalid query-generation options');
const hash = data => createHash('sha256').update(data).digest('hex');
const files = new Map(), fileHashes = {};
for (const directory of options.databases) {
  for (const name of readdirSync(directory).sort()) {
    const match = /^(db(?:[2-5]|6-\d{4}))\.cpr1$/u.exec(name);
    if (!match) continue;
    const key = match[1], pieces = Number(key[2]);
    if (!options.pieces.includes(pieces)) continue;
    const data = readFileSync(resolve(directory, name));
    const index = readFileSync(resolve(directory, `${key}.idx1`));
    const hashes = { bytes: data.length, sha256: hash(data), indexBytes: index.length, indexSha256: hash(index) };
    if (files.has(key)) {
      assert.deepEqual(fileHashes[key], hashes, 'Different bytes supplied for one material file');
      continue;
    }
    files.set(key, { data: new Uint8Array(data), indexText: index.toString('ascii') });
    fileHashes[key] = hashes;
  }
}
const dictionaryBytes = readFileSync(options.dictionary);
const tables = extname(options.dictionary) === '.json' ? JSON.parse(dictionaryBytes.toString('utf8'))
  : unpackReferenceInternationalDictionary(new Uint8Array(dictionaryBytes));
const reader = createReferenceInternational(files, tables);
const materials = new Map(options.pieces.map(pieces => [pieces,
  reader.coverage.materialTuples.map(tuple => tuple.split(',').map(Number))
    .filter(tuple => tuple.reduce((total, count) => total + count, 0) === pieces)]));
for (const [pieces, tuples] of materials) if (!tuples.length) throw new Error(`No actual data for ${pieces} pieces`);

const seed = 0x1a6f4309;
let state = seed;
function random(limit) {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  return (state >>> 0) % limit;
}
function boardFor(tuple, reverse) {
  const board = Array(50).fill(0);
  for (const [count, piece, start, end] of [[tuple[0], -1, 0, 45], [tuple[2], 1, 5, 50],
    [tuple[1], -2, 0, 50], [tuple[3], 2, 0, 50]]) {
    for (let n = 0; n < count; n++) {
      const vacancies = Array.from({ length: end - start }, (_, i) => start + i).filter(i => !board[i]);
      board[vacancies[random(vacancies.length)]] = piece;
    }
  }
  return reverse ? board.map((_, index) => -board[49 - index]) : board;
}
const cases = [], outcomes = { win: 0, loss: 0, draw: 0 }, materialSplits = {}, materialQueries = {}, orientations = {};
let attempts = 0;
for (let id = 0; id < options.cases;) {
  if (++attempts > options.cases * 100) throw new Error('Unable to generate sufficient admissible stored queries');
  const pieces = options.pieces[id % options.pieces.length];
  const tuples = materials.get(pieces), round = Math.floor(id / options.pieces.length);
  const tuple = tuples[round % tuples.length];
  const reversedInput = Math.floor(round / tuples.length) % 2 === 1;
  const board = boardFor(tuple, reversedInput), side = random(2) ? 1 : -1;
  const value = reader.probe(board, side);
  if (value === null) continue;
  const location = reader.locate(board, side);
  const own = board.filter(piece => piece * side > 0).length;
  const split = `${pieces}:${own}v${pieces - own}`;
  materialSplits[split] = (materialSplits[split] ?? 0) + 1;
  const materialKey = location.material.join(',');
  materialQueries[materialKey] = (materialQueries[materialKey] ?? 0) + 1;
  const orientation = `${materialKey}:${side}:${reversedInput ? 'rotated' : 'original'}`;
  orientations[orientation] = (orientations[orientation] ?? 0) + 1;
  outcomes[value]++;
  cases.push({ id, board, side, value, key: location.key, ordinal: location.ordinal,
    index: location.index, file: location.file });
  id++;
}
if (options.cases >= 5000) {
  assert.deepEqual(Object.keys(materialQueries).sort(), reader.coverage.materialTuples,
    'The validation must exercise every actually supplied material tuple');
  for (const tuple of reader.coverage.materialTuples) {
    for (const side of [-1, 1]) for (const orientation of ['original', 'rotated']) {
      assert.ok(orientations[`${tuple}:${side}:${orientation}`] > 0,
        `Missing colour/side orientation ${tuple}:${side}:${orientation}`);
    }
  }
}
const queryText = cases.map(row => `${row.id} ${row.side} ${row.board.join(' ')}\n`).join('');
const expectedText = cases.map(row => JSON.stringify(row)).join('\n') + '\n';
mkdirSync(options.out, { recursive: true });
writeFileSync(resolve(options.out, 'international-original-queries.txt'), queryText);
writeFileSync(resolve(options.out, 'international-original-expected.jsonl'), expectedText);
const report = {
  schemaVersion: 1, seed, cases: cases.length, attempts, pieces: options.pieces,
  availableMaterials: reader.coverage.materialTuples, queriedMaterials: Object.keys(materialQueries).sort(),
  materialQueries, materialSplits, orientations, outcomes, sourceFiles: fileHashes,
  dictionaryBytes: dictionaryBytes.length, dictionarySha256: hash(dictionaryBytes),
  queryInputSha256: hash(queryText), expectedRecordsSha256: hash(expectedText),
  referenceSourceSha256: hash(readFileSync(new URL('../tests/reference-international.mjs', import.meta.url))),
  generatorSourceSha256: hash(readFileSync(new URL(import.meta.url))),
  contract: 'International theoretical WDL v2 for actual supplied material files. Current-side captures excluded; opponent-only capture threats allowed at <=6. No draw-history proof or claim of unsupplied six-piece coverage.'
};
writeFileSync(resolve(options.out, 'international-original-cases.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
