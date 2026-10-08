import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceSha256=digest(await readFile(resolve(root,'play.html')));
// This reference calls the actual pure core, independently of the browser clock adapter.
const bundle=await build({entryPoints:[resolve(root,'src/index.ts')],bundle:true,write:false,platform:'node',format:'esm',target:'es2022'});
const {game}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
let reference=game.init({players:['p1','p2'].map((id,i)=>({id,name:['Alex','Sam'][i],avatarId:'default',connected:true})),settings:{rounds:1,roundSeconds:60},seed:42,now:0});
const answers=Array.from({length:12},(_,i)=>`${reference.letter} clock-${i}`);
for(const playerId of ['p1','p2'])reference=game.reduce(reference,{type:'input',playerId,now:0,input:{type:'submit',answers:playerId==='p1'?answers:Array(12).fill('')}});
const reviewStartedAt=reference.phase.startedAt;
const firstBudget=reference.phase.deadline-reviewStartedAt;
for(const playerId of ['p1','p2'])reference=game.reduce(reference,{type:'input',playerId,now:reviewStartedAt+8000,input:{type:'vote',votes:[null]}});
assert.equal(reference.phase.startedAt,reviewStartedAt,'a review beat keeps the same phase instance');
assert.equal(reference.reviewIndex,1);
const expectedNextBudget=reference.phase.deadline-(reviewStartedAt+8000);
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const report={sourceSha256,seed:42,browser:browser.version(),elapsedOnFirstBeatMs:8000,firstBudgetMs:firstBudget,expectedNextBudgetMs:expectedNextBudget,passed:false};
console.log(JSON.stringify({pid:process.pid,sourceSha256,action:'isolated review-beat clock check'}));
try {
  const context=await browser.newContext({viewport:{width:1920,height:1080},offline:true});
  const page=await context.newPage();
  await page.clock.install();
  await page.goto(pathToFileURL(resolve(root,'play.html')).href);
  await page.locator('#rounds').selectOption('1');
  await page.locator('#seconds').selectOption('60');
  await page.getByRole('button',{name:'Let’s play'}).click();
  for(let i=0;i<2;i++){await page.locator('#ready').click();if(i===0)for(let category=0;category<12;category++)await page.locator(`#answer-${category}`).fill(answers[category]);await page.getByRole('button',{name:'Lock my answers'}).click();}
  await page.locator('#ready').click();
  const displayedMs=async()=>{const [minutes,seconds]=(await page.locator('#timer').innerText()).split(':').map(Number);return (minutes*60+seconds)*1000;};
  report.firstDisplayedMs=await displayedMs();
  assert(Math.abs(report.firstDisplayedMs-firstBudget)<=1500,'first displayed beat budget matches real core deadline');
  await page.clock.fastForward(8000);
  await page.getByRole('button',{name:'Lock my ballot'}).click();
  await page.locator('#ready').click();
  await page.getByRole('button',{name:'Lock my ballot'}).click();
  await page.locator('#ready').click();
  assert.match(await page.locator('.session-top .eyebrow').innerText(),/category 2 of 12/i);
  report.nextDisplayedMs=await displayedMs();
  assert(Math.abs(report.nextDisplayedMs-expectedNextBudget)<=1500,'next beat resets its displayed budget; prior elapsed time is not added');
  assert.equal(digest(await readFile(resolve(root,'play.html'))),sourceSha256);
  report.passed=true;
  await context.close();
} catch(error){report.failure=String(error);process.exitCode=1;}
finally{await browser.close();await writeFile(resolve(root,'evidence/browser/review-clock-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
