import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {cardName} from '../dist/cards.mjs';
import {declaredRuns,knockFixture,fixturePage} from '../tests/browser-fixture.mjs';
import {seedHost} from './clock-check.mjs';
export async function checkMelds(browser,capture=false){
 const path=await fixturePage(knockFixture()),rows=[];
 for(const [label,width,height,rate]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const context=await browser.newContext({viewport:{width,height},...(capture?{recordVideo:{dir:'.work/browser',size:{width:Math.min(width,1280),height:Math.min(height,1080)}}}:{})});
  await seedHost(context);const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('file:'))requests.push(r.url());});
  const cd=await context.newCDPSession(page);await cd.send('Emulation.setCPUThrottlingRate',{rate});
  try{
   await page.goto(pathToFileURL(path).href);await page.locator('#start').click();
   await page.getByRole('button',{name:'Show my hand',exact:true}).click();
   const choose=async()=>{
    await page.locator('[data-card="40"]').click();await page.locator('#meld-choice summary').click();
    await page.locator('#meld-builder select').first().waitFor();assert.equal(await page.locator('#meld-builder select').count(),10);
    for(const [i,group]of declaredRuns.entries())for(const card of group)await page.getByRole('combobox',{name:'Group for '+cardName(card),exact:true}).selectOption(String(i+1));
   };
   await choose();assert.equal(await page.locator('#melds').count(),0,'no numeric card entry');
   assert((await page.locator('#meld-message').textContent()).includes('chosen deadwood: 1'));
   assert.equal(await page.locator('#knock-selected').isEnabled(),true);
   await page.getByRole('combobox',{name:'Group for A♠',exact:true}).selectOption('3');
   assert.equal(await page.locator('#knock-selected').isEnabled(),false);assert.equal(await page.locator('#knock-declared').isEnabled(),false);
   await page.locator('#meld-choice summary').click();await page.waitForFunction(()=>!document.querySelector('#knock-selected').disabled);
   await page.locator('#meld-choice summary').click();await page.waitForFunction(()=>document.querySelector('#knock-selected').disabled);
   await page.getByRole('combobox',{name:'Group for A♠',exact:true}).selectOption('0');
   assert.equal(await page.locator('#knock-declared').isEnabled(),true);
   if(capture)await page.screenshot({path:`.work/browser/round-4-${label}-groups.png`,fullPage:true});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'card controls fit viewport');
   await page.getByRole('button',{name:'Cover my hand',exact:true}).click();
   assert.equal(await page.locator('#hand .card').count(),0);assert.equal(await page.locator('#meld-builder select').count(),0);
   assert.equal(await page.locator('#deadwood').textContent(),'');assert.equal(await page.locator('#meld-message').textContent(),'');
   assert.equal(await page.locator('#meld-choice').evaluate(el=>el.open),false);
   await page.getByRole('button',{name:'Show my hand',exact:true}).click();await choose();
   await page.getByRole('button',{name:'Knock with these melds',exact:true}).click();
   const shown=await page.locator('#reveal [data-player="p0"] .meld').allTextContents();
   const expected=declaredRuns.map((group,i)=>`Meld ${i+1}: `+group.map(cardName).join(' · '));
   assert.deepEqual(shown,[...expected,'Deadwood 1: A♠']);
   assert.equal(await page.locator('#meld-builder select').count(),0);
   await page.getByRole('button',{name:'Use optimal melds and layoffs',exact:true}).click();
   assert.deepEqual(await page.locator('#reveal [data-player="p1"] .meld').allTextContents(),['Deadwood 0: none']);
   assert((await page.locator('#reveal').textContent()).includes('Defender: undercut +11'));
   assert((await page.locator('#reveal').textContent()).includes('Laid off:'));
   assert.equal(await page.locator('#scores').textContent(),'Knocker · 0 pointsDefender · 11 points');
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
   if(capture)await page.screenshot({path:`.work/browser/round-4-${label}-reveal.png`,fullPage:true});
   rows.push({label,cpuThrottle:rate,namedCardControls:10,privateDraftCleared:true,invalidGroupsPreventKnock:true,
    closedControlsRestoreAutomaticKnock:true,revealShowsDeclaredLayout:true,defenderResolvedDeadwood:0,undercutPoints:11,
    pageErrors:0,networkRequests:0,fixture:'initial state only; production reducer, solver and renderer'});
  }finally{
   const video=page.video();await context.close();if(capture&&video)await video.saveAs(`media/round-4-${label}-melds.webm`);
  }
 }
 await writeFile('.work/custom-meld-after.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify({customMeldRegression:rows}));return rows;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{await checkMelds(browser,process.argv.includes('--capture'));}finally{await browser.close();}
}
