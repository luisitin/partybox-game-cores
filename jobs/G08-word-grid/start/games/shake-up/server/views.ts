// Views. The TV sees counts during the hunt, never words; each phone sees only
// its own words until the TV has revealed them. Secrets are omitted, never null.
import type { Award } from '@partybox/game-sdk';
import { beatLine, goLine, lastCallLine, shakeLine, tallyLine, type Line } from './lines';
import { CARD_WORDS, rulable } from './phases/reveal';
import { bestMissed, longestWord, results } from './results';
import { findersByWord, judgePlayer, type Judged, type Status } from './scoring';
import { letterCount, pointsFor, showFace, showWord } from './rules';
import { SHAKE_MS, type PhaseId, type State } from './types';

export type PlayerRow = { id: string; name: string; avatarId?: string; connected?: boolean; status?: 'active' | 'submitted' | 'waiting' | 'spectator'; seat: number; bot: boolean; away: boolean; score: number };
export type CardWord = { w: string; len: number; pts: number; status: Status; with: string[] };
/** What a card leaves off: scoring words with their points (so the shown numbers add up to the total), and shared ones. */
export type CardMore = { words: number; pts: number; shared: number };
export type BeatView =
  | { kind: 'player'; id: string; total: number; words: CardWord[]; more: CardMore; glow: number[] }
  | { kind: 'empty'; ids: string[]; all: boolean }
  | { kind: 'missed'; w: string; len: number; glow: number[] };
export type TallyRow = { id: string; before: number; gained: number; after: number; place: number };
export type TallyView = { rows: TallyRow[]; spotlight?: { id: string; w: string; len: number; pts: number; tied?: string[] } };

type Common = {
  gameId: string;
  phaseId: string;
  phase: PhaseId;
  round: number;
  rounds: number;
  size: number;
  minLen: number;
  lang: string;
  dictionary: 'full' | 'common';
  grid: string[];
  players: (PlayerRow & { avatarId: string; connected: boolean; status: 'active' | 'submitted' | 'waiting' | 'spectator' })[];
  paused: boolean;
  /** End of the current phase or beat (server clock). Omitted when the phase has none. */
  deadline: number | null;
  /** The line the reader says now (text always shown). Omitted when none. */
  say?: Line;
  /** Shake only: when the roll began on the server clock (pauses already added) and how long the phase runs. */
  roll?: { at: number; ms: number };
};

export type TvView = Common & {
  throwSeed: number;
  cubes: string[][];
  hunt?: { counts: Record<string, number>; done: string[]; toast?: { id: string; len: number; seq: number }; lastCall: Line };
  reveal?: { step: number; total: number; beat: BeatView; next: string[] };
  tally?: TallyView;
};

export type MyWord = { w: string; ok: boolean; pts: number };
export type ControllerView = Common & {
  me: { id: string; role: 'player' | 'spectator'; score: number; done: boolean; words: MyWord[]; verdict?: { seq: number; w: string; kind: string } };
  waitingOn?: number;
  /** rulable: the dictionary misses the VIP may rule on, each with who found it. */
  reveal?: { step: number; total: number; beat: BeatView; mineShown: boolean; rulable: { w: string; by: string[] }[]; counted: string[] };
  tally?: TallyView & { mine?: { gained: number; unique: number; shared: number; best?: string; place: number; total: number } };
  /** Done only: what the TV's results say, so a phone's last screen can say it too (content language). */
  final?: FinalView;
};

export type FinalView = { headline: string; awards: Award[]; longest?: { id: string; w: string; len: number }; missed?: { w: string; len: number } };

