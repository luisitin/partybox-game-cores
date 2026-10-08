import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {browserSourceHashes} from './browser-source-guard.mjs';
import {awaitFrameGrant,closeFrameWindow} from './frame-coordination.mjs';
import {frameStatistics,verifyActiveHand} from './strict-browser-proof.mjs';
import {seedHost,checkClock} from './clock-check.mjs';
import {checkMelds} from './meld-check.mjs';
import {checkResults} from './results-check.mjs';
import {checkNames} from './name-check.mjs';
import {checkHost} from './host-check.mjs';
import {checkPublicHistory} from './public-history-check.mjs';
const capture=process.argv.includes('--capture');
const snapshot=process.argv.includes('--snapshot');
const sourceHashes=browserSourceHashes;
const sourceStart=await sourceHashes(),started=new Date().toISOString(),runId=started.replace(/[:.]/g,'-');
console.log(JSON.stringify({kind:'full browser proof',started,pid:process.pid,sourceStart}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('.work/browser',{recursive:true});await mkdir('media',{recursive:true});
for(const profile of ['desktop','phone4x'])await rm(`.work/browser/${profile}-frames.json`,{force:true});
const rows=[],extra={},writtenProfiles=[];let failure=null,frameWindow=null;
try {
 for(const [label,width,height,throttle]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const ctx=await browser.newContext({viewport:{width,height}});
  await seedHost(ctx);
  const page=await ctx.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('file:'))requests.push(r.url());});
  const cd=await ctx.newCDPSession(page);await cd.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  await page.goto('file://'+resolve('play.html'));
  await page.locator('#start').click();assert(await page.locator('#handoff').isVisible());
  assert.equal(await page.locator('#hand .card').count(),0,'cover must remove cards from DOM');
  await page.getByRole('button',{name:'Show my hand'}).click();assert.equal(await page.locator('#hand .card').count(),10);
  await page.getByRole('button',{name:'Pass upcard'}).click();assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'Show my hand'}).click();await page.getByRole('button',{name:'Pass upcard'}).click();
  await page.getByRole('button',{name:'Show my hand'}).click();await page.getByRole('button',{name:'Draw stock',exact:true}).click();
  assert.equal(await page.locator('#hand .card').count(),11);
  await page.locator('#hand .card').first().click();await page.getByRole('button',{name:'Discard selected'}).click();assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'Show my hand'}).click();
  const activeHand=()=>{
   const el=id=>document.getElementById(id),buttons=[...document.querySelectorAll('#actions button')];
   const draw=label=>buttons.some(b=>b.textContent===label&&!b.disabled);
   return {phase:el('status').textContent.endsWith(' · draw one card')?'draw':'other',cardCount:document.querySelectorAll('#hand .card').length,
    tableVisible:!el('table').hidden,setupHidden:el('setup').hidden,privateVisible:!el('private').hidden,handoffHidden:el('handoff').hidden,
    pauseButton:el('pause').textContent,clockHidden:el('clock').hidden,turnSeconds:Number(el('setting-turnSeconds').value),
    drawStockEnabled:draw('Draw stock'),drawDiscardEnabled:draw('Draw discard'),nativeNowMs:performance.now()};
  };
  const beforeGrant=await page.evaluate(activeHand);verifyActiveHand(beforeGrant);
  assert.deepEqual(await sourceHashes(),sourceStart,'guarded sources changed before READY');
  frameWindow=await awaitFrameGrant(label,sourceStart['play.html']);
  const afterGrant=await page.evaluate(activeHand);verifyActiveHand(afterGrant);
  const measured=await page.evaluate(async()=>{
   const witness=()=>{
    const el=id=>document.getElementById(id),buttons=[...document.querySelectorAll('#actions button')];
    const draw=label=>buttons.some(b=>b.textContent===label&&!b.disabled);
    return {phase:el('status').textContent.endsWith(' · draw one card')?'draw':'other',cardCount:document.querySelectorAll('#hand .card').length,
     tableVisible:!el('table').hidden,setupHidden:el('setup').hidden,privateVisible:!el('private').hidden,handoffHidden:el('handoff').hidden,
     pauseButton:el('pause').textContent,clockHidden:el('clock').hidden,turnSeconds:Number(el('setting-turnSeconds').value),
     drawStockEnabled:draw('Draw stock'),drawDiscardEnabled:draw('Draw discard'),nativeNowMs:performance.now()};
   };
   const times=[],timestamps=[],witnesses=[];let previous=null;
   const nativeClock={requestAnimationFrame:Function.prototype.toString.call(requestAnimationFrame).includes('[native code]'),performanceNow:Function.prototype.toString.call(performance.now).includes('[native code]')};
   return await new Promise(resolve=>{const tick=time=>{
    timestamps.push(time);witnesses.push(witness());
    if(previous!==null)times.push(time-previous);previous=time;
    // Stress the actual hand UI, not an empty offscreen benchmark.
    const cards=document.querySelectorAll('#hand .card');if(cards.length)cards[times.length%cards.length].click();
    // Ten seconds at60Hz retains startup and occasional stalls in a longer
    // observation. No warm-up frames or outliers are removed.
    if(times.length<600)requestAnimationFrame(tick);else resolve({frames:times,timestamps,witnesses,nativeClock,afterSample:witness()});
   };requestAnimationFrame(tick);});
  });
  // Persist actual output before any array/statistics/phase acceptance assertion.
  const {frames}=measured,sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
  const p99=sorted[Math.floor((frames.length-1)*.99)],max=sorted.at(-1),fps=1000/mean;
  const sourceAfterSample=await sourceHashes();
  const raw={...measured,runId,profile:label,sourceSha256:sourceStart['play.html'],attemptNonce:frameWindow.attemptNonce,
   viewport:{width,height},cpuThrottle:throttle,transport:'file:',rawFiltering:'none',performanceWhileRecording:false,
   beforeGrant,afterGrant,sourceStart,sourceAfterSample,meanMs:mean,p99Ms:p99,maxMs:max,fps};
  await writeFile(`.work/browser/${label}-frames.json`,JSON.stringify(raw,null,2)+'\n');
  writtenProfiles.push(label);
  const closed=closeFrameWindow(frameWindow,{status:'samples-written',rawIntervals:frames.length});frameWindow=null;
  frameStatistics(frames);
  assert.deepEqual(sourceAfterSample,sourceStart,'source changed during native sample');
  for(const witness of [beforeGrant,afterGrant,...measured.witnesses,measured.afterSample])verifyActiveHand(witness);
  // Display refresh quantization is 16.6/16.7ms; tolerate measurement rounding,
  // not sustained dropped frames. Actual unrounded values are preserved below.
  const frameGatePassed=fps>=59&&p99<=17.0;
  await page.emulateMedia({reducedMotion:'reduce'});
  const reduced=await page.evaluate(()=>{const c=document.querySelector('#hand .card');return {matches:matchMedia('(prefers-reduced-motion: reduce)').matches,transform:getComputedStyle(c).transform,animation:getComputedStyle(c).animationName};});
  assert(reduced.matches);assert.equal(reduced.transform,'none');assert.equal(reduced.animation,'none');
  // Covers clear on pause and after early end; user strings render as text.
  await page.getByRole('button',{name:'Pause',exact:true}).click();assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'Resume',exact:true}).click();assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'Leave this seat',exact:true}).click();assert((await page.locator('#scores').textContent()).includes('left; auto-playing'));
  assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'End match',exact:true}).click();assert(await page.locator('#status').textContent());
  assert.equal(errors.length,0,errors.join('\n'));assert.deepEqual(requests,[]);
  await page.screenshot({path:`.work/browser/${label}.png`,fullPage:true});
  await ctx.close();
  rows.push({label,viewport:{width,height},cpuThrottle:throttle,frames,meanMs:mean,p99Ms:p99,maxMs:max,fps,
    sourceSha256:raw.sourceSha256,attemptNonce:raw.attemptNonce,frameWindow:closed,
    targetRefreshHz:60,measurementRoundingTolerance:'mean >=59 FPS; p99 <=17ms',frameGatePassed,interactionChecks:17,networkRequests:requests.length,pageErrors:errors.length,reducedMotion:reduced});
  console.log(JSON.stringify({label,fps,meanMs:mean,p99Ms:p99,maxMs:max,networkRequests:0,pageErrors:0}));
  assert(frameGatePassed,`${label} actual strict frame gate failed: ${fps}FPS / p99 ${p99}ms`);
 }
 extra.clock=await checkClock(browser);
 extra.melds=await checkMelds(browser);
 extra.results=await checkResults(browser);
 extra.names=await checkNames(browser);
 extra.host=await checkHost(browser);
 extra.publicHistory=await checkPublicHistory(browser);
 if(capture) {
  // Recording has its own encoder cost. Capture the same playable UI in a
  // separate context; performance above measures normal play without recording.
  for(const [label,width,height]of [['desktop',1280,720],['phone4x',390,844]]){
   const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'.work/browser',size:{width,height}}});
   await seedHost(context);
   const page=await context.newPage(),cd=await context.newCDPSession(page);
   await cd.send('Emulation.setCPUThrottlingRate',{rate:label==='phone4x'?4:1});
   await page.goto('file://'+resolve('play.html'));
   if(process.argv.includes('--clock-capture'))await page.locator('#setting-turnSeconds').fill('10');
   await page.locator('#start').click();
   for(let i=0;i<2;i++){await page.getByRole('button',{name:'Show my hand'}).click();await page.getByRole('button',{name:'Pass upcard'}).click();}
   await page.getByRole('button',{name:'Show my hand'}).click();await page.getByRole('button',{name:'Draw stock',exact:true}).click();
   await page.locator('#hand .card').first().click();await page.getByRole('button',{name:'Discard selected'}).click();
   await page.getByRole('button',{name:'Show my hand'}).click();
   await page.screenshot({path:`.work/browser/${label}-active-hand.png`,fullPage:true});
   await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).click();
   await page.getByRole('button',{name:'Leave this seat',exact:true}).click();
   await page.screenshot({path:`.work/browser/${label}-after-departure.png`,fullPage:true});
   const video=page.video();await context.close();await video.saveAs(`media/milestone-${label}.webm`);
  }
 }
}catch(error){failure=error;closeFrameWindow(frameWindow,{status:'failed',reason:String(error)});frameWindow=null;}finally{await browser.close();}
const sourceEnd=await sourceHashes(),sourceUnchanged=JSON.stringify(sourceStart)===JSON.stringify(sourceEnd);
const passed=!failure&&sourceUnchanged&&rows.length===2&&rows.every(x=>x.frameGatePassed)&&extra.host?.passed===5&&extra.publicHistory?.length===2;
const report={runId,started,completed:new Date().toISOString(),passed,failure:failure?String(failure):null,sourceStart,sourceEnd,sourceUnchanged,htmlSha256:sourceEnd['play.html'],browser:'Chromium 141 Playwright 1.56.0',physicalPhoneTested:false,performanceWhileRecording:false,controlledHostSeed:7199,productionSeed:'Web Crypto outside pure core',clockRegressionIncluded:true,extra,rows};
await writeFile('.work/browser/report.json',JSON.stringify(report,null,2)+'\n');
const attempt=`.work/browser/attempts/${runId}`;await mkdir(attempt,{recursive:true});
for(const name of ['report.json',...writtenProfiles.map(x=>x+'-frames.json')])await copyFile('.work/browser/'+name,attempt+'/'+name);
await copyFile(import.meta.filename,attempt+'/browser-check.mjs');
if(snapshot){
 const archive=`evidence/resume-20261008/attempts/${runId}`;await mkdir(archive,{recursive:true});
 for(const name of ['report.json','browser-check.mjs',...writtenProfiles.map(x=>x+'-frames.json')])await copyFile(attempt+'/'+name,archive+'/'+name);
 if(passed){await copyFile('.work/browser/report.json','evidence/resume-20261008/browser.json');for(const row of rows)await copyFile(`.work/browser/${row.label}-frames.json`,`evidence/resume-20261008/${row.label}-frames.json`);}
}
console.log(JSON.stringify({runId,passed,sourceUnchanged,extraHostChecks:extra.host?.passed,rows:rows.map(({label,fps,p99Ms,maxMs,frameGatePassed})=>({label,fps,p99Ms,maxMs,frameGatePassed}))}));
if(failure)throw failure;
assert(sourceUnchanged,'source changed during the browser run');assert.equal(rows.length,2);
for(const row of rows){assert(row.fps>=59,`${row.label} actual mean rate ${row.fps}`);assert(row.p99Ms<=17,`${row.label} p99 ${row.p99Ms}`);}
assert(passed,'complete browser proof must pass');
