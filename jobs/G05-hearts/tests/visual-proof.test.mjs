import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {guardedFiles,functionalFlags,sourceHashes,validateReport,validateFrames,validateCapture} from '../scripts/check-visual.mjs';
// Synthetic checker unit data only: these tests never assert that a browser was measured.
const sources=Object.fromEntries(guardedFiles.map(p=>[p,'0'.repeat(64)]));
const profile=(width,height,cpu)=>({width,height,cpu,warmupFrames:60,interaction:'17-card private pass selection at10Hz; retained card controls',frames:600,rawIntervals:Array(600).fill(1000/60),meanMs:1000/60,p95Ms:1000/60,p99Ms:1000/60,maxMs:1000/60,fps:60,overflow:false});
const fixture=()=>({chrome:'checker-unit-not-measured',kind:'full',passed:true,schemaVersion:1,runId:'checker-unit-only',startedAt:'2026-10-08T00:00:00Z',completedAt:'2026-10-08T00:01:00Z',fileOpened:true,serving:'disk',sourceStart:structuredClone(sources),sourceEnd:structuredClone(sources),externalRequests:0,runtimeExceptions:0,completedPlayerCounts:[3,4,5,6],minimumTapHeight:44,controlBoundaryContrast:3,footerContrast:4.5,...Object.fromEntries(functionalFlags.map(p=>[p,true])),desktop:profile(1920,1080,1),phone:profile(390,844,4),videoPath:'media/checker-unit-only.webm',videoSha256:'0'.repeat(64),videoBytes:1});
const validate=r=>validateReport(r,{sources,checkVideo:false});
test('visual proof independently recomputes all600intervals and rejects corrupt evidence (unit-only)',()=>{
 assert.equal(validate(fixture()).rawFrames,1200);
 const changes=[r=>delete r.sourceStart['play.html'],r=>r.sourceEnd['play.html']='1'.repeat(64),r=>r.kind='history',r=>r.passed=false,r=>r.fileOpened=false,r=>r.serving='localhost',r=>r.phone.rawIntervals.pop(),r=>r.phone.frames=599,r=>r.phone.rawIntervals[0]=NaN,r=>r.phone.rawIntervals[0]=0,r=>r.phone.meanMs+=.001,r=>r.phone.fps=61,r=>r.phone.p95Ms=17,r=>r.phone.p99Ms=17,r=>r.phone.maxMs=17,r=>r.phone.width=391,r=>r.phone.cpu=1,r=>r.phone.overflow=true,r=>r.runtimeExceptions=1,r=>r.externalRequests=1,r=>r.passing=false,r=>r.completedPlayerCounts=[3,4,5],r=>r.videoSha256='missing',r=>r.videoBytes=10_000_000,r=>r.videoPath='../old.webm'];
 for(const [i,mutate]of changes.entries()){const r=fixture();mutate(r);assert.throws(()=>validate(r),'corruption '+i);}
 const slow=profile(390,844,4);Object.assign(slow,{rawIntervals:Array(600).fill(20),meanMs:20,p95Ms:20,p99Ms:20,maxMs:20,fps:50});assert.throws(()=>validateFrames(slow,390,844,4),/below59/);
 const tail=profile(390,844,4);tail.rawIntervals.fill(18.1,569);const sorted=[...tail.rawIntervals].sort((a,b)=>a-b),mean=sorted.reduce((a,b)=>a+b,0)/600;Object.assign(tail,{meanMs:mean,fps:1000/mean,p95Ms:sorted[570],p99Ms:sorted[594],maxMs:sorted[599]});assert.throws(()=>validateFrames(tail,390,844,4),/p95 above18/);
});
test('latest failed-attempt marker cannot reuse a prior passing same-source report',()=>{
 const r=fixture();assert.throws(()=>validateReport(r,{sources,checkVideo:false,currentRun:{runId:'later-failed-run',sourceStart:sources}}),/latest attempt/);
});
test('original summary-only Hearts report remains historical, never current acceptance',()=>{
 const original=JSON.parse(readFileSync('media/visual-measurements-ci-37743752330.json','utf8'));assert.throws(()=>validate(original),/historical\/partial/);
});

test('capture-only verifier rejects byte/SHA/missing mismatches against a genuine inherited clip (not current browser acceptance)',()=>{
 const videoPath='media/milestone-11.webm',bytes=readFileSync(videoPath),report={videoPath,videoBytes:bytes.length,videoSha256:createHash('sha256').update(bytes).digest('hex')};assert.equal(validateCapture(report),true);
 assert.throws(()=>validateCapture({...report,videoBytes:report.videoBytes+1}),/byte mismatch/);assert.throws(()=>validateCapture({...report,videoSha256:'1'.repeat(64)}),/SHA mismatch/);assert.throws(()=>validateCapture({...report,videoPath:'media/nonexistent-checker-only.webm'}),/capture missing/);
});

test('actual harmless HTML edit invalidates a source-bound unit report and restores exact bytes',()=>{
 const original=readFileSync('play.html'),before=sourceHashes(),r=fixture();
 r.sourceStart=structuredClone(before);r.sourceEnd=structuredClone(before);
 assert.equal(validateReport(r,{sources:before,checkVideo:false}).accepted,true,'synthetic checker baseline only');
 try{
  writeFileSync('play.html',Buffer.concat([original,Buffer.from('\n<!-- G05 checker unit: harmless source-byte change -->\n')]));
  assert.notEqual(sourceHashes()['play.html'],before['play.html']);
  assert.throws(()=>validateReport(r,{checkVideo:false}),/stale\/missing start source guards/);
 }finally{writeFileSync('play.html',original);}
 assert.deepEqual(readFileSync('play.html'),original);
 assert.deepEqual(sourceHashes(),before,'all actual guarded files restored');
});

test('actual full-kind CI console summary without raw intervals remains metadata only',()=>{
 const summary=JSON.parse(readFileSync('media/visual-measurements-ci-37793907360.json','utf8'));
 assert.equal(summary.kind,'full');assert.equal(summary.passed,true);
 assert.equal(summary.desktop.frames,600);assert.equal(summary.phone.frames,600);
 assert.equal(Object.hasOwn(summary.desktop,'rawIntervals'),false);
 assert.equal(Object.hasOwn(summary.phone,'rawIntervals'),false);
 // Its historic hash snapshot isolates the missing-raw check; it is not current acceptance.
 assert.throws(()=>validateReport(summary,{sources:summary.sourceStart,checkVideo:false}),/raw intervals missing/);
});
