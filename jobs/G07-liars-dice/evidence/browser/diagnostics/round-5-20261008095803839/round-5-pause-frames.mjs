import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const execFile = promisify(execFileCallback);
const root = '/workspace/game-cores-G07/jobs/G07-liars-dice';
const html = resolve(root,'play.html');
const htmlSha256 = createHash('sha256').update(await readFile(html)).digest('hex');
const runId = new Date().toISOString().replace(/\D/g,'');
const output = resolve(root,'.work/browser-diagnostics',`round-5-pause-${runId}`);
await mkdir(output,{recursive:true});
const report = {diagnosticOnly:true,authoritativeGate:false,htmlSha256,runId,
  measurement:'actual pause click capture/bubble snapshots, hold from accepted pause, deliberate late click, then exact600 phone workload with LongTasks and no CDP tracing/CPU profiler',
  processSamplingAddsOverhead:true,processSnapshots:[],pause:null,frameChild:null};
let sampling = false;
async function sampleProcesses(stage) {
  if (sampling) return;
  sampling = true;
  try {
    const {stdout} = await execFile('ps',['-eo','pid,ppid,pgid,stat,pcpu,cputimes,comm']);
    report.processSnapshots.push({stage,at:new Date().toISOString(),rows:stdout.split('\n').filter((row,index)=>index===0||!/^\s*\d+\s+\d+\s+\d+\s+Z/.test(row))});
  } finally { sampling=false; }
}
const interval = setInterval(()=>sampleProcesses('periodic').catch(error=>report.processSamplingError=String(error)),1000);
let browser;
try {
  await sampleProcesses('before-pause');
  browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const context = await browser.newContext({viewport:{width:390,height:844},offline:true});
  await context.addInitScript(()=>{try{sessionStorage.removeItem('partybox.g07.session.v1');}catch{}});
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.goto(pathToFileURL(html).href);
  await page.waitForFunction(()=>Boolean(window.__G07));
  report.pause = await page.evaluate(()=>{
    const h=window.__G07;
    h.init({players:2,mode:'bots',pace:'normal',seed:7199,settings:{turnSeconds:0,calzaEnabled:false}});
    const state=h.state();state.turn='p1';h.setState(state);
    window.__g07PauseClicks=[];
    const snapshot=(button,stage)=>{
      const s=h.state();
      window.__g07PauseClicks.push({button,stage,at:h.time(),stateJson:JSON.stringify(s),botRng:h.host().botRng,
        cupDice:document.querySelectorAll('#cup .die').length,
        turn:s.turn,phase:s.phase.id,paused:s.phase.paused,bid:s.bid});
    };
    for(const id of ['pause','resume']) {
      const button=document.querySelector(`#${id}`);
      button.addEventListener('click',()=>snapshot(id,'capture-before-onclick'),{capture:true});
      button.addEventListener('click',()=>snapshot(id,'bubble-after-onclick'));
    }
    return {armedAt:h.time(),armedStateJson:JSON.stringify(h.state())};
  });
  await page.locator('#show-cup').click();
  await page.waitForTimeout(800);
  await page.locator('#pause').click();
  const acceptedPause = await page.evaluate(()=>window.__g07PauseClicks.find(row=>row.button==='pause'&&row.stage==='bubble-after-onclick'));
  await page.waitForTimeout(2250);
  const afterHold = await page.evaluate(()=>({at:window.__G07.time(),stateJson:JSON.stringify(window.__G07.state()),
    botRng:window.__G07.host().botRng,cupDice:document.querySelectorAll('#cup .die').length}));
  Object.assign(report.pause,{acceptedPause,afterHold,heldFromAcceptedPauseMs:afterHold.at-acceptedPause.at,
    stateHeldFromAcceptedPause:afterHold.stateJson===acceptedPause.stateJson,
    rngHeldFromAcceptedPause:JSON.stringify(afterHold.botRng)===JSON.stringify(acceptedPause.botRng),
    stateWasAlreadyDifferentBeforePause:JSON.parse(acceptedPause.stateJson).turn!==JSON.parse(report.pause.armedStateJson).turn});
  await page.locator('#resume').click();
  await page.waitForTimeout(1800);
  report.pause.afterResume1800 = await page.evaluate(()=>({at:window.__G07.time(),stateJson:JSON.stringify(window.__G07.state())}));
  await page.waitForTimeout(600);
  report.pause.afterResume2400 = await page.evaluate(()=>({at:window.__G07.time(),stateJson:JSON.stringify(window.__G07.state())}));
  report.pause.clicks = await page.evaluate(()=>window.__g07PauseClicks);
  const resumed = report.pause.clicks.find(row=>row.button==='resume'&&row.stage==='bubble-after-onclick');
  const afterResume = JSON.parse(report.pause.afterResume2400.stateJson);
  report.pause.resumeActualActionMs = afterResume.phase.startedAt-resumed.at;
  report.pause.resumeWithinOriginalBounds = report.pause.resumeActualActionMs>=1900&&report.pause.resumeActualActionMs<=2300;
  console.log(JSON.stringify({diagnosticOnly:true,output,pauseHeld:report.pause.stateHeldFromAcceptedPause,
    alreadyMovedBeforePause:report.pause.stateWasAlreadyDifferentBeforePause,heldMs:report.pause.heldFromAcceptedPauseMs,
    clicks:report.pause.clicks.map(({stateJson,...row})=>row)}));
  report.delayedPause = await page.evaluate(()=>{
    const h=window.__G07;h.init({players:2,mode:'bots',pace:'normal',seed:7199,settings:{turnSeconds:0,calzaEnabled:false}});
    const state=h.state();state.turn='p1';h.setState(state);window.__g07PauseClicks=[];
    return {armedAt:h.time(),armedStateJson:JSON.stringify(h.state()),armedBotRng:h.host().botRng};
  });
  await page.waitForTimeout(2500);
  await page.locator('#pause').click();
  report.delayedPause.acceptedPause = await page.evaluate(()=>window.__g07PauseClicks.find(row=>row.button==='pause'&&row.stage==='bubble-after-onclick'));
  await page.waitForTimeout(2250);
  report.delayedPause.afterHold = await page.evaluate(()=>({at:window.__G07.time(),stateJson:JSON.stringify(window.__G07.state()),
    botRng:window.__G07.host().botRng,cupDice:document.querySelectorAll('#cup .die').length}));
  report.delayedPause.clicks = await page.evaluate(()=>window.__g07PauseClicks);
  report.delayedPause.stateAlreadyMovedBeforeClick = JSON.parse(report.delayedPause.armedStateJson).turn!==report.delayedPause.acceptedPause.turn;
  report.delayedPause.stateHeldFromAcceptedPause = report.delayedPause.afterHold.stateJson===report.delayedPause.acceptedPause.stateJson;
  report.delayedPause.rngHeldFromAcceptedPause = JSON.stringify(report.delayedPause.afterHold.botRng)===JSON.stringify(report.delayedPause.acceptedPause.botRng);
  console.log(JSON.stringify({diagnosticOnly:true,deliberateClickDelayMs:report.delayedPause.acceptedPause.at-report.delayedPause.armedAt,
    alreadyMovedBeforeClick:report.delayedPause.stateAlreadyMovedBeforeClick,pausedStateHeld:report.delayedPause.stateHeldFromAcceptedPause,
    pausedRngHeld:report.delayedPause.rngHeldFromAcceptedPause}));
  await context.close();await browser.close();browser=null;
  await sampleProcesses('before-exact600');
  const child = await execFile(process.execPath,[resolve(root,'.work/browser-diagnostics/frame-only.mjs'),
    '--tag','round-5-current','--profile','phone4x'],{cwd:root,maxBuffer:8*1024*1024});
  report.frameChild={stdout:child.stdout,stderr:child.stderr};
  console.log(child.stdout.trim());
  await sampleProcesses('after-exact600');
} catch(error) {
  report.error=String(error?.stack??error);process.exitCode=1;
} finally {
  clearInterval(interval);
  if(browser)await browser.close();
  report.finalHtmlSha256=createHash('sha256').update(await readFile(html)).digest('hex');
  report.sourceUnchanged=report.finalHtmlSha256===htmlSha256;
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({diagnosticOnly:true,output,sourceUnchanged:report.sourceUnchanged,error:report.error??null}));
}
