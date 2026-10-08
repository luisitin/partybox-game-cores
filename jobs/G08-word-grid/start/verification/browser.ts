import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync,renameSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {homedir} from 'node:os';
import {resolve} from 'node:path';
import {chromium,type Page} from 'playwright-core';
import {referenceDictionary,referenceSolve} from '../research/reference-solver';
const target=process.env.G08_BROWSER_URL??`file://${resolve('play.html')}`;
const nativeOnly=process.env.G08_NATIVE_ONLY==='1';
if(process.env.CI){assert(target.startsWith('file:'),'CI must open actual disk HTML');assert(!nativeOnly,'CI must run both FPS gates');}
const executable=process.env.G08_CHROMIUM??['/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>{try{statSync(p);return true;}catch{return false;}});
assert(executable,'Chrome/Chromium executable unavailable');
mkdirSync('.tmp/visual',{recursive:true});mkdirSync('media',{recursive:true});
// Playwright's video encoder is a tool dependency. Use the installed system encoder.
const encoder=resolve(homedir(),'.cache/ms-playwright/ffmpeg-1011');mkdirSync(encoder,{recursive:true});
execFileSync('ln',['-sf','/usr/bin/ffmpeg',`${encoder}/ffmpeg-linux`]);
const browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors:string[]=[],outgoing:string[]=[];
const words=JSON.parse(readFileSync('start/games/shake-up/content/common-words.en.json','utf8')) as string[];
const blocked=new Set(JSON.parse(readFileSync('start/games/shake-up/content/blocked.en.json','utf8')) as string[]);
const dictionary=referenceDictionary(words.filter(w=>!blocked.has(w)));
async function open(width:number,height:number,reduce=false,video=false) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:reduce?'reduce':'no-preference',hasTouch:width<600,...(video?{recordVideo:{dir:'.tmp/visual',size:{width:Math.min(width,960),height:Math.min(height,1080)}}}:{})});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{const url=req.url();if(/^https?:/.test(url)&&!url.startsWith('http://127.0.0.1:'))outgoing.push(url.split('?')[0]!);});
  await page.goto(target);await page.getByRole('button',{name:'Start Shake Up'}).waitFor();return {page,context};
}
async function setup(page:Page,n=2,grid='4x4',lang='en',ready=true){
  await page.getByLabel(/^Players/).selectOption(String(n));await page.getByLabel('Seed',{exact:true}).fill('17');
  await page.getByLabel(/^Grid/).selectOption(grid);
  await page.getByLabel(/^Rounds/).selectOption('1');await page.getByLabel(/^Seconds per person/).selectOption('90');
  await page.getByLabel(/^Words/).selectOption(lang);
  const readyText=lang==='es'?'Estoy listo':'I’m ready';
  await page.getByRole('button',{name:lang==='es'?'Empezar Shake Up':'Start Shake Up'}).click();assert.equal(await page.locator('main').getAttribute('data-phase'),'shake');
  await page.getByRole('button',{name:lang==='es'?'Continuar':'Continue',exact:true}).click();
  await page.waitForFunction(`document.activeElement?.textContent===${JSON.stringify(readyText)}`);
  if(ready){await page.getByRole('button',{name:readyText}).click();await page.waitForFunction(`document.activeElement?.getAttribute('role')==='gridcell'`);}
  assert.equal(await page.locator('main').getAttribute('data-phase'),'hunt');
}
async function trace(page:Page,path:number[]){
  for(const cell of path){await page.getByRole('gridcell').nth(cell).focus();await page.keyboard.press('Enter');}
  await page.getByRole('button',{name:'✓ Submit',exact:true}).click();
}
async function frames(page:Page,ms=10000){
  // A literal browser script avoids tsx's Node-only __name instrumentation crossing realms.
  return page.evaluate<{frames:number;milliseconds:number;fps:number;meanMs:number;p95Ms:number;maxMs:number}>(`(async()=>{
    const dt=[],start=performance.now();let previous=start;
    await new Promise(done=>{const tick=now=>{if(now-previous>0)dt.push(now-previous);previous=now;if(now-start>=${ms})done();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});
    const sorted=dt.slice().sort((a,b)=>a-b);return {frames:dt.length,milliseconds:previous-start,fps:dt.length*1000/(previous-start),meanMs:dt.reduce((a,b)=>a+b,0)/dt.length,p95Ms:sorted[Math.ceil(sorted.length*.95)-1],maxMs:sorted.at(-1)};
  })()`);
}
let desktopFrames:Awaited<ReturnType<typeof frames>>|null=null,phoneFrames:Awaited<ReturnType<typeof frames>>|null=null;
if(!nativeOnly){
 const desktop=await open(1920,1080);await setup(desktop.page);await desktop.page.getByRole('button',{name:'Public stage',exact:true}).click();
 await desktop.page.screenshot({path:'.tmp/visual/desktop-original-tv.png'});desktopFrames=await frames(desktop.page);assert(desktopFrames.fps>=59,`desktop ${desktopFrames.fps} fps`);assert(desktopFrames.p95Ms<=20);await desktop.context.close();
 const measured=await open(390,844);await setup(measured.page);const measuredCdp=await measured.context.newCDPSession(measured.page);await measuredCdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await measured.page.screenshot({path:'.tmp/visual/phone-original-hunt.png'});phoneFrames=await frames(measured.page);assert(phoneFrames.fps>=59,`CPU4 phone ${phoneFrames.fps} fps`);assert(phoneFrames.p95Ms<=20);await measured.context.close();
}
// Capture native interactions separately so encoder CPU is not part of the player FPS benchmark.
const phone=await open(390,844,false,true);await setup(phone.page);const cdp=await phone.context.newCDPSession(phone.page);
const cells=phone.page.getByRole('gridcell');const letters=(await cells.allTextContents()).map(s=>s.toLowerCase());
const found=[...referenceSolve(letters,4,dictionary,3)].filter(([w])=>w.length>=5);assert(found.length>2,'test seed must have traceable common words');
const [word,path]=found[0]!;await cells.nth(0).focus();await phone.page.keyboard.press('ArrowRight');assert.equal(await cells.nth(1).evaluate(el=>el===document.activeElement),true);
await trace(phone.page,path);await phone.page.getByText(word.toUpperCase(),{exact:true}).last().waitFor();
await phone.page.getByRole('button',{name:'Pause',exact:true}).click();const clock=await phone.page.locator('[aria-live="polite"]').first().innerText();
await phone.page.waitForTimeout(600);assert.equal(await phone.page.locator('[aria-live="polite"]').first().innerText(),clock);assert.equal(await cells.nth(0).getAttribute('tabindex'),'-1');
await phone.page.getByRole('button',{name:'Resume',exact:true}).click();assert.equal(await cells.nth(0).getAttribute('aria-disabled'),'false');
const [dragWord,dragPath]=found.find(([w])=>w!==word)!;
const centers=await Promise.all(dragPath.map(async i=>{const b=await cells.nth(i).boundingBox();assert(b);return{x:b.x+b.width/2,y:b.y+b.height/2};}));
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...centers[0]!,id:7}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...centers[1]!,id:7}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
assert.equal(await phone.page.getByRole('button',{name:'✓ Submit',exact:true}).count(),0,'cancel must clear trace');
assert(!(await phone.page.locator('body').innerText()).includes(dragWord.toUpperCase()),'cancel must not submit');
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...centers[0]!,id:8}]});
for(const p of centers.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:8}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.page.getByText(dragWord.toUpperCase(),{exact:true}).last().waitFor();
await phone.page.screenshot({path:'.tmp/visual/native-traces.png'});
await phone.page.getByRole('button',{name:'Public stage',exact:true}).click();assert(!(await phone.page.locator('body').innerText()).includes(word.toUpperCase()));
await phone.page.getByRole('button',{name:'Public stage',exact:true}).click();await phone.page.getByRole('button',{name:'Finish turn',exact:true}).click();
assert(!(await phone.page.locator('body').innerText()).includes(word.toUpperCase()),'handoff leaks prior list');assert.equal(await phone.page.getByRole('gridcell').count(),0);
await phone.page.waitForFunction(`document.activeElement?.textContent==='I’m ready'`);
assert.equal(await phone.page.getByRole('button',{name:'I’m ready'}).getAttribute('aria-describedby'),'handoff-name handoff-clock');
await phone.page.getByRole('button',{name:'I’m ready'}).click();await phone.page.waitForFunction(`document.activeElement?.getAttribute('role')==='gridcell'`);assert(!(await phone.page.locator('body').innerText()).includes(word.toUpperCase()),'other phone leaks first list');
await phone.page.getByRole('button',{name:'Finish turn',exact:true}).click();assert.equal(await phone.page.locator('main').getAttribute('data-phase'),'reveal');
let beats=0;while(await phone.page.locator('main').getAttribute('data-phase')==='reveal'){await phone.page.getByRole('button',{name:'Next card',exact:true}).first().click();assert(++beats<30);}
assert.equal(await phone.page.locator('main').getAttribute('data-phase'),'tally');await phone.page.getByRole('button',{name:'Continue',exact:true}).click();
assert.equal(await phone.page.locator('main').getAttribute('data-phase'),'done');await phone.page.getByRole('heading',{name:'Shake Up · Results',exact:true}).waitFor();
await phone.page.screenshot({path:'.tmp/visual/original-results.png'});
const video=phone.page.video()!;const videoPath=await video.path();await phone.context.close();
const destination='.tmp/visual/native-private-input-and-results.webm';renameSync(videoPath,destination);assert(statSync(destination).size<10*1024*1024);
const reduced=await open(390,844,true,true);await setup(reduced.page,8,'5x5','es');assert.equal(await reduced.page.getByRole('gridcell').count(),25);
assert((await reduced.page.locator('body').innerText()).includes('palabras'));
const reducedMotion=await reduced.page.getByRole('gridcell').first().evaluate(el=>getComputedStyle(el).animationDuration==='0s');assert(reducedMotion);
assert(await reduced.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await reduced.page.getByRole('button',{name:'Pausar',exact:true}).count(),1);
assert.equal(await reduced.page.getByRole('button',{name:'Terminar turno',exact:true}).count(),1);
assert.equal(await reduced.page.getByRole('button',{name:'Nueva partida',exact:true}).count(),1);
assert.equal(await reduced.page.locator('html').getAttribute('lang'),'es');
const spanishPath=await reduced.page.video()!.path();await reduced.context.close();const spanishDestination='.tmp/visual/spanish-host.webm';renameSync(spanishPath,spanishDestination);assert(statSync(spanishDestination).size<10*1024*1024);
for(const roster of [1,3,16]){const sample=await open(390,844,true);await setup(sample.page,roster);assert.equal(await sample.page.getByRole('gridcell').count(),16);await sample.context.close();}
// Full max-roster hot-seat game: permitted long name,16 distinct3-letter words,
//16way positive tie. Check actual score/avatar bounds, not just document overflow.
const layout=await open(390,844,true,true);
await layout.page.getByLabel('Name 1',{exact:true}).fill('W'.repeat(80));
await setup(layout.page,16,'4x4','en',false);
async function phoneFits(stage:string){
 const bounds=await layout.page.evaluate<{width:number;scroll:number;scores:{left:number;right:number}[];avatars:{left:number;right:number}[]}>(`(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,scores:[...document.querySelectorAll('.pb-screen-body ol li b')].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),avatars:[...document.querySelectorAll('.pb-screen-body span > .pb-avatar')].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}))()`);
 assert(bounds.scroll<=bounds.width,`${stage}: horizontal overflow`);
 for(const item of [...bounds.scores,...bounds.avatars])assert(item.left>=0&&item.right<=bounds.width,`${stage}: clipped score/avatar`);
}
await phoneFits('long-name first handoff');await layout.page.getByRole('button',{name:'I’m ready'}).click();
const tieGrid=(await layout.page.getByRole('gridcell').allTextContents()).map(s=>s.toLowerCase());
const tieWords=[...referenceSolve(tieGrid,4,dictionary,3)].filter(([w])=>w.length===3).slice(0,16);assert.equal(tieWords.length,16);
for(let seat=0;seat<16;seat++){
 if(seat){await phoneFits(`handoff${seat+1}`);await layout.page.getByRole('button',{name:'I’m ready'}).click();}
 await phoneFits(`private turn${seat+1}`);await trace(layout.page,tieWords[seat]![1]);await layout.page.getByRole('button',{name:'Finish turn',exact:true}).click();
}
let tieBeats=0;while(await layout.page.locator('main').getAttribute('data-phase')==='reveal'){
 await phoneFits('max-roster reveal');await layout.page.getByRole('button',{name:'Next card',exact:true}).first().click();assert(++tieBeats<40);
}
await phoneFits('max-roster tally');await layout.page.getByRole('button',{name:'Continue',exact:true}).click();await phoneFits('max-roster results');
assert.equal(await layout.page.locator('.pb-screen-body ol').last().locator('li').count(),16);
assert.deepEqual(await layout.page.locator('.pb-screen-body ol').last().locator('li b').allTextContents(),Array(16).fill('1'));
const crowned=layout.page.locator('.pb-screen-body span').filter({has:layout.page.locator(':scope > .pb-avatar')});assert.equal(await crowned.locator(':scope > .pb-avatar').count(),16);
await layout.page.screenshot({path:'.tmp/visual/max-roster-long-names.png'});
const layoutVideo=await layout.page.video()!.path();await layout.context.close();const layoutDestination='.tmp/visual/max-roster-long-names.webm';renameSync(layoutVideo,layoutDestination);assert(statSync(layoutDestination).size<10*1024*1024);
// Native cancellation preserves submissions and board; confirmation starts fresh.
const restart=await open(390,844,true,true);await setup(restart.page);
const restartGrid=await restart.page.getByRole('gridcell').allTextContents();await trace(restart.page,path);
restart.page.once('dialog',async dialog=>{assert.equal(dialog.type(),'confirm');await dialog.dismiss();});
await restart.page.getByRole('button',{name:'New game',exact:true}).click();
assert.equal(await restart.page.locator('main').getAttribute('data-phase'),'hunt');
assert.deepEqual(await restart.page.getByRole('gridcell').allTextContents(),restartGrid);
await restart.page.getByText(word.toUpperCase(),{exact:true}).last().waitFor();
restart.page.once('dialog',async dialog=>{assert.equal(dialog.type(),'confirm');await dialog.accept();});
await restart.page.getByRole('button',{name:'New game',exact:true}).click();await restart.page.getByRole('button',{name:'Start Shake Up',exact:true}).waitFor();
const newSeed=await restart.page.getByLabel('Seed',{exact:true}).inputValue();assert.notEqual(newSeed,'17');assert(Number(newSeed)>=0&&Number(newSeed)<=4294967295);
assert.equal(await restart.page.getByLabel('Players',{exact:true}).inputValue(),'2');assert.equal(await restart.page.getByLabel('Rounds',{exact:true}).inputValue(),'1');
assert.equal(await restart.page.getByRole('heading',{name:'Shake Up',exact:true}).evaluate(el=>el===document.activeElement),true);
await restart.page.getByRole('button',{name:'Start Shake Up',exact:true}).click();await restart.page.getByRole('button',{name:'Continue',exact:true}).click();await restart.page.getByRole('button',{name:'I’m ready'}).click();
assert.notDeepEqual(await restart.page.getByRole('gridcell').allTextContents(),restartGrid,'fresh seed should make a fresh board');
const restartPath=await restart.page.video()!.path();await restart.context.close();const restartDestination='.tmp/visual/restart-preserves-progress.webm';renameSync(restartPath,restartDestination);assert(statSync(restartDestination).size<10*1024*1024);
// All-bot observers get public counts, no manual bot-input surface, then full awards.
const observer=await open(390,844,true,true);
await observer.page.getByLabel('Seed',{exact:true}).fill('17');await observer.page.getByLabel('Rounds',{exact:true}).selectOption('1');
await observer.page.getByLabel('Player 1',{exact:true}).selectOption('normal');await observer.page.getByLabel('Player 2',{exact:true}).selectOption('sharp');
await observer.page.getByRole('button',{name:'Start Shake Up',exact:true}).click();await observer.page.getByRole('button',{name:'Continue',exact:true}).click();
await observer.page.getByRole('button',{name:'Reveal words',exact:true}).waitFor();assert.equal(await observer.page.locator('.tv-owner').count(),1);
assert.equal(await observer.page.locator('.phone-owner').count(),0);assert.equal(await observer.page.getByRole('button',{name:'Finish turn',exact:true}).count(),0);
await observer.page.waitForTimeout(3200);assert.equal(await observer.page.getByRole('button',{name:'✓ Submit',exact:true}).count(),0);
await observer.page.getByRole('button',{name:'Reveal words',exact:true}).click();let observerBeats=0;
while(await observer.page.locator('main').getAttribute('data-phase')==='reveal'){await observer.page.getByRole('button',{name:'Next card',exact:true}).first().click();assert(++observerBeats<30);}
await observer.page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await observer.page.locator('main').getAttribute('data-phase'),'done');
assert.equal(await observer.page.locator('.phone-owner').count(),1);await observer.page.getByRole('heading',{name:'Final results',exact:true}).waitFor();
assert((await observer.page.locator('.pb-screen-body ul li').count())>=3,'full final ceremony includes awards');
const observerPath=await observer.page.video()!.path();await observer.context.close();const observerDestination='.tmp/visual/bot-observer.webm';renameSync(observerPath,observerDestination);assert(statSync(observerDestination).size<10*1024*1024);
await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(outgoing,[]);
const report={version:1,fileOpened:target.startsWith('file:'),urlMode:target.startsWith('file:')?'disk':'local HTTP partial',nativeOnly,browser:executable,desktop:desktopFrames?{width:1920,height:1080,...desktopFrames}:null,phone:phoneFrames?{width:390,height:844,cpuThrottle:4,...phoneFrames}:null,gates:{originalClient:true,nativeKeyboard:true,arrowFocus:true,nativeDrag:true,nativeCancel:true,privateHandoff:true,otherPhonePrivate:true,publicCountsOnly:true,pauseResume:true,reducedMotion:true,spanishFiveByFive:true,rosters:[1,2,3,8,16],allPhasesToResults:true,longNamesFit:true,fullSixteenSeatHotseat:true,sixteenTiedWinnersFit:true,cancelRestartKeepsProgress:true,newGameFreshSeed:true,handoffAndGridFocus:true,spanishHostControls:true,botObserverPublicOnly:true,observerFullFinalAwards:true},observerVideoBytes:statSync(observerDestination).size,spanishVideoBytes:statSync(spanishDestination).size,restartVideoBytes:statSync(restartDestination).size,layoutVideoBytes:statSync(layoutDestination).size,outgoingRequests:outgoing.length,pageErrors:errors.length,videoBytes:statSync(destination).size};
writeFileSync('.tmp/visual/browser-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
