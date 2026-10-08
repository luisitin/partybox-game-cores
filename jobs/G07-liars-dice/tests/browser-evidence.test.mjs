import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {readReportAndRaw,readSourceGuards,validateBrowserEvidence,validateHistoricalBrowserEvidence,LEGACY_RUNNER_SHA256} from '../scripts/browser-evidence.mjs';

// Positive timestamps are genuine retained browser measurements. Corruption
// controls alter only copies, which must fail; no synthetic positive frames.
const historical=await readReportAndRaw('evidence/browser/historical-runner-f8a8d602/report.json');
const expected={'play.html':historical.report.htmlSha256,'dist/core.mjs':historical.report.coreModuleSha256,'dist/session.mjs':historical.report.sessionModuleSha256};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const changeBothWorkloads=mutate=>(report,raw)=>{
  mutate(report.profiles.find(p=>p.label==='desktop').workload);
  mutate(raw.desktop.workload);
};
test('historical positive is bound to the actual identified old runner',async()=>{
  assert.equal(sha(await readFile('evidence/browser/historical-runner-f8a8d602/browser-check.observed.txt')),LEGACY_RUNNER_SHA256);
  const result=validateHistoricalBrowserEvidence(historical.report,historical.raw,expected,LEGACY_RUNNER_SHA256);
  assert.equal(result.rawIntervals,1200);assert.equal(result.checks,94);assert.equal(result.sourceGuards,3);
});
test('current validator refuses the historical report without current guards',()=>{
  assert.throws(()=>validateBrowserEvidence(historical.report,historical.raw,expected));
});
test('historical validation refuses a different runner identity',()=>{
  assert.throws(()=>validateHistoricalBrowserEvidence(historical.report,historical.raw,expected,'0'.repeat(64)));
});
const cases=[
 ['empty profiles',r=>r.profiles=[]],['desktop only',r=>r.profiles.pop()],
 ['duplicate desktop',r=>r.profiles[1]=structuredClone(r.profiles[0])],
 ['wrong phone CPU',r=>r.profiles[1].cpuThrottle=1],['wrong phone width',r=>r.profiles[1].width=1920],
 ['wrong phone height',r=>r.profiles[1].height=1080],['wrong phone label',r=>r.profiles[1].label='phone'],
 ['partial functional scope',r=>r.scope='functional-only'],['partial performance scope',r=>r.scope='performance-only'],
 ['failed report',r=>r.passed=false],['missing checks',r=>delete r.checks],
 ['missing one functional check',r=>r.checks.splice(0,1)],
 ['duplicated functional name',r=>r.checks[0].name=r.checks[1].name],
 ['wrong check profile',r=>r.checks[0].profile='phone4x'],
 ['failed check hidden behind report pass',r=>r.checks[0].passed=false],
 ['error hidden behind successful check',r=>r.checks[0].error='actual error'],
 ['wrong page source',r=>r.htmlSha256='0'.repeat(64)],
 ['wrong core bundle',r=>r.coreModuleSha256='0'.repeat(64)],
 ['wrong session bundle',r=>r.sessionModuleSha256='0'.repeat(64)],
 ['source changed after run',r=>r.checks.find(c=>c.profile==='runner').finalHtmlSha256='0'.repeat(64)],
 ['browser identity absent',r=>r.browser=''],['invalid run ID',r=>r.runId='old'],
 ['wrong benchmark players',r=>r.benchmark.players=2],['wrong existing bid',r=>r.benchmark.existingBid.face=6],
 ['closed private dice',r=>r.benchmark.openPrivateDice=0],['different interaction',r=>r.benchmark.interaction='idle'],
 ['changed seed',r=>r.seed=1],['claimed physical phone',r=>r.physicalPhoneTested=true],
 ['recorded performance',r=>r.performanceWhileRecording=true],
 ['relaxed FPS gate',r=>r.performanceRequirements.minimumMeanFps=55],
 ['relaxed p99 gate',r=>r.performanceRequirements.maximumP99Ms=18],
 ['hidden frame filtering',r=>r.frameFiltering='discard warm-up'],
 ['wrong raw profile',(_,raw)=>raw.phone4x.label='desktop'],
 ['raw CPU mismatch',(_,raw)=>raw.phone4x.cpuThrottle=1],
 ['missing raw phone',(_,raw)=>delete raw.phone4x],
 ['extra raw profile',(_,raw)=>raw.extra=structuredClone(raw.desktop)],
 ['raw recorded video',(_,raw)=>raw.desktop.recordedVideo=true],
 ['raw filtered intervals',(_,raw)=>raw.desktop.filtering='trimmed'],
 ['truncated timestamps',(_,raw)=>raw.desktop.timestampsMs.pop()],
 ['truncated intervals',(_,raw)=>raw.desktop.intervalsMs.pop()],
 ['wrong sample count',(_,raw)=>raw.phone4x.sampleCount=599],
 ['nonfinite timestamp',(_,raw)=>raw.desktop.timestampsMs[5]=NaN],
 ['nonfinite interval',(_,raw)=>raw.desktop.intervalsMs[5]=Infinity],
 ['zero interval',(_,raw)=>raw.desktop.intervalsMs[5]=0],
 ['negative interval',(_,raw)=>raw.desktop.intervalsMs[5]=-1],
 ['changed consecutive timestamp',(_,raw)=>raw.desktop.timestampsMs[5]+=1],
 ['raw mean differs from frames',(_,raw)=>raw.desktop.meanMs+=1],
 ['report FPS differs from frames',r=>r.profiles[0].fps+=1],
 ['report p99 differs from frames',r=>r.profiles[1].p99Ms+=1],
 ['raw dropped count differs',(_,raw)=>raw.phone4x.droppedIntervalsOver17Ms+=1],
 ['wrong raw file path',r=>r.profiles[0].frameFile='../desktop-frames.json'],
 ['wrong archived run',r=>r.profiles[1].archivedFrameFile='runs/stale/phone4x-frames.json'],
 ...['networkRequests','additionalResources','pageErrors','dialogs'].map(key=>[
   'late '+key+' hidden behind offline pass',r=>r.checks.find(c=>c.profile==='desktop'&&c.name.startsWith('self-contained'))[key]=['unexpected']]),
];
for(const [name,corrupt] of cases)test('reject '+name,()=>{
  const {report,raw}=structuredClone(historical);corrupt(report,raw);
  assert.throws(()=>validateHistoricalBrowserEvidence(report,raw,expected,LEGACY_RUNNER_SHA256));
});
if(process.env.G07_CURRENT_BROWSER_REPORT){
 const current=await readReportAndRaw(resolve(process.env.G07_CURRENT_BROWSER_REPORT)),guards=await readSourceGuards();
 test('current positive uses actual fresh report and actual guarded source bytes',()=>{
  const result=validateBrowserEvidence(current.report,current.raw,guards);assert.equal(result.rawIntervals,1200);assert.equal(result.sourceGuards,Object.keys(guards).length);
 });
 for(const [name,corrupt] of [
  ['missing start guard',r=>delete r.sourceGuardHashes['scripts/browser-check.mjs']],
  ['wrong final checker guard',r=>r.sourceGuardHashesAfter['scripts/browser-evidence.mjs']='0'.repeat(64)],
  ['wrong raw source guard',(_,raw)=>raw.phone4x.sourceGuardHashes['src/core.ts']='0'.repeat(64)],
  ['wrong raw final guard',(_,raw)=>raw.desktop.sourceGuardHashesAfter['play.html']='0'.repeat(64)],
  ['raw run identity',(_,raw)=>raw.phone4x.runId='20000101000000000'],
  ['raw page identity',(_,raw)=>raw.desktop.htmlSha256='0'.repeat(64)],
  ['wrong start timestamp',r=>r.startedAt='2000-01-01T00:00:00.000Z'],
  ['completion before start',r=>r.finishedAt='2000-01-01T00:00:00.000Z'],
  ['missing actual clock observations',r=>delete r.clockObservations],
  ['duplicated clock observation',r=>r.clockObservations[1]=structuredClone(r.clockObservations[0])],
  ['untrusted Resume click',r=>r.clockObservations[0].eventTrusted=false],
  ['post-clock before click',r=>r.clockObservations[0].clickHostAfter=r.clockObservations[0].clickHostBefore-1],
  ['wrong resumed deadline',r=>r.clockObservations[0].afterDeadline+=600],
  ['relaxed live-clock allowance',r=>r.clockObservations[0].limitMs=500],
  ['saved clock did not genuinely elapse',r=>r.clockObservations.find(o=>o.kind==='saved-resume').elapsedBeforeCheckpointMs=0],
  ['nonfinite saved elapsed',r=>r.clockObservations.find(o=>o.kind==='saved-resume').elapsedBeforeCheckpointMs=Infinity],
  ['inconsistent saved duration',r=>r.clockObservations.find(o=>o.kind==='saved-resume').elapsedBeforeCheckpointMs+=50],
  ['reset-to-full saved turn',r=>{const o=r.clockObservations.find(o=>o.kind==='saved-resume');o.afterDeadline=o.clickHostBefore+3000;}],
  ['relaxed saved-clock allowance',r=>r.clockObservations.find(o=>o.kind==='saved-resume').limitMs=600],
  ['missing actual sampling workload',(_,raw)=>delete raw.desktop.workload],
  ['sampling fixture already finished',changeBothWorkloads(w=>{for(const o of Object.values(w))o.phase='done';})],
  ['sampling fixture timer enabled',changeBothWorkloads(w=>{for(const o of Object.values(w))o.turnSeconds=1;})],
  ['sampling fixture deadline changed',changeBothWorkloads(w=>{for(const o of Object.values(w))o.deadline=1000;})],
  ['sampling fixture cup closed',changeBothWorkloads(w=>{for(const o of Object.values(w))o.openPrivateDice=0;})],
  ['sampling fixture exact odds absent',changeBothWorkloads(w=>{for(const o of Object.values(w))o.oddsAvailable=false;})],
  ['sampling fixture bid changed',changeBothWorkloads(w=>{for(const o of Object.values(w))o.bid.quantity=9;})],
  ['sampling fixture lost dice',changeBothWorkloads(w=>{for(const o of Object.values(w))o.totalDice=39;})],
  ['sampling fixture state changed during grant',changeBothWorkloads(w=>w.atStart.stateSha256='0'.repeat(64))],
 ])test('current reject '+name,()=>{const {report,raw}=structuredClone(current);corrupt(report,raw);assert.throws(()=>validateBrowserEvidence(report,raw,guards));});
}
