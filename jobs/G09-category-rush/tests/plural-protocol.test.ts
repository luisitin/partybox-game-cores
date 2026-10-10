import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {pluralProtocolSchema} from '../content/plural-schema';
import {lexicalAuditSchema} from '../content/lexical-schema';
import {validateJsonSchema} from '../scripts/json-schema-validator';
const root=new URL('../',import.meta.url),read=(name:string)=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const sha=(name:string)=>createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex');
test('actual restored plural protocols cancel nine duplicate pairs on both rosters and bind independent evidence',()=>{
 const schema=read('evidence/plural-protocol.schema.json');assert.deepEqual(schema,z.toJSONSchema(pluralProtocolSchema));
 const before=pluralProtocolSchema.parse(read('evidence/plural-protocol-baseline.json')),after=pluralProtocolSchema.parse(read('evidence/plural-protocol-after.json'));
 const historical=pluralProtocolSchema.parse(read('evidence/plural-protocol-round4.json'));
 assert.deepEqual(validateJsonSchema(schema,historical),[]);
 assert.equal(historical.sourceHashes.core,sha('evidence/breadth-lexical-core.ts'));
 assert.equal(historical.sourceHashes.matcher,sha('evidence/breadth-lexical-match.ts'));
 assert.deepEqual(validateJsonSchema(schema,before),[]);assert.deepEqual(validateJsonSchema(schema,after),[]);
 for(const [field,path] of Object.entries({core:'src/index.ts',matcher:'src/match.ts',scoring:'src/scoring.ts',data:'content/categories.json',reference:'tests/reference.ts',experiment:'scripts/plural-protocol.ts'}))assert.equal(after.sourceHashes[field as keyof typeof after.sourceHashes],sha(path));
 for(const field of ['core','matcher','scoring'] as const)assert.equal(before.sourceHashes[field],sha(`evidence/browser/round-3-accepted/src/${field==='core'?'index':field==='matcher'?'match':'scoring'}.ts`));
 assert.equal(before.sourceHashes.reference,sha('evidence/browser/round-3-accepted/tests/reference.ts'));
 assert.equal(before.sourceHashes.experiment,after.sourceHashes.experiment);
 for(const count of [2,8]){
  const old=before.rows.filter(row=>row.count===count),now=after.rows.filter(row=>row.count===count);
  assert.equal(old.length,9);assert.equal(now.length,9);
  assert.equal(old.reduce((sum,row)=>sum+row.awarded,0),18);assert.equal(now.reduce((sum,row)=>sum+row.awarded,0),0);
  assert(old.every(row=>!row.matches&&row.receipt.groups.length===2));
  assert(now.every(row=>row.matches&&row.receipt.groups.length===1&&row.receipt.groups[0].duplicate&&row.receipt.groups[0].owners.length===2));
  assert.deepEqual(now.map(row=>[row.singular,row.plural,row.seed,row.letter,row.eventCount]),old.map(row=>[row.singular,row.plural,row.seed,row.letter,row.eventCount]));
  assert.deepEqual(historical.rows.filter(row=>row.count===count).map(row=>[row.singular,row.plural,row.seed,row.letter,row.layout,row.eventCount]),old.map(row=>[row.singular,row.plural,row.seed,row.letter,row.layout,row.eventCount]));
  if(count===2)assert.deepEqual(now.map(row=>row.layout),old.map(row=>row.layout));
 }
 const malformed=structuredClone(after);malformed.rows.pop();assert(validateJsonSchema(schema,malformed).length>0);
 for(const [field,value] of [['count',4],['awarded',-1],['awarded',3],['awarded',0.5],['eventCount',0]] as const){
  const bad=structuredClone(after);Object.assign(bad.rows[0],{[field]:value});assert(validateJsonSchema(schema,bad).length>0,`${field}=${value}`);
 }
});
test('source-bound lexical audit fixes 33 scored pair failures and the news false merge without hiding ambiguities',()=>{
 const schema=read('evidence/lexical-audit.schema.json');assert.deepEqual(schema,z.toJSONSchema(lexicalAuditSchema));
 const before=lexicalAuditSchema.parse(read('evidence/lexical-audit-baseline.json')),after=lexicalAuditSchema.parse(read('evidence/lexical-audit-after.json'));
 const historical=lexicalAuditSchema.parse(read('evidence/lexical-audit-round4.json'));
 assert.deepEqual(validateJsonSchema(schema,historical),[]);
 assert.equal(historical.sourceHashes.core,sha('evidence/breadth-lexical-core.ts'));
 assert.equal(historical.sourceHashes.match,sha('evidence/breadth-lexical-match.ts'));
 assert.deepEqual(historical.rows,after.rows);
 for(const report of [before,after])assert.deepEqual(validateJsonSchema(schema,report),[]);
 assert.equal(before.positiveFailures.length,33);assert.equal(before.stemFailures.length,37);
 assert.equal(before.negativeFalseMerges.length,1);assert.deepEqual(before.negativeFalseMerges.map(row=>[row.a,row.b]),[['news','new']]);
 assert.equal(after.positiveSame,46);assert.equal(after.positiveFailures.length,0);assert.equal(after.stemFailures.length,0);assert.equal(after.negativeFalseMerges.length,0);
 assert(before.positiveFailures.every(row=>row.awarded===2&&row.ownAwarded===2));
 assert(after.rows.filter(row=>row.kind==='positive').every(row=>row.awarded===0&&row.ownAwarded===0));
 assert.deepEqual(after.rows.map(row=>[row.a,row.b,row.kind]),before.rows.map(row=>[row.a,row.b,row.kind]));
 for(const [field,path] of Object.entries({core:'src/index.ts',match:'src/match.ts',scoring:'src/scoring.ts',data:'content/categories.json'}))assert.equal(after.sourceHashes[field as keyof typeof after.sourceHashes],sha(path));
 assert.equal(before.sourceHashes.match,sha('evidence/breadth-original-match.ts'));
});
