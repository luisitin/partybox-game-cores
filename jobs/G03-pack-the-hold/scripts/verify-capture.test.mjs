import test from 'node:test';
import assert from 'node:assert/strict';
import { currentSourceHashes, loadVisual, validateCapture } from './verify-visual.mjs';

test('actual current separate clip passes; source, bytes, scope and functional corruptions fail', () => {
  const { report, video } = loadVisual('media/capture-13-report.json'), hashes = currentSourceHashes();
  assert.ok(validateCapture(report, hashes, video));
  const mutations = [
    r => { r.kind = 'visual'; }, r => { r.status = 'failed'; }, r => { r.failure = 'error'; },
    r => { r.desktop = { fps: 60 }; }, r => { r.phone = { fps: 60 }; },
    r => { r.sourceHashesStart['play.html'] = '0'.repeat(64); }, r => { delete r.sourceHashesEnd['scripts/visual.mjs']; },
    r => { r.videoBytes++; }, r => { r.videoSha256 = '0'.repeat(64); }, r => { r.videoFile = '../milestone-13.webm'; },
    r => { r.encodedVideoFps = 60; }, r => { r.videoScope = 'real frame acceptance'; },
    r => { r.runtimeExceptions = 1; }, r => { r.externalRequests = 1; }, r => { r.errors.push('error'); },
    r => { r.requests.push('https://example.org'); }, r => { r.documentUrl = 'https://example.org'; },
    r => { r.completedPlayerCounts.pop(); }, r => { r.touchDrag = false; }, r => { r.reducedMotion = false; },
    r => { r.finishedAtUtc = r.startedAtUtc.slice(0, 10); }, r => { r.physicalPhoneMeasured = true; },
  ];
  for (const mutate of mutations) { const r = structuredClone(report); mutate(r); assert.throws(() => validateCapture(r, hashes, video)); }
  const bad = Buffer.from(video); bad[0] = 0; assert.throws(() => validateCapture(report, hashes, bad));
  assert.throws(() => validateCapture(report, hashes, Buffer.alloc(0)));
  assert.throws(() => validateCapture(report, hashes, Buffer.alloc(10_000_000)));
  console.log(JSON.stringify({ actualCurrentCaptureCorruptionControls: mutations.length + 3, actualVideoBytes: video.length }));
});
