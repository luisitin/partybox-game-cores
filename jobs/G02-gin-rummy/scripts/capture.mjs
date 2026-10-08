import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {mkdir,stat,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {seedHost} from './clock-check.mjs';
const tag=process.argv[2]??'latest';assert(/^[a-z0-9-]+$/.test(tag));
const sourcePaths=['play.html','src/core.ts','src/cards.ts','src/browser.ts','src/play.template.html'];
const hashes=async()=>Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
const sourceStart=await hashes(),started=new Date().toISOString(),rows=[];
console.log(JSON.stringify({kind:'functional recordings',started,pid:process.pid,sourceStart}));
await mkdir('.work/capture-temp',{recursive:true});await mkdir('media',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const [label,width,height,rate]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'.work/capture-temp',size:{width:Math.min(width,1280),height:Math.min(height,844)}}});
  await seedHost(context);const page=await context.newPage(),cd=await context.newCDPSession(page);
  await cd.send('Emulation.setCPUThrottlingRate',{rate});await page.goto('file://'+resolve('play.html'));
  await page.locator('#start').click();
  for(let i=0;i<2;i++){await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pass upcard',exact:true}).click();}
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Draw stock',exact:true}).click();
  await page.locator('#hand .card').first().click();await page.locator('#meld-choice summary').click();
  await page.waitForFunction(()=>document.querySelectorAll('#meld-builder select').length===10);
  assert.equal(await page.locator('#hand .card').count(),11);assert.equal(await page.locator('#meld-builder select').count(),10);
  await page.waitForTimeout(650);await page.locator('#new-match').click();
  assert.equal(await page.locator('#hand .card').count(),0);assert.equal(await page.locator('#meld-builder select').count(),0);assert.equal(await page.locator('#deadwood').textContent(),'');
  await page.waitForTimeout(500);await page.locator('#setting-turnSeconds').fill('10');await page.locator('#start').click();
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Time ran out'),{},{timeout:15000});
  assert.equal(await page.locator('#hand .card').count(),0);
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'End match',exact:true}).click();
  const video=page.video();await context.close();const path=`media/${tag}-${label}.webm`;await video.saveAs(path);
  const bytes=(await stat(path)).size;assert(bytes<10*1024*1024);
  const row={path,bytes,sha256:createHash('sha256').update(await readFile(path)).digest('hex'),cpuThrottle:rate,viewport:{width,height},performanceMeasurement:false,newMatchPrivateDomCleared:true,actualElapsedTimeoutCoveredHand:true};rows.push(row);console.log(JSON.stringify(row));
 }
}finally{await browser.close();}
const sourceEnd=await hashes();assert.deepEqual(sourceEnd,sourceStart,'sources changed during recording');
const report={tag,started,completed:new Date().toISOString(),sourceStart,sourceEnd,sourceUnchanged:true,htmlSha256:sourceEnd['play.html'],performanceMeasurement:false,rows};
await mkdir('evidence/resume-20261008',{recursive:true});await writeFile(`evidence/resume-20261008/${tag}-captures.json`,JSON.stringify(report,null,2)+'\n');
