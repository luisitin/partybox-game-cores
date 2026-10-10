import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeSave} from '../client-save';

const root=new URL('../',import.meta.url),folder='evidence/browser/round-10-late-save/';
const bytes=(path:string)=>readFileSync(new URL(path,root));
const json=(path:string)=>JSON.parse(bytes(path).toString());
const hash=(value:Buffer|string)=>createHash('sha256').update(value).digest('hex');

test('authentic maximum-roster late sheets bind trusted native input, saving, private recovery and original history',()=>{
 const report=json(folder+'report.json'),prepare=json(folder+'prepare.json');
 assert.equal(report.passed,true);assert.equal(prepare.passed,true);
 assert.equal(report.sourceSha256,hash(bytes('play.html')));
 assert.equal(report.runnerSha256,hash(bytes('scripts/browser-late-save.mjs')));
 assert.equal(report.runnerSha256,hash(bytes(folder+'runner.mjs')));
 assert.equal(prepare.sourceSha256,report.sourceSha256);assert.equal(prepare.runnerSha256,hash(bytes(folder+'prepare-runner.mjs')));
 assert.equal(report.prepareProducer.runnerSha256,prepare.runnerSha256);assert.equal(report.prepareProducer.sameRuntimeFingerprints,true);
 for(const [path,digest] of Object.entries(report.prepareProducer.sourceFingerprints))assert.equal(digest,path==='scripts/browser-late-save.mjs'?prepare.runnerSha256:hash(bytes(path)),path);
 assert.deepEqual(report.runtime,{errors:[],requests:[],dialogs:[]});assert(report.finishedAt>=report.startedAt);
 assert.match(report.scope,/no FPS acceptance/);assert.equal(Object.keys(report.sourceFingerprints).length,19);
 for(const [path,digest] of Object.entries(report.sourceFingerprints))assert.equal(hash(bytes(path)),digest,path);
 const originalBytes=bytes(folder+'authentic-late-handover-save.json'),original=JSON.parse(originalBytes.toString());
 assert.equal(originalBytes.byteLength,prepare.authenticSnapshotBytes);assert.equal(hash(originalBytes),prepare.authenticSnapshotSha256);
 assert.equal(original.state.round,5);assert.equal(original.state.history.length,4);assert.equal(original.state.order.length,8);
 assert.equal(original.activeHuman,'p8');assert.equal(original.handover,true);assert.equal(original.seatElapsed,0);
 assert.deepEqual(original.draft,Array(12).fill(''));assert.equal(Object.values(original.state.submitted).filter(Boolean).length,7);
 assert.deepEqual(prepare.played.map((row:{round:number;ballots:number})=>[row.round,row.ballots]),[[1,96],[2,96],[3,96],[4,96]]);
 assert.equal(prepare.completedGroups,384);assert.equal(prepare.currentSubmittedAnswers,84);assert.equal(prepare.answerLength,80);assert.equal(prepare.nameLength,24);
 assert(original.seats.every((seat:{kind:string;name:string})=>seat.kind==='human'&&seat.name.length===24));
 assert(original.state.order.slice(0,7).every((id:string)=>original.state.answers[id].every((text:string)=>text.length===80)));
 for(const round of original.state.history){
  assert.equal(round.entries.length,12);
  assert(round.entries.every((entry:{groups:Array<{text:string;owners:string[];points:number}>})=>entry.groups.length===8&&entry.groups.every(group=>group.text.length===80&&group.owners.length===1&&group.points===1)));
  assert.deepEqual(round.points,Object.fromEntries(original.state.order.map((id:string)=>[id,12])));
 }
 assert.equal(decodeSave(originalBytes.toString(),original.compat).kind,'valid');
 assert.deepEqual(report.profiles.map((row:{profile:string})=>row.profile),['desktop','phone4x']);
 for(const row of report.profiles){
  assert.equal(row.passed,true);assert.equal(row.cpuThrottle,row.profile==='phone4x'?4:1);
  assert.equal(row.observations.nativeDate,true);assert.equal(row.observations.nativePerformanceNow,true);
  assert.equal(row.inputEventCount,960);assert.equal(row.observations.inputs.length,960);
  const typedBytes=bytes(folder+row.profile+'-typed-save.json'),typed=JSON.parse(typedBytes.toString());
  assert.equal(hash(typedBytes),row.savedSha256);assert.equal(typedBytes.byteLength,row.savedBytes);
  assert.equal(decodeSave(typedBytes.toString(),original.compat).kind,'valid');
  assert.deepEqual(typed.state.history,original.state.history);assert.deepEqual(typed.state.answers,original.state.answers);
  assert.deepEqual(typed.state.rng,original.state.rng);assert.deepEqual(typed.botRngs,original.botRngs);
  assert.deepEqual(typed.draft,row.expectedDraft);assert(row.expectedDraft.every((text:string)=>text.length===80));
  assert.equal(typed.state.round,5);assert.equal(typed.activeHuman,'p8');assert.equal(typed.handover,false);
  assert.equal(row.privateReload,true);assert.equal(row.fullDraftRecovered,true);assert.equal(row.historyAndScoresPreserved,true);
  assert.deepEqual(row.initialSeed,{attempts:1,writes:1});assert.deepEqual(row.afterReloadSeed,{attempts:2,writes:1});
  const reloadedBytes=bytes(folder+row.profile+'-after-reload-save.json'),reloaded=JSON.parse(reloadedBytes.toString());
  assert.equal(hash(reloadedBytes),row.afterReloadSaveSha256);assert.deepEqual(reloaded.draft,row.expectedDraft);
  assert.equal(decodeSave(reloadedBytes.toString(),original.compat).kind,'valid');
  assert(row.restoredElapsedMs>=typed.seatElapsed&&row.restoredElapsedMs<60000);
  const counts=Array(12).fill(0),times:number[]=[];
  for(const event of row.observations.inputs){
   const match=/^answer-(\d+)$/.exec(event.id);assert(match);const index=Number(match[1]);assert(index>=0&&index<12);
   counts[index]++;assert.equal(event.trusted,true);assert.equal(event.value,row.expectedDraft[index].slice(0,counts[index]));
   assert(Number.isSafeInteger(event.wallMs));assert(Number.isFinite(event.startedPerformanceMs));assert(Number.isFinite(event.finishedPerformanceMs));
   assert(event.finishedPerformanceMs>=event.startedPerformanceMs);times.push(event.finishedPerformanceMs-event.startedPerformanceMs);
  }
  assert.deepEqual(counts,Array(12).fill(80));const ordered=[...times].sort((a,b)=>a-b);
  assert(Math.abs(row.inputHandlerMeanMs-times.reduce((a,b)=>a+b,0)/960)<1e-9);
  assert.equal(row.inputHandlerP99Ms,ordered[Math.ceil(960*.99)-1]);assert.equal(row.inputHandlerMaxMs,ordered.at(-1));
  assert(row.observations.saveStatus.some((event:{text:string})=>event.text==='Saving changes…'));
  assert(row.observations.saveStatus.some((event:{text:string})=>event.text==='Saved on this device.'));
  assert(Number.isFinite(row.nativeTypingHostElapsedMs)&&row.nativeTypingHostElapsedMs>0);
  assert(Number.isFinite(row.afterTypingSaveWaitMs)&&row.afterTypingSaveWaitMs>=0&&row.afterTypingSaveWaitMs<5000);
 }
 const capture=bytes(folder+report.capture.path);assert.equal(capture.byteLength,report.capture.bytes);assert(capture.byteLength>0&&capture.byteLength<10000000);
 assert.equal(hash(capture),report.capture.sha256);assert.equal(report.capture.sourceSha256,report.sourceSha256);
 assert.deepEqual(bytes(report.capture.canonicalPath),capture);
 assert.equal(report.capture.separateFromObservationalTyping,true);assert.match(report.capture.scope,/no FPS measurement/);
});
