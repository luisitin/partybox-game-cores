import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'evidence/browser');
const media=resolve(root,'media');
await mkdir(output,{recursive:true});
await mkdir(media,{recursive:true});
const htmlPath=resolve(root,'play.html');
const digest=data=>createHash('sha256').update(data).digest('hex');
const sourceSha256=digest(await readFile(htmlPath));
const sourcePaths=['client.ts','build-play.ts','src/play.template.html','src/index.ts','src/model.ts','src/scoring.ts','src/match.ts','content/categories.ts','package-lock.json','LICENSE','THIRD_PARTY_NOTICES.txt','node_modules/zod/LICENSE','../../contract/rng.ts'];
const fingerprint=async()=>Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,digest(await readFile(resolve(root,path)))])));
const sourceFingerprints=await fingerprint();
const htmlText=await readFile(htmlPath,'utf8');
const licenseChecks={};
for(const path of ['LICENSE','node_modules/zod/LICENSE']){const license=(await readFile(resolve(root,path),'utf8')).replace(/--/g,'- -').trim();licenseChecks[path]=htmlText.includes(license);assert(licenseChecks[path],`Full license missing from standalone HTML: ${path}`);}
const report={sourceSha256,sourceFingerprints,licenseChecks,browser:'',startedAt:new Date().toISOString(),profiles:[],passed:false};
console.log(JSON.stringify({pid:process.pid,sourceSha256,action:'600 consecutive RAF samples and recording per profile'}));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
report.browser=browser.version();
try {
  for(const [label,width,height,cpuThrottle] of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
    const context=await browser.newContext({viewport:{width,height},offline:true,recordVideo:{dir:media,size:{width:Math.min(width,1280),height:Math.min(height,720)}}});
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
    const frames=await page.evaluate(async()=>{
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
    });
    const ordered=[...frames].sort((a,b)=>a-b);
    const totalMs=frames.reduce((total,ms)=>total+ms,0);
    const item={profile:label,viewport:{width,height},cpuThrottle,sourceSha256,
      sampleMethod:'601 consecutive actual requestAnimationFrame timestamps, 600 adjacent deltas; no sleeps, filtering, skipped frames or synthetic timestamps',
      frames,count:frames.length,totalMs,meanMs:totalMs/600,fps:600000/totalMs,
      p95Ms:ordered[569],p99Ms:ordered[593],maxMs:ordered.at(-1),networkRequests,pageErrors};
    item.passed=frames.length===600&&frames.every(ms=>Number.isFinite(ms)&&ms>0)&&item.fps>=59&&item.p99Ms<=17&&pageErrors.length===0&&networkRequests.every(url=>url.startsWith('file:'));
    await writeFile(resolve(output,`${label}-frames.json`),JSON.stringify(item,null,2)+'\n');
    await page.screenshot({path:resolve(output,`${label}-active.png`),fullPage:true});
    const video=page.video();
    await context.close();
    const videoName=`delivery-final-${label}.webm`;
    await video.saveAs(resolve(media,videoName));
    await unlink(await video.path());
    const {frames:raw,...summary}=item;
    summary.video=`media/${videoName}`;
    summary.videoBytes=(await stat(resolve(media,videoName))).size;
    report.profiles.push(summary);
    console.log(JSON.stringify(summary));
    assert(item.passed,`${label}: strict frame or offline runtime check failed`);
    assert(summary.videoBytes<10000000,`${label}: recording exceeds 10 MB`);
  }
  assert.equal(digest(await readFile(htmlPath)),sourceSha256,'HTML changed during strict measurement');
  assert.deepEqual(await fingerprint(),sourceFingerprints,'Canonical source changed during strict measurement');
  report.passed=report.profiles.length===2&&report.profiles.every(row=>row.passed);
} catch(error){report.failure=String(error);process.exitCode=1;}
finally{await browser.close();await writeFile(resolve(output,'performance-report.json'),JSON.stringify(report,null,2)+'\n');}
