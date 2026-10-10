import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mode=process.argv[2]??'after';
assert(['baseline','after'].includes(mode));
const output=resolve(root,`evidence/browser/round-2-receipts-${mode}`);
await mkdir(output,{recursive:true});
const html=await readFile(resolve(root,'play.html'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const pack=JSON.parse(await readFile(resolve(root,mode==='baseline'?'evidence/browser/round-1-accepted/categories.json':'content/categories.json'),'utf8'));
const report={sourceSha256:hash(html),runnerSha256:hash(await readFile(fileURLToPath(import.meta.url))),mode,checks:[],rosters:[],passed:false};
const errors=[],requests=[],dialogs=[];
console.log(JSON.stringify({pid:process.pid,mode,sourceSha256:report.sourceSha256}));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
let context,page;
async function fresh(count,rounds=5,width=1920,height=1080){
  if(context)await context.close();
  context=await browser.newContext({viewport:{width,height},offline:true});page=await context.newPage();
  page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>requests.push(request.url()));
  page.on('dialog',dialog=>{dialogs.push(dialog.message());void dialog.dismiss();});
  await page.goto(pathToFileURL(resolve(root,'play.html')).href);
  for(let n=2;n<count;n++)await page.locator('#add-player').click();
  await page.locator('#rounds').selectOption(String(rounds));await page.locator('#seconds').selectOption('180');
  await page.getByRole('button',{name:'Let’s play'}).click();
}
async function check(name,fn){const row={name,passed:false};report.checks.push(row);await fn();row.passed=true;console.log(JSON.stringify(row));}
async function lock(){await page.getByRole('button',{name:'Lock my',exact:false}).click();}
async function votes(count){let turns=0;while(await page.locator('.score-row').count()===0){assert(++turns<=count*12);await page.locator('#ready').click();await lock();}}
try{
  for(const count of [2,8])await check(`${count} humans score five real rounds and measure completed-receipt access`,async()=>{
    await fresh(count,5,count===8?390:1920,count===8?844:1080);const receipts=[];
    for(let round=1;round<=5;round++){
      let letter,answer,prompt;
      for(let seat=0;seat<count;seat++){
        await page.locator('#ready').click();
        if(seat===0){
          letter=(await page.locator('.letter-badge').innerText()).trim();prompt=await page.locator('label[for="answer-0"]').innerText();
          answer=pack.categories.find(category=>category.prompt===prompt)?.answers[letter]?.[0];assert(answer,'authored real example for current prompt');
          await page.locator('#answer-0').fill(answer);
          assert.equal(await page.locator('#history-round').count(),0,'completed receipts are absent during private writing');
        }
        await lock();
      }
      await votes(count);
      assert.equal(await page.locator('.score-row').first().locator('.points').innerText(),String(round));
      assert.match(await page.locator('.receipt').innerText(),new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
      if(mode==='after')assert.equal(await page.evaluate(()=>document.activeElement?.id),'phase-heading','score transition has a deliberate keyboard focus');
      receipts.push({round,letter,answer,prompt});
      if(round<5)await page.locator('#next-round').click();
    }
    await page.locator('#next-round').click();
    const options=await page.locator('#history-round option').count();
    if(mode==='baseline'){assert.equal(options,0);report.rosters.push({count,scoredRounds:5,accessibleRoundReceipts:1,historySelectorOptions:0,finalScore:5});}
    else{
      assert.equal(options,5);
      for(const receipt of receipts){
        await page.locator('#history-round').selectOption(String(receipt.round));
        const text=await page.locator('#receipt-panel').innerText();
        assert(text.includes(`Round ${receipt.round}`));assert(text.includes(`letter ${receipt.letter}`));assert(text.toLowerCase().includes(receipt.answer));
        assert(text.includes('Alex'));assert.equal(await page.locator('.score-row').first().locator('.points').innerText(),'5','reading history never changes final scores');
      }
      await page.locator('#history-round').focus();await page.keyboard.press('Home');
      assert.equal(await page.locator('#history-round').inputValue(),'1');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'history-round','selector focus remains after rendering');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      report.rosters.push({count,scoredRounds:5,accessibleRoundReceipts:5,historySelectorOptions:5,finalScore:5});
    }
    await page.screenshot({path:resolve(output,`history-${count}.png`),fullPage:true});
  });
  if(mode==='after')await check('scored explanations distinguish wrong initial, own repeats and duplicates without future-row leakage',async()=>{
    await fresh(2,1);let letter;
    for(let seat=0;seat<2;seat++){
      await page.locator('#ready').click();letter=(await page.locator('.letter-badge').innerText()).trim();
      if(seat===0){await page.locator('#answer-0').fill(`${letter} repeated-probe`);await page.locator('#answer-1').fill(`${letter} repeated-probe`);await page.locator('#answer-2').fill('Z wrong-initial-probe');}
      await page.locator('#answer-3').fill(`${letter} shared-probe`);await lock();
    }
    await page.locator('#ready').click();assert(!await page.locator('.vote-card').innerText().then(text=>/Used twice|Repeated/.test(text)),'future-own-repeat verdict stays secret during review');await lock();
    await votes(2);
    for(const index of [1,2,3])await page.locator('.receipt-category').nth(index).locator('summary').click();
    assert.match(await page.locator('.receipt-category').nth(0).innerText(),/Used twice · 0/);
    assert.match(await page.locator('.receipt-category').nth(1).innerText(),/Used twice · 0/);
    assert.match(await page.locator('.receipt-category').nth(2).innerText(),/Wrong initial · 0/);
    assert.match(await page.locator('.receipt-category').nth(3).innerText(),/Duplicate · 0/);
    assert.deepEqual(await page.locator('.score-row .points').allTextContents(),['0','0']);
    await page.screenshot({path:resolve(output,'score-reasons.png'),fullPage:true});
  });
  await check('current HTML remains frozen and actual file runtime is offline and error-free',async()=>{
    assert.equal(hash(await readFile(resolve(root,'play.html'))),report.sourceSha256);assert.equal(errors.length,0,JSON.stringify(errors));
    assert.equal(dialogs.length,0);assert(requests.length>0);assert(requests.every(request=>request.startsWith('file:')));
  });report.passed=true;
}catch(error){report.failure=String(error);process.exitCode=1;console.error(error);}
finally{if(context)await context.close();await browser.close();report.runtime={errors,dialogs,networkRequests:requests.filter(request=>!request.startsWith('file:'))};await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length}));}
