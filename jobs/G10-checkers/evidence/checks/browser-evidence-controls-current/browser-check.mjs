import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,stat,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {chromium} from 'playwright';
import {sourceGuards,guardsFingerprint,hashFile,FRAME_WORKLOAD,prepareCaptureClip} from './browser-evidence.mjs';
const browserDirectory=resolve(process.env.G10_BROWSER_DIR??'evidence/browser'),mediaDirectory=resolve(process.env.G10_MEDIA_DIR??'media');
const capturing=process.argv.includes('--capture'),functionalOnly=process.argv.includes('--functional-only'),internationalFramesOnly=process.argv.includes('--international-frames-only'),frameVariants=internationalFramesOnly?['international']:['american','international'],profiles=[{name:'desktop',width:1920,height:1080,throttle:1},{name:'phone',width:390,height:844,throttle:4}];
assert(!(capturing&&functionalOnly));assert(!(internationalFramesOnly&&(capturing||functionalOnly)));assert(process.argv.slice(2).every(value=>['--capture','--functional-only','--international-frames-only'].includes(value)),'Unknown browser-check option');
const htmlPath=resolve(process.env.G10_HTML_PATH??'play.html'),sourceDigest=createHash('sha256');
for await(const bytes of createReadStream(htmlPath))sourceDigest.update(bytes);
const sourceSha256=sourceDigest.digest('hex'),htmlBytes=(await stat(htmlPath)).size,sourceGuardsBefore=await sourceGuards(),runId=randomUUID();
// The measured complete payload needs89.455s on the4x phone before controls
// become available; this explicit loading allowance changes no frame gate.
const loadTimeoutMs=300000;
const workerManifest=JSON.parse(await readFile('dist/corpus-pack.json','utf8'));
await mkdir(browserDirectory,{recursive:true});await mkdir(mediaDirectory,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']}),report={evidenceVersion:1,runId,sourceGuardsBefore,command:'node scripts/browser-check.mjs'+(capturing?' --capture':functionalOnly?' --functional-only':internationalFramesOnly?' --international-frames-only':''),htmlPath,htmlBytes,loadTimeoutMs,sourceSha256,profiles:[],capture:capturing,functionalOnly,frameVariants:functionalOnly?[]:frameVariants};
const checks=[];let sequence=0,activePhase='launch';
try{
 for(const profile of profiles){
  const directory=resolve('.work/video-'+profile.name);await mkdir(directory,{recursive:true});
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},reducedMotion:'reduce',...(capturing?{recordVideo:{dir:directory,size:{width:profile.width,height:profile.height}}}:{})});
  const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  await context.route(/^https?:/,route=>route.abort());const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.throttle});
  async function check(name,fn){activePhase=profile.name+': '+name;await fn();checks.push({profile:profile.name,name,pass:true});sequence++;}
  const hook=(fn,arg)=>page.evaluate(fn,arg);
  const workerHash=variant=>hook(async variant=>{const bytes=await window.__G10.workerBlob(variant).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');},variant);
  const newTable=async(variant='american')=>{await hook(()=>window.__G10.setup());await page.selectOption('#variant',variant);await page.click('#start');};
  const move=async()=>{const legal=await hook(()=>window.__G10.getController(window.__G10.getView().turn).legalMoves);assert(legal.length);for(const square of legal[0].path)await page.click('[data-square="'+square+'"]');};
  const setPosition=async(variant,pieces,roles)=>hook(({variant,pieces,roles})=>{
    window.__G10.setup();document.getElementById('variant').value=variant;window.__G10.start();const state=window.__G10.getState();state.board.fill(0);for(const [square,piece] of Object.entries(pieces))state.board[Number(square)]=piece;
    state.repetition={[variant+':1:'+state.board.map(piece=>piece+2).join('')]:1};state.drawWindows=[];window.__G10.setState(state,roles);
  },{variant,pieces,roles});
  activePhase=profile.name+': disk load';const loadStart=performance.now();await page.goto(pathToFileURL(htmlPath).href,{waitUntil:'load',timeout:loadTimeoutMs});await page.waitForFunction(()=>!!window.__G10);const loadMs=performance.now()-loadStart;
  await check('disk load, no external assets and reduced motion',async()=>{assert.equal(await page.locator('#setup').isVisible(),true);assert.equal(await hook(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);assert.equal(await hook(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(requests.length,0);});
  await check('American standard board and complete hot-seat turn',async()=>{await newTable();assert.equal(await page.locator('[data-square]').count(),32);assert.equal(await page.locator('.piece').count(),24);await move();assert.equal(await hook(()=>window.__G10.getState().ply),1);assert.match(await page.locator('#status').innerText(),/Player 2/);});
  await check('multi-jump draft leaves the actual position unchanged',async()=>{await setPosition('american',{22:1,26:1,17:-1,9:-1});const board=await hook(()=>window.__G10.getState().board);await page.click('[data-square="22"]');await page.click('[data-square="13"]');assert.deepEqual(await hook(()=>window.__G10.getState().board),board);assert.equal(await hook(()=>window.__G10.getState().ply),0);assert.equal(await page.locator('[data-square="6"]').getAttribute('class').then(value=>value.includes('target')),true);await page.click('[data-square="6"]');assert.equal(await hook(()=>window.__G10.getState().ply),1);assert.equal(await hook(()=>window.__G10.getState().board.filter(piece=>piece<0).length),0);});
  await check('American crown ends the capture turn',async()=>{await setPosition('american',{10:1,6:-1,5:-1});await page.click('[data-square="10"]');await page.click('[data-square="1"]');assert.equal(await hook(()=>window.__G10.getState().board[1]),2);assert.equal(await hook(()=>window.__G10.getState().board[5]),-1);assert.equal(await page.locator('[data-square="1"] svg').count(),1);});
  await check('International full maximum capture and promotion',async()=>{await setPosition('international',{20:1,24:1,16:-1,7:-1,19:-1});assert.equal(await page.locator('[data-square]').count(),50);await page.click('[data-square="24"]');assert.deepEqual(await hook(()=>window.__G10.getDraft()),[]);for(const square of [20,11,2])await page.click('[data-square="'+square+'"]');assert.equal(await hook(()=>window.__G10.getState().board[2]),2);assert.equal(await hook(()=>window.__G10.getState().board[19]),-1);});
  await check('International crown transit stays a man',async()=>{await setPosition('international',{12:1,7:-1,6:-1});for(const square of [12,1,10])await page.click('[data-square="'+square+'"]');assert.equal(await hook(()=>window.__G10.getState().board[10]),1);});
  await check('pause/resume and optional exact deadline forfeit',async()=>{await hook(()=>window.__G10.setTime(1000));await hook(()=>window.__G10.setup());await page.fill('#turn-seconds','2');await page.click('#start');await hook(()=>window.__G10.setTime(1500));await page.click('#pause');await hook(()=>{window.__G10.setTime(4500);window.__G10.tick();});assert.equal(await hook(()=>window.__G10.getState().phase.id),'move');await page.click('#resume');assert.equal(await hook(()=>window.__G10.getState().phase.deadline),6000);await hook(()=>{window.__G10.setTime(6000);window.__G10.tick();});assert.equal(await hook(()=>window.__G10.getState().winner),'seat-1');assert.match(await page.locator('#winner-copy').innerText(),/ran out of time/);await hook(()=>window.__G10.setTime(null));await hook(()=>window.__G10.setup());await page.fill('#turn-seconds','0');});
  await check('winner/results and explicit next table',async()=>{await setPosition('american',{10:1,6:-1});await move();assert.equal(await page.locator('#result').isVisible(),true);assert.equal(await page.locator('.result-row').count(),2);assert.match(await page.locator('#winner-title').innerText(),/Player 1/);await page.click('#play-again');assert.equal(await page.locator('#setup').isVisible(),true);});
  await check('manual Strong move uses local full-corpus worker and preserves legal core choice',async()=>{await setPosition('american',{0:-2,2:-2,25:2,31:2},{'seat-0':'sharp','seat-1':'human'});await hook(()=>window.__G10.setPace('manual'));await page.click('#bot-step');await page.waitForFunction(()=>window.__G10.getState().ply===1,null,{timeout:30000});assert.equal(await hook(()=>window.__G10.host().botCursor.step>0),true);assert.equal(await hook(()=>window.__G10.host().lastBotReport.corpusHits>0),true);assert.equal(await hook(()=>window.__G10.host().thinking),false);assert.equal(await workerHash('american'),workerManifest.workers.american.sha256);});
  await check('International actual2–5 corpus worker prepares offline and preserves pending input',async()=>{await setPosition('international',{0:-2,2:-2,43:2,49:2},{'seat-0':'sharp','seat-1':'human'});await hook(()=>window.__G10.setPace('manual'));await hook(()=>document.getElementById('bot-step').click());assert.equal(await hook(()=>window.__G10.host().thinking),true);assert.match(await page.locator('#turn-eyebrow').innerText(),/Preparing|thinking/i);await page.waitForFunction(()=>window.__G10.getState().ply===1,null,{timeout:30000});assert.equal(await hook(()=>window.__G10.host().lastBotReport.corpusHits>0),true);assert.equal(await hook(()=>window.__G10.host().workerReady),true);assert.equal(await hook(()=>window.__G10.host().workerVariant),'international');assert.equal(await workerHash('international'),workerManifest.workers.international.sha256);});
  await check('International actual six-piece Strong worker reads original local blocks',async()=>{await setPosition('international',{0:-1,2:-1,4:-1,45:1,47:1,49:1},{'seat-0':'sharp','seat-1':'human'});await hook(()=>window.__G10.setPace('manual'));await page.click('#bot-step');await page.waitForFunction(()=>window.__G10.getState().ply===1,null,{timeout:120000});const host=await hook(()=>window.__G10.host());assert(host.lastBotReport.corpusHits>0);assert(host.originalBlockReads>0);assert(host.originalFiles.some(name=>name.startsWith('db6-')));assert.equal(host.thinking,false);});
  await check('consecutive bot turns reuse the prepared worker and pause cancels it',async()=>{await setPosition('american',{0:-2,2:-2,25:2,31:2},{'seat-0':'sharp','seat-1':'normal'});await hook(()=>window.__G10.setPace('manual'));const starts=await hook(()=>window.__G10.host().workerStarts);for(const ply of [1,2]){await page.click('#bot-step');await page.waitForFunction(ply=>window.__G10.getState().ply===ply,ply,{timeout:30000});assert.equal(await hook(()=>window.__G10.host().workerStarts),starts+1);}await page.click('#pause');assert.equal(await hook(()=>window.__G10.host().workerReady),false);assert.equal(await hook(()=>window.__G10.host().workerVariant),null);assert.equal(await hook(()=>window.__G10.host().thinking),false);});
  await check('pause cancels worker before it can apply an old move',async()=>{await setPosition('international',{0:-2,2:-2,45:2,49:2},{'seat-0':'sharp','seat-1':'human'});await hook(()=>{window.__G10.setPace('manual');document.getElementById('bot-step').click();document.getElementById('pause').click();});assert.equal(await hook(()=>window.__G10.getState().ply),0);assert.equal(await hook(()=>window.__G10.host().thinking),false);assert.equal(await hook(()=>!!window.__G10.getState().phase.paused),true);});
  await check('names remain text and hostile original IDs have finite public results',async()=>{await newTable();await hook(()=>{const state=window.__G10.getState();const old=state.order;state.order=['__proto__',''];state.players=Object.fromEntries(old.map((id,index)=>[state.order[index],{...state.players[id],id:state.order[index],name:index?'Dark':'<img src="https://invalid.invalid/tracker">'}]));window.__G10.setState(state);window.__G10.act({type:'resign'});});assert.equal(await page.locator('img').count(),0);assert.match(await page.locator('#seats').innerText(),/<img/);assert.equal(await page.locator('.result-row').count(),2);});
  await check('viewport fits both boards and all controls',async()=>{for(const variant of ['american','international']){await newTable(variant);assert.equal(await hook(()=>document.documentElement.scrollWidth<=innerWidth),true);const box=await page.locator('#board').boundingBox();assert(box.x>=0&&box.x+box.width<=profile.width);assert(box.width>250);}});
  const frameResults=[];
  if(!functionalOnly)for(const variant of frameVariants){
  await newTable(variant);
  activePhase=profile.name+': '+variant+' frame sample';
  const barrierProfile=profile.name+'-'+variant;
  let fps=null,p99=null;const frameNonce=randomUUID();
  const barrier=capturing?undefined:process.env.G10_FRAME_BARRIER_DIR;
  if(barrier){
    const ready=resolve(barrier,barrierProfile+'-ready.json'),grant=resolve(barrier,barrierProfile+'-grant.json');await mkdir(dirname(ready),{recursive:true});
    await writeFile(ready,JSON.stringify({profile:barrierProfile,variant,runId,nonce:frameNonce,sourceSha256,sourceGuardsFingerprint:guardsFingerprint(sourceGuardsBefore),readyAt:new Date().toISOString(),frames:600,meanFpsMinimum:59,p99MsMaximum:17})+'\n');
    const expires=Date.now()+600000;while(true){
      try{const value=JSON.parse(await readFile(grant,'utf8'));assert.equal(value.sourceSha256,sourceSha256);assert.equal(value.profile,barrierProfile);assert.equal(value.runId,runId);assert.equal(value.nonce,frameNonce);assert.equal(value.sourceGuardsFingerprint,guardsFingerprint(sourceGuardsBefore));break;}catch(error){if(error.code!=='ENOENT')throw error;}
      assert(Date.now()<expires,'Frame coordination barrier expired');await new Promise(resolve=>setTimeout(resolve,250));
    }
  }
  const frameNotBefore=Number(process.env.G10_FRAME_NOT_BEFORE??0);
  if(frameNotBefore>Date.now())await new Promise(resolve=>setTimeout(resolve,frameNotBefore-Date.now()));
  const sampled=await hook(async()=>{
    const intervals=[],timestamps=[];let previous;const controller=window.__G10.getController(window.__G10.getView().turn),move=controller.legalMoves[0];
    await new Promise(resolve=>{function frame(timestamp){timestamps.push(timestamp);if(previous!==undefined)intervals.push(timestamp-previous);previous=timestamp;window.__G10.chooseSquare(move.path[0]);document.getElementById('undo-draft').click();if(intervals.length<600)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});return {frames:intervals,timestamps};
  });
  const {frames,timestamps}=sampled;
  const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((sum,value)=>sum+value,0)/frames.length;p99=sorted[Math.ceil(.99*frames.length)-1];fps=1000/mean;
  const raw={...profile,variant,runId,nonce:frameNonce,sourceGuardsFingerprint:guardsFingerprint(sourceGuardsBefore),frames,timestamps,meanMs:mean,p99Ms:p99,meanFps:fps,sourceSha256,workload:FRAME_WORKLOAD,capturing};
  await writeFile(browserDirectory+'/'+barrierProfile+(capturing?'-capture':'')+'-frames.json',JSON.stringify(raw,null,2)+'\n');
  if(barrier)await writeFile(resolve(barrier,barrierProfile+'-closed.json'),JSON.stringify({profile:barrierProfile,variant,runId,nonce:frameNonce,sourceSha256,sourceGuardsFingerprint:guardsFingerprint(sourceGuardsBefore),closedAt:new Date().toISOString(),frames:frames.length,meanFps:fps,p99Ms:p99,capturing})+'\n');
  if(!capturing){assert.equal(frames.length,600);assert(fps>=59,JSON.stringify({profile:profile.name,variant,fps,p99}));assert(p99<=17,JSON.stringify({profile:profile.name,variant,fps,p99}));}
  frameResults.push({variant,frames:frames.length,meanFps:fps,p99Ms:p99});
  }
  let gameplay;
  if(capturing){
    // Record observable real turns after the diagnostic frames. No acceptance
    // timing or game algorithm uses these capture-only interaction waits.
    await newTable('international');const began=performance.now(),startPly=await hook(()=>window.__G10.getState().ply);
    while(performance.now()-began<10500){
      const view=await hook(()=>({phase:window.__G10.getState().phase.id,legal:window.__G10.getController(window.__G10.getView().turn).legalMoves}));
      if(view.phase==='done'||view.legal.length===0)break;
      for(const square of view.legal[0].path){await page.click('[data-square="'+square+'"]');await page.waitForTimeout(200);}
    }
    if(performance.now()-began<10500)await page.waitForTimeout(10500-(performance.now()-began));
    gameplay={variant:'international',startPly,endPly:await hook(()=>window.__G10.getState().ply),elapsedMs:performance.now()-began};assert(gameplay.endPly>startPly);
  }
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0,JSON.stringify(requests));
  const video=page.video();await page.screenshot({path:mediaDirectory+'/'+profile.name+'.png',fullPage:true});await context.close();
  let videoReceipt;
  if(capturing){const old=await video.path(),next=resolve(mediaDirectory+'/'+profile.name+'-original.webm');await rename(old,next);videoReceipt=await prepareCaptureClip(mediaDirectory,profile);}
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,0,JSON.stringify(requests));
  report.profiles.push({...profile,loadMs,checks:checks.filter(check=>check.profile===profile.name).length,frameResults,pageErrorCount:errors.length,httpRequestCount:requests.length,pageErrors:errors,httpRequests:requests,...(videoReceipt?{video:videoReceipt,gameplay}:{})});
 }
}catch(error){report.failure={phase:activePhase,message:String(error)};report.checks=checks;report.totalChecks=sequence;await writeFile(browserDirectory+'/failure-'+(capturing?'capture':functionalOnly?'functional':'strict')+'.json',JSON.stringify(report,null,2)+'\n');throw error;}finally{await browser.close();}
report.sourceGuardsAfter=await sourceGuards();report.sourceSha256After=await hashFile(htmlPath);report.htmlBytesAfter=(await stat(htmlPath)).size;assert.deepEqual(report.sourceGuardsAfter,sourceGuardsBefore);assert.equal(report.sourceSha256After,sourceSha256);assert.equal(report.htmlBytesAfter,htmlBytes);
report.checks=checks;report.totalChecks=sequence;await writeFile(browserDirectory+'/'+(capturing?'capture':functionalOnly?'functional':'checks')+'.json',JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report)+'\n');
