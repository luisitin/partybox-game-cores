import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {game} from './core.ts';
import {encodeCapture} from './capture-encoder.ts';
const files=['play.html','core.ts','bots.ts','ui.ts','scoring.ts','estimates.ts','samples.ts','samples.json','manifest.json','capture.ts','capture-encoder.ts'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]));
const before=hashes(),errors:string[]=[],requests:string[]=[];
const url=pathToFileURL(resolve('play.html')).href;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const directory=mkdtempSync(join(tmpdir(),'G04-notice-capture-'));
mkdirSync('media',{recursive:true});
const output='media/milestone-12-pinned-encoder.webm';
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.route('**/*',r=>r.request().url()===url?r.continue():r.abort());
 await page.goto(url);assert.equal(page.url(),url);
 let seed=0;for(let n=1;n<1000;n++){if(game.init({players:[0,1,2].map(i=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),seed:n,now:100000,settings:{mode:'bluff',rounds:4}}).question.kind==='bluff'){seed=n;break;}}
 assert(seed>0);await page.selectOption('#players','8');for(let i=1;i<8;i++)await page.selectOption(`#seat-${i}`,i%2?'sharp':'normal');
 await page.selectOption('#mode','bluff');await page.fill('#seed',String(seed));await page.click('#start');await page.click('#skip');await page.click('#skip');
 assert.equal(await page.locator('#public').getAttribute('data-phase'),'write');await page.click('#reveal-private');await page.fill('#fake','My harbour bluff');
 for(let i=0;i<18;i++){
  if(i===6){await page.click('#hide-private');assert.equal(await page.locator('#fake').count(),0);}
  if(i===12){await page.click('#reveal-private');assert.equal(await page.inputValue('#fake'),'My harbour bluff');}
  await page.screenshot({path:join(directory,`${String(i).padStart(3,'0')}.jpg`),quality:80});await page.waitForTimeout(66);
 }
 encodeCapture(directory,output);await context.close();
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);const after=hashes();assert.deepEqual(after,before);
 writeFileSync('capture-pinned-encoder-report.json',JSON.stringify({command:'node capture.ts',evidenceScope:'source-bound offline conceal/reopen capture only; no FPS acceptance',output,bytes:statSync(output).size,frameCount:18,encodedFps:12,durationSeconds:1.5,codec:'VP8 via pinned Playwright ffmpeg',sourceHashesAtStart:before,sourceHashesAtEnd:after,sourceUnchanged:true,errors,externalRequests:requests},null,2)+'\n');
 console.log(`Pinned encoder capture PASS ${statSync(output).size} bytes; source unchanged; no network/errors`);
}finally{await browser.close();rmSync(directory,{recursive:true,force:true});}
