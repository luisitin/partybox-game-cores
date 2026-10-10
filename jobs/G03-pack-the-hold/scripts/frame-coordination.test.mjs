import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { awaitFrameGrant, closeFrameWindow } from './frame-coordination.mjs';

test('actual temporary grants reject stale nonce/source/profile and malformed or extra fields', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'G03-frame-grants-'));
  const previous = process.env.G03_FRAME_BARRIER_DIR;
  process.env.G03_FRAME_BARRIER_DIR = directory;
  try {
    writeFileSync(join(directory, 'phone-ready.json'), 'other profile remains');
    writeFileSync(join(directory, 'desktop-grant.json'), '{"stale":true}');
    const pending = awaitFrameGrant('desktop', 'a'.repeat(64), { timeoutMs: 3000 });
    assert.equal(existsSync(join(directory, 'desktop-grant.json')), false, 'old grant removed');
    const ready = JSON.parse(readFileSync(join(directory, 'desktop-ready.json'), 'utf8'));
    const valid = { profile: ready.profile, sourceSha256: ready.sourceSha256, attemptNonce: ready.attemptNonce };
    let accepted = false; pending.then(() => { accepted = true; });
    const bad = ['{', 'null', '[]', JSON.stringify({ ...valid, attemptNonce: 'old' }), JSON.stringify({ ...valid, sourceSha256: 'b'.repeat(64) }), JSON.stringify({ ...valid, profile: 'phone' }), JSON.stringify({ ...valid, extra: true }), JSON.stringify({ profile: valid.profile, sourceSha256: valid.sourceSha256 })];
    for (const bytes of bad) {
      writeFileSync(join(directory, 'desktop-grant.json'), bytes);
      await new Promise(resolve => setTimeout(resolve, 125));
      assert.equal(accepted, false, `bad grant accepted:${bytes}`);
    }
    writeFileSync(join(directory, 'desktop-grant.json'), JSON.stringify(valid));
    const window = await pending; assert.equal(accepted, true);
    assert.equal(readFileSync(join(directory, 'phone-ready.json'), 'utf8'), 'other profile remains');
    closeFrameWindow(window, { status: 'closed' });
    assert.equal(JSON.parse(readFileSync(join(directory, 'desktop-closed.json'), 'utf8')).attemptNonce, ready.attemptNonce);
    const second = awaitFrameGrant('desktop', 'a'.repeat(64), { timeoutMs: 3000 });
    const ready2 = JSON.parse(readFileSync(join(directory, 'desktop-ready.json'), 'utf8'));
    assert.notEqual(ready.attemptNonce, ready2.attemptNonce);
    writeFileSync(join(directory, 'desktop-grant.json'), JSON.stringify(valid));
    let done = false; second.then(() => { done = true; });
    await new Promise(resolve => setTimeout(resolve, 125)); assert.equal(done, false, 'previous real grant replayed');
    writeFileSync(join(directory, 'desktop-grant.json'), JSON.stringify({ profile: ready2.profile, sourceSha256: ready2.sourceSha256, attemptNonce: ready2.attemptNonce }));
    closeFrameWindow(await second, { status: 'closed' });
    console.log(JSON.stringify({ actualGrantCorruptionControls: 10, sequentialAttempts: 2 }));
  } finally {
    if (previous === undefined) delete process.env.G03_FRAME_BARRIER_DIR; else process.env.G03_FRAME_BARRIER_DIR = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
test('actual missing grant fails and writes CLOSED; no configured barrier returns immediately', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'G03-frame-timeout-')); const previous = process.env.G03_FRAME_BARRIER_DIR;
  try {
    delete process.env.G03_FRAME_BARRIER_DIR; assert.equal(await awaitFrameGrant('desktop', 'a'.repeat(64)), null);
    process.env.G03_FRAME_BARRIER_DIR = directory;
    await assert.rejects(awaitFrameGrant('desktop', 'a'.repeat(64), { timeoutMs: 100 }), /timed out/);
    const closed = JSON.parse(readFileSync(join(directory, 'desktop-closed.json'), 'utf8')); assert.equal(closed.status, 'failed');
  } finally {
    if (previous === undefined) delete process.env.G03_FRAME_BARRIER_DIR; else process.env.G03_FRAME_BARRIER_DIR = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
