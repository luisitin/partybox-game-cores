import {chromium} from 'playwright';
import {existsSync,readFileSync,mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const executable=process.env.CHROMIUM_PATH??(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox']});
mkdirSync('media',{recursive:true});const url='file://'+resolve('play.html');
const errors:string[]=[],requests:string[]=[];
async function pageFor(viewport:{width:number;height:number},reducedMotion:'reduce'|'no-preference'='no-preference'){
 const context=await browser.newContext({viewport,reducedMotion});const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.route('**/*',route=>/^https?:/.test(route.request().url())?route.abort():route.continue());
 await page.setContent(readFileSync('play.html','utf8'));return {page,context};
}
try {
 const {page,context}=await pageFor({width:390,height:844});
 await page.selectOption('#opening','rotating');await page.selectOption('#seat-1','human');await page.click('#start');
 assert.equal(await page.locator('#hand .hand-tile').count(),0,'human hand must start hidden');
 await page.getByRole('button',{name:/reveal hand/}).click();assert.equal(await page.locator('#hand .hand-tile').count(),7);
 await page.getByRole('button',{name:'Right →',exact:true}).first().click();assert.equal(await page.locator('#hand .hand-tile').count(),0,'next player hand must stay hidden');
 assert.match(await page.locator('#status').innerText(),/Seat 2/);await page.getByRole('button',{name:/reveal hand/}).click();assert.equal(await page.locator('#hand .hand-tile').count(),7);
 await page.screenshot({path:'media/phone.png',fullPage:true});await page.click('#end');assert.equal(await page.locator('#status').innerText(),'Match complete');await context.close();
 const automated=await pageFor({width:1920,height:1080});await automated.page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
 await automated.page.selectOption('#players','4');await automated.page.check('#partners');await automated.page.selectOption('#mode','block');
 for(let i=0;i<4;i++)await automated.page.selectOption(`#seat-${i}`,'normal');await automated.page.click('#start');
 await automated.page.clock.runFor(300000);assert.equal(await automated.page.locator('#status').innerText(),'Match complete','full browser bot match must terminate');await automated.context.close();
 const performanceReports=[];
 for(const [name,viewport,throttle] of [['tv',{width:1920,height:1080},1],['phone',{width:390,height:844},4]] as const){
  const {page,context}=await pageFor(viewport);const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  await page.selectOption('#seat-0','sharp');await page.selectOption('#seat-1','normal');await page.click('#start');
  const frames=await page.evaluate(()=>new Promise<number[]>(resolve=>{const deltas:number[]=[];let previous:number|null=null;function tick(now:number){if(previous!==null)deltas.push(now-previous);previous=now;if(deltas.length>=300)resolve(deltas);else requestAnimationFrame(tick);}requestAnimationFrame(tick);}));
  const sorted=[...frames].sort((a,b)=>a-b);const mean=frames.reduce((a,b)=>a+b,0)/frames.length;
  const report={name,viewport,throttle,frames:frames.length,meanMs:mean,p95Ms:sorted[Math.floor(sorted.length*.95)],p99Ms:sorted[Math.floor(sorted.length*.99)],fps:1000/mean};performanceReports.push(report);console.log(report);
  assert(report.fps>=58,`${name}: average refresh below 58fps`);assert(report.p95Ms!<=18,`${name}: p95 frame time above one refresh`);
  if(name==='tv'){
   assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),'TV match must fit its viewport');
   await page.screenshot({path:'media/tv.png',fullPage:true});const capture=mkdtempSync(join(tmpdir(),'G01-capture-'));
   for(let i=0;i<36;i++){await page.screenshot({path:join(capture,`${String(i).padStart(3,'0')}.png`)});await page.waitForTimeout(66);}
   const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','12','-i',join(capture,'%03d.png'),'-c:v','libvpx-vp9','-b:v','700k','-an','media/milestone-5-samples32.webm'],{encoding:'utf8'});assert.equal(encoded.status,0,encoded.error?.message||encoded.stderr||String(encoded.signal));rmSync(capture,{recursive:true});
  }
  await context.close();
 }
 const reduced=await pageFor({width:390,height:844},'reduce');assert(await reduced.page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
 await reduced.page.click('#start');await reduced.page.getByRole('button',{name:/reveal hand/}).click();assert.equal(await reduced.page.locator('#hand .hand-tile').count(),7);assert.equal(await reduced.page.evaluate(()=>document.getAnimations().length),0);
 await reduced.context.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 writeFileSync('browser-report.json',JSON.stringify({functional:'passed',navigationMode:'setContent; managed Chromium blocks file:// navigation',externalRequests:requests,errors,performance:performanceReports,reducedMotion:'passed',capture:'media/milestone-5-samples32.webm'},null,2)+'\n');
 console.log('Browser functional, hot-seat privacy, offline, frame-time and reduced-motion checks pass');
} finally {await browser.close();}
