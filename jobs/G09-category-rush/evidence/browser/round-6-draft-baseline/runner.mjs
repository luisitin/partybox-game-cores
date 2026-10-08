import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),mode=process.argv[2]??'after';
assert(['baseline','after'].includes(mode));
const htmlPath=resolve(root,mode==='baseline'?'evidence/browser/round-6-before/play.html':'play.html');
const output=resolve(root,`evidence/browser/round-6-draft-${mode}`);await mkdir(output,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={mode,sourceSha256:hash(await readFile(htmlPath)),runnerSha256:hash(await readFile(new URL(import.meta.url))),startedAt:new Date().toISOString(),checks:[],rosters:[],runtime:{errors:[],dialogs:[],networkRequests:[]},passed:false};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let context;
async function check(name,fn){const item={name,passed:false};report.checks.push(item);try{await fn();item.passed=true;console.log(JSON.stringify(item));}catch(error){item.error=String(error);throw error;}}
try{
 for(const count of [2,8])await check(`${count} people receive private, nonblocking feedback before locking`,async()=>{
  if(context)await context.close();context=await browser.newContext({offline:true,viewport:{width:count===8?390:1920,height:count===8?844:1080}});const page=await context.newPage();
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  page.on('pageerror',error=>report.runtime.errors.push(String(error)));page.on('request',request=>{if(!request.url().startsWith('file:'))report.runtime.networkRequests.push(request.url());});page.on('dialog',dialog=>{report.runtime.dialogs.push(dialog.message());void dialog.dismiss();});
  await page.goto(pathToFileURL(htmlPath).href);for(let i=2;i<count;i++)await page.locator('#add-player').click();
  await page.locator('#rounds').selectOption('1');await page.locator('#seconds').selectOption('180');await page.getByRole('button',{name:'Let’s play'}).click();await page.locator('#ready').click();
  const letter=await page.locator('.letter-badge').innerText();const repeated=`${letter} private-marker`;
  await page.locator('#answer-0').fill(repeated);await page.locator('#answer-1').fill(`The ${repeated.toLowerCase()}`);await page.locator('#answer-2').fill('Z wrong-initial-marker');
  const hints=await page.locator('.draft-warning').allTextContents();const visibleWarnings=hints.filter(Boolean).length;
  assert.equal(visibleWarnings,mode==='baseline'?0:3);
  if(mode==='after'){
   assert.match(hints[0],/Also used in category 2/);assert.match(hints[1],/Also used in category 1/);assert.match(hints[2],new RegExp(`Start with ${letter}`));
   assert.equal(await page.locator('#answer-0').getAttribute('aria-describedby'),'hint-0 draft-warning-0');
   await page.locator('#answer-1').fill(`${letter} different-example`);assert.equal(await page.locator('#draft-warning-0').innerText(),'');assert.equal(await page.locator('#draft-warning-1').innerText(),'');
   await page.locator('#answer-2').fill('');assert.equal(await page.locator('#draft-warning-2').innerText(),'');
   await page.locator('#answer-1').fill(`The ${repeated.toLowerCase()}`);await page.locator('#answer-2').fill('Z wrong-initial-marker');
  }
  assert.equal(await page.getByRole('button',{name:'Lock my answers'}).isEnabled(),true,'warnings never veto a human answer');
  await page.screenshot({path:resolve(output,`private-draft-${count}.png`),fullPage:true});await page.getByRole('button',{name:'Lock my answers'}).click();
  assert.equal(await page.locator('.draft-warning').count(),0,'private warnings disappear at handover');assert(!(await page.locator('#main').innerText()).includes('private-marker'));
  await page.locator('#ready').click();assert.equal((await page.locator('.draft-warning').allTextContents()).filter(Boolean).length,0,'previous player’s repeated sheet does not warn the next player');
  await page.locator('#answer-0').fill(repeated);assert.equal((await page.locator('.draft-warning').allTextContents()).filter(Boolean).length,0,'another player’s locked answer does not affect private hints');
  for(let seat=1;seat<count;seat++){if(seat>1)await page.locator('#ready').click();await page.getByRole('button',{name:'Lock my answers'}).click();}
  let ballots=0;while(await page.locator('.score-row').count()===0){assert(++ballots<=count*12);await page.locator('#ready').click();assert.equal(await page.locator('.draft-warning').count(),0,'private draft hints never appear in anonymous review');await page.getByRole('button',{name:'Lock my ballot'}).click();}
  assert.deepEqual(await page.locator('.score-row .points').allTextContents(),Array(count).fill('0'),'nonblocking original answers retain the same zero-point result');
  report.rosters.push({count,letter,mechanicallyIneligibleOwnRows:3,privateWarningRows:visibleWarnings,originalBadSubmissionAccepted:true,previousSheetDidNotAffectHints:true,finalScores:Array(count).fill(0),privateBallots:ballots});
 });
 await check('actual offline file, errors and source identity',async()=>{assert.equal(hash(await readFile(htmlPath)),report.sourceSha256);assert.deepEqual(report.runtime,{errors:[],dialogs:[],networkRequests:[]});});report.passed=true;
}catch(error){report.failure=String(error);process.exitCode=1;console.error(error);}
finally{if(context)await context.close();await browser.close();report.finishedAt=new Date().toISOString();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,sourceSha256:report.sourceSha256,closedAt:report.finishedAt,failure:report.failure}));}
