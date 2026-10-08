import assert from 'node:assert/strict';
import {decodeCapture} from './check-capture.mjs';
import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
export const guardedFiles=['play.html','src/browser.ts','src/core.ts','src/rules.ts','src/bot.ts','src/save.ts','src/schema.ts','src/input.ts','src/types.ts','src/manifest.ts','ui/play.template.html','scripts/visual.mjs','scripts/check-visual.mjs','scripts/html.mjs','scripts/build.mjs','scripts/generate.mjs','scripts/check-data.mjs','scripts/check-repro.mjs','tests/visual-proof.test.mjs','package.json','package-lock.json','tsconfig.json','../../contract/contract.ts','../../contract/rng.ts','../../contract/constants.ts','node_modules/zod/LICENSE','scripts/check-capture.mjs','scripts/capture.mjs','tests/capture-decoding.test.mjs','../../.github/workflows/G05.yml'];
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
export const sourceHashes=()=>Object.fromEntries(guardedFiles.map(p=>[p,hash(p)]));
const close=(a,b,label)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=Math.max(1e-9,Math.abs(b)*1e-12),label);
export function validateFrames(profile,width,height,cpu){
 assert.equal(profile.width,width,'viewport width');assert.equal(profile.height,height,'viewport height');assert.equal(profile.cpu,cpu,'CPU throttle');assert.equal(profile.warmupFrames,60,'warmup');assert.equal(profile.frames,600,'exact600frames');assert.equal(profile.overflow,false,'horizontal overflow');
 assert.equal(profile.interaction,'17-card private pass selection at10Hz; retained card controls');
 assert.ok(Array.isArray(profile.rawIntervals),'raw intervals missing');assert.equal(profile.rawIntervals.length,600,'truncated/filtered raw');assert.ok(profile.rawIntervals.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0),'finite positive raw');
 const raw=profile.rawIntervals,sorted=[...raw].sort((a,b)=>a-b),mean=raw.reduce((a,b)=>a+b,0)/raw.length;
 close(profile.meanMs,mean,'mean');close(profile.fps,1000/mean,'fps');close(profile.p95Ms,sorted[570],'p95');close(profile.p99Ms,sorted[594],'p99');close(profile.maxMs,sorted[599],'max');
 assert.ok(1000/mean>=59,'actual mean FPS below59');assert.ok(sorted[570]<=18,'actual p95 above18ms');
}
export function validateCapture(report){assert.ok(typeof report.videoPath==='string'&&/^media\/[A-Za-z0-9_.-]+\.webm$|^\.tmp\/visual\/[A-Za-z0-9_.-]+\.webm$/.test(report.videoPath));assert.match(report.videoSha256,/^[a-f0-9]{64}$/);assert.ok(Number.isSafeInteger(report.videoBytes)&&report.videoBytes>0&&report.videoBytes<10_000_000);assert.ok(existsSync(report.videoPath),'capture missing');assert.equal(readFileSync(report.videoPath).length,report.videoBytes,'capture byte mismatch');assert.equal(hash(report.videoPath),report.videoSha256,'capture SHA mismatch');decodeCapture(report.videoPath,{strictMilestone:report.kind==='full'});return true;}
export const functionalFlags=['outcomeFocus','winnerAnnounced','mobileWinnerVisible','accessibleControls','manageClock','selectionAnnouncements','handoffAnnouncements','receivedMarked','mobileResultPriority','freshDeals','resumedSavedGame','corruptSaveRejected','reducedMotion','privateHandoff','passing','mouseCard','touchCard','keyboardCard','keyboardFocus','longNamesFit'];
export function validateReport(report,{sources=sourceHashes(),checkVideo=true,currentRun=null}={}){
 assert.ok(typeof report.chrome==='string'&&report.chrome.length>0,'Chrome version required');assert.equal(report.kind,'full','historical/partial report cannot accept current delivery');assert.equal(report.passed,true);assert.equal(report.schemaVersion,1);assert.equal(report.fileOpened,true,'actual disk required');assert.equal(report.serving,'disk');assert.equal(report.externalRequests,0);assert.equal(report.runtimeExceptions,0);assert.deepEqual(report.completedPlayerCounts,[3,4,5,6]);
 assert.ok(typeof report.runId==='string'&&report.runId.length>0);assert.ok(Number.isFinite(Date.parse(report.startedAt))&&Number.isFinite(Date.parse(report.completedAt))&&Date.parse(report.completedAt)>=Date.parse(report.startedAt));
 assert.deepEqual(report.sourceStart,sources,'stale/missing start source guards');assert.deepEqual(report.sourceEnd,sources,'changed/missing end source guards');
 if(currentRun){assert.equal(report.runId,currentRun.runId,'latest attempt required');assert.deepEqual(currentRun.sourceStart,sources);}
 for(const flag of functionalFlags)assert.equal(report[flag],true,flag);assert.ok(report.minimumTapHeight>=44);assert.ok(report.controlBoundaryContrast>=3);assert.ok(report.footerContrast>=4.5);
 validateFrames(report.desktop,1920,1080,1);validateFrames(report.phone,390,844,4);
 assert.ok(typeof report.videoPath==='string'&&/^media\/[A-Za-z0-9_.-]+\.webm$|^\.tmp\/visual\/[A-Za-z0-9_.-]+\.webm$/.test(report.videoPath));assert.match(report.videoSha256,/^[a-f0-9]{64}$/);assert.ok(Number.isSafeInteger(report.videoBytes)&&report.videoBytes>0&&report.videoBytes<10_000_000);
 if(checkVideo)validateCapture(report);
 return {accepted:true,currentSource:true,rawFrames:1200,functionals:functionalFlags.length,sourceGuards:guardedFiles.length,captureBytes:report.videoBytes};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const report=JSON.parse(readFileSync('.tmp/visual/current-report.json','utf8')),currentRun=JSON.parse(readFileSync('.tmp/visual/current-run.json','utf8'));console.log(JSON.stringify(validateReport(report,{currentRun})));}
