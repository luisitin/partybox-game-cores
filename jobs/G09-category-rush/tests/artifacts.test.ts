import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const json=(path:string)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const sha=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');
test('final offline proof is complete and bound to the exact HTML, sources, licenses and videos',()=>{
  const report=json('evidence/browser/performance-report.json'),digest=sha('play.html');
  assert.equal(report.sourceSha256,digest);assert.equal(report.passed,true);
  assert.equal(report.recordingDuringMeasurement,false);
  assert.equal(report.sourceFingerprints['scripts/browser-performance.mjs'],sha('scripts/browser-performance.mjs'));
  assert.equal(report.profiles.length,2);assert(report.licenseChecks.LICENSE);
  assert(report.licenseChecks['node_modules/zod/LICENSE']);
  for(const [path,hash] of Object.entries(report.sourceFingerprints))assert.equal(sha(path),hash,path);
  for(const profile of ['desktop','phone4x']){
    const raw=json(`evidence/browser/${profile}-frames.json`),summary=report.profiles.find((p:any)=>p.profile===profile);
    assert(summary);assert.equal(raw.sourceSha256,digest);assert.equal(raw.count,600);assert.equal(raw.frames.length,600);
    assert(raw.frames.every((n:number)=>Number.isFinite(n)&&n>0));
    const total=raw.frames.reduce((n:number,x:number)=>n+x,0),sorted=[...raw.frames].sort((a,b)=>a-b);
    assert(Math.abs(total-raw.totalMs)<1e-6);assert(Math.abs(600000/total-raw.fps)<1e-6);
    assert.equal(raw.p99Ms,sorted[593]);assert(raw.fps>=59&&raw.p99Ms<=17);assert.equal(raw.passed,true);
    assert.equal(raw.pageErrors.length,0);assert(raw.networkRequests.every((url:string)=>url.startsWith('file:')));
    assert.equal(raw.cpuThrottle,profile==='desktop'?1:4);
    assert.equal(raw.recordingDuringMeasurement,false);
    assert.equal(raw.viewport.width,profile==='desktop'?1920:390);assert.equal(raw.viewport.height,profile==='desktop'?1080:844);
    assert.equal(statSync(new URL(summary.video,root)).size,summary.videoBytes);assert(summary.videoBytes>0&&summary.videoBytes<10000000);
    assert.equal(summary.clipContext.separateFromSampling,true);assert.equal(summary.clipContext.sourceSha256,digest);
    assert.equal(summary.clipContext.cpuThrottle,raw.cpuThrottle);assert.deepEqual(summary.clipContext.viewport,raw.viewport);
    assert.equal(summary.clipContext.pageErrors.length,0);assert(summary.clipContext.networkRequests.every((url:string)=>url.startsWith('file:')));
  }
  const functional=json('evidence/browser/functional-report.json');assert.equal(functional.sourceSha256,digest);
  assert.equal(functional.passed,true);assert(functional.checks.length>=28&&functional.checks.every((c:any)=>c.passed));
  const clock=json('evidence/browser/review-clock-report.json');
  assert.equal(clock.sourceSha256,digest);assert.equal(clock.passed,true);
  assert.equal(clock.firstDisplayedMs,Math.ceil(clock.firstBudgetMs/1000)*1000);
  assert.equal(clock.nextDisplayedMs,Math.ceil(clock.expectedNextBudgetMs/1000)*1000);
  const before=json('evidence/browser/round-1-baseline/report.json'),after=json('evidence/browser/round-1-after/report.json');
  assert.equal(before.passed,true);assert.equal(before.sourceSha256,sha('evidence/browser/round-0-accepted/play.html'));
  assert.equal(after.passed,true);assert.equal(after.sourceSha256,digest);assert.equal(after.checks.length,8);
  assert(after.checks.every((c:any)=>c.passed));
  for(const count of [2,8]){
    const old=before.blankProfiles.find((p:any)=>p.humans===count),now=after.blankProfiles.find((p:any)=>p.humans===count);
    assert.equal(old.ballotLocks,count*12);assert.equal(old.readyClicks,count*12);assert.equal(old.reviewActionCount,count*24);
    assert.equal(now.ballotLocks,0);assert.equal(now.readyClicks,0);assert.equal(now.reviewActionCount,0);
  }
  assert.equal(after.mixed.ballotLocks,8);assert.equal(after.mixed.emptyCategoriesSkipped,8);
  for(const report of [before,after])for(const key of ['pageErrors','networkRequests','dialogs'])assert.equal(report.runtime[key].length,0);
  const receiptBefore=json('evidence/browser/round-2-receipts-baseline/report.json');
  const receiptAfter=json('evidence/browser/round-2-receipts-after/report.json');
  assert.equal(receiptBefore.sourceSha256,sha('evidence/browser/round-1-accepted/play.html'));
  assert.equal(receiptBefore.runnerSha256,sha('evidence/browser/round-2-receipts-baseline/runner.mjs'));
  assert.equal(receiptAfter.sourceSha256,digest);assert.equal(receiptAfter.runnerSha256,sha('scripts/browser-receipts.mjs'));
  for(const report of [receiptBefore,receiptAfter]){
    assert.equal(report.passed,true);assert(report.checks.every((check:any)=>check.passed));
    for(const key of ['errors','networkRequests','dialogs'])assert.equal(report.runtime[key].length,0);
    for(const count of [2,8]){
      const measured=report.rosters.find((roster:any)=>roster.count===count);assert(measured);
      assert.equal(measured.scoredRounds,5);assert.equal(measured.finalScore,5);
      assert.equal(measured.accessibleRoundReceipts,report===receiptBefore?1:5);
      assert.equal(measured.historySelectorOptions,report===receiptBefore?0:5);
    }
  }
  assert.equal(receiptAfter.checks.length,4);
  const resumeBefore=json('evidence/browser/round-3-resume-baseline/report.json');
  const resumeAfter=json('evidence/browser/round-3-resume-after/report.json');
  assert.equal(resumeBefore.sourceSha256,sha('evidence/browser/round-2-accepted/play.html'));
  assert.equal(resumeBefore.runnerSha256,sha('evidence/browser/round-3-resume-baseline/runner.mjs'));
  assert.equal(resumeAfter.sourceSha256,digest);
  assert.equal(resumeAfter.runnerSha256,sha('scripts/browser-resume.mjs'));
  for(const savedReport of [resumeBefore,resumeAfter]){
    assert.equal(savedReport.passed,true);
    assert(savedReport.checks.length>=7&&savedReport.checks.every((check:any)=>check.passed));
    for(const stream of ['errors','requests','dialogs'])assert.equal(savedReport.runtime[stream].length,0);
    for(const count of [2,8])for(const phase of ['answer','review','scores']){
      const measured=savedReport.cases.find((row:any)=>row.count===count&&row.phase===phase);
      assert(measured);assert.equal(measured.resumeAvailable,savedReport===resumeAfter);
      assert.equal(measured.restored,savedReport===resumeAfter);
      if(savedReport===resumeAfter){
        assert.equal(measured.hiddenBeforeResume,true);
        assert.equal(measured.privateHandover,phase!=='scores');
        assert.deepEqual(measured.after,measured.before);
        if(phase==='scores')assert.equal(measured.after.receiptCount,12);
      }
    }
  }
  assert(resumeAfter.checks.length>=17);
  assert(resumeAfter.details.some((row:any)=>row.case==='mixed bot continuation'));
  assert(resumeAfter.details.some((row:any)=>row.case==='double handover reload'));
  assert(resumeAfter.details.some((row:any)=>row.case==='near expiry'&&row.submitted===true));
  assert.equal(resumeAfter.details.filter((row:any)=>row.case==='storage failure').length,2);
  assert.equal(resumeAfter.details.filter((row:any)=>row.case==='invalid save').length,2);
  const selectedGain=resumeAfter.details.find((row:any)=>row.case==='historical gains');
  assert(selectedGain);assert.deepEqual(selectedGain.gains,['+1 in round 1','+0 in round 1']);
  assert.deepEqual(selectedGain.currentTotals,['3','0']);
  const invalidFocus=resumeAfter.details.find((row:any)=>row.case==='invalid review focus');
  assert(invalidFocus);assert.equal(invalidFocus.enabledVotes,0);assert.equal(invalidFocus.focusedText,'Lock my ballot →');
  const original=json('evidence/breadth-baseline.json'),bankOnly=json('evidence/breadth-bank-only.json'),strategy=json('evidence/breadth-after.json');
  assert.equal(original.sourceHashes.data,sha('evidence/browser/round-1-accepted/categories.json'));
  for(const report of [original,bankOnly])assert.equal(report.sourceHashes.core,sha('evidence/breadth-original-core.ts'));
  for(const report of [bankOnly,strategy]){
    assert.equal(report.sourceHashes.authored,sha('content/authored.mjs'));
    assert.equal(report.sourceHashes.data,sha('content/categories.json'));
    assert.equal(report.sourceHashes.generated,sha('content/categories.ts'));
  }
  assert.equal(strategy.sourceHashes.core,sha('src/index.ts'));
  for(const report of [original,bankOnly,strategy]){
    assert.equal(report.sourceHashes.experiment,sha('scripts/breadth.ts'));
    assert.equal(report.sourceHashes.scoring,sha('src/scoring.ts'));assert.equal(report.sourceHashes.matcher,sha('src/match.ts'));
    assert.equal(report.games,200);assert.equal(report.players,8);assert.equal(report.rows.length,200);
    assert.equal(report.outcomes.replayMatches,200);assert.equal(report.outcomes.repeatedOwn,0);
    assert.equal(report.outcomes.awarded,report.rows.reduce((sum:number,row:any)=>sum+row.awarded,0));
    assert.deepEqual(report.rows.map((row:any)=>[row.seed,row.letter,row.layout]),original.rows.map((row:any)=>[row.seed,row.letter,row.layout]));
  }
  assert(bankOnly.outcomes.awarded>original.outcomes.awarded);
  assert(strategy.outcomes.awarded>bankOnly.outcomes.awarded);
  assert(strategy.outcomes.duplicateOwnerRate<bankOnly.outcomes.duplicateOwnerRate);
  const html=readFileSync(new URL('play.html',root),'utf8');
  assert.match(html,/^<!doctype html>\s*<!-- Original Category Rush code, data and CSS\/SVG[\s\S]*?-->\s*<html lang="en">/);
  for(const path of ['LICENSE','node_modules/zod/LICENSE'])assert(html.includes(readFileSync(new URL(path,root),'utf8').trim()));
});
