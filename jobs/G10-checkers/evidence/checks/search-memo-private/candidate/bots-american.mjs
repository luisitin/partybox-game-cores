// src/moves.ts
var directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
function makeGeometry(size) {
  const count = size * size / 2;
  const rows = Array.from({ length: count }, (_, square) => Math.floor(square / (size / 2)));
  const columns = rows.map((row, square) => 2 * (square % (size / 2)) + (row + 1) % 2);
  const index = (row, column) => row < 0 || row >= size || column < 0 || column >= size || (row + column) % 2 !== 1 ? -1 : row * (size / 2) + Math.floor(column / 2);
  const next = directions.map(([dy, dx]) => Object.freeze(rows.map((row, square) => index(row + dy, columns[square] + dx))));
  return Object.freeze({ size, count, rows: Object.freeze(rows), columns: Object.freeze(columns), next: Object.freeze(next) });
}
var american = makeGeometry(8);
var international = makeGeometry(10);
var geometry = (variant) => variant === "american" ? american : international;
var isCrown = (variant, square, side) => geometry(variant).rows[square] === (side === 1 ? 0 : geometry(variant).size - 1);
var own = (piece, side) => piece !== 0 && Math.sign(piece) === side;
var enemy = (piece, side) => piece !== 0 && Math.sign(piece) === -side;
var comparePath = (a, b) => {
  for (let i = 0; i < Math.min(a.path.length, b.path.length); i++) if (a.path[i] !== b.path[i]) return a.path[i] - b.path[i];
  return a.path.length - b.path.length;
};
function legalMoves(source, variant, side) {
  const g = geometry(variant);
  if (source.length !== g.count) return [];
  const board = [...source], captures = [], quiet = [];
  for (let origin = 0; origin < board.length; origin++) {
    let walk2 = function(square) {
      let extended = false;
      for (const direction of allowed) {
        let target = g.next[direction][square];
        if (target < 0) continue;
        if (king && variant === "international") {
          while (target >= 0 && board[target] === 0) target = g.next[direction][target];
          if (target < 0 || !enemy(board[target], side) || taken.has(target)) continue;
          let landing = g.next[direction][target];
          while (landing >= 0 && board[landing] === 0) {
            jump2(square, target, landing);
            extended = true;
            landing = g.next[direction][landing];
          }
        } else {
          const landing = g.next[direction][target];
          if (landing >= 0 && board[landing] === 0 && enemy(board[target], side) && !taken.has(target)) {
            jump2(square, target, landing);
            extended = true;
          }
        }
      }
      if (!extended && victims.length > 0) captures.push({ path: [...path], captures: [...victims], promotes: !king && isCrown(variant, square, side) });
    }, jump2 = function(square, victim, landing) {
      const removed = board[victim];
      board[square] = 0;
      board[landing] = piece;
      if (variant === "american") board[victim] = 0;
      taken.add(victim);
      victims.push(victim);
      path.push(landing);
      if (!king && variant === "american" && isCrown(variant, landing, side)) {
        captures.push({ path: [...path], captures: [...victims], promotes: true });
      } else walk2(landing);
      path.pop();
      victims.pop();
      taken.delete(victim);
      board[landing] = 0;
      board[square] = piece;
      board[victim] = removed;
    };
    var walk = walk2, jump = jump2;
    const piece = board[origin];
    if (!own(piece, side)) continue;
    const king = Math.abs(piece) === 2, allowed = king || variant === "international" ? [0, 1, 2, 3] : side === 1 ? [0, 1] : [2, 3];
    const path = [origin], victims = [], taken = /* @__PURE__ */ new Set();
    walk2(origin);
    const forward = king ? [0, 1, 2, 3] : side === 1 ? [0, 1] : [2, 3];
    for (const direction of forward) {
      let landing = g.next[direction][origin];
      while (landing >= 0 && board[landing] === 0) {
        quiet.push({ path: [origin, landing], captures: [], promotes: !king && isCrown(variant, landing, side) });
        if (!king || variant === "american") break;
        landing = g.next[direction][landing];
      }
    }
  }
  if (captures.length === 0) return quiet.sort(comparePath);
  const maximum = variant === "international" ? captures.reduce((most, move) => Math.max(most, move.captures.length), 0) : 0;
  return (variant === "international" ? captures.filter((move) => move.captures.length === maximum) : captures).sort(comparePath);
}
function applyMove(source, move) {
  const board = [...source], origin = move.path[0], destination = move.path.at(-1);
  const piece = board[origin];
  board[origin] = 0;
  for (const victim of move.captures) board[victim] = 0;
  board[destination] = move.promotes ? Math.sign(piece) * 2 : piece;
  return board;
}
var moveKey = (move) => move.path.join("-");
var positionKey = (board, side, variant) => `${variant}:${side}:${board.map((piece) => piece + 2).join("")}`;

