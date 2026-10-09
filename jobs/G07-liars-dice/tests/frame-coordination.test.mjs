import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {waitForFrameGrant,closeFrameGrant,writeAtomic} from '../scripts/frame-coordination.mjs';
const sourceSha256='a'.repeat(64);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(directory,profile='desktop') {
 for(let i=0;i<100;i++){try{return JSON.parse(await readFile(join(directory,profile+'.ready.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}await delay(5);}
 throw new Error('ready marker did not appear');
}
async function isolated(fn){const dir=await mkdtemp(join(tmpdir(),'G07-grant-'));try{await fn(dir);}finally{await rm(dir,{recursive:true,force:true});}}
const identity=r=>({profile:r.profile,sourceSha256:r.sourceSha256,attemptNonce:r.attemptNonce});
test('CI without a shared barrier returns immediately',async()=>assert.equal(await waitForFrameGrant({}),null));
test('matching nonce grants and CLOSED marker retain the exact attempt identity',async()=>isolated(async directory=>{
 const promise=waitForFrameGrant({directory,profile:'desktop',sourceSha256,timeoutMs:2000});const r=await ready(directory);
 assert.equal(r.intervals,600);assert.equal(r.minimumMeanFps,59);assert.equal(r.maximumP99Ms,17);
 await writeAtomic(join(directory,'desktop.grant.json'),identity(r));const token=await promise;
 await closeFrameGrant(token,{sampled:true,passed:false,reason:'test closes without sampling browser frames'});
 const closed=JSON.parse(await readFile(join(directory,'desktop.closed.json'),'utf8'));assert.deepEqual(identity(closed),identity(r));assert.equal(closed.passed,false);
}));
for(const [name,change] of [
 ['wrong nonce',r=>({...identity(r),attemptNonce:'stale'})],
 ['wrong source',r=>({...identity(r),sourceSha256:'b'.repeat(64)})],
 ['wrong profile',r=>({...identity(r),profile:'phone4x'})],
 ['extra grant field',r=>({...identity(r),allow:true})],
 ['missing nonce',r=>({profile:r.profile,sourceSha256:r.sourceSha256})],
 ['array grant',r=>[identity(r)]],
])test('ignores '+name+' until the matching grant arrives',async()=>isolated(async directory=>{
 let settled=false;const promise=waitForFrameGrant({directory,profile:'desktop',sourceSha256,timeoutMs:2000}).then(value=>{settled=true;return value;});
 const r=await ready(directory);await writeAtomic(join(directory,'desktop.grant.json'),change(r));await delay(110);assert.equal(settled,false);
 await writeAtomic(join(directory,'desktop.grant.json'),identity(r));assert.deepEqual(identity(await promise),identity(r));
}));
test('malformed JSON is ignored, not mistaken for permission',async()=>isolated(async directory=>{
 let settled=false;const promise=waitForFrameGrant({directory,profile:'desktop',sourceSha256,timeoutMs:2000}).then(value=>{settled=true;return value;});
 const r=await ready(directory);await writeFile(join(directory,'desktop.grant.json'),'{');await delay(110);assert.equal(settled,false);
 await writeAtomic(join(directory,'desktop.grant.json'),identity(r));await promise;
}));
test('each attempt removes stale own markers and keeps the other profile intact',async()=>isolated(async directory=>{
 const other='foreign profile untouched';await writeFile(join(directory,'phone4x.grant.json'),other);
 await writeAtomic(join(directory,'desktop.grant.json'),{profile:'desktop',sourceSha256,attemptNonce:'old'});
 const first=waitForFrameGrant({directory,profile:'desktop',sourceSha256,timeoutMs:2000});const r1=await ready(directory);
 await writeAtomic(join(directory,'desktop.grant.json'),identity(r1));await first;
 const second=waitForFrameGrant({directory,profile:'desktop',sourceSha256,timeoutMs:2000});let r2;
 for(let i=0;i<100;i++){r2=await ready(directory);if(r2.attemptNonce!==r1.attemptNonce)break;await delay(5);}
 assert.notEqual(r2.attemptNonce,r1.attemptNonce);await writeAtomic(join(directory,'desktop.grant.json'),identity(r2));await second;
 assert.equal(await readFile(join(directory,'phone4x.grant.json'),'utf8'),other);
}));
test('a timed-out wait writes honest unsampled failure and never runs a frame test',async()=>isolated(async directory=>{
 await assert.rejects(waitForFrameGrant({directory,profile:'phone4x',sourceSha256,timeoutMs:60}),/Timed out/);
 const closed=JSON.parse(await readFile(join(directory,'phone4x.closed.json'),'utf8'));assert.equal(closed.sampled,false);assert.equal(closed.passed,false);assert.equal(closed.profile,'phone4x');
}));
