import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const json=(path:string)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const sha=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');

test('native paste gain is bound to frozen before/current files, actual cases, scored results and private input controls',()=>{
  const before=json('evidence/browser/round-7-paste-baseline/report.json'),after=json('evidence/browser/round-7-paste-after/report.json');
  assert.equal(before.sourceSha256,sha('evidence/browser/round-7-paste-baseline/play.html'));
  assert.equal(before.runnerSha256,sha('evidence/browser/round-7-paste-baseline/runner.mjs'));
  assert.equal(after.sourceSha256,sha('play.html'));assert.equal(after.runnerSha256,sha('scripts/browser-paste.mjs'));
  assert.equal(after.sourceSha256,sha('evidence/browser/round-7-paste-after/play.html'));assert.notEqual(before.sourceSha256,after.sourceSha256);
  for(const report of [before,after]){
    assert.equal(report.passed,true);assert.equal(report.cases.length,14);assert(report.finishedAt>=report.startedAt);
    assert.deepEqual(report.runtime,{errors:[],networkRequests:[]});
    assert.deepEqual(report.cases.map((row:{count:number;kind:string})=>`${row.count}/${row.kind}`),[2,8].flatMap(count=>['normal','article-space','tab','newline','crlf','vertical-tab','del'].map(kind=>`${count}/${kind}`)));
  }
  let rescued=0,retained=0;
  for(let n=0;n<14;n++){
    const a=before.cases[n],b=after.cases[n];
    for(const key of ['count','kind','letter','categoryId','prompt','authoredNoun','pasted'])assert.equal(a[key],b[key]);
    assert.equal(a.warning,'');assert.equal(b.warning,'');assert.equal(b.input,b.kind==='normal'?b.authoredNoun:`The ${b.authoredNoun}`);assert.equal(b.reviewed,b.input);
    assert.deepEqual(b.scores,['1',...Array(b.count-1).fill('0')]);assert.equal(b.verdict,'+1 point');
    assert.equal(a.privateHandover,true);assert.equal(b.privateHandover,true);assert.equal(a.anotherSheetDidNotAffectAdvice,true);assert.equal(b.anotherSheetDidNotAffectAdvice,true);
    if(['tab','vertical-tab','del'].includes(a.kind)){assert.equal(a.reviewed,`The${a.authoredNoun}`);assert.deepEqual(a.scores,Array(a.count).fill('0'));assert.equal(a.verdict,'Wrong initial · 0');rescued++;}
    else{assert.deepEqual(a.scores,b.scores);assert.equal(a.reviewed,b.reviewed);retained++;}
  }
  assert.equal(rescued,6);assert.equal(retained,8);
  assert.deepEqual(after.editingChecks.map((row:{count:number})=>row.count),[2,8]);
  for(const row of after.editingChecks){assert.equal(row.nativeMiddleReplacementCaret,4);assert.deepEqual(row.adversarialBackwardSelection,[4,7,'backward']);assert.equal(row.nativePasteBound,80);assert.equal(row.ownRepeatStillWarns,true);assert.equal(row.wrongInitialStillWarns,true);}
});