// src/draws.ts
function endingWindows(board, variant, windows, ply, policy) {
  if (variant !== "international" || policy !== "official") return [];
  const next = windows.map((window) => ({ ...window }));
  let light = 0, dark = 0, lightKings = 0, darkKings = 0, lightSquare = -1, darkSquare = -1;
  for (let square = 0; square < board.length; square++) {
    const piece = board[square];
    if (piece > 0) {
      light++;
      lightSquare = square;
      if (piece === 2) lightKings++;
    } else if (piece < 0) {
      dark++;
      darkSquare = square;
      if (piece === -2) darkKings++;
    }
  }
  for (const weak of [1, -1]) {
    const ownCount = weak === 1 ? light : dark, ownKings = weak === 1 ? lightKings : darkKings;
    const opposingCount = weak === 1 ? dark : light, opposingKings = weak === 1 ? darkKings : lightKings;
    if (ownCount !== 1 || ownKings !== 1 || opposingKings === 0) continue;
    const add = (kind, limit) => {
      if (!next.some((window) => window.kind === kind && window.weak === weak)) next.push({ kind, weak, started: ply, limit });
    };
    if (opposingCount === 3) {
      add("sixteen", 32);
      const square = weak === 1 ? lightSquare : darkSquare, g = geometry(variant);
      let opponentOnDiagonal = false;
      for (let other = 0; other < board.length; other++) if (board[other] * weak < 0 && g.rows[other] + g.columns[other] === 9) {
        opponentOnDiagonal = true;
        break;
      }
      if (g.rows[square] + g.columns[square] === 9 && !opponentOnDiagonal) add("diagonalFive", 10);
    }
    if (opposingCount <= 2 && opposingCount > 0) add("five", 10);
  }
  return next;
}
function nextPosition(position, move, config) {
  const man = Math.abs(position.board[move.path[0]]) === 1;
  const irreversible = move.captures.length > 0 || man;
  const board = applyMove(position.board, move), side = -position.side, ply = position.ply + 1;
  const key = positionKey(board, side, position.variant);
  const repetition = irreversible ? { [key]: 1 } : { ...position.repetition, [key]: (Object.hasOwn(position.repetition, key) ? position.repetition[key] : 0) + 1 };
  return {
    board,
    side,
    variant: position.variant,
    ply,
    quietPlies: irreversible ? 0 : position.quietPlies + 1,
    repetition,
    drawWindows: endingWindows(board, position.variant, position.drawWindows, ply, config.drawPolicy)
  };
}
function drawReason(position, config) {
  const key = positionKey(position.board, position.side, position.variant);
  if (config.repetition && Object.hasOwn(position.repetition, key) && position.repetition[key] >= 3) return "threefold-repetition";
  const quietLimit = position.variant === "international" && config.drawPolicy === "official" ? 50 : 80;
  if (position.quietPlies >= quietLimit) return quietLimit === 50 ? "twenty-five-move-draw" : "forty-move-draw";
  const expired = position.drawWindows.find((window) => position.ply - window.started >= window.limit);
  return expired ? expired.kind === "sixteen" ? "sixteen-move-ending" : expired.kind === "five" ? "five-move-ending" : "long-diagonal-five-move-ending" : null;
}

