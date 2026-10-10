import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),mode=process.argv[2]??'baseline';
assert(['baseline','after'].includes(mode));
const output=resolve(root,`evidence/browser/round-3-resume-${mode}`);await mkdir(output,{recursive:true});
const digest=x=>createHash('sha256').update(x).digest('hex');
const report={mode,sourceSha256:digest(await readFile(resolve(root,'play.html'))),runnerSha256:digest(await readFile(new URL(import.meta.url))),startedAt:new Date().toISOString(),checks:[],cases:[],runtime:{errors:[],requests:[],dialogs:[]},passed:false};
console.log(JSON.stringify({pid:process.pid,mode,sourceSha256:report.sourceSha256}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});report.browser=browser.version();let context,page;
async function fresh(){if(context)await context.close();context=await browser.newContext({viewport:{width:1920,height:1080},offline:true});page=await context.newPage();page.on('pageerror',e=>report.runtime.errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('file:'))report.runtime.requests.push(r.url());});page.on('dialog',d=>{report.runtime.dialogs.push(d.message());void d.dismiss();});await page.clock.install();await page.goto(pathToFileURL(resolve(root,'play.html')).href);}
async function begin(count){await page.locator('#rounds').selectOption('1');await page.locator('#seconds').selectOption('60');for(let i=2;i<count;i++)await page.locator('#add-player').click();await page.getByLabel('Player 1 name',{exact:true}).fill('Reload Probe');await page.getByRole('button',{name:'Let’s play'}).click();}
const ready=async()=>page.locator('#ready').click();const lock=async()=>page.getByRole('button',{name:'Lock my',exact:false}).click();
async function check(name,fn){const row={name,passed:false};report.checks.push(row);try{await fn();row.passed=true;console.log(JSON.stringify(row));}catch(e){row.error=String(e);throw e;}}
try{
 for(const count of [2,8])for(const phase of ['answer','review','scores']){
  await fresh();await begin(count);
  await check(`${count} humans reload during ${phase}`,async()=>{
   await ready();const letter=await page.locator('.letter-badge').innerText(),probe=letter+' reload-probe';await page.locator('#answer-0').fill(probe);
   if(phase==='answer')await page.clock.fastForward(10000);
   else{await lock();for(let i=1;i<count;i++){await ready();await lock();}await ready();if(phase==='review'){await page.locator('.vote-button[data-value=true]').click();await page.clock.fastForward(2000);}else{await lock();for(let i=1;i<count;i++){await ready();await lock();}}}
   const timerBefore=phase==='scores'?null:await page.locator('#timer').innerText();const before={phase,score:await page.locator('.points').allTextContents(),draft:phase==='answer'?await page.locator('#answer-0').inputValue():null,keepSelected:phase==='review'?await page.locator('.vote-button[data-value=true]').getAttribute('aria-pressed'):null,timer:timerBefore};
   await page.reload();await page.clock.fastForward(120000);
   if(mode==='baseline'){assert.equal(await page.locator('#setup-form').count(),1);assert.equal(await page.locator('#resume-game').count(),0);assert.equal(await page.getByLabel('Player 1 name',{exact:true}).inputValue(),'Alex');assert.equal(await page.locator('.points').count(),0);report.cases.push({count,phase,before,resumeAvailable:false,restored:false});}
   else{assert.equal(await page.locator('#resume-game').count(),1);assert.equal(await page.locator('.answer-input,.vote-card,.score-row').count(),0);await page.locator('#resume-game').click();if(phase!=='scores'){assert.equal(await page.locator('.handover').count(),1);assert.equal(await page.locator('.answer-input,.vote-card').count(),0);assert(!await page.locator('#main').innerText().then(t=>t.includes(probe)));await ready();const timerAfter=await page.locator('#timer').innerText();assert.equal(timerAfter,timerBefore,'offline gap does not consume active time');if(phase==='answer')assert.equal(await page.locator('#answer-0').inputValue(),probe);else assert.equal(await page.locator('.vote-button[data-value=true]').getAttribute('aria-pressed'),'true');}else{assert.deepEqual(await page.locator('.points').allTextContents(),before.score);assert.equal(await page.locator('.receipt-category').count(),12);}report.cases.push({count,phase,before,resumeAvailable:true,restored:true});}
  });
 }
 await check('exact HTML and offline runtime stayed clean',async()=>{assert.deepEqual(report.runtime,{errors:[],requests:[],dialogs:[]});assert.equal(digest(await readFile(resolve(root,'play.html'))),report.sourceSha256);});
 report.passed=report.checks.every(c=>c.passed);
}catch(e){report.failure=String(e);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();if(context)await context.close();await browser.close();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,sourceSha256:report.sourceSha256,failure:report.failure,closedAt:report.finishedAt}));}
