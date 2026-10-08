import type { GameDefinition, GameEvent, GameResults, InitContext, ViewPlayer } from '../../../contract/contract.js';
import type { BotSkill } from '../../../contract/constants.js';
import type { Rng } from '../../../contract/rng.js';
import { nextInt, seedRng, shuffle } from '../../../contract/rng.js';
import { deckFor, legalCards, passingOffset, penalty, settleHand, suit, trickWinner } from './rules.js';
import { inputSchema } from './input.js';
import { manifest } from './manifest.js';
import { chooseBot } from './bot.js';
import type { Card, HeartsController, HeartsState, HeartsTv, Input, Settings } from './types.js';

const has = (s: HeartsState, id: string): boolean => Object.hasOwn(s.players, id);
const available = (s: HeartsState, id: string): boolean => has(s, id) && !s.left.includes(id) && s.players[id]!.connected;
const records = (order: readonly string[]): Record<string, Card[]> => Object.fromEntries(order.map(id => [id, []]));
const bounded = (v: unknown, fallback: number, min: number, max: number): number => typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.trunc(v))) : fallback;
function phase(s: HeartsState, id: string, now: number, ms: number | null): HeartsState['phase'] {
  const startedAt = Math.max(now || 0, s.phase.startedAt + 1);
  return { id, startedAt, deadline: ms === null ? null : startedAt + ms };
}
const hasHuman = (s: HeartsState): boolean => s.order.some(id => available(s,id) && !s.players[id]!.bot);
const turnMs = (s: HeartsState): number | null => s.settings.turnSeconds ? s.settings.turnSeconds * 1000 : null;
function beginPlay(s: HeartsState, now: number): HeartsState {
  const actor = s.order.find(id => s.hands[id]!.includes(s.opening))!;
  return { ...s, actor, phase: phase(s, 'play', now, turnMs(s)) };
}
function deal(s: HeartsState, now: number): HeartsState {
  const deck = deckFor(s.order.length, s.settings.threeDeck);
  const [cards, rng] = shuffle(s.rng, deck);
  const hands = records(s.order);
  cards.forEach((card, i) => hands[s.order[(s.dealer + 1 + i) % s.order.length]!]!.push(card));
  for (const id of s.order) hands[id]!.sort((a, b) => a - b);
  const passOffset = passingOffset(s.handNumber, s.order.length, s.settings.noPass);
  const next: HeartsState = {
    ...s, rng, hands, passes: {}, sent: {}, received: {}, passOffset,
    opening: Math.min(...deck.filter(c => suit(c) === 0)), actor: s.order[0]!, trick: [], lastTrick: [], lastWinner: null,
    trickNumber: 0, played: [], captured: records(s.order), heartsBroken: false, handScored: false,
    phase: phase(s, 'pass', now, turnMs(s)),
  };
  return passOffset === 0 ? beginPlay(next, now) : next;
}
export function init(ctx: InitContext): HeartsState {
  const order = ctx.players.map(p => p.id);
  if (order.length < 3 || order.length > 6 || new Set(order).size !== order.length) throw new RangeError('Hearts requires 3–6 distinct seats');
  const settings: Settings = {
    target: Math.max(25, Math.min(200, Math.round(bounded(ctx.settings.target, 100, 25, 200) / 25) * 25)),
    moon: ctx.settings.moon === 'subtract' ? 'subtract' : 'add', jack: ctx.settings.jack === true,
    noPass: ctx.settings.noPass === true, queenBreaks: ctx.settings.queenBreaks === true,
    threeDeck: ctx.settings.threeDeck === 'clubs' ? 'clubs' : 'diamonds', turnSeconds: bounded(ctx.settings.turnSeconds, 0, 0, 60),
  };
  const [dealer, rng] = nextInt(seedRng(ctx.seed), 0, order.length - 1);
  const base: HeartsState = {
    phase: { id: 'pass', startedAt: ctx.now - 2, deadline: null }, rng, players: Object.fromEntries(ctx.players.map(p => [p.id, { id:p.id,name:p.name,avatarId:p.avatarId,connected:p.connected,...(typeof p.bot==='boolean'?{bot:p.bot}:{}),...(typeof p.canSeeTv==='boolean'?{canSeeTv:p.canSeeTv}:{}) }])),
    settings, order, left: [], handNumber: 1, dealer, hands: records(order), passes: {}, sent: {}, received: {},
    passOffset: 0, opening: 0, actor: order[0]!, trick: [], lastTrick: [], lastWinner: null,
    trickNumber: 0, played: [], captured: records(order), heartsBroken: false,
    scores: Object.fromEntries(order.map(id => [id, 0])), handScored: false, history: [],
  };
  return deal(base, ctx.now);
}
function passCards(s: HeartsState, id: string, cards: readonly Card[], now: number): HeartsState {
  if (s.phase.id !== 'pass' || Object.hasOwn(s.passes, id) || cards.length !== 3 || new Set(cards).size !== 3 || cards.some(c => !s.hands[id]?.includes(c))) return s;
  const passes = { ...s.passes, [id]: [...cards] };
  const actor = s.order.find(player => !Object.hasOwn(passes, player));
  if (actor !== undefined) return { ...s, passes, actor, phase: phase(s, 'pass', now, turnMs(s)) };
  const n = s.order.length;
  const received = Object.fromEntries(s.order.map((player, i) => [player, [...passes[s.order[(i - s.passOffset + n) % n]!]!]]));
  const hands = Object.fromEntries(s.order.map(player => [player, [...s.hands[player]!.filter(c => !passes[player]!.includes(c)), ...received[player]!].sort((a, b) => a - b)]));
  return beginPlay({ ...s, passes, sent: passes, received, hands }, now);
}
function playCard(s: HeartsState, id: string, card: Card, now: number): HeartsState {
  if (s.phase.id !== 'play' || id !== s.actor || !legalCards(s.hands[id] ?? [], s.trick, s.trickNumber === 0, s.heartsBroken, s.opening).includes(card)) return s;
  const hands = { ...s.hands, [id]: s.hands[id]!.filter(c => c !== card) };
  const trick = [...s.trick, { playerId: id, card }];
  const played = [...s.played, { playerId: id, card }];
  const heartsBroken = s.heartsBroken || suit(card) === 3 || (s.settings.queenBreaks && card === 36);
  if (trick.length < s.order.length) {
    const actor = s.order[(s.order.indexOf(id) + 1) % s.order.length]!;
    return { ...s, hands, trick, played, heartsBroken, actor, phase: phase(s, 'play', now, turnMs(s)) };
  }
  const winner = trickWinner(trick)!;
  const captured = { ...s.captured, [winner]: [...s.captured[winner]!, ...trick.map(p => p.card)] };
  // Human tables control reading pace explicitly; unattended bot tables have a data timer.
  return { ...s, hands, trick, played, heartsBroken, actor: winner, captured, lastTrick: trick, lastWinner: winner, phase: phase(s, 'trick', now, hasHuman(s) ? null : 12_000) };
}
function scoreCurrent(s: HeartsState): HeartsState {
  if (s.handScored) return s;
  const result = settleHand(s.order, s.captured, s.settings.moon, s.settings.jack);
  const scores = Object.fromEntries(s.order.map(id => [id, s.scores[id]! + result.points[id]!]));
  return { ...s, scores, handScored: true, history: [...s.history, { hand: s.handNumber, ...result }].slice(-8) };
}
function finishGame(s: HeartsState, now: number): HeartsState {
  const scored = scoreCurrent(s);
  return { ...scored, phase: phase(scored, 'done', now, null) };
}
function advanceOne(s: HeartsState, now: number): HeartsState {
  if (s.phase.id === 'pass') return passCards(s, s.actor, s.hands[s.actor]!.slice(-3), now);
  if (s.phase.id === 'play') return playCard(s, s.actor, legalCards(s.hands[s.actor]!, s.trick, s.trickNumber === 0, s.heartsBroken, s.opening)[0]!, now);
  if (s.phase.id === 'trick') {
    if (s.order.every(id => s.hands[id]!.length === 0)) {
      const scored = scoreCurrent(s);
      return { ...scored, phase: phase(scored, 'hand', now, hasHuman(s) ? null : 120_000) };
    }
    return { ...s, trick: [], trickNumber: s.trickNumber + 1, actor: s.lastWinner!, phase: phase(s, 'play', now, turnMs(s)) };
  }
  if (s.phase.id === 'hand') {
    if (s.order.some(id => s.scores[id]! >= s.settings.target)) return finishGame(s, now);
    return deal({ ...s, handNumber: s.handNumber + 1, dealer: (s.dealer + 1) % s.order.length }, now);
  }
  return s;
}
function drainMissing(s: HeartsState, now: number): HeartsState {
  let next = s;
  // Empty classic rooms persist until explicit VIP end; otherwise retain each
  // departed seat through a deterministic legal takeover, never delete scores.
  if (!s.order.some(id => available(s, id))) return s;
  for (let step = 0; step < s.order.length && !next.phase.paused && (next.phase.id === 'pass' || next.phase.id === 'play') && !available(next, next.actor); step++) next = advanceOne(next, now);
  return next;
}
export function advance(s: HeartsState, now: number): HeartsState { return drainMissing(advanceOne(s, now), now); }
export function reduce(s: HeartsState, event: GameEvent<Input>): HeartsState {
  if (!event || !Number.isFinite(event.now)) return s;
  if ((event.type === 'input' || event.type === 'player') && typeof event.playerId !== 'string') return s;
  if (event.type === 'player') {
    if (!has(s, event.playerId) || typeof event.connected !== 'boolean' || (event.gone !== undefined && event.gone !== 'left' && event.gone !== 'kicked')) return s;
    const left = event.gone && !s.left.includes(event.playerId) ? [...s.left, event.playerId] : s.left;
    const next = { ...s, left, players: { ...s.players, [event.playerId]: { ...s.players[event.playerId]!, connected: event.gone ? false : event.connected } } };
    return s.phase.paused ? next : drainMissing(next, event.now);
  }
  if (event.type === 'speech' || event.type === 'speechStart') return s;
  if (event.type === 'vip') {
    if (event.action === 'end') return s.phase.id === 'done' ? s : finishGame(s, event.now);
    if (event.action === 'skip') return advance(s, event.now);
    if (event.action === 'pause') return s.phase.paused || s.phase.id === 'done' ? s : { ...s, phase: { ...s.phase, paused: { at: event.now || 0 } } };
    if (event.action === 'resume') {
      if (!s.phase.paused) return s;
      const { paused, ...info } = s.phase;
      const next = { ...s, phase: { ...info, deadline: info.deadline === null ? null : info.deadline + Math.max(0, event.now - paused.at) } };
      return drainMissing(next, event.now);
    }
    return s;
  }
  if (s.phase.paused || s.phase.id === 'done') return s;
  if (event.type === 'timer') return event.phaseId === s.phase.id && event.startedAt === s.phase.startedAt && s.phase.deadline !== null && event.now >= s.phase.deadline ? advance(s, event.now) : s;
  if (event.type !== 'input' || !has(s, event.playerId) || !available(s, event.playerId)) return s;
  const parsed = inputSchema.safeParse(event.input);
  if (!parsed.success || (s.phase.deadline !== null && event.now >= s.phase.deadline)) return s;
  const input = parsed.data;
  if (input.type === 'next') return s.phase.id === 'trick' || s.phase.id === 'hand' ? advance(s, event.now) : s;
  const next = input.type === 'pass' ? passCards(s, event.playerId, input.cards.map(c => c || 0), event.now) : playCard(s, event.playerId, input.card || 0, event.now);
  return next === s ? s : drainMissing(next, event.now);
}
export function tvView(s: HeartsState): HeartsTv {
  const players: ViewPlayer[] = s.order.map(id => ({ id, name: s.players[id]!.name, avatarId: s.players[id]!.avatarId, connected: s.players[id]!.connected, status: s.left.includes(id) ? 'spectator' : s.phase.id === 'pass' && Object.hasOwn(s.passes, id) ? 'submitted' : (s.phase.id === 'pass' || s.phase.id === 'play') && s.actor === id ? 'active' : 'waiting', score: s.scores[id]! }));
  const copy = (plays: HeartsState['played']) => plays.map(p => ({ ...p }));
  const last = s.history.at(-1);
  return {
    gameId: manifest.id, phaseId: s.phase.id, deadline: s.phase.deadline, paused: Boolean(s.phase.paused), players,
    screen: `hand-${s.handNumber}-trick-${s.trickNumber}-${s.actor}`, vipSkipLabel: s.phase.id === 'pass' ? 'Choose the next pass' : s.phase.id === 'play' ? 'Play the next legal card' : 'Continue',
    handNumber: s.handNumber, actor: s.phase.id === 'pass' || s.phase.id === 'play' ? s.actor : null, passOffset: s.passOffset, opening: s.opening, trickNumber: s.trickNumber,
    trick: copy(s.trick), lastTrick: copy(s.lastTrick), lastWinner: s.lastWinner, played: copy(s.played),
    handCounts: Object.fromEntries(s.order.map(id => [id, s.hands[id]!.length])), takenPoints: Object.fromEntries(s.order.map(id => [id, s.captured[id]!.reduce((n,c) => n+penalty(c),0)])), scores: { ...s.scores },
    heartsBroken: s.heartsBroken, settings: { ...s.settings }, lastHand: last ? { ...last, points: { ...last.points } } : null,
  };
}
export function controllerView(s: HeartsState, playerId: string): HeartsController {
  const player = has(s, playerId) && !s.left.includes(playerId);
  const hand = player ? [...s.hands[playerId]!] : [];
  const passed = player && Object.hasOwn(s.sent, playerId);
  const i = s.order.indexOf(playerId);
  return {
    ...tvView(s), me: { id: playerId, role: player ? 'player' : 'spectator' }, hand,
    legal: player && available(s, playerId) && s.phase.id === 'play' && s.actor === playerId && !s.phase.paused ? legalCards(hand, s.trick, s.trickNumber === 0, s.heartsBroken, s.opening) : [],
    canPass: player && available(s, playerId) && s.phase.id === 'pass' && !Object.hasOwn(s.passes, playerId) && !s.phase.paused,
    ownPass: player ? [...(s.passes[playerId] ?? [])] : [],
    ...(passed ? { sentTo: s.order[(i+s.passOffset+s.order.length)%s.order.length]!, sentCards: [...s.sent[playerId]!], receivedCards: [...s.received[playerId]!] } : {}),
  };
}
export function results(s: HeartsState): GameResults | null {
  if (s.phase.id !== 'done') return null;
  const scores = { ...s.scores };
  const sorted = [...s.order].sort((a,b) => scores[a]! - scores[b]! || s.order.indexOf(a)-s.order.indexOf(b));
  const ranking = sorted.map(playerId => ({ playerId, score:scores[playerId]!, rank:1+s.order.filter(id => scores[id]! < scores[playerId]!).length }));
  return { scores, ranking, winnerIds:ranking.filter(r => r.rank===1).map(r => r.playerId), awards:[] };
}
export function sampleInput(s: HeartsState, id: string, rng: Rng, skill: BotSkill = 'normal'): Input | null {
  if (!has(s,id) || !available(s,id) || s.phase.paused) return null;
  if (s.phase.id === 'trick' || s.phase.id === 'hand') return hasHuman(s) ? null : { type:'next' };
  return chooseBot(controllerView(s,id),rng,skill);
}
export const game: GameDefinition<HeartsState,Input,HeartsTv,HeartsController> = {manifest,phases:['pass','play','trick','hand','done'],inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput}};
