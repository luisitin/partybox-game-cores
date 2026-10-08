import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mode=process.argv[2]??'after';
assert(['baseline','after'].includes(mode));
const output=resolve(root,`evidence/browser/round-1-${mode}`);
await mkdir(output,{recursive:true});
const htmlPath=resolve(root,'play.html');
const sha=data=>createHash('sha256').update(data).digest('hex');
const sourceSha256=sha(await readFile(htmlPath));
const report={mode,sourceSha256,startedAt:new Date().toISOString(),checks:[],blankProfiles:[],runtime:{pageErrors:[],networkRequests:[],dialogs:[]},passed:false};
console.log(JSON.stringify({pid:process.pid,mode,sourceSha256,action:'actual offline empty-review baseline/regression'}));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
report.browser=browser.version();
let context,page;
async function check(name,fn){const row={name,passed:false};report.checks.push(row);try{await fn();row.passed=true;console.log(JSON.stringify(row));}catch(error){row.error=String(error);throw error;}}
async function fresh(clock=false){if(context)await context.close();context=await browser.newContext({viewport:{width:1920,height:1080},offline:true});page=await context.newPage();page.on('pageerror',error=>report.runtime.pageErrors.push(String(error)));page.on('request',request=>{if(!request.url().startsWith('file:'))report.runtime.networkRequests.push(request.url());});page.on('dialog',dialog=>{report.runtime.dialogs.push(dialog.message());void dialog.dismiss();});if(clock)await page.clock.install();await page.goto(pathToFileURL(htmlPath).href);}
async function begin(count=2,rounds=1){await page.locator('#rounds').selectOption(String(rounds));await page.locator('#seconds').selectOption('60');for(let i=2;i<count;i++)await page.locator('#add-player').click();await page.getByRole('button',{name:'Let’s play'}).click();}
async function ready(){await page.locator('#ready').click();}
async function lock(){await page.getByRole('button',{name:'Lock my',exact:false}).click();}
async function submitBlankSheets(count){for(let i=0;i<count;i++){await ready();assert.equal(await page.locator('.answer-input').count(),12);await lock();}}
async function assertScores(count,points){assert.equal(await page.locator('.score-row').count(),count);assert.deepEqual(await page.locator('.score-row .points').allTextContents(),points);}
try {
  for(const count of [2,8]){
    await fresh();await begin(count);
    await check(`${count} humans all blank: measured compulsory review actions`,async()=>{
      await submitBlankSheets(count);
      const started=performance.now();let readyClicks=0,ballotLocks=0;const categories=[];
      if(mode==='baseline'){
        while(await page.locator('.score-row').count()===0){
          assert(ballotLocks<12*count+1,'review action loop bounded');
          await ready();readyClicks++;
          assert.equal(await page.locator('.vote-card').count(),0);
          assert.match(await page.locator('.session-top .eyebrow').innerText(),/review category/i);
          categories.push(await page.locator('.session-top .eyebrow').innerText());
          if(ballotLocks===0)await page.screenshot({path:resolve(output,`blank-${count}-review.png`),fullPage:true});
          await lock();ballotLocks++;
        }
        assert.equal(ballotLocks,12*count);assert.equal(readyClicks,12*count);
      }else{assert.equal(await page.locator('#ready').count(),0);assert.equal(await page.locator('#vote-form').count(),0);}
      await assertScores(count,Array(count).fill('0'));
      const result={humans:count,readyClicks,ballotLocks,reviewActionCount:readyClicks+ballotLocks,reviewElapsedMs:performance.now()-started,categories};
      report.blankProfiles.push(result);console.log(JSON.stringify(result));
      assert.equal(await page.locator('.receipt-category').count(),12);
      assert.equal(await page.locator('.receipt-answer').count(),0);
      await page.screenshot({path:resolve(output,`blank-${count}-scores.png`),fullPage:true});
    });
  }
  if(mode==='after'){
    await fresh(true);await begin();
    await check('mixed empty, accepted, wrong-initial and duplicate categories retain every nonempty private ballot',async()=>{
      await ready();const letter=(await page.locator('.letter-badge').innerText()).trim();
      const wrong=(letter==='A'?'B':'A')+' wrong-initial';
      for(const [i,value] of [[1,`${letter} unique-two`],[3,wrong],[7,`${letter} duplicate-eight`],[9,`${letter} unique-ten`]])await page.locator(`#answer-${i}`).fill(value);
      await lock();assert.equal(await page.locator('.answer-input').count(),0);
      assert(!await page.locator('#main').innerText().then(text=>text.includes('unique-two')));
      await ready();await page.locator('#answer-7').fill(`${letter} duplicate-eight`);await lock();
      let ballotLocks=0;
      for(const category of [2,4,8,10])for(let voter=0;voter<2;voter++){
        await ready();assert.match(await page.locator('.session-top .eyebrow').innerText(),new RegExp(`category ${category} of 12`,'i'));
        const cards=await page.locator('.vote-card').innerText();assert(!cards.includes('Alex'));assert(!cards.includes('Sam'));
        if(category===2&&voter===0){const timer=await page.locator('#timer').innerText();await page.locator('#vip-button').click();await page.clock.fastForward(90000);assert.equal(await page.locator('#timer').innerText(),timer);assert.match(await page.locator('.session-top .eyebrow').innerText(),/category 2 of 12/i);await page.keyboard.press('Escape');assert.equal(await page.locator('#vote-form').count(),1);}
        if(category===4){assert.match(cards,/Wrong initial/);assert.equal(await page.locator('.vote-button:not(:disabled)').count(),0);}
        if(category===8)assert.match(cards,/Shared answer \(2\)/);
        await lock();ballotLocks++;
      }
      assert.equal(ballotLocks,8);await assertScores(2,['2','0']);
      assert.equal(await page.locator('.receipt-category').count(),12);assert.equal(await page.locator('.receipt-answer').count(),4);
      await page.locator('.receipt-category').nth(3).locator('summary').click();await page.locator('.receipt-category').nth(7).locator('summary').click();
      assert.match(await page.locator('.receipt-category').nth(3).innerText(),/Invalid · 0/);assert.match(await page.locator('.receipt-category').nth(7).innerText(),/Duplicate · 0/);
      report.mixed={nonemptyCategories:[2,4,8,10],emptyCategoriesSkipped:8,ballotLocks};
    });
    await fresh(true);await begin();
    await check('host skip crosses an empty block and preserves the next nonempty private ballot',async()=>{
      await ready();const letter=(await page.locator('.letter-badge').innerText()).trim();await page.locator('#answer-0').fill(`${letter} first-category`);await page.locator('#answer-11').fill(`${letter} last-category`);await lock();await ready();await lock();
      await ready();assert.match(await page.locator('.session-top .eyebrow').innerText(),/category 1 of 12/i);await page.locator('#vip-button').click();await page.locator('#host-skip').click();
      assert.equal(await page.locator('.handover').count(),1);assert(!await page.locator('#main').innerText().then(text=>text.includes('last-category')));
      for(let voter=0;voter<2;voter++){await ready();assert.match(await page.locator('.session-top .eyebrow').innerText(),/category 12 of 12/i);assert.equal(await page.locator('.vote-card').count(),1);await lock();}
      await assertScores(2,['2','0']);assert.equal(await page.locator('.receipt-category').count(),12);
    });
    await fresh(true);await begin();
    await check('paused blank handover stays paused; explicit host skip settles the blank round',async()=>{
      await ready();await lock();await page.locator('#vip-button').click();await page.clock.fastForward(120000);
      assert.equal(await page.locator('.modal').count(),1);assert.equal(await page.locator('.score-row').count(),0);assert.match(await page.locator('.handover h2').innerText(),/Sam/);
      await page.locator('#host-skip').click();await assertScores(2,['0','0']);assert.equal(await page.locator('#vote-form').count(),0);
    });
    await fresh(true);await begin(8);
    await check('ending paused blank writing preserves completed-round scores',async()=>{
      await ready();await page.locator('#vip-button').click();await page.clock.fastForward(120000);await page.locator('#host-end').click();await page.locator('#confirm-end').click();
      await assertScores(8,Array(8).fill('0'));assert.match(await page.locator('.session-top .eyebrow').innerText(),/final results/i);assert.equal(await page.locator('#vote-form').count(),0);
    });
    await fresh();await begin(2,2);
    await check('two blank rounds settle independently and continue through the real next-round input',async()=>{
      await submitBlankSheets(2);await assertScores(2,['0','0']);await page.locator('#next-round').click();assert.match(await page.locator('.handover .eyebrow').innerText(),/round 2/i);
      await submitBlankSheets(2);await assertScores(2,['0','0']);await page.locator('#next-round').click();assert.match(await page.locator('.session-top .eyebrow').innerText(),/final results/i);assert.match(await page.locator('.session-top h2').innerText(),/tie!/);
    });
  }
  await check('offline runtime and exact tested HTML remain clean',async()=>{assert.deepEqual(report.runtime,{pageErrors:[],networkRequests:[],dialogs:[]});assert.equal(sha(await readFile(htmlPath)),sourceSha256);});
  report.passed=report.checks.every(row=>row.passed);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();if(context)await context.close();await browser.close();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({mode,sourceSha256,passed:report.passed,checks:report.checks.length,failure:report.failure}));}
