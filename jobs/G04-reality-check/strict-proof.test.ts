import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {strictSourceHashes,strictRuntimeIdentity,type Hashes} from './strict-source-guard.ts';
import {matchesGrant,awaitStrictGrant,closeStrictWindow,type Identity} from './strict-coordination.ts';
import {verifyStrictProfile,strictFrameStatistics,type Raw,type Witness} from './strict-browser-proof.ts';

test('exact per-attempt grant rejects stale nonce, source, profile, malformed and extra fields',()=>{
 const identity:Identity={profile:'tv',sourceSha256:'a'.repeat(64),attemptNonce:randomUUID()};
 assert(matchesGrant({...identity},identity));
 for(const value of [null,[],{},identity.attemptNonce,{...identity,profile:'phone'},{...identity,sourceSha256:'b'.repeat(64)},{...identity,attemptNonce:randomUUID()},{...identity,utc:new Date().toISOString()},{profile:identity.profile,sourceSha256:identity.sourceSha256}])assert.equal(matchesGrant(value,identity),false);
});
test('actual asynchronous barrier consumes only this READY nonce and closes its own receipt',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'G04-grant-control-')),old=process.env.G04_STRICT_FRAME_BARRIER_DIR;
 process.env.G04_STRICT_FRAME_BARRIER_DIR=directory;
 try{
  const pending=awaitStrictGrant('tv','a'.repeat(64),{fixture:'synthetic coordination control'},3000);
  const ready=JSON.parse(readFileSync(join(directory,'tv-ready.json'),'utf8')) as Identity;
  writeFileSync(join(directory,'tv-grant.json'),JSON.stringify({...ready,attemptNonce:randomUUID()}));
  const actual={profile:ready.profile,sourceSha256:ready.sourceSha256,attemptNonce:ready.attemptNonce};
  const timer=setTimeout(()=>writeFileSync(join(directory,'tv-grant.json'),JSON.stringify(actual)),200);
  const window=await pending;clearTimeout(timer);assert.equal(window.attemptNonce,ready.attemptNonce);assert.equal(window.coordination,'root-granted');
  closeStrictWindow(window,{status:'control-only',rawIntervals:0});
  const closed=JSON.parse(readFileSync(join(directory,'tv-closed.json'),'utf8'));assert.equal(closed.attemptNonce,ready.attemptNonce);assert.equal(closed.status,'control-only');
 }finally{if(old===undefined)delete process.env.G04_STRICT_FRAME_BARRIER_DIR;else process.env.G04_STRICT_FRAME_BARRIER_DIR=old;rmSync(directory,{recursive:true,force:true});}
});
test('independent acceptance refuses filtered, truncated, stale, inactive, frozen-time and miscomputed proof',()=>{
 // Deliberately synthetic positive/control data. It tests refusal logic and is
 // never written to actual native evidence or accepted as a screen measurement.
 const sources:Hashes={'play.html':'a'.repeat(64)},runtime=strictRuntimeIdentity(),step=1000/60,wall=Date.parse('2026-10-08T20:00:00Z');
 const w=(n:number):Witness=>({nativeNowMs:n*step,wallUtcMs:wall+n*step,phase:'write',setupHidden:true,matchHidden:false,pauseButton:'Pause',privateOpen:'true',inputCount:1,fakeValue:'My harbour bluff',fakeDisabled:false,countdown:(40-Math.floor(n*step/1000))+' s',controllerCountdown:(40-Math.floor(n*step/1000))+' s',question:'Synthetic fixture only',received:Math.min(7,Math.floor(n/20))});
 const timestamps=Array.from({length:601},(_,i)=>i*step),intervals=timestamps.slice(1).map((n,i)=>n-timestamps[i]!);
 const raw:Raw={runId:randomUUID(),profile:'tv',attemptNonce:randomUUID(),sourceSha256:sources['play.html']!,viewport:{width:1920,height:1080},cpuThrottle:1,transport:'file:',rawFiltering:'none',performanceWhileRecording:false,nativeClock:{requestAnimationFrame:true,performanceNow:true,dateNow:true,setTimeout:true,setInterval:true},timestamps,intervals,witnesses:timestamps.map((_,i)=>w(i)),beforeGrant:{...w(0),pauseButton:'Resume',countdown:'Paused',privateOpen:'false',inputCount:0},afterGrant:w(0),afterSample:w(601),sourceStart:sources,sourceAfterSample:sources,runtimeIdentity:runtime,window:null,errors:[],externalRequests:[],...strictFrameStatistics(intervals)};
 raw.window={profile:'tv',sourceSha256:raw.sourceSha256,attemptNonce:raw.attemptNonce,coordination:'uncoordinated',readyUtc:null,grantUtc:null,status:'samples-written',rawIntervals:600,utc:new Date().toISOString()};
 verifyStrictProfile(raw,sources,runtime);
 const corruptions:Record<string,(copy:Raw)=>void>={
  'truncated intervals':c=>{c.intervals.pop();},'truncated timestamps':c=>{c.timestamps.pop();},'truncated witnesses':c=>{c.witnesses.pop();},'filtered samples':c=>{c.rawFiltering='outliers removed';},
  'stale source':c=>{c.sourceAfterSample['play.html']='b'.repeat(64);},'loaded dependency change':c=>{c.runtimeIdentity.zodModuleSha256='0'.repeat(64);},'fake RAF':c=>{c.nativeClock.requestAnimationFrame=false;},'held Date':c=>{c.nativeClock.dateNow=false;},'wrong timestamp interval':c=>{c.timestamps[22]!+=1;},'wrong mean':c=>{c.fps+=1;},'expired phase':c=>{c.witnesses[24]!.phase='reveal';},'covered controller':c=>{c.witnesses[24]!.inputCount=0;},'expired timer':c=>{c.witnesses[24]!.countdown='0 s';},'paused sample':c=>{c.witnesses[24]!.pauseButton='Resume';},'frozen elapsed time':c=>{c.afterSample.nativeNowMs=100;},'frozen countdown':c=>{c.afterSample.countdown='40 s';c.afterSample.controllerCountdown='40 s';},'no remaining bot workload':c=>{c.afterGrant.received=7;},'bot callbacks absent':c=>{c.afterSample.received=0;},'phone throttle false':c=>{c.profile='phone';},'network':c=>{c.externalRequests.push('https://example.invalid/');},'page error':c=>{c.errors.push('fixture error');},'stale closure':c=>{c.window!.attemptNonce=randomUUID();}
 };
 for(const [name,change]of Object.entries(corruptions)){const copy=structuredClone(raw);change(copy);assert.throws(()=>verifyStrictProfile(copy,sources,runtime),name+' must be rejected');}
 assert.equal(Object.keys(corruptions).length,22);
});
test('every loaded local checker, schema and pinned runtime identity belongs to current source guards',()=>{
 const hashes=strictSourceHashes(),runtime=strictRuntimeIdentity();
 for(const name of ['strict-browser.ts','strict-browser-proof.ts','strict-source-guard.ts','strict-coordination.ts','strict-decode.ts','strict-proof.test.ts','browser.ts','browser-proof.ts','late-input.ts','host-deadline-mutation.ts','preflight.ts','../../contract/minigame-schema.ts','../../contract/player-count-schema.ts','../../contract/constants.ts',runtime.zodModule])assert.match(hashes[name]!,/^[a-f0-9]{64}$/);
 assert.equal(hashes[runtime.zodModule],runtime.zodModuleSha256);assert(Object.keys(hashes).some(n=>n.startsWith('../../contract/node_modules/zod/')));
});
