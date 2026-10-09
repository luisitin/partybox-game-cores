// Functional capture only. No RAF performance sample or current-acceptance marker is written.
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {sourceHashes} from './check-visual.mjs';
import { createServer } from 'node:http';

const output = process.argv.includes('--record') ? 'media' : '.tmp/visual';
const milestoneIndex = process.argv.indexOf('--milestone');
assert.ok(milestoneIndex >= 0 && process.argv[milestoneIndex + 1], 'Choose an explicit unused two-digit --milestone');
const milestone = process.argv[milestoneIndex + 1];
assert.match(milestone, /^\d{2}$/);
const videoFile = `milestone-${milestone}.webm`;
assert.ok(!existsSync(`${output}/${videoFile}`), 'Choose an unused milestone; preserve existing captures');
mkdirSync('.tmp', { recursive: true }); mkdirSync(output, { recursive: true });
const captureGuards=()=>({...sourceHashes(),'scripts/capture.mjs':createHash('sha256').update(readFileSync(import.meta.filename)).digest('hex')});const sourceStart=captureGuards();const runId=new Date().toISOString().replace(/[:.]/g,'-');
const attempt=resolve('.tmp/visual/runs',sourceStart['play.html'],runId);mkdirSync(attempt,{recursive:true});
copyFileSync(import.meta.filename,resolve(attempt,'visual.mjs'));
const currentRun={runId,startedAt:new Date().toISOString(),sourceStart};
let completeReport=null;let failure=null;
const userData = resolve('.tmp/chrome'); rmSync(userData, { recursive: true, force: true });
const binary = process.env.G05_CHROME ?? ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].find(existsSync);
if (!binary) throw new Error('Chrome/Chromium executable unavailable');
const browser = spawn(binary, ['--headless=new', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-dev-shm-usage', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${userData}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = ''; browser.stderr.on('data', chunk => { stderr += chunk; });
const delay = ms => new Promise(r => setTimeout(r, ms));
class Cdp {
  next = 1; pending = new Map(); listeners = new Map();
  constructor(socket) { this.socket = socket; socket.addEventListener('message', e => { const data = JSON.parse(e.data); if (data.id) { const p = this.pending.get(data.id); this.pending.delete(data.id); data.error ? p?.reject(Error(JSON.stringify(data.error))) : p?.resolve(data.result); } else for (const f of this.listeners.get(data.method) ?? []) f(data.params, data.sessionId); }); }
  send(method, params = {}, sessionId) { const id = this.next++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); }); }
  on(method, callback) { const a = this.listeners.get(method) ?? []; a.push(callback); this.listeners.set(method, a); }
}
let socket;
let localServer;
try {
  for (let n = 0; n < 450 && !existsSync(`${userData}/DevToolsActivePort`); n++) { if (browser.exitCode !== null) throw Error(`Chrome exited ${browser.exitCode}: ${stderr.slice(0, 1500)}`); await delay(100); }
  if (!existsSync(`${userData}/DevToolsActivePort`)) throw Error(`Chrome did not expose DevTools: ${stderr.slice(0, 1500)}`);
  const [port, path] = readFileSync(`${userData}/DevToolsActivePort`, 'utf8').split('\n');
  socket = new WebSocket(`ws://127.0.0.1:${port}${path}`); await new Promise((res, rej) => { socket.addEventListener('open', res, { once: true }); socket.addEventListener('error', rej, { once: true }); });
  const cdp = new Cdp(socket); const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params = {}) => cdp.send(method, params, sessionId);
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const requests = []; const errors = [];
  cdp.on('Network.requestWillBeSent', p => requests.push(p.request.url));
  cdp.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text));
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  const httpMode = process.argv.includes('--http') || process.env.G05_VISUAL_MODE === 'http';
  assert.ok(!process.env.CI || !httpMode, 'CI must run the real disk-open check');
  if (httpMode) {
    localServer = createServer((request, response) => {
      if (request.url !== '/play.html') { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(readFileSync('play.html'));
    });
    await new Promise(resolve => localServer.listen(0, '127.0.0.1', resolve));
  }
  const documentUrl = httpMode ? `http://127.0.0.1:${localServer.address().port}/play.html` : pathToFileURL(resolve('play.html')).href;
  const nav=await send('Page.navigate',{url:documentUrl});if(nav.errorText)throw Error(`Disk navigation failed: ${nav.errorText}`);
  for(let i=0;i<100&&!(await evaluate('!!window.__hearts'));i++)await delay(50);
  assert.ok(await evaluate('!!window.__hearts'),'standalone page did not initialize: '+JSON.stringify(errors));
  async function chooseTable(count,mode='human',long=false,target=25,fresh=false,clock=0){
    await evaluate(`(()=>{if(window.__hearts.snapshot()){(document.getElementById('new-table')??document.getElementById('reset')).click()}const count=document.getElementById('seat-count');count.value='${count}';count.dispatchEvent(new Event('change'));document.getElementById('target').value='${target}';document.getElementById('clock-setting').value='${clock}';document.getElementById('seed').value=${fresh?'""':'"103"'};for(let i=0;i<${count};i++){const mode=document.getElementById('mode-'+i);mode.value='${mode}';mode.dispatchEvent(new Event('change',{bubbles:true}));if(${long}){const name=document.getElementById('name-'+i);name.value=String(i+1)+'W'.repeat(23);name.dispatchEvent(new Event('input',{bubbles:true}));}}document.getElementById('start-table').click();})()`);
  }
  const privateHand=()=>evaluate("[...document.querySelectorAll('.hand-card')].map(b=>Number(b.dataset.card))");
  const luminance=rgb=>rgb.match(/\d+/g).slice(0,3).map(v=>Number(v)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>x-y);return(values[1]+.05)/(values[0]+.05);};
  const tapHeights=[];
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('document.querySelector(".settings").open=true');await delay(50);
  const initialControls=await evaluate('(()=>{const input=getComputedStyle(document.getElementById("name-0"));return{border:input.borderColor,background:input.backgroundColor,targets:[...document.querySelectorAll(".check,.settings summary")].map(e=>e.getBoundingClientRect().height)}})()');
  tapHeights.push(...initialControls.targets);assert.ok(initialControls.targets.every(h=>h>=44),'house-rule labels must be at least44px high');
  const inputContrast=contrast(initialControls.border,initialControls.background);assert.ok(inputContrast>=3,'inputs need distinguishable boundaries');
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  for(let k=0;k<2;k++){
    const point=await evaluate('(()=>{const e=document.getElementById("jack").closest("label");e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return{x:r.right-8,y:r.bottom-8}})()');
    await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(await evaluate('document.getElementById("jack").checked'),k===0,'the whole enlarged label is a native touch target');
  }
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});await evaluate('document.querySelector(".settings").open=false;window.scrollTo(0,0)');
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});

  await chooseTable(3,'human',false,25,true);await evaluate('document.getElementById("start-turn").click()');const fresh1=await privateHand();
  await chooseTable(3,'human',false,25,true);await evaluate('document.getElementById("start-turn").click()');const fresh2=await privateHand();assert.notDeepEqual(fresh1,fresh2,'default tables must deal fresh hands');
  await chooseTable(3,'human',false,100);
  const beforeReload=await evaluate(`(()=>{for(let k=0;k<6000;k++){const snap=window.__hearts.snapshot();if(snap.view.handNumber>=2)return snap.view;const reveal=document.getElementById('start-turn');if(reveal)reveal.click();const next=document.getElementById('continue');if(next){next.click();continue;}if(snap.view.phaseId==='pass'){while(window.__hearts.snapshot().selected.length<3)document.querySelector('.hand-card:not([disabled])[aria-pressed=false]').click();document.getElementById('pass-confirm').click();}else document.querySelector('.hand-card:not([disabled])').click();}throw new Error('cannot reach scored next hand')})()`);
  assert.ok(Object.values(beforeReload.scores).some(v=>v!==0),'reload test must preserve an actually scored hand');
  await send('Page.reload');for(let k=0;k<100&&!(await evaluate('!!window.__hearts'));k++)await delay(50);
  assert.ok(await evaluate('!document.getElementById("resume-box").hidden&&!document.getElementById("resume-saved").disabled'));
  await evaluate('document.getElementById("resume-saved").click()');assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'reload never reveals a private hand');
  const restored=await evaluate('window.__hearts.snapshot().view');assert.deepEqual(restored,beforeReload,'scored hand/actor/cards/counts/clock survive reload');
  await evaluate('document.getElementById("reset").click();localStorage.setItem("partybox-hearts-save-v1","{broken")');await send('Page.reload');for(let k=0;k<100&&!(await evaluate('!!window.__hearts'));k++)await delay(50);
  assert.ok(await evaluate('document.getElementById("resume-saved").disabled'));await evaluate('document.getElementById("discard-saved").click()');
  await chooseTable(3,'human',false,25,false,10);
  const activeControls=await evaluate('(()=>{const button=getComputedStyle(document.getElementById("pause"));return{border:button.borderColor,background:button.backgroundColor,footer:getComputedStyle(document.querySelector(".felt-bottom")).color}})()');
  const controlBoundaryContrast=Math.min(inputContrast,contrast(activeControls.border,activeControls.background));
  const footerContrast=contrast(activeControls.footer,'rgb(35,79,83)');
  assert.ok(controlBoundaryContrast>=3);assert.ok(footerContrast>=4.5,'footer text must contrast against the brightest felt color');
  const recipient=await evaluate('window.__hearts.snapshot().view.players.find(p=>p.id===window.__hearts.snapshot().view.actor).name');
  assert.equal(await evaluate('document.getElementById("start-turn").getAttribute("aria-label")'),`Show hand for ${recipient}`,'handoff speaks its actual recipient');
  assert.ok((await evaluate('document.getElementById("turn-announcement").textContent')).includes(recipient));
  await evaluate('document.querySelector(".manage").open=true');await delay(50);
  await evaluate('document.getElementById("start-turn").click();document.querySelector(".hand-card").click()');
  assert.equal(await evaluate('document.querySelector(".manage").open'),false,'revealing a held handoff closes its old management menu');
  assert.equal(await evaluate('document.getElementById("turn-announcement").textContent'),'1 of 3 cards selected. Choose 2 more.');
  await evaluate('while(window.__hearts.snapshot().selected.length<3)document.querySelector(".hand-card[aria-pressed=false]:not([disabled])").click()');
  const timedBefore=await evaluate('({snap:window.__hearts.snapshot(),remaining:window.__hearts.snapshot().view.deadline-Date.now()})');
  async function manageClick(){
    const point=await evaluate('(()=>{const e=document.querySelector(".manage summary");e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
  }
  await manageClick();for(let k=0;k<40&&!(await evaluate('window.__hearts.snapshot().view.paused'));k++)await delay(25);
  assert.equal(await evaluate('window.__hearts.snapshot().view.paused'),true,'native Manage opening must hold a running clock');
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'management conceals private cards');
  assert.equal(await evaluate('document.getElementById("pause").textContent'),'Pause','temporary menu hold is distinct from explicit Pause');
  await delay(1200);assert.equal(await evaluate('window.__hearts.snapshot().view.deadline'),timedBefore.snap.view.deadline);
  assert.equal(await evaluate('window.__hearts.snapshot().view.actor'),timedBefore.snap.view.actor);
  await manageClick();for(let k=0;k<40&&(await evaluate('window.__hearts.snapshot().view.paused'));k++)await delay(25);
  const timedAfter=await evaluate('({snap:window.__hearts.snapshot(),remaining:window.__hearts.snapshot().view.deadline-Date.now()})');
  assert.equal(timedAfter.snap.view.paused,false);assert.equal(timedAfter.snap.revealed,timedBefore.snap.revealed);
  assert.deepEqual(timedAfter.snap.selected,timedBefore.snap.selected);assert.equal(timedAfter.snap.privateCards,17);
  assert.ok(Math.abs(timedAfter.remaining-timedBefore.remaining)<300,'1.2s spent in Manage must not consume turn time');
  assert.equal(await evaluate('document.getElementById("pass-confirm").disabled'),false,'selected pass remains ready after closing Manage');
  await manageClick();await delay(50);await evaluate('document.getElementById("pause").click()');
  assert.equal(await evaluate('window.__hearts.snapshot().view.paused'),true,'explicit Pause stays held after closing Manage');
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0);
  await evaluate('document.getElementById("start-turn").click()');await manageClick();await delay(50);await evaluate('document.getElementById("skip").click()');
  assert.notEqual(await evaluate('window.__hearts.snapshot().view.actor'),timedBefore.snap.view.actor,'Skip advances exactly one private pass');
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'Skip returns to a concealed handoff');
  await manageClick();await delay(50);await evaluate('document.getElementById("end").click()');
  assert.equal(await evaluate('window.__hearts.snapshot().view.phaseId'),'done','End remains available during a handoff');
  await chooseTable(3);
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'concealed hand must have no card controls in DOM');
  assert.equal(await evaluate('window.__hearts.snapshot().view.paused'),true,'handoff holds the clock');
  await evaluate('document.getElementById("start-turn").click()');
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),17);
  const desktop=null,phone=null;await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.ok(await evaluate('matchMedia("(prefers-reduced-motion:reduce)").matches'));
  const motion=await evaluate('[...document.querySelectorAll(".card-face,.private-panel")].map(e=>({animation:getComputedStyle(e).animationName,transition:getComputedStyle(e).transitionDuration}))');assert.ok(motion.every(m=>m.animation==='none'&&m.transition==='0s'));
  await send('Emulation.setCPUThrottlingRate',{rate:1});
  await evaluate('for(const button of [...document.querySelectorAll(".hand-card[aria-pressed=true]")])button.click()');
  const target=async index=>evaluate(`(()=>{const b=[...document.querySelectorAll('.hand-card:not([disabled])')].filter(b=>b.getAttribute('aria-pressed')!=='true')[${index}];b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,card:Number(b.dataset.card)}})()`);
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});const touch=await target(0);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok(await evaluate(`window.__hearts.snapshot().selected.includes(${touch.card})`),'real phone touch must choose card');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});const mouse=await target(0);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:mouse.x,y:mouse.y});await send('Input.dispatchMouseEvent',{type:'mousePressed',x:mouse.x,y:mouse.y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:mouse.x,y:mouse.y,button:'left',clickCount:1});
  assert.ok(await evaluate(`window.__hearts.snapshot().selected.includes(${mouse.card})`),'real mouse must choose card');
  const keyCard=await evaluate("(()=>{const b=[...document.querySelectorAll('.hand-card:not([disabled])')].find(b=>b.getAttribute('aria-pressed')!=='true');b.focus();return Number(b.dataset.card)})()");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
  assert.ok(await evaluate(`window.__hearts.snapshot().selected.includes(${keyCard})`),'native keyboard Space must choose card');assert.equal(await evaluate('Number(document.activeElement.dataset.card)'),keyCard,'selection preserves keyboard focus');
  assert.equal(await evaluate('window.__hearts.snapshot().selected.length'),3);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate('document.activeElement.id'),'pass-confirm','native Tab must reach ready Pass after the third chosen card');

  const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${output}/hearts-desktop-${milestone}.png`,Buffer.from(shot.data,'base64'));
  const frames=resolve('.tmp/capture');mkdirSync(frames,{recursive:true});
  for(let frame=0;frame<36;frame++){
    if(frame===10)await evaluate('document.getElementById("pass-confirm").click()');
    if(frame===20)await evaluate('document.getElementById("start-turn").click()');
    if(frame===27)await evaluate('document.querySelector(".hand-card").click()');
    const s=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${frames}/${String(frame).padStart(3,'0')}.png`,Buffer.from(s.data,'base64'));await delay(60);
  }
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','10','-i',`${frames}/%03d.png`,'-c:v','libvpx-vp9','-crf','38','-b:v','0','-an',`${output}/${videoFile}`]);assert.ok(readFileSync(`${output}/${videoFile}`).length<10_000_000);
  async function playHuman(){
    const result=await evaluate(`(()=>{for(let k=0;k<6000;k++){const snap=window.__hearts.snapshot();if(snap.view.phaseId==='done')return snap.result;const reveal=document.getElementById('start-turn');if(reveal)reveal.click();const next=document.getElementById('continue');if(next){if(snap.view.phaseId==='hand'&&document.activeElement!==next)throw new Error('scored hand lost Continue focus');next.click();continue;}if(snap.view.phaseId==='pass'){while(window.__hearts.snapshot().selected.length<3){const b=document.querySelector('.hand-card:not([disabled])[aria-pressed=false]');if(!b)throw new Error('no pass target');b.click();}document.getElementById('pass-confirm').click();}else{const card=document.querySelector('.hand-card:not([disabled])');if(!card)throw new Error('no legal human card');card.click();}}throw new Error('human UI stalled')})()`);
    assert.ok(result&&Object.values(result.scores).every(Number.isFinite));return result;
  }
  await evaluate(`(()=>{for(let k=0;window.__hearts.snapshot().view.phaseId==='pass'&&k<6;k++){document.getElementById('start-turn')?.click();while(window.__hearts.snapshot().selected.length<3)document.querySelector('.hand-card:not([disabled])[aria-pressed=false]').click();document.getElementById('pass-confirm').click();}document.getElementById('start-turn')?.click()})()`);
  const memoryHeight=await evaluate('document.querySelector(".pass-memory summary").getBoundingClientRect().height');tapHeights.push(memoryHeight);assert.ok(memoryHeight>=44);
  assert.equal(await evaluate('document.querySelectorAll(".hand-card .new-card").length'),3,'all three received cards must be marked privately');
  assert.equal(await evaluate('[...document.querySelectorAll(".hand-card")].filter(b=>b.getAttribute("aria-label").includes("received this hand")).length'),3,'received markers must be spoken');
  await playHuman();assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'results contain no private controls');
  const completedPlayerCounts=[];
  for(const count of [3,4,5,6]){
    await chooseTable(count,'normal');const fastHeight=await evaluate('document.querySelector(".fast-option").getBoundingClientRect().height');tapHeights.push(fastHeight);assert.ok(fastHeight>=44);await evaluate('document.getElementById("fast-bots").click()');
    for(let k=0;k<600&&!(await evaluate('window.__hearts.snapshot().view.phaseId==="done"'));k++)await delay(30);
    assert.equal(await evaluate('window.__hearts.snapshot().view.phaseId'),'done',`${count}-seat UI bot match stalled`);assert.equal(await evaluate('Object.keys(window.__hearts.snapshot().result.scores).length'),count);completedPlayerCounts.push(count);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await chooseTable(6,'human',true);
  async function assertFit(phase){const sizes=await evaluate('({innerWidth,scrollWidth:document.documentElement.scrollWidth,names:[...document.querySelectorAll(".score-name")].map(e=>({right:e.getBoundingClientRect().right,width:e.scrollWidth,client:e.clientWidth}))})');assert.equal(sizes.innerWidth,390,`${phase}: no viewport expansion`);assert.ok(sizes.scrollWidth<=390,`${phase}: no horizontal scroll`);assert.ok(sizes.names.every(n=>n.right<=391&&n.width<=n.client+1),`${phase}: every full name fits`);}
  await assertFit('handoff');
  const manageHeight=await evaluate('document.querySelector(".manage summary").getBoundingClientRect().height');tapHeights.push(manageHeight);assert.ok(manageHeight>=44,'mobile Manage needs a44px target');
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const mobileManage=await evaluate('(()=>{const e=document.querySelector(".manage summary");e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...mobileManage,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(await evaluate('document.querySelector(".manage").open'),'native mobile touch opens Manage');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});await evaluate('document.querySelector(".manage").open=false');await delay(50);
  await evaluate('document.getElementById("start-turn").click()');await assertFit('private hand');await evaluate('document.querySelector(".private-panel").scrollIntoView({block:"start"})');await playHuman();await assertFit('full results');
  const winnerViewport=await evaluate('(()=>{const r=document.querySelector(".summary-panel h2").getBoundingClientRect();return{top:r.top,bottom:r.bottom,viewport:innerHeight,scrollY}})()');console.log(JSON.stringify({winnerViewport}));
  assert.ok(winnerViewport.top>=0&&winnerViewport.bottom<=winnerViewport.viewport,'a mobile player finishing from the scrolled hand must see the winner');
  assert.equal(await evaluate('document.activeElement.id'),'new-table','final results must retain a ready keyboard target');
  assert.ok(await evaluate('window.__hearts.snapshot().result.winnerIds.every(id=>document.getElementById("turn-announcement").textContent.includes(window.__hearts.snapshot().view.players.find(p=>p.id===id).name))'),'the live outcome must name every tied winner');
  const resultOrder=await evaluate('({result:document.querySelector(".private-panel").getBoundingClientRect().top,table:document.querySelector(".felt").getBoundingClientRect().top})');assert.ok(resultOrder.result<resultOrder.table,'mobile ranked results must precede the last-trick table');
  await evaluate('window.scrollTo(0,0)');const mobileShot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${output}/hearts-phone-${milestone}.png`,Buffer.from(mobileShot.data,'base64'));
  assert.equal(requests.filter(url=>/^https?:/.test(url)&&url!==documentUrl).length,0,'zero network requests after document load');assert.deepEqual(errors,[]);
  const report={kind:'functional',purpose:'capture and existing functional checks only; no FPS acceptance',passed:true,runId,startedAt:currentRun.startedAt,completedAt:new Date().toISOString(),sourceStart,sourceEnd:captureGuards(),videoPath:`${output}/${videoFile}`,videoSha256:createHash('sha256').update(readFileSync(`${output}/${videoFile}`)).digest('hex'),outcomeFocus:true,winnerAnnounced:true,mobileWinnerVisible:true,accessibleControls:true,minimumTapHeight:Math.min(...tapHeights),controlBoundaryContrast,footerContrast,manageClock:true,selectionAnnouncements:true,handoffAnnouncements:true,receivedMarked:true,mobileResultPriority:true,freshDeals:true,resumedSavedGame:true,corruptSaveRejected:true,schemaVersion:1,chrome:(await cdp.send('Browser.getVersion')).product,fileOpened:!httpMode,serving:httpMode?'localhost HTTP; managed file:// remains blocked':'disk',desktop,phone,reducedMotion:true,externalRequests:0,runtimeExceptions:0,completedPlayerCounts,privateHandoff:true,passing:true,mouseCard:true,touchCard:true,keyboardCard:true,keyboardFocus:true,longNamesFit:true,videoBytes:readFileSync(`${output}/${videoFile}`).length};
  assert.deepEqual(report.sourceEnd,report.sourceStart);completeReport=report;writeFileSync('.tmp/visual/capture-only-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,desktop:{...desktop,rawIntervals:undefined},phone:{...phone,rawIntervals:undefined}}));
}catch(error){failure=String(error?.stack??error);throw error;}finally{
 socket?.close();browser.kill('SIGTERM');localServer?.close();const sourceEnd=captureGuards();
 writeFileSync(resolve(attempt,'attempt.json'),JSON.stringify({...currentRun,sourceEnd,passed:completeReport!==null,failure},null,2)+'\n');
 if(completeReport){writeFileSync(resolve(attempt,'report.json'),JSON.stringify(completeReport,null,2)+'\n');copyFileSync(completeReport.videoPath,resolve(attempt,'capture.webm'));}
 else{const sample=label=>{const file=resolve(attempt,`${label}-frames.json`);if(!existsSync(file))return null;const {runId:ignoredRun,sourceStart:ignoredSources,...row}=JSON.parse(readFileSync(file,'utf8'));return row;};const failed={kind:'failed',schemaVersion:1,...currentRun,completedAt:new Date().toISOString(),sourceEnd,failure:failure??'Incomplete run',desktop:sample('desktop'),phone:sample('phone')};writeFileSync(resolve(attempt,'failure-report.json'),JSON.stringify(failed,null,2)+'\n');if(process.argv.includes('--record'))writeFileSync(`media/visual-measurements-${milestone}-failed-${runId}.json`,JSON.stringify(failed,null,2)+'\n');}
}
