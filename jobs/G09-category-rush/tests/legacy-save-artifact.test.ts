import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeSave} from '../client-save';
const root=new URL('../',import.meta.url);
const bytes=(path:string)=>readFileSync(new URL(path,root));
const sha=(value:Buffer|string)=>createHash('sha256').update(value).digest('hex');

test('authentic legacy autosaves bind to old/current pages, private migration, clock and scored negative controls',()=>{
 const report=JSON.parse(bytes('evidence/browser/round-9-legacy-save/report.json').toString());
 assert.equal(report.passed,true);assert.equal(report.oldSourceSha256,sha(bytes('evidence/browser/round-7-paste-baseline/play.html')));
 assert.equal(report.sourceSha256,sha(bytes('play.html')));assert.equal(report.runnerSha256,sha(bytes('scripts/browser-legacy-save.mjs')));
 assert.equal(report.runnerSha256,sha(bytes('evidence/browser/round-9-legacy-save/runner.mjs')));
 assert.deepEqual(report.runtime,{errors:[],requests:[],dialogs:[]});assert.equal(report.clock.notPerformanceEvidence,true);
 assert.deepEqual(report.cases.map((row:{count:number;kind:string})=>`${row.count}/${row.kind}`),[2,8].flatMap(count=>['normal','tab','vertical-tab','del','repeat','wrong-initial'].map(kind=>`${count}/${kind}`)));
 for(const row of report.cases){
  const prefix=`evidence/browser/round-9-legacy-save/${row.count}-${row.kind}`;
  const original=bytes(`${prefix}-original-save.json`),restored=bytes(`${prefix}-restored-save.json`);
  assert.equal(sha(original),row.originalSnapshotSha256);assert.equal(original.byteLength,row.originalSnapshotBytes);assert.equal(sha(restored),row.restoredSnapshotSha256);
  const old=decodeSave(original.toString(),row.compat),current=decodeSave(restored.toString(),row.compat);
  assert.equal(old.kind,'valid');assert.equal(current.kind,'valid');
  if(old.kind!=='valid'||current.kind!=='valid')throw new Error('Authentic saved fixture fails the current decoder');
  assert.equal(old.snapshot.draft[0],row.pasted);assert.equal(current.snapshot.draft[0],row.restoredInput);
  assert.equal(old.snapshot.seatElapsed,7300);assert.equal(current.snapshot.seatElapsed,12300);
  assert.deepEqual(current.snapshot.botRngs,old.snapshot.botRngs);assert.deepEqual(current.snapshot.state.rng,old.snapshot.state.rng);
  assert.equal(old.snapshot.seats.length,row.count);assert.equal(row.categoryId,'school-08');assert.equal(row.authoredNoun,'stapler');assert.equal(row.letter,'S');
  assert.equal(row.oldInput,row.pasted);assert.equal(row.reviewed,row.restoredInput);assert.equal(row.oldTimer,'0:53');assert.equal(row.restoredTimer,'0:53');assert.equal(row.advancedTimer,'0:48');
  assert.equal(row.privateHandover,true);assert.equal(row.otherSheetAdviceUnchanged,true);assert.equal(row.timerPreserved,true);assert.equal(row.passed,true);
  const invalid=row.kind==='repeat'||row.kind==='wrong-initial';assert.deepEqual(row.scores,[invalid?'0':'1',...Array(row.count-1).fill('0')]);
  if(row.kind==='repeat'){assert.match(row.warning,/category 2;/);assert.equal(old.snapshot.draft[1],'stapler');}
  else if(row.kind==='wrong-initial')assert.match(row.warning,/Start with S/);
  else assert.equal(row.warning,'');
 }
});
