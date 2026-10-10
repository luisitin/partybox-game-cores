import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const json=(path:string)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const sha=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');
test('final offline proof is complete and bound to the exact HTML, sources, licenses and videos',()=>{
  const report=json('evidence/browser/performance-report.json'),digest=sha('play.html');
  assert.equal(report.sourceSha256,digest);assert.equal(report.passed,true);
  assert.equal(report.recordingDuringMeasurement,false);
  assert.equal(report.sourceFingerprints['scripts/browser-performance.mjs'],sha('scripts/browser-performance.mjs'));
  const hostedPath=new URL('evidence/browser/hosted-run.json',root);
  if(process.env.GITHUB_ACTIONS==='true')assert(existsSync(hostedPath),'Fresh hosted evidence metadata is required');
  if(existsSync(hostedPath)){
    const origin=json('evidence/browser/hosted-run.json');assert.equal(origin.origin,'github-actions');
    assert.match(origin.headSha,/^[a-f0-9]{40}$/);assert.match(origin.runId,/^[0-9]+$/);assert.match(origin.attempt,/^[0-9]+$/);
    assert.equal(origin.htmlSha256,digest);assert.equal(origin.runnerSha256,sha('scripts/browser-performance.mjs'));
    if(process.env.GITHUB_ACTIONS==='true'){
      const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!,'utf8'));
      assert.equal(origin.headSha,event.pull_request.head.sha);assert.equal(origin.runId,process.env.GITHUB_RUN_ID);
    }
  }
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
    assert.equal(summary.clipContext.privateWarningRows,3,'current milestone captures must show the real private feedback');
    assert.equal(raw.nativeDate,true);assert.equal(raw.witnesses.length,601);assert.equal(summary.workload.passed,true);
    const seconds=raw.witnesses.map((row:{timerText:string})=>{assert.match(row.timerText,/^\d+:[0-5]\d$/);const [minutes,seconds]=row.timerText.split(':').map(Number);return minutes*60+seconds;});
    const firstWall=raw.witnesses[0].wallMs,lastWall=raw.witnesses[600].wallMs,deadlineUpper=firstWall+seconds[0]*1000;
    for(let n=0;n<601;n++){const row=raw.witnesses[n];assert.equal(row.answerFormVisible,true);assert.equal(row.modalAbsent,true);assert(Number.isSafeInteger(row.wallMs)&&row.wallMs>=firstWall&&(!n||row.wallMs>=raw.witnesses[n-1].wallMs));assert(seconds[n]>0&&seconds[n]<=60&&(!n||seconds[n]<=seconds[n-1]));assert(Math.abs(seconds[n]*1000-(deadlineUpper-row.wallMs))<=1200);}
    assert(lastWall-firstWall>=1000);assert(seconds[0]>seconds[600]);assert.equal(summary.workload.wallElapsedMs,lastWall-firstWall);assert.equal(summary.workload.timerStartSeconds,seconds[0]);assert.equal(summary.workload.timerEndSeconds,seconds[600]);
    const paste=summary.clipContext.nativePasteWordBoundary;
    assert.equal(paste.method,'native Chromium clipboard');assert.equal(paste.pasted,`The\t${paste.noun}`);assert.equal(paste.visible,`The ${paste.noun}`);
    const category=json('content/categories.json').categories.find((row:{id:string})=>row.id===paste.categoryId);
    assert(category);assert.equal(category.prompt,paste.prompt);assert(category.answers[paste.letter].includes(paste.noun));
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
  assert.deepEqual(resumeAfter.clock,{mode:'paused-manual-advances',epoch:Date.UTC(2026,9,8),pauseOffsetMs:1000,playwrightVersion:'1.56.0'});
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
  const doubleReload=resumeAfter.details.find((row:any)=>row.case==='double handover reload');
  assert.deepEqual(doubleReload.observations.map((row:any)=>row.label),['before first reload','after first reload','after first Resume','after second reload','after closed-time wait','after second Resume','after Ready']);
  assert.equal(doubleReload.observations[0].timer,doubleReload.timer);
  assert.equal(doubleReload.observations.at(-1).timer,doubleReload.timer);
  const restoredBoundary=doubleReload.observations[2];
  for(const observation of doubleReload.observations){
    assert.equal(observation.saved.draft[0],'Private repeated draft');
    assert.deepEqual(observation.saved.state,doubleReload.observations[0].saved.state);
    assert.deepEqual(observation.saved.botRngs,doubleReload.observations[0].saved.botRngs);
    assert(Number.isFinite(observation.saved.seatElapsed)&&observation.saved.seatElapsed>=0);
  }
  for(const observation of doubleReload.observations.slice(3,6)){
    assert.equal(observation.saved.seatElapsed,restoredBoundary.saved.seatElapsed);
    assert.equal(observation.saved.handover,true);
  }
  const hostPause=resumeAfter.details.find((row:any)=>row.case==='host pause');assert(hostPause);
  assert.deepEqual(hostPause.observations.map((row:any)=>row.label),['before pause','after pause','after reload','after closed-time wait','after Resume','after paused wait','after close','after Ready']);
  assert.equal(hostPause.observations[0].timer,hostPause.timer);
  assert.equal(hostPause.observations.at(-1).timer,hostPause.timer);
  for(const observation of hostPause.observations){
    assert.equal(observation.saved.draft[0],'Paused draft');
    assert.equal(observation.saved.seatElapsed,hostPause.observations[0].saved.seatElapsed);
    assert.deepEqual(observation.saved.botRngs,hostPause.observations[0].saved.botRngs);
  }
  for(const detail of [doubleReload,hostPause])for(let i=1;i<detail.observations.length;i++){
    assert.equal(detail.observations[i].timeOrigin,detail.observations[0].timeOrigin);
    assert(detail.observations[i].performanceNow>=detail.observations[i-1].performanceNow,'Paused functional clock must remain monotonic');
  }
  assert(resumeAfter.details.some((row:any)=>row.case==='near expiry'&&row.submitted===true));
  assert.equal(resumeAfter.details.filter((row:any)=>row.case==='storage failure').length,2);
  assert.equal(resumeAfter.details.filter((row:any)=>row.case==='invalid save').length,2);
  const selectedGain=resumeAfter.details.find((row:any)=>row.case==='historical gains');
  assert(selectedGain);assert.deepEqual(selectedGain.gains,['+1 in round 1','+0 in round 1']);
  assert.deepEqual(selectedGain.currentTotals,['3','0']);
  const invalidFocus=resumeAfter.details.find((row:any)=>row.case==='invalid review focus');
  assert(invalidFocus);assert.equal(invalidFocus.enabledVotes,0);assert.equal(invalidFocus.focusedText,'Lock my ballot →');
  const pluralBefore=json('evidence/browser/round-4-plurals-baseline/report.json'),pluralAfter=json('evidence/browser/round-4-plurals-after/report.json');
  assert.equal(pluralBefore.sourceSha256,sha('evidence/browser/round-3-accepted/play.html'));
  assert.equal(pluralAfter.sourceSha256,digest);
  for(const report of [pluralBefore,pluralAfter]){
    assert.equal(report.runnerSha256,sha('scripts/browser-plurals.mjs'));assert.equal(report.passed,true);
    assert.equal(report.checks.length,3);assert(report.checks.every((row:any)=>row.passed));
    assert.equal(report.fixture.categoryId,'wildlife-01');assert.equal(report.fixture.letter,'M');
    for(const key of ['errors','dialogs','networkRequests'])assert.equal(report.runtime[key].length,0);
    for(const count of [2,8]){
      const row=report.rosters.find((row:any)=>row.count===count);assert(row);
      assert.equal(row.reviewGroupCount,report===pluralBefore?2:1);assert.equal(row.awardedPoints,report===pluralBefore?2:0);
      assert.equal(row.reviews.length,count);assert(row.reviews.every((review:any)=>review.authorsHidden));
      assert(row.receiptText.includes('Case Alpha, Case Beta')||report===pluralBefore);
      if(report===pluralAfter)assert.deepEqual(row.verdicts,['Duplicate · 0']);
    }
  }
  const mutation=json('evidence/mutations.json');assert.equal(mutation.total,43);assert(mutation.killed>=42);
  assert.equal(mutation.isolatedActualSource,true);
  for(const [path,hash] of Object.entries(mutation.sourceHashes))assert.equal(sha(path),hash,path);
  for(const prefix of ['M26','M27','M28'])assert(mutation.mutations.find((row:any)=>row.id.startsWith(prefix))?.killed);
  for(let id=29;id<=43;id++)assert(mutation.mutations.find((row:any)=>row.id.startsWith(`M${id} `))?.killed);
  const original=json('evidence/breadth-baseline.json'),bankOnly=json('evidence/breadth-bank-only.json'),strategy=json('evidence/breadth-after.json');
  assert.equal(original.sourceHashes.data,sha('evidence/browser/round-1-accepted/categories.json'));
  for(const report of [original,bankOnly])assert.equal(report.sourceHashes.core,sha('evidence/breadth-original-core.ts'));
  for(const report of [bankOnly,strategy]){
    assert.equal(report.sourceHashes.authored,sha('content/authored.mjs'));
    assert.equal(report.sourceHashes.data,sha('content/categories.json'));
    assert.equal(report.sourceHashes.generated,sha('content/categories.ts'));
  }
  assert.equal(strategy.sourceHashes.core,sha('evidence/breadth-strategy-core.ts'));
  for(const report of [original,bankOnly,strategy]){
    assert.equal(report.sourceHashes.experiment,sha('evidence/breadth-original-experiment.ts'));
    assert.equal(report.sourceHashes.scoring,sha('src/scoring.ts'));assert.equal(report.sourceHashes.matcher,sha('evidence/breadth-original-match.ts'));
    assert.equal(report.games,200);assert.equal(report.players,8);assert.equal(report.rows.length,200);
    assert.equal(report.outcomes.replayMatches,200);assert.equal(report.outcomes.repeatedOwn,0);
    assert.equal(report.outcomes.awarded,report.rows.reduce((sum:number,row:any)=>sum+row.awarded,0));
    assert.deepEqual(report.rows.map((row:any)=>[row.seed,row.letter,row.layout]),original.rows.map((row:any)=>[row.seed,row.letter,row.layout]));
  }
  assert(bankOnly.outcomes.awarded>original.outcomes.awarded);
  assert(strategy.outcomes.awarded>bankOnly.outcomes.awarded);
  assert(strategy.outcomes.duplicateOwnerRate<bankOnly.outcomes.duplicateOwnerRate);
  const lexical=json('evidence/breadth-lexical.json');
  for(const [field,path] of Object.entries({core:'evidence/breadth-lexical-core.ts',matcher:'evidence/breadth-lexical-match.ts',scoring:'src/scoring.ts',experiment:'evidence/breadth-lexical-experiment.ts',authored:'content/authored.mjs',data:'content/categories.json',generated:'content/categories.ts'}))assert.equal(lexical.sourceHashes[field],sha(path));
  assert.equal(lexical.outcomes.replayMatches,200);assert.equal(lexical.rows.length,200);
  assert.deepEqual(lexical.rows.map((row:any)=>[row.seed,row.letter,row.layout]),strategy.rows.map((row:any)=>[row.seed,row.letter,row.layout]));
  const html=readFileSync(new URL('play.html',root),'utf8');
  assert.match(html,/^<!doctype html>\s*<!-- Original Category Rush code, data and CSS\/SVG[\s\S]*?-->\s*<html lang="en">/);
  for(const path of ['LICENSE','node_modules/zod/LICENSE'])assert(html.includes(readFileSync(new URL(path,root),'utf8').trim()));
});
