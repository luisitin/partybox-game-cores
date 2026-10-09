import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

// Independently enumerated, rather than importing the runner's guard list.
const guardedFiles = [
  '../../contract/constants.ts', '../../contract/contract.ts', '../../contract/minigame-schema.ts', '../../contract/player-count-schema.ts', '../../contract/rng.ts',
  'fixtures/pack.json', 'manifest.json', 'package.json', 'package-lock.json', 'play.html',
  'scripts/generate.mjs', 'scripts/check-data.mjs', 'scripts/check-hashes.mjs', 'scripts/frame-coordination.mjs', 'scripts/verify-visual.mjs', 'scripts/visual.mjs',
  'src/browser.ts', 'src/core.ts', 'src/generator.ts', 'src/geometry.ts', 'src/manifest.ts', 'src/reference.ts', 'src/schema.ts', 'src/solver.ts', 'src/study-total-baseline.ts', 'src/tiers.ts', 'src/types.ts', 'web/template.html',
].sort();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export const currentSourceHashes = () => Object.fromEntries(guardedFiles.map(path => [path, sha(readFileSync(path))]));
const checkedUtc = value => { assert.equal(typeof value, 'string'); assert.ok(Number.isFinite(Date.parse(value))); assert.equal(new Date(value).toISOString(), value, 'canonical UTC timestamp'); return Date.parse(value); };
const equalNumber = (actual, expected, label) => { assert.equal(typeof actual, 'number', label); assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= 1e-8, label); };
function common(report, hashes, video, expectedKind) {
  assert.equal(report.schemaVersion, 2); assert.equal(report.kind, expectedKind); assert.equal(report.status, 'passed');
  assert.equal(report.failure, null); assert.ok(checkedUtc(report.finishedAtUtc) >= checkedUtc(report.startedAtUtc));
  assert.deepEqual(report.sourceHashesStart, hashes, 'current source start guards');
  assert.deepEqual(report.sourceHashesEnd, hashes, 'current source final guards');
  assert.equal(report.wallClock, 'Date.now frozen by host; native RAF timestamps unchanged');
  assert.equal(report.rawFiltering, 'none'); assert.equal(report.captureDuringSamples, false);
  assert.equal(report.physicalPhoneMeasured, false, 'emulation must not claim a physical phone');
  assert.equal(report.externalRequests, 0); assert.equal(report.runtimeExceptions, 0);
  assert.deepEqual(report.errors, []); assert.ok(Array.isArray(report.requests));
  assert.equal(typeof report.fileOpened, 'boolean');
  const allowedUrl = report.fileOpened ? /^file:\/\// : /^http:\/\/127\.0\.0\.1:\d+\/play\.html$/;
  assert.ok(allowedUrl.test(report.documentUrl), 'actual transport');
  assert.equal(report.serving, report.fileOpened ? 'disk' : 'localhost HTTP; not disk-open proof');
  for (const request of report.requests) assert.ok(request === report.documentUrl || request === report.documentUrl.replace(/\/play\.html$/, '/favicon.ico'), 'unexpected runtime request');
  for (const key of ['reducedMotion', 'completedTwoPlayerGame', 'pointerDrag', 'touchDrag', 'keyboardFocus', 'keyboardPlacement', 'longNamesFit']) assert.equal(report[key], true, key);
  assert.deepEqual(report.completedPlayerCounts, [2, 3, 4, 5, 6, 7, 8]);
  assert.match(report.videoFile, /^milestone-\d{2}\.webm$/); assert.equal(basename(report.videoFile), report.videoFile);
  assert.ok(Buffer.isBuffer(video) && video.length > 0 && video.length < 10_000_000);
  assert.equal(report.videoBytes, video.length); assert.equal(report.videoSha256, sha(video));
  assert.deepEqual([...video.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3], 'actual WebM EBML header');
  assert.equal(report.encodedVideoFps, 10);
  assert.equal(report.videoScope, '36 separately captured real UI images; encoded10fps is not rendering acceptance');
}
export function validateCapture(report, hashes, video) {
  common(report, hashes, video, 'capture-only');
  assert.equal(report.desktop, null); assert.equal(report.phone, null);
  return { scope: 'separate real UI clip; no frame acceptance', videoBytes: video.length, sourceGuards: guardedFiles.length };
}
export function validateVisual(report, raws, hashes, video, requireDisk = false) {
  common(report, hashes, video, 'visual');
  if (requireDisk) assert.equal(report.fileOpened, true, 'CI requires actual disk loading');
  const results = {};
  for (const [profile, width, height, cpu] of [['desktop', 1920, 1080, 1], ['phone', 390, 844, 4]]) {
    const measured = report[profile]; const raw = raws[profile];
    assert.ok(measured && raw); assert.equal(measured.profile, profile); assert.equal(raw.profile, profile);
    for (const [key, value] of Object.entries({ width, height, cpu, warmupFrames: 60 })) { assert.equal(measured[key], value); assert.equal(raw[key], value); }
    assert.match(measured.rawFile, /^(?:visual-\d{2}-)?raw-(?:desktop|phone)\.json$/);
    assert.equal(basename(measured.rawFile), measured.rawFile);
    assert.equal(measured.rawFile.endsWith(`raw-${profile}.json`), true);
    assert.equal(measured.frames, 900); assert.equal(raw.count, 900); assert.equal(raw.intervals.length, 900);
    assert.equal(raw.filtering, 'none'); assert.equal(raw.nativeRaf, true); assert.equal(raw.capturing, false);
    assert.equal(measured.interaction, 'keyboard ghost movement at10Hz'); assert.equal(raw.interaction, measured.interaction);
    assert.equal(measured.overflow, false);
    assert.deepEqual(raw.sourceHashesStart, hashes); assert.deepEqual(raw.sourceHashesEnd, hashes);
    const from = checkedUtc(raw.sampledAtUtc), to = checkedUtc(raw.finishedAtUtc);
    assert.ok(from >= checkedUtc(report.startedAtUtc) && to >= from && to <= checkedUtc(report.finishedAtUtc));
    const intervals = raw.intervals;
    for (const interval of intervals) assert.ok(typeof interval === 'number' && Number.isFinite(interval) && interval > 0, 'positive finite raw interval');
    const sum = intervals.reduce((total, value) => total + value, 0), meanMs = sum / 900;
    const sorted = intervals.toSorted((a, b) => a - b);
    const computed = { meanMs, fps: 1000 / meanMs, p95Ms: sorted[855], p99Ms: sorted[891], maxMs: sorted[899] };
    for (const [key, value] of Object.entries(computed)) equalNumber(measured[key], value, `${profile} independently recomputed${key}`);
    assert.ok(computed.fps >= 59 && computed.p95Ms <= 18, `${profile} near60fps gate`);
    results[profile] = { ...computed, rawIntervals: 900 };
  }
  return { scope: requireDisk ? 'current disk/raw frame/capture evidence' : 'current transport-labelled/raw frame/capture evidence', sourceGuards: guardedFiles.length, ...results };
}
export function loadVisual(path) {
  const report = JSON.parse(readFileSync(path, 'utf8')); const base = dirname(resolve(path));
  const video = readFileSync(resolve(base, report.videoFile));
  const raws = report.kind === 'visual' ? Object.fromEntries(['desktop', 'phone'].map(profile => [profile, JSON.parse(readFileSync(resolve(base, report[profile].rawFile), 'utf8'))])) : null;
  return { report, raws, video };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const capture = process.argv[2] === '--capture-report';
  const path = capture ? process.argv[3] : process.argv[2] ?? '.tmp/visual/visual-measurements.json';
  assert.ok(path, 'actual report path required');
  const { report, raws, video } = loadVisual(path); const hashes = currentSourceHashes();
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  ajv.addFormat('date-time', value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
  const schema = JSON.parse(readFileSync(`schemas/${capture ? 'capture' : 'current-visual'}.schema.json`, 'utf8'));
  assert.ok(ajv.validate(schema, report), JSON.stringify(ajv.errors));
  if (!capture) for (const raw of Object.values(raws)) assert.ok(ajv.validate(JSON.parse(readFileSync('schemas/raw-frame.schema.json', 'utf8')), raw), JSON.stringify(ajv.errors));
  const result = capture ? validateCapture(report, hashes, video) : validateVisual(report, raws, hashes, video, !!process.env.CI);
  console.log(JSON.stringify({ independentVisualVerification: 'PASS', ...result }));
}
