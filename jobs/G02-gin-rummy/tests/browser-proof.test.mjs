import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadBrowserProof,verifyBrowserProof} from '../scripts/browser-proof.mjs';
const actual=await loadBrowserProof();
const fixture=()=>structuredClone(actual);
test('current source-bound raw proof passes without discarding its largest interval',()=>{
 assert.equal(actual.report.rows[0].maxMs,Math.max(...actual.raw.desktop.frames));
 assert.deepEqual(verifyBrowserProof(actual),{suite:'committed-browser-proof',sourceMatched:true,profiles:2,rawIntervals:1200,unfiltered:true,recordingsMatched:2});
});
test('a refreshed inventory cannot accept stale browser or recording source hashes',()=>{
 for(const where of ['sources','report','captures']){
  const p=fixture();if(where==='sources')p.sources['play.html']='0'.repeat(64);else p[where].sourceStart['play.html']='0'.repeat(64);
  assert.throws(()=>verifyBrowserProof(p),/stale source hashes/);
 }
});
test('changed end guards and failed snapshots are rejected',()=>{
 let p=fixture();p.report.sourceEnd['src/core.ts']='0'.repeat(64);assert.throws(()=>verifyBrowserProof(p),/end hashes/);
 p=fixture();p.report.passed=false;assert.throws(()=>verifyBrowserProof(p),/run failed/);
 p=fixture();p.report.rows[0].frameGatePassed=false;assert.throws(()=>verifyBrowserProof(p));
});
test('missing, altered and invalid raw intervals cannot be hidden by good summary fields',()=>{
 for(const change of [p=>p.raw.desktop.frames.pop(),p=>p.raw.desktop.frames[0]+=1,p=>p.raw.desktop.frames[0]=null]){
  const p=fixture();change(p);assert.throws(()=>verifyBrowserProof(p));
 }
});
test('reported statistics are recomputed from all retained intervals',()=>{
 for(const key of ['meanMs','p99Ms','maxMs','fps']){
  const p=fixture();p.raw.desktop[key]+=1;p.report.rows[0][key]+=1;
  assert.throws(()=>verifyBrowserProof(p),/retained interval/);
 }
});
test('an honestly recomputed slow raw sample still fails the original frame gate',()=>{
 const p=fixture();p.raw.desktop.frames[0]=1000;p.report.rows[0].frames=p.raw.desktop.frames;
 const values=p.raw.desktop.frames,ordered=[...values].sort((a,b)=>a-b),mean=values.reduce((a,b)=>a+b,0)/600;
 const stats={meanMs:mean,p99Ms:ordered[Math.floor(599*.99)],maxMs:ordered[599],fps:1000/mean};
 Object.assign(p.raw.desktop,stats);Object.assign(p.report.rows[0],stats);
 assert.throws(()=>verifyBrowserProof(p),/raw frame gate failed/);
});
test('profile dimensions, CPU rates and encoder separation must remain truthful',()=>{
 for(const change of [p=>p.report.rows[1].cpuThrottle=1,p=>p.report.rows[0].viewport.width=390,p=>p.report.performanceWhileRecording=true]){
  const p=fixture();change(p);assert.throws(()=>verifyBrowserProof(p));
 }
});
test('changed, oversized and falsely labeled recordings are rejected',()=>{
 for(const change of [p=>p.media[0].sha256='0'.repeat(64),p=>{p.captures.rows[0].bytes=10*1024*1024;p.media[0].bytes=10*1024*1024;},p=>p.captures.rows[1].performanceMeasurement=true]){
  const p=fixture();change(p);assert.throws(()=>verifyBrowserProof(p));
 }
});
