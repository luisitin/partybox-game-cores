import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {waitForFrameWindow,closeFrameWindow} from './frame-window.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'evidence/browser');
const media=resolve(root,'media');
await mkdir(output,{recursive:true});
await mkdir(media,{recursive:true});
const htmlPath=resolve(root,'play.html');
const digest=data=>createHash('sha256').update(data).digest('hex');
const sourceSha256=digest(await readFile(htmlPath));
const sourcePaths=['client-save.ts','client-draft.ts','client.ts','build-play.ts','src/play.template.html','src/index.ts','src/model.ts','src/scoring.ts','src/match.ts','src/select.ts','content/categories.ts','package-lock.json','LICENSE','THIRD_PARTY_NOTICES.txt','node_modules/zod/LICENSE','../../contract/rng.ts','scripts/browser-performance.mjs','scripts/frame-window.mjs'];
const fingerprint=async()=>Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,digest(await readFile(resolve(root,path)))])));
const sourceFingerprints=await fingerprint();
const htmlText=await readFile(htmlPath,'utf8');
const licenseChecks={};
for(const path of ['LICENSE','node_modules/zod/LICENSE']){const license=(await readFile(resolve(root,path),'utf8')).replace(/--/g,'- -').trim();licenseChecks[path]=htmlText.includes(license);assert(licenseChecks[path],`Full license missing from standalone HTML: ${path}`);}
const report={sourceSha256,sourceFingerprints,licenseChecks,samplingRecording:false,recordingDuringMeasurement:false,browser:'',startedAt:new Date().toISOString(),profiles:[],passed:false};
console.log(JSON.stringify({pid:process.pid,sourceSha256,action:'600 consecutive RAF samples and recording per profile'}));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
report.browser=browser.version();
try {
  for(const [label,width,height,cpuThrottle] of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
    const context=await browser.newContext({viewport:{width,height},offline:true});
    const page=await context.newPage();
    const pageErrors=[],networkRequests=[];
    page.on('pageerror',error=>pageErrors.push(String(error)));
    page.on('request',request=>networkRequests.push(request.url()));
    const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuThrottle});
    await page.goto(pathToFileURL(htmlPath).href);
    await page.locator('#rounds').selectOption('1');
    await page.locator('#seconds').selectOption('60');
    await page.getByRole('button',{name:'Let’s play'}).click();
    await page.locator('#ready').click();
    await page.waitForTimeout(250);
    const frameWindow=await waitForFrameWindow(process.env.G09_FRAME_BARRIER_DIR,label,sourceSha256);
    let frames;
    try{frames=await page.evaluate(async()=>{
      const times=[];
      await new Promise(resolve=>{
        let previous=null;
        function sample(now){
          if(previous!==null)times.push(now-previous);
          previous=now;
          if(times.length===600)resolve();
          else requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      });
      return times;
    });}catch(error){await closeFrameWindow(frameWindow,{passed:false,failedBeforeCompleteSample:true,error:String(error)});throw error;}
    const ordered=[...frames].sort((a,b)=>a-b);
    const totalMs=frames.reduce((total,ms)=>total+ms,0);
    const item={profile:label,viewport:{width,height},cpuThrottle,sourceSha256,samplingRecording:false,recordingDuringMeasurement:false,
      sampleMethod:'601 consecutive actual requestAnimationFrame timestamps, 600 adjacent deltas; no sleeps, filtering, skipped frames or synthetic timestamps',
      frames,count:frames.length,totalMs,meanMs:totalMs/600,fps:600000/totalMs,
      p95Ms:ordered[569],p99Ms:ordered[593],maxMs:ordered.at(-1),networkRequests,pageErrors};
    item.passed=frames.length===600&&frames.every(ms=>Number.isFinite(ms)&&ms>0)&&item.fps>=59&&item.p99Ms<=17&&pageErrors.length===0&&networkRequests.every(url=>url.startsWith('file:'));
    await writeFile(resolve(output,`${label}-frames.json`),JSON.stringify(item,null,2)+'\n');
    await closeFrameWindow(frameWindow,{count:item.count,fps:item.fps,p99Ms:item.p99Ms,passed:item.passed,recordingDuringMeasurement:false});
    await page.screenshot({path:resolve(output,`${label}-active.png`),fullPage:true});
    await context.close();
    assert(item.passed,`${label}: strict frame or offline runtime check failed`);
    // Video encoding is isolated from all measured RAF frames.
    const clipContext=await browser.newContext({viewport:{width,height},offline:true,recordVideo:{dir:media,size:{width:Math.min(width,1280),height:Math.min(height,720)}}});
    const clipPage=await clipContext.newPage();
    const clipPageErrors=[],clipNetworkRequests=[];
    clipPage.on('pageerror',error=>clipPageErrors.push(String(error)));
    clipPage.on('request',request=>clipNetworkRequests.push(request.url()));
    const clipCdp=await clipContext.newCDPSession(clipPage);
    await clipCdp.send('Emulation.setCPUThrottlingRate',{rate:cpuThrottle});
    await clipPage.goto(pathToFileURL(htmlPath).href);
    await clipPage.locator('#rounds').selectOption('1');
    await clipPage.locator('#seconds').selectOption('60');
    await clipPage.getByRole('button',{name:'Let’s play'}).click();
    await clipPage.locator('#ready').click();
    const clipLetter=(await clipPage.locator('.letter-badge').innerText()).trim();
    await clipPage.locator('#answer-0').fill(`${clipLetter} private-example`);
    await clipPage.locator('#answer-1').fill(`The ${clipLetter.toLowerCase()} private-example`);
    await clipPage.locator('#answer-2').fill('Z wrong-initial-example');
    assert.equal((await clipPage.locator('.draft-warning').allTextContents()).filter(Boolean).length,3,'milestone recording shows actual nonblocking private hints');
    await clipPage.locator('#answer-0').scrollIntoViewIfNeeded();
    await clipPage.waitForTimeout(3000);
    const video=clipPage.video();
    await clipContext.close();
    const videoName=`delivery-final-${label}.webm`;
    await video.saveAs(resolve(media,videoName));
    await unlink(await video.path());
    const {frames:raw,...summary}=item;
    summary.video=`media/${videoName}`;
    summary.clipContext={separateFromSampling:true,viewport:{width,height},cpuThrottle,sourceSha256,activeRecordingMs:3000,workload:'same offline 12-category answer screen with active timer and three nonblocking own-draft warnings; recording only',privateWarningRows:3,pageErrors:clipPageErrors,networkRequests:clipNetworkRequests};
    summary.videoBytes=(await stat(resolve(media,videoName))).size;
    report.profiles.push(summary);
    console.log(JSON.stringify(summary));
    assert.equal(clipPageErrors.length,0,`${label}: clip page raised an error`);
    assert(clipNetworkRequests.every(url=>url.startsWith('file:')),`${label}: clip made a network request`);
    assert(summary.videoBytes<10000000,`${label}: recording exceeds 10 MB`);
  }
  assert.equal(digest(await readFile(htmlPath)),sourceSha256,'HTML changed during strict measurement');
  assert.deepEqual(await fingerprint(),sourceFingerprints,'Canonical source changed during strict measurement');
  report.passed=report.profiles.length===2&&report.profiles.every(row=>row.passed);
} catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await browser.close();await writeFile(resolve(output,'performance-report.json'),JSON.stringify(report,null,2)+'\n');}
