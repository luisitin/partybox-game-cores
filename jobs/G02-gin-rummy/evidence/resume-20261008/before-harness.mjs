import {chromium} from 'playwright';
import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

const {game}=await import(pathToFileURL(resolve('dist/core.mjs')));
const {cardName}=await import(pathToFileURL(resolve('dist/cards.mjs')));
const {seedHost}=await import(pathToFileURL(resolve('scripts/clock-check.mjs')));
const compiled=await build({entryPoints:['../../contract/rng.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {createRng}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const htmlPath=resolve(process.argv.includes('--html')?process.argv[process.argv.indexOf('--html')+1]:'play.html');
const paths=['src/core.ts','src/cards.ts','src/browser.ts','src/play.template.html'];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const html=await readFile(htmlPath),sources=Object.fromEntries(await Promise.all(paths.map(async p=>[p,hash(await readFile(p))])));
const started=new Date().toISOString();
console.log(JSON.stringify({kind:'original-page real-click diagnostic',started,pid:process.pid,htmlSha256:hash(html),measuresFps:false}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const rows=[];
function expectedLog(s){return game.tvView(s).log.map(x=>`${s.players[x.player].name}: ${x.action}${x.card===null?'':' '+cardName(x.card)}`);}
async function race(bot){
 const context=await browser.newContext({viewport:{width:1920,height:1080}});await seedHost(context,7);
 await context.addInitScript(()=>{
  const nativeNow=performance.now.bind(performance);window.__nativeNow=nativeNow;window.__hostCalls=[];
  Object.defineProperty(performance,'now',{value:()=>{const at=nativeNow();window.__hostCalls.push(Math.floor(at));return at;}});
 });
 try{
  const page=await context.newPage();await page.goto(pathToFileURL(htmlPath).href);
  if(bot)for(const id of ['#seat-0','#seat-1'])await page.locator(id).selectOption('Easy bot');
  await page.locator('#setting-turnSeconds').fill('10');
  await page.locator('#start').evaluate(el=>el.addEventListener('click',()=>{window.__hostCalls=[];},{capture:true,once:true}));
  await page.locator('#start').click();
  const now=await page.evaluate(()=>window.__hostCalls[0]);
  const rng=createRng(7),seed=rng.int(0,0xffffffff);
  const players=[0,1].map(i=>({id:'p'+i,name:'Player '+(i+1),avatarId:'face-'+i,connected:true,bot}));
  const initial=game.init({players,seed,settings:{turnSeconds:10},now});
  const timer=game.reduce(initial,{type:'timer',phaseId:initial.phase.id,startedAt:initial.phase.startedAt,now:initial.phase.deadline+30});
  const lateInput=bot?game.bot.sampleInput(initial,initial.turn,rng,'easy'):timer.publicLog[0].action==='take-discard'?{type:'pass'}:{type:'draw',source:'discard'};
  const late=game.reduce(initial,{type:'input',playerId:initial.turn,input:lateInput,now:initial.phase.deadline+30});
  assert.notDeepEqual(expectedLog(late),expectedLog(timer));
  if(!bot)await page.getByRole('button',{name:'Show my hand',exact:true}).click();
  const target=bot?page.locator('#bot-step'):page.getByRole('button',{name:lateInput.type==='pass'?'Pass upcard':'Draw discard',exact:true});
  await target.evaluate((el,deadline)=>{
   el.addEventListener('click',()=>{
    const armAt=window.__nativeNow();
    while(window.__nativeNow()<deadline+30){}
    window.__race={armAt,dispatchAt:window.__nativeNow(),deadline};
   },{capture:true,once:true});
   document.addEventListener('click',()=>{
    if(window.__race&&!window.__race.after)window.__race.after={
     observedAt:window.__nativeNow(),status:document.querySelector('#status').textContent,
     log:[...document.querySelectorAll('#log p')].map(x=>x.textContent),
     privateCards:document.querySelectorAll('#hand .card').length,
    };
   },{once:true});
  },initial.phase.deadline);
  await target.click({timeout:20000});
  const measured=await page.evaluate(()=>window.__race);
  assert(measured.dispatchAt>initial.phase.deadline);
  assert.deepEqual(measured.after.log,expectedLog(late),'negative control must show the actual late input');
  assert.notDeepEqual(measured.after.log,expectedLog(timer),'negative control must differ from timer-first policy');
  rows.push({kind:bot?'late manual Easy-bot click':'late human click',entropySeed:7,gameSeed:seed,
   actualOrdinaryPlaywrightClick:true,actualFileNavigation:true,actualElapsedClock:true,
   capturePhaseStallMs:measured.dispatchAt-measured.armAt,lateByMs:measured.dispatchAt-initial.phase.deadline,
   lateInput,actual:measured.after,expectedTimerOnlyLog:expectedLog(timer),timerFirst:false});
 }finally{await context.close();}
}
try{
 await race(false);await race(true);
 const context=await browser.newContext();await seedHost(context,7199);
 try{
  const page=await context.newPage();await page.goto(pathToFileURL(htmlPath).href);await page.locator('#start').click();
  for(let i=0;i<2;i++){await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pass upcard',exact:true}).click();}
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Draw stock',exact:true}).click();
  await page.locator('#hand .card').first().click();await page.locator('#meld-choice summary').click();
  const dom=()=>page.evaluate(()=>({cards:document.querySelectorAll('#hand .card').length,
   meldSelectors:document.querySelectorAll('#meld-builder select').length,deadwood:document.querySelector('#deadwood').textContent,
   actions:document.querySelector('#actions').childElementCount,tableHidden:document.querySelector('#table').hidden}));
  const before=await dom();assert.equal(before.cards,11);assert.equal(before.meldSelectors,10);
  await page.locator('#new-match').click();const after=await dom();
  assert(after.tableHidden);assert.equal(after.cards,before.cards);assert.equal(after.meldSelectors,before.meldSelectors);
  rows.push({kind:'New match hidden-DOM retention',before,after,visuallyExposed:false,privateDomCleared:false});
 }finally{await context.close();}
}finally{await browser.close();}
assert.equal(hash(await readFile(htmlPath)),hash(html));
for(const p of paths)assert.equal(hash(await readFile(p)),sources[p]);
const report={baselineOnly:true,measuresFps:false,started,completed:new Date().toISOString(),htmlSha256:hash(html),
 sourceSha256:sources,sourceUnchanged:true,fixture:'actual seeded game.init roster; no state, turn, cards or core RNG injected',rows};
await mkdir('evidence/resume-20261008',{recursive:true});
await writeFile('evidence/resume-20261008/before.json',JSON.stringify(report,null,2)+'\n');
await writeFile('evidence/resume-20261008/before-play.html',html);
await writeFile('evidence/resume-20261008/before-harness.mjs',await readFile(import.meta.filename));
console.log(JSON.stringify(report));
