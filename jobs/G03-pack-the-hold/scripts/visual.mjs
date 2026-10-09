import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { awaitFrameGrant, closeFrameWindow, awaitCaptureEncoderGrant, closeCaptureEncoderWindow } from './frame-coordination.mjs';

const output = process.argv.includes('--record') ? 'media' : '.tmp/visual';
const captureOnly = process.argv.includes('--capture-only');
const recording = process.argv.includes('--record');
const milestoneIndex = process.argv.indexOf('--milestone');
const milestone = milestoneIndex >= 0 ? process.argv[milestoneIndex + 1] : '01';
assert.match(milestone, /^\d{2}$/);
const videoFile = `milestone-${milestone}.webm`;
mkdirSync('.tmp', { recursive: true }); mkdirSync(output, { recursive: true });
assert.ok(!recording || milestoneIndex >= 0, 'recording requires an explicit unused milestone');
assert.ok(!recording || !existsSync(`${output}/${videoFile}`), 'existing milestone must never be overwritten');
const reportName = captureOnly ? `capture-${milestone}-report.json` : recording ? `visual-${milestone}-report.json` : 'visual-measurements.json';
assert.ok(!recording || !existsSync(`${output}/${reportName}`), 'existing milestone report must never be overwritten');
const guardedFiles = ['play.html', 'web/template.html', 'manifest.json', 'fixtures/pack.json', 'package.json', 'package-lock.json', 'scripts/generate.mjs', 'scripts/check-data.mjs', 'scripts/check-hashes.mjs', 'scripts/visual.mjs', 'scripts/verify-visual.mjs', 'scripts/frame-coordination.mjs', ...readdirSync('src').filter(n => n.endsWith('.ts')).map(n => `src/${n}`), ...readdirSync('../../contract').filter(n => n.endsWith('.ts')).map(n => `../../contract/${n}`)].sort();
const sourceHashes = () => Object.fromEntries(guardedFiles.map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
const sourceHashesStart = sourceHashes();
let frameWindow = null;
const startedAtUtc = new Date().toISOString();
const report = { schemaVersion: 2, kind: captureOnly ? 'capture-only' : 'visual', status: 'running', startedAtUtc, finishedAtUtc: null, sourceHashesStart, sourceHashesEnd: null, wallClock: 'Date.now frozen by host; native RAF timestamps unchanged', rawFiltering: 'none', captureDuringSamples: false, physicalPhoneMeasured: false, desktop: null, phone: null, failure: null };
const saveReport = () => writeFileSync(`${output}/${reportName}`, JSON.stringify(report, null, 2) + '\n');
saveReport();
const userData = resolve('.tmp/chrome'); rmSync(userData, { recursive: true, force: true });
const binary = process.env.G03_CHROME ?? ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].find(existsSync);
if (!binary) throw new Error('Chrome/Chromium executable unavailable');
const browser = spawn(binary, ['--headless=new', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-dev-shm-usage', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${userData}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const browserClosed = new Promise(resolve => browser.once('close', resolve));
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
let uiChecksComplete = false;
let encoderWindow = null;
const frameDir = resolve('.tmp/capture');
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
  report.requests = requests; report.errors = errors;
  cdp.on('Network.requestWillBeSent', p => requests.push(p.request.url));
  cdp.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text));
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'Date.now = () => 1700000000000;' });
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
  report.documentUrl = documentUrl;
  const nav = await send('Page.navigate', { url: documentUrl });
  if (nav.errorText) throw Error(`File navigation failed: ${nav.errorText}`);
  for (let i = 0; i < 100 && !(await evaluate('!!document.getElementById("start")')); i++) await delay(50);
  assert.ok(await evaluate('!!document.getElementById("start")'), 'self-contained page did not load');
  Object.assign(report, { chrome: (await cdp.send('Browser.getVersion')).product, fileOpened: !httpMode, serving: httpMode ? 'localhost HTTP; not disk-open proof' : 'disk' });
  saveReport();
  await evaluate('document.getElementById("rounds").value="1";document.getElementById("start").click();document.getElementById("start-turn").click()');
  assert.equal(await evaluate('document.getElementById("handoff").hidden'), true);
  const focus = await evaluate("(()=>{const button=document.querySelector('[data-select]');button.focus();button.click();return{selected:button.dataset.select,focused:document.activeElement.dataset.select??null}})()");
  assert.equal(focus.focused, focus.selected, 'keyboard selection must preserve tray focus');
  await evaluate("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
  assert.equal(await evaluate('document.querySelectorAll("[data-select][aria-pressed=true]").length'), 0);
  async function measure(width, height, cpu) {
    const profile = cpu === 1 ? 'desktop' : 'phone';
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
    await send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await evaluate('new Promise(resolve=>{let n=0;function warm(){if(++n<60)requestAnimationFrame(warm);else resolve()}requestAnimationFrame(warm)})');
    assert.deepEqual(sourceHashes(), sourceHashesStart, 'source changed before frame sample');
    frameWindow = await awaitFrameGrant(profile, sourceHashesStart['play.html']);
    const sampledAtUtc = new Date().toISOString();
    let raw;
    try {
      raw = await evaluate(`new Promise(resolve=>{let previous=null;const dt=[];let n=0;function frame(t){if(previous!==null)dt.push(t-previous);previous=t;n++;if(n%6===0)document.dispatchEvent(new KeyboardEvent('keydown',{key:n%12===0?'ArrowLeft':'ArrowRight',bubbles:true}));if(dt.length<900)requestAnimationFrame(frame);else resolve(dt)}requestAnimationFrame(frame)})`);
      const rawName = recording ? `visual-${milestone}-raw-${profile}.json` : `raw-${profile}.json`;
      const sample = { profile, width, height, cpu, intervals: raw, count: raw.length, warmupFrames: 60, filtering: 'none', interaction: 'keyboard ghost movement at10Hz', nativeRaf: true, capturing: false, sampledAtUtc, finishedAtUtc: new Date().toISOString(), sourceHashesStart, sourceHashesEnd: sourceHashes() };
      writeFileSync(`${output}/${rawName}`, JSON.stringify(sample, null, 2) + '\n');
      const sorted = [...raw].sort((a, b) => a - b); const meanMs = raw.reduce((a, b) => a + b, 0) / raw.length;
      const measured = { profile, width, height, cpu, warmupFrames: 60, interaction: sample.interaction, frames: raw.length, meanMs, p95Ms: sorted[Math.floor(sorted.length * .95)], p99Ms: sorted[Math.floor(sorted.length * .99)], maxMs: Math.max(...raw), fps: 1000 / meanMs, overflow: await evaluate(`document.documentElement.scrollWidth>${width}`), rawFile: rawName };
      report[profile] = measured; report.sourceHashesEnd = sample.sourceHashesEnd; saveReport();
      closeFrameWindow(frameWindow, { status: 'closed', rawFile: rawName, frames: raw.length, fps: measured.fps, p95Ms: measured.p95Ms, capturing: false }); frameWindow = null;
      assert.equal(raw.length, 900, 'exactly900 consecutive real intervals');
      assert.ok(raw.every(n => typeof n === 'number' && Number.isFinite(n) && n > 0), 'raw intervals must all be positive/finite');
      assert.deepEqual(sample.sourceHashesEnd, sourceHashesStart, 'source changed during sample');
      assert.ok(measured.fps >= 59 && measured.p95Ms <= 18, `${profile}: near60fps gate failed`);
      return measured;
    } catch (error) {
      closeFrameWindow(frameWindow, { status: 'failed', reason: String(error) }); frameWindow = null; throw error;
    }
  }
  await evaluate('document.querySelector("[data-select]").click()');
  if (!captureOnly) {
    const desktop = await measure(1920, 1080, 1); const phone = await measure(390, 844, 4);
    console.log(JSON.stringify({ desktop, phone })); assert.equal(phone.overflow, false);
  } else {
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches'), true);
  const motion = await evaluate('getComputedStyle(document.getElementById("board")).animationName'); assert.equal(motion, 'none');
  await send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const fixture = JSON.parse(readFileSync('fixtures/pack.json', 'utf8'));
  const cargo = fixture.solution[0]; const cargoValue = fixture.level.crates.find(c => c.id === cargo.crateId).value;
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await evaluate(`document.querySelector('[data-select="${cargo.crateId}"]').click();for(let i=0;i<${cargo.rotation};i++)document.getElementById('rotate').click()`);
  const touchPoints = await evaluate(`(()=>{const b=document.querySelector('[data-select="${cargo.crateId}"]').getBoundingClientRect();const svg=document.getElementById('hold-svg');const p=new DOMPoint(${cargo.x + 0.5},${cargo.y + 0.5}).matrixTransform(svg.getScreenCTM());return{from:{x:b.x+b.width/2,y:b.y+b.height/2},to:{x:p.x,y:p.y}}})()`);
  assert.ok(touchPoints.from.y < 844 && touchPoints.to.y > 0, 'touch targets must fit in the phone viewport');
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...touchPoints.from, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...touchPoints.to, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal(await evaluate('parseInt(document.getElementById("value").textContent)'), cargoValue, 'real phone touch drag must pack the crate');
  await evaluate('document.getElementById("clear").click()');
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await evaluate(`document.querySelector('[data-select="${cargo.crateId}"]').click();for(let i=0;i<${cargo.rotation};i++)document.getElementById('rotate').click()`);
  const points = await evaluate(`(()=>{const b=document.querySelector('[data-select="${cargo.crateId}"]').getBoundingClientRect();const svg=document.getElementById('hold-svg');const p=new DOMPoint(${cargo.x + 0.5},${cargo.y + 0.5}).matrixTransform(svg.getScreenCTM());return{from:{x:b.x+b.width/2,y:b.y+b.height/2},to:{x:p.x,y:p.y}}})()`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...points.from });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...points.from, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...points.to, buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...points.to, button: 'left', clickCount: 1 });
  assert.equal(await evaluate('parseInt(document.getElementById("value").textContent)'), cargoValue, 'real pointer drag must pack the selected crate');
  await evaluate(`document.getElementById('clear').click();document.querySelector('[data-select="${cargo.crateId}"]').click();for(let i=0;i<${cargo.rotation};i++)document.getElementById('rotate').click();for(let i=0;i<${cargo.x};i++)document.getElementById('board').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));for(let i=0;i<${cargo.y};i++)document.getElementById('board').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));document.getElementById('board').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));`);
  assert.equal(await evaluate('parseInt(document.getElementById("value").textContent)'), cargoValue, 'keyboard placement must pack the selected crate');
  const screenshot = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${output}/${recording ? `packing-desktop-${milestone}.png` : 'packing-desktop.png'}`, Buffer.from(screenshot.data, 'base64'));
  // Original UI screencast: repeated real frames captured while arranging the visible hold.
  mkdirSync(frameDir, { recursive: true });
  for (let frame = 0; frame < 36; frame++) {
    if (frame === 4) await evaluate('document.querySelector("[data-select]").click()');
    if (frame === 12) await evaluate('document.getElementById("rotate").click()');
    if (frame === 20) await evaluate('document.getElementById("board").focus();document.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}))');
    const shot = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${frameDir}/${String(frame).padStart(3, '0')}.png`, Buffer.from(shot.data, 'base64')); await delay(60);
  }
  await evaluate('document.getElementById("submit").click()');
  for (let i = 0; i < 100 && !(await evaluate('!document.getElementById("reveal-controls").hidden')); i++) await delay(50);
  assert.ok(await evaluate('!document.getElementById("reveal-controls").hidden'));
  await evaluate('document.getElementById("solution").click();document.getElementById("next").click()');
  assert.equal(await evaluate('document.getElementById("result").hidden'), false);
  const completedPlayerCounts = [];
  for (let count = 2; count <= 8; count++) {
    await evaluate(`(()=>{document.getElementById('next').click();const count=document.getElementById('player-count');count.value='${count}';count.dispatchEvent(new Event('change'));document.getElementById('rounds').value='1';for(let i=0;i<${count};i++)document.getElementById('skill-'+i).value=i===0?'sharp':'normal';document.getElementById('start').click()})()`);
    for (let i = 0; i < 100 && !(await evaluate('!document.getElementById("reveal-controls").hidden')); i++) await delay(30);
    assert.equal(await evaluate('document.querySelectorAll(".score-chip").length'), count);
    await evaluate('document.getElementById("next").click()');
    assert.equal(await evaluate('document.getElementById("result").hidden'), false);
    assert.ok(await evaluate('document.getElementById("result").textContent.startsWith("Player 1 wins")'));
    completedPlayerCounts.push(count);
  }
  // Mobile layout must remain within the emulated width, even when a name
  // would otherwise expand the layout viewport and hide an overflow defect.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate("document.getElementById('next').click();const count=document.getElementById('player-count');count.value='2';count.dispatchEvent(new Event('change'));document.getElementById('name-0').value='W'.repeat(24);document.getElementById('name-1').value='W'.repeat(24);document.getElementById('skill-0').value='human';document.getElementById('rounds').value='1';document.getElementById('start').click()");
  async function assertPhoneLayout(phase) {
    const size = await evaluate('({innerWidth,scrollWidth:document.documentElement.scrollWidth})');
    assert.equal(size.innerWidth, 390, `${phase}: long names must not expand the mobile viewport`);
    assert.ok(size.scrollWidth <= 390, `${phase}: long names must fit the phone`);
  }
  await assertPhoneLayout('handoff');
  await evaluate("document.getElementById('start-turn').click()");
  await assertPhoneLayout('packing');
  await evaluate("document.getElementById('submit').click()");
  for (let i = 0; i < 100 && !(await evaluate('!document.getElementById("reveal-controls").hidden')); i++) await delay(30);
  await assertPhoneLayout('inspection');
  await evaluate("document.getElementById('next').click()");
  await assertPhoneLayout('results');
  assert.equal(requests.filter(url => /^https?:/.test(url) && url !== documentUrl && !url.endsWith('/favicon.ico')).length, 0); assert.deepEqual(errors, []);
  Object.assign(report, { chrome: (await cdp.send('Browser.getVersion')).product, fileOpened: !httpMode, serving: httpMode ? 'localhost HTTP; not disk-open proof' : 'disk', reducedMotion: true, externalRequests: 0, runtimeExceptions: 0, completedTwoPlayerGame: true, completedPlayerCounts, pointerDrag: true, touchDrag: true, keyboardFocus: true, keyboardPlacement: true, longNamesFit: true });
  uiChecksComplete = true;
} catch (error) {
  report.status = 'failed'; report.failure = String(error); throw error;
} finally {
  closeFrameWindow(frameWindow, { status: 'failed', reason: 'runner closing' });
  socket?.close(); browser.kill('SIGTERM'); localServer?.close();
  try {
    await browserClosed;
    if (uiChecksComplete) {
      encoderWindow = await awaitCaptureEncoderGrant(sourceHashesStart['play.html'], browser.pid);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', `${frameDir}/%03d.png`, '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-an', `${output}/${videoFile}`]);
      const video = readFileSync(`${output}/${videoFile}`);
      assert.ok(video.length < 10_000_000);
      Object.assign(report, { videoFile, videoBytes: video.length, videoSha256: createHash('sha256').update(video).digest('hex'), encodedVideoFps: 10, videoScope: '36 separately captured real UI images; encoded10fps is not rendering acceptance' });
      report.status = 'passed';
      closeCaptureEncoderWindow(encoderWindow, { status: 'closed', videoBytes: video.length }); encoderWindow = null;
    }
  } catch (error) {
    report.status = 'failed'; report.failure = String(error); throw error;
  } finally {
    closeCaptureEncoderWindow(encoderWindow, { status: 'failed', reason: 'runner closing' });
    report.finishedAtUtc = new Date().toISOString(); report.sourceHashesEnd = sourceHashes();
    if (JSON.stringify(report.sourceHashesEnd) !== JSON.stringify(sourceHashesStart)) { report.status = 'failed'; report.failure = 'source changed during browser run'; process.exitCode = 1; }
    saveReport(); console.log(JSON.stringify(report));
  }
}
