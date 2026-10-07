// tally: the round is scored, the longest unique word is spotlit, the board climbs.
import { isTimerFor, readingMs, type GameEvent } from '@partybox/game-sdk';
import { tallyLine, wordCount } from '../lines';
import { applyRound } from '../scoring';
import type { Input, State } from '../types';

const CLIMB_MS = 760; // camera pan into the board (shell)
const STAGGER_MS = 120;

export function enterTally(state: State, now: number): State {
  const s = applyRound(state);
  const ms = readingMs(wordCount(tallyLine(s).text) + 4, { lang: s.cfg.lang }) + CLIMB_MS + STAGGER_MS * s.order.length;
  return { ...s, phase: { id: 'tally', startedAt: now, deadline: now + Math.max(6000, ms) } };
}

export function reduceTally(state: State, ev: GameEvent<Input>, next: (s: State) => State): State {
  if (isTimerFor(state, ev)) return next(state);
  if (ev.type === 'vip' && ev.action === 'skip') return next(state);
  return state;
}
