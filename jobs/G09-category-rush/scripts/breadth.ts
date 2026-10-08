/** Actual-core eight-sharp-bot content experiment. No runtime or sampler overrides. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { game } from '../src/index';
import { CATEGORIES } from '../content/categories';
import { createRng } from '../../../contract/rng';
import type { GameEvent } from '../../../contract/contract';
import type { Input } from '../src/model';

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const label = process.argv.find(value => value.startsWith('--label='))?.slice(8) ?? 'after';
assert.ok(['baseline', 'after'].includes(label));
const hashFile = (path: string) => digest(readFileSync(new URL(path, import.meta.url), 'utf8'));
const banks = CATEGORIES.flatMap(category => Object.entries(category.answers).map(([letter, answers]) => ({ categoryId: category.id, letter, width: answers.length })));
const widths = banks.map(bank => bank.width).sort((a, b) => a - b);
const rows: Record<string, unknown>[] = [];
const impacts = new Map<string, { categoryId: string; letter: string; appearances: number; submitted: number; duplicated: number; awarded: number; width: number }>();
let submitted = 0, duplicated = 0, awarded = 0, blank = 0, repeatedOwn = 0, replayMatches = 0;

function play(seed: number) {
  const rngs = Array.from({ length: 8 }, (_, i) => createRng((seed * 8191) ^ (i * 104729 + 0x76ad)));
  let state = game.init({ players: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, name: `Bot ${i}`, avatarId: 'face0', connected: true, bot: true })), settings: { rounds: 1, roundSeconds: 30 }, seed: seed + 65536, now: 0 });
  const layout = state.categories.map(category => category.id);
  let answerHash = '';
  for (let step = 0; step < 200 && state.phase.id !== 'done'; step++) {
    let event: GameEvent<Input> | null = null;
    for (let i = 0; i < 8; i++) {
      const input = game.bot.sampleInput(state, `p${i}`, rngs[i], 'sharp');
      if (input) { event = { type: 'input', now: state.phaseClock + 1, playerId: `p${i}`, input }; break; }
    }
    if (!event) event = { type: 'timer', now: state.phase.deadline!, phaseId: state.phase.id, startedAt: state.phase.startedAt };
    const before = state.phase.id;
    state = game.reduce(state, event);
    if (before === 'answer' && state.phase.id !== 'answer') answerHash = digest(JSON.stringify(state.answers));
  }
  assert.equal(state.phase.id, 'done', `seed ${seed} must terminate`);
  assert.equal(state.history.length, 1);
  return { state, answerHash, stateHash: digest(JSON.stringify(state)), layout };
}

for (let seed = 1; seed <= 200; seed++) {
  const first = play(seed), replay = play(seed);
  assert.equal(first.stateHash, replay.stateHash, `seed ${seed} replay`);
  assert.equal(first.answerHash, replay.answerHash); replayMatches++;
  const round = first.state.history[0];
  let gameSubmitted = 0, gameDuplicates = 0, gameAwarded = 0;
  round.entries.forEach(entry => {
    const source = CATEGORIES.find(category => category.id === entry.categoryId)!;
    const key = `${entry.categoryId}/${round.letter}`;
    const impact = impacts.get(key) ?? { categoryId: entry.categoryId, letter: round.letter, appearances: 0, submitted: 0, duplicated: 0, awarded: 0, width: source.answers[round.letter].length };
    impact.appearances++;
    for (const group of entry.groups) {
      submitted += group.owners.length; gameSubmitted += group.owners.length; impact.submitted += group.owners.length;
      if (group.duplicate) { duplicated += group.owners.length; gameDuplicates += group.owners.length; impact.duplicated += group.owners.length; }
      if (!group.eligible) repeatedOwn += group.owners.length;
      awarded += group.points; gameAwarded += group.points; impact.awarded += group.points;
    }
    impacts.set(key, impact);
  });
  blank += 96 - gameSubmitted;
  rows.push({ seed, letter: round.letter, layout: first.layout, submitted: gameSubmitted, duplicated: gameDuplicates, awarded: gameAwarded, scores: first.state.scores, answerHash: first.answerHash, stateHash: first.stateHash });
}
const report = {
  protocol: 'eight-sharp-one-round-200-v1', label, games: 200, players: 8, seeds: [1, 200],
  sourceHashes: { authored: hashFile('../content/authored.mjs'), data: hashFile('../content/categories.json'), generated: hashFile('../content/categories.ts'), core: hashFile('../src/index.ts'), scoring: hashFile('../src/scoring.ts'), matcher: hashFile('../src/match.ts'), experiment: hashFile('breadth.ts') },
  breadth: { categories: CATEGORIES.length, examples: widths.reduce((a, b) => a + b, 0), banks: widths.length, singleton: widths.filter(width => width === 1).length, median: widths[Math.floor(widths.length / 2)], widthAtLeast4: widths.filter(width => width >= 4).length, widthAtLeast8: widths.filter(width => width >= 8).length },
  outcomes: { submitted, duplicated, duplicateOwnerRate: duplicated / submitted, awarded, meanAwardedPerGame: awarded / 200, meanAwardedPerSeat: awarded / 1600, blank, repeatedOwn, replayMatches, distinctAnswerSheets: new Set(rows.map(row => row.answerHash)).size, distinctFinalStates: new Set(rows.map(row => row.stateHash)).size },
  bankImpacts: [...impacts.values()].sort((a, b) => b.duplicated - a.duplicated || a.categoryId.localeCompare(b.categoryId) || a.letter.localeCompare(b.letter)),
  rows,
};
writeFileSync(new URL(`../evidence/breadth-${label}.json`, import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ label, sourceHashes: report.sourceHashes, breadth: report.breadth, outcomes: report.outcomes }, null, 2));
