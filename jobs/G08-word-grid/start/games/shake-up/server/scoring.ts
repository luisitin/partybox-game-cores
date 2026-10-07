// Pure scoring: judging a round, applying it, and the final results.
import { letterCount, pointsFor } from './rules';
import type { Entry, RoundLog, State } from './types';

export type Status = 'unique' | 'counted' | 'shared' | 'unknown';
export type Judged = { w: string; p: number[]; len: number; pts: number; status: Status; with: string[] };

export function isSolo(state: State): boolean {
  return state.order.length === 1;
}

/** Who found each word this round (seat order). */
export function findersByWord(state: State): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const id of state.order) {
    for (const e of state.words[id] ?? []) {
      const list = m.get(e.w);
      if (list) list.push(id);
      else m.set(e.w, [id]);
    }
  }
  return m;
}

function judgeEntry(e: Entry, id: string, finders: Map<string, string[]>, counted: readonly string[], solo: boolean): Judged {
  const others = (finders.get(e.w) ?? []).filter((x) => x !== id);
  const len = letterCount(e.w);
  if (!solo && others.length > 0) return { w: e.w, p: e.p, len, pts: 0, status: 'shared', with: others };
  if (e.ok) return { w: e.w, p: e.p, len, pts: pointsFor(e.w), status: 'unique', with: [] };
  if (counted.includes(e.w)) return { w: e.w, p: e.p, len, pts: pointsFor(e.w), status: 'counted', with: [] };
  return { w: e.w, p: e.p, len, pts: 0, status: 'unknown', with: [] };
}

/** One player's list, judged, best first (points, then length, then word). */
export function judgePlayer(state: State, id: string, finders = findersByWord(state)): Judged[] {
  const solo = isSolo(state);
  const out = (state.words[id] ?? []).map((e) => judgeEntry(e, id, finders, state.counted, solo));
  const rank = (j: Judged) => (j.status === 'unique' || j.status === 'counted' ? 0 : j.status === 'unknown' ? 1 : 2);
  out.sort((a, b) => rank(a) - rank(b) || b.pts - a.pts || b.len - a.len || (a.w < b.w ? -1 : a.w > b.w ? 1 : 0));
  return out;
}

export function roundPoints(state: State): Record<string, number> {
  const finders = findersByWord(state);
  const pts: Record<string, number> = {};
  for (const id of state.order) pts[id] = judgePlayer(state, id, finders).reduce((s, j) => s + j.pts, 0);
  return pts;
}

export function leaders(order: readonly string[], scores: Record<string, number>): string[] {
  let top = 0;
  for (const id of order) top = Math.max(top, scores[id] ?? 0);
  return top === 0 ? [] : order.filter((id) => (scores[id] ?? 0) === top);
}

/** Scores the round into totals and the log. Called once, on entering tally. Scores never go down. */
export function applyRound(state: State): State {
  const finders = findersByWord(state);
  const log: RoundLog = { round: state.round, points: {}, unique: {}, shared: {}, counted: {}, best: {}, firstMs: {}, missed: state.missed?.w ?? null };
  const scores = { ...state.scores };
  for (const id of state.order) {
    const judged = judgePlayer(state, id, finders);
    const pts = judged.reduce((s, j) => s + j.pts, 0);
    log.points[id] = pts;
    log.unique[id] = judged.filter((j) => j.status === 'unique' || j.status === 'counted').length;
    log.shared[id] = judged.filter((j) => j.status === 'shared').length;
    log.counted[id] = judged.filter((j) => j.status === 'counted').length;
    const best = judged.find((j) => j.pts > 0);
    if (best) log.best[id] = best.w;
    const firsts = (state.words[id] ?? []).filter((e) => e.ok).map((e) => e.t);
    if (firsts.length) log.firstMs[id] = Math.min(...firsts);
    scores[id] = (scores[id] ?? 0) + pts;
  }
  return { ...state, scores, log: [...state.log, log], leadersBefore: leaders(state.order, state.scores) };
}
