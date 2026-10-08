// Actual disk browser sampling. This host tool never changes the owner game.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {chromium} from 'playwright-core';
import {sourceHashes,sha256,summarize} from './evidence';
import {frameProfiles,waitForFrameGrant,parseFrameGrantTimeout,type FrameProfile} from './frame-coordination';
const grantTimeoutMs=parseFrameGrantTimeout(process.env.G08_FRAME_GRANT_TIMEOUT_MS);
const directory=resolve(process.env.G08_FRAME_OUTPUT??join('.tmp/visual',`frames-${randomUUID()}`));
mkdirSync(resolve('.tmp/visual'),{recursive:true});mkdirSync(directory); // existing attempts are refused
const target=`file://${resolve('play.html')}`,startedAt=new Date().toISOString(),startHashes=sourceHashes();
const selected=process.env.G08_FRAME_PROFILES?.split(',')??[...frameProfiles];
assert(selected.length>0&&new Set(selected).size===selected.length);for(const p of selected)assert(frameProfiles.includes(p as FrameProfile));
const profiles:unknown[]=[],errors:string[]=[],outgoing:string[]=[],failures:string[]=[];
const browser=await chromium.launch({headless:true,...(process.env.G08_CHROMIUM?{executablePath:process.env.G08_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const name of selected){
  const profile=name as FrameProfile,lang=name.startsWith('es')?'es':'en',grid=lang==='es'?'5x5':'4x4',phone=name.includes('phone'),width=phone?390:1920,height=phone?844:1080,cpuThrottle=phone?4:1;
  const context=await browser.newContext({viewport:{width,height},hasTouch:phone,reducedMotion:'no-preference'});
  try{
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))outgoing.push(r.url().split('?')[0]!);});
   await page.goto(target);await page.getByRole('button',{name:'Start Shake Up',exact:true}).waitFor();
   await page.getByLabel(/^Players/).selectOption('2');await page.getByLabel('Seed',{exact:true}).fill('17');await page.getByLabel(/^Grid/).selectOption(grid);await page.getByLabel(/^Rounds/).selectOption('1');await page.getByLabel(/^Seconds per person/).selectOption('240');await page.getByLabel(/^Words/).selectOption(lang);
   await page.getByRole('button',{name:lang==='es'?'Empezar Shake Up':'Start Shake Up',exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Continuar':'Continue',exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Estoy listo':'I’m ready',exact:true}).click();
   assert.equal(await page.getByRole('gridcell').count(),lang==='es'?25:16);if(!phone)await page.getByRole('button',{name:lang==='es'?'Pantalla pública':'Public stage',exact:true}).click();
   const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuThrottle});
   assert.deepEqual(sourceHashes(),startHashes,'sources changed before sample');
   // Use the existing real pause control while coordination waits; resume before sampling.
   const pausedForCoordination=Boolean(process.env.G08_FRAME_BARRIER_DIR);
   if(pausedForCoordination)await page.getByRole('button',{name:lang==='es'?'Pausar':'Pause',exact:true}).click();
   const runtime=async()=>{const timerTexts=await page.locator('[role="timer"],[aria-live="polite"]').allTextContents(),clockSeconds=timerTexts.flatMap(text=>{const m=text.match(/([0-9]+):([0-9]{2})/);return m?[Number(m[1])*60+Number(m[2])]:[];});return{phase:await page.locator('main').getAttribute('data-phase'),resumeVisible:await page.getByRole('button',{name:lang==='es'?'Reanudar':'Resume',exact:true}).count(),pauseVisible:await page.getByRole('button',{name:lang==='es'?'Pausar':'Pause',exact:true}).count(),handoffCount:await page.locator('.handoff').count(),phoneOwnerCount:await page.locator('.phone-owner').count(),tvOwnerCount:await page.locator('.tv-owner').count(),gridCells:await page.getByRole('gridcell').count(),timerTexts,clockSeconds};};
   const pausedRuntime=pausedForCoordination?await runtime():null;
   if(pausedRuntime){assert.equal(pausedRuntime.phase,'hunt');assert.equal(pausedRuntime.resumeVisible,1);assert.equal(pausedRuntime.pauseVisible,0);}
   const ready=process.env.G08_FRAME_BARRIER_DIR?await waitForFrameGrant(process.env.G08_FRAME_BARRIER_DIR,profile,startHashes['play.html']!,grantTimeoutMs):null;
   const pausedRuntimeAtGrant=pausedForCoordination?await runtime():null;if(pausedForCoordination)assert.deepEqual(pausedRuntimeAtGrant,pausedRuntime,'real paused timer changed while awaiting grant');
   const resumeStartedAt=pausedForCoordination?new Date().toISOString():null,resumeStartedMono=performance.now();
   if(pausedForCoordination)await page.getByRole('button',{name:lang==='es'?'Reanudar':'Resume',exact:true}).click();
   const resumedRuntime=await runtime();assert.equal(resumedRuntime.resumeVisible,0);assert.equal(resumedRuntime.pauseVisible,1);assert.equal(resumedRuntime.phase,'hunt');assert.equal(resumedRuntime.handoffCount,0);assert.equal(resumedRuntime.phoneOwnerCount,phone?1:0);assert.equal(resumedRuntime.tvOwnerCount,phone?0:1);assert.equal(resumedRuntime.gridCells,lang==='es'?25:16);assert.equal(resumedRuntime.clockSeconds.length,1);assert(resumedRuntime.clockSeconds[0]!>200,'actual hunt clock must be live at sample start');
   const resumeCompletedAt=pausedForCoordination?new Date().toISOString():null;
   assert.equal(await page.locator('main').getAttribute('data-phase'),'hunt');
   const sampleStartedAt=new Date().toISOString(),resumeToSampleCallMs=pausedForCoordination?performance.now()-resumeStartedMono:null;
   const sample=await page.evaluate<{intervalsMs:number[];anchorTimestampMs:number;anchorExecutionMs:number;anchorWallTime:string;finalTimestampMs:number}>(`new Promise(done=>{const raw=[];let previous=null,anchorTimestampMs=null,anchorExecutionMs=null,anchorWallTime=null;const tick=now=>{if(previous!==null)raw.push(now-previous);else{anchorTimestampMs=now;anchorExecutionMs=performance.now();anchorWallTime=new Date().toISOString();}previous=now;if(raw.length===600)done({intervalsMs:raw,anchorTimestampMs,anchorExecutionMs,anchorWallTime,finalTimestampMs:now});else requestAnimationFrame(tick);};requestAnimationFrame(tick);})`);
   const {intervalsMs}=sample;
   const sampleClosedAt=new Date().toISOString();
   if(ready)writeFileSync(join(process.env.G08_FRAME_BARRIER_DIR!,`${profile}-closed.json`),JSON.stringify({...ready,sampleClosedAt,capturing:false})+'\n',{flag:'wx'});
   const sampledRuntime=await runtime(),clockElapsedSeconds=(resumedRuntime.clockSeconds[0]??NaN)-(sampledRuntime.clockSeconds[0]??NaN);
   const endHashes=sourceHashes(),rawFile=`${profile}-raw.json`,result={profile,lang,grid,width,height,cpuThrottle,...sample,...summarize(intervalsMs),frameFiltering:'none',rawFile,attemptNonce:ready?.attemptNonce??null,pausedForCoordination,pausedRuntime,pausedRuntimeAtGrant,resumedRuntime,sampledRuntime,clockElapsedSeconds,resumeStartedAt,resumeCompletedAt,resumeToSampleCallMs,capturing:false,sampleStartedAt,sampleClosedAt,startHashes,endHashes};
   writeFileSync(join(directory,rawFile),JSON.stringify(result,null,2)+'\n',{flag:'wx'});profiles.push({...result,rawSha256:sha256(JSON.stringify(result,null,2)+'\n')});
   // Raw data is retained before any threshold assertion.
   assert.equal(intervalsMs.length,600);assert(intervalsMs.every(n=>Number.isFinite(n)&&n>0),'unfiltered invalid interval');assert.deepEqual(endHashes,startHashes);assert.equal(sampledRuntime.phase,'hunt','actual hunt must remain active at sample end');assert.equal(sampledRuntime.resumeVisible,0);assert.equal(sampledRuntime.pauseVisible,1);assert.equal(sampledRuntime.handoffCount,0);assert.equal(sampledRuntime.phoneOwnerCount,phone?1:0);assert.equal(sampledRuntime.tvOwnerCount,phone?0:1);assert.equal(sampledRuntime.gridCells,resumedRuntime.gridCells);assert.equal(sampledRuntime.clockSeconds.length,1);assert(Math.abs(clockElapsedSeconds-result.milliseconds/1000)<=2,'actual player clock must advance with the native frame sample');assert(result.fps>=59,`${profile}: ${result.fps} FPS below 59`);assert(result.p95Ms<=20,`${profile}: p95 ${result.p95Ms}ms exceeds 20`);
  }catch(error){failures.push(String(error));throw error;}finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(outgoing,[]);
}catch(error){if(!failures.length)failures.push(String(error));}
finally{
 await browser.close();const endHashes=sourceHashes(),passed=failures.length===0&&selected.length===4&&JSON.stringify(startHashes)===JSON.stringify(endHashes);
 const report={version:2,kind:'actual-disk-frames',target,fileOpened:true,startedAt,finishedAt:new Date().toISOString(),sampleCount:600,meanFpsMinimum:59,p95MsMaximum:20,frameFiltering:'none',capturing:false,sourceSha256:startHashes['play.html'],startHashes,endHashes,profiles,pageErrors:errors,outgoingRequests:outgoing,failures,passed};
 const reportPath=join(directory,'report.json');writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});writeFileSync('.tmp/visual/browser-frames-current-path.txt',reportPath+'\n');console.log(JSON.stringify({reportPath,passed,failures,profiles:profiles.map(p=>{const r=p as Record<string,unknown>;return{profile:r.profile,fps:r.fps,p95Ms:r.p95Ms};})}));if(!passed)process.exitCode=1;
}
