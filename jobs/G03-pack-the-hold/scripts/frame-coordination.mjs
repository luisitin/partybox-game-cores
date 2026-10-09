import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const atomic = (path, data) => {
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n');
  renameSync(temporary, path);
};
export async function awaitFrameGrant(profile, sourceSha256, { timeoutMs = 600_000 } = {}) {
  const configured = process.env.G03_FRAME_BARRIER_DIR;
  if (!configured) return null;
  assert.ok(profile === 'desktop' || profile === 'phone');
  const directory = resolve(configured); mkdirSync(directory, { recursive: true });
  const base = resolve(directory, profile);
  for (const suffix of ['ready.json', 'grant.json', 'closed.json']) rmSync(`${base}-${suffix}`, { force: true });
  const identity = { profile, sourceSha256, attemptNonce: randomUUID() };
  atomic(`${base}-ready.json`, { ...identity, utc: new Date().toISOString(), intervals: 900, minimumFps: 59, maximumP95Ms: 18, rawFiltering: 'none', captureDuringSample: false });
  console.log(JSON.stringify({ frameWindow: 'READY', ...identity }));
  const began = performance.now();
  assert.ok(Number.isFinite(timeoutMs) && timeoutMs > 0);
  while (performance.now() - began < timeoutMs) {
    const path = `${base}-grant.json`;
    if (existsSync(path)) {
      let grant; try { grant = JSON.parse(readFileSync(path, 'utf8')); } catch { grant = null; }
      if (grant && typeof grant === 'object' && !Array.isArray(grant) &&
          Object.keys(grant).sort().join(',') === 'attemptNonce,profile,sourceSha256' &&
          Object.keys(identity).every(key => grant[key] === identity[key])) return { ...identity, base };
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  closeFrameWindow({ ...identity, base }, { status: 'failed', reason: 'matching grant not received within600s' });
  throw new Error('G03 matching frame grant timed out after600s');
}
export function closeFrameWindow(window, result) {
  if (!window) return;
  const { base, ...identity } = window;
  atomic(`${base}-closed.json`, { ...identity, ...result, utc: new Date().toISOString() });
  console.log(JSON.stringify({ frameWindow: 'CLOSED', ...identity, ...result }));
}

// Optional ownership witness for capture encoding, separate from native frame grants.
export async function awaitCaptureEncoderGrant(sourceSha256, browserPid, { timeoutMs = 10_000 } = {}) {
  const configured = process.env.G03_CAPTURE_ENCODER_BARRIER_DIR;
  if (!configured) return null;
  assert.match(sourceSha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(browserPid) && browserPid > 0);
  assert.ok(Number.isFinite(timeoutMs) && timeoutMs > 0);
  const directory = resolve(configured); mkdirSync(directory, { recursive: true });
  const base = resolve(directory, 'encoder');
  for (const suffix of ['ready.json', 'grant.json', 'closed.json']) assert.ok(!existsSync(`${base}-${suffix}`), 'encoder witness must use an unused directory');
  const identity = { sourceSha256, browserPid, attemptNonce: randomUUID() };
  atomic(`${base}-ready.json`, { ...identity, utc: new Date().toISOString(), browserClosed: true, sourceFrameCount: 36, width: 1280, height: 900, encodedFps: 10, noNativeFrameWindow: true });
  console.log(JSON.stringify({ captureEncoder: 'READY', ...identity }));
  const began = performance.now();
  while (performance.now() - began < timeoutMs) {
    const path = `${base}-grant.json`;
    if (existsSync(path)) {
      let grant; try { grant = JSON.parse(readFileSync(path, 'utf8')); } catch { grant = null; }
      if (grant && typeof grant === 'object' && !Array.isArray(grant) &&
          Object.keys(grant).sort().join(',') === 'attemptNonce,browserPid,sourceSha256' &&
          Object.keys(identity).every(key => grant[key] === identity[key])) return { ...identity, base };
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  closeCaptureEncoderWindow({ ...identity, base }, { status: 'failed', reason: 'matching closed-browser encoder grant timed out' });
  throw new Error('G03 closed-browser encoder grant timed out');
}
export function closeCaptureEncoderWindow(window, result) {
  if (!window) return;
  const { base, ...identity } = window;
  atomic(`${base}-closed.json`, { ...identity, ...result, utc: new Date().toISOString() });
  console.log(JSON.stringify({ captureEncoder: 'CLOSED', ...identity, ...result }));
}
