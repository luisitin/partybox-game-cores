import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir,appendFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [fileArg,outArg,label]=process.argv.slice(2),file=resolve(fileArg),out=resolve(outArg);
assert(fileArg&&outArg&&label);await mkdir(out,{recursive:true});
const hashFile=async path=>{const hash=createHash('sha256');for await(const bytes of createReadStream(path))hash.update(bytes);return hash.digest('hex');};
const beforeHash=await hashFile(file),errors=[],requests=[];
const report={status:'RUNNING',command:process.argv,runtime:process.version,startedAt:new Date().toISOString(),label,file,
  sourceSha256:beforeHash,bytes:(await stat(file)).size,profile:{width:1920,height:1080,rate:1,reducedMotion:'reduce'},
  scope:'Private instrumented matched desktop diagnostic. Identical 600 selection/cancel workload, no captures or bot turns. Profiler/tracing overhead; sequential A then B; no FPS acceptance or causal speed claim.'};
let browser,context,interruptedAt=null;
const phase=async name=>{report.phase=name;await writeFile(out+'/phase.json',JSON.stringify({phase:name,at:new Date().toISOString()})+'\n');};
process.on('SIGTERM',()=>{interruptedAt=new Date().toISOString();browser?.close().catch(()=>{});});
try{
  await phase('launch');browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});report.browserVersion=browser.version();
  context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await context.route(/^https?:/,r=>r.abort());const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.send('Performance.enable');
  await phase('load');const began=performance.now();await page.goto(pathToFileURL(file).href,{waitUntil:'load',timeout:300000});report.loadMs=performance.now()-began;
  await page.evaluate(()=>{document.getElementById('variant').value='american';window.__G10.start();});
  report.nodeCounts=await page.evaluate(()=>{
    const count=root=>{const values={total:1,elements:root.nodeType===1?1:0,text:root.nodeType===3?1:0,comments:root.nodeType===8?1:0};
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_ALL);for(let node;node=walker.nextNode();){values.total++;if(node.nodeType===1)values.elements++;if(node.nodeType===3)values.text++;if(node.nodeType===8)values.comments++;}return values;};
    const templates=[...document.querySelectorAll('template')].map(template=>({id:template.id,nodes:count(template.content),
      dataTags:template.content.querySelectorAll('script[type="application/octet-stream"]').length}));
    return {document:count(document),documentDataTags:document.querySelectorAll('script[type="application/octet-stream"]').length,templates};
  });
  report.initialState=await page.evaluate(()=>({variant:window.__G10.getState().variant,ply:window.__G10.getState().ply,
    host:window.__G10.host(),viewport:{width:innerWidth,height:innerHeight},motion:matchMedia('(prefers-reduced-motion: reduce)').matches}));
  assert.equal(report.initialState.variant,'american');assert.equal(report.initialState.ply,0);assert.equal(report.initialState.motion,true);
  const before=await cdp.send('Performance.getMetrics');await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,disabled-by-default-v8.gc',transferMode:'ReturnAsStream'});
  await phase('instrumented-600');
  let timer;const expired=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Instrumented 600-frame workload exceeded 120 seconds')),120000);});
  try{report.frames=await Promise.race([page.evaluate(async()=>{const intervals=[],move=window.__G10.getController(window.__G10.getView().turn).legalMoves[0];let previous;
    await new Promise(resolve=>{function frame(timestamp){if(previous!==undefined)intervals.push(timestamp-previous);previous=timestamp;
      window.__G10.chooseSquare(move.path[0]);document.getElementById('undo-draft').click();if(intervals.length<600)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});return intervals;}),expired]);}
  finally{clearTimeout(timer);}
  assert.equal(report.frames.length,600);
  const {profile}=await cdp.send('Profiler.stop'),after=await cdp.send('Performance.getMetrics');
  await phase('trace-save');const streamDone=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await streamDone;
  await writeFile(out+'/trace.json','');for(;;){const chunk=await cdp.send('IO.read',{handle:stream,size:1024*1024});
    await appendFile(out+'/trace.json',chunk.base64Encoded?Buffer.from(chunk.data,'base64'):chunk.data);if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});
  await writeFile(out+'/cpu-profile.json',JSON.stringify(profile)+'\n');await writeFile(out+'/performance-before.json',JSON.stringify(before,null,2)+'\n');
  await writeFile(out+'/performance-after.json',JSON.stringify(after,null,2)+'\n');
  const self=new Map();for(let i=0;i<(profile.samples??[]).length;i++)self.set(profile.samples[i],(self.get(profile.samples[i])??0)+(profile.timeDeltas[i]??0)/1000);
  const nodes=new Map(profile.nodes.map(node=>[node.id,node]));report.topSelfCpu=[...self].sort((a,b)=>b[1]-a[1]).slice(0,30).map(([id,selfMs])=>({id,selfMs,...nodes.get(id).callFrame}));
  const value=(metrics,name)=>metrics.metrics.find(v=>v.name===name)?.value;
  report.metrics=Object.fromEntries(['LayoutDuration','RecalcStyleDuration','ScriptDuration','TaskDuration','LayoutCount','RecalcStyleCount'].map(name=>[name,(value(after,name)??0)-(value(before,name)??0)]));
  report.heapAndNodes={jsHeapBefore:value(before,'JSHeapUsedSize'),jsHeapAfter:value(after,'JSHeapUsedSize'),nodesBefore:value(before,'Nodes'),nodesAfter:value(after,'Nodes')};
  const trace=JSON.parse(await readFile(out+'/trace.json','utf8')),durations={},gcEvents=[];
  for(const event of trace.traceEvents){if(event.ph==='X'&&event.dur)durations[event.name]=(durations[event.name]??0)+event.dur/1000;
    if(/gc|scavenge|mark.?compact|mark.?sweep/i.test(event.name??''))gcEvents.push(event);}
  report.traceDurationsMs=Object.fromEntries(Object.entries(durations).sort((a,b)=>b[1]-a[1]));report.gcEventCount=gcEvents.length;
  await writeFile(out+'/gc-events.json',JSON.stringify(gcEvents)+'\n');
  const sorted=[...report.frames].sort((a,b)=>a-b);report.meanMs=report.frames.reduce((sum,value)=>sum+value,0)/report.frames.length;
  report.meanFps=1000/report.meanMs;report.p99Ms=sorted[Math.ceil(.99*sorted.length)-1];
  report.durationNote='Trace duration sums can include nested and concurrent events and are not exclusive CPU-time totals.';
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0);report.status='COMPLETE_DIAGNOSTIC';
}catch(error){report.status='INCOMPLETE';report.failure=String(error.stack??error);process.exitCode=2;}
finally{
  report.errors=errors;report.requests=requests;report.interruptedAt=interruptedAt;
  if(context){report.contextCloseStartedAt=new Date().toISOString();try{await context.close();report.contextClosedAt=new Date().toISOString();}catch(error){report.contextCloseError=String(error);}}
  if(browser){report.browserCloseStartedAt=new Date().toISOString();try{await browser.close();report.browserClosedAt=new Date().toISOString();}catch(error){report.browserCloseError=String(error);}}
  report.sourceAfterSha256=await hashFile(file);report.sourceUnchanged=report.sourceAfterSha256===beforeHash;
  if(!report.sourceUnchanged){report.status='INCOMPLETE';process.exitCode=2;}report.closedAt=new Date().toISOString();
  await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,frames:report.frames?.length,initialState:undefined,topSelfCpu:report.topSelfCpu?.slice(0,5)}));
}
