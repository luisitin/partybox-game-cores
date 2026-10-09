// src/cards.ts
var rank = (c) => c % 13 + 1;
var suit = (c) => Math.floor(c / 13);
var value = (c) => Math.min(rank(c), 10);
var cardName = (c) => ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][rank(c) - 1] + ["\u2663", "\u2666", "\u2665", "\u2660"][suit(c)];
function validMeld(cards) {
  if (cards.length < 3 || cards.some((c) => !Number.isInteger(c) || c < 0 || c > 51) || new Set(cards).size !== cards.length) return false;
  const ranks = cards.map(rank).sort((a, b) => a - b);
  return cards.length <= 4 && ranks.every((r) => r === ranks[0]) || cards.every((c) => suit(c) === suit(cards[0])) && ranks.every((r, i) => r === ranks[0] + i);
}
function meldCandidates(hand) {
  const result = [];
  for (let r = 1; r <= 13; r++) {
    const indices = hand.map((c, i) => rank(c) === r ? i : -1).filter((i) => i >= 0);
    if (indices.length >= 3) {
      if (indices.length === 4) result.push(indices.reduce((a, i) => a | 1 << i, 0));
      for (let a = 0; a < indices.length; a++) for (let b = a + 1; b < indices.length; b++) for (let c = b + 1; c < indices.length; c++)
        result.push(1 << indices[a] | 1 << indices[b] | 1 << indices[c]);
    }
  }
  for (let s = 0; s < 4; s++) {
    const byRank = new Map(hand.flatMap((c, i) => suit(c) === s ? [[rank(c), i]] : []));
    for (let start = 1; start <= 11; start++) {
      let mask = 0;
      for (let r = start; r <= 13 && byRank.has(r); r++) {
        mask |= 1 << byRank.get(r);
        if (r - start >= 2) result.push(mask);
      }
    }
  }
  return result.sort((a, b) => a - b);
}
function handAnalyzer(hand) {
  if (hand.length > 11 || new Set(hand).size !== hand.length || hand.some((c) => !Number.isInteger(c) || c < 0 || c > 51))
    throw new Error("Expected distinct cards, maximum eleven");
  const candidates = meldCandidates(hand), size = 1 << hand.length;
  const cost = new Int16Array(size).fill(-1), choice = new Int32Array(size);
  cost[0] = 0;
  function solve(mask) {
    if (cost[mask] >= 0) return cost[mask];
    const bit = mask & -mask, i = 31 - Math.clz32(bit);
    let best = value(hand[i]) + solve(mask ^ bit), selected = 0;
    for (const meld of candidates) if (meld & bit && (mask & meld) === meld) {
      const score = solve(mask ^ meld);
      if (score < best) {
        best = score;
        selected = meld;
      }
    }
    cost[mask] = best;
    choice[mask] = selected;
    return best;
  }
  return (mask) => {
    const deadwood = solve(mask), melds = [], loose = [];
    while (mask) {
      const meld = choice[mask];
      if (meld) {
        melds.push(hand.filter((_, i) => Boolean(meld & 1 << i)));
        mask ^= meld;
      } else {
        const bit = mask & -mask;
        loose.push(hand[31 - Math.clz32(bit)]);
        mask ^= bit;
      }
    }
    return { deadwood, melds, loose };
  };
}
function minimizeDeadwood(hand) {
  return handAnalyzer(hand)((1 << hand.length) - 1);
}
function discardSolutions(hand) {
  const analyze = handAnalyzer(hand), full = (1 << hand.length) - 1;
  return hand.map((card, i) => ({ card, solution: analyze(full ^ 1 << i) }));
}
function declaredSolution(hand, melds) {
  const used = melds.flat();
  if (melds.some((m) => !validMeld(m)) || new Set(used).size !== used.length || used.some((c) => !hand.includes(c))) return null;
  const loose = hand.filter((c) => !used.includes(c));
  return { melds: melds.map((m) => [...m]), loose, deadwood: loose.reduce((a, c) => a + value(c), 0) };
}
function optimalDefense(hand, targets, canLayOff = true) {
  if (!canLayOff) return { ...minimizeDeadwood(hand), laid: [] };
  const candidates = meldCandidates(hand);
  let best = { ...minimizeDeadwood(hand), laid: [] };
  const bits = new Map(hand.map((card, i) => [card, 1 << i])), visited = /* @__PURE__ */ new Set();
  let coverable = candidates.reduce((mask, meld) => mask | meld, 0);
  for (const target of targets) {
    const expanded = [...target];
    let changed = true;
    while (changed) {
      changed = false;
      for (const card of hand) if (!expanded.includes(card) && validMeld([...expanded, card])) {
        expanded.push(card);
        coverable |= bits.get(card);
        changed = true;
      }
    }
  }
  const lowerBound = hand.reduce((sum, card, i) => sum + (coverable & 1 << i ? 0 : value(card)), 0);
  function layoffs(loose, board, laid, own) {
    if (best.deadwood === lowerBound) return;
    const masks = Array(targets.length).fill(0);
    for (const x of laid) masks[x.target] |= bits.get(x.card);
    const key = loose.reduce((mask, card) => mask | bits.get(card), 0) + ":" + masks.join(",");
    if (visited.has(key)) return;
    visited.add(key);
    const deadwood = loose.reduce((a, c) => a + value(c), 0);
    if (deadwood < best.deadwood) best = { deadwood, loose: [...loose], melds: own.map((m) => [...m]), laid: [...laid] };
    if (best.deadwood === lowerBound) return;
    for (let i = 0; i < loose.length; i++) for (let t = 0; t < board.length; t++) {
      const extended = [...board[t], loose[i]];
      if (validMeld(extended)) layoffs(loose.filter((_, j) => i !== j), board.map((m, j) => j === t ? extended : m), [...laid, { card: loose[i], target: t }], own);
    }
  }
  function partitions(mask, loose, own) {
    if (best.deadwood === lowerBound) return;
    if (!mask) {
      layoffs(loose, targets.map((m) => [...m]), [], own);
      return;
    }
    const bit = mask & -mask, i = 31 - Math.clz32(bit);
    partitions(mask ^ bit, [...loose, hand[i]], own);
    for (const meld of candidates) if (meld & bit && (mask & meld) === meld)
      partitions(mask ^ meld, loose, [...own, hand.filter((_, i2) => Boolean(meld & 1 << i2))]);
  }
  partitions((1 << hand.length) - 1, [], []);
  return best;
}
export {
  cardName,
  declaredSolution,
  discardSolutions,
  meldCandidates,
  minimizeDeadwood,
  optimalDefense,
  rank,
  suit,
  validMeld,
  value
};
