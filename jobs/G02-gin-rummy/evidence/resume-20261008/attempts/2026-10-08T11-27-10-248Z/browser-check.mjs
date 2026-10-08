import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile,mkdir,readFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {seedHost,checkClock} from './clock-check.mjs';
import {checkMelds} from './meld-check.mjs';
import {checkResults} from './results-check.mjs';
import {checkNames} from './name-check.mjs';
import {checkHost} from './host-check.mjs';
const capture=process.argv.includes('--capture');
const snapshot=process.argv.includes('--snapshot');
const sourcePaths=['play.html','src/core.ts','src/cards.ts','src/browser.ts','src/play.template.html'];
const sourceHashes=async()=>Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
const sourceStart=await sourceHashes(),started=new Date().toISOString(),runId=started.replace(/[:.]/g,'-');
console.log(JSON.stringify({kind:'full browser proof',started,pid:process.pid,sourceStart}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('.work/browser',{recursive:true});await mkdir('media',{recursive:true});
const rows=[],extra={};let failure=null;
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
  const frames=await page.evaluate(async()=>{
   const times=[];let previous=null;
   return await new Promise(resolve=>{const tick=time=>{
    if(previous!==null)times.push(time-previous);previous=time;
    // Stress the actual hand UI, not an empty offscreen benchmark.
    const cards=document.querySelectorAll('#hand .card');if(cards.length)cards[times.length%cards.length].click();
    // Ten seconds at60Hz retains startup and occasional stalls in a longer
    // observation. No warm-up frames or outliers are removed.
    if(times.length<600)requestAnimationFrame(tick);else resolve(times);
   };requestAnimationFrame(tick);});
  });
  const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
  const p99=sorted[Math.floor((sorted.length-1)*.99)],max=sorted.at(-1),fps=1000/mean;
  await writeFile(`.work/browser/${label}-frames.json`,JSON.stringify({frames,meanMs:mean,p99Ms:p99,maxMs:max,fps},null,2)+'\n');
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
    targetRefreshHz:60,measurementRoundingTolerance:'mean >=59 FPS; p99 <=17ms',frameGatePassed,interactionChecks:17,networkRequests:requests.length,pageErrors:errors.length,reducedMotion:reduced});
  console.log(JSON.stringify({label,fps,meanMs:mean,p99Ms:p99,maxMs:max,networkRequests:0,pageErrors:0}));
 }
 extra.clock=await checkClock(browser);
 extra.melds=await checkMelds(browser);
 extra.results=await checkResults(browser);
 extra.names=await checkNames(browser);
 extra.host=await checkHost(browser);
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
}catch(error){failure=error;}finally{await browser.close();}
const sourceEnd=await sourceHashes(),sourceUnchanged=JSON.stringify(sourceStart)===JSON.stringify(sourceEnd);
const passed=!failure&&sourceUnchanged&&rows.length===2&&rows.every(x=>x.frameGatePassed)&&extra.host?.passed===5;
const report={runId,started,completed:new Date().toISOString(),passed,failure:failure?String(failure):null,sourceStart,sourceEnd,sourceUnchanged,htmlSha256:sourceEnd['play.html'],browser:'Chromium 141 Playwright 1.56.0',physicalPhoneTested:false,performanceWhileRecording:false,controlledHostSeed:7199,productionSeed:'Web Crypto outside pure core',clockRegressionIncluded:true,extra,rows};
await writeFile('.work/browser/report.json',JSON.stringify(report,null,2)+'\n');
const attempt=`.work/browser/attempts/${runId}`;await mkdir(attempt,{recursive:true});
for(const name of ['report.json',...rows.map(x=>x.label+'-frames.json')])await copyFile('.work/browser/'+name,attempt+'/'+name);
await copyFile(import.meta.filename,attempt+'/browser-check.mjs');
if(snapshot){
 const archive=`evidence/resume-20261008/attempts/${runId}`;await mkdir(archive,{recursive:true});
 for(const name of ['report.json','browser-check.mjs',...rows.map(x=>x.label+'-frames.json')])await copyFile(attempt+'/'+name,archive+'/'+name);
 if(passed){await copyFile('.work/browser/report.json','evidence/resume-20261008/browser.json');for(const row of rows)await copyFile(`.work/browser/${row.label}-frames.json`,`evidence/resume-20261008/${row.label}-frames.json`);}
}
console.log(JSON.stringify({runId,passed,sourceUnchanged,extraHostChecks:extra.host?.passed,rows:rows.map(({label,fps,p99Ms,maxMs,frameGatePassed})=>({label,fps,p99Ms,maxMs,frameGatePassed}))}));
if(failure)throw failure;
assert(sourceUnchanged,'source changed during the browser run');assert.equal(rows.length,2);
for(const row of rows){assert(row.fps>=59,`${row.label} actual mean rate ${row.fps}`);assert(row.p99Ms<=17,`${row.label} p99 ${row.p99Ms}`);}
assert(passed,'complete browser proof must pass');
