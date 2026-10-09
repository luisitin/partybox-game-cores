import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const GUARD_PATHS = Object.freeze([
  'play.html','manifest.json','src/core.ts','src/rules.ts','src/probability.ts',
  'src/session.ts','src/browser.ts','src/play.template.html','scripts/build.mjs',
  'scripts/browser-check.mjs','scripts/browser-evidence.mjs','scripts/frame-coordination.mjs',
  'scripts/clock-observation.mjs','scripts/clock-observation-diagnostic.mjs',
  'package.json','package-lock.json','evidence/browser/required-check-names.json',
  'scripts/integrity.mjs','tests/browser-evidence.test.mjs','tests/frame-coordination.test.mjs',
  '../../contract/constants.ts','../../contract/contract.ts','../../contract/minigame-schema.ts',
  '../../contract/rng.ts','../../contract/player-count-schema.ts','../../contract/package.json',
  'dist/core.mjs','dist/session.mjs','dist/probability.mjs','dist/rules.mjs','dist/contract.mjs',
  '../../.github/workflows/G07.yml',
]);
export const PROFILES = Object.freeze([
  Object.freeze({label:'desktop',width:1920,height:1080,cpuThrottle:1}),
  Object.freeze({label:'phone4x',width:390,height:844,cpuThrottle:4}),
]);
export const LEGACY_RUNNER_SHA256 = 'f8a8d602885ee9cd15a91860196a4841dd3ef21b310d319908c374bdd5bcba77';
const namesHash = 'a20ed00ea0f50ae799098520b71d7bf71474e50b0c87b7993c88296a341fa17d';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const namesBytes = await readFile(resolve(root,'evidence/browser/required-check-names.json'));
assert.equal(digest(namesBytes),namesHash,'original full functional check names changed');
const requiredNames = JSON.parse(namesBytes);

