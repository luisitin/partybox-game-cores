// Shake Up: game definition. This file owns phase ORDER (advance) and the
// non-phase events (players, VIP pause/resume/end).
import {
  boolSetting,
  composeReduce,
  hasPlayer,
  numberSetting,
  seedRng,
  selectSetting,
  type GameDefinition,
  type GameEvent,
  type InitCtx,
  type Manifest,
} from '@partybox/game-sdk';
import manifestJson from '../manifest.json';
import { bot } from './bot';
import { asLang } from './content';
import { enterHunt, allDone, reduceHunt } from './phases/hunt';
import { enterReveal, reduceReveal } from './phases/reveal';
import { enterShake, reduceShake } from './phases/shake';
import { enterTally, reduceTally } from './phases/tally';
import { results } from './results';
import { minLength } from './rules';
import { applyRound } from './scoring';
import { speech, speechCatalog } from './speech';
import { PHASES, inputSchema, type Input, type Player, type State } from './types';
import { controllerView, tvView, type ControllerView, type TvView } from './views';

export const manifest = manifestJson as unknown as Manifest;

export function init(ctx: InitCtx): State {
  const s = ctx.settings;
  const size = selectSetting(s, 'grid', ['4x4', '5x5'] as const, '4x4') === '5x5' ? 5 : 4;
  const players: Record<string, Player> = {};
  const scores: Record<string, number> = {};
  ctx.players.forEach((p, seat) => {
    players[p.id] = { id: p.id, name: p.name, bot: p.isBot === true, away: false, seat };
    scores[p.id] = 0;
  });
  const base: State = {
    phase: { id: 'shake', startedAt: ctx.now },
    rng: seedRng(ctx.seed),
    cfg: {
      rounds: numberSetting(s, 'rounds', 3, 1, 5),
      huntMs: Number(selectSetting(s, 'huntSeconds', ['90', '120', '180', '240'] as const, '180')) * 1000,
      size,
      minLen: minLength(size),
      spicy: boolSetting(s, 'spicy', false),
      lang: asLang(ctx.contentLang),
      reader: typeof s.reader === 'string' ? s.reader : 'host-hype',
      mode: ctx.presence?.mode ?? 'together',
    },
    order: ctx.players.map((p) => p.id),
    players,
    round: 0,
    grid: [],
    cubes: [],
    throwSeed: 0,
    words: {},
    done: {},
    verdicts: {},
    seq: 0,
    counted: [],
    beats: [],
    missed: null,
    pausedMs: 0,
    scores,
    log: [],
    leadersBefore: [],
  };
  return enterShake(base, ctx.now);
}

export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'shake': return enterHunt(state, now);
    case 'hunt': return enterReveal(state, now);
    case 'reveal': return enterTally(state, now);
    case 'tally': return state.round < state.cfg.rounds ? enterShake(state, now) : finish(state, now);
    default: return state;
  }
}

function finish(state: State, now: number): State {
  return { ...state, phase: { id: 'done', startedAt: now } };
}

/** VIP end: a round already revealed still counts; then straight to results. */
export function end(state: State, now: number): State {
  if (state.phase.id === 'done') return state;
  const scored = state.phase.id === 'reveal' ? applyRound(state) : state;
  return finish(scored, now);
}

type PlayerEv = Extract<GameEvent<Input>, { type: 'player' }>;

export function onPlayer(state: State, ev: PlayerEv, next: (s: State) => State): State {
  const id = ev.playerId;
  if (!hasPlayer(state.players, id)) {
    if (!ev.connected || state.phase.id === 'done') return state;
    // Late joiner: in at once with the grid and clock as they stand; score starts at 0.
    const seat = state.order.length;
    const p: Player = { id, name: ev.name ?? '', bot: false, away: false, seat };
    return {
      ...state,
      order: [...state.order, id],
      players: { ...state.players, [id]: p },
      scores: { ...state.scores, [id]: 0 },
      words: { ...state.words, [id]: [] },
    };
  }
  const cur = state.players[id] as Player;
  const away = !ev.connected;
  if (cur.away === away) return state;
  const s = { ...state, players: { ...state.players, [id]: { ...cur, away } } };
  // "Everyone done" ignores away players, so a drop can close the hunt.
  return s.phase.id === 'hunt' && !s.paused && allDone(s) ? next(s) : s;
}

type VipEv = Extract<GameEvent<Input>, { type: 'vip' }>;

/** Pause bookkeeping for our own clock (word times exclude pauses), then recheck all-done. */
export function afterVip(state: State, ev: VipEv, prev: State): State {
  if (ev.action === 'resume' && prev.paused && state.phase.id === 'hunt') {
    const s = { ...state, pausedMs: state.pausedMs + Math.max(0, ev.now - prev.paused.at) };
    return allDone(s) ? advance(s, ev.now) : s;
  }
  return state;
}

export const reduce = composeReduce<State, Input>({
  phases: { shake: reduceShake, hunt: reduceHunt, reveal: reduceReveal, tally: reduceTally },
  advance,
  end,
  onPlayer,
  afterVip,
});

export const game: GameDefinition<State, Input, TvView, ControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView,
  results,
  bot,
  speech,
  speechCatalog,
  recap: (state) => {
    const r = results(state);
    return [r.headline ?? '', r.headlineNote ?? ''].filter(Boolean);
  },
};
