import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { coreDir, root, playGame } from './helpers.mjs';
import { wilson } from '../scripts/league.mjs';

// Declared before any games for this correction. Recorded earlier calibration
// and mixed-table seeds are excluded; no strategy parameters are fitted here.
const pairs = 1000, salt = 0x8c42f5d1;
const seeds = Array.from({ length: pairs }, (_, index) =>
  (Math.imul(index + 1, 0x9e3779b1) ^ salt) >>> 0);
const priorSalts = [0x607d1ce, 0x7b3196e2, 0x88a4e107, 2876125503, 207162093, 168103391];
const prior = new Set();
for (const priorSalt of priorSalts) for (let index = 0; index < 1000; index += 1) {
  prior.add((Math.imul(index + 1, 0x9e3779b1) ^ priorSalt) >>> 0);
}
for (let count = 3; count <= 8; count += 1) {
  for (let comparison = 1; comparison <= 2; comparison += 1) {
    for (let index = 0; index < 1000; index += 1) {
      prior.add((Math.imul(index + 1, 0x9e3779b1) ^ 0xd12a09b7 ^
        Math.imul(count, 0x85ebca6b) ^ Math.imul(comparison, 0xc2b2ae35)) >>> 0);
    }
  }
}
assert.equal(new Set(seeds).size, pairs, 'fresh seeds must be distinct');
assert.equal(seeds.filter(seed => prior.has(seed)).length, 0, 'holdout overlaps previous exploration');

const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const inputPaths = [
  ...['core.ts', 'rules.ts', 'probability.ts'].map(name => resolve(root, 'src', name)),
  ...['core.mjs', 'rules.mjs', 'probability.mjs', 'contract.mjs'].map(name => resolve(coreDir, name)),
  resolve(root, 'tests/helpers.mjs'), resolve(root, 'tests/strategy-holdout.mjs'),
  resolve(root, 'scripts/league.mjs'),
];
const inputSnapshot = () => Object.fromEntries(inputPaths.map(path => [path, sha256(path)]));
const before = inputSnapshot();
const metadata = {
  command: 'node tests/strategy-holdout.mjs',
  revisionAtStart: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourceSha256: Object.fromEntries(['core.ts', 'rules.ts', 'probability.ts'].map(name => [name, sha256(resolve(root, 'src', name))])),
  bundleSha256: Object.fromEntries(['core.mjs', 'rules.mjs', 'probability.mjs', 'contract.mjs'].map(name => [name, sha256(resolve(coreDir, name))])),
  helperSha256: sha256(resolve(root, 'tests/helpers.mjs')),
  runnerSha256: sha256(resolve(root, 'tests/strategy-holdout.mjs')),
  salt, saltHex: '0x8c42f5d1', pairsPerMatchup: pairs,
  seedIndependence: { priorSalts, priorSeeds: prior.size, priorOverlap: 0, duplicateFresh: 0,
    coverage: 'First 1,000 seeds from each recorded duel/calibration salt (a superset of pilots), plus all 12,000 completed 3–8-player diagnostic seeds.' },
  method: 'Each fixed fresh seed is played twice with seats swapped, using the unchanged complete-game helper. Strong versus Medium and Medium versus Easy each have 2,000 games. Both Wilson and paired-seed cluster normal intervals must have lower95 > 50%. All seeds, seats, winners and rounds are retained. No bot strategy is adjusted using this holdout.',
  limitations: [
    'Default two-player settings only; this does not establish strength for multiplayer or variants.',
    'Compared implementations only; no claim about human, external champion or optimal play.',
    'Same-seed games can consume the RNG differently after strategy divergence; pairing preserves initial seed and swapped seat, not an identical future transcript.',
    'Paired-seed cluster normal confidence intervals are approximate and pointwise.',
  ],
};

function matchup(stronger, weaker) {
  const gamesRaw = [], pairMeans = [];
  let wins = 0;
  for (const seed of seeds) {
    let pairWins = 0;
    for (let seat = 0; seat < 2; seat += 1) {
      const strongerId = `p${seat}`;
      const { state } = playGame({ count: 2, seed,
        skillFor: id => id === strongerId ? stronger : weaker });
      const strongerWon = state.winner === strongerId;
      wins += Number(strongerWon); pairWins += Number(strongerWon);
      gamesRaw.push({ seed, strongerSeat: seat, winner: state.winner,
        rounds: state.round, strongerWon });
    }
    pairMeans.push(pairWins / 2);
  }
  const games = pairs * 2, winRate = wins / games;
  const variance = pairMeans.reduce((sum, rate) => sum + (rate - winRate) ** 2, 0) / (pairs - 1);
  const margin = 1.959963984540054 * Math.sqrt(variance / pairs);
  return { stronger, weaker, games, pairedSeeds: pairs, wins, winRate,
    wilson95: wilson(wins, games),
    pairedSeedCluster95: [Math.max(0, winRate - margin), Math.min(1, winRate + margin)],
    gamesRaw };
}

const matchups = [matchup('sharp', 'normal'), matchup('normal', 'easy')];
assert.deepEqual(inputSnapshot(), before, 'source/bundle/test input changed during holdout');
const clearWins = matchups.every(row => row.wilson95[0] > 0.5 && row.pairedSeedCluster95[0] > 0.5);
const report = { result: clearWins ? 'PASS' : 'FAIL', metadata, inputsUnchanged: true, matchups };
const out = resolve(root, 'evidence/checks/round-2');
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'strategy-holdout.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, matchups: matchups.map(({ gamesRaw, ...summary }) => summary) }));
assert.ok(clearWins, 'each skill upgrade must clearly win on untouched fresh seeds');
