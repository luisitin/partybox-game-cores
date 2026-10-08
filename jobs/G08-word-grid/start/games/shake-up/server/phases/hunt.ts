// hunt: everyone traces words on the same grid until the clock, all-done or VIP skip.
import { isTimerFor, type GameEvent } from '@partybox/game-sdk';
import { packFor } from '../content';
import { hasWord } from '../dict';
import { isLegalPath, letterCount, wordFromPath } from '../rules';
import { MAX_ENTRIES, MAX_UNKNOWN, type Entry, type Input, type State, type VerdictKind } from '../types';

export function enterHunt(state: State, now: number): State {
  return { ...state, phase: { id: 'hunt', startedAt: now, deadline: now + state.cfg.huntMs } };
}

/** Every connected human has tapped "I'm done" (bots and away players never block). */
export function allDone(state: State): boolean {
  const live = state.order.filter((id) => !state.players[id]?.bot && !state.players[id]?.away);
  return live.length > 0 && live.every((id) => state.done[id] === true);
}

function verdict(state: State, id: string, w: string, kind: VerdictKind): State {
  const seq = state.seq + 1;
  return { ...state, seq, verdicts: { ...state.verdicts, [id]: { seq, w, kind } } };
}

function addWord(state: State, id: string, path: number[], now: number): State {
  const { grid, cfg } = state;
  if (!isLegalPath(path, cfg.size)) return state;
  const w = wordFromPath(grid, path);
  const mine = state.words[id] ?? [];
  if (letterCount(w) < cfg.minLen || mine.some((e) => e.w === w)) return state;
  const pack = packFor(cfg.lang, cfg.dictionary);
  if (!cfg.spicy && hasWord(pack.blocked, w)) return verdict(state, id, w, 'blocked');
  const ok = hasWord(pack.words, w);
  if (mine.length >= MAX_ENTRIES || (!ok && mine.filter((e) => !e.ok).length >= MAX_UNKNOWN)) return verdict(state, id, w, 'full');
  const entry: Entry = { w, p: path.slice(), t: Math.max(0, now - state.phase.startedAt - state.pausedMs), ok };
  // UTF-8's largest legal face here is ñ (2 bytes). Include both word copies, path/time,
  // record id and verdict overhead; a 96 KB submission allowance leaves room for plans/logs.
  const bytes = JSON.stringify(entry).length * 2 + id.length * 2 + 80;
  if (state.submissionBytes + bytes > 96 * 1024) return verdict(state, id, w, 'full');
  const withWord = { ...state, submissionBytes: state.submissionBytes + bytes, words: { ...state.words, [id]: [...mine, entry] } };
  const v = verdict(withWord, id, w, ok ? 'ok' : 'unknown');
  return ok && letterCount(w) >= 7 ? { ...v, toast: { id, len: letterCount(w), seq: v.seq } } : v;
}

export function reduceHunt(state: State, ev: GameEvent<Input>, next: (s: State) => State): State {
  if (isTimerFor(state, ev)) return next(state);
  if (ev.type === 'vip' && ev.action === 'skip') return next(state);
  if (ev.type !== 'input' || !state.order.includes(ev.playerId) || state.players[ev.playerId]?.away) return state;
  const id = ev.playerId;
  const inp = ev.input;
  if (inp.t === 'word') return state.done[id] === true ? state : addWord(state, id, inp.path, ev.now);
  if (inp.t === 'done') {
    if ((state.done[id] === true) === inp.done) return state;
    const done = inp.done ? { ...state.done, [id]: true as const } : { ...state.done };
    if (!inp.done) delete done[id];
    const s = { ...state, done };
    return allDone(s) ? next(s) : s;
  }
  return state;
}
