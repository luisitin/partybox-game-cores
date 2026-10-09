import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFile,mkdir,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const file=resolve('.work/play-full-early.html'),out=resolve('evidence/checks/early-human-start');await mkdir(out,{recursive:true});
const digest=createHash('sha256');for await(const bytes of createReadStream(file))digest.update(bytes);const sourceSha256=digest.digest('hex');
const report={command:'node .work/check-early-human.mjs',sourceSha256,bytes:(await stat(file)).size,profiles:[],scope:'Actual file-navigation commit, usable controls and legal turns while original data still parses; bots remain gated until complete DOM. No frame-rate acceptance.'};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const profile of [{name:'desktop',width:1920,height:1080,rate:1},{name:'phone',width:390,height:844,rate:4}]){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await context.route(/^https?:/,r=>r.abort());const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
  const began=performance.now();await page.goto(pathToFileURL(file).href,{waitUntil:'commit',timeout:300000});const commitMs=performance.now()-began;
  await page.waitForFunction(()=>!!window.__G10,null,{timeout:300000});const controlsMs=performance.now()-began;
  const initial=await page.evaluate(()=>({readyState:document.readyState,host:window.__G10.host(),disabled:document.getElementById('start').disabled}));
  assert.equal(initial.readyState,'loading');assert.equal(initial.host.botsPrepared,false);assert.equal(initial.disabled,false);
  await page.selectOption('#seat-0','sharp');assert.equal(await page.locator('#start').isDisabled(),true);await page.evaluate(()=>window.__G10.start());assert.equal(await page.evaluate(()=>window.__G10.getState()),null);
  await page.selectOption('#seat-0','human');await page.click('#start');
  const move=await page.evaluate(()=>window.__G10.getController(window.__G10.getView().turn).legalMoves[0]);for(const square of move.path)await page.click('[data-square="'+square+'"]');
  const firstMoveMs=performance.now()-began,american=await page.evaluate(()=>({readyState:document.readyState,state:window.__G10.getState(),host:window.__G10.host()}));
  assert.equal(american.readyState,'loading');assert.equal(american.state.ply,1);assert.equal(american.state.variant,'american');assert.equal(american.host.workerStarts,0);assert.equal(american.host.botsPrepared,false);
  await page.click('#new-game');await page.selectOption('#variant','international');await page.click('#start');
  const next=await page.evaluate(()=>window.__G10.getController(window.__G10.getView().turn).legalMoves[0]);for(const square of next.path)await page.click('[data-square="'+square+'"]');
  const internationalMoveMs=performance.now()-began,international=await page.evaluate(()=>({readyState:document.readyState,state:window.__G10.getState(),host:window.__G10.host()}));
  assert.equal(international.readyState,'loading');assert.equal(international.state.ply,1);assert.equal(international.state.variant,'international');assert.equal(international.host.workerStarts,0);assert.equal(international.host.botsPrepared,false);
  await page.click('#new-game');await page.selectOption('#seat-1','normal');assert.equal(await page.locator('#start').isDisabled(),true);await page.evaluate(()=>window.__G10.start());assert.equal(await page.evaluate(()=>window.__G10.getState()),null);
  await page.waitForLoadState('load',{timeout:300000});const fullLoadMs=performance.now()-began;
  assert.equal(await page.evaluate(()=>window.__G10.host().botsPrepared),true);assert.equal(await page.locator('#start').isDisabled(),false);assert.equal(await page.locator('#loading-note').isVisible(),false);
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0);
  report.profiles.push({...profile,commitMs,controlsMs,firstMoveMs,internationalMoveMs,fullLoadMs,american:{ply:american.state.ply,side:american.state.side,deadline:american.state.phase.deadline},international:{ply:international.state.ply,side:international.state.side},beforeCompleteParser:true,botGates:'Strong and Medium start rejected before data completed; no worker/RNG consumption',errors,requests});await context.close();
  await writeFile(out+'/report.json',JSON.stringify({...report,status:'RUNNING'},null,2)+'\n');
 }
 report.status='PASS';
}catch(error){report.status='FAIL';report.failure=String(error);throw error;}finally{await browser.close();report.closedAt=new Date().toISOString();await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
