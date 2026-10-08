import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),mode=process.argv[2]??'after';assert(['baseline','after'].includes(mode));
const htmlPath=resolve(root,mode==='baseline'?'evidence/browser/round-3-accepted/play.html':'play.html');
const output=resolve(root,`evidence/browser/round-4-plurals-${mode}`);await mkdir(output,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const fixture={seed:159,letter:'M',categoryIndex:9,categoryId:'wildlife-01',prompt:'An animal that makes a home underground',singular:'mouse',plural:'mice'};
const report={mode,sourceSha256:hash(await readFile(htmlPath)),runnerSha256:hash(await readFile(new URL(import.meta.url))),fixture,startedAt:new Date().toISOString(),checks:[],rosters:[],runtime:{errors:[],dialogs:[],networkRequests:[]},passed:false};
console.log(JSON.stringify({pid:process.pid,mode,sourceSha256:report.sourceSha256}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});report.browser=browser.version();let context;
async function check(name,fn){const item={name,passed:false};report.checks.push(item);try{await fn();item.passed=true;console.log(JSON.stringify(item));}catch(error){item.error=String(error);throw error;}}
try{
 for(const count of [2,8])await check(`${count} people review and score a real mouse/mice duplicate`,async()=>{
  if(context)await context.close();context=await browser.newContext({offline:true,viewport:{width:count===8?390:1920,height:count===8?844:1080}});const page=await context.newPage();
  page.on('pageerror',error=>report.runtime.errors.push(String(error)));page.on('request',request=>{if(!request.url().startsWith('file:'))report.runtime.networkRequests.push(request.url());});page.on('dialog',dialog=>{report.runtime.dialogs.push(dialog.message());void dialog.dismiss();});
  await page.goto(pathToFileURL(htmlPath).href);for(let i=2;i<count;i++)await page.locator('#add-player').click();
  await page.getByLabel('Player 1 name',{exact:true}).fill('Case Alpha');await page.getByLabel('Player 2 name',{exact:true}).fill('Case Beta');await page.locator('#rounds').selectOption('1');await page.locator('#seconds').selectOption('180');await page.locator('#seed').fill(String(fixture.seed));await page.getByRole('button',{name:'Let’s play'}).click();
  for(let seat=0;seat<count;seat++){
   await page.locator('#ready').click();assert.equal(await page.locator('.letter-badge').innerText(),fixture.letter);assert.equal(await page.locator(`label[for=answer-${fixture.categoryIndex}]`).innerText(),fixture.prompt);
   if(seat<2)await page.locator(`#answer-${fixture.categoryIndex}`).fill(seat===0?fixture.singular:fixture.plural);await page.getByRole('button',{name:'Lock my answers'}).click();
   assert.equal(await page.locator('.answer-input').count(),0,'the submitted sheet disappears at private handover');
  }
  const reviews=[];for(let voter=0;voter<count;voter++){
   await page.locator('#ready').click();assert.equal(await page.locator('#phase-heading').innerText(),fixture.prompt);const cards=await page.locator('.vote-card').allInnerTexts();
   assert(cards.every(text=>!text.includes('Case Alpha')&&!text.includes('Case Beta')),'authors remain absent from anonymous review cards');assert.equal(cards.length,mode==='baseline'?2:1);
   if(mode==='after')assert(cards[0].includes('Shared answer (2) · scores zero'));else assert(cards.every(text=>text.includes('Unique answer')));
   assert.equal(await page.locator('.vote-button[data-value=true]:enabled').count(),cards.length);for(const keep of await page.locator('.vote-button[data-value=true]').all())await keep.click();
   reviews.push({voter:voter+1,groups:cards.length,text:cards,authorsHidden:true});await page.getByRole('button',{name:'Lock my ballot'}).click();
  }
  assert.equal(await page.locator('.score-row').count(),count);const scores=await page.locator('.points').allTextContents();assert.deepEqual(scores,mode==='baseline'?['1','1',...Array(count-2).fill('0')]:Array(count).fill('0'));
  const category=page.locator('.receipt-category').nth(fixture.categoryIndex);await category.locator('summary').click();const receipt=await category.innerText();assert(receipt.includes('Case Alpha')&&receipt.includes('Case Beta'),'both authors are revealed only in scored receipt');
  const verdicts=await category.locator('.verdict').allTextContents();assert.deepEqual(verdicts,mode==='baseline'?['+1 point','+1 point']:['Duplicate · 0']);
  report.rosters.push({count,letter:fixture.letter,categoryIndex:fixture.categoryIndex,categoryPrompt:fixture.prompt,answers:[fixture.singular,fixture.plural],reviews,reviewGroupCount:reviews[0].groups,scoreTotals:scores.map(Number),awardedPoints:scores.map(Number).reduce((a,b)=>a+b,0),receiptText:receipt,verdicts});
  await page.screenshot({path:resolve(output,`plural-receipt-${count}.png`),fullPage:true});
 });
 await check('the actual file stayed byte-identical, offline and error-free',async()=>{assert.equal(hash(await readFile(htmlPath)),report.sourceSha256);assert.deepEqual(report.runtime,{errors:[],dialogs:[],networkRequests:[]});});report.passed=report.checks.every(item=>item.passed);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{if(context)await context.close();await browser.close();report.finishedAt=new Date().toISOString();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,sourceSha256:report.sourceSha256,closedAt:report.finishedAt,failure:report.failure}));}
