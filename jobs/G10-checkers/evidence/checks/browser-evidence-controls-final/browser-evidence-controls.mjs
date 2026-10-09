import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {validateCheckCoverage,validateFrameStatistics,validateRawFrames,validateSourceBinding,validateCurrentReport,validateClip,describeClip,hashFile,sourceGuards,PROFILES,guardsFingerprint,validateRunIdentity,validateIntervalContinuity,validateProfileReceipt,validateActiveWorkload} from './browser-evidence.mjs';

const json=async path=>JSON.parse(await readFile(path,'utf8'));
const output=resolve(process.env.G10_EVIDENCE_DIR??'.work/checks'),scratch=resolve('.work/browser-evidence-controls');
await mkdir(output,{recursive:true});await mkdir(scratch,{recursive:true});
const rows=[],clone=value=>structuredClone(value);
function positive(name,fn,scope='Component validation of genuine historical evidence; never current four-variant acceptance'){fn();rows.push({name,result:'PASS',scope});}
function negative(name,fn){assert.throws(fn,undefined,name);rows.push({name,result:'REJECTED'});}
async function asyncPositive(name,fn){await fn();rows.push({name,result:'PASS',scope:'Actual historical video decoded and hash-bound; never a fresh capture claim'});}
async function asyncNegative(name,fn){await assert.rejects(fn,undefined,name);rows.push({name,result:'REJECTED'});}
const historical='evidence/checks/browser-full-six-guarded',recorded='evidence/checks/browser-full-six-guarded-capture';
const strict=await json(historical+'/checks.json'),capture=await json(recorded+'/capture.json');
for(const [kind,report] of [['strict',strict],['capture',capture]]){
  positive(kind+' actual complete 30 named checks',()=>validateCheckCoverage(report));
  for(const [label,change] of [
    ['empty',value=>{value.checks=[];}],['missing',value=>{value.checks.pop();}],
    ['duplicate',value=>{value.checks[1]=clone(value.checks[0]);}],['renamed',value=>{value.checks[0].name='placeholder';}],
    ['wrong profile',value=>{value.checks[0].profile='phone';}],['truthy pass',value=>{value.checks[0].pass='true';}],
    ['skipped',value=>{value.checks[0].skipped=true;}],['false pass',value=>{value.checks[0].pass=false;}],
    ['wrong profile count',value=>{value.profiles[0].checks=14;}],['failed report',value=>{value.failure={phase:'not finished'};}],
  ]){const bad=clone(report);change(bad);negative(kind+' rejects '+label,()=>validateCheckCoverage(bad));}
}
for(const profile of PROFILES){
  const raw=await json(historical+'/'+profile.name+'-frames.json'),row=strict.profiles.find(value=>value.name===profile.name),summary={frames:raw.frames.length,meanFps:row.meanFps,p99Ms:row.p99Ms};
  positive(profile.name+' actual American-only 600-interval statistics',()=>validateFrameStatistics(raw,summary));
  for(const [label,change] of [
    ['empty intervals',value=>{value.frames=[];}],['missing interval',value=>{value.frames.pop();}],
    ['200-frame diagnostic',value=>{value.frames=value.frames.slice(0,200);}],['invalid interval',value=>{value.frames[0]=0;}],
    ['altered raw mean',value=>{value.meanMs+=1;}],['altered raw FPS',value=>{value.meanFps+=1;}],
    ['altered raw p99',value=>{value.p99Ms+=1;}],['recorded acceptance',value=>{value.capturing=true;}],
    ['changed workload',value=>{value.workload='warm-up filtered';}],
  ]){const bad=clone(raw);change(bad);negative(profile.name+' rejects '+label,()=>validateFrameStatistics(bad,summary));}
  negative(profile.name+' rejects inconsistent report summary',()=>validateFrameStatistics(raw,{...summary,meanFps:summary.meanFps+1}));
  const recompute=value=>{const ordered=[...value.frames].sort((a,b)=>a-b);value.meanMs=value.frames.reduce((a,b)=>a+b,0)/600;value.meanFps=1000/value.meanMs;value.p99Ms=ordered[593];return {frames:600,meanFps:value.meanFps,p99Ms:value.p99Ms};};
  const largest=raw.frames.map((value,index)=>({value,index})).sort((a,b)=>b.value-a.value);
  const meanOnly=clone(raw);for(const {index} of largest.slice(0,6))meanOnly.frames[index]=100;const meanSummary=recompute(meanOnly);assert(meanOnly.meanFps<59&&meanOnly.p99Ms<=17);
  negative(profile.name+' rejects internally consistent mean-only counterfactual',()=>validateFrameStatistics(meanOnly,meanSummary));
  const percentileOnly=clone(raw);for(const {index} of largest.slice(0,7))percentileOnly.frames[index]=18;const percentileSummary=recompute(percentileOnly);assert(percentileOnly.meanFps>=59&&percentileOnly.p99Ms>17);
  negative(profile.name+' rejects internally consistent p99-only counterfactual',()=>validateFrameStatistics(percentileOnly,percentileSummary));
  // Derived relative coordinates test serialization/continuity only. They are
  // never persisted as actual RAF timestamps or current browser-run evidence.
  const coordinates=[0];for(const interval of raw.frames)coordinates.push(coordinates.at(-1)+interval);
  const continuity={frames:clone(raw.frames),timestamps:coordinates};
  positive(profile.name+' derived relative continuity component',()=>validateIntervalContinuity(continuity),'Derived unit-component coordinates from genuine raw intervals; not recorded native timestamps or current acceptance');
  for(const [label,change] of [
    ['missing timestamp',value=>{value.timestamps.pop();}],['numeric string timestamp',value=>{value.timestamps[1]=String(value.timestamps[1]);}],
    ['nonfinite timestamp',value=>{value.timestamps[1]=Infinity;}],['shifted timestamp',value=>{value.timestamps[2]+=1;}],
    ['non-array timestamps',value=>{value.timestamps={length:601};}],['zero interval',value=>{value.frames[1]=0;}],
  ]){const bad=clone(continuity);change(bad);negative(profile.name+' rejects '+label,()=>validateIntervalContinuity(bad));}
  const profileReceipt={...profile,loadMs:row.loadMs,pageErrorCount:0,httpRequestCount:0,pageErrors:[],httpRequests:[],frameResults:[{variant:'american'},{variant:'international'}]};
  positive(profile.name+' profile-receipt schema component',()=>validateProfileReceipt(profileReceipt,profile),'Structural telemetry/coverage unit fixture only; no observed fresh run or frame result is inferred');
  for(const [label,change] of [
    ['wrong width',value=>{value.width++;}],['wrong height',value=>{value.height++;}],['wrong throttle',value=>{value.throttle++;}],
    ['missing error count',value=>{delete value.pageErrorCount;}],['error count',value=>{value.pageErrorCount=1;}],
    ['error array',value=>{value.pageErrors=['boom'];}],['HTTP count',value=>{value.httpRequestCount=1;}],['HTTP array',value=>{value.httpRequests=['https://invalid.invalid'];}],
    ['missing variant',value=>{value.frameResults.pop();}],['duplicate variant',value=>{value.frameResults[1].variant='american';}],
  ]){const bad=clone(profileReceipt);change(bad);negative(profile.name+' rejects profile '+label,()=>validateProfileReceipt(bad,profile));}

  // The archived runner's actual newTable() default was American. We do not add
  // a variant field or run identity to its raw evidence or claim current proof.
  negative(profile.name+' rejects historical raw without explicit variant',()=>validateRawFrames(raw,profile,'american',strict.sourceSha256,{variant:'american',...summary}));
}
// These are genuine native DOM-diagnostic game states. They exercise active
// workload endpoints only, not the timing or current-run acceptance protocol.
const diagnostic=await json('evidence/checks/international-cost-private/report.json');
for(const variant of ['american','international']){
  const result=diagnostic.batches.find(batch=>batch.variant===variant).result;
  const endpoints={stateBefore:result.initial,stateAfter:result.final,draftBefore:result.draft,draftAfter:result.draft,legalMoveCountBefore:result.legalMoves,legalMoveCountAfter:result.legalMoves,thinkingBefore:result.host.thinking,thinkingAfter:result.host.thinking};
  positive(variant+' actual native diagnostic active state component',()=>validateActiveWorkload(endpoints,variant),'Genuine unchanged active game states from nongating native DOM diagnostics; never 600-frame acceptance');
  for(const [label,change] of [
    ['expired phase',value=>{value.stateBefore.phase.id='done';value.stateAfter.phase.id='done';}],
    ['nonzero turn timer',value=>{value.stateBefore.settings.turnSeconds=60;value.stateAfter.settings.turnSeconds=60;}],
    ['deadline',value=>{value.stateBefore.phase.deadline=1;value.stateAfter.phase.deadline=1;}],
    ['paused',value=>{value.stateBefore.phase.paused={at:1};value.stateAfter.phase.paused={at:1};}],
    ['advanced state',value=>{value.stateAfter.ply++;}],['unfinished draft',value=>{value.draftAfter=[1];}],
    ['missing legal moves',value=>{value.legalMoveCountBefore=0;}],['active bot',value=>{value.thinkingBefore=true;}],
  ]){const bad=clone(endpoints);change(bad);negative(variant+' rejects workload '+label,()=>validateActiveWorkload(bad,variant));}
}
const failed=await json('evidence/checks/browser-full-six-international-failed/desktop-international-frames.json');
negative('actual International 600-frame failure remains rejected',()=>validateFrameStatistics(failed,{frames:failed.frames.length,meanFps:failed.meanFps,p99Ms:failed.p99Ms}));
const guards=await sourceGuards(),htmlBytes=strict.htmlBytes,sourceSha256=strict.sourceSha256;
// This is a component source-map receipt, not a simulated browser-run report.
const binding={sourceSha256,sourceSha256After:sourceSha256,htmlBytes,htmlBytesAfter:htmlBytes,sourceGuardsBefore:guards,sourceGuardsAfter:guards};
positive('actual current host-source map component',()=>validateSourceBinding(binding,{sourceSha256,htmlBytes,guards}));
const componentRunId=randomUUID(),identity={runId:componentRunId,nonce:randomUUID(),sourceGuardsFingerprint:guardsFingerprint(guards)};
positive('current control-execution identity component',()=>validateRunIdentity(identity,componentRunId,guards),'Actual UUIDs for this host-control invocation only; not a fresh browser execution');
for(const [label,change] of [
  ['wrong run ID',value=>{value.runId=randomUUID();}],['missing nonce',value=>{delete value.nonce;}],
  ['malformed nonce',value=>{value.nonce='-'.repeat(36);}],['wrong fingerprint',value=>{value.sourceGuardsFingerprint='0'.repeat(64);}],
]){const bad=clone(identity);change(bad);negative(label,()=>validateRunIdentity(bad,componentRunId,guards));}

