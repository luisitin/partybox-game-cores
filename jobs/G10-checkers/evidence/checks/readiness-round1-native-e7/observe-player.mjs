// One genuine matched complete-byte HTTP parser diagnostic; not offline/frame acceptance.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {init,reduce,controllerView,turnId} from '../../dist/core-american.mjs';
const directory=resolve('.work/american-ready-private'),ready=JSON.parse(await readFile(directory+'/native-ready.json','utf8'));
const grant=process.env.G10_NATIVE_GRANT_NONCE;assert(grant&&grant===ready.nonce,'Explicit exact root grant required');
assert.equal(process.version,'v22.16.0');
const hash=async path=>{const h=createHash('sha256');for await(const bytes of createReadStream(path))h.update(bytes);return h.digest('hex');};
for(const [path,expected] of Object.entries(ready.fileHashes))assert.equal(await hash(path),expected,path);
const manifest=JSON.parse(await readFile(directory+'/delta-controls.json','utf8'));
assert.equal(await hash(manifest.basePath),manifest.baseSha256);
const nonce=randomUUID(),out=directory+'/native-'+nonce;await mkdir(out);
const report={status:'RUNNING',nonce,rootGrantNonce:grant,startedAt:new Date().toISOString(),readySha256:await hash(directory+'/native-ready.json'),baselineHead:manifest.acceptedBaselineHead,sourceSha256:manifest.baseSha256,candidateSha256:manifest.resultSha256,baselineBytes:manifest.baseBytes,candidateBytes:manifest.resultBytes,profiles:[],scope:'First actual native/trusted matched American Strong-first-move diagnostic on the complete unchanged source, plus safe full-load International Strong-first-move behavior. One navigation per arm/profile with reversed phone order, identical uncompressed loopback transport, original6k search/seed/full payloads. No cold-cache, distribution, causal FPS repair or final disk/frame acceptance claim.'};
assert.equal(ready.wholeTrialTimeoutMs,360000);
const trialBegan=performance.now(),remaining=()=>Math.max(1,Math.floor(ready.wholeTrialTimeoutMs-(performance.now()-trialBegan)));
let server,serverLines=[],serverErrors='',browser,serverClosePromise,failure;
const save=()=>writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
try{
 server=spawn(process.execPath,[directory+'/stream-server.mjs'],{cwd:process.cwd(),stdio:['ignore','pipe','pipe']});
 serverClosePromise=new Promise(resolve=>server.once('close',(code,signal)=>resolve({code,signal})));
 const lines=createInterface({input:server.stdout});let launch;
 const listening=new Promise((resolve,reject)=>{lines.on('line',line=>{serverLines.push(line);try{const row=JSON.parse(line);if(row.status==='LISTENING'){launch=row;resolve(row);}}catch(error){reject(error);}});server.once('error',reject);serverClosePromise.then(result=>reject(new Error('Server exited before LISTENING: '+JSON.stringify(result))));});
 server.stderr.on('data',data=>{serverErrors+=data.toString();});await listening;
 assert.equal(launch.manifestSha256,await hash(directory+'/delta-controls.json'));
 const url='http://127.0.0.1:'+launch.port;
 for(const profile of [{name:'desktop',width:1920,height:1080,rate:1,arms:['baseline','candidate']},{name:'phone',width:390,height:844,rate:4,arms:['candidate','baseline']}]){
  for(const arm of profile.arms){
   browser=await chromium.launch({headless:true,timeout:remaining(),args:['--no-sandbox','--disable-dev-shm-usage']});
   const actualVersion=browser.version();if(report.browserVersion)assert.equal(report.browserVersion,actualVersion);else report.browserVersion=actualVersion;report.runtime=process.version;
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[],failedRequests=[];
   page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>requests.push(request.url()));page.on('requestfailed',request=>failedRequests.push({url:request.url(),failure:request.failure()}));
   const lastIntl=manifest.international.parts.at(-1).id;
   await page.addInitScript(({lastIntl})=>{
    const observer={timeOrigin:performance.timeOrigin,events:[],americanBotStartEnabled:null,americanMarker:null,domContentLoaded:null,load:null,games:[]};window.__G10_NATIVE_OBSERVER__=observer;
    const recordEnabled=()=>{if(observer.americanBotStartEnabled)return;const node=document.getElementById('start');if(!node||node.disabled||document.getElementById('variant')?.value!=='american'||document.getElementById('seat-0')?.value!=='sharp'||document.getElementById('seat-1')?.value!=='human')return;const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)return;observer.americanBotStartEnabled={at:performance.now(),readyState:document.readyState,rendered:true,inViewport:rect.top<innerHeight&&rect.bottom>0&&rect.left<innerWidth&&rect.right>0,host:window.__G10.host()};};
    new MutationObserver(recordEnabled).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
    document.addEventListener('change',()=>queueMicrotask(recordEnabled),true);
    document.addEventListener('g10-american-corpus-ready',()=>{observer.americanMarker={at:performance.now(),readyState:document.readyState,americanEncodedBytes:document.getElementById('g10-corpus-chinook')?.textContent.length,lastInternationalPartPresent:!!document.getElementById(lastIntl)};queueMicrotask(()=>{observer.americanMarker.hostAfter=window.__G10.host();});});
    document.addEventListener('DOMContentLoaded',()=>{observer.domContentLoaded={at:performance.now(),readyState:document.readyState};queueMicrotask(()=>{observer.domContentLoaded.hostAfter=window.__G10.host();});},{once:true});
    window.addEventListener('load',()=>{observer.load={at:performance.now(),readyState:document.readyState};},{once:true});
    for(const type of ['click','change','keydown'])document.addEventListener(type,event=>{
     const id=event.target?.id;if(!id||!['start','seat-0','variant','new-game'].includes(id))return;
     observer.events.push({type,id,at:performance.now(),trusted:event.isTrusted,key:event.key??null,value:event.target.value??null});
     if(type==='click'&&id==='start'&&!event.target.disabled){recordEnabled();observer.games.push({clickAt:performance.now(),trusted:event.isTrusted,readyState:document.readyState,variant:document.getElementById('variant').value,host:window.__G10.host(),beforeState:window.__G10.getState(),firstMove:null});}
    },true);
    // Native-clock, read-only observation: game timers/worker/core remain untouched.
    setInterval(()=>{const game=observer.games.at(-1);if(!game||game.firstMove)return;const state=window.__G10?.getState();if(state?.ply>=1)game.firstMove={at:performance.now(),readyState:document.readyState,state,host:window.__G10.host()};},25);
   },{lastIntl});
   page.setDefaultTimeout(Math.min(30000,remaining()));
   const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
   const began=performance.now();await page.goto(url+'/'+arm+'.html',{waitUntil:'commit',timeout:remaining()});const commitWallMs=performance.now()-began;
   await page.waitForFunction(()=>!!window.__G10,null,{timeout:remaining()});
   const initial=await page.evaluate(()=>({at:performance.now(),readyState:document.readyState,host:window.__G10.host(),disabled:document.getElementById('start').disabled}));
   const nativeSelect=async(selector,key,value)=>{await page.locator(selector).click({timeout:Math.min(30000,remaining())});await page.locator(selector).press(key,{timeout:Math.min(30000,remaining())});await page.locator(selector).press('Enter',{timeout:Math.min(30000,remaining())});assert.equal(await page.locator(selector).inputValue(),value);};
   await nativeSelect('#seat-0','End','sharp');
   await nativeSelect('#variant','End','international');
   const internationalGate=await page.evaluate(()=>({at:performance.now(),readyState:document.readyState,host:window.__G10.host(),disabled:document.getElementById('start').disabled}));
   if(internationalGate.readyState==='loading'){assert.equal(internationalGate.host.botsPrepared,false);assert.equal(internationalGate.disabled,true);assert.equal(internationalGate.host.workerStarts,0);}
   await nativeSelect('#variant','Home','american');
   await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:remaining()});
   await page.locator('#start').click();
   await page.waitForFunction(()=>!!window.__G10_NATIVE_OBSERVER__.games[0]?.firstMove,null,{timeout:remaining()});
   const americanWallMs=performance.now()-began;
   await page.waitForLoadState('load',{timeout:remaining()});
   const loaded=await page.evaluate(()=>({readyState:document.readyState,host:window.__G10.host(),loadingNoteHidden:document.getElementById('loading-note').hidden}));
   assert.equal(loaded.readyState,'complete');assert.equal(loaded.host.botsPrepared,true);assert.equal(loaded.loadingNoteHidden,true);
   if(arm==='candidate')assert.deepEqual(loaded.host.preparedVariants,{american:true,international:true});
   await page.locator('#new-game').click();await nativeSelect('#variant','End','international');assert.equal(await page.locator('#start').isDisabled(),false);await page.locator('#start').click();
   await page.waitForFunction(()=>!!window.__G10_NATIVE_OBSERVER__.games[1]?.firstMove,null,{timeout:remaining()});
   const observer=await page.evaluate(()=>window.__G10_NATIVE_OBSERVER__);
   assert(observer.americanBotStartEnabled);assert(observer.americanBotStartEnabled.at<=observer.games[0].clickAt);
   observer.americanOutcomesBeforeDOMContentLoaded={enabled:observer.americanBotStartEnabled.at<observer.domContentLoaded.at,startClick:observer.games[0].clickAt<observer.domContentLoaded.at,firstLegalMove:observer.games[0].firstMove.at<observer.domContentLoaded.at};
   assert.equal(observer.games.length,2);assert(observer.events.every(row=>row.trusted));assert(observer.events.some(row=>row.type==='change'&&row.id==='seat-0'&&row.value==='sharp'));
   for(const [index,variant] of ['american','international'].entries()){
    const game=observer.games[index],first=game.firstMove;assert(game.trusted);assert.equal(game.variant,variant);assert.equal(game.beforeState,null);assert.equal(first.state.variant,variant);assert.equal(first.state.ply,1);assert.equal(first.host.workerVariant,variant);assert.equal(first.host.workerStarts,index+1);assert.equal(first.host.workerReady,true);assert(first.host.lastBotReport);assert.equal(first.state.moveLog.length,1);assert.equal(first.state.lastMove.playerId,'seat-0');
    const state=first.state,players=state.order.map(id=>state.players[id]);const initialState=init({players,seed:20261008,now:game.clickAt,settings:state.settings});
    const legal=controllerView(initialState,turnId(initialState)).legalMoves;assert(legal.some(move=>JSON.stringify(move)===JSON.stringify(state.lastMove.move)));
    const replay=reduce(initialState,{type:'input',playerId:turnId(initialState),input:{type:'move',path:state.lastMove.move.path},now:first.at});
    for(const key of ['board','side','ply','settings','lastMove','moveLog','quietPlies','repetition','drawWindows','rng','winner','endReason'])assert.deepEqual(state[key],replay[key],key);
   }
   assert.equal(observer.games[1].readyState,'complete');
   if(arm==='candidate'){assert(observer.americanMarker);assert.equal(observer.americanMarker.readyState,'loading');assert.equal(observer.americanMarker.americanEncodedBytes,36521288);assert.equal(observer.americanMarker.lastInternationalPartPresent,false);assert.deepEqual(observer.americanMarker.hostAfter.preparedVariants,{american:true,international:false});}
   else assert.equal(observer.americanMarker,null);
   assert.equal(errors.length,0,errors.join('\n'));assert.equal(failedRequests.length,0,JSON.stringify(failedRequests));assert(requests.filter(value=>/^https?:/.test(value)).every(value=>value===url+'/'+arm+'.html'));
   report.profiles.push({...profile,arms:undefined,arm,commitWallMs,americanWallMs,initial,internationalGate,loaded,observer,errors,requests,failedRequests});await save();console.log(JSON.stringify({phase:'ARM_CLOSED',profile:profile.name,arm,firstAmericanMoveMs:observer.games[0].firstMove.at,firstAmericanMoveReadyState:observer.games[0].firstMove.readyState,fullLoadMs:observer.load.at,remainingMs:remaining()}));
   await context.close();await browser.close();browser=null;
  }
 }
 for(const name of ['desktop','phone']){
  const baseline=report.profiles.find(row=>row.name===name&&row.arm==='baseline'),candidate=report.profiles.find(row=>row.name===name&&row.arm==='candidate');
  for(let index=0;index<2;index++){assert.deepEqual(baseline.observer.games[index].firstMove.host.lastBotReport,candidate.observer.games[index].firstMove.host.lastBotReport);assert.deepEqual(baseline.observer.games[index].firstMove.host.botCursor,candidate.observer.games[index].firstMove.host.botCursor);}
 }
 report.status='PASS';
}catch(error){report.status='FAIL';report.failure=String(error);failure=error;await save();}
finally{
 if(browser)await browser.close();
 await save();
 try{
  if(server){if(server.exitCode===null&&server.signalCode===null)server.kill('SIGTERM');report.serverClosure=await serverClosePromise;await writeFile(out+'/server.stdout',serverLines.join('\n')+'\n');await writeFile(out+'/server.stderr',serverErrors);await save();const closed=JSON.parse(serverLines.at(-1));assert.equal(closed.status,'CLOSED');assert.equal(closed.finalSourceSha256,manifest.baseSha256);if(report.status==='PASS'){assert.equal(closed.requests.length,4);assert(closed.requests.every(row=>row.status==='EMITTED_VERIFIED'));assert.equal(report.serverClosure.code,0);assert.equal(serverErrors,'');}}
  for(const [path,expected] of Object.entries(ready.fileHashes))assert.equal(await hash(path),expected,path);assert.equal(await hash(manifest.basePath),manifest.baseSha256);
 }catch(error){report.status='FAIL';report.closureFailure=String(error);failure??=error;}
 report.closedAt=new Date().toISOString();await save();
}
if(failure)throw failure;
console.log(JSON.stringify({status:report.status,closedAt:report.closedAt,reportPath:out+'/report.json',profiles:report.profiles.map(row=>({name:row.name,arm:row.arm,americanFirstMoveMs:row.observer.games[0].firstMove.at,americanFirstMoveReadyState:row.observer.games[0].firstMove.readyState,americanStartMs:row.observer.games[0].clickAt,fullLoadMs:row.observer.load.at}))}));
