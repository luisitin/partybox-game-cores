import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'evidence/browser');
await mkdir(output,{recursive:true});
const html=await readFile(resolve(root,'play.html'));
const sha=createHash('sha256').update(html).digest('hex');
const checks=[];
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const url=pathToFileURL(resolve(root,'play.html')).href;
const report={sourceSha256:sha,browser:browser.version(),checks,passed:false};
let context,page;
const errors=[],requests=[],dialogs=[];
async function check(profile,name,fn){const row={profile,name,passed:false};checks.push(row);try{await fn();row.passed=true;}catch(error){row.error=String(error);throw error;}}
async function fresh(width=1920,height=1080){if(context)await context.close();context=await browser.newContext({viewport:{width,height},offline:true});page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));page.on('dialog',d=>{dialogs.push(d.message());void d.dismiss();});await page.goto(url);}
async function begin(count=2,bots=false){await page.locator('#rounds').selectOption('1');await page.locator('#seconds').selectOption('60');for(let n=2;n<count;n++)await page.locator('#add-player').click();if(bots)for(let n=2;n<=count;n++)await page.getByLabel(`Player ${n} type`,{exact:true}).selectOption(['easy','normal','sharp'][(n-2)%3]);await page.getByRole('button',{name:'Let’s play'}).click();}
async function ready(){await page.locator('#ready').click();}
async function lock(){await page.getByRole('button',{name:'Lock my',exact:false}).click();}
async function finishVotes(humans=2){for(let category=0;category<12;category++)for(let voter=0;voter<humans;voter++){await ready();assert.match(await page.locator('.session-top .eyebrow').innerText(),new RegExp(`category ${category+1} of 12`,'i'));await lock();}}

