import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {observeClockClick} from './clock-observation.mjs';
import {readSourceGuards} from './browser-evidence.mjs';

// Real ordinary clicks and a deliberately delayed REAL observation show why
// a later RPC clock is the wrong event-time anchor. This is not an FPS test
// and does not identify the cause of any historical failure.
const html=resolve('play.html'),htmlSha256=createHash('sha256').update(await readFile(html)).digest('hex');
const sourceGuardHashes=await readSourceGuards();
let executablePath=process.env.CHROMIUM_PATH;
if(!executablePath){try{await access(chromium.executablePath(),constants.X_OK);}catch{executablePath='/usr/bin/chromium';}}
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
const rows=[],errors=[],network=[];let failure=null;
const state=page=>page.evaluate(()=>JSON.stringify(window.__G07.state())).then(JSON.parse);
try {
 for(const profile of [{label:'desktop',width:1920,height:1080,cpuThrottle:1},{label:'phone4x',width:390,height:844,cpuThrottle:4}]){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},offline:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpuThrottle});
  await page.goto(pathToFileURL(html).href);await page.waitForFunction(()=>Boolean(window.__G07));
  await page.evaluate(()=>window.__G07.init({players:2,mode:'hotseat',pace:'manual',seed:7199,settings:{turnSeconds:3}}));
  await page.waitForTimeout(150);await page.locator('#pause').click();const paused=await state(page);
  await page.waitForTimeout(1250);const live=await observeClockClick(page,'#resume');
  const shifted=live.state.phase.deadline-paused.phase.deadline,expected=live.record.clickHostBefore-paused.phase.paused.at;
  assert(Math.abs(shifted-expected)<200,'original200ms criterion at real event time');
  for(const delta of [-600,600])assert(Math.abs(shifted+delta-expected)>=200,'wrong-deadline copy rejected');
  assert(Math.abs(0-expected)>=200,'unshifted-deadline copy rejected');
  await page.waitForTimeout(425);const lateLiveAt=await page.evaluate(()=>window.__G07.time());
  const staleLiveErrorMs=Math.abs(shifted-(lateLiveAt-paused.phase.paused.at));
  assert(staleLiveErrorMs>=200,'deliberately delayed real RPC must fail the old formula');
  rows.push({...profile,kind:'pause-resume',...live.record,beforeDeadline:paused.phase.deadline,pausedAt:paused.phase.paused.at,afterDeadline:live.state.phase.deadline,eventErrorMs:Math.abs(shifted-expected),lateHostNow:lateLiveAt,deliberateObservationDelayMs:425,staleFormulaErrorMs:staleLiveErrorMs,limitMs:200,wrongDeadlineCopiesRejected:3});

  await page.evaluate(()=>window.__G07.init({players:2,mode:'hotseat',pace:'manual',seed:7199,settings:{turnSeconds:3}}));
  await page.waitForTimeout(650);const before=await page.evaluate(()=>{window.__G07.save();return JSON.parse(sessionStorage.getItem('partybox.g07.session.v1'));});
  const remaining=before.state.phase.deadline-before.savedHostNow,elapsed=before.savedHostNow-before.state.phase.startedAt;
  assert(elapsed>=600&&remaining>0&&remaining<=2400,'genuine pre-save elapsed time');
  await page.reload();await page.waitForFunction(()=>Boolean(window.__G07));assert.equal(await state(page),null);
  const first=await page.evaluate(()=>sessionStorage.getItem('partybox.g07.session.v1'));
  await page.waitForTimeout(1250);await page.reload();await page.waitForFunction(()=>Boolean(window.__G07));assert.equal(await state(page),null);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('partybox.g07.session.v1')),first,'pending reload does not change candidate');
  await page.waitForTimeout(500);const saved=await observeClockClick(page,'#resume-saved');
  const actual=saved.state.phase.deadline-saved.record.clickHostBefore,error=Math.abs(actual-remaining);
  assert(error<250,'original250ms criterion at the actual trusted click');assert.equal(saved.state.bid,null);
  for(const delta of [-600,600])assert(Math.abs(actual+delta-remaining)>=250,'wrong saved-deadline copy rejected');
  assert(Math.abs(3000-remaining)>=250,'reset-to-full3s deadline copy rejected after genuine time consumption');
  const actualCopy=structuredClone(saved.state),expectedCopy=structuredClone(before.state);actualCopy.phase.deadline=expectedCopy.phase.deadline;assert.deepEqual(actualCopy,expectedCopy,'complete saved state except the actual deadline shift');
  await page.waitForTimeout(425);const lateSavedAt=await page.evaluate(()=>window.__G07.time());
  const staleSavedErrorMs=Math.abs((saved.state.phase.deadline-lateSavedAt)-remaining);
  assert(staleSavedErrorMs>=250,'delayed real post-resume clock exposes the old observation error');
  rows.push({...profile,kind:'saved-resume',...saved.record,savedDeadline:before.state.phase.deadline,savedHostNow:before.savedHostNow,afterDeadline:saved.state.phase.deadline,elapsedBeforeCheckpointMs:elapsed,savedRemainingMs:remaining,fullClockMs:3000,eventErrorMs:error,lateHostNow:lateSavedAt,deliberateObservationDelayMs:425,staleFormulaErrorMs:staleSavedErrorMs,limitMs:250,wrongDeadlineCopiesRejected:3});
  await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
}catch(error){failure=error.stack??String(error);}finally{await browser.close();}
const sourceGuardHashesAfter=await readSourceGuards();
const guardsUnchanged=JSON.stringify(sourceGuardHashes)===JSON.stringify(sourceGuardHashesAfter);
const report={passed:failure===null&&rows.length===4&&guardsUnchanged,scope:'focused trusted-click observation diagnostic; no native FPS acceptance; no historical failure cause inferred',observedAt:new Date().toISOString(),htmlSha256,sourceGuardHashes,sourceGuardHashesAfter,guardsUnchanged,rows,pageErrors:errors,networkRequests:network,failure,negativeControlScope:'altered copies of genuine observed deadlines test checker sensitivity; they are not executed product mutations'};
await mkdir('.work/browser',{recursive:true});await writeFile('.work/browser/clock-observation-diagnostic.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,rows:rows.length,guards:sourceGuardHashes?Object.keys(sourceGuardHashes).length:0,realDelayedObservations:rows.map(r=>({profile:r.label,kind:r.kind,eventErrorMs:r.eventErrorMs,staleFormulaErrorMs:r.staleFormulaErrorMs})),failure}));
if(!report.passed)process.exitCode=1;
