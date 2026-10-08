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
  const html=readFileSync(new URL('play.html',root),'utf8');
  assert.match(html,/^<!doctype html>\s*<!-- Original Category Rush code, data and CSS\/SVG[\s\S]*?-->\s*<html lang="en">/);
  for(const path of ['LICENSE','node_modules/zod/LICENSE'])assert(html.includes(readFileSync(new URL(path,root),'utf8').trim()));
});
