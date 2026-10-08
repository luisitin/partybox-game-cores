import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

const output = process.argv.includes('--record') ? 'media' : '.tmp/visual';
const milestoneIndex = process.argv.indexOf('--milestone');
const milestone = milestoneIndex >= 0 ? process.argv[milestoneIndex + 1] : '01';
assert.match(milestone, /^\d{2}$/);
const videoFile = `milestone-${milestone}.webm`;
mkdirSync('.tmp', { recursive: true }); mkdirSync(output, { recursive: true });
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
  async function chooseTable(count,mode='human',long=false,target=25,fresh=false){
    await evaluate(`(()=>{if(window.__hearts.snapshot()){(document.getElementById('new-table')??document.getElementById('reset')).click()}const count=document.getElementById('seat-count');count.value='${count}';count.dispatchEvent(new Event('change'));document.getElementById('target').value='${target}';document.getElementById('seed').value=${fresh?'""':'"103"'};for(let i=0;i<${count};i++){const mode=document.getElementById('mode-'+i);mode.value='${mode}';mode.dispatchEvent(new Event('change',{bubbles:true}));if(${long}){const name=document.getElementById('name-'+i);name.value=String(i+1)+'W'.repeat(23);name.dispatchEvent(new Event('input',{bubbles:true}));}}document.getElementById('start-table').click();})()`);
  }
  const privateHand=()=>evaluate("[...document.querySelectorAll('.hand-card')].map(b=>Number(b.dataset.card))");
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
  await chooseTable(3);
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'concealed hand must have no card controls in DOM');
  assert.equal(await evaluate('window.__hearts.snapshot().view.paused'),true,'handoff holds the clock');
  await evaluate('document.getElementById("start-turn").click()');
  assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),17);
  async function measure(width,height,cpu){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await send('Emulation.setCPUThrottlingRate',{rate:cpu});
    await evaluate('new Promise(resolve=>{let n=0;function warm(){if(++n<60)requestAnimationFrame(warm);else resolve()}requestAnimationFrame(warm)})');
    return evaluate(`new Promise(resolve=>{let previous=0,n=0;const dt=[];function frame(t){if(previous)dt.push(t-previous);previous=t;n++;if(n%6===0)document.querySelector('.hand-card:not([disabled])').click();if(n<182)requestAnimationFrame(frame);else{dt.shift();const sorted=[...dt].sort((a,b)=>a-b);const mean=dt.reduce((a,b)=>a+b)/dt.length;resolve({width:${width},height:${height},cpu:${cpu},warmupFrames:60,interaction:'17-card private pass selection at10Hz; retained card controls',frames:dt.length,meanMs:mean,p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:Math.max(...dt),fps:1000/mean,overflow:document.documentElement.scrollWidth>${width}})}}requestAnimationFrame(frame)})`);
  }
  const desktop=await measure(1920,1080,1),phone=await measure(390,844,4);console.log(JSON.stringify({desktop,phone}));
  assert.equal(desktop.overflow,false);assert.equal(phone.overflow,false);assert.ok(desktop.meanMs<=17.5&&phone.meanMs<=17.5,'60fps cadence tolerance');assert.ok(desktop.p95Ms<=20&&phone.p95Ms<=20,'interactive frame p95 exceeds20ms');
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
    const result=await evaluate(`(()=>{for(let k=0;k<6000;k++){const snap=window.__hearts.snapshot();if(snap.view.phaseId==='done')return snap.result;const reveal=document.getElementById('start-turn');if(reveal)reveal.click();const next=document.getElementById('continue');if(next){next.click();continue;}if(snap.view.phaseId==='pass'){while(window.__hearts.snapshot().selected.length<3){const b=document.querySelector('.hand-card:not([disabled])[aria-pressed=false]');if(!b)throw new Error('no pass target');b.click();}document.getElementById('pass-confirm').click();}else{const card=document.querySelector('.hand-card:not([disabled])');if(!card)throw new Error('no legal human card');card.click();}}throw new Error('human UI stalled')})()`);
    assert.ok(result&&Object.values(result.scores).every(Number.isFinite));return result;
  }
  await evaluate(`(()=>{for(let k=0;window.__hearts.snapshot().view.phaseId==='pass'&&k<6;k++){document.getElementById('start-turn')?.click();while(window.__hearts.snapshot().selected.length<3)document.querySelector('.hand-card:not([disabled])[aria-pressed=false]').click();document.getElementById('pass-confirm').click();}document.getElementById('start-turn')?.click()})()`);
  assert.equal(await evaluate('document.querySelectorAll(".hand-card .new-card").length'),3,'all three received cards must be marked privately');
  assert.equal(await evaluate('[...document.querySelectorAll(".hand-card")].filter(b=>b.getAttribute("aria-label").includes("received this hand")).length'),3,'received markers must be spoken');
  await playHuman();assert.equal(await evaluate('window.__hearts.snapshot().privateCards'),0,'results contain no private controls');
  const completedPlayerCounts=[];
  for(const count of [3,4,5,6]){
    await chooseTable(count,'normal');await evaluate('document.getElementById("fast-bots").click()');
    for(let k=0;k<600&&!(await evaluate('window.__hearts.snapshot().view.phaseId==="done"'));k++)await delay(30);
    assert.equal(await evaluate('window.__hearts.snapshot().view.phaseId'),'done',`${count}-seat UI bot match stalled`);assert.equal(await evaluate('Object.keys(window.__hearts.snapshot().result.scores).length'),count);completedPlayerCounts.push(count);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await chooseTable(6,'human',true);
  async function assertFit(phase){const sizes=await evaluate('({innerWidth,scrollWidth:document.documentElement.scrollWidth,names:[...document.querySelectorAll(".score-name")].map(e=>({right:e.getBoundingClientRect().right,width:e.scrollWidth,client:e.clientWidth}))})');assert.equal(sizes.innerWidth,390,`${phase}: no viewport expansion`);assert.ok(sizes.scrollWidth<=390,`${phase}: no horizontal scroll`);assert.ok(sizes.names.every(n=>n.right<=391&&n.width<=n.client+1),`${phase}: every full name fits`);}
  await assertFit('handoff');await evaluate('document.getElementById("start-turn").click()');await assertFit('private hand');await playHuman();await assertFit('full results');
  const resultOrder=await evaluate('({result:document.querySelector(".private-panel").getBoundingClientRect().top,table:document.querySelector(".felt").getBoundingClientRect().top})');assert.ok(resultOrder.result<resultOrder.table,'mobile ranked results must precede the last-trick table');
  await evaluate('window.scrollTo(0,0)');const mobileShot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${output}/hearts-phone-${milestone}.png`,Buffer.from(mobileShot.data,'base64'));
  assert.equal(requests.filter(url=>/^https?:/.test(url)&&url!==documentUrl).length,0,'zero network requests after document load');assert.deepEqual(errors,[]);
  const report={receivedMarked:true,mobileResultPriority:true,freshDeals:true,resumedSavedGame:true,corruptSaveRejected:true,schemaVersion:1,chrome:(await cdp.send('Browser.getVersion')).product,fileOpened:!httpMode,serving:httpMode?'localhost HTTP; managed file:// remains blocked':'disk',desktop,phone,reducedMotion:true,externalRequests:0,runtimeExceptions:0,completedPlayerCounts,privateHandoff:true,passing:true,mouseCard:true,touchCard:true,keyboardCard:true,keyboardFocus:true,longNamesFit:true,videoBytes:readFileSync(`${output}/${videoFile}`).length};
  writeFileSync(`${output}/visual-measurements-${milestone}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{socket?.close();browser.kill('SIGTERM');localServer?.close();}
