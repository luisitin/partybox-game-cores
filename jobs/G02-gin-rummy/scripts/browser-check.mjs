import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const capture=process.argv.includes('--capture');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('.work/browser',{recursive:true});await mkdir('media',{recursive:true});
const rows=[];
try {
 for(const [label,width,height,throttle]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const ctx=await browser.newContext({viewport:{width,height}});
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
    if(times.length<180)requestAnimationFrame(tick);else resolve(times);
   };requestAnimationFrame(tick);});
  });
  const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
  const p99=sorted[Math.floor((sorted.length-1)*.99)],max=sorted.at(-1),fps=1000/mean;
  await writeFile(`.work/browser/${label}-frames.json`,JSON.stringify({frames,meanMs:mean,p99Ms:p99,maxMs:max,fps},null,2)+'\n');
  // Display refresh quantization is 16.6/16.7ms; tolerate measurement rounding,
  // not sustained dropped frames. Actual unrounded values are preserved below.
  assert(fps>=59,`${label} actual mean rate ${fps}`);assert(p99<=17.0,`${label} p99 ${p99}`);
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
    targetRefreshHz:60,measurementRoundingTolerance:'mean >=59 FPS; p99 <=17ms',interactionChecks:17,networkRequests:requests.length,pageErrors:errors.length,reducedMotion:reduced});
  console.log(JSON.stringify({label,fps,meanMs:mean,p99Ms:p99,maxMs:max,networkRequests:0,pageErrors:0}));
 }
 if(capture) {
  // Recording has its own encoder cost. Capture the same playable UI in a
  // separate context; performance above measures normal play without recording.
  for(const [label,width,height]of [['desktop',1280,720],['phone4x',390,844]]){
   const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'.work/browser',size:{width,height}}});
   const page=await context.newPage(),cd=await context.newCDPSession(page);
   await cd.send('Emulation.setCPUThrottlingRate',{rate:label==='phone4x'?4:1});
   await page.goto('file://'+resolve('play.html'));
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
}finally{await browser.close();}
const report={htmlSha256:createHash('sha256').update(await readFile('play.html')).digest('hex'),browser:'Chromium 141 Playwright 1.56.0',physicalPhoneTested:false,performanceWhileRecording:false,rows};
await writeFile('.work/browser/report.json',JSON.stringify(report,null,2)+'\n');
if(capture)await writeFile('evidence/browser-local.json',JSON.stringify(report,null,2)+'\n');
