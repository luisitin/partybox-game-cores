// Bot: honest by construction. It reads the grid and its own list from its own
// controllerView and searches a skill-sized list of common words (public content).
import { type BotSkill, type Rng } from '@partybox/game-sdk';
import { asLang, packFor } from './content';
import { foldWord, letterCount, showFace } from './rules';
import { solve } from './solver';
import type { Found, Input, State } from './types';
import type { ControllerView } from './views';

/** Per call, the chance a bot submits a word (engine calls bots on its own cadence). */
const PACE: Record<BotSkill, number> = { easy: 0.22, normal: 0.4, sharp: 0.6 };
/** Words a bot finds per round, before it "runs dry": [min, max]. */
const CAP: Record<BotSkill, [number, number]> = { easy: [5, 9], normal: [10, 18], sharp: [20, 34] };

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

export const bot = {
  sampleInput(view: Pick<ControllerView, 'phase' | 'paused' | 'round' | 'grid' | 'size' | 'lang' | 'minLen' | 'me'>, { playerId, rng, skill, options: plan }: { playerId: string; rng: Rng; skill: BotSkill; options?: readonly Found[] }): Input | null {
    if (view.phase !== 'hunt' || view.paused || view.me.done || view.me.role !== 'player') return null;
    const roll = rng.float();
    if (roll > PACE[skill]) return null;
    const [lo, hi] = CAP[skill];
    const cap = lo + (hash(`${view.round}:${view.grid.join('')}:${playerId}`) % (hi - lo + 1));
    if (view.me.words.length >= cap) return null;
    const grid = view.grid.map(foldWord);
    const vocab = packFor(asLang(view.lang)).bots[skill];
    const have = new Set(view.me.words.map((w) => foldWord(w.w)));
    const options = (plan ?? solve(grid, view.size, vocab, view.minLen, 600)).filter((f) => !have.has(f.w));
    if (options.length === 0) return null;
    // Easy bots lean short, sharp bots lean long; everyone stays a little random.
    options.sort((a, b) => (skill === 'easy' ? letterCount(a.w) - letterCount(b.w) : letterCount(b.w) - letterCount(a.w)));
    const window = Math.max(1, Math.ceil(options.length * (skill === 'sharp' ? 0.35 : 0.6)));
    const k = rng.int(0, window - 1);
    const pick = options[k];
    return pick ? { t: 'word', path: pick.path } : null;
  },
};

/** Root-contract entry. The early gates use only phase/public grid and this seat's own list;
 * they avoid constructing every human's full view after a bot has exhausted its word budget.
 * Options are a pure precomputation of this public grid and public skill vocabulary, never
 * opponents' words. The differential privacy check pins this projection to the phone fields. */
export function sampleInput(state: State, playerId: string, rng: Rng, skill: BotSkill = 'normal'): Input | null {
  if (state.phase.id !== 'hunt' || state.phase.paused || state.done[playerId] === true || !Object.hasOwn(state.players, playerId)) return null;
  const own = state.words[playerId] ?? [];
  const grid = state.grid.map(showFace);
  const [lo, hi] = CAP[skill];
  const cap = lo + (hash(`${state.round}:${grid.join('')}:${playerId}`) % (hi - lo + 1));
  if (own.length >= cap) return null;
  const options = state.botPlans[skill];
  // Empty vocabularies (often easy on sparse 5x5 boards) are terminal for this round.
  if (options.every(f => own.some(e => e.w === f.w))) return null;
  const me = { id: playerId, role: 'player' as const, score: state.scores[playerId] ?? 0, done: false,
    words: own.map(e => ({ w: e.w, ok: e.ok, pts: 0 })) };
  const view = { phase: 'hunt' as const, paused: false, round: state.round, grid, size: state.cfg.size,
    lang: state.cfg.lang, minLen: state.cfg.minLen, me };
  return bot.sampleInput(view, { playerId, rng, skill, options });
}
