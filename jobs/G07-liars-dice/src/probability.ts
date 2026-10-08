/** Exact binomial outcome counts. No observations beyond the supplied cup. */
export interface Probability {
  atLeastNumerator: string;
  exactNumerator: string;
  total: string;
  atLeast: number;
  exact: number;
}

interface Row { readonly total: bigint; readonly pmf: readonly bigint[]; readonly tails: readonly bigint[] }

// Independent of the reference's iterative polynomial convolution: closed
// n-choose-k coefficients and integer powers. Tables are deeply immutable.
function makeRow(n: number, matches: number): Row {
  const pmf: bigint[] = [];
  let choose = 1n;
  for (let k = 0; k <= n; k++) {
    pmf.push(choose * BigInt(matches) ** BigInt(k) * BigInt(6 - matches) ** BigInt(n - k));
    if (k < n) choose = choose * BigInt(n - k) / BigInt(k + 1);
  }
  const tails: bigint[] = new Array(n + 2).fill(0n);
  for (let k = n; k >= 0; k--) tails[k] = tails[k + 1] + pmf[k];
  return Object.freeze({ total: 6n ** BigInt(n), pmf: Object.freeze(pmf), tails: Object.freeze(tails) });
}

const TABLE = Object.freeze([
  Object.freeze(Array.from({ length: 41 }, (_, n) => makeRow(n, 1))),
  Object.freeze(Array.from({ length: 41 }, (_, n) => makeRow(n, 2))),
]);

export function probability(n: number, needed: number, matchingFaces: number): Probability {
  if (!Number.isInteger(n) || n < 0 || n > 40 || !Number.isSafeInteger(needed) ||
      (matchingFaces !== 1 && matchingFaces !== 2)) throw new RangeError('Invalid fair-dice domain');
  const row = TABLE[matchingFaces - 1][n];
  const tail = needed <= 0 ? row.total : needed > n ? 0n : row.tails[needed];
  const exact = needed < 0 || needed > n ? 0n : row.pmf[needed];
  return {
    atLeastNumerator: tail.toString(), exactNumerator: exact.toString(), total: row.total.toString(),
    atLeast: Number(tail) / Number(row.total), exact: Number(exact) / Number(row.total),
  };
}

export function bidProbability(ownDice: readonly number[], totalDice: number, quantity: number, face: number, wild: boolean): Probability {
  if (!Array.isArray(ownDice) || ownDice.some(d => !Number.isInteger(d) || d < 1 || d > 6) ||
      !Number.isInteger(totalDice) || totalDice < ownDice.length || totalDice > 40 ||
      !Number.isSafeInteger(quantity) || !Number.isInteger(face) || face < 1 || face > 6 || typeof wild !== 'boolean') {
    throw new RangeError('Invalid bid probability domain');
  }
  const matchingFaces = wild && face !== 1 ? 2 : 1;
  const known = ownDice.reduce((n, d) => n + (d === face || (wild && face !== 1 && d === 1) ? 1 : 0), 0);
  return probability(totalDice - ownDice.length, quantity - known, matchingFaces);
}
