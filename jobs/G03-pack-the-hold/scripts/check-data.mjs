import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import assert from 'node:assert/strict';
const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addFormat('date-time', value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
const parse = path => JSON.parse(readFileSync(path, 'utf8'));
const schemas = Object.fromEntries(['state', 'manifest', 'calibration', 'research', 'seeds', 'visual', 'current-visual', 'capture', 'raw-frame'].map(name => [name, ajv.compile(parse(`schemas/${name}.schema.json`))]));
const targets = [['manifest.json', 'manifest'], ['research-access.json', 'research'], ['data/calibration.json', 'calibration'], ['data/property-seeds.json', 'seeds'], ['media/visual-measurements.json', 'visual'], ...readdirSync('fixtures').map(file => [`fixtures/${file}`, 'state'])];
targets.push(['historical/hosted-731b64b.json', 'visual']);
for (const file of readdirSync('media')) {
  if (/^capture-\d{2}-report\.json$/.test(file)) targets.push([`media/${file}`, 'capture']);
  else if (/^visual-\d{2}-report\.json$/.test(file)) targets.push([`media/${file}`, 'current-visual']);
  else if (/^visual-\d{2}-raw-(?:desktop|phone)\.json$/.test(file)) targets.push([`media/${file}`, 'raw-frame']);
}
for (const [path, name] of targets) assert.ok(schemas[name](parse(path)), `${path}: ${JSON.stringify(schemas[name].errors)}`);
for (const file of readdirSync('schemas')) assert.ok(ajv.validateSchema(parse(`schemas/${file}`)), `invalid JSON Schema: ${file}`);
for (const line of readFileSync('SHA256SUMS.txt', 'utf8').trim().split('\n')) {
  const [hash, path] = line.split('  '); assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), hash, path);
}
const generated = ['manifest.json', 'src/tiers.ts', ...readdirSync('data').map(f => `data/${f}`), ...readdirSync('fixtures').map(f => `fixtures/${f}`), ...readdirSync('schemas').map(f => `schemas/${f}`), 'SHA256SUMS.txt'];
const before = new Map(generated.map(path => [path, readFileSync(path)]));
for (let run = 0; run < 2; run++) {
  execFileSync(process.execPath, ['scripts/generate.mjs'], { stdio: 'pipe' });
  for (const path of generated) assert.deepEqual(readFileSync(path), before.get(path), `non-reproducible ${path}, run ${run + 1}`);
}
for (const tiers of [parse('data/calibration.json').tiers, parse('data/calibration.json').flip]) {
  assert.deepEqual(tiers.map(t => t.difficulty), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (let i = 1; i < tiers.length; i++) assert.ok(tiers[i - 1].solveRate >= tiers[i].solveRate);
}
console.log(JSON.stringify({ schemasValidated: targets.length, schemaFiles: readdirSync('schemas').length, byteIdenticalRegenerations: 2, hashedFiles: readFileSync('SHA256SUMS.txt', 'utf8').trim().split('\n').length }));