export async function readSourceGuards(directory = root) {
  return Object.fromEntries(await Promise.all(GUARD_PATHS.map(async file => [file,digest(await readFile(resolve(directory,file)))])));
}
function object(value, name) { assert(value !== null && typeof value === 'object' && !Array.isArray(value),name); }
function close(actual, expected, name) {
  assert(Number.isFinite(actual),name+' must be finite');
  assert(Math.abs(actual-expected)<1e-7,name+' differs from all raw intervals');
}
function guards(actual, expected, name) {
  object(actual,name); object(expected,name+' expected');
  assert.deepEqual(Object.keys(actual).sort(),[...GUARD_PATHS].sort(),name+' needs every exact source path');
  assert.deepEqual(Object.keys(expected).sort(),[...GUARD_PATHS].sort(),name+' expected path set');
  for(const path of GUARD_PATHS) {
    assert(/^[0-9a-f]{64}$/.test(actual[path]),name+' invalid SHA '+path);
    assert.equal(actual[path],expected[path],name+' changed source '+path);
  }
}
function validate(report, rawByProfile, expected, legacy) {
  object(report,'report'); object(rawByProfile,'raw map');
  assert.equal(report.passed,true,'full report must pass');
  assert.equal(report.scope,'full','partial runs are not acceptance');
  assert.equal(report.physicalPhoneTested,false,'phone is CPU4 emulation');
  assert.equal(report.performanceWhileRecording,false,'frame acceptance must not record video');
  assert.equal(report.frameFiltering,'none: all 600 consecutive requestAnimationFrame intervals retained');
  assert.deepEqual(report.performanceRequirements,{intervals:600,minimumMeanFps:59,maximumP99Ms:17});
  assert.equal(report.seed,7199);
  assert.deepEqual(report.benchmark,{players:8,existingBid:{quantity:8,face:3},openPrivateDice:5,
    interaction:'change quantity and face every 30 intervals, including exact controller odds',
    isolation:'fresh browser context; functional test navigation history is not retained'});
  assert.equal(report.htmlSha256,expected['play.html'],'report belongs to the actual page');
  assert.equal(report.coreModuleSha256,expected['dist/core.mjs'],'report core bundle');
  assert.equal(report.sessionModuleSha256,expected['dist/session.mjs'],'report session bundle');
  assert.equal(typeof report.browser,'string'); assert(report.browser.length>0);
  assert(/^\d{17}$/.test(report.runId),'run identity');
  assert(Array.isArray(report.profiles) && report.profiles.length===2,'exactly two profiles required');
  assert.deepEqual(report.profiles.map(p=>p.label),PROFILES.map(p=>p.label),'distinct ordered desktop/phone profiles');
  assert.deepEqual(Object.keys(rawByProfile).sort(),PROFILES.map(p=>p.label).sort(),'both exact raw profiles required');
  assert(Array.isArray(report.checks) && report.checks.length===94,'all94 original checks required');
  for(const [label, names] of Object.entries(requiredNames)) {
    const checks=report.checks.filter(check=>check.profile===label);
    assert.deepEqual(checks.map(check=>check.name).sort(),[...names].sort(),'exact full checks '+label);
    assert(checks.every(check=>check.passed===true && !check.error),'every check must pass '+label);
  }
  const sourceCheck=report.checks.find(check=>check.profile==='runner');
  for(const [start,end,expectedHash] of [
    ['initialHtmlSha256','finalHtmlSha256',expected['play.html']],
    ['initialCoreModuleSha256','finalCoreModuleSha256',expected['dist/core.mjs']],
    ['initialSessionModuleSha256','finalSessionModuleSha256',expected['dist/session.mjs']],
  ]) { assert.equal(sourceCheck[start],expectedHash); assert.equal(sourceCheck[end],expectedHash); }
  for(const profile of PROFILES) {
    const offline=report.checks.find(check=>check.profile===profile.label && check.name==='self-contained file works offline without network, external resources, errors or dialogs');
    for(const key of ['networkRequests','additionalResources','pageErrors','dialogs'])assert.deepEqual(offline[key],[],profile.label+' '+key);
  }
  if(legacy) {
    assert.equal(legacy.runnerSha256,LEGACY_RUNNER_SHA256,'only explicitly identified historical runner');
  } else {
    guards(report.sourceGuardHashes,expected,'start guards');
    guards(report.sourceGuardHashesAfter,expected,'finished guards');
    assert.equal(report.runId,report.startedAt.replace(/\D/g,''),'actual start/run ID');
    assert(Number.isFinite(Date.parse(report.startedAt)) && Number.isFinite(Date.parse(report.finishedAt)) && Date.parse(report.finishedAt)>=Date.parse(report.startedAt),'final completion timestamp');
    assert(Array.isArray(report.clockObservations)&&report.clockObservations.length===4,'four actual clock observations');
    for(const profile of PROFILES)for(const kind of ['pause-resume','saved-resume']) {
      const records=report.clockObservations.filter(o=>o.profile===profile.label&&o.kind===kind);
      assert.equal(records.length,1,'distinct actual clock observation '+profile.label+' '+kind);
      const o=records[0];assert.equal(o.eventTrusted,true);
      assert.equal(o.selector,kind==='pause-resume'?'#resume':'#resume-saved');
      for(const key of ['clickHostBefore','clickHostAfter','nativeBeforeMs','nativeAfterMs','nativeEventTimeStampMs','afterDeadline'])assert(Number.isFinite(o[key])&&o[key]>=0,'real click clock '+key);
      assert(o.clickHostAfter>=o.clickHostBefore&&o.nativeAfterMs>=o.nativeBeforeMs,'actual click task ordering');
      if(kind==='pause-resume') {
        assert.equal(o.limitMs,200);assert(Number.isFinite(o.beforeDeadline)&&Number.isFinite(o.pausedAt)&&o.clickHostBefore>=o.pausedAt);
        assert(Math.abs((o.afterDeadline-o.beforeDeadline)-(o.clickHostBefore-o.pausedAt))<200,'unchanged actual pause-clock criterion');
      } else {
        assert.equal(o.limitMs,250);assert.equal(o.fullClockMs,3000);
        assert(Number.isFinite(o.savedDeadline)&&Number.isFinite(o.savedHostNow)&&Number.isFinite(o.elapsedBeforeCheckpointMs)&&o.elapsedBeforeCheckpointMs>=600);
        const remaining=o.savedDeadline-o.savedHostNow;assert(remaining>0&&remaining<=2400,'genuine clock consumption before checkpoint');
        assert(Math.abs(remaining+o.elapsedBeforeCheckpointMs-3000)<1e-7,'actual original three-second saved fixture');
        assert(Math.abs((o.afterDeadline-o.clickHostBefore)-remaining)<250,'unchanged actual saved-clock criterion');
      }
    }
  }
  const metrics=[];
  for(const profile of PROFILES) {
    const row=report.profiles.find(p=>p.label===profile.label), raw=rawByProfile[profile.label];
    object(raw,profile.label+' raw');
    for(const [key,value] of Object.entries(profile)) {
      assert.equal(row[key],value,'reported profile '+key); assert.equal(raw[key],value,'raw profile '+key);
    }
    assert.equal(row.frameFile,profile.label+'-frames.json');
    assert.equal(row.archivedFrameFile,'runs/'+report.htmlSha256+'/'+report.runId+'/'+row.frameFile);
    assert.equal(row.sampleCount,600); assert.equal(raw.sampleCount,600);
    assert.equal(raw.filtering,'none'); assert.equal(raw.recordedVideo,false);
    assert(Array.isArray(raw.timestampsMs) && raw.timestampsMs.length===601,'all601 timestamps required');
    assert(Array.isArray(raw.intervalsMs) && raw.intervalsMs.length===600,'all600 intervals required');
    assert(raw.timestampsMs.every(time=>Number.isFinite(time)&&time>=0),'finite timestamps');
    assert(raw.intervalsMs.every(ms=>Number.isFinite(ms)&&ms>0),'positive unfiltered intervals');
    for(let i=0;i<600;i++)close(raw.intervalsMs[i],raw.timestampsMs[i+1]-raw.timestampsMs[i],'consecutive interval'+i);
    const total=raw.intervalsMs.reduce((sum,ms)=>sum+ms,0), sorted=[...raw.intervalsMs].sort((a,b)=>a-b);
    const values={totalMs:total,meanMs:total/600,fps:600000/total,p99Ms:sorted[Math.ceil(600*.99)-1],maxMs:sorted.at(-1),droppedIntervalsOver17Ms:raw.intervalsMs.filter(ms=>ms>17).length};
    for(const [key,value] of Object.entries(values)) { close(raw[key],value,'raw '+key); close(row[key],value,'report '+key); }
    assert(values.fps>=59 && values.p99Ms<=17,'unchanged strict refresh gate '+profile.label);
    if(!legacy) {
      assert.equal(raw.runId,report.runId,'raw run identity');
      assert.equal(raw.htmlSha256,report.htmlSha256,'raw page identity');
      object(raw.workload,'actual sampled workload');assert.deepEqual(row.workload,raw.workload);
      assert.deepEqual(Object.keys(raw.workload).sort(),['atEnd','atStart','beforeReady']);
      for(const observation of Object.values(raw.workload)) {
        object(observation,'actual benchmark boundary');
        assert.equal(observation.phase,'bid');assert.equal(observation.deadline,null);assert.equal(observation.turnSeconds,0);
        assert.equal(observation.players,8);assert.equal(observation.totalDice,40);assert.equal(observation.openPrivateDice,5);
        assert.deepEqual(observation.bid,{quantity:8,face:3});assert.equal(observation.oddsAvailable,true);
        assert(/^[0-9a-f]{64}$/.test(observation.stateSha256),'actual benchmark state digest');
      }
      assert.deepEqual(raw.workload.beforeReady,raw.workload.atStart,'grant wait preserves the original fixture');
      assert.deepEqual(raw.workload.atStart,raw.workload.atEnd,'sample preserves the original fixture');
      guards(raw.sourceGuardHashes,expected,'raw start guards '+profile.label);
      guards(raw.sourceGuardHashesAfter,expected,'raw finished guards '+profile.label);
    }
    metrics.push({profile:profile.label,intervals:600,fps:values.fps,p99Ms:values.p99Ms,maxMs:values.maxMs});
  }
  return {passed:true,scope:legacy?'historical runner '+LEGACY_RUNNER_SHA256:'current complete acceptance',checks:94,sourceGuards:legacy?3:GUARD_PATHS.length,rawIntervals:1200,metrics};
}
export function validateBrowserEvidence(report,rawByProfile,expected) { return validate(report,rawByProfile,expected,null); }
export function validateHistoricalBrowserEvidence(report,rawByProfile,expected,runnerSha256) { return validate(report,rawByProfile,expected,{runnerSha256}); }
export async function readReportAndRaw(reportPath) {
  const report=JSON.parse(await readFile(reportPath,'utf8'));
  const raw=Object.fromEntries(await Promise.all(PROFILES.map(async profile=>[profile.label,JSON.parse(await readFile(resolve(dirname(reportPath),profile.label+'-frames.json'),'utf8'))])));
  return {report,raw};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const argument=process.argv.slice(2);
  assert(argument.length===1 && argument[0].startsWith('--report='),'supply exactly --report=<current full report>');
  const input=await readReportAndRaw(resolve(root,argument[0].slice('--report='.length)));
  console.log(JSON.stringify(validateBrowserEvidence(input.report,input.raw,await readSourceGuards())));
}