function common(state: State): Common {
  const players = state.order.map((id) => {
    const p = state.players[id];
    return { id, name: p?.name ?? '', avatarId: p?.avatarId ?? '', connected: p?.connected ?? false, status: (state.phase.id === 'hunt' ? (state.done[id] === true ? 'submitted' : 'active') : 'waiting') as 'active' | 'submitted' | 'waiting', seat: p?.seat ?? 0, bot: p?.bot ?? false, away: p?.away ?? false, score: state.scores[id] ?? 0 };
  });
  const c: Common = {
    gameId: 'shake-up',
    phaseId: state.phase.id,
    phase: state.phase.id,
    round: state.round,
    rounds: state.cfg.rounds,
    size: state.cfg.size,
    minLen: state.cfg.minLen,
    lang: state.cfg.lang,
    dictionary: state.cfg.dictionary,
    grid: state.grid.map(showFace),
    players,
    paused: state.phase.paused !== undefined,
    deadline: state.phase.deadline,
  };
  if (state.phase.id === 'shake' && state.phase.deadline !== null) c.roll = { at: state.phase.deadline - SHAKE_MS, ms: SHAKE_MS };
  const say = currentLine(state);
  return say ? { ...c, say } : c;
}

function currentLine(state: State): Line | null {
  const step = state.phase.step ?? 0;
  switch (state.phase.id) {
    case 'shake': return shakeLine(state);
    case 'hunt': return goLine(state);
    case 'reveal': { const b = state.beats[step]; return b ? beatLine(state, b, step) : null; }
    case 'tally': return tallyLine(state);
    default: return null;
  }
}

function beatView(state: State, step: number): BeatView | null {
  const beat = state.beats[step];
  if (!beat) return null;
  if (beat.kind === 'missed') {
    const m = state.missed;
    return { kind: 'missed', w: showWord(m?.w ?? ''), len: [...(m?.w ?? '')].length, glow: m?.path.slice() ?? [] };
  }
  if (beat.kind === 'empty') return { kind: 'empty', ids: beat.ids, all: beat.ids.length === state.order.length };
  const judged = judgePlayer(state, beat.id, findersByWord(state));
  const { shown, more } = cardWords(judged);
  const words = shown.map((j) => ({ w: showWord(j.w), len: j.len, pts: j.pts, status: j.status, with: j.with }));
  // The tray glows the best word that scores (as the reader names it); a card with nothing scoring glows nothing.
  const top = judged.find((j) => j.pts > 0);
  return { kind: 'player', id: beat.id, total: judged.reduce((s, j) => s + j.pts, 0), words, more, glow: top ? top.p.slice() : [] };
}

/**
 * The words a card lists (at most CARD_WORDS, in judged order). Dictionary misses and VIP-counted words
 * always show: they are what the VIP rules on, so every ruling moves a chip the room can see. The best
 * unique words fill the room left, then shared ones. What is left off is counted, with its points.
 */
export function cardWords(judged: Judged[]): { shown: Judged[]; more: CardMore } {
  const ruled = judged.filter((j) => j.status === 'unknown' || j.status === 'counted');
  const unique = judged.filter((j) => j.status === 'unique');
  const shared = judged.filter((j) => j.status === 'shared');
  const u = Math.min(unique.length, Math.max(0, CARD_WORDS - ruled.length));
  const sh = Math.min(shared.length, Math.max(0, CARD_WORDS - ruled.length - u));
  const keep = new Set([...ruled, ...unique.slice(0, u), ...shared.slice(0, sh)]);
  const left = unique.slice(u);
  return { shown: judged.filter((j) => keep.has(j)), more: { words: left.length, pts: left.reduce((s, j) => s + j.pts, 0), shared: shared.length - sh } };
}

function tallyView(state: State): TallyView {
  const last = state.log[state.log.length - 1];
  const rows = state.order.map((id) => {
    const gained = last?.points[id] ?? 0;
    const after = state.scores[id] ?? 0;
    return { id, before: after - gained, gained, after, place: 0 };
  });
  const sorted = rows.slice().sort((a, b) => b.after - a.after || state.order.indexOf(a.id) - state.order.indexOf(b.id));
  sorted.forEach((r, k) => { r.place = k > 0 && r.after === (sorted[k - 1] as TallyRow).after ? (sorted[k - 1] as TallyRow).place : k + 1; });
  let spotlight: TallyView['spotlight'];
  for (const id of state.order) {
    const w = last?.best[id];
    if (w && (!spotlight || [...w].length > spotlight.len)) spotlight = { id, w: showWord(w), len: [...w].length, pts: pointsFor(w) };
  }
  // Others whose longest unique word is as long, in seat order (sent only when there are any).
  const sp = spotlight;
  const tied = sp ? state.order.filter((id) => id !== sp.id && [...(last?.best[id] ?? '')].length === sp.len) : [];
  if (sp && tied.length) sp.tied = tied;
  return spotlight ? { rows: sorted, spotlight } : { rows: sorted };
}

