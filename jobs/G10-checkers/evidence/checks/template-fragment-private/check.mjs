import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFile,mkdir,stat,readFile,open} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const file=resolve('.work/play-full-template.html'),out=resolve('.work/template-experiment/proof');await mkdir(out,{recursive:true});
const digest=createHash('sha256');for await(const bytes of createReadStream(file))digest.update(bytes);const sourceSha256=digest.digest('hex');
const report={command:'node .work/template-experiment/check.mjs',sourceSha256,bytes:(await stat(file)).size,profiles:[],scope:'PRIVATE unchanged corpus tags in a template DocumentFragment: actual early Human turns, all41files at every encoded-part boundary, genuine six-piece Strong reads. No frame-rate acceptance or cause claim.'};
const sources=[];const lower=JSON.parse(await readFile('data/international/manifest.json','utf8')),six=JSON.parse(await readFile('data/international/six/manifest.json','utf8'));
for(const name of ['db2','db3','db4','db5'])sources.push({name,bytes:lower.files[name+'.bin'].bytes,chunks:[{path:'data/international/'+name+'.bin',bytes:lower.files[name+'.bin'].bytes}]});
for(const f of six.files)sources.push({name:f.name,bytes:f.bytes,chunks:f.chunks.map(c=>({path:'data/international/six/'+c.file,bytes:c.bytes}))});
const windows=[];for(const f of sources){const offsets=new Set([0,Math.floor(f.bytes/2/4096)*4096,Math.floor((f.bytes-1)/4096)*4096]);let at=0;
 for(const c of f.chunks){for(let p=0;p<c.bytes;p+=3*262144){offsets.add(Math.floor((at+p)/4096)*4096);offsets.add(Math.floor((at+Math.min(c.bytes,p+3*262144)-1)/4096)*4096);}at+=c.bytes;}
 for(const offset of [...offsets].sort((a,b)=>a-b)){const length=Math.min(4096,f.bytes-offset),bytes=Buffer.alloc(length);let at=0,copied=0;
  for(const c of f.chunks){const start=Math.max(offset,at),end=Math.min(offset+length,at+c.bytes);if(start<end){const h=await open(c.path,'r');try{let n=0;while(n<end-start){const r=await h.read(bytes,start-offset+n,end-start-n,start-at+n);assert(r.bytesRead>0);n+=r.bytesRead;}copied+=end-start;}finally{await h.close();}}at+=c.bytes;}
  assert.equal(copied,length);windows.push({file:f.name,offset,length,sha256:createHash('sha256').update(bytes).digest('hex')});}}
report.originalWindows=windows.length;report.originalFiles=sources.length;
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
  const windowStarted=performance.now(),verified=[];
  for(let at=0;at<windows.length;at+=32){const expected=windows.slice(at,at+32);const actual=await page.evaluate(async needs=>Promise.all(needs.map(async need=>{const bytes=window.__G10.originalBlock(need),digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));return {file:need.file,offset:need.offset,length:bytes.length,sha256:[...digest].map(v=>v.toString(16).padStart(2,'0')).join('')};})),expected.map(({sha256,...need})=>need));assert.deepEqual(actual,expected);verified.push(...actual);}
  const originalWindowCheckMs=performance.now()-windowStarted;
  await page.selectOption('#seat-1','human');await page.click('#start');
  await page.evaluate(()=>{const s=window.__G10.getState(),board=Array(50).fill(0);for(const [square,piece] of [[0,-1],[2,-1],[4,-1],[45,1],[47,1],[49,1]])board[square]=piece;const key='international:1:'+board.map(p=>p+2).join('');window.__G10.setState({...s,board,variant:'international',side:1,repetition:{[key]:1},quietPlies:0,ply:0,drawWindows:[],moveLog:[],lastMove:null},{'seat-0':'sharp','seat-1':'human'});window.__G10.setPace('manual');});
  await page.click('#bot-step');await page.waitForFunction(()=>window.__G10.getState().ply===1,null,{timeout:120000});
  const strong=await page.evaluate(()=>window.__G10.host());assert(strong.lastBotReport.corpusHits>0);assert(strong.originalBlockReads>0);assert(strong.originalFiles.some(n=>n.startsWith('db6-')));assert.equal(strong.thinking,false);
  await writeFile(out+'/'+profile.name+'-original-windows.json',JSON.stringify(verified,null,2)+'\n');
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0);
  report.profiles.push({...profile,commitMs,controlsMs,firstMoveMs,internationalMoveMs,fullLoadMs,american:{ply:american.state.ply,side:american.state.side,deadline:american.state.phase.deadline},international:{ply:international.state.ply,side:international.state.side},beforeCompleteParser:true,originalWindowCheckMs,originalWindowsVerified:verified.length,strong:{report:strong.lastBotReport,cursor:strong.botCursor,originalBlockReads:strong.originalBlockReads,originalFiles:strong.originalFiles},botGates:'Strong and Medium start rejected before data completed; no worker/RNG consumption',errors,requests});await context.close();
  await writeFile(out+'/report.json',JSON.stringify({...report,status:'RUNNING'},null,2)+'\n');
 }
 report.status='PASS';
}catch(error){report.status='FAIL';report.failure=String(error);throw error;}finally{await browser.close();report.closedAt=new Date().toISOString();await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