try {
  await check('source','HTML embeds its scripts/styles and blocks network by CSP',async()=>{const text=html.toString();assert(!/<(?:script|link)[^>]+(?:src|href)\s*=/i.test(text));assert(text.includes("connect-src 'none'"));assert(text.includes('prefers-reduced-motion:reduce'));});
  for(const [profile,width,height] of [['desktop',1920,1080],['phone',390,844]]){
    await fresh(width,height);
    await check(profile,'setup and active screen have no horizontal overflow',async()=>{assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:resolve(output,`${profile}-setup.png`),fullPage:true});});
    await check(profile,'named players are safely escaped; 12 labeled keyboard inputs',async()=>{await page.getByLabel('Player 1 name',{exact:true}).fill('<img src=x>');await begin();assert.equal(await page.locator('.handover img').count(),0);assert.match(await page.locator('.handover h2').innerText(),/<img src=x>/);await ready();assert.equal(await page.locator('.answer-input').count(),12);for(let i=0;i<12;i++){const field=page.locator(`#answer-${i}`);assert(await field.getAttribute('aria-describedby'));}assert.equal(await page.evaluate(()=>document.activeElement?.id),'answer-0');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));});
    let letter,probe;
    await check(profile,'private handover removes previous answers from the DOM',async()=>{letter=(await page.locator('.letter-badge').innerText()).trim();probe=`${letter} private-probe`;for(let i=0;i<12;i++)await page.locator(`#answer-${i}`).fill(i===0?probe:`${letter} first-${i}`);await lock();assert(!await page.locator('#main').innerText().then(t=>t.includes(probe)));assert.equal(await page.locator('.answer-input').count(),0);await ready();assert.equal(await page.locator('#answer-0').inputValue(),'');});
    await check(profile,'host pause freezes time and preserves draft; keyboard modal traps focus',async()=>{await page.locator('#answer-0').fill(probe);const timer=await page.locator('#timer').innerText();await page.locator('#vip-button').click();await page.waitForTimeout(1100);assert.equal(await page.locator('#timer').innerText(),timer);await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'host-end');await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Resume game'}).evaluate(e=>document.activeElement===e),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#answer-0').inputValue(),probe);});
    await check(profile,'author names are absent from anonymous voting cards; duplicates marked zero',async()=>{for(let i=1;i<12;i++)await page.locator(`#answer-${i}`).fill(`${letter} second-${i}`);await lock();await ready();assert.equal(await page.locator('.vote-card').count(),1);const text=await page.locator('.vote-card').innerText();assert(text.includes(probe));assert(text.includes('Shared answer (2)'));assert(!text.includes('Sam'));assert(!text.includes('<img src=x>'));await page.screenshot({path:resolve(output,`${profile}-review.png`),fullPage:true});await lock();await ready();await lock();});
    await check(profile,'all 12 review categories advance; duplicate scoring comes from actual core',async()=>{for(let category=1;category<12;category++)for(let voter=0;voter<2;voter++){await ready();assert.match(await page.locator('.session-top .eyebrow').innerText(),new RegExp(`category ${category+1} of 12`,'i'));await lock();}assert.equal(await page.locator('.score-row').count(),2);assert.deepEqual(await page.locator('.score-row .points').allTextContents(),['11','11']);assert.match(await page.locator('.receipt-category').first().innerText(),/Duplicate · 0/);assert.match(await page.locator('.receipt-category').first().innerText(),/Sam/);assert.equal(await page.locator('.receipt-category img').count(),0);await page.screenshot({path:resolve(output,`${profile}-scores.png`),fullPage:true});});
    await check(profile,'final results preserve tied winners and allow a new game',async()=>{await page.locator('#next-round').click();assert.match(await page.locator('.session-top h2').innerText(),/tie!/);assert.equal(await page.locator('#next-round').innerText().then(t=>t.startsWith('Play again')),true);await page.screenshot({path:resolve(output,`${profile}-final.png`),fullPage:true});await page.locator('#next-round').click();assert.equal(await page.locator('#setup-form').count(),1);});
    await check(profile,'reduced motion disables entrance animation',async()=>{await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.page-enter').evaluate(e=>getComputedStyle(e).animationName),'none');});
    await fresh(width,height);
    await check(profile,'timer expiry locks typed answers and waits at a private handover',async()=>{await page.clock.install();await begin();await ready();const letter=(await page.locator('.letter-badge').innerText()).trim();await page.locator('#answer-0').fill(`${letter} timeout-probe`);await page.clock.fastForward(61000);assert.equal(await page.locator('.handover').count(),1);assert.match(await page.locator('.handover h2').innerText(),/Sam/);await page.clock.fastForward(180000);assert.equal(await page.locator('.handover').count(),1);await ready();assert.equal(await page.locator('#timer').innerText(),'1:00');await page.locator('#vip-button').click();await page.locator('#host-end').click();await page.locator('#confirm-end').click();assert.match(await page.locator('.session-top .eyebrow').innerText(),/final results/i);assert.deepEqual(await page.locator('.score-row .points').allTextContents(),['0','0']);});
  }
  for(let count=2;count<=8;count++){
    await fresh();
    await check('desktop',`${count} seats with easy/medium/strong bots play a whole game`,async()=>{await begin(count,true);await ready();await lock();await finishVotes(1);assert.equal(await page.locator('.score-row').count(),count);await page.locator('#next-round').click();assert.match(await page.locator('.session-top .eyebrow').innerText(),/final results/i);assert.equal(await page.locator('.score-row').count(),count);});
  }
  await check('runtime','offline file made zero network calls and raised no errors or dialogs',async()=>{assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(dialogs.length,0);assert(requests.length>0);assert(requests.every(request=>request.startsWith('file:')));});
  await check('provenance','HTML stayed byte-identical during the whole browser suite',async()=>{assert.equal(createHash('sha256').update(await readFile(resolve(root,'play.html'))).digest('hex'),sha);});
  report.passed=checks.every(c=>c.passed);
} catch(error){report.failure=String(error);process.exitCode=1;}
finally{if(context)await context.close();await browser.close();report.runtime={errors,dialogs,networkRequests:requests.filter(request=>!request.startsWith('file:'))};await writeFile(resolve(output,'functional-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({sourceSha256:sha,passed:report.passed,checks:checks.length,failure:report.failure}));}
