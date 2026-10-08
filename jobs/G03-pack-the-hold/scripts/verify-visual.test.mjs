import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { currentSourceHashes, loadVisual, validateVisual } from './verify-visual.mjs';

test('real current browser evidence passes; independently corrupted raw/summary/guards/clip/transport fail', () => {
  const { report, raws, video } = loadVisual(process.env.G03_CURRENT_VISUAL_REPORT ?? '.tmp/visual/visual-measurements.json');
  const hashes = currentSourceHashes();
  assert.ok(validateVisual(report, raws, hashes, video, !!process.env.CI));
  const controls = [
    r => { r.status = 'failed'; }, r => { r.failure = 'unrecorded failure'; },
    r => { r.schemaVersion = 1; }, r => { r.kind = 'capture-only'; },
    r => { r.finishedAtUtc = r.startedAtUtc.slice(0, 10); },
    r => { r.sourceHashesStart['play.html'] = '0'.repeat(64); },
    r => { delete r.sourceHashesEnd['scripts/verify-visual.mjs']; },
    r => { r.rawFiltering = 'trimmed'; }, r => { r.captureDuringSamples = true; },
    r => { r.physicalPhoneMeasured = true; }, r => { r.runtimeExceptions = 1; },
    r => { r.errors.push('actual exception'); }, r => { r.requests.push('https://example.org/a'); },
    r => { r.externalRequests = 1; }, r => { r.documentUrl = 'https://example.org/play.html'; },
    r => { r.serving = 'unknown'; }, r => { r.completedPlayerCounts.pop(); },
    r => { r.touchDrag = false; }, r => { r.videoBytes++; }, r => { r.videoSha256 = '0'.repeat(64); },
  ];
  for (const profile of ['desktop', 'phone']) {
    controls.push(r => { r[profile].frames = 899; }, r => { r[profile].cpu = 2; }, r => { r[profile].width++; }, r => { r[profile].overflow = true; }, r => { r[profile].rawFile = '../bad.json'; });
    for (const key of ['fps', 'meanMs', 'p95Ms', 'p99Ms', 'maxMs']) controls.push(r => { r[profile][key] += 1; });
  }
  for (const mutate of controls) { const r = structuredClone(report); mutate(r); assert.throws(() => validateVisual(r, raws, hashes, video)); }
  let rawControls = 0;
  for (const profile of ['desktop', 'phone']) for (const mutate of [
    r => { r.intervals.pop(); }, r => { r.intervals[0] = 0; }, r => { r.intervals[0] = -1; },
    r => { r.intervals[0] = null; }, r => { r.intervals[0] = '16.7'; }, r => { r.intervals[0] = Infinity; },
    r => { r.intervals[0] += 1000; }, r => { r.count = 899; }, r => { r.nativeRaf = false; },
    r => { r.capturing = true; }, r => { r.filtering = 'none except first'; }, r => { r.profile = 'wrong'; },
    r => { r.sourceHashesEnd['play.html'] = '0'.repeat(64); }, r => { r.sampledAtUtc = '2020-01-01T00:00:00Z'; },
  ]) { const changed = structuredClone(raws); mutate(changed[profile]); assert.throws(() => validateVisual(report, changed, hashes, video)); rawControls++; }
  const badVideo = Buffer.from(video); badVideo[0] = 0; assert.throws(() => validateVisual(report, raws, hashes, badVideo));
  for (const slower of [false, true]) {
    const r = structuredClone(report), changed = structuredClone(raws);
    changed.phone.intervals = changed.phone.intervals.map((value, index) => slower ? value * 2 : index < 54 ? 19 : value);
    const sorted = changed.phone.intervals.toSorted((a, b) => a - b), meanMs = sorted.reduce((a, b) => a + b, 0) / 900;
    Object.assign(r.phone, { meanMs, fps: 1000 / meanMs, p95Ms: sorted[855], p99Ms: sorted[891], maxMs: sorted[899] });
    assert.throws(() => validateVisual(r, changed, hashes, video), /near60fps gate/);
  }
  const http = structuredClone(report); http.fileOpened = false; http.documentUrl = 'http://127.0.0.1:1234/play.html'; http.serving = 'localhost HTTP; not disk-open proof'; http.requests = [http.documentUrl];
  assert.throws(() => validateVisual(http, raws, hashes, video, true), /disk loading/);
  assert.throws(() => validateVisual(JSON.parse(readFileSync('historical/hosted-731b64b.json', 'utf8')), raws, hashes, video));
  console.log(JSON.stringify({ actualCurrentFrameCorruptionControls: controls.length + rawControls + 5, rawIntervalsIndependentlyRecomputed: 1800 }));
});
