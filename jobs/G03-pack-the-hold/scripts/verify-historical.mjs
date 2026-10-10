import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';
import { currentSourceHashes, validateVisual } from './verify-visual.mjs';

// Separate historical entry point. The current CLI has no historical fallback.
const pinned = '9362a28ae23bdea924379072744904e735fa74e0';
const report = JSON.parse(readFileSync('historical/hosted-9362-report.json.txt', 'utf8'));
const raws = Object.fromEntries(['desktop', 'phone'].map(profile => [profile, JSON.parse(readFileSync(`historical/hosted-9362-raw-${profile}.json.txt`, 'utf8'))]));
const expected = Object.fromEntries(Object.keys(currentSourceHashes()).map(path => {
  const repositoryPath = posix.normalize(`jobs/G03-pack-the-hold/${path}`);
  const bytes = execFileSync('git', ['show', `${pinned}:${repositoryPath}`], { maxBuffer: 8_000_000 });
  return [path, createHash('sha256').update(bytes).digest('hex')];
}));
assert.equal(Object.keys(expected).length, 28);
const result = validateVisual(report, raws, expected, readFileSync('historical/hosted-9362.webm'), true);
console.log(JSON.stringify({ historicalVerification: 'PASS', pinnedHead: pinned, ...result, scope: 'historical9362 disk/raw frame/capture evidence', proofScope: 'actual9362 uploaded bytes and pinned source objects' }));
