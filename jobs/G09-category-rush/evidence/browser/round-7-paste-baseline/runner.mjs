import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),mode=process.argv[2]??'baseline';
assert(['baseline','after'].includes(mode));
const output=resolve(root,`evidence/browser/round-7-paste-${mode}`);await mkdir(output,{recursive:true});
const html=resolve(root,'play.html'),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const pack=JSON.parse(await readFile(resolve(root,'content/categories.json'),'utf8'));
const report={mode,sourceSha256:hash(await readFile(html)),runnerSha256:hash(await readFile(new URL(import.meta.url))),startedAt:new Date().toISOString(),cases:[],runtime:{errors:[],networkRequests:[]},passed:false};
await copyFile(html,resolve(output,'play.html'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let context;
try{
 for(const count of [2,8])for(const kind of ['normal','article-space','tab','newline','crlf','vertical-tab','del']){
  if(context)await context.close();context=await browser.newContext({offline:true,permissions:['clipboard-read','clipboard-write'],viewport:{width:count===8?390:1920,height:count===8?844:1080}});
  const page=await context.newPage();await page.clock.install({time:new Date('2026-10-08T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-08T00:00:01Z'));
  page.on('pageerror',error=>report.runtime.errors.push(String(error)));page.on('request',request=>{if(!request.url().startsWith('file:'))report.runtime.networkRequests.push(request.url());});
  await page.goto(pathToFileURL(html).href);for(let seat=2;seat<count;seat++)await page.locator('#add-player').click();
  await page.locator('#rounds').selectOption('1');await page.getByRole('button',{name:'Let’s play'}).click();await page.locator('#ready').click();
  const letter=await page.locator('.letter-badge').innerText(),prompt=await page.locator('label[for="answer-0"]').innerText();
  const category=pack.categories.find(item=>item.prompt===prompt);assert(category&&category.answers[letter]?.length);
  const noun=category.answers[letter][0],separator={normal:'', 'article-space':' ',tab:'\t',newline:'\n',crlf:'\r\n','vertical-tab':'\v',del:'\x7f'}[kind];
  const pasted=kind==='normal'?noun:`The${separator}${noun}`;
  await page.evaluate(text=>navigator.clipboard.writeText(text),pasted);await page.locator('#answer-0').focus();await page.keyboard.press('Control+V');
  const input=await page.locator('#answer-0').inputValue(),warning=await page.locator('#draft-warning-0').innerText();
  assert.equal(await page.getByRole('button',{name:'Lock my answers'}).isEnabled(),true);
  await page.getByRole('button',{name:'Lock my answers'}).click();assert(!(await page.locator('#main').innerText()).includes(noun),'private handover hides answer');
  for(let seat=1;seat<count;seat++){await page.locator('#ready').click();assert.equal((await page.locator('.draft-warning').allTextContents()).filter(Boolean).length,0,'another locked answer never affects own warnings');await page.getByRole('button',{name:'Lock my answers'}).click();}
  await page.locator('#ready').click();const reviewed=await page.locator('.answer-text').innerText(),eligibility=await page.locator('.answer-meta').innerText();
  for(let seat=0;seat<count;seat++){if(seat>0)await page.locator('#ready').click();await page.getByRole('button',{name:'Lock my ballot'}).click();}
  const scores=await page.locator('.score-row .points').allTextContents(),verdict=await page.locator('.receipt-answer .verdict').innerText();
  if(kind==='normal'||kind==='article-space')assert.deepEqual(scores,['1',...Array(count-1).fill('0')]);
  const item={count,kind,letter,categoryId:category.id,prompt,authoredNoun:noun,pasted,input,warning,reviewed,eligibility,scores,verdict,privateHandover:true,anotherSheetDidNotAffectAdvice:true};report.cases.push(item);console.log(JSON.stringify(item));
 }
 assert.equal(hash(await readFile(html)),report.sourceSha256);assert.deepEqual(report.runtime,{errors:[],networkRequests:[]});report.passed=true;
}catch(error){report.failure=String(error);process.exitCode=1;console.error(error);}
finally{if(context)await context.close();await browser.close();report.finishedAt=new Date().toISOString();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');await copyFile(new URL(import.meta.url),resolve(output,'runner.mjs'));console.log(JSON.stringify({passed:report.passed,cases:report.cases.length,closedAt:report.finishedAt,failure:report.failure}));}
