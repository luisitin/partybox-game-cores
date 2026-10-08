import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, playGame } from '../tests/helpers.mjs';

export function wilson(wins, games) {
  const z = 1.959963984540054, p = wins / games, denominator = 1 + z * z / games;
  const center = (p + z * z / (2 * games)) / denominator;
  const margin = z * Math.sqrt(p * (1 - p) / games + z * z / (4 * games * games)) / denominator;
  return [center - margin, center + margin];
}
export function runMatchup(stronger, weaker, pairs = 1000) {
  let wins = 0;
  const games = [], pairMeans = [];
  for (let index = 0; index < pairs; index += 1) {
    const seed = (Math.imul(index + 1, 0x9e3779b1) ^ 0x607d1ce) >>> 0;
    let pairWins = 0;
    for (let seat = 0; seat < 2; seat += 1) {
      const strongerId = `p${seat}`;
      const { state } = playGame({ count: 2, seed, skillFor: (id) => id === strongerId ? stronger : weaker });
      const won = state.winner === strongerId;
      wins += Number(won); pairWins += Number(won);
      games.push({ seed, strongerSeat: seat, winner: state.winner, rounds: state.round, strongerWon: won });
    }
    pairMeans.push(pairWins / 2);
  }
  const total = pairs * 2, winRate = wins / total;
  const variance = pairMeans.reduce((sum, p) => sum + (p - winRate) ** 2, 0) / (pairs - 1);
  const pairedMargin = 1.959963984540054 * Math.sqrt(variance / pairs);
  return { stronger, weaker, games: total, pairedSeeds: pairs, wins, winRate, wilson95: wilson(wins, total), pairedSeedCluster95: [Math.max(0, winRate - pairedMargin), Math.min(1, winRate + pairedMargin)], gamesRaw: games };
}
export function runLeague(pairs = 1000) {
  return { matchups: [runMatchup('sharp', 'normal', pairs), runMatchup('normal', 'easy', pairs)], method: 'Same seed and swapped seats for every pair; independent bot random streams derived from seed and event index; two-sided 95% Wilson interval and paired-seed cluster normal interval' };
}
export function saveLeague(league) {
  mkdirSync(resolve(root, 'evidence/checks'), { recursive: true });
  writeFileSync(resolve(root, 'evidence/checks/league.json'), `${JSON.stringify(league, null, 2)}\n`);
}
export function requireClearWins(league) {
  for (const matchup of league.matchups) {
    assert.equal(matchup.games, 2000);
    assert.ok(matchup.wilson95[0] > 0.5, `${matchup.stronger} vs ${matchup.weaker}: Wilson lower95=${matchup.wilson95[0]}`);
    assert.ok(matchup.pairedSeedCluster95[0] > 0.5, `${matchup.stronger} vs ${matchup.weaker}: paired-seed lower95=${matchup.pairedSeedCluster95[0]}`);
  }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pairs = Number(process.argv[2] || 1000);
  const league = runLeague(pairs);
  saveLeague(league);
  console.log(JSON.stringify({ ...league, matchups: league.matchups.map(({ gamesRaw, ...summary }) => summary) }));
  if (pairs === 1000) requireClearWins(league);
}
