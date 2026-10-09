import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const directory=resolve('.work/host-write-private'),assembly=JSON.parse(await readFile(directory+'/assembly.json','utf8'));
const report={status:'RUNNING',startedAt:new Date().toISOString(),assembly,profiles:[],scope:'Actual DOM-mutation and complete visible/accessibility/state equivalence diagnostic. No RAF/FPS acceptance or controlled elapsed-cost claim.'};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
  for(const [label,file] of [['original','.work/play-full-early.html'],['guarded','.work/play-full-guarded.html']]){
    const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});await context.route(/^https?:/,route=>route.abort());
    const began=performance.now();await page.goto(pathToFileURL(resolve(file)).href,{waitUntil:'load',timeout:300000});await page.waitForFunction(()=>!!window.__G10);
    const cases=[];
    for(const variant of ['american','international']){
      const result=await page.evaluate(variant=>{
        window.__G10.setup();document.getElementById('variant').value=variant;window.__G10.start();
        const baseline=window.__G10.getState(),move=window.__G10.getController(window.__G10.getView().turn).legalMoves[0],root=document.getElementById('table');
        const observer=new MutationObserver(()=>{});observer.observe(root,{attributes:true,subtree:true,attributeOldValue:true});
        const serialize=()=>Array.from(root.querySelectorAll('*'),node=>({tag:node.tagName,attributes:Array.from(node.attributes,attribute=>[attribute.name,attribute.value]).sort(),text:node.childElementCount?null:node.textContent}));
        const records=[],started=performance.now();let selected=null,cancelled=null;
        for(let n=0;n<200;n++){
          window.__G10.chooseSquare(move.path[0]);if(n===0)selected=serialize();document.getElementById('undo-draft').click();if(n===0)cancelled=serialize();
          for(const entry of observer.takeRecords())records.push({attribute:entry.attributeName,oldValue:entry.oldValue});
        }
        const elapsedMs=performance.now()-started;observer.disconnect();const counts={};for(const entry of records)counts[entry.attribute]=(counts[entry.attribute]??0)+1;
        return {variant,iterations:200,squares:root.querySelectorAll('[data-square]').length,mutationCounts:counts,totalMutations:records.length,elapsedMs,selected,cancelled,draft:window.__G10.getDraft(),initialState:baseline,finalState:window.__G10.getState()};
      },variant);
      assert.equal(result.squares,variant==='american'?32:50);assert.deepEqual(result.draft,[]);assert.deepEqual(result.finalState,result.initialState);cases.push(result);
    }
    assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0);await context.close();report.profiles.push({label,file,loadMs:performance.now()-began,cases,errors,requests,closedAt:new Date().toISOString()});
    await writeFile(directory+'/probe-report.json',JSON.stringify(report,null,2)+'\n');
  }
  for(let index=0;index<2;index++){
    const original=report.profiles[0].cases[index],guarded=report.profiles[1].cases[index];
    assert.equal(original.variant,guarded.variant);assert.deepEqual(guarded.selected,original.selected);assert.deepEqual(guarded.cancelled,original.cancelled);assert.equal(guarded.totalMutations<original.totalMutations,true);
    assert.equal(guarded.mutationCounts.disabled??0,0);assert.equal((guarded.mutationCounts['aria-label']??0)<(original.mutationCounts['aria-label']??0),true);
  }
  report.status='PASS';report.closedAt=new Date().toISOString();await writeFile(directory+'/probe-report.json',JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify({status:report.status,profiles:report.profiles.map(profile=>({label:profile.label,cases:profile.cases.map(({variant,mutationCounts,totalMutations,elapsedMs})=>({variant,mutationCounts,totalMutations,elapsedMs}))}))})+'\n');
}catch(error){report.status='FAIL';report.failure=String(error);report.closedAt=new Date().toISOString();await writeFile(directory+'/probe-report.json',JSON.stringify(report,null,2)+'\n');throw error;}finally{await browser.close();}
