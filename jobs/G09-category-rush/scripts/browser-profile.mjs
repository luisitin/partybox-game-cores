import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

// Diagnostic tracing has overhead. This script never produces acceptance proof.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'evidence/browser/diagnostic-phone');
await mkdir(output,{recursive:true});
const htmlPath=resolve(root,'play.html');
const digest=data=>createHash('sha256').update(data).digest('hex');
const sourceSha256=digest(await readFile(htmlPath));
const runnerSha256=digest(await readFile(fileURLToPath(import.meta.url)));
const report={diagnosticOnly:true,sourceSha256,runnerSha256,startedAt:new Date().toISOString(),viewport:{width:390,height:844},cpuThrottle:4};
console.log(JSON.stringify({pid:process.pid,sourceSha256,action:'diagnostic CPU4x trace; not acceptance proof'}));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
try {
  report.browser=browser.version();
  const context=await browser.newContext({viewport:report.viewport,offline:true});
  const page=await context.newPage();
  report.pageErrors=[];report.networkRequests=[];
  page.on('pageerror',error=>report.pageErrors.push(String(error)));
  page.on('request',request=>report.networkRequests.push(request.url()));
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Performance.enable');
  await page.goto(pathToFileURL(htmlPath).href);
  await page.locator('#rounds').selectOption('1');
  await page.locator('#seconds').selectOption('60');
  await page.getByRole('button',{name:'Let’s play'}).click();
  await page.locator('#ready').click();
  await page.waitForTimeout(250);
  report.performanceBefore=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(({name,value})=>[name,value]));
  await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,v8,v8.execute,disabled-by-default-v8.cpu_profiler',transferMode:'ReturnAsStream',options:'record-continuously'});
  const domProbe=await page.evaluate(async()=>{
    const times=[],longTasks=[];
    const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(entry=>({name:entry.name,startTime:entry.startTime,duration:entry.duration}))));
    observer.observe({type:'longtask',buffered:false});
    await new Promise(resolve=>{
      function sample(now){times.push(now);if(times.length===601)resolve();else requestAnimationFrame(sample);}
      requestAnimationFrame(sample);
    });
    observer.disconnect();
    return {times,longTasks,timeOrigin:performance.timeOrigin};
  });
  report.rafTimestamps=domProbe.times;report.longTasks=domProbe.longTasks;report.domPerformanceTimeOrigin=domProbe.timeOrigin;
  report.performanceAfter=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(({name,value})=>[name,value]));
  const completed=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
  await cdp.send('Tracing.end');
  const {stream}=await completed;
  let raw='';
  for(;;){const chunk=await cdp.send('IO.read',{handle:stream});raw+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString('utf8'):chunk.data;if(chunk.eof)break;}
  await cdp.send('IO.close',{handle:stream});
  await writeFile(resolve(output,'trace.json'),raw);
  report.traceBytes=Buffer.byteLength(raw);report.traceSha256=digest(raw);
  const trace=JSON.parse(raw);
  const completedEvents=[];const stacks=new Map();
  for(const event of trace.traceEvents){
    const key=`${event.pid}:${event.tid}`;
    if(event.ph==='X'&&event.dur>=0)completedEvents.push(event);
    else if(event.ph==='B'){const stack=stacks.get(key)??[];stack.push(event);stacks.set(key,stack);}
    else if(event.ph==='E'){const start=stacks.get(key)?.pop();if(start&&event.ts>=start.ts)completedEvents.push({...start,ph:'X',dur:event.ts-start.ts});}
  }
  report.threadNames=trace.traceEvents.filter(e=>e.ph==='M'&&e.name==='thread_name').map(e=>({pid:e.pid,tid:e.tid,name:e.args?.name}));
  const mainThreads=new Set(report.threadNames.filter(e=>e.name==='CrRendererMain').map(e=>`${e.pid}:${e.tid}`));
  const targets=new Set(['TimerFire','FunctionCall','UpdateLayoutTree','Layout','Paint','PrePaint','FireAnimationFrame','RunTask']);
  const selected=event=>targets.has(event.name)||/GC|Garbage/.test(event.name);
  const summarize=events=>Object.values(events.reduce((all,event)=>{const row=all[event.name]??={name:event.name,count:0,totalMs:0,maxMs:0};row.count++;row.totalMs+=event.dur/1000;row.maxMs=Math.max(row.maxMs,event.dur/1000);return all;},{})).sort((a,b)=>b.totalMs-a.totalMs);
  report.mainThreadDurations=summarize(completedEvents.filter(e=>mainThreads.has(`${e.pid}:${e.tid}`)&&selected(e)));
  report.longestMainThreadEvents=completedEvents.filter(e=>mainThreads.has(`${e.pid}:${e.tid}`)&&selected(e)).sort((a,b)=>b.dur-a.dur).slice(0,30).map(e=>({name:e.name,tsUs:e.ts,durationMs:e.dur/1000,args:e.args}));
  report.frames=report.rafTimestamps.slice(1).map((now,i)=>now-report.rafTimestamps[i]);
  report.rafNavigationStartSeconds=report.performanceBefore.NavigationStart;
  report.alignmentMethod='RAF timestamps are relative to navigation; trace ts is monotonic microseconds. Frame boundaries use (Performance NavigationStart seconds * 1000 + RAF timestamp ms) * 1000.';
  report.frameGaps=report.frames.flatMap((ms,i)=>{
    if(ms<=17)return [];
    const startUs=(report.rafNavigationStartSeconds*1000+report.rafTimestamps[i])*1000;
    const endUs=(report.rafNavigationStartSeconds*1000+report.rafTimestamps[i+1])*1000;
    return [{frame:i+1,ms,elapsedMs:report.rafTimestamps[i+1]-report.rafTimestamps[0],startUs,endUs,overlappingMainEvents:completedEvents.filter(e=>mainThreads.has(`${e.pid}:${e.tid}`)&&selected(e)&&e.ts<endUs&&e.ts+e.dur>startUs).map(e=>({name:e.name,durationMs:e.dur/1000,tsUs:e.ts,args:e.args}))}];
  });
  report.metricDeltas=Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount'].map(name=>[name,report.performanceAfter[name]-report.performanceBefore[name]]));
  report.sourceUnchanged=digest(await readFile(htmlPath))===sourceSha256;
  await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await browser.close();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({startedAt:report.startedAt,finishedAt:report.finishedAt,sourceSha256,sourceUnchanged:report.sourceUnchanged,count:report.frames?.length,frameGaps:report.frameGaps?.map(({frame,ms,elapsedMs})=>({frame,ms,elapsedMs})),mainThreadDurations:report.mainThreadDurations,metricDeltas:report.metricDeltas,failure:report.failure}));}
