import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const json=(path:string)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const sha=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');

test('private draft gain is bound to actual before/current files and preserves submissions, score and secrecy',()=>{
  const before=json('evidence/browser/round-6-draft-baseline/report.json'),after=json('evidence/browser/round-6-draft-after/report.json');
  assert.equal(before.sourceSha256,sha('evidence/browser/round-6-before/play.html'));
  assert.equal(before.runnerSha256,sha('evidence/browser/round-6-draft-baseline/runner.mjs'));
  assert.equal(after.sourceSha256,sha('play.html'));assert.equal(after.runnerSha256,sha('scripts/browser-draft-hints.mjs'));
  for(const [report,expected] of [[before,0],[after,3]] as const){
    assert.equal(report.passed,true);assert.equal(report.checks.length,3);assert(report.checks.every((row:{passed:boolean})=>row.passed));
    assert.deepEqual(report.runtime,{errors:[],dialogs:[],networkRequests:[]});assert(report.finishedAt>=report.startedAt);
    assert.deepEqual(report.rosters.map((row:{count:number})=>row.count),[2,8]);
    for(const row of report.rosters){
      assert.equal(row.mechanicallyIneligibleOwnRows,3);assert.equal(row.privateWarningRows,expected);
      assert.equal(row.originalBadSubmissionAccepted,true);assert.equal(row.previousSheetDidNotAffectHints,true);
      assert.deepEqual(row.finalScores,Array(row.count).fill(0));assert.equal(row.privateBallots,row.count*3);
      if(report===after){assert.equal(row.restoredWarningRows,3);assert.equal(row.restoredHandoverPrivate,true);assert.equal(row.remainingTimePreserved,true);}
    }
  }
});
