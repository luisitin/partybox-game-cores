import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import assert from 'node:assert/strict';
const parse = path => JSON.parse(readFileSync(path, 'utf8'));
const ajv = new Ajv2020({ strict: false, allErrors: true });
const schema = parse('schemas/research.schema.json');
assert.ok(ajv.validateSchema(schema));
const valid = ajv.compile(schema);
assert.ok(valid(parse('research-access.json')), JSON.stringify(valid.errors));
const seal = readFileSync('REFERENCE-SEAL.md','utf8').match(/SHA256: ([a-f0-9]{64})/)[1];
assert.equal(createHash('sha256').update(readFileSync('src/reference.ts')).digest('hex'),seal);
for(const line of readFileSync('SHA256SUMS.txt','utf8').trim().split('\n')) {
 const [hash,path] = line.split('  ');
 assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),hash,path);
}
console.log(JSON.stringify({sourceReceipts:parse('research-access.json').sources.length,schemaValid:true,referenceSealValid:true,hashesValid:true,researchOnly:true}));
