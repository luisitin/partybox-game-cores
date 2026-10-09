import {chromium} from 'playwright';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Functional context only: real animation finishes, no clock installation or FPS sample.
const source=(name:string)=>{const raw=readFileSync(name);return {bytes:raw.length,sha256:createHash('sha256').update(raw).digest('hex')};};
const sourcesBefore=Object.fromEntries(['ui.ts','play.html','privacy-veil-check.ts'].map(n=>[n,source(n)]));
mkdirSync('.tmp',{recursive:true});
const report:any={schema:'g01-real-animation-private-veil-regression/1',status:'STARTED',startedAt:new Date().toISOString(),scope:'Actual offline player Reveal/Hide handlers in one synchronous DOM task, then genuine native WAAPI completion. Phone390x844/4xCPU, normal motion. No synthetic game state, simulated clock, FPS or historical-cause claim.',sourcesBefore,viewport:{width:390,height:844},cpuThrottleRate:4,clockInstalled:false,navigation:'Exact play.html bytes page.setContent; no file navigation claim',steps:[],errors:[],externalRequests:[]};
const save=()=>writeFileSync('.tmp/privacy-veil-check.json',JSON.stringify(report,null,2)+'\n');
save();
let browser:Awaited<ReturnType<typeof chromium.launch>>|null=null;
let page:Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>['newPage']>>|null=null;
try{
 const executable=process.env.CHROMIUM_PATH??(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:report.viewport,reducedMotion:'no-preference'});
 page=await context.newPage();
 page.on('pageerror',e=>{report.errors.push(e.message);save();});
 page.on('request',r=>{if(/^https?:/.test(r.url())){report.externalRequests.push(r.url());save();}});
 await page.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue());
 await page.setContent(readFileSync('play.html','utf8'));
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.check('#players-4');for(let i=0;i<4;i++)await page.selectOption(`#seat-${i}`,'human');
 await page.setChecked('#partners',false);await page.check('#mode-block');await page.check('#target-250');
 await page.click('#houseRules summary');await page.selectOption('#opening','rotating');await page.fill('#seed','23');await page.click('#start');
 const actual=await page.evaluate(async()=>{
  const veil=document.querySelector<HTMLElement>('#veil')!;
  const snapshot=(label:string)=>({label,wallNow:Date.now(),nativePerformanceNow:performance.now(),veilHidden:veil.hidden,revealButtonVisible:!!document.querySelector('#privacy button')?.getClientRects().length,handTiles:document.querySelectorAll('#hand .hand-tile').length,status:document.querySelector('#status')!.textContent,boardTiles:[...document.querySelectorAll<HTMLElement>('#boardLayer .tile')].map(e=>Number(e.dataset.tile)),activeSeats:[...document.querySelectorAll<HTMLElement>('#seatsLayer .seat.active')].map(e=>Number(e.dataset.seat)),animations:veil.getAnimations().map(a=>({playState:a.playState,currentTime:a.currentTime,finishCallbackPresent:typeof a.onfinish==='function'}))});
  const steps=[snapshot('initial-private-prompt')];
  const reveal=document.querySelector<HTMLButtonElement>('#privacy button');
  if(!reveal)return {steps,actionFailure:'Initial Reveal button missing'};
  reveal.click();steps.push(snapshot('actual-reveal-handler'));
  const hide=[...document.querySelectorAll<HTMLButtonElement>('#actions button')].find(e=>e.textContent==='Hide my tiles');
  if(!hide)return {steps,actionFailure:'Hide button missing after Reveal'};
  hide.click();steps.push(snapshot('actual-hide-handler-before-old-finish'));
  await new Promise(resolve=>setTimeout(resolve,350));
  steps.push(snapshot('after-genuine-native-animation-finish'));
  return {steps,actionFailure:null};
 });
 report.steps=actual.steps;report.actionFailure=actual.actionFailure;save();
 assert.equal(actual.actionFailure,null);
 const [initial,revealed,hidden,finished]=actual.steps;
 assert(initial&&revealed&&hidden&&finished);
 assert.equal(initial.veilHidden,false);assert.equal(initial.handTiles,0);
 assert.equal(revealed.handTiles,5);assert.equal(revealed.veilHidden,true);
 assert.equal(hidden.veilHidden,false);assert.equal(hidden.handTiles,0);
 assert.equal(finished.veilHidden,false,'Old reveal animation must not hide a newly reopened private prompt');
 assert.equal(finished.revealButtonVisible,true);assert.equal(finished.handTiles,0);
 assert.deepEqual(finished.activeSeats,[0]);assert.deepEqual(finished.boardTiles,[]);
 assert.equal(finished.status,'Player 1’s turn');
 await page.locator('#privacy button').click();
 const reopened=await page.evaluate(()=>({label:'trusted-pointer-reopens-same-seat',wallNow:Date.now(),nativePerformanceNow:performance.now(),handTiles:document.querySelectorAll('#hand .hand-tile').length,status:document.querySelector('#status')!.textContent}));
 report.steps.push(reopened);save();
 assert.equal(reopened.handTiles,5);assert.equal(reopened.status,'Your turn, Player 1');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);
 report.status='PASS';report.finishedAt=new Date().toISOString();
}catch(error){
 report.status='FAIL';report.failure={type:error instanceof Error?error.name:'Error',message:String(error instanceof Error?error.message:error),stack:error instanceof Error?error.stack:null};save();throw error;
}finally{
 try{if(browser){await browser.close();report.browserClosedAt=new Date().toISOString();}report.sourcesAfter=Object.fromEntries(Object.keys(sourcesBefore).map(n=>[n,source(n)]));save();assert.deepEqual(report.sourcesAfter,sourcesBefore);}catch(error){report.status='FAIL';report.guardOrClosureFailure=String(error);throw error;}finally{save();}
}
console.log('Real native-animation Reveal/Hide private-prompt regression passed; no FPS claim.');
