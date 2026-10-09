import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {performance} from 'node:perf_hooks';
import {setTimeout as delay} from 'node:timers/promises';
import {waitForFrameGrant,type FrameReady,type FrameProfile,type FrameGrant} from './frame-coordination.ts';

const source='a'.repeat(64);
const options=(directory:string,profile:FrameProfile='TV')=>({directory,profile,sourceSha256:source,timeoutMs:2000,pollMs:2});
async function temporary<T>(run:(directory:string)=>Promise<T>):Promise<T> {
 const directory=await mkdtemp(join(tmpdir(),'G06-frame-coordination-control-'));
 try {return await run(directory);}finally {await rm(directory,{recursive:true,force:true});}
}
async function readyFor(directory:string,profile:FrameProfile='TV',previousNonce?:string):Promise<FrameReady> {
 const limit=performance.now()+1000;
 for(;;) {
  try {const value=JSON.parse(await readFile(join(directory,`${profile}-ready.json`),'utf8')) as FrameReady;if(value.attemptNonce!==previousNonce)return value;}
  catch(error) {if(!(error!==null&&typeof error==='object'&&'code' in error&&error.code==='ENOENT'))throw error;}
  assert(performance.now()<limit,'control did not observe fresh READY');await delay(2);
 }
}
async function grantFile(directory:string,profile:FrameProfile,value:unknown) {
 const temporary=join(directory,`${profile}-${randomUUID()}.tmp`);
 await writeFile(temporary,JSON.stringify(value)+'\n');await rename(temporary,join(directory,`${profile}-grant.json`));
}
const matching=(ready:FrameReady):FrameGrant=>({profile:ready.profile,sourceSha256:ready.sourceSha256,attemptNonce:ready.attemptNonce});
function attempt(directory:string,profile:FrameProfile='TV') {
 const pending=waitForFrameGrant(options(directory,profile));
 // Attach immediately so expected fast rejection is never an unhandled rejection during the writer's await.
 const observed=pending.then(value=>({value,error:null as unknown}),error=>({value:null,error}));
 return {pending,observed};
}

test('a valid nonce-bound grant releases exactly its fresh READY and fixed frame gates',async()=>temporary(async directory=>{
 const running=attempt(directory),ready=await readyFor(directory);
 assert.match(ready.attemptNonce,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.equal(ready.profile,'TV');assert.equal(ready.sourceSha256,source);assert.equal(ready.frames,900);assert.equal(ready.meanFpsMinimum,59);assert.equal(ready.p95MsMaximum,18);assert(Number.isFinite(Date.parse(ready.readyAt)));
 await grantFile(directory,'TV',matching(ready));assert.deepEqual(await running.pending,ready);
}));

test('an old same-source grant and closed marker are cleared before fresh READY; other profile is preserved',async()=>temporary(async directory=>{
 const oldNonce=randomUUID();await grantFile(directory,'TV',{profile:'TV',sourceSha256:source,attemptNonce:oldNonce});
 await writeFile(join(directory,'TV-ready.json'),JSON.stringify({attemptNonce:oldNonce}));await writeFile(join(directory,'TV-closed.json'),'old closed marker');
 const other='preserve phone marker';await writeFile(join(directory,'phone-4x-grant.json'),other);
 const running=attempt(directory),ready=await readyFor(directory,'TV',oldNonce);
 assert.notEqual(ready.attemptNonce,oldNonce);assert(!existsSync(join(directory,'TV-grant.json')));assert(!existsSync(join(directory,'TV-closed.json')));assert.equal(await readFile(join(directory,'phone-4x-grant.json'),'utf8'),other);
 const early=await Promise.race([running.observed.then(()=>true),delay(15).then(()=>false)]);assert.equal(early,false,'stale grant must not release the next attempt');
 await grantFile(directory,'TV',matching(ready));assert.deepEqual(await running.pending,ready);
}));

test('a same-profile same-source old nonce replayed after READY is rejected',async()=>temporary(async directory=>{
 const running=attempt(directory),ready=await readyFor(directory);
 await grantFile(directory,'TV',{...matching(ready),attemptNonce:randomUUID()});await assert.rejects(running.pending,/nonce mismatch/);
}));

test('wrong profile cannot grant the current attempt',async()=>temporary(async directory=>{
 const running=attempt(directory),ready=await readyFor(directory);
 await grantFile(directory,'TV',{...matching(ready),profile:'phone-4x'});await assert.rejects(running.pending,/profile mismatch/);
}));

test('wrong source hash cannot grant the current nonce',async()=>temporary(async directory=>{
 const running=attempt(directory),ready=await readyFor(directory);
 await grantFile(directory,'TV',{...matching(ready),sourceSha256:'b'.repeat(64)});await assert.rejects(running.pending,/source hash mismatch/);
}));

test('malformed JSON and non-object grants are rejected',async()=>{
 await temporary(async directory=>{const running=attempt(directory);await readyFor(directory);await writeFile(join(directory,'TV-grant.json'),'{ malformed');await assert.rejects(running.pending,SyntaxError);});
 for(const invalid of [null,[],42])await temporary(async directory=>{const running=attempt(directory);await readyFor(directory);await grantFile(directory,'TV',invalid);await assert.rejects(running.pending,/grant object required/);});
});

test('legacy missing nonce and unexpected extra grant fields are rejected',async()=>{
 for(const extra of [false,true])await temporary(async directory=>{
  const running=attempt(directory),ready=await readyFor(directory);
  const invalid=extra?{...matching(ready),approved:true}:{profile:'TV',sourceSha256:source};await grantFile(directory,'TV',invalid);await assert.rejects(running.pending,/exact frame grant fields/);
 });
});

test('two sequential attempts for the same profile and source require different fresh valid grants',async()=>temporary(async directory=>{
 const first=attempt(directory),one=await readyFor(directory);await grantFile(directory,'TV',matching(one));assert.deepEqual(await first.pending,one);
 const second=attempt(directory),two=await readyFor(directory,'TV',one.attemptNonce);assert.notEqual(two.attemptNonce,one.attemptNonce);
 const early=await Promise.race([second.observed.then(()=>true),delay(15).then(()=>false)]);assert.equal(early,false,'prior valid grant must not release the next call');
 await grantFile(directory,'TV',matching(two));assert.deepEqual(await second.pending,two);
}));

test('missing grant times out without inventing acceptance and preserves fresh READY',async()=>temporary(async directory=>{
 const pending=waitForFrameGrant({...options(directory),timeoutMs:20});const rejected=assert.rejects(pending,/coordination timed out/);
 const ready=await readyFor(directory);await rejected;assert.equal(ready.profile,'TV');assert(!existsSync(join(directory,'TV-grant.json')));
}));
