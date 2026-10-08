import{readFileSync}from'node:fs';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const snapshot=()=>Object.fromEntries(readFileSync('SHA256SUMS.txt','utf8').trim().split('\n').map(line=>{const[,p]=line.split('  ');return[p,createHash('sha256').update(readFileSync(p)).digest('hex')]}));
const original=snapshot();
execFileSync(process.execPath,['scripts/generate.mjs'],{stdio:'inherit'});const first=snapshot();execFileSync(process.execPath,['scripts/generate.mjs'],{stdio:'inherit'});const second=snapshot();
assert.deepEqual(first,original,'generated deliverables drifted');assert.deepEqual(second,first,'two regenerations differ');console.log(JSON.stringify({regenerations:2,byteIdentical:true,files:Object.keys(second).length}));