// src/bots.ts
import { probeEndgame } from "/workspace/game-cores-G10-audit-worker/jobs/G10-checkers/dist/endgame-american.mjs";
var WIN = 1e5;
function evaluate(board, variant, side) {
  const g = geometry(variant);
  let value = 0;
  for (let square = 0; square < board.length; square++) {
    const piece = board[square];
    if (!piece) continue;
    const king = Math.abs(piece) === 2, owner = Math.sign(piece);
    const advancement = owner === 1 ? g.size - 1 - g.rows[square] : g.rows[square];
    const center = 2 * g.size - Math.abs(2 * g.rows[square] - (g.size - 1)) - Math.abs(2 * g.columns[square] - (g.size - 1));
    const amount = (king ? variant === "international" ? 275 : 190 : 100) + (king ? 0 : advancement * 5) + center * 2;
    value += owner === side ? amount : -amount;
  }
  return value;
}
function searchMove(position, config, rng, skill, databaseProbe = probeEndgame) {
  const rootMoves = legalMoves(position.board, position.variant, position.side);
  if (!rootMoves.length) return { move: null, score: -WIN, nodes: 0, completedDepth: 0, budgetExhausted: false, databaseHits: 0, corpusHits: 0 };
  if (skill === "easy") return { move: rootMoves[rng.int(0, rootMoves.length - 1)], score: 0, nodes: 0, completedDepth: 0, budgetExhausted: false, databaseHits: 0, corpusHits: 0 };
  const maximum = skill === "sharp" ? 5 : 2, budget = skill === "sharp" ? 6e3 : 800;
  let nodes = 0, hits = 0, corpusHits = 0, exhausted = false, best = rootMoves[0], bestScore = -Infinity, completed = 0;
  const table = /* @__PURE__ */ new Map();
  const moveCache = /* @__PURE__ */ new Map();
  const ordered = (moves, preferred) => moves.map((move) => ({ move, key: moveKey(move) })).sort((a, b) => Number(b.key === preferred) - Number(a.key === preferred) || Number(b.move.promotes) - Number(a.move.promotes) || b.move.captures.length - a.move.captures.length || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).map((row) => row.move);
  function visit(current, depth, alpha, beta, ply) {
    nodes++;
    if (nodes > budget) {
      exhausted = true;
      return evaluate(current.board, current.variant, current.side);
    }
    const originalAlpha = alpha, originalBeta = beta, level = Math.max(0, depth);
    const boardKey = positionKey(current.board, current.side, current.variant);
    const key = boardKey + "|" + current.quietPlies + "|" + ply + "|" + JSON.stringify(current.drawWindows.map((window) => [window.kind, window.weak, current.ply - window.started, window.limit])) + "|" + JSON.stringify(Object.entries(current.repetition).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const cached = table.get(key);
    if (cached && cached.depth >= level) {
      if (cached.bound === "exact") return cached.score;
      if (cached.bound === "lower") alpha = Math.max(alpha, cached.score);
      else beta = Math.min(beta, cached.score);
      if (alpha >= beta) return cached.score;
    }
    let moves = moveCache.get(boardKey);
    if (!moves) {
      moves = legalMoves(current.board, current.variant, current.side);
      moveCache.set(boardKey, moves);
    }
    if (!moves.length) return -WIN + ply;
    if (drawReason(current, config)) return 0;
    if (skill === "sharp") {
      const table2 = databaseProbe(current.board, current.variant, current.side);
      if (table2) {
        hits++;
        if (table2.source === "chinook" || table2.source === "kingsrow") corpusHits++;
        if (table2.outcome === 0) return 0;
        const limit = current.variant === "international" && config.drawPolicy === "official" ? 50 : 80;
        const remaining = current.drawWindows.reduce((left, window) => Math.min(left, window.limit - (current.ply - window.started)), limit - current.quietPlies);
        const fresh = Object.values(current.repetition).every((value2) => value2 === 1);
        if (table2.dtm !== null && table2.dtm <= remaining && fresh) return table2.outcome * (WIN - 1e3 - table2.dtm - ply);
        if (table2.dtm === null && remaining > 6 && fresh) return table2.outcome * (2e4 - ply) + evaluate(current.board, current.variant, current.side);
      }
    }
    if (depth <= 0 && !moves[0].captures.length) return evaluate(current.board, current.variant, current.side);
    let value = -Infinity, chosen = null;
    for (const move of ordered(moves, cached?.move ?? null)) {
      const result = -visit(nextPosition(current, move, config), depth - 1, -beta, -alpha, ply + 1);
      if (result > value) {
        value = result;
        chosen = moveKey(move);
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta || exhausted) break;
    }
    if (!exhausted) table.set(key, { depth: level, score: value, bound: value <= originalAlpha ? "upper" : value >= originalBeta ? "lower" : "exact", move: chosen });
    return value;
  }
  for (let depth = 1; depth <= maximum; depth++) {
    const scores = [], preferred = moveKey(best);
    let iterationBest = -Infinity;
    for (const move of ordered(rootMoves, preferred)) {
      const child = nextPosition(position, move, config);
      let score = -visit(child, depth - 1, scores.length ? -iterationBest - 1 : -Infinity, scores.length ? -iterationBest : Infinity, 1);
      if (scores.length && score >= iterationBest && !exhausted) score = -visit(child, depth - 1, -Infinity, Infinity, 1);
      iterationBest = Math.max(iterationBest, score);
      scores.push({ move, score });
      if (exhausted) break;
    }
    if (exhausted) break;
    const value = scores.reduce((most, result) => Math.max(most, result.score), -Infinity);
    const ties = scores.filter((result) => result.score === value);
    best = ties[rng.int(0, ties.length - 1)].move;
    bestScore = value;
    completed = depth;
  }
  return {
    move: best,
    score: Number.isFinite(bestScore) ? bestScore : evaluate(position.board, position.variant, position.side),
    nodes,
    completedDepth: completed,
    budgetExhausted: exhausted,
    databaseHits: hits,
    corpusHits
  };
}
var chooseMove = (position, config, rng, skill) => searchMove(position, config, rng, skill).move;
export {
  chooseMove,
  evaluate,
  searchMove
};
