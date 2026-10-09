import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { awaitCaptureEncoderGrant, closeCaptureEncoderWindow } from './frame-coordination.mjs';

test('encoder ownership grants reject wrong nonce/source/browser, malformed and extra fields', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'G03-encoder-grants-'));
  const previous = process.env.G03_CAPTURE_ENCODER_BARRIER_DIR;
  process.env.G03_CAPTURE_ENCODER_BARRIER_DIR = directory;
  try {
    const pending = awaitCaptureEncoderGrant('a'.repeat(64), 12345, { timeoutMs: 3000 });
    const ready = JSON.parse(readFileSync(join(directory, 'encoder-ready.json'), 'utf8'));
    assert.equal(ready.browserClosed, true); assert.equal(ready.sourceFrameCount, 36);
    assert.equal(ready.width, 1280); assert.equal(ready.height, 900); assert.equal(ready.noNativeFrameWindow, true);
    const valid = { sourceSha256: ready.sourceSha256, browserPid: ready.browserPid, attemptNonce: ready.attemptNonce };
    let accepted = false; pending.then(() => { accepted = true; });
    const bad = ['{', 'null', '[]', JSON.stringify({ ...valid, attemptNonce: 'old' }), JSON.stringify({ ...valid, sourceSha256: 'b'.repeat(64) }), JSON.stringify({ ...valid, browserPid: 12346 }), JSON.stringify({ ...valid, extra: true }), JSON.stringify({ sourceSha256: valid.sourceSha256, browserPid: valid.browserPid })];
    for (const bytes of bad) {
      writeFileSync(join(directory, 'encoder-grant.json'), bytes);
      await new Promise(resolve => setTimeout(resolve, 45));
      assert.equal(accepted, false, `bad encoder grant accepted:${bytes}`);
    }
    writeFileSync(join(directory, 'encoder-grant.json'), JSON.stringify(valid));
    const window = await pending; assert.equal(accepted, true);
    closeCaptureEncoderWindow(window, { status: 'closed', videoBytes: 103222 });
    const closed = JSON.parse(readFileSync(join(directory, 'encoder-closed.json'), 'utf8'));
    assert.equal(closed.status, 'closed'); assert.equal(closed.attemptNonce, ready.attemptNonce); assert.equal(closed.browserPid, 12345);
    const before = ['ready', 'grant', 'closed'].map(name => readFileSync(join(directory, `encoder-${name}.json`)));
    await assert.rejects(awaitCaptureEncoderGrant('a'.repeat(64), 12345), /unused directory/);
    assert.deepEqual(['ready', 'grant', 'closed'].map(name => readFileSync(join(directory, `encoder-${name}.json`))), before, 'prior witness bytes preserved');
    console.log(JSON.stringify({ actualEncoderGrantCorruptionControls: bad.length + 1, originalWitnessFilesPreserved: true }));
  } finally {
    if (previous === undefined) delete process.env.G03_CAPTURE_ENCODER_BARRIER_DIR; else process.env.G03_CAPTURE_ENCODER_BARRIER_DIR = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
test('missing encoder grant fails closed; no configured witness leaves original default flow', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'G03-encoder-timeout-')); const previous = process.env.G03_CAPTURE_ENCODER_BARRIER_DIR;
  try {
    delete process.env.G03_CAPTURE_ENCODER_BARRIER_DIR;
    assert.equal(await awaitCaptureEncoderGrant('a'.repeat(64), 12345), null);
    process.env.G03_CAPTURE_ENCODER_BARRIER_DIR = directory;
    await assert.rejects(awaitCaptureEncoderGrant('a'.repeat(64), 12345, { timeoutMs: 100 }), /timed out/);
    const closed = JSON.parse(readFileSync(join(directory, 'encoder-closed.json'), 'utf8'));
    assert.equal(closed.status, 'failed'); assert.match(closed.reason, /timed out/);
  } finally {
    if (previous === undefined) delete process.env.G03_CAPTURE_ENCODER_BARRIER_DIR; else process.env.G03_CAPTURE_ENCODER_BARRIER_DIR = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
