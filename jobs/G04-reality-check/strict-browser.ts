import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import type {Page} from 'playwright';
import {strictSourceHashes,strictRuntimeIdentity,sha256} from './strict-source-guard.ts';
import {awaitStrictGrant,closeStrictWindow,type Window} from './strict-coordination.ts';
import {strictFrameStatistics,verifyStrictProfile,verifyStrictCurrent,type Witness,type Raw,type Report,type Capture} from './strict-browser-proof.ts';
import {decodeCurrentCapture} from './strict-decode.ts';

const sourceStart=strictSourceHashes(),runtimeIdentity=strictRuntimeIdentity(),runId=randomUUID();
const {chromium}=await import('playwright'),{game}=await import('./core.ts'),{encodeCapture}=await import('./capture-encoder.ts');
assert.deepEqual(strictSourceHashes(),sourceStart,'sources changed while loading actual game and checker dependencies');
const fileUrl=pathToFileURL(resolve('play.html')).href;
const only=process.argv.find(x=>/^--profile=(tv|phone)$/.test(x))?.split('=')[1] as 'tv'|'phone'|undefined;
const profiles=only?[only]:['tv','phone'] as ('tv'|'phone')[],skipCapture=process.argv.includes('--skip-capture');
mkdirSync('.work/strict',{recursive:true});mkdirSync('media',{recursive:true});
const report:Report={runId,passed:false,failure:null,scope:only||skipCapture?'partial local profile only; not full acceptance':'current native workload and separately decoded captures',sourceStart,sourceEnd:{},runtimeIdentity,profiles:[],captures:[],physicalPhoneTested:false};
const raws:Raw[]=[];const browser=await chromium.launch({headless:true,executablePath:process.env.G04_BROWSER_EXECUTABLE,args:['--no-sandbox']});
const witness=():Witness=>{
 const fake=document.querySelector<HTMLTextAreaElement>('#fake'),publicEl=document.querySelector<HTMLElement>('#public')!,privateEl=document.querySelector<HTMLElement>('#private')!;
 return {nativeNowMs:performance.now(),wallUtcMs:Date.now(),phase:publicEl.dataset.phase??null,setupHidden:document.querySelector<HTMLElement>('#setup')!.hidden,matchHidden:document.querySelector<HTMLElement>('#match')!.hidden,pauseButton:document.querySelector('#pause')!.textContent!.trim(),privateOpen:privateEl.dataset.open??null,inputCount:privateEl.querySelectorAll('input,textarea').length,fakeValue:fake?.value??null,fakeDisabled:fake?.disabled??false,countdown:document.querySelector('#countdown')?.textContent??null,controllerCountdown:document.querySelector('#controller-countdown')?.textContent??null,question:document.querySelector('#public .question')?.textContent??'',received:Number(publicEl.textContent?.match(/(\d+) of 8 answers locked in/)?.[1]??-1)};
};
async function setup(profile:'tv'|'phone',errors:string[],externalRequests:string[]){
 const viewport=profile==='tv'?{width:1920,height:1080}:{width:390,height:844},cpuThrottle=profile==='tv'?1:4;
 const context=await browser.newContext({viewport}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))externalRequests.push(r.url());});
 await page.route('**/*',r=>r.request().url()===fileUrl?r.continue():r.abort());await page.goto(fileUrl);assert.equal(page.url(),fileUrl);
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuThrottle});
 const seed=Array.from({length:999},(_,i)=>i+1).find(seed=>game.init({players:[0,1].map(i=>({id:'p'+i,name:'Player '+(i+1),avatarId:'🙂',connected:true})),seed,now:100000,settings:{mode:'bluff',rounds:8}}).question.kind==='bluff');assert(seed);
 await page.selectOption('#players','8');for(let i=1;i<8;i++)await page.selectOption('#seat-'+i,i%2?'sharp':'normal');
 await page.selectOption('#mode','bluff');await page.selectOption('#rounds','8');await page.fill('#seed',String(seed));await page.click('#start');await page.click('#skip');await page.click('#skip');
 assert.equal(await page.locator('#public').getAttribute('data-phase'),'write');await page.click('#pause');
 return {context,page,viewport,cpuThrottle};
}
async function resume(page:Page){await page.click('#pause');await page.click('#reveal-private');await page.fill('#fake','My harbour bluff');}
async function capture(profile:'tv'|'phone'):Promise<Capture>{
 const sourceStart=strictSourceHashes(),errors:string[]=[],externalRequests:string[]=[],{context,page}=await setup(profile,errors,externalRequests);await resume(page);
 const directory=mkdtempSync(join(tmpdir(),'G04-strict-clip-')),path='media/strict-reverify-2019-'+profile+'.webm',witnesses:Witness[]=[];
 try{
  for(let i=0;i<24;i++){if(i===8)await page.click('#hide-private');if(i===16){await page.click('#reveal-private');assert.equal(await page.inputValue('#fake'),'My harbour bluff');}witnesses.push(await page.evaluate(witness));await page.screenshot({path:join(directory,String(i).padStart(3,'0')+'.jpg'),quality:80});await page.waitForTimeout(66);}
  encodeCapture(directory,path);const decoded=decodeCurrentCapture(path);assert.equal(decoded.frames,24);
  const sourceEnd=strictSourceHashes();assert.deepEqual(sourceEnd,sourceStart);return {profile,path,bytes:statSync(path).size,sha256:sha256(readFileSync(path)),frames:24,encodedFps:12,performanceMeasurement:false,decoded:true,decodeExit:decoded.exit,witnesses,sourceStart,sourceEnd,errors,externalRequests};
 }finally{await context.close();rmSync(directory,{recursive:true,force:true});}
}
try{
 for(const profile of profiles){
  const errors:string[]=[],externalRequests:string[]=[],{context,page,viewport,cpuThrottle}=await setup(profile,errors,externalRequests);
  let window:Window|null=null,closed=false;
  try{
   const beforeGrant=await page.evaluate(witness);assert.equal(beforeGrant.pauseButton,'Resume');assert.equal(beforeGrant.phase,'write');assert.equal(beforeGrant.countdown,'Paused');
   window=await awaitStrictGrant(profile,sourceStart['play.html']!,beforeGrant);
   assert.deepEqual(strictSourceHashes(),sourceStart,'sources changed while waiting');
   await resume(page);const afterGrant=await page.evaluate(witness);
   // Neither the native clocks nor the game timer are installed, held or
   // patched. All 601 callbacks and all 600 differences are retained.
   const sample=await page.evaluate(()=>new Promise<{timestamps:number[];intervals:number[];witnesses:Witness[];nativeClock:Record<string,boolean>}>(done=>{
    const isNative=(fn:Function)=>Function.prototype.toString.call(fn).includes('[native code]');
    const nativeClock={requestAnimationFrame:isNative(requestAnimationFrame),performanceNow:isNative(performance.now),dateNow:isNative(Date.now),setTimeout:isNative(setTimeout),setInterval:isNative(setInterval)};
    const timestamps:number[]=[],intervals:number[]=[],witnesses:Witness[]=[];
    function tick(now:number){
     if(timestamps.length)intervals.push(now-timestamps[timestamps.length-1]!);timestamps.push(now);
     const fake=document.querySelector<HTMLTextAreaElement>('#fake'),publicEl=document.querySelector<HTMLElement>('#public')!,privateEl=document.querySelector<HTMLElement>('#private')!;
     witnesses.push({nativeNowMs:performance.now(),wallUtcMs:Date.now(),phase:publicEl.dataset.phase??null,setupHidden:document.querySelector<HTMLElement>('#setup')!.hidden,matchHidden:document.querySelector<HTMLElement>('#match')!.hidden,pauseButton:document.querySelector('#pause')!.textContent!.trim(),privateOpen:privateEl.dataset.open??null,inputCount:privateEl.querySelectorAll('input,textarea').length,fakeValue:fake?.value??null,fakeDisabled:fake?.disabled??false,countdown:document.querySelector('#countdown')?.textContent??null,controllerCountdown:document.querySelector('#controller-countdown')?.textContent??null,question:document.querySelector('#public .question')?.textContent??'',received:Number(publicEl.textContent?.match(/(\d+) of 8 answers locked in/)?.[1]??-1)});
     if(intervals.length===600)done({timestamps,intervals,witnesses,nativeClock});else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
   }));
   const afterSample=await page.evaluate(witness),sourceAfterSample=strictSourceHashes(),raw:Raw={runId,profile,attemptNonce:window.attemptNonce,sourceSha256:sourceStart['play.html']!,viewport,cpuThrottle,transport:'file:',rawFiltering:'none',performanceWhileRecording:false,...sample,...strictFrameStatistics(sample.intervals),beforeGrant,afterGrant,afterSample,sourceStart,sourceAfterSample,runtimeIdentity,window:null,errors,externalRequests};
   // Raw reaches disk before the closure, assertions or any recording.
   writeFileSync('.work/strict/'+profile+'-raw.json',JSON.stringify(raw,null,2)+'\n');
   raw.window=closeStrictWindow(window,{status:'samples-written',rawIntervals:raw.intervals.length,rawPath:'.work/strict/'+profile+'-raw.json'});closed=true;
   writeFileSync('.work/strict/'+profile+'-raw.json',JSON.stringify(raw,null,2)+'\n');raws.push(raw);report.profiles.push(profile);
   console.log(JSON.stringify({profile,actualIntervals:raw.intervals.length,nativeTimestamps:raw.timestamps.length,activeWitnesses:raw.witnesses.length,fps:raw.fps,p95Ms:raw.p95Ms,p99Ms:raw.p99Ms,maxMs:raw.maxMs,sourceGuards:Object.keys(sourceStart).length}));
   verifyStrictProfile(raw,sourceStart,runtimeIdentity);
  }finally{if(window&&!closed)closeStrictWindow(window,{status:'failed',reason:'sampler did not reach raw closure'});await context.close();}
 }
 if(!skipCapture&&!only)for(const profile of profiles)report.captures.push(await capture(profile));
 report.sourceEnd=strictSourceHashes();assert.deepEqual(report.sourceEnd,sourceStart);report.passed=true;
 if(!skipCapture&&!only)console.log(JSON.stringify(verifyStrictCurrent(report,raws,sourceStart,runtimeIdentity)));
}catch(e){report.failure=e instanceof Error?e.message:String(e);throw e;}
finally{report.sourceEnd=strictSourceHashes();writeFileSync('.work/strict/'+(only?'report-'+only:'report')+'.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
