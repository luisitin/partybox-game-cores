import type { Card, MoonMode, Play, Settings } from './types.js';
export const suit = (card: Card): number => Math.trunc(card / 13);
export const rank = (card: Card): number => card % 13;
export const penalty = (card: Card): number => suit(card) === 3 ? 1 : card === 36 ? 13 : 0;
export const cardName = (card: Card): string => `${'23456789TJQKA'[rank(card)]}${['♣', '♦', '♠', '♥'][suit(card)]}`;
export function removedCards(count: number, threeDeck: Settings['threeDeck']): Card[] {
  if (count === 3) return [threeDeck === 'clubs' ? 0 : 13];
  if (count === 5) return [0, 13];
  if (count === 6) return [0, 1, 13, 26];
  return [];
}
export function deckFor(count: number, threeDeck: Settings['threeDeck']): Card[] {
  const removed = new Set(removedCards(count, threeDeck));
  return Array.from({ length: 52 }, (_, c) => c).filter(c => !removed.has(c));
}
export function passingOffset(hand: number, count: number, noPass: boolean): number {
  if (noPass) return 0;
  const cycle = count === 3 ? [1, -1, 0] : count === 5 ? [1, -1, 2, -2, 0] : count === 6 ? [1, -1, 2, -2, 3, 0] : [1, -1, count / 2, 0];
  return cycle[(hand - 1) % cycle.length] as number;
}
export function legalCards(hand: readonly Card[], trick: readonly Play[], first: boolean, broken: boolean, opening: Card): Card[] {
  if (!hand.length) return [];
  if (trick.length === 0 && first) return hand.includes(opening) ? [opening] : [];
  if (trick.length > 0) {
    const following = hand.filter(c => suit(c) === suit(trick[0]!.card));
    if (following.length) return following;
    const safe = first ? hand.filter(c => penalty(c) === 0) : [...hand];
    return safe.length ? safe : [...hand];
  }
  const leads = hand.filter(c => broken || suit(c) !== 3);
  return leads.length ? leads : [...hand];
}
export function trickWinner(trick: readonly Play[]): string | null {
  if (!trick.length) return null;
  let winner = trick[0]!;
  for (const play of trick.slice(1)) if (suit(play.card) === suit(winner.card) && rank(play.card) > rank(winner.card)) winner = play;
  return winner.playerId;
}
export function settleHand(order: readonly string[], captured: Readonly<Record<string, readonly Card[]>>, moonMode: MoonMode, jack: boolean): { points: Record<string, number>; moon: string | null } {
  const raw = Object.fromEntries(order.map(id => [id, (captured[id] ?? []).reduce((n, c) => n + penalty(c), 0)]));
  const moon = order.find(id => raw[id] === 26) ?? null;
  const points = Object.fromEntries(order.map(id => {
    let score = raw[id] ?? 0;
    if (moon !== null) score = moonMode === 'add' ? (id === moon ? 0 : 26) : (id === moon ? -26 : 0);
    if (jack && (captured[id] ?? []).includes(22)) score -= 10;
    return [id, score];
  }));
  return { points, moon };
}
