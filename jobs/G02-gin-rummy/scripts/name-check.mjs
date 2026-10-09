import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {seedHost} from './clock-check.mjs';
export async function checkNames(browser){
 const context=await browser.newContext({viewport:{width:390,height:844}});await seedHost(context);
 const page=await context.newPage(),dialogs=[],errors=[],requests=[];
 page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss();});page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{if(!r.url().startsWith('file:'))requests.push(r.url());});
 const cd=await context.newCDPSession(page);await cd.send('Emulation.setCPUThrottlingRate',{rate:4});
 try{
  await page.goto('file://'+resolve('play.html'));const payload='<svg onload=alert(1)>';
  await page.locator('#name-0').fill(payload);assert.equal(await page.locator('#name-0').inputValue(),payload);
  await page.locator('#start').click();assert((await page.locator('#scores').textContent()).includes(payload));
  assert.equal(await page.locator('#scores svg,#scores img,#scores script').count(),0);
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'End match',exact:true}).click();
  assert.deepEqual(dialogs,[]);assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const report={payload,renderedAsText:true,insertedMarkupNodes:0,dialogs:0,pageErrors:0,networkRequests:0,cpuThrottle:4};
  await writeFile('.work/name-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));return report;
 }finally{await context.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{await checkNames(browser);}finally{await browser.close();}
}
