import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {makeSamples,catalogSchema,realms} from './samples.ts';
const first=JSON.stringify(makeSamples(),null,2)+'\n',second=JSON.stringify(makeSamples(),null,2)+'\n';
assert.equal(first,second);catalogSchema.parse(JSON.parse(first));
for(const r of realms)assert.equal(JSON.parse(first).filter((q:{realm:string})=>q.realm===r.id).length,20);
if(process.argv.includes('--check'))assert.equal(readFileSync('samples.json','utf8'),first);else writeFileSync('samples.json',first);
console.log('160 fictional rows; 20 per realm; schema valid and byte-identical regeneration');
