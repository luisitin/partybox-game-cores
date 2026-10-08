import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

const output = process.argv.includes('--record') ? 'media' : '.tmp/visual';
mkdirSync('.tmp', { recursive: true }); mkdirSync(output, { recursive: true });
const userData = resolve('.tmp/chrome'); rmSync(userData, { recursive: true, force: true });
const binary = process.env.G03_CHROME ?? ['/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].find(existsSync);
if (!binary) throw new Error('Chrome/Chromium executable unavailable');
const browser = spawn(binary, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${userData}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
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
  for (let n = 0; n < 150 && !existsSync(`${userData}/DevToolsActivePort`); n++) { if (browser.exitCode !== null) throw Error(`Chrome exited ${browser.exitCode}: ${stderr.slice(0, 1500)}`); await delay(100); }
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
  const httpMode = process.argv.includes('--http') || process.env.G03_VISUAL_MODE === 'http';
  assert.ok(!process.env.CI || !httpMode, 'CI must run the real disk-open check');
  if (httpMode) {
    localServer = createServer((request, response) => {
      if (request.url !== '/play.html') { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(readFileSync('play.html'));
    });
    await new Promise(resolve => localServer.listen(0, '127.0.0.1', resolve));
  }
  const documentUrl = httpMode ? `http://127.0.0.1:${localServer.address().port}/play.html` : pathToFileURL(resolve('play.html')).href;
  const nav = await send('Page.navigate', { url: documentUrl });
  if (nav.errorText) throw Error(`File navigation failed: ${nav.errorText}`);
  for (let i = 0; i < 100 && !(await evaluate('!!document.getElementById("start")')); i++) await delay(50);
  assert.ok(await evaluate('!!document.getElementById("start")'), 'self-contained page did not load');
  await evaluate('document.getElementById("rounds").value="1";document.getElementById("start").click();document.getElementById("start-turn").click()');
  assert.equal(await evaluate('document.getElementById("handoff").hidden'), true);
  async function measure(width, height, cpu) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
    await send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await evaluate('new Promise(resolve=>{let n=0;function warm(){if(++n<60)requestAnimationFrame(warm);else resolve()}requestAnimationFrame(warm)})');
    return evaluate(`new Promise(resolve=>{let previous=0;const dt=[];let n=0;function frame(t){if(previous)dt.push(t-previous);previous=t;n++;if(n%6===0)document.dispatchEvent(new KeyboardEvent('keydown',{key:n%12===0?'ArrowLeft':'ArrowRight',bubbles:true}));if(n<182)requestAnimationFrame(frame);else{dt.shift();const sorted=[...dt].sort((a,b)=>a-b);resolve({width:${width},height:${height},cpu:${cpu},warmupFrames:60,interaction:'keyboard ghost movement at 10 Hz',frames:dt.length,meanMs:dt.reduce((a,b)=>a+b)/dt.length,p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:Math.max(...dt),fps:1000/(dt.reduce((a,b)=>a+b)/dt.length),overflow:document.documentElement.scrollWidth>innerWidth})}}requestAnimationFrame(frame)})`);
  }
  await evaluate('document.querySelector("[data-select]").click()');
  const desktop = await measure(1920, 1080, 1); const phone = await measure(390, 844, 4);
  console.log(JSON.stringify({ desktop, phone }));
  assert.equal(phone.overflow, false); assert.ok(desktop.meanMs <= 17.5 && phone.meanMs <= 17.5, 'mean rendering rate below 60 fps tolerance');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches'), true);
  const motion = await evaluate('getComputedStyle(document.getElementById("board")).animationName'); assert.equal(motion, 'none');
  await send('Emulation.setCPUThrottlingRate', { rate: 1 }); await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const screenshot = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${output}/packing-desktop.png`, Buffer.from(screenshot.data, 'base64'));
  // Original UI screencast: repeated real frames captured while arranging the visible hold.
  const frameDir = resolve('.tmp/capture'); mkdirSync(frameDir, { recursive: true });
  for (let frame = 0; frame < 36; frame++) {
    if (frame === 4) await evaluate('document.querySelector("[data-select]").click()');
    if (frame === 12) await evaluate('document.getElementById("rotate").click()');
    if (frame === 20) await evaluate('document.getElementById("board").focus();document.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}))');
    const shot = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${frameDir}/${String(frame).padStart(3, '0')}.png`, Buffer.from(shot.data, 'base64')); await delay(60);
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', `${frameDir}/%03d.png`, '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-an', `${output}/milestone-01.webm`]);
  assert.ok(readFileSync(`${output}/milestone-01.webm`).length < 10_000_000);
  await evaluate('document.getElementById("submit").click()');
  for (let i = 0; i < 100 && !(await evaluate('!document.getElementById("reveal-controls").hidden')); i++) await delay(50);
  assert.ok(await evaluate('!document.getElementById("reveal-controls").hidden'));
  await evaluate('document.getElementById("solution").click();document.getElementById("next").click()');
  assert.equal(await evaluate('document.getElementById("result").hidden'), false);
  assert.equal(requests.filter(url => /^https?:/.test(url) && url !== documentUrl && !url.endsWith('/favicon.ico')).length, 0); assert.deepEqual(errors, []);
  const report = { schemaVersion: 1, chrome: (await cdp.send('Browser.getVersion')).product, fileOpened: !httpMode, serving: httpMode ? 'localhost HTTP; disk-open remains blocked by managed browser policy' : 'disk', desktop, phone, reducedMotion: true, externalRequests: 0, runtimeExceptions: 0, completedTwoPlayerGame: true, videoBytes: readFileSync(`${output}/milestone-01.webm`).length };
  writeFileSync(`${output}/visual-measurements.json`, JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report));
} finally { socket?.close(); browser.kill('SIGTERM'); localServer?.close(); }
