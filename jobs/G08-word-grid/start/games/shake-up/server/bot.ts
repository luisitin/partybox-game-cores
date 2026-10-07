// Bot: honest by construction. It reads the grid and its own list from its own
// controllerView and searches a skill-sized list of common words (public content).
import { nextFloat, nextInt, type Bot, type BotSkill } from '@partybox/game-sdk';
import { asLang, packFor } from './content';
import { foldWord, letterCount } from './rules';
import { solve } from './solver';
import type { Input } from './types';
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

export const bot: Bot<ControllerView, Input> = {
  sampleInput(view, { playerId, rng, skill }) {
    if (view.phase !== 'hunt' || view.paused || view.me.done) return null;
    const [roll, r1] = nextFloat(rng);
    if (roll > PACE[skill]) return null;
    const [lo, hi] = CAP[skill];
    const cap = lo + (hash(`${view.round}:${view.grid.join('')}:${playerId}`) % (hi - lo + 1));
    if (view.me.words.length >= cap) return null;
    const grid = view.grid.map(foldWord);
    const vocab = packFor(asLang(view.lang)).bots[skill];
    const have = new Set(view.me.words.map((w) => foldWord(w.w)));
    const options = solve(grid, view.size, vocab, view.minLen, 600).filter((f) => !have.has(f.w));
    if (options.length === 0) return null;
    // Easy bots lean short, sharp bots lean long; everyone stays a little random.
    options.sort((a, b) => (skill === 'easy' ? letterCount(a.w) - letterCount(b.w) : letterCount(b.w) - letterCount(a.w)));
    const window = Math.max(1, Math.ceil(options.length * (skill === 'sharp' ? 0.35 : 0.6)));
    const [k] = nextInt(r1, window);
    const pick = options[k];
    return pick ? { t: 'word', path: pick.path } : null;
  },
};
