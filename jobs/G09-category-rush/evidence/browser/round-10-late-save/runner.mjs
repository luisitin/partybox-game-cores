import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile,stat,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..');
const output=resolve(root,process.env.G09_LATE_OUTPUT??'evidence/browser/round-10-late-save');
await mkdir(output,{recursive:true});
const mode=process.argv[2]??'all';assert(['all','prepare','probe'].includes(mode));
const html=resolve(root,'play.html'),key='category-rush.saved-game.v1';
const digest=value=>createHash('sha256').update(value).digest('hex');
const sourceSha256=digest(await readFile(html)),runnerSha256=digest(await readFile(new URL(import.meta.url)));
const sourcePaths=['client-save.ts','client-draft.ts','client.ts','build-play.ts','src/play.template.html','src/index.ts','src/model.ts','src/scoring.ts','src/match.ts','src/select.ts','content/categories.ts','package-lock.json','LICENSE','THIRD_PARTY_NOTICES.txt','node_modules/zod/LICENSE','../../contract/rng.ts','scripts/browser-performance.mjs','scripts/frame-window.mjs','scripts/browser-late-save.mjs'];
const fingerprints=async()=>Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,digest(await readFile(resolve(root,path)))])));
const sourceFingerprints=await fingerprints();
const report={startedAt:new Date().toISOString(),mode,sourceSha256,runnerSha256,sourceFingerprints,scope:'Authentic maximum roster/round/answer-length private writing and autosave coverage; native clocks and observed input-handler timings, no FPS acceptance or physical-device claim',profiles:[],runtime:{errors:[],requests:[],dialogs:[]},passed:false};
const seatMarkers=['aardvark','barracuda','cantaloupe','dragonfly','elephant','fireplace','grasshopper','hedgehog'];
const categoryMarkers=['acorn','button','cactus','diamond','engine','flannel','garden','hammer','island','jacket','kettle','lantern'];
const answer=(letter,round,seat,category)=>`${letter} ${seatMarkers[seat-1]} ${categoryMarkers[category]} round ${round} `.padEnd(80,'x');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});report.browser=browser.version();
let context,page;
async function fresh({raw,width=1920,height=1080,rate=1,recording=false}={}){
 if(context)await context.close();
 context=await browser.newContext({offline:true,viewport:{width,height},...(recording?{recordVideo:{dir:output,size:{width:Math.min(width,1280),height:Math.min(height,720)}}}:{})});
 if(raw!==undefined)await context.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key,raw});
 page=await context.newPage();
 page.on('pageerror',e=>report.runtime.errors.push(String(e)));
 page.on('request',r=>{if(!r.url().startsWith('file:'))report.runtime.requests.push(r.url());});
 page.on('dialog',d=>{report.runtime.dialogs.push(d.message());void d.dismiss();});
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
 await page.goto(pathToFileURL(html).href);
}
const stored=()=>page.evaluate(key=>localStorage.getItem(key),key);
const timerSeconds=text=>{const parts=text.split(':');return Number(parts[0])*60+Number(parts[1]);};
const lock=()=>page.getByRole('button',{name:'Lock my',exact:false}).click();
async function awaitSaved(){
 const until=performance.now()+5000;
 while(performance.now()<until){if(await page.locator('#save-status').innerText()==='Saved on this device.')return;await new Promise(r=>setTimeout(r,20));}
 throw new Error('Actual saving status did not complete within five real seconds');
}
try{
 if(mode!=='probe'){
  await fresh();for(let seat=2;seat<8;seat++)await page.locator('#add-player').click();
  for(let seat=1;seat<=8;seat++)await page.getByLabel(`Player ${seat} name`,{exact:true}).fill(`Load player ${seat}`.padEnd(24,'x'));
  await page.locator('#rounds').selectOption('5');await page.locator('#seconds').selectOption('60');
  await page.getByRole('button',{name:'Let’s play'}).click();
  const played=[];
  for(let round=1;round<=5;round++){
   const submittedSeats=round===5?7:8;
   for(let seat=1;seat<=submittedSeats;seat++){
    await page.locator('#ready').click();const letter=await page.locator('.letter-badge').innerText();
    for(let category=0;category<12;category++)await page.locator(`#answer-${category}`).fill(answer(letter,round,seat,category));
    assert.equal((await page.locator('.draft-warning').allTextContents()).filter(Boolean).length,0);
    await lock();
   }
   if(round===5)break;
   let ballots=0;
   while(!(await page.locator('.score-row').count())){assert(ballots<96);await page.locator('#ready').click();await lock();ballots++;}
   const actual=JSON.parse(await stored());assert.equal(actual.state.history.length,round);
   const last=actual.state.history.at(-1);assert.equal(last.entries.length,12);
   assert(last.entries.every(entry=>entry.groups.length===8&&entry.groups.every(group=>group.text.length===80&&group.owners.length===1&&group.points===1)));
   assert.deepEqual(actual.state.scores,Object.fromEntries(actual.state.order.map(id=>[id,round*12])));
   played.push({round,ballots,historyGroups:last.entries.reduce((n,row)=>n+row.groups.length,0),scores:actual.state.scores});
   await page.locator('#next-round').click();
  }
  const raw=await stored(),snapshot=JSON.parse(raw);
  assert.equal(snapshot.state.round,5);assert.equal(snapshot.state.history.length,4);assert.equal(snapshot.activeHuman,'p8');assert.equal(snapshot.handover,true);
  assert.equal(snapshot.state.order.length,8);assert.equal(Object.values(snapshot.state.submitted).filter(Boolean).length,7);
  assert(snapshot.state.order.slice(0,7).every(id=>snapshot.state.answers[id].every(text=>text.length===80)));
  assert(snapshot.draft.every(text=>text===''));assert.equal(snapshot.seatElapsed,0);
  await writeFile(resolve(output,'authentic-late-handover-save.json'),raw);
  report.prepare={passed:true,authenticSnapshotSha256:digest(raw),authenticSnapshotBytes:Buffer.byteLength(raw),round:5,completedRounds:4,humans:8,completedGroups:384,currentSubmittedAnswers:84,answerLength:80,nameLength:24,played};
  await writeFile(resolve(output,'prepare.json'),JSON.stringify({sourceSha256,runnerSha256,sourceFingerprints,...report.prepare},null,2)+'\n');
  await copyFile(new URL(import.meta.url),resolve(output,'prepare-runner.mjs'));
  console.log(JSON.stringify({phase:'prepared',...report.prepare}));
 }
 if(mode!=='prepare'){
  const prepare=JSON.parse(await readFile(resolve(output,'prepare.json'),'utf8'));
  assert.equal(prepare.sourceSha256,sourceSha256);
  assert.equal(prepare.runnerSha256,digest(await readFile(resolve(output,'prepare-runner.mjs'))));
  const producerFingerprints=prepare.sourceFingerprints??JSON.parse(await readFile(resolve(output,'prepare-attempt-report.json'),'utf8')).sourceFingerprints;
  for(const [path,hash] of Object.entries(producerFingerprints))assert.equal(hash,path==='scripts/browser-late-save.mjs'?prepare.runnerSha256:sourceFingerprints[path]);
  report.prepare=prepare;report.prepareProducer={runnerSha256:prepare.runnerSha256,sourceSha256:prepare.sourceSha256,sourceFingerprints:producerFingerprints,sameRuntimeFingerprints:true};
  const raw=await readFile(resolve(output,'authentic-late-handover-save.json'),'utf8');assert.equal(digest(raw),prepare.authenticSnapshotSha256);
  for(const [profile,width,height,rate] of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
   const row={profile,viewport:{width,height},cpuThrottle:rate,passed:false};report.profiles.push(row);
   await fresh({raw,width,height,rate});assert.equal(await stored(),raw);
   await page.locator('#resume-game').click();assert.equal(await page.locator('.answer-input').count(),0);
   assert(!(await page.locator('#main').innerText()).includes(JSON.parse(raw).state.answers.p7[0]));
   await page.locator('#ready').click();
   await page.evaluate(()=>{
    const observations={inputs:[],saveStatus:[],longTasks:[],nativeDate:Function.prototype.toString.call(Date.now).includes('[native code]'),nativePerformanceNow:Function.prototype.toString.call(performance.now).includes('[native code]')};
    const begins=new WeakMap();
    document.addEventListener('input',event=>{
     if(!(event.target instanceof HTMLInputElement)||!event.target.matches('.answer-input'))return;
     begins.set(event,{startedPerformanceMs:performance.now(),wallMs:Date.now()});
    },true);
    // This bubble listener was added after the production document listener.
    // Its timestamp includes the actual existing synchronous input handler.
    // A microtask in a capture listener could run before a later listener.
    document.addEventListener('input',event=>{
     const start=begins.get(event);if(!start)return;const target=event.target;
     observations.inputs.push({id:target.id,trusted:event.isTrusted,...start,finishedPerformanceMs:performance.now(),value:target.value});
    });
    const status=document.getElementById('save-status');
    new MutationObserver(()=>observations.saveStatus.push({wallMs:Date.now(),performanceMs:performance.now(),text:status.textContent})).observe(status,{childList:true,characterData:true,subtree:true});
    new PerformanceObserver(list=>{for(const entry of list.getEntries())observations.longTasks.push({startTime:entry.startTime,duration:entry.duration,name:entry.name});}).observe({type:'longtask',buffered:false});
    window.__g09LateSaveObservations=observations;
   });
   row.timerBefore=await page.locator('#timer').innerText();row.wallStartedAt=new Date().toISOString();
   const letter=await page.locator('.letter-badge').innerText(),expected=Array.from({length:12},(_,category)=>answer(letter,5,8,category));
   const hostStarted=performance.now();
   for(let category=0;category<12;category++)await page.locator(`#answer-${category}`).pressSequentially(expected[category]);
   row.nativeTypingHostElapsedMs=performance.now()-hostStarted;
   const savingStarted=performance.now();await awaitSaved();row.afterTypingSaveWaitMs=performance.now()-savingStarted;
   row.wallFinishedAt=new Date().toISOString();row.timerAfter=await page.locator('#timer').innerText();
   row.observations=await page.evaluate(()=>window.__g09LateSaveObservations);
   const savedRaw=await stored(),saved=JSON.parse(savedRaw);await writeFile(resolve(output,`${profile}-typed-save.json`),savedRaw);
   row.savedSha256=digest(savedRaw);row.savedBytes=Buffer.byteLength(savedRaw);row.expectedDraft=expected;
   const latency=row.observations.inputs.map(event=>event.finishedPerformanceMs-event.startedPerformanceMs),ordered=[...latency].sort((a,b)=>a-b);
   row.inputEventCount=latency.length;row.inputHandlerMeanMs=latency.reduce((a,b)=>a+b,0)/latency.length;row.inputHandlerP99Ms=ordered[Math.ceil(ordered.length*.99)-1];row.inputHandlerMaxMs=ordered.at(-1);
   assert.equal(row.observations.nativeDate,true);assert.equal(row.observations.nativePerformanceNow,true);
   assert.equal(row.inputEventCount,960);assert(row.observations.inputs.every(event=>event.trusted&&Number.isFinite(event.finishedPerformanceMs)&&event.finishedPerformanceMs>=event.startedPerformanceMs));
   assert.deepEqual(await page.locator('.answer-input').evaluateAll(inputs=>inputs.map(input=>input.value)),expected);
   assert.deepEqual(saved.draft,expected);assert.equal(saved.state.history.length,4);assert.equal(saved.state.round,5);assert.equal(saved.activeHuman,'p8');
   assert.deepEqual(saved.state.history,JSON.parse(raw).state.history);assert.deepEqual(saved.state.answers,JSON.parse(raw).state.answers);
   assert.deepEqual(saved.state.rng,JSON.parse(raw).state.rng);assert.deepEqual(saved.botRngs,JSON.parse(raw).botRngs);
   assert.equal(await page.locator('#answer-form').count(),1);assert.equal(await page.locator('[role=dialog]').count(),0);
   assert(timerSeconds(row.timerAfter)>0&&timerSeconds(row.timerAfter)<=timerSeconds(row.timerBefore));
   await page.reload();assert.equal(await page.locator('#resume-game').count(),1);assert.equal(await page.locator('.answer-input').count(),0);
   await page.locator('#resume-game').click();assert.equal(await page.locator('.answer-input').count(),0);
   await page.locator('#ready').click();assert.deepEqual(await page.locator('.answer-input').evaluateAll(inputs=>inputs.map(input=>input.value)),expected);
   const resumed=JSON.parse(await stored());assert.deepEqual(resumed.state.history,saved.state.history);assert.deepEqual(resumed.state.scores,saved.state.scores);
   row.privateReload=true;row.fullDraftRecovered=true;row.historyAndScoresPreserved=true;row.passed=true;
   await page.screenshot({path:resolve(output,`${profile}-late-draft.png`),fullPage:true});
   await writeFile(resolve(output,`${profile}-input-observations.json`),JSON.stringify(row,null,2)+'\n');
   console.log(JSON.stringify({profile,passed:row.passed,inputEventCount:row.inputEventCount,inputHandlerP99Ms:row.inputHandlerP99Ms,inputHandlerMaxMs:row.inputHandlerMaxMs,nativeTypingHostElapsedMs:row.nativeTypingHostElapsedMs,afterTypingSaveWaitMs:row.afterTypingSaveWaitMs,savedBytes:row.savedBytes,timerBefore:row.timerBefore,timerAfter:row.timerAfter,longTasks:row.observations.longTasks}));
  }
  await fresh({raw,width:390,height:844,rate:4,recording:true});await page.locator('#resume-game').click();await page.locator('#ready').click();
  const letter=await page.locator('.letter-badge').innerText();
  for(let category=0;category<3;category++)await page.locator(`#answer-${category}`).pressSequentially(answer(letter,5,8,category));
  await awaitSaved();await page.locator('#answer-0').scrollIntoViewIfNeeded();await page.waitForTimeout(1500);
  const video=page.video();await context.close();context=null;
  const videoPath=resolve(output,'late-save-phone4x.webm');await video.saveAs(videoPath);await unlink(await video.path());
  await copyFile(videoPath,resolve(root,'media/round-10-late-save-phone4x.webm'));
  report.capture={path:'late-save-phone4x.webm',canonicalPath:'media/round-10-late-save-phone4x.webm',bytes:(await stat(videoPath)).size,sha256:digest(await readFile(videoPath)),sourceSha256,separateFromObservationalTyping:true,scope:'Actual native private typing and save-status recording, no FPS measurement'};
  assert(report.capture.bytes>0&&report.capture.bytes<10000000);
 }
 assert.equal(digest(await readFile(html)),sourceSha256);assert.deepEqual(await fingerprints(),sourceFingerprints);
 assert.deepEqual(report.runtime,{errors:[],requests:[],dialogs:[]});
 report.passed=report.prepare.passed&&(mode==='prepare'||report.profiles.length===2&&report.profiles.every(row=>row.passed));
}catch(error){report.failure=String(error);process.exitCode=1;console.error(error);}
finally{
 if(context)await context.close();await browser.close();report.finishedAt=new Date().toISOString();
 await writeFile(resolve(output,mode==='prepare'?'prepare-attempt-report.json':'report.json'),JSON.stringify(report,null,2)+'\n');
 await copyFile(new URL(import.meta.url),resolve(output,'runner.mjs'));
 console.log(JSON.stringify({passed:report.passed,mode,profiles:report.profiles.length,closedAt:report.finishedAt,failure:report.failure}));
}
