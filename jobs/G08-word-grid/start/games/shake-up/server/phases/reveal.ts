// reveal: one beat per player (quietest first, so the biggest list lands last),
// one card for everyone with no words, then the best word nobody found.
import { isTimerFor, nextStep, readingMs, type GameEvent } from '@partybox/game-sdk';
import { packFor } from '../content';
import { hasWord } from '../dict';
import { beatLine, wordCount } from '../lines';
import { foldWord } from '../rules';
import { roundPoints } from '../scoring';
import { bestMissed, solve } from '../solver';
import type { Beat, Input, State } from '../types';

const MIN_BEAT = 3500;
const MAX_BEAT = 9000;
export const CARD_WORDS = 14; // words a card lists before "+N more"

export function beatMs(state: State, index: number): number {
  const beat = state.beats[index];
  if (!beat) return MIN_BEAT;
  const shown = beat.kind === 'player' ? Math.min(CARD_WORDS, state.words[beat.id]?.length ?? 0) : 2;
  const said = wordCount(beatLine(state, beat, index).text);
  const ms = readingMs(shown + said, { lang: state.cfg.lang });
  return Math.max(MIN_BEAT, Math.min(MAX_BEAT, ms));
}

function buildBeats(state: State): Beat[] {
  const pts = roundPoints(state);
  const withWords = state.order.filter((id) => (state.words[id]?.length ?? 0) > 0);
  const empty = state.order.filter((id) => (state.words[id]?.length ?? 0) === 0);
  const seat = (id: string) => state.order.indexOf(id);
  withWords.sort((a, b) => (pts[a] ?? 0) - (pts[b] ?? 0) || seat(a) - seat(b));
  const beats: Beat[] = withWords.map((id) => ({ kind: 'player', id }));
  if (empty.length) beats.push({ kind: 'empty', ids: empty });
  if (state.missed) beats.push({ kind: 'missed' });
  return beats;
}

export function enterReveal(state: State, now: number): State {
  const pack = packFor(state.cfg.lang);
  const taken = new Set<string>();
  for (const id of state.order) for (const e of state.words[id] ?? []) taken.add(e.w);
  const all = solve(state.grid, state.cfg.size, pack.words, state.cfg.minLen);
  const fit = state.cfg.spicy ? all : all.filter((f) => !hasWord(pack.blocked, f.w));
  const missed = bestMissed(fit, taken);
  const withMissed: State = { ...state, missed };
  const s: State = { ...withMissed, beats: buildBeats(withMissed) };
  return { ...s, phase: { id: 'reveal', startedAt: now, step: 0, deadline: now + beatMs(s, 0) } };
}

/** Non-dictionary words already shown on the TV (VIP may rule on these). */
export function rulable(state: State): string[] {
  const step = state.phase.step ?? 0;
  const out: string[] = [];
  state.beats.slice(0, step + 1).forEach((b) => {
    if (b.kind !== 'player') return;
    for (const e of state.words[b.id] ?? []) if (!e.ok && !out.includes(e.w)) out.push(e.w);
  });
  return out;
}

export function reduceReveal(state: State, ev: GameEvent<Input>, next: (s: State) => State): State {
  const advanceBeat = () => {
    const i = (state.phase.step ?? 0) + 1;
    return i < state.beats.length ? nextStep(state, ev.now + beatMs(state, i)) : next(state);
  };
  if (isTimerFor(state, ev)) return advanceBeat();
  if (ev.type === 'vip' && ev.action === 'skip') return advanceBeat();
  if (ev.type === 'input' && ev.vip === true && ev.input.t === 'counts') {
    const { counts } = ev.input;
    const word = foldWord(ev.input.word);
    if (!rulable(state).includes(word) || state.counted.includes(word) === counts) return state;
    const counted = counts ? [...state.counted, word] : state.counted.filter((w) => w !== word);
    return { ...state, counted };
  }
  return state;
}
