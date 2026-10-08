import {chromium,type Page} from 'playwright';
import {existsSync,readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {game} from './core.ts';
const executable=process.env.CHROMIUM_PATH??(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox']});
const html=readFileSync('play.html','utf8'),errors:string[]=[],requests:string[]=[],functional:string[]=[];
const repeat=process.argv.includes('--repeat=2')?2:process.argv.includes('--repeat=3')?3:1;
const capturePath=repeat===1?'media/milestone-8-catalog.webm':`media/milestone-9-repeat-${repeat}.webm`;
const reportPath=repeat===1?'browser-report.json':`browser-repeat-${repeat}.json`;
mkdirSync('media',{recursive:true});
async function pageFor(viewport={width:390,height:844},reducedMotion:'reduce'|'no-preference'='no-preference'){
 const context=await browser.newContext({viewport,reducedMotion}),page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
 await page.route('**/*',route=>route.abort());await page.setContent(html);return {context,page};
}
const phase=(p:Page)=>p.locator('#public').getAttribute('data-phase');
async function freezeClock(p:Page){await p.clock.install({time:100000});await p.clock.pauseAt(101000);}
function initial(kind:string,mode='quick'){
 for(let seed=1;seed<1000;seed++){
  const state=game.init({players:[0,1,2].map(i=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),seed,now:100000,settings:{mode,rounds:4}});
  if(state.question.kind===kind||state.question.realm===kind)return {seed,state};
 }throw new Error('No seed for '+kind);
}
async function start(p:Page,{seed=1,mode='quick',players=2,rounds=4}:{seed?:number;mode?:string;players?:number;rounds?:number}={}){
 await p.selectOption('#players',String(players));await p.selectOption('#mode',mode);await p.selectOption('#rounds',String(rounds));await p.fill('#seed',String(seed));await p.click('#start');
}
async function moveToInput(p:Page){assert.equal(await phase(p),'wheel');await p.click('#skip');assert.equal(await phase(p),'demo');await p.click('#skip');assert(['answer','write'].includes((await phase(p))!));}
try {
 // Real data timers: 3-second wheel, full 10-second demo, pause/resume without a new deadline.
 const timing=await pageFor();await freezeClock(timing.page);await start(timing.page);
 assert(await timing.page.locator('.wheel').isVisible(),'phone must show the spinning wheel');await timing.page.clock.runFor(2999);assert.equal(await phase(timing.page),'wheel');await timing.page.clock.runFor(1);assert.equal(await phase(timing.page),'demo');
 await timing.page.clock.runFor(9999);assert.equal(await phase(timing.page),'demo');await timing.page.clock.runFor(1);assert.equal(await phase(timing.page),'answer');
 await timing.page.click('#pause');await timing.page.clock.runFor(60000);assert.equal(await phase(timing.page),'answer');assert.equal(await timing.page.locator('#private input,#private textarea').count(),0);
 await timing.page.click('#pause');await timing.page.clock.runFor(49999);assert.equal(await phase(timing.page),'answer');await timing.page.clock.runFor(1);assert.equal(await phase(timing.page),'reveal');
 await timing.page.click('#end');assert.equal(await phase(timing.page),'done');await timing.page.click('#restart');assert(await timing.page.locator('#setup').isVisible());assert.equal(await timing.page.locator('#private input').count(),0);
 await timing.context.close();functional.push('3s wheel / 10s demo / exact pause-shifted deadline / end and restart');
 const landing=await pageFor({width:1920,height:1080});await freezeClock(landing.page);
 for(const realm of ['emergency-room','dead-or-alive','internet-famous','ancient-or-ikea','name-your-baby','real-town-or-fake','patent-pending','do-not-use']){
  const {seed}=initial(realm,'mixed');await start(landing.page,{seed,mode:'mixed'});await landing.page.clock.runFor(3000);assert.equal(await phase(landing.page),'demo');
  assert(await landing.page.evaluate(()=>{
   const chosen=Array.from(document.querySelectorAll('#wheel-panel li')).findIndex(e=>e.classList.contains('chosen'));
   const angle=(chosen+.5)*Math.PI/4-Math.PI/2,rotation=new DOMMatrix(getComputedStyle(document.querySelector('#wheel-panel svg')!).transform);
   const x=rotation.a*Math.cos(angle)+rotation.c*Math.sin(angle),y=rotation.b*Math.cos(angle)+rotation.d*Math.sin(angle);
   return chosen>=0&&Math.abs(x)<.00001&&y<-.99999;
  }),'selected wedge must land under the pointer');await landing.page.click('#restart');
 }
 await landing.context.close();functional.push('all eight realm wedges land under the wheel pointer');
 // Every Quick controller is playable, concealed on handover and scores through the actual reducer.
 for(const kind of ['number','choice','century','decade']){
  const {seed,state}=initial(kind),match=await pageFor();await freezeClock(match.page);await start(match.page,{seed});await moveToInput(match.page);
  assert.equal(await match.page.locator('#answer,[data-value]').count(),0);
  for(let i=0;i<2;i++){
   await match.page.click('#reveal-private');
   if(kind==='choice')await match.page.click(`[data-value="${state.question.correct}"]`);
   else {
    const input=match.page.locator('#answer');
    if(kind==='number')await input.fill(String(state.question.correct));
    else await input.evaluate((element,n)=>{(element as HTMLInputElement).value=String(n);element.dispatchEvent(new Event('input',{bubbles:true}));},Number(state.question.correct));
    if(kind==='century'){
     await input.evaluate(element=>{(element as HTMLInputElement).value='0';element.dispatchEvent(new Event('input',{bubbles:true}));});assert(await match.page.locator('#lock-answer').isDisabled());
     await input.evaluate((element,n)=>{(element as HTMLInputElement).value=String(n);element.dispatchEvent(new Event('input',{bubbles:true}));},Number(state.question.correct));
    }
    const saved=await input.inputValue();await match.page.click('#hide-private');assert.equal(await match.page.locator('#answer').count(),0);await match.page.click('#reveal-private');assert.equal(await match.page.inputValue('#answer'),saved,'number/range draft must survive concealment');
    await match.page.click('#lock-answer');
   }
   assert.equal(await match.page.locator('#private input,#private textarea,[data-value]').count(),0);
  }
  assert.equal(await phase(match.page),'reveal');assert.deepEqual(await match.page.locator('.score strong').allTextContents(),['1000','1000']);
  await match.page.click('#next');assert.equal(await phase(match.page),'wheel');await match.context.close();functional.push(`${kind} control / private handover / exact score`);
 }
 // Two equivalent submissions merge; only their authors see the disabled own-bluff marker.
 const {seed:bluffSeed,state:bluffState}=initial('bluff','bluff'),bluff=await pageFor();await freezeClock(bluff.page);await start(bluff.page,{seed:bluffSeed,mode:'bluff',players:3});await moveToInput(bluff.page);
 for(const text of ['<img onerror=alert(1)> fake','<IMG ONERROR=ALERT(1)> FAKE','another answer']){
  await bluff.page.click('#reveal-private');await bluff.page.fill('#fake',text);await bluff.page.getByRole('button',{name:'Lock in bluff',exact:true}).click();
  if(await phase(bluff.page)==='write')assert(!(await bluff.page.locator('#public').innerText()).includes(text));
  assert.equal(await bluff.page.locator('#fake').count(),0);
 }
 assert.equal(await phase(bluff.page),'vote');
 for(let i=0;i<3;i++){
  await bluff.page.click('#reveal-private');assert.equal(await bluff.page.locator('#private img').count(),0);assert.equal(await bluff.page.locator('[data-choice]:disabled').count(),1);
  const text=i<2?String(bluffState.question.correct):'<img onerror=alert(1)> fake';
  await bluff.page.getByRole('button',{name:text,exact:true}).click();
 }
 assert.equal(await phase(bluff.page),'reveal');assert.deepEqual(await bluff.page.locator('.score strong').allTextContents(),['1250','1250','0']);await bluff.context.close();functional.push('bluff write/vote/reveal / duplicates / own vote disabled / escaped user text');
 // Correct writers are still offered a concealed handover, so its public order does not identify them.
 const correct=await pageFor();await freezeClock(correct.page);await start(correct.page,{seed:bluffSeed,mode:'bluff',players:3});await moveToInput(correct.page);
 for(const text of [String(bluffState.question.correct),'a different fake','another different fake']){await correct.page.click('#reveal-private');await correct.page.fill('#fake',text);await correct.page.getByRole('button',{name:'Lock in bluff',exact:true}).click();}
 assert.equal(await phase(correct.page),'vote');assert((await correct.page.locator('#private').innerText()).includes('Player 1'));assert(!(await correct.page.locator('#public').innerText()).includes('wrote the truth'));
 await correct.page.click('#reveal-private');assert((await correct.page.locator('#private').innerText()).includes('You wrote the truth'));await correct.page.getByRole('button',{name:'Hide and pass',exact:true}).click();assert(!(await correct.page.locator('#private').innerText()).includes('You wrote the truth'));await correct.context.close();functional.push('correct-write credit confirmation is private and concealed before handover');
 const concealed=await pageFor();await freezeClock(concealed.page);await start(concealed.page,{seed:bluffSeed,mode:'bluff'});await moveToInput(concealed.page);await concealed.page.click('#reveal-private');await concealed.page.fill('#fake','My unfinished harbour draft');
 await concealed.page.click('#hide-private');assert.equal(await concealed.page.locator('#fake').count(),0);assert(!(await concealed.page.locator('#private').innerText()).includes('unfinished harbour'));await concealed.page.click('#reveal-private');assert.equal(await concealed.page.inputValue('#fake'),'My unfinished harbour draft');
 await concealed.page.click('#pause');assert.equal(await concealed.page.locator('#fake').count(),0);await concealed.page.click('#pause');await concealed.page.click('#reveal-private');assert.equal(await concealed.page.inputValue('#fake'),'My unfinished harbour draft');
 await concealed.page.getByRole('button',{name:'Lock in bluff',exact:true}).click();await concealed.page.click('#reveal-private');assert.equal(await concealed.page.inputValue('#fake'),'','the next owner must not inherit a private draft');await concealed.context.close();functional.push('bluff/number/range drafts survive hide and pause, remain absent from hidden DOM and never cross owners');
 // A bot finishing its input must not erase or blur the human's unfinished answer.
 const draft=await pageFor();await freezeClock(draft.page);await draft.page.selectOption('#seat-1','normal');await start(draft.page,{seed:bluffSeed,mode:'bluff'});await moveToInput(draft.page);await draft.page.click('#reveal-private');await draft.page.fill('#fake','Unfinished human draft');await draft.page.clock.runFor(350);assert.equal(await draft.page.inputValue('#fake'),'Unfinished human draft');assert.equal(await draft.page.locator('#fake').evaluate(e=>e===document.activeElement),true);await draft.context.close();functional.push('draft and keyboard focus survive another player’s input');
 // Exercise the delivered UI's full match, default eight rounds, every mode and low/mid/high roster.
 for(const mode of ['quick','mixed','bluff'])for(const players of [2,4,8]){
  const match=await pageFor();await freezeClock(match.page);await match.page.selectOption('#players',String(players));
  for(let i=0;i<players;i++)await match.page.selectOption(`#seat-${i}`,i%3===0?'sharp':i%3===1?'normal':'easy');
  await start(match.page,{seed:44,mode,players,rounds:8});await match.page.clock.runFor(600000);assert.equal(await phase(match.page),'done');assert.equal(await match.page.locator('.receipt').count(),players);assert.equal(await match.page.locator('#private input,#private textarea').count(),0);assert((await match.page.locator('#public').innerText()).includes('Round 8 / 8 · ×2'));
  assert(await match.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await match.context.close();functional.push(`full ${mode}, ${players} seats, eight rounds, finite results, no overflow`);
 }
 const keyboard=await pageFor();await freezeClock(keyboard.page);await start(keyboard.page,{seed:bluffSeed,mode:'bluff'});await moveToInput(keyboard.page);const prompt=await keyboard.page.locator('#public .question').innerText();await keyboard.page.click('#reveal-private');assert.equal(await keyboard.page.locator('#private .private-question').innerText(),prompt);assert(await keyboard.page.locator('#public').isHidden());await keyboard.page.keyboard.type('Keyboard harbour');assert.equal(await keyboard.page.inputValue('#fake'),'Keyboard harbour');assert.equal(await keyboard.page.locator('#controller-countdown').innerText(),await keyboard.page.locator('#countdown').innerText());await keyboard.page.click('#hide-private');assert(await keyboard.page.locator('#public').isVisible());await keyboard.context.close();functional.push('phone controller has question, live timer and keyboard focus; shared board returns after hide');
 const long=await pageFor();await freezeClock(long.page);await start(long.page,{seed:bluffSeed,mode:'bluff',players:3});await moveToInput(long.page);for(const letter of ['W','B','D']){await long.page.click('#reveal-private');await long.page.fill('#fake',letter.repeat(160));await long.page.getByRole('button',{name:'Lock in bluff',exact:true}).click();}await long.page.click('#reveal-private');assert(await long.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'160-character unbroken legal bluff must wrap');await long.context.close();functional.push('maximum-length unbroken bluffs wrap within the phone viewport');
 const performance=[];
 for(const [name,viewport,throttle] of [['tv',{width:1920,height:1080},1],['phone',{width:390,height:844},4]] as const){
  const match=await pageFor(viewport),cdp=await match.context.newCDPSession(match.page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  await match.page.selectOption('#players','8');for(let i=1;i<8;i++)await match.page.selectOption(`#seat-${i}`,i%2?'sharp':'normal');
  await start(match.page,{seed:bluffSeed,mode:'bluff',players:8,rounds:8});await moveToInput(match.page);await match.page.click('#reveal-private');await match.page.fill('#fake','My harbour bluff');
  const frames=await match.page.evaluate(()=>new Promise<number[]>(resolve=>{const deltas:number[]=[];let previous:number|null=null;function tick(now:number){if(previous!==null)deltas.push(now-previous);previous=now;if(deltas.length===300)resolve(deltas);else requestAnimationFrame(tick);}requestAnimationFrame(tick);}));
  const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
  const report={name,viewport,throttle,scenario:'eight seats, open human controller, seven concurrent bot inputs',frames:frames.length,meanMs:mean,p95Ms:sorted[Math.floor(sorted.length*.95)]!,p99Ms:sorted[Math.floor(sorted.length*.99)]!,fps:1000/mean};performance.push(report);console.log(report);assert(report.fps>=58,`${name} mean below 58 fps`);assert(report.p95Ms<=18,`${name} p95 misses 60-Hz budget`);
  assert(await match.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(name==='tv')assert(await match.page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight));
  await match.page.screenshot({path:`media/${repeat===1?'':`repeat-${repeat}-`}${name}.png`,fullPage:true});
  if(name==='tv'){
   const directory=mkdtempSync(join(tmpdir(),'G04-capture-'));
   try{for(let i=0;i<36;i++){if(i===12)await match.page.click('#hide-private');if(i===18){await match.page.click('#reveal-private');assert.equal(await match.page.inputValue('#fake'),'My harbour bluff');}await match.page.screenshot({path:join(directory,`${String(i).padStart(3,'0')}.png`)});await match.page.waitForTimeout(66);}const encode=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','12','-i',join(directory,'%03d.png'),'-c:v','libvpx-vp9','-b:v','700k','-an',capturePath],{encoding:'utf8'});assert.equal(encode.status,0,encode.stderr||encode.error?.message);assert(statSync(capturePath).size<10*1024*1024);}finally{rmSync(directory,{recursive:true});}
  }
  await match.context.close();
 }
 const reduced=await pageFor({width:390,height:844},'reduce');await start(reduced.page);assert(await reduced.page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));assert.equal(await reduced.page.evaluate(()=>document.getAnimations().length),0);await reduced.context.close();functional.push('reduced-motion disables wheel animation');
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 writeFileSync(reportPath,JSON.stringify({functional,navigationMode:'Exact play.html bytes via setContent; managed Chromium blocks file:// navigation',externalRequests:requests,errors,performance,physicalPhone:'unavailable; 390×844 Chromium with 4× CPU is the measured approximation',capture:capturePath,captureBytes:statSync(capturePath).size},null,2)+'\n');console.log(`Browser ${functional.length} functional scenarios, offline,privacy,reduced-motion,frame times and capture passed (sample ${repeat})`);
}finally{await browser.close();}
