import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sourcePaths,loadBrowserProof,verifyBrowserProof} from '../../../scripts/browser-proof.mjs';
import {loadStrictBrowserProof,verifyStrictBrowserProof} from '../../../scripts/strict-browser-proof.mjs';
const base='evidence/audit-20261009/bootstrap-407e528-current';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const bridge=await json(base+'/projection-and-path-bridge.json');
const report=await json(base+'/original-report35.json');
const captures=await json(base+'/original-captures35.json');
assert.equal(Object.keys(report.sourceStart).length,35);
assert.deepEqual(report.sourceStart,report.sourceEnd);
assert.deepEqual(captures.sourceStart,report.sourceStart);
assert.deepEqual(captures.sourceEnd,report.sourceStart);
assert.deepEqual(bridge.legacySourcePaths,sourcePaths);
for(const row of bridge.immutableCopiedFiles){
 const bytes=await readFile(base+'/'+row.path);
 assert.equal(bytes.length,row.bytes);assert.equal(sha(bytes),row.sha256);
}
const delivery=structuredClone(captures);
assert.equal(bridge.mediaPaths.length,2);
for(const [i,row] of bridge.mediaPaths.entries()){
 assert.equal(delivery.rows[i].path,row.originalPath);
 const bytes=await readFile(row.deliveryPath);
 assert.equal(bytes.length,row.bytes);assert.equal(sha(bytes),row.sha256);
 assert.equal(row.bytes,delivery.rows[i].bytes);assert.equal(row.sha256,delivery.rows[i].sha256);
 delivery.rows[i].path=row.deliveryPath;
}
assert.deepEqual(await json(base+'/delivery-captures35.json'),delivery,
 'full35 delivery may change only the two path values');
const projected=structuredClone(report),projectedCaptures=structuredClone(delivery);
for(const d of [projected,projectedCaptures])for(const key of ['sourceStart','sourceEnd']){
 d[key]=Object.fromEntries(sourcePaths.map(path=>[path,d[key][path]]));
}
assert.deepEqual(await json(base+'/derived-legacy-report5.json'),projected,
 'legacy report may change only the two source dictionaries');
assert.deepEqual(await json(base+'/derived-legacy-captures5.json'),projectedCaptures,
 'legacy captures may change only the two source dictionaries and delivery paths');
const legacy=verifyBrowserProof(await loadBrowserProof());
let strict=null;
if(process.argv.includes('--strict'))strict=verifyStrictBrowserProof(await loadStrictBrowserProof(base+'/current-proof35.json'));
console.log(JSON.stringify({closedUtc:new Date().toISOString(),suite:'immutable-original-proof-projection',
 originalCopiedFiles:bridge.immutableCopiedFiles.length,originalGuardedSources:35,
 legacySourcePaths:5,mediaPathRebases:2,mediaByteIdentical:true,
 allOtherReportAndCaptureFieldsUnchanged:true,legacy,strict,samplerExecuted:false,fullNpmTestAccepted:false}));
