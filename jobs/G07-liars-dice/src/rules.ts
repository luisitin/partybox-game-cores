export interface Claim { quantity: number; face: number }

export function validBid(bid: Claim): boolean {
  return Number.isSafeInteger(bid.quantity) && bid.quantity >= 1 && bid.quantity <= 1_000_000 &&
    Number.isInteger(bid.face) && bid.face >= 1 && bid.face <= 6;
}

/** Palifico uses ordinary face ordering only for eligible experienced seats. */
export function isRaise(previous: Claim | null, next: Claim, wild: boolean, lockedFace = false, mayChange = false): boolean {
  if (!validBid(next)) return false;
  if (previous === null) return !wild || next.face !== 1;
  if (lockedFace && !mayChange) return next.face === previous.face && next.quantity > previous.quantity;
  if (wild) {
    if (next.face === 1 && previous.face !== 1) return next.quantity >= Math.ceil(previous.quantity / 2);
    if (previous.face === 1 && next.face !== 1) return next.quantity >= previous.quantity * 2 + 1;
  }
  return next.quantity > previous.quantity || (next.quantity === previous.quantity && next.face > previous.face);
}

export function countMatches(dice: readonly number[], face: number, wild: boolean): number {
  return dice.reduce((n, die) => n + (die === face || (wild && face !== 1 && die === 1) ? 1 : 0), 0);
}
