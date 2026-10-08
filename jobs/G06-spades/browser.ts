import {chromium,type Page} from 'playwright';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {game} from './core.ts';
import {context} from './runner.ts';
import {winningPlay} from './cards.ts';
const html=readFileSync('play.html','utf8'),errors:string[]=[],requests:string[]=[],functional:string[]=[];
const executablePath=process.env.CHROMIUM_PATH??(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
const capture=process.argv.includes('--capture'),write=process.argv.includes('--write'),repeat=Number(process.argv.find(v=>v.startsWith('--repeat='))?.slice(9)??1);
const capturePath=`media/milestone-${repeat}-offline.webm`,reportPath=repeat===1?'browser-report.json':`browser-repeat-${repeat}.json`;
const temp=mkdtempSync(join(tmpdir(),'g06-browser-'));
async function pageFor(viewport={width:390,height:844},record=false,virtual=true){
 const ctx=await browser.newContext({viewport,...record&&capture?{recordVideo:{dir:temp,size:{width:960,height:540}}}:{}}),page=await ctx.newPage();
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
 await page.route('**/*',route=>route.abort());if(virtual){await page.clock.install({time:100000});await page.clock.pauseAt(101000);}await page.setContent(html);return {ctx,page};
}
async function freeze(p:Page){assert.equal(await p.evaluate(()=>Date.now()),101000,'test clock must be installed before the application creates timers');}
const phase=(p:Page)=>p.locator('#public').getAttribute('data-phase');
async function start(p:Page,mode='partnership',seed=17,bots=false){
 await p.selectOption('#mode',mode);await p.fill('#seed',String(seed));const n=mode==='cutthroat'?3:4;
 if(bots)for(let i=0;i<n;i++)await p.selectOption(`#seat-${i}`,(['sharp','normal','easy'] as const)[i%3]!);
 await p.click('#start');
}
async function house(p:Page){await p.locator('#setup summary').click();}
let fileOpen='passed';let video:string|undefined;
try{
 const direct=await browser.newPage();try{await direct.goto(new URL('play.html',import.meta.url).href);assert(await direct.locator('#start').isVisible());}catch(error){assert(String(error).includes('ERR_BLOCKED_BY_ADMINISTRATOR'),String(error));fileOpen='managed file navigation blocked; exact bytes exercised using setContent';}finally{await direct.close();}
 for(const mode of ['partnership','cutthroat']){
  const long=await pageFor();await long.page.selectOption('#mode',mode);for(let i=0;i<(mode==='cutthroat'?3:4);i++)await long.page.fill(`#name-${i}`,'X'.repeat(40));await start(long.page,mode);
  assert(await long.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long names must wrap at handover');await long.page.click('#show-hand');assert(await long.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long names must wrap with an open private hand');await long.ctx.close();functional.push(`${mode} valid40-character names fit390px, concealed and open`);
 }
 const standard=await pageFor();await freeze(standard.page);await standard.page.fill('#name-0','<img onerror=alert(1)>');await start(standard.page);
 assert.equal(await phase(standard.page),'bid');assert.equal(await standard.page.locator('#private [data-card]').count(),0);assert.equal(await standard.page.locator('#public img').count(),0);
 await standard.page.click('#show-hand');assert.equal(await standard.page.locator('#private [data-card]').count(),13);await standard.page.selectOption('#bid-value','5');
 await standard.page.click('#hide-hand');assert.equal(await standard.page.locator('#private [data-card]').count(),0);await standard.page.click('#show-hand');assert.equal(await standard.page.inputValue('#bid-value'),'5');
 await standard.page.click('#pause');await standard.page.clock.runFor(60000);assert.equal(await phase(standard.page),'bid');assert.equal(await standard.page.locator('#private [data-card]').count(),0);await standard.page.click('#pause');await standard.page.click('#show-hand');assert.equal(await standard.page.inputValue('#bid-value'),'5');await standard.page.click('#bid');
 for(let i=0;i<3;i++){await standard.page.click('#show-hand');await standard.page.click('#bid');}
 assert.equal(await phase(standard.page),'play');const initial=game.init(context(4,17)),leader=(initial.dealer+1)%4,played:{playerId:string;card:number}[]=[];
 for(let i=0;i<4;i++){await standard.page.click('#show-hand');const button=standard.page.locator('#private [data-card]:not(:disabled)').first();played.push({playerId:`p${(leader+i)%4}`,card:Number(await button.getAttribute('data-card'))});await button.click();assert.equal(await standard.page.locator('#private [data-card]').count(),0);}
 assert.equal(await phase(standard.page),'trick');const winner=winningPlay(played)!.playerId;await standard.page.clock.runFor(2400);assert.equal(await phase(standard.page),'play');
 const expectedName=winner==='p0'?'<img onerror=alert(1)>':`Player ${Number(winner.slice(1))+1}`;assert((await standard.page.locator('#public h2').innerText()).startsWith(expectedName));
 await standard.page.click('#show-hand');await standard.page.locator('#private [data-card]:not(:disabled)').first().press('Enter');await standard.page.click('#end');assert.equal(await phase(standard.page),'done');assert.deepEqual(await standard.page.locator('.score strong').allTextContents(),['0','0']);assert.equal(await standard.page.locator('#private [data-card]').count(),0);
 await standard.page.click('#restart');assert(await standard.page.locator('#setup').isVisible());assert.equal(await standard.page.locator('#private [data-card]').count(),0);await standard.ctx.close();functional.push('four humans / concealed handover / escaped names / bid draft hide-pause-resume / legal keyboard play / trick timer and winner lead / partial end / restart');
 const blind=await pageFor();await freeze(blind.page);await house(blind.page);await blind.page.selectOption('#setting-blindGap','0');await start(blind.page);
 assert.equal(await phase(blind.page),'blind');await blind.page.click('#show-hand');assert.equal(await blind.page.locator('#private [data-card]').count(),0);await blind.page.click('#blind');
 for(let i=0;i<3;i++){await blind.page.click('#show-hand');await blind.page.click('#look');assert.equal(await phase(blind.page),'bid');assert.equal(await blind.page.locator('#blind').count(),0);await blind.page.click('#bid');}
 assert.equal(await phase(blind.page),'exchange');await blind.page.click('#show-hand');const sent:number[]=[];
 for(const button of await blind.page.locator('#private [data-card]').all().then(a=>a.slice(0,2))){sent.push(Number(await button.getAttribute('data-card')));await button.click();}
 assert.equal(await blind.page.locator('[aria-pressed=true]').count(),2);await blind.page.click('#hide-hand');assert.equal(await blind.page.locator('[data-card]').count(),0);await blind.page.click('#show-hand');assert.equal(await blind.page.locator('[aria-pressed=true]').count(),2);
 await blind.page.click('#pause');await blind.page.clock.runFor(1000);await blind.page.click('#pause');await blind.page.click('#show-hand');assert.equal(await blind.page.locator('[aria-pressed=true]').count(),2);await blind.page.click('#send-cards');assert.equal(await blind.page.locator('[data-card]').count(),0);
 await blind.page.click('#show-hand');assert.equal(await blind.page.locator('[data-card]').count(),15);for(const card of sent)await blind.page.click(`#card-${card}`);await blind.page.click('#send-cards');assert.equal(await phase(blind.page),'play');await blind.ctx.close();functional.push('blind cards absent / late blind unavailable / sequential exchange / two selected cards survive hide and pause / received cards returned / handover removes DOM');
 const both=await pageFor();await freeze(both.page);await house(both.page);await both.page.selectOption('#setting-blindGap','0');await start(both.page);
 for(let i=0;i<4;i++){await both.page.click('#show-hand');await both.page.click('#blind');}
 for(let i=0;i<4;i++){assert.equal(await phase(both.page),'exchange');await both.page.click('#show-hand');const cards=await both.page.locator('[data-card]').all().then(a=>a.slice(0,2));for(const card of cards)await card.click();await both.page.click('#send-cards');}
 assert.equal(await phase(both.page),'play');await both.ctx.close();functional.push('four blind bids / both pairs exchange once / all four sequential transfers complete');
 for(const mode of ['partnership','cutthroat'])for(const deck of mode==='partnership'?['low-club']:['low-club','stock']){
  const full=await pageFor();await freeze(full.page);await full.page.selectOption('#mode',mode);await house(full.page);
  if(mode==='cutthroat'){await full.page.selectOption('#setting-cutDeck',deck);await full.page.selectOption('#setting-cutLead','club');assert(await full.page.locator('#setting-exchange').isDisabled());}
  else assert(await full.page.locator('#setting-cutDeck').isDisabled());
  await full.page.selectOption('#setting-nilValue','50');await full.page.check('#setting-failedNilCounts');await full.page.uncheck('#setting-mercy');await full.page.uncheck('#setting-blind');if(mode==='partnership')await full.page.uncheck('#setting-exchange');await start(full.page,mode,44,true);
  for(let i=0;i<20&&(await phase(full.page))!=='done';i++)await full.page.clock.runFor(300000);
  assert.equal(await phase(full.page),'done');assert.equal(await full.page.locator('.score').count(),mode==='cutthroat'?3:2);assert.equal(await full.page.locator('[data-card]').count(),0);assert(!(await full.page.locator('#clock').innerText()));assert(await full.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await full.page.locator('#match summary').click();assert((await full.page.locator('#rules').innerText()).includes('±50'));await full.ctx.close();functional.push(`complete UI ${mode}/${deck} / half nil / contribution / no mercy / no blind-exchange / lowest club / no overflow / finite final sides`);
 }
 const performanceResults=[];
 for(const [label,viewport,rate] of [['TV',{width:1920,height:1080},1],['phone-4x',{width:390,height:844},4]] as const){
  const sample=await pageFor(viewport,label==='TV',false),cdp=await sample.ctx.newCDPSession(sample.page);await cdp.send('Emulation.setCPUThrottlingRate',{rate});await start(sample.page,'partnership',37,true);
  const frames=await sample.page.evaluate(async()=>{const times:number[]=[];let previous=performance.now();return await new Promise<number[]>(resolve=>{const tick=(now:number)=>{times.push(now-previous);previous=now;if(times.length>=901)resolve(times.slice(1));else requestAnimationFrame(tick);};requestAnimationFrame(tick);});});
  const sorted=[...frames].sort((a,b)=>a-b),average=frames.reduce((n,v)=>n+v,0)/frames.length,fps=1000/average,p95=sorted[Math.floor(.95*sorted.length)]!,max=sorted.at(-1)!;
  assert(fps>=55&&p95<=25,`${label}: ${fps} fps p95 ${p95}`);assert(await sample.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(write){mkdirSync('media',{recursive:true});await sample.page.screenshot({path:`media/milestone-${repeat}-${label}.png`,fullPage:true});}
  await sample.page.emulateMedia({reducedMotion:'reduce'});assert(await sample.page.evaluate(()=>Array.from(document.querySelectorAll('*')).every(e=>getComputedStyle(e).animationName==='none')));functional.push(`${label} reduced motion / no overflow`);
  if(label==='TV'&&capture){const clip=sample.page.video();await sample.ctx.close();video=await clip!.path();}else await sample.ctx.close();
  performanceResults.push({label,viewport,cpuThrottle:rate,frames:900,averageMs:average,fps,p95Ms:p95,maxMs:max});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 if(capture&&video){mkdirSync('media',{recursive:true});const encoded=spawnSync('ffmpeg',['-y','-i',video,'-t','8','-vf','scale=960:-2','-c:v','libvpx-vp9','-b:v','450k','-an',capturePath],{encoding:'utf8',timeout:120000});assert.equal(encoded.status,0,encoded.stderr);assert(statSync(capturePath).size<10*1024*1024);}
 const report={fileOpen,functional,scenarios:functional.length,errors:0,externalRequests:0,performance:performanceResults,phoneLimitation:'390x844 and four-times CPU throttle; no physical phone available',capture:video?capturePath:null};
 if(write)writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();rmSync(temp,{recursive:true,force:true});}
