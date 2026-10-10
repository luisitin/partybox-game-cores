import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const sourcePath='node_modules/playwright-core/lib/generated/clockSource.js';
const report={diagnostic:true,acceptance:false,startedAt:new Date().toISOString(),pid:process.pid,dependencySha256:hash(await readFile(sourcePath)),htmlSha256:hash(await readFile('play.html')),runnerSha256:hash(await readFile(new URL(import.meta.url))),method:'Actual empty about:blank pages, unmodified Playwright1.56.0. Compare default auto clock with clock explicitly paused before app timers. Each runs40 awaited fastForward(10000) calls with native Node25ms scheduling gaps; retain every100ms interval callback and before/after performance sample. No game scripts, FPS, recording, tracing or dependency patch. This is a browser control, not proof of the schedule in past hosted failures.',profiles:[],runtime:{errors:[],requests:[]},complete:false};
console.log(JSON.stringify({pid:process.pid,startedAt:report.startedAt}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});report.browser=browser.version();let context;
const wallStart=performance.now(),base=Date.UTC(2026,9,8);
try{
 for(const mode of ['auto','paused']){
  context=await browser.newContext({offline:true});const page=await context.newPage();page.on('pageerror',e=>report.runtime.errors.push({mode,error:String(e)}));page.on('request',r=>report.runtime.requests.push({mode,url:r.url()}));
  await page.clock.install({time:base});if(mode==='paused')await page.clock.pauseAt(base+1000);await page.goto('about:blank');
  await page.evaluate(()=>{window.clockControlSamples=[];window.clockControlSample=label=>{window.clockControlSamples.push({sequence:window.clockControlSamples.length,label,performanceNow:performance.now(),timeOrigin:performance.timeOrigin,dateNow:Date.now()});};setInterval(()=>window.clockControlSample('interval'),100);window.clockControlSample('initial');});
  const item={mode,iterations:[],samples:[]};report.profiles.push(item);
  for(let i=0;i<40;i++){
   if(performance.now()-wallStart>80000){item.stoppedForBound=true;break;}
   await page.evaluate(i=>window.clockControlSample(`beforeFastForward${i}`),i);await page.clock.fastForward(10000);await page.evaluate(i=>window.clockControlSample(`afterFastForward${i}`),i);
   await new Promise(resolve=>setTimeout(resolve,25));await page.evaluate(i=>window.clockControlSample(`afterNativeGap${i}`),i);item.iterations.push(i);
  }
  item.samples=await page.evaluate(()=>window.clockControlSamples);item.rollbacks=item.samples.flatMap((sample,i)=>i&&sample.performanceNow<item.samples[i-1].performanceNow?[{previous:item.samples[i-1],current:sample,difference:sample.performanceNow-item.samples[i-1].performanceNow}]:[]);
  console.log(JSON.stringify({mode,iterations:item.iterations.length,samples:item.samples.length,rollbacks:item.rollbacks}));await context.close();context=null;
 }
 report.complete=report.profiles.length===2&&report.profiles.every(p=>p.iterations.length===40);
}catch(error){report.error=String(error);process.exitCode=1;}
finally{if(context)await context.close();await browser.close();report.finishedAt=new Date().toISOString();report.wallDurationMs=performance.now()-wallStart;report.dependencySha256After=hash(await readFile(sourcePath));report.htmlSha256After=hash(await readFile('play.html'));await writeFile('.work/clock-browser-control.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({closedAt:report.finishedAt,complete:report.complete,wallDurationMs:report.wallDurationMs,error:report.error}));}