export function tvView(state: State): TvView {
  const v: TvView = { ...common(state), throwSeed: state.throwSeed, cubes: state.cubes.map((c) => c.map(showFace)) };
  if (state.phase.id === 'hunt') {
    const counts: Record<string, number> = Object.fromEntries(state.order.map(id => [id, state.words[id]?.length ?? 0]));
    const hunt: NonNullable<TvView['hunt']> = { counts, done: state.order.filter((id) => state.done[id] === true), lastCall: lastCallLine(state) };
    v.hunt = state.toast ? { ...hunt, toast: state.toast } : hunt;
  }
  if (state.phase.id === 'reveal') {
    const step = state.phase.step ?? 0;
    const beat = beatView(state, step);
    const next = state.beats.slice(step + 1).map((b) => (b.kind === 'player' ? b.id : b.kind));
    if (beat) v.reveal = { step, total: state.beats.length, beat, next };
  }
  if (state.phase.id === 'tally' || state.phase.id === 'done') v.tally = tallyView(state);
  return v;
}

function finalView(state: State): FinalView {
  const r = results(state);
  const f: FinalView = { headline: r.headline ?? '', awards: r.awards };
  const lw = longestWord(state);
  if (lw) f.longest = { id: lw.playerId, w: showWord(lw.word), len: letterCount(lw.word) };
  const missed = bestMissed(state);
  if (missed) f.missed = { w: showWord(missed), len: letterCount(missed) };
  return f;
}

export function controllerView(state: State, playerId: string): ControllerView {
  const playing = Object.hasOwn(state.players, playerId);
  const words = (playing ? state.words[playerId] ?? [] : []).map((e) => ({ w: showWord(e.w), ok: e.ok, pts: e.ok ? pointsFor(e.w) : 0 }));
  const verdict = playing && Object.hasOwn(state.verdicts, playerId) ? state.verdicts[playerId] : undefined;
  const me: ControllerView['me'] = { id: playerId, role: playing ? 'player' : 'spectator', score: playing ? state.scores[playerId] ?? 0 : 0, done: playing && state.done[playerId] === true, words: words.slice().reverse() };
  const v: ControllerView = { ...common(state), me: verdict ? { ...me, verdict: { ...verdict, w: showWord(verdict.w) } } : me };
  if (state.phase.id === 'hunt') {
    v.waitingOn = state.order.filter((id) => !state.players[id]?.bot && !state.players[id]?.away && !state.done[id]).length;
  }
  if (state.phase.id === 'reveal') {
    const step = state.phase.step ?? 0;
    const beat = beatView(state, step);
    const mineAt = state.beats.findIndex((b) => (b.kind === 'player' && b.id === playerId) || (b.kind === 'empty' && b.ids.includes(playerId)));
    if (beat) {
      const finders = findersByWord(state);
      const rule = rulable(state).map((w) => ({ w: showWord(w), by: finders.get(w) ?? [] }));
      v.reveal = { step, total: state.beats.length, beat, mineShown: mineAt >= 0 && mineAt <= step, rulable: rule, counted: state.counted.map(showWord) };
    }
  }
  if (state.phase.id === 'done') v.final = finalView(state);
  if (state.phase.id === 'tally' || state.phase.id === 'done') {
    const t = tallyView(state);
    const last = state.log[state.log.length - 1];
    const row = t.rows.find((r) => r.id === playerId);
    if (row && last) {
      const best = last.best[playerId];
      const mine = { gained: row.gained, unique: last.unique[playerId] ?? 0, shared: last.shared[playerId] ?? 0, place: row.place, total: row.after };
      v.tally = { ...t, mine: best ? { ...mine, best: showWord(best) } : mine };
    } else v.tally = t;
  }
  return v;
}
