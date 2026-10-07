// Test helpers: build a room, drive events, run whole games with bots.
import { nextFloat, seedRng, type BotSkill, type GameEvent, type Rng, type Settings } from '@partybox/game-sdk';
import { game } from '../server';
import type { Input, State } from '../server/types';

export const NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya', 'Gus', 'Hana', 'Ivo', 'Jun', 'Kai', 'Lia', 'Mo', 'Nia', 'Oto', 'Pia'];
export const T0 = 1_000_000;
/** S T R A / E D N I / R E D L / O M Qu T — the mock-up's round-2 grid. */
export const GRID = ['s', 't', 'r', 'a', 'e', 'd', 'n', 'i', 'r', 'e', 'd', 'l', 'o', 'm', 'qu', 't'];
export const STRANDED = [0, 1, 2, 3, 6, 5, 9, 10];

export function room(n: number, settings: Settings = {}, seed: number | string = 1, opts: { lang?: string; bots?: number[] } = {}): State {
  return game.init({
    players: NAMES.slice(0, n).map((name, i) => ({ id: `p${i + 1}`, name, isBot: opts.bots?.includes(i) === true })),
    settings,
    seed,
    now: T0,
    contentLang: opts.lang ?? 'en',
  });
}

export const input = (playerId: string, inp: Input, now: number, vip = false): GameEvent<Input> =>
  vip ? { type: 'input', playerId, input: inp, now, vip: true } : { type: 'input', playerId, input: inp, now };

export function fire(s: State, now = s.phase.deadline ?? T0): State {
  return game.reduce(s, { type: 'timer', now, phaseId: s.phase.id, startedAt: s.phase.startedAt, step: s.phase.step ?? 0 });
}

export const skip = (s: State, now = s.phase.startedAt + 10): State => game.reduce(s, { type: 'vip', action: 'skip', now });

/** Advance until `phase` (by timers), at most 200 steps. */
export function until(s: State, phase: State['phase']['id']): State {
  let x = s;
  for (let i = 0; i < 200 && x.phase.id !== phase; i++) x = fire(x);
  return x;
}

/** A word the grid can spell, from the real dictionary (via the solver). */
export { solve } from '../server/solver';

export type SimOpts = { players: number; seed: number; settings?: Settings; lang?: string; skill?: BotSkill; chaos?: boolean; idle?: boolean };

/** Whole game: every player driven by the bot (plus optional random junk), 1 s ticks. */
export function simulate(o: SimOpts): { state: State; events: GameEvent<Input>[]; ms: number } {
  let s = room(o.players, o.settings ?? {}, o.seed, { lang: o.lang ?? 'en' });
  let rng: Rng = seedRng(`sim:${o.seed}`);
  const rand = () => { const [v, r] = nextFloat(rng); rng = r; return v; };
  const events: GameEvent<Input>[] = [];
  const apply = (ev: GameEvent<Input>) => { events.push(ev); s = game.reduce(s, ev); };
  let now = T0;
  for (let tick = 0; tick < 6000 && s.phase.id !== 'done'; tick++) {
    now += 1000;
    // The engine holds timers while paused; someone resumes eventually.
    if (s.paused) { if (rand() < 0.15) apply({ type: 'vip', action: 'resume', now }); continue; }
    if (s.phase.deadline !== undefined && now >= s.phase.deadline) {
      apply({ type: 'timer', now, phaseId: s.phase.id, startedAt: s.phase.startedAt, step: s.phase.step ?? 0 });
      continue;
    }
    if (o.idle) continue;
    for (const id of s.order) {
      const view = game.controllerView(s, id);
      const inp = game.bot.sampleInput(view, { playerId: id, rng: seedRng(`${o.seed}:${tick}:${id}`), skill: o.skill ?? 'normal' });
      if (inp) apply(input(id, inp, now));
      if (o.chaos && rand() < 0.05) apply(junk(id, rand, now, s));
    }
  }
  return { state: s, events, ms: now - T0 };
}

function junk(id: string, rand: () => number, now: number, s: State): GameEvent<Input> {
  const r = rand();
  if (r < 0.15) return { type: 'vip', action: 'skip', now };
  if (r < 0.25) return { type: 'vip', action: rand() < 0.5 ? 'pause' : 'resume', now };
  if (r < 0.35) return { type: 'player', playerId: id, connected: rand() < 0.6, now };
  if (r < 0.45) return input(id, { t: 'done', done: rand() < 0.7 }, now);
  if (r < 0.55) return input(id, { t: 'counts', word: s.words[id]?.[0]?.w.toUpperCase() ?? 'ZZZ', counts: true }, now, true);
  const path = Array.from({ length: 3 + Math.floor(rand() * 5) }, () => Math.floor(rand() * 16));
  return input(id, { t: 'word', path }, now);
}

/** JSON-safe: no undefined, NaN, Infinity or -0 anywhere. */
export function jsonSafe(v: unknown, path = '$'): string | null {
  if (v === undefined) return `${path} is undefined`;
  if (typeof v === 'number') return Number.isFinite(v) && !Object.is(v, -0) ? null : `${path} is ${v}`;
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { const e = jsonSafe(v[i], `${path}[${i}]`); if (e) return e; } return null; }
  if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) { const e = jsonSafe(x, `${path}.${k}`); if (e) return e; } }
  return null;
}
