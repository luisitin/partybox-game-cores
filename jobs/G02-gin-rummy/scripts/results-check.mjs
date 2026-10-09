import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {targetFixture,fixturePage} from '../tests/browser-fixture.mjs';
import {seedHost} from './clock-check.mjs';
export async function checkResults(browser,capture=false){
 const path=await fixturePage(targetFixture(),'target-fixture'),rows=[];
 for(const [label,width,height,rate]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const context=await browser.newContext({viewport:{width,height},...(capture?{recordVideo:{dir:'.work/browser',size:{width:Math.min(width,1280),height:Math.min(height,1080)}}}:{})});
  await seedHost(context);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const cd=await context.newCDPSession(page);await cd.send('Emulation.setCPUThrottlingRate',{rate});
  try{
   await page.goto(pathToFileURL(path).href);await page.locator('#start').click();await page.getByRole('button',{name:'Show my hand',exact:true}).click();
   await page.locator('[data-card="39"]').click();await page.getByRole('button',{name:'Knock / Gin',exact:true}).click();
   assert.equal(await page.locator('#status').textContent(),'Target winner wins');
   assert((await page.locator('#scores').textContent()).includes('Target winner · 388 points'));
   assert((await page.locator('#scores').textContent()).includes('Seat 1 · 499 points'));
   assert((await page.locator('#result-note').textContent()).includes('First to 100 hand points wins'));
   assert.equal(await page.locator('#hand .card').count(),0);assert.deepEqual(errors,[]);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(capture)await page.screenshot({path:`.work/browser/round-5-${label}-result.png`,fullPage:true});
   rows.push({label,cpuThrottle:rate,targetWinner:'p0',displayedWinner:'Target winner',finalPoints:{p0:388,p1:499},
    explanationVisible:true,pageErrors:0,fixture:'initial state only; production reducer and renderer'});
  }finally{const video=page.video();await context.close();if(capture&&video)await video.saveAs(`media/round-5-${label}-results.webm`);}
 }
 await writeFile('.work/results-after.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify({resultsRegression:rows}));return rows;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{await checkResults(browser,process.argv.includes('--capture'));}finally{await browser.close();}
}
