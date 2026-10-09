import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
export async function seedHost(context,seed=7199){
 await context.addInitScript(seed=>{
  window.__entropyCalls=0;
  Object.defineProperty(crypto,'getRandomValues',{value:array=>{window.__entropyCalls++;array.fill(seed);return array;}});
 },seed);
}
export async function checkClock(browser){
 const context=await browser.newContext();await seedHost(context);
 await context.addInitScript(()=>{
  window.__elapsed=0;window.__ticks=[];
  Object.defineProperty(performance,'now',{value:()=>window.__elapsed});
  window.setInterval=callback=>{window.__ticks.push(callback);return window.__ticks.length;};
 });
 try{
  const page=await context.newPage();await page.goto('file://'+resolve('play.html'));
  assert.equal(await page.evaluate(()=>window.__entropyCalls),1,'production bootstrap obtains an entropy seed');
  await page.locator('#setting-turnSeconds').fill('10');await page.locator('#start').click();
  assert((await page.locator('#clock').textContent()).startsWith('10s'));
  const before=await page.locator('#log p').count();
  await page.evaluate(()=>{window.__elapsed=9000;window.__ticks[0]();});
  assert((await page.locator('#clock').textContent()).startsWith('1s'));assert.equal(await page.locator('#log p').count(),before);
  await page.evaluate(()=>{window.__elapsed=20000;window.__ticks[0]();});
  const after=await page.locator('#log p').count();assert(after>before,'one delayed callback must consume the expired turn');
  assert((await page.locator('#notice').textContent()).includes('Time ran out'));
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  const paused=await page.locator('#clock').textContent();assert(paused.startsWith('Paused · 10s'));
  await page.evaluate(()=>{window.__elapsed=45000;window.__ticks[0]();});
  assert.equal(await page.locator('#clock').textContent(),paused);assert.equal(await page.locator('#log p').count(),after);
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  assert((await page.locator('#clock').textContent()).startsWith('10s'));
  await page.evaluate(()=>{window.__elapsed=50000;window.__ticks[0]();});
  assert((await page.locator('#clock').textContent()).startsWith('5s'));assert.equal(await page.locator('#log p').count(),after);
  await page.evaluate(()=>{window.__elapsed=55000;window.__ticks[0]();});
  assert(await page.locator('#log p').count()>after);
  const report={kind:'synthetic delayed-host-callback and pause regression',elapsedMs:20000,configuredTurnMs:10000,
   firstExpiredCallbackCount:1,actionsBefore:before,actionsAfter:after,deadlineAdvancedOnElapsedTime:true,
   visibleCountdown:true,pausePreservesRemainingTime:true,entropyCalls:1,controlledTestSeed:7199};
  await writeFile('.work/clock-after.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));return report;
 }finally{await context.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{await checkClock(browser);}finally{await browser.close();}
}
