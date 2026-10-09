import type { GameDefinition, GameEvent, GameResults, InitContext, ViewPlayer } from '../../../contract/contract.js';
import type { BotSkill } from '../../../contract/constants.js';
import type { Rng } from '../../../contract/rng.js';
import { seedRng } from '../../../contract/rng.js';
import { generateLevel, holdKey } from './generator.js';
import { evaluateLayout } from './geometry.js';
import { solveExact } from './solver.js';
import { inputSchema } from './schema.js';
import { manifest } from './manifest.js';
import type { HoldState, HoldTvView, HoldControllerView, Input, Placement, Settings } from './types.js';

const has = (s: HoldState, id: string): boolean => typeof id === 'string' && Object.hasOwn(s.players, id);
const active = (s: HoldState): string => s.order[s.seat] as string;
const available = (s: HoldState, id: string): boolean => !s.left.includes(id) && s.players[id]?.connected === true;
const clamp = (value: unknown, fallback: number, min: number, max: number): number => typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.trunc(value))) : fallback;
export function init(ctx: InitContext): HoldState {
  const settings: Settings = {
    rounds: clamp(ctx.settings.rounds, 3, 1, 3), turnSeconds: clamp(ctx.settings.turnSeconds, 45, 20, 60),
    difficulty: clamp(ctx.settings.difficulty, 4, 1, 10), allowFlip: ctx.settings.allowFlip === true,
  };
  const generated = generateLevel(seedRng(ctx.seed), settings.difficulty, settings.allowFlip);
  const order = ctx.players.map(p => p.id);
  const state: HoldState = {
    phase: { id: 'pack', startedAt: ctx.now, deadline: ctx.now + settings.turnSeconds * 1000 },
    rng: generated.rng, players: Object.fromEntries(ctx.players.map(p => [p.id, { ...p }])),
    settings, order, left: [], round: 1, seat: 0,
    level: generated.level, optimum: generated.optimum, solution: generated.solution,
    layouts: Object.fromEntries(order.map(id => [id, []])), submitted: [],
    scores: Object.fromEntries(order.map(id => [id, 0])), history: Object.fromEntries(order.map(id => [id, []])),
    seenHolds: [holdKey(generated.level.cells)],
  };
  const firstAvailable = order.findIndex(id => available(state, id));
  if (firstAvailable < 0) return enterReveal(state, ctx.now);
  return firstAvailable === 0 ? state : { ...state, seat: firstAvailable };
}
function enterDone(s: HoldState, now: number): HoldState {
  return { ...s, phase: { id: 'done', startedAt: Math.max(now, s.phase.startedAt + 1), deadline: null } };
}
function enterReveal(s: HoldState, now: number): HoldState {
  const history = Object.fromEntries(s.order.map(id => {
    const value = evaluateLayout(s.level, s.layouts[id] ?? []).value;
    return [id, [...(s.history[id] ?? []), { value, optimum: s.optimum, ratio: value / s.optimum }]];
  }));
  const scores = Object.fromEntries(s.order.map(id => [id, (history[id] ?? []).reduce((sum, row) => sum + row.ratio, 0)]));
  const startedAt = Math.max(now, s.phase.startedAt + 1);
  // Private reading SDK unavailable: conservative fallback, with a player-controlled Next.
  return { ...s, history, scores, phase: { id: 'reveal', startedAt, deadline: startedAt + 120_000 } };
}
function finishSeat(s: HoldState, now: number): HoldState {
  const submitted = s.submitted.includes(active(s)) ? s.submitted : [...s.submitted, active(s)];
  let seat = s.seat + 1;
  while (seat < s.order.length && !available(s, s.order[seat] as string)) seat++;
  if (seat === s.order.length) return enterReveal({ ...s, submitted }, now);
  const startedAt = Math.max(now, s.phase.startedAt + 1);
  return { ...s, seat, submitted, phase: { id: 'pack', startedAt, deadline: startedAt + s.settings.turnSeconds * 1000 } };
}
export function advance(s: HoldState, now: number): HoldState {
  if (s.phase.id === 'pack') return finishSeat(s, now);
  if (s.phase.id !== 'reveal') return s;
  if (s.round >= s.settings.rounds) return enterDone(s, now);
  const generated = generateLevel(s.rng, s.settings.difficulty, s.settings.allowFlip, s.seenHolds);
  let seat = 0;
  while (seat < s.order.length - 1 && !available(s, s.order[seat] as string)) seat++;
  const startedAt = Math.max(now, s.phase.startedAt + 1);
  const next: HoldState = {
    ...s, round: s.round + 1, seat, rng: generated.rng,
    level: generated.level, optimum: generated.optimum, solution: generated.solution,
    seenHolds: [...s.seenHolds, holdKey(generated.level.cells)],
    layouts: Object.fromEntries(s.order.map(id => [id, []])), submitted: [],
    phase: { id: 'pack', startedAt, deadline: startedAt + s.settings.turnSeconds * 1000 },
  };
  return available(next, active(next)) ? next : enterReveal(next, now);
}
/** Contract event order: player -> speech -> VIP -> paused -> live phase. */
export function reduce(s: HoldState, event: GameEvent<Input>): HoldState {
  if (!event || typeof event !== 'object' || !Number.isFinite(event.now)) return s;
  if (event.type === 'player') {
    if (typeof event.connected !== 'boolean' || (event.gone !== undefined && event.gone !== 'left' && event.gone !== 'kicked') || !has(s, event.playerId)) return s;
    const left = event.gone && !s.left.includes(event.playerId) ? [...s.left, event.playerId] : s.left;
    const next = { ...s, left, players: { ...s.players, [event.playerId]: { ...s.players[event.playerId]!, connected: event.gone ? false : event.connected } } };
    if (s.phase.id === 'pack' && !s.phase.paused && !available(next, active(next))) return finishSeat(next, event.now);
    return next;
  }
  if (event.type === 'speech' || event.type === 'speechStart') return s;
  if (event.type === 'vip') {
    if (event.action === 'end') return s.phase.id === 'done' ? s : enterDone(s.phase.id === 'pack' ? enterReveal(s, event.now) : s, event.now);
    if (event.action === 'skip') return advance(s, event.now);
    if (event.action === 'pause') return s.phase.paused || s.phase.deadline === null ? s : { ...s, phase: { ...s.phase, paused: { at: event.now } } };
    if (event.action === 'resume') {
      if (!s.phase.paused) return s;
      const { paused, ...phase } = s.phase;
      const next = { ...s, phase: { ...phase, deadline: phase.deadline === null ? null : phase.deadline + Math.max(0, event.now - paused.at) } };
      return next.phase.id === 'pack' && !available(next, active(next)) ? finishSeat(next, event.now) : next;
    }
    return s;
  }
  if (s.phase.paused || s.phase.id === 'done') return s;
  if (event.type === 'timer') {
    return event.phaseId === s.phase.id && event.startedAt === s.phase.startedAt && s.phase.deadline !== null && event.now >= s.phase.deadline ? advance(s, event.now) : s;
  }
  if (event.type !== 'input' || !has(s, event.playerId) || s.left.includes(event.playerId)) return s;
  const parsed = inputSchema.safeParse(event.input);
  if (!parsed.success) return s;
  const input = parsed.data;
  if (s.phase.id === 'reveal') return input.type === 'next' ? advance(s, event.now) : s;
  if (s.phase.id !== 'pack' || event.playerId !== active(s) || !available(s, event.playerId) || (s.phase.deadline !== null && event.now >= s.phase.deadline)) return s;
  const own = s.layouts[event.playerId] ?? [];
  let placements: Placement[];
  if (input.type === 'place') placements = [...own.filter(p => p.crateId !== input.placement.crateId), input.placement];
  else if (input.type === 'remove') placements = own.filter(p => p.crateId !== input.crateId);
  else if (input.type === 'clear') placements = [];
  else if (input.type === 'submit') placements = input.placements;
  else return s;
  if (!evaluateLayout(s.level, placements).valid) return s;
  const next = { ...s, layouts: { ...s.layouts, [event.playerId]: placements.map(p => ({ ...p })) } };
  return input.type === 'submit' ? finishSeat(next, event.now) : next;
}
export function tvView(s: HoldState): HoldTvView {
  const reveal = s.phase.id !== 'pack';
  const players: ViewPlayer[] = s.order.map(id => ({
    id, name: s.players[id]!.name, avatarId: s.players[id]!.avatarId, connected: s.players[id]!.connected,
    status: s.left.includes(id) ? 'spectator' : s.submitted.includes(id) ? 'submitted' : s.phase.id === 'pack' && id === active(s) ? 'active' : 'waiting',
    score: s.scores[id] ?? 0,
  }));
  return {
    gameId: manifest.id, phaseId: s.phase.id, deadline: s.phase.deadline, paused: Boolean(s.phase.paused), players,
    screen: `round-${s.round}-seat-${s.seat}`, progressStep: { unit: 'round', n: s.round, of: s.settings.rounds },
    vipSkipLabel: s.phase.id === 'pack' ? 'Finish this turn' : 'Next round',
    round: s.round, rounds: s.settings.rounds, seatId: s.phase.id === 'pack' ? active(s) : null,
    level: { ...s.level, cells: s.level.cells.map(c => [...c]), crates: s.level.crates.map(c => ({ ...c, cells: c.cells.map(cell => [...cell]) })) },
    revealed: reveal ? Object.fromEntries(s.order.map(id => [id, (s.layouts[id] ?? []).map(p => ({ ...p }))])) : {},
    roundScores: reveal ? Object.fromEntries(s.order.map(id => [id, { ...(s.history[id]?.[s.history[id]!.length - 1] ?? { value: 0, optimum: s.optimum, ratio: 0 }) }])) : {},
    ...(reveal ? { optimum: s.optimum, solution: s.solution.map(p => ({ ...p })) } : {}),
  };
}
export function controllerView(s: HoldState, playerId: string): HoldControllerView {
  const player = has(s, playerId) && !s.left.includes(playerId);
  const ownLayout = player ? (s.layouts[playerId] ?? []).map(p => ({ ...p })) : [];
  return { ...tvView(s), me: { id: playerId, role: player ? 'player' : 'spectator' }, ownLayout,
    ownValue: evaluateLayout(s.level, ownLayout).value,
    canPack: player && available(s, playerId) && s.phase.id === 'pack' && active(s) === playerId && !s.phase.paused,
  };
}
export function results(s: HoldState): GameResults | null {
  if (s.phase.id !== 'done') return null;
  const scores = Object.fromEntries(s.order.map(id => [id, s.scores[id] ?? 0]));
  const sorted = [...s.order].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || s.order.indexOf(a) - s.order.indexOf(b));
  const ranking = sorted.map((playerId, index) => ({ playerId, score: scores[playerId] ?? 0, rank: 1 + sorted.slice(0, index).filter(id => (scores[id] ?? 0) > (scores[playerId] ?? 0)).length }));
  return { scores, ranking, winnerIds: ranking.filter(row => row.rank === 1).map(row => row.playerId), awards: [] };
}
export function sampleInput(s: HoldState, playerId: string, rng: Rng, skill: BotSkill = 'normal'): Input | null {
  if (!has(s, playerId) || s.left.includes(playerId) || !available(s, playerId) || s.phase.paused) return null;
  if (s.phase.id === 'reveal') return { type: 'next' };
  if (s.phase.id !== 'pack' || active(s) !== playerId) return null;
  // Solve only the public puzzle. Never use s.solution or s.optimum.
  const solution = solveExact(s.level); const fraction = skill === 'easy' ? 0.6 : skill === 'sharp' ? 0.95 : 0.8;
  const target = solution.value * fraction; const choices = rng.shuffle(solution.placements);
  let bestValue = -1; let best: Placement[] = [];
  for (let bits = 0; bits < 2 ** choices.length; bits++) {
    const subset = choices.filter((_, i) => (bits & (1 << i)) !== 0);
    const value = evaluateLayout(s.level, subset).value;
    if (value <= target && value > bestValue) { bestValue = value; best = subset; }
  }
  return { type: 'submit', placements: best };
}
export const game: GameDefinition<HoldState, Input, HoldTvView, HoldControllerView> = {
  manifest, phases: ['pack', 'reveal', 'done'], inputSchema, init, reduce, tvView, controllerView, results,
  bot: { sampleInput },
};
