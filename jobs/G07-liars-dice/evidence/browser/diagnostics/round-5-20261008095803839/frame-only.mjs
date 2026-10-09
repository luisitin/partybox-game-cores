import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {beginTrace,endTrace} from './trace-helper.mjs';
const args=process.argv.slice(2), argument=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const root='/workspace/game-cores-G07/jobs/G07-liars-dice';
const html=resolve(argument('--html',resolve(root,'play.html')));
const tag=argument('--tag','current'); assert(/^[a-z0-9-]+$/.test(tag));
const trace=args.includes('--trace'), requested=argument('--profile','both');
const profiles=[{label:'desktop',width:1920,height:1080,cpuThrottle:1},{label:'phone4x',width:390,height:844,cpuThrottle:4}].filter(p=>requested==='both'||requested===p.label);
assert(profiles.length);
const initialHash=createHash('sha256').update(await readFile(html)).digest('hex');
const runId=new Date().toISOString().replace(/\D/g,'');
const output=resolve(root,'.work/browser-diagnostics',`${tag}-${runId}`); await mkdir(output,{recursive:true});
let executablePath;
try{await access(chromium.executablePath(),constants.X_OK);}catch{executablePath='/usr/bin/chromium';}
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
const report={diagnosticOnly:true,authoritativeGate:false,html,initialHash,runId,browser:browser.version(),tracingAndCpuSampling:trace,
  isolation:'new whole browser process; one fresh context per profile; no functional navigation prelude',
  workload:'unchanged live eight-seat hotseat bid 8x3, open next cup, exact controller odds, quantity/face every30 intervals, every600 rAF interval retained',profiles:[]};
try{
  for(const profile of profiles){
    const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},offline:true});
    await context.addInitScript(()=>{
      try{sessionStorage.removeItem('partybox.g07.session.v1');}catch{}
      window.__g07DiagStorageWrites=0;const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){if(key==='partybox.g07.session.v1')window.__g07DiagStorageWrites++;return Reflect.apply(original,this,[key,value]);};
    });
    const page=await context.newPage(),errors=[],network=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('request',request=>{if(/^(https?|wss?):/i.test(request.url()))network.push(request.url());});
    const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpuThrottle});
    const session=trace?await beginTrace(page,context,resolve(output,profile.label)):null;
    await page.goto(pathToFileURL(html).href);await page.waitForFunction(()=>Boolean(window.__G07));
    await page.evaluate(()=>window.__G07.init({players:8,mode:'hotseat',seed:7199,settings:{turnSeconds:0}}));
    await page.locator('#show-cup').click();await page.locator('#bid-quantity').selectOption('8');
    await page.locator('#bid-face').selectOption('3');await page.locator('#make-bid').click();await page.locator('#show-cup').click();
    assert.equal(await page.locator('#cup .die').count(),5);assert(await page.evaluate(()=>window.__G07.controller().odds!==null));
    const sample=await page.evaluate(async()=>{
      const timestamps=[],intervals=[],longTasks=[];const storageWritesBefore=window.__g07DiagStorageWrites;
      const supported=PerformanceObserver.supportedEntryTypes.includes('longtask');
      const observer=supported?new PerformanceObserver(list=>{for(const entry of list.getEntries())longTasks.push({startTimeMs:entry.startTime,durationMs:entry.duration,name:entry.name});}):null;
      observer?.observe({type:'longtask'});
      performance.mark('G07_DIAGNOSTIC_SAMPLE_BEGIN');const sampleBeginMs=performance.now();
      return new Promise(resolve=>{
        const frame=time=>{
          timestamps.push(time);if(timestamps.length>1)intervals.push(time-timestamps[timestamps.length-2]);
          if(intervals.length%30===0){
            const quantity=document.querySelector('#bid-quantity'),quantities=[...quantity.options].filter(option=>!option.disabled);
            const currentQuantity=quantities.findIndex(option=>option.value===quantity.value);
            quantity.value=quantities[(currentQuantity+1)%quantities.length].value;quantity.dispatchEvent(new Event('change',{bubbles:true}));
            const face=document.querySelector('#bid-face'),options=[...face.options].filter(option=>!option.disabled),index=options.findIndex(option=>option.value===face.value);
            face.value=options[(index+1)%options.length].value;face.dispatchEvent(new Event('change',{bubbles:true}));
          }
          if(intervals.length===600){
            performance.mark('G07_DIAGNOSTIC_SAMPLE_END');
            for(const entry of observer?.takeRecords()??[])longTasks.push({startTimeMs:entry.startTime,durationMs:entry.duration,name:entry.name});
            observer?.disconnect();resolve({timestampsMs:timestamps,intervalsMs:intervals,longTasks,longTasksSupported:supported,sampleBeginMs,sampleEndMs:performance.now(),storageWritesBefore,storageWritesAfter:window.__g07DiagStorageWrites,storageWritesDuringSample:window.__g07DiagStorageWrites-storageWritesBefore});
          }else requestAnimationFrame(frame);
        };requestAnimationFrame(frame);
      });
    });
    const tracing= session?await endTrace(session):null;
    const sorted=[...sample.intervalsMs].sort((a,b)=>a-b),totalMs=sample.intervalsMs.reduce((sum,value)=>sum+value,0);
    const measurement={...profile,...sample,diagnosticOnly:true,filtering:'none',sampleCount:sample.intervalsMs.length,totalMs,
      fps:600000/totalMs,p99Ms:sorted[Math.ceil(600*.99)-1],maxMs:sorted.at(-1),droppedIntervalsOver17Ms:sample.intervalsMs.filter(value=>value>17).length,
      networkRequests:network,pageErrors:errors,tracingSummary:tracing?`${profile.label}-trace-summary.json`:null};
    assert.equal(sample.intervalsMs.length,600);assert.equal(sample.timestampsMs.length,601);
    await writeFile(resolve(output,`${profile.label}-frames.json`),JSON.stringify(measurement,null,2)+'\n');
    report.profiles.push(measurement);console.log(JSON.stringify({profile:profile.label,fps:measurement.fps,p99Ms:measurement.p99Ms,maxMs:measurement.maxMs,output}));
    await context.close();
  }
}finally{
  await browser.close();report.finalHash=createHash('sha256').update(await readFile(html)).digest('hex');report.sourceUnchanged=report.finalHash===initialHash;
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');
}
