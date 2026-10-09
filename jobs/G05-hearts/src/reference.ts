/** Independent rule verifier, written before production; imports no game helpers. */
export interface ReferenceScore {
  points: Record<string, number>;
  moon: string | null;
}
export function referenceScore(
  order: readonly string[], captured: Readonly<Record<string, readonly number[]>>,
  moonMode: 'add' | 'subtract', jackBonus: boolean,
): ReferenceScore {
  const penaltyCards = [36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
  const moon = order.find(id => penaltyCards.every(c => (captured[id] ?? []).includes(c))) ?? null;
  const entries = order.map(id => {
    const cards = captured[id] ?? [];
    let value = cards.filter(c => c >= 39 && c <= 51).length + (cards.includes(36) ? 13 : 0);
    if (moon !== null) value = moonMode === 'subtract' ? (id === moon ? -26 : 0) : (id === moon ? 0 : 26);
    if (jackBonus && cards.includes(22)) value -= 10;
    return [id, value] as const;
  });
  return { points: Object.fromEntries(entries), moon };
}
export function referenceWinner(trick: readonly { playerId: string; card: number }[]): string | null {
  if (!trick.length) return null;
  const cards = trick.map(p => ({ ...p, suit: ['C', 'D', 'S', 'H'][Math.floor(p.card / 13)], rank: p.card % 13 }));
  const first = cards[0]!;
  return [...cards].filter(p => p.suit === first.suit).sort((a, b) => b.rank - a.rank)[0]!.playerId;
}
export function referenceLegal(
  hand: readonly number[], trick: readonly { playerId: string; card: number }[],
  firstTrick: boolean, heartsBroken: boolean, opening: number,
): number[] {
  if (!hand.length) return [];
  if (!trick.length && firstTrick) return hand.includes(opening) ? [opening] : [];
  if (trick.length) {
    const suit = Math.floor(trick[0]!.card / 13);
    const matching = hand.filter(c => Math.floor(c / 13) === suit);
    if (matching.length) return [...matching];
    if (firstTrick) {
      const clean = hand.filter(c => c < 39 && c !== 36);
      if (clean.length) return clean;
    }
    return [...hand];
  }
  const eligible = hand.filter(c => heartsBroken || c < 39);
  return eligible.length ? eligible : [...hand];
}