for(const [label,change] of [
  ['wrong initial HTML',value=>{value.sourceSha256='0'.repeat(64);}],['changed final HTML',value=>{value.sourceSha256After='0'.repeat(64);}],
  ['changed final bytes',value=>{value.htmlBytesAfter++;}],['missing initial guards',value=>{delete value.sourceGuardsBefore;}],
  ['wrong runner source',value=>{value.sourceGuardsBefore['scripts/browser-check.mjs']='0'.repeat(64);}],
  ['changed final guards',value=>{value.sourceGuardsAfter['src/browser.ts']='0'.repeat(64);}],
]){const bad=clone(binding);change(bad);negative(label,()=>validateSourceBinding(bad,{sourceSha256,htmlBytes,guards}));}
negative('historical American-only report cannot become current four-variant acceptance',()=>validateCurrentReport(strict,{sourceSha256,htmlBytes,guards,capture:false}));
negative('historical capture cannot become current fresh capture acceptance',()=>validateCurrentReport(capture,{sourceSha256,htmlBytes,guards,capture:true}));
const excerpts=await json(recorded+'/excerpts.json');
for(const profile of PROFILES){
  const original=excerpts.clips.find(value=>value.profile===profile.name),path=resolve(original.excerpt),receipt=await describeClip(path,profile.name+'.webm');
  assert.equal(receipt.bytes,original.excerptBytes);assert.equal(receipt.sha256,original.excerptSha256);
  await asyncPositive(profile.name+' actual historical ten-second gameplay clip',()=>validateClip(path,receipt,profile));
  for(const [label,change] of [
    ['wrong file',value=>{value.file='stale.webm';}],['wrong bytes',value=>{value.bytes++;}],
    ['wrong hash',value=>{value.sha256='0'.repeat(64);}],['wrong container receipt',value=>{value.probe.container='mp4';}],
    ['wrong timing receipt',value=>{value.probe.durationSeconds=0;}],['wrong dimensions receipt',value=>{value.probe.width++;}],
  ]){const bad=clone(receipt);change(bad);await asyncNegative(profile.name+' rejects '+label,()=>validateClip(path,bad,profile));}
  const empty=resolve(scratch,profile.name+'-empty.webm');await writeFile(empty,'');await asyncNegative(profile.name+' rejects actual zero-byte clip',()=>validateClip(empty,receipt,profile));
  const unrelated=resolve(excerpts.clips.find(value=>value.profile!==profile.name).excerpt);
  await asyncNegative(profile.name+' rejects unrelated actual clip under ten MiB',()=>validateClip(unrelated,receipt,profile));
  const corrupt=resolve(scratch,profile.name+'-corrupt.webm'),bytes=await readFile(path);bytes[0]^=255;await writeFile(corrupt,bytes);
  const rewritten={...receipt,sha256:await hashFile(corrupt)};
  await asyncNegative(profile.name+' rejects corrupted container even with recomputed hash',()=>validateClip(corrupt,rewritten,profile));
  const otherReceipt=await describeClip(unrelated,profile.name+'.webm');
  await asyncNegative(profile.name+' rejects other-profile clip even with accurate hash/probe',()=>validateClip(unrelated,otherReceipt,profile));
}
assert.deepEqual(await sourceGuards(),guards,'Host sources changed during controls');
const receipt={status:'PASS',scope:'Independent host-validator component controls against genuine historical 30-check reports, American-only 600-frame data, actual failed International data and actual historical WebM clips, plus explicitly labeled structural identity/telemetry/relative-coordinate components and isolated counterfactual thresholds. No current browser/capture acceptance is inferred.',sourceGuards:guards,positives:rows.filter(row=>row.result==='PASS').length,rejected:rows.filter(row=>row.result==='REJECTED').length,rows};
await writeFile(output+'/browser-evidence-controls.json',JSON.stringify(receipt,null,2)+'\n');process.stdout.write(JSON.stringify({status:receipt.status,positives:receipt.positives,rejected:receipt.rejected,scope:receipt.scope})+'\n');
