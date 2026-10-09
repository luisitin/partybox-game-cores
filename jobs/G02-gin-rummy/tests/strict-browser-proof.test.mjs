import {test} from 'node:test';
import assert from 'node:assert/strict';
import {browserSourcePaths} from '../scripts/browser-source-guard.mjs';
import {verifyStrictBrowserProof,frameStatistics} from '../scripts/strict-browser-proof.mjs';

// Deliberately synthetic controls: these never create a claimed browser report,
// raw evidence file, or production video. Real acceptance uses disk-loaded proof.
const synthetic=()=>{
 const sources=Object.fromEntries(browserSourcePaths.map(path=>[path,'a'.repeat(64)]));
 const witness=()=>({phase:'draw',cardCount:10,tableVisible:true,setupHidden:true,privateVisible:true,handoffHidden:true,
  pauseButton:'Pause',clockHidden:true,turnSeconds:0,drawStockEnabled:true,drawDiscardEnabled:true,nativeNowMs:0});
 const raw={},rows=[];
 for(const [i,[profile,width,height,rate]] of [['desktop',1920,1080,1],['phone4x',390,844,4]].entries()){
  const timestamps=Array.from({length:601},(_,j)=>j*16.5),frames=timestamps.slice(1).map((x,j)=>x-timestamps[j]);
  const attemptNonce=i===0?'00000000-0000-4000-8000-000000000000':'11111111-1111-4111-8111-111111111111';
  const stats=frameStatistics(frames),viewport={width,height};
  raw[profile]={profile,sourceSha256:sources['play.html'],runId:'synthetic-control',attemptNonce,viewport,cpuThrottle:rate,
   sourceStart:structuredClone(sources),sourceAfterSample:structuredClone(sources),transport:'file:',rawFiltering:'none',performanceWhileRecording:false,
   nativeClock:{requestAnimationFrame:true,performanceNow:true},timestamps,frames,witnesses:timestamps.map(time=>({...witness(),nativeNowMs:time})),
   beforeGrant:witness(),afterGrant:witness(),afterSample:{...witness(),nativeNowMs:10000},...stats};
  rows.push({label:profile,viewport,cpuThrottle:rate,sourceSha256:sources['play.html'],attemptNonce,frames:[...frames],...stats,
   frameGatePassed:true,networkRequests:0,pageErrors:0,interactionChecks:17,reducedMotion:{matches:true,transform:'none',animation:'none'},
   frameWindow:{profile,sourceSha256:sources['play.html'],attemptNonce,status:'samples-written',rawIntervals:600,coordination:'uncoordinated'}});
 }
 const captures={sourceStart:structuredClone(sources),sourceEnd:structuredClone(sources),sourceUnchanged:true,htmlSha256:sources['play.html'],performanceMeasurement:false,
  rows:rows.map((row,i)=>({path:`media/synthetic-${row.label}.webm`,bytes:100,sha256:'b'.repeat(64),cpuThrottle:row.cpuThrottle,viewport:row.viewport,
   performanceMeasurement:false,newMatchPrivateDomCleared:true,actualElapsedTimeoutCoveredHand:true,publicPassHistoryShown:true,networkRequests:0,pageErrors:0}))};
 return {sources,raw,captures,media:[{bytes:100,sha256:'b'.repeat(64)},{bytes:100,sha256:'b'.repeat(64)}],
  report:{runId:'synthetic-control',sourceStart:structuredClone(sources),sourceEnd:structuredClone(sources),sourceUnchanged:true,passed:true,failure:null,
   htmlSha256:sources['play.html'],performanceWhileRecording:false,physicalPhoneTested:false,rows}};
};
test('synthetic positive control covers full identities, native timestamps, all hand witnesses and clips',()=>{
 assert.equal(verifyStrictBrowserProof(synthetic()).rawIntervals,1200);
});
test('every guarded source and each start/end inventory entry rejects a stale hash or omission',()=>{
 let rejected=0;
 for(const path of browserSourcePaths)for(const mutate of [
  p=>{p.sources[path]='0'.repeat(64);},p=>{delete p.report.sourceStart[path];},p=>{p.report.sourceEnd[path]='0'.repeat(64);},
  p=>{p.raw.desktop.sourceAfterSample[path]='0'.repeat(64);},p=>{p.captures.sourceStart[path]='0'.repeat(64);}]){
   const p=synthetic();mutate(p);assert.throws(()=>verifyStrictBrowserProof(p));rejected++;
  }
 console.log(JSON.stringify({syntheticGuardCorruptionsRejected:rejected,guardedSources:browserSourcePaths.length}));
});
test('wrong attempt/profile/page/transport/throttle, filtered samples and fake native clocks fail',()=>{
 const changes=[p=>p.raw.desktop.attemptNonce=p.raw.phone4x.attemptNonce,p=>p.raw.desktop.profile='phone4x',
  p=>p.raw.desktop.sourceSha256='0'.repeat(64),p=>p.raw.desktop.runId='old',p=>p.raw.desktop.transport='http:',
  p=>p.raw.phone4x.cpuThrottle=1,p=>p.raw.desktop.rawFiltering='trimmed',p=>p.raw.desktop.performanceWhileRecording=true,
  p=>p.raw.desktop.nativeClock.requestAnimationFrame=false,p=>p.raw.desktop.nativeClock.performanceNow=false,
  p=>p.report.rows[0].frameWindow.attemptNonce='old',p=>p.report.rows[0].frameWindow.coordination='root-granted'];
 for(const mutate of changes){const p=synthetic();mutate(p);assert.throws(()=>verifyStrictBrowserProof(p));}
});
test('missing/invalid timestamp, raw interval or active-frame witness fails despite good summaries',()=>{
 const changes=[p=>p.raw.desktop.frames.pop(),p=>p.raw.desktop.timestamps.shift(),p=>p.raw.desktop.timestamps[300]+=1,
  p=>p.raw.desktop.frames[20]=null,p=>p.raw.desktop.witnesses.pop(),p=>p.raw.desktop.witnesses[0].phase='done',
  p=>p.raw.desktop.witnesses[300].cardCount=0,p=>p.raw.desktop.witnesses[600].privateVisible=false,
  p=>p.raw.desktop.beforeGrant.turnSeconds=10,p=>p.raw.desktop.afterGrant.pauseButton='Resume',
  p=>p.raw.desktop.afterSample.clockHidden=false,p=>p.raw.desktop.witnesses[600].drawStockEnabled=false,
  p=>p.raw.desktop.witnesses[300].nativeNowMs=-1];
 for(const mutate of changes){const p=synthetic();mutate(p);assert.throws(()=>verifyStrictBrowserProof(p));}
});
test('all statistics are recomputed and an honestly reported long interval fails the fixed gate',()=>{
 for(const key of ['meanMs','p99Ms','maxMs','fps']){
  const p=synthetic();p.raw.desktop[key]+=1;p.report.rows[0][key]+=1;assert.throws(()=>verifyStrictBrowserProof(p));
 }
 const p=synthetic();for(let j=1;j<601;j++)p.raw.desktop.timestamps[j]+=1000;
 const s=p.raw.desktop;s.frames=s.timestamps.slice(1).map((x,j)=>x-s.timestamps[j]);p.report.rows[0].frames=[...s.frames];
 Object.assign(s,frameStatistics(s.frames));Object.assign(p.report.rows[0],frameStatistics(s.frames));
 assert.throws(()=>verifyStrictBrowserProof(p),/strict raw frame gate/);
});
test('failed runs, mislabeled clips, altered bytes, outsize media and network/errors are rejected',()=>{
 const changes=[p=>p.report.passed=false,p=>p.report.failure='old failure',p=>p.report.rows[0].networkRequests=1,
  p=>p.report.rows[1].pageErrors=1,p=>p.media[0].bytes+=1,p=>p.media[0].sha256='0'.repeat(64),
  p=>{p.media[0].bytes=10*1024*1024;p.captures.rows[0].bytes=p.media[0].bytes;},
  p=>p.captures.rows[0].performanceMeasurement=true,p=>p.captures.rows[1].networkRequests=1,
  p=>p.captures.rows[1].viewport.width=1920,p=>p.captures.rows[0].publicPassHistoryShown=false];
 for(const mutate of changes){const p=synthetic();mutate(p);assert.throws(()=>verifyStrictBrowserProof(p));}
});
