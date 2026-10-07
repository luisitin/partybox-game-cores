// Stand-in for `pnpm sim --game shake-up --dump-fixtures` (+ --finish-fixtures):
// plays a 6-player room (Dev is a bot) with bots for everyone and keeps one
// full state per phase, mid-game (round 2), plus done.json.
//   pnpm tsx games/shake-up/__tests__/make-fixtures.ts
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedRng } from '@partybox/game-sdk';
import { game } from '../server';
import type { State } from '../server/types';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const names = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya'];
let s = game.init({
  players: names.map((name, i) => ({ id: name.toLowerCase(), name, isBot: name === 'Dev' })),
  settings: { rounds: 3 },
  seed: 'fixtures-2026-10-05',
  now: 1_000_000,
  contentLang: 'en',
});
const keep: Record<string, State> = {};
let now = 1_000_000;
const skills = ['normal', 'sharp', 'normal', 'normal', 'easy', 'normal'] as const;
for (let tick = 0; tick < 4000 && s.phase.id !== 'done'; tick++) {
  now += 1000;
  if (s.phase.deadline !== undefined && now >= s.phase.deadline) {
    s = game.reduce(s, { type: 'timer', now, phaseId: s.phase.id, startedAt: s.phase.startedAt, step: s.phase.step ?? 0 });
  } else {
    s.order.forEach((id, i) => {
      const inp = game.bot.sampleInput(game.controllerView(s, id), { playerId: id, rng: seedRng(`${tick}:${id}`), skill: skills[i] ?? 'normal' });
      if (inp) s = game.reduce(s, { type: 'input', playerId: id, input: inp, now });
    });
  }
  const p = s.phase;
  if (s.round === 2) {
    if (p.id === 'shake' && !keep.shake) keep.shake = s;
    if (p.id === 'hunt' && p.deadline !== undefined && p.deadline - now <= 12_000 && !keep.hunt) keep.hunt = s;
    if (p.id === 'reveal' && (p.step ?? 0) === 2 && !keep.reveal) keep.reveal = s;
    if (p.id === 'reveal' && (p.step ?? 0) === s.beats.length - 1) keep['reveal-last'] = s;
    if (p.id === 'tally' && !keep.tally) keep.tally = s;
  }
}
keep.done = s;
for (const [k, v] of Object.entries(keep)) {
  writeFileSync(join(out, `${k}.json`), JSON.stringify(v, null, 1));
  console.log(k, s.phase.id === 'done' ? 'ok' : 'NOT DONE', `${(JSON.stringify(v).length / 1024).toFixed(1)} KB`);
}
