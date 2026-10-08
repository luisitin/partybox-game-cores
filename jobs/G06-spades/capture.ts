import {chromium} from 'playwright';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {encodeCapture} from './capture-encoder.ts';

const arguments_=process.argv.slice(2);assert.equal(arguments_.length,1,'supply exactly one --milestone=<1..9999> argument');
const milestoneMatch=arguments_[0]?.match(/^--milestone=([1-9]\d{0,3})$/);assert(milestoneMatch,'valid --milestone=<1..9999> required');const milestone=milestoneMatch[1]!;
const output=`media/milestone-${milestone}-pinned-encoder.webm`,reportPath=`capture-milestone-${milestone}-report.json`;
assert(!existsSync(output)&&!existsSync(reportPath),'refusing to overwrite an existing capture milestone; use a new number');
const files=['play.html','ui.ts','core.ts','bots.ts','cards.ts','scoring.ts','deck.json','manifest.json','capture.ts','capture-encoder.ts'];
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const hashes=()=>Object.fromEntries(files.map(f=>[f,hash(readFileSync(f))]));
const before=hashes(),errors:string[]=[],requests:string[]=[],functional:string[]=[];
const url=pathToFileURL(resolve('play.html')).href;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const directory=mkdtempSync(join(tmpdir(),'G06-capture-'));
const startedAt=new Date().toISOString();
mkdirSync('media',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.route('**/*',r=>r.request().url()===url?r.continue():r.abort());
 await page.clock.install({time:100000});await page.clock.pauseAt(101000);
 await page.goto(url);assert.equal(page.url(),url);
 await page.selectOption('#mode','partnership');await page.fill('#seed','17');await page.click('#start');
 assert.equal(await page.locator('#public').getAttribute('data-phase'),'bid');
 assert.equal(await page.locator('[data-card]').count(),0);await page.click('#show-hand');
 assert.equal(await page.locator('[data-card]').count(),13);await page.selectOption('#bid-value','5');
 for(let i=0;i<18;i++){
  if(i===6){await page.click('#hide-hand');assert.equal(await page.locator('[data-card]').count(),0);}
  if(i===12){await page.click('#show-hand');assert.equal(await page.inputValue('#bid-value'),'5');}
  await page.screenshot({path:join(directory,`${String(i).padStart(3,'0')}.jpg`),quality:80});
 }
 functional.push('actual file: four seats, 13 own cards, conceal/reopen preserves bid5, hidden cards absent');
 await page.click('#restart');assert.equal(await page.locator('[data-card]').count(),0);
 await page.selectOption('#mode','cutthroat');await page.click('#start');await page.click('#show-hand');
 assert.equal(await page.locator('[data-card]').count(),17);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 functional.push('new table clears cards; three seats own17 cards; phone does not overflow');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.evaluate(()=>Array.from(document.querySelectorAll('*')).every(e=>getComputedStyle(e).animationName==='none')));
 functional.push('reduced motion disables animation');
 encodeCapture(directory,output);await context.close();
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);assert.deepEqual(hashes(),before);
 assert(statSync(output).size<10*1024*1024);
 writeFileSync(reportPath,JSON.stringify({startedAt,finishedAt:new Date().toISOString(),command:`node capture.ts --milestone=${milestone}`,scope:'Actual-file functional/source-bound short capture only; not FPS acceptance',output,bytes:statSync(output).size,sha256:hash(readFileSync(output)),frameCount:18,encodedFps:12,sourceHashesAtStart:before,sourceHashesAtEnd:hashes(),sourceUnchanged:true,functional,errors,externalRequests:requests},null,2)+'\n');
 console.log(`G06 separate actual-file capture PASS ${statSync(output).size} bytes, source unchanged, zero network/errors; no FPS claim`);
}finally{await browser.close();rmSync(directory,{recursive:true,force:true});}
