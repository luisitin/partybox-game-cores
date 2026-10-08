import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {mkdir,stat,readFile,writeFile,access,copyFile} from 'node:fs/promises';
import {browserSourceHashes,sha256} from './browser-source-guard.mjs';
import assert from 'node:assert/strict';
import {seedHost} from './clock-check.mjs';
const ciOutput=process.argv.includes('--ci-output');
const requestedTag=process.argv[2]??'latest';assert(/^[a-z0-9-]+$/.test(requestedTag));
const tag=ciOutput?requestedTag+'-'+new Date().toISOString().toLowerCase().replace(/[^a-z0-9]/g,'-'):requestedTag;
const publicHistory=process.argv.includes('--public-history');
const outputDirectory=ciOutput?'.work/browser':'media';
const reportPath=ciOutput?`.work/browser/capture-attempts/${tag}/captures.json`:`evidence/resume-20261008/${tag}-captures.json`;
const outputPaths=[...['desktop','phone4x'].map(label=>`${outputDirectory}/${tag}-${label}.webm`),reportPath];
for(const path of outputPaths){let exists=false;try{await access(path);exists=true;}catch{}assert(!exists,'refusing to overwrite actual capture '+path);}
const hashes=browserSourceHashes;
const sourceStart=await hashes(),started=new Date().toISOString(),rows=[];
console.log(JSON.stringify({kind:'functional recordings',started,pid:process.pid,sourceStart}));
await mkdir('.work/capture-temp',{recursive:true});await mkdir(outputDirectory,{recursive:true});
if(ciOutput)await mkdir(`.work/browser/capture-attempts/${tag}`,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const [label,width,height,rate]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'.work/capture-temp',size:{width:Math.min(width,1280),height:Math.min(height,844)}}});
  await seedHost(context);const page=await context.newPage(),errors=[],requests=[],cd=await context.newCDPSession(page);
  page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>{if(!request.url().startsWith('file:'))requests.push(request.url());});
  await cd.send('Emulation.setCPUThrottlingRate',{rate});await page.goto('file://'+resolve('play.html'));
  await page.locator('#start').click();
  const passActors=[];
  for(let i=0;i<2;i++){
   const actor=(await page.locator('#status').textContent()).split(' · ')[0];passActors.push(actor+': pass');
   await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pass upcard',exact:true}).click();
   if(publicHistory){
    await page.getByText('Public turn history',{exact:true}).click();
    assert.deepEqual(await page.locator('#log p').allTextContents(),passActors);
    await page.locator('#log').scrollIntoViewIfNeeded();await page.waitForTimeout(650);
    await page.getByText('Public turn history',{exact:true}).click();
   }
  }
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
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const video=page.video();await context.close();const path=`${outputDirectory}/${tag}-${label}.webm`;await video.saveAs(path);
  const bytes=(await stat(path)).size;assert(bytes<10*1024*1024);
  const row={path,bytes,sha256:sha256(await readFile(path)),cpuThrottle:rate,viewport:{width,height},performanceMeasurement:false,newMatchPrivateDomCleared:true,actualElapsedTimeoutCoveredHand:true,publicPassHistoryShown:publicHistory,passActors,networkRequests:requests.length,pageErrors:errors.length};rows.push(row);console.log(JSON.stringify(row));
 }
}finally{await browser.close();}
const sourceEnd=await hashes();assert.deepEqual(sourceEnd,sourceStart,'sources changed during recording');
const report={tag,started,completed:new Date().toISOString(),sourceStart,sourceEnd,sourceUnchanged:true,htmlSha256:sourceEnd['play.html'],performanceMeasurement:false,rows};
await mkdir('evidence/resume-20261008',{recursive:true});await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
if(ciOutput)await copyFile(reportPath,'.work/browser/captures.json');
