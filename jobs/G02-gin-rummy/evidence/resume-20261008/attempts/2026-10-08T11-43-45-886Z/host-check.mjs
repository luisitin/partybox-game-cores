import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {game} from '../dist/core.mjs';
import {cardName} from '../dist/cards.mjs';
import {seedHost} from './clock-check.mjs';
const compiled=await build({entryPoints:['../../contract/rng.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {createRng}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const log=s=>game.tvView(s).log.map(x=>`${s.players[x.player].name}: ${x.action}${x.card===null?'':' '+cardName(x.card)}`);
export async function checkHost(browser){
 const checks=[];
 for(const bot of [false,true]){
  const context=await browser.newContext();await seedHost(context,7);
  await context.addInitScript(()=>{
   window.__elapsed=100;window.__ticks=[];
   Object.defineProperty(performance,'now',{value:()=>window.__elapsed});
   window.setInterval=callback=>{window.__ticks.push(callback);return window.__ticks.length;};
  });
  try{
   const page=await context.newPage();await page.goto(pathToFileURL(resolve('play.html')).href);
   if(bot)for(const id of ['#seat-0','#seat-1'])await page.locator(id).selectOption('Easy bot');
   await page.locator('#setting-turnSeconds').fill('10');await page.locator('#start').click();
   const rng=createRng(7),seed=rng.int(0,0xffffffff);
   let expected=game.init({players:[0,1].map(i=>({id:'p'+i,name:'Player '+(i+1),avatarId:'face-'+i,connected:true,bot})),seed,settings:{turnSeconds:10},now:100});
   if(!bot)await page.getByRole('button',{name:'Show my hand',exact:true}).click();
   await page.evaluate(()=>{window.__elapsed=10130;});
   expected=game.reduce(expected,{type:'timer',phaseId:expected.phase.id,startedAt:expected.phase.startedAt,now:10130});
   await (bot?page.locator('#bot-step'):page.getByRole('button',{name:'Pass upcard',exact:true})).click();
   assert.deepEqual(await page.locator('#log p').allTextContents(),log(expected),'late click must deliver only the current phase timer');
   assert.equal(await page.locator('#hand .card').count(),0,'timeout clears the private hand');
   assert((await page.locator('#notice').textContent()).includes('Time ran out'));
   checks.push({name:bot?'expired manual bot step consumes timer before sampling':'expired human click consumes timer and discards stale input',passed:true,clock:'synthetic elapsed time; interval callback withheld',lateByMs:30});
   // The actual subsequent bot moves must use the unchanged host RNG cursor.
   if(bot){
    for(let i=0;i<5;i++){
     const input=game.bot.sampleInput(expected,expected.turn,rng,'easy');assert(input);
     expected=game.reduce(expected,{type:'input',playerId:expected.turn,input,now:10130});
     await page.locator('#bot-step').click();assert.deepEqual(await page.locator('#log p').allTextContents(),log(expected));
    }
    checks.push({name:'expired step preserves host RNG for five subsequent Easy-bot moves',passed:true});
   }
  }finally{await context.close();}
 }
 const context=await browser.newContext();await seedHost(context);
 try{
  const page=await context.newPage();await page.goto(pathToFileURL(resolve('play.html')).href);await page.locator('#start').click();
  for(let i=0;i<2;i++){await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pass upcard',exact:true}).click();}
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Draw stock',exact:true}).click();
  await page.locator('#hand .card').first().click();await page.locator('#meld-choice summary').click();
  await page.waitForFunction(()=>document.querySelectorAll('#meld-builder select').length===10);
  assert.equal(await page.locator('#hand .card').count(),11);assert.equal(await page.locator('#meld-builder select').count(),10);
  await page.locator('#new-match').click();
  assert(await page.locator('#table').isHidden());assert(await page.locator('#setup').isVisible());
  for(const selector of ['#hand .card','#meld-builder select','#actions > *','#reveal > *','#log > *'])assert.equal(await page.locator(selector).count(),0);
  for(const id of ['deadwood','meld-message','result-note','notice','status'])assert.equal(await page.locator('#'+id).textContent(),'');
  assert.equal(await page.locator('#meld-choice').evaluate(el=>el.open),false);
  checks.push({name:'New match removes private cards, selectors, deadwood, actions and previous presentation',passed:true,visualLeakClaimed:false});
  await page.locator('#start').click();assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();assert.equal(await page.locator('#hand .card').count(),10);
  assert.equal(await page.locator('#meld-builder select').count(),0);
  checks.push({name:'fresh match starts covered with no stale meld draft',passed:true});
 }finally{await context.close();}
 return {kind:'host ordering and fresh-match regression',checks,passed:checks.length};
}
