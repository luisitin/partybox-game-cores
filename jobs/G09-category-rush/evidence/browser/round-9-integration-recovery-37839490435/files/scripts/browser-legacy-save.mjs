import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..');
const output=resolve(root,process.env.G09_LEGACY_OUTPUT??'evidence/browser/round-9-legacy-save');
await mkdir(output,{recursive:true});
const oldHtml=resolve(root,'evidence/browser/round-7-paste-baseline/play.html');
const currentHtml=resolve(root,'play.html');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const key='category-rush.saved-game.v1',epoch=Date.UTC(2026,9,8);
const pack=JSON.parse(await readFile(resolve(root,'content/categories.json'),'utf8'));
const report={startedAt:new Date().toISOString(),scope:'Authentic old-page native clipboard and autosave, unchanged payload resumed in current page; paused functional clocks, never FPS proof',oldSourceSha256:digest(await readFile(oldHtml)),sourceSha256:digest(await readFile(currentHtml)),runnerSha256:digest(await readFile(new URL(import.meta.url))),clock:{mode:'paused-manual-advances',oldEpoch:epoch,currentEpoch:epoch+86400000,notPerformanceEvidence:true},cases:[],runtime:{errors:[],requests:[],dialogs:[]},passed:false};
assert.equal(report.oldSourceSha256,'68f43a976c73b98b0b3a55d56cb39a17cf7bfcaf6476e96540f77b9e1de6b91c');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});report.browser=browser.version();
let context,page;
async function fresh(html,count,raw){
 if(context)await context.close();
 context=await browser.newContext({offline:true,permissions:['clipboard-read','clipboard-write'],viewport:count===8?{width:390,height:844}:{width:1920,height:1080}});
 if(raw!==undefined)await context.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key,raw});
 page=await context.newPage();
 page.on('pageerror',e=>report.runtime.errors.push(String(e)));
 page.on('request',r=>{if(!r.url().startsWith('file:'))report.runtime.requests.push(r.url());});
 page.on('dialog',d=>{report.runtime.dialogs.push(d.message());void d.dismiss();});
 const clockEpoch=raw===undefined?epoch:epoch+86400000;
 await page.clock.install({time:clockEpoch});await page.clock.pauseAt(clockEpoch+1000);
 await page.goto(pathToFileURL(html).href);
}
async function stored(){return page.evaluate(key=>localStorage.getItem(key),key);}
try{
 for(const count of [2,8])for(const kind of ['normal','tab','vertical-tab','del','repeat','wrong-initial']){
  const item={count,kind,passed:false};report.cases.push(item);
  await fresh(oldHtml,count);
  for(let seat=2;seat<count;seat++)await page.locator('#add-player').click();
  await page.locator('#rounds').selectOption('1');await page.locator('#seconds').selectOption('60');
  await page.getByRole('button',{name:'Let’s play'}).click();await page.locator('#ready').click();
  item.letter=await page.locator('.letter-badge').innerText();
  item.prompt=await page.locator('label[for="answer-0"]').innerText();
  const category=pack.categories.find(c=>c.prompt===item.prompt);assert(category);
  item.categoryId=category.id;item.authoredNoun=category.answers[item.letter][0];
  assert.equal(item.letter,'S');assert.equal(item.categoryId,'school-08');assert.equal(item.authoredNoun,'stapler');
  const separator={normal:' ',tab:'\t','vertical-tab':'\v',del:'\x7f',repeat:'\t','wrong-initial':'\t'}[kind];
  item.pasted=`The${separator}${kind==='wrong-initial'?'zebra':item.authoredNoun}`;
  await page.evaluate(text=>navigator.clipboard.writeText(text),item.pasted);await page.locator('#answer-0').focus();await page.keyboard.press('Control+V');
  if(kind==='repeat')await page.locator('#answer-1').fill(item.authoredNoun);
  item.oldInput=await page.locator('#answer-0').inputValue();assert.equal(item.oldInput,item.pasted);
  await page.clock.fastForward(7300);
  const raw=await stored();assert(raw);const old=JSON.parse(raw);
  item.originalSnapshotSha256=digest(raw);item.originalSnapshotBytes=Buffer.byteLength(raw);
  item.compat=old.compat;item.savedElapsedMs=old.seatElapsed;item.oldTimer=await page.locator('#timer').innerText();
  assert.equal(old.draft[0],item.pasted);assert(old.seatElapsed>=5000&&old.seatElapsed<8000);
  await writeFile(resolve(output,`${count}-${kind}-original-save.json`),raw);
  await fresh(currentHtml,count,raw);
  assert.equal(await stored(),raw,'transfer preserves the authentic snapshot byte-for-byte');
  assert.equal(await page.locator('#resume-game').count(),1,'save compatibility permits actual resume');
  assert.equal(await page.locator('#answer-form').count(),0);
  await page.locator('#resume-game').click();
  assert.equal(await page.locator('#answer-form').count(),0,'private handover hides the old draft');
  assert(!(await page.locator('#main').innerText()).includes(item.authoredNoun));
  const handoverBefore=JSON.parse(await stored());
  await page.clock.fastForward(120000);
  const handoverAfter=JSON.parse(await stored());
  assert.equal(handoverAfter.seatElapsed,handoverBefore.seatElapsed,'handover does not consume remaining time');
  assert.equal(handoverAfter.draft[0],item.pasted,'raw draft stays private until the actual Ready action');
  await page.locator('#ready').click();
  item.restoredInput=await page.locator('#answer-0').inputValue();
  const normalized=item.pasted.replace(/[\u0000-\u001f\u007f]/g,' ');
  assert.equal(item.restoredInput,normalized);
  item.warning=await page.locator('#draft-warning-0').innerText();
  if(kind==='repeat')assert.match(item.warning,/category 2;/);
  else if(kind==='wrong-initial')assert.match(item.warning,/Start with S/);
  else assert.equal(item.warning,'');
  item.restoredTimer=await page.locator('#timer').innerText();
  const seconds=text=>Number(text.split(':')[0])*60+Number(text.split(':')[1]);
  assert.equal(seconds(item.restoredTimer),Math.ceil((60000-old.seatElapsed)/1000));
  await page.clock.fastForward(5000);
  item.advancedTimer=await page.locator('#timer').innerText();assert.equal(seconds(item.restoredTimer)-seconds(item.advancedTimer),5);
  const restoredRaw=await stored();const restored=JSON.parse(restoredRaw);
  assert.equal(restored.compat,old.compat);assert.equal(restored.draft[0],normalized);
  assert.deepEqual(restored.botRngs,old.botRngs);assert.deepEqual(restored.state.rng,old.state.rng);
  await writeFile(resolve(output,`${count}-${kind}-restored-save.json`),restoredRaw);
  item.restoredSnapshotSha256=digest(restoredRaw);
  await page.getByRole('button',{name:'Lock my answers'}).click();
  assert(!(await page.locator('#main').innerText()).includes(item.authoredNoun));
  for(let seat=1;seat<count;seat++){
   await page.locator('#ready').click();
   assert.equal(await page.locator('.answer-input').first().inputValue(),'');
   assert.equal((await page.locator('.draft-warning').allTextContents()).filter(Boolean).length,0);
   await page.getByRole('button',{name:'Lock my answers'}).click();
  }
  let ballots=0;
  while(!(await page.locator('.score-row').count())){
   assert(ballots<count*12,'review must finish within the actual category/player bound');
   if(await page.locator('#ready').count())await page.locator('#ready').click();
   if(ballots===0){item.reviewed=await page.locator('.answer-text').first().innerText();item.eligibility=await page.locator('.answer-meta').first().innerText();assert.equal(item.reviewed,normalized);}
   await page.getByRole('button',{name:'Lock my ballot'}).click();ballots++;
  }
  item.scores=await page.locator('.score-row .points').allTextContents();
  assert.deepEqual(item.scores,[kind==='repeat'||kind==='wrong-initial'?'0':'1',...Array(count-1).fill('0')]);
  item.ballots=ballots;item.privateHandover=true;item.otherSheetAdviceUnchanged=true;item.timerPreserved=true;item.passed=true;
  console.log(JSON.stringify(item));
 }
 assert.equal(digest(await readFile(oldHtml)),report.oldSourceSha256);assert.equal(digest(await readFile(currentHtml)),report.sourceSha256);
 assert.deepEqual(report.runtime,{errors:[],requests:[],dialogs:[]});report.passed=true;
}catch(error){report.failure=String(error);process.exitCode=1;console.error(error);}
finally{
 if(context)await context.close();await browser.close();report.finishedAt=new Date().toISOString();
 await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');await copyFile(new URL(import.meta.url),resolve(output,'runner.mjs'));
 console.log(JSON.stringify({passed:report.passed,cases:report.cases.length,closedAt:report.finishedAt,failure:report.failure}));
}
