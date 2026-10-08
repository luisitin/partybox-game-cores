import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const directory=resolve('.work/international-cost-private'),file=resolve('.work/play-full-guarded.html');
const hash=async()=>{const h=createHash('sha256');for await(const bytes of createReadStream(file))h.update(bytes);return h.digest('hex');};
await mkdir(directory,{recursive:true});
const sourceBefore=await hash(),errors=[],requests=[],report={scope:'Non-gating CPU/GC/DOM cost diagnostic of actual opening-board selection/cancellation.200cycles per matched A/B/A/B batch, forced style/layout each half. No RAF/FPS acceptance, frame filtering, source change or causal FPS claim.',startedAt:new Date().toISOString(),sourceBefore,batches:[]};
assert.equal(sourceBefore,'5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801');
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
 await context.route(/^https?:/,route=>route.abort());
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.send('Performance.enable');await cdp.send('Profiler.enable');
 const began=performance.now();await page.goto(pathToFileURL(file).href,{waitUntil:'load',timeout:300000});await page.waitForFunction(()=>!!window.__G10);report.loadMs=performance.now()-began;
 for(const [index,variant] of ['american','international','american','international'].entries()){
  await page.evaluate(variant=>{window.__G10.setup();document.getElementById('seat-0').value='human';document.getElementById('seat-1').value='human';document.getElementById('variant').value=variant;window.__G10.start();},variant);
  const trace=[];const receive=event=>trace.push(...event.value);cdp.on('Tracing.dataCollected',receive);
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,disabled-by-default-v8.gc',transferMode:'ReportEvents'});await cdp.send('Profiler.start');
  const before=(await cdp.send('Performance.getMetrics')).metrics;
  const result=await page.evaluate(()=>{
   const initial=window.__G10.getState(),controller=window.__G10.getController(window.__G10.getView().turn),move=controller.legalMoves[0],root=document.getElementById('table');
   const snapshot=()=>Array.from(root.querySelectorAll('*'),node=>({tag:node.tagName,attributes:Array.from(node.attributes,a=>[a.name,a.value]).sort(),text:node.childElementCount?null:node.textContent}));
   const cancelledBefore=snapshot(),observer=new MutationObserver(()=>{});observer.observe(root,{attributes:true,subtree:true});let selectedFirst=null,selectedLast=null,cancelledLast=null;
   const counts={},began=performance.now(),costs=[];
   for(let i=0;i<200;i++){
    const start=performance.now();window.__G10.chooseSquare(move.path[0]);document.getElementById('board').getBoundingClientRect();
    if(i===0)selectedFirst=snapshot();if(i===199)selectedLast=snapshot();
    document.getElementById('undo-draft').click();document.getElementById('board').getBoundingClientRect();costs.push(performance.now()-start);
    if(i===199)cancelledLast=snapshot();for(const record of observer.takeRecords())counts[record.attributeName]=(counts[record.attributeName]??0)+1;
   }
   observer.disconnect();return {variant:initial.variant,cycles:200,elapsedMs:performance.now()-began,costs,legalMoves:controller.legalMoves.length,squares:root.querySelectorAll('[data-square]').length,counts,initial,final:window.__G10.getState(),draft:window.__G10.getDraft(),selectedFirst,selectedLast,cancelledBefore,cancelledLast,host:window.__G10.host()};
  });
  const after=(await cdp.send('Performance.getMetrics')).metrics,profile=(await cdp.send('Profiler.stop')).profile;
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');await complete;cdp.off('Tracing.dataCollected',receive);
  assert.equal(result.variant,variant);assert.equal(result.squares,variant==='american'?32:50);assert.deepEqual(result.initial,result.final);assert.deepEqual(result.selectedFirst,result.selectedLast);assert.deepEqual(result.cancelledBefore,result.cancelledLast);assert.deepEqual(result.draft,[]);assert.equal(result.host.thinking,false);assert.equal(result.host.workerReady,false);
  const durationByName={};for(const event of trace)if(event.ph==='X'&&typeof event.dur==='number')durationByName[event.name]=(durationByName[event.name]??0)+event.dur;
  await writeFile(directory+'/batch-'+index+'-'+variant+'-trace.json',JSON.stringify({traceEvents:trace})+'\n');await writeFile(directory+'/batch-'+index+'-'+variant+'.cpuprofile',JSON.stringify(profile)+'\n');
  report.batches.push({index,variant,result,before,after,durationByName,traceEvents:trace.length});await writeFile(directory+'/report.json',JSON.stringify(report,null,2)+'\n');
 }
 assert.equal(errors.length,0);assert.equal(requests.length,0);await context.close();report.sourceAfter=await hash();assert.equal(report.sourceBefore,report.sourceAfter);report.status='PASS_DIAGNOSTIC_EQUIVALENCE';
}catch(error){report.status='FAIL_DIAGNOSTIC';report.failure=String(error.stack??error);process.exitCode=1;}finally{await browser.close();report.errors=errors;report.requests=requests;report.closedAt=new Date().toISOString();await writeFile(directory+'/report.json',JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify({status:report.status,batches:report.batches.map(({index,variant,result,durationByName})=>({index,variant,cycles:result.cycles,elapsedMs:result.elapsedMs,squares:result.squares,legalMoves:result.legalMoves,counts:result.counts,durationByName})),closedAt:report.closedAt})+'\n');}
