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
import { probeEndgame } from "/workspace/game-cores-G10-audit-worker/jobs/G10-checkers/dist/endgame.mjs";
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

// src/international-search.ts
import { probeEndgame as probeEndgame2 } from "/workspace/game-cores-G10-audit-worker/jobs/G10-checkers/dist/endgame.mjs";

// src/international.ts
var blockSize = 4096;
var subsliceSize = 2 ** 31;
var combinations = Object.freeze(Array.from({ length: 51 }, (_, n) => Object.freeze(Array.from({ length: 7 }, (_2, k) => {
  if (k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
  return Math.round(result);
}))));
var choose = (n, k) => n < 0 || k < 0 || k > 6 || n > 50 ? 0 : combinations[n][k];
var colex = (cells) => cells.reduce((sum, square, index) => sum + choose(square, index + 1), 0);
var parts = (board) => {
  const groups = { bm: [], bk: [], wm: [], wk: [] };
  for (let square = 0; square < board.length; square++) {
    const piece = board[square];
    if (piece === -1) groups.bm.push(square);
    else if (piece === -2) groups.bk.push(square);
    else if (piece === 1) groups.wm.push(square);
    else if (piece === 2) groups.wk.push(square);
  }
  return groups;
};
var materialSize = (bm, bk, wm, wk) => {
  let men = 0;
  for (let back = 0; back <= Math.min(bm, 5); back++) men += choose(5, back) * choose(40, bm - back) * choose(45 - bm + back, wm);
  return men * choose(50 - bm - wm, bk) * choose(50 - bm - wm - bk, wk);
};
function valid(board, side) {
  return Array.isArray(board) && board.length === 50 && (side === 1 || side === -1) && board.every((piece, square) => Number.isInteger(piece) && piece >= -2 && piece <= 2 && !(piece === 1 && square < 5) && !(piece === -1 && square >= 45));
}
function internationalRank(source, side) {
  if (!valid(source, side)) return null;
  let board = source, group = parts(board), black = group.bm.length + group.bk.length, white = group.wm.length + group.wk.length;
  if (black === 0 || white === 0 || black + white > 6 || black > 5 || white > 5) return null;
  const reversed = white > black || white === black && (group.wk.length > group.bk.length || group.wk.length === group.bk.length && side === 1);
  if (reversed) {
    board = source.map((_, square) => -source[49 - square]);
    side = -side;
    group = parts(board);
    black = group.bm.length + group.bk.length;
    white = group.wm.length + group.wk.length;
  }
  const { bm, bk, wm, wk } = group, bmCount = bm.length, bkCount = bk.length, wmCount = wm.length, wkCount = wk.length;
  const back = bm.filter((square) => square < 5), forward = bm.filter((square) => square >= 5), backCount = back.length;
  let groupBase = 0;
  for (let count = Math.min(bmCount, 5); count > backCount; count--) groupBase += choose(5, count) * choose(40, bmCount - count) * choose(45 - bmCount + count, wmCount);
  const reversedWhite = wm.map((square) => 49 - square - bm.filter((other) => other > square).length).reverse();
  const men = groupBase + colex(back) + choose(5, backCount) * (colex(forward.map((square) => square - 5)) + choose(40, bmCount - backCount) * colex(reversedWhite));
  const occupied = [...bm, ...wm].sort((a, b) => a - b);
  const blackKing = colex(bk.map((square) => square - occupied.filter((other) => other < square).length));
  const occupiedWithKings = [...occupied, ...bk].sort((a, b) => a - b);
  const whiteKing = colex(wk.map((square) => square - occupiedWithKings.filter((other) => other < square).length));
  const index = whiteKing + choose(50 - bmCount - wmCount - bkCount, wkCount) * (blackKing + choose(50 - bmCount - wmCount, bkCount) * men);
  const positions = materialSize(bmCount, bkCount, wmCount, wkCount);
  if (!Number.isSafeInteger(index) || index < 0 || index >= positions) return null;
  const subslice = Math.floor(index / subsliceSize), ordinal = index % subsliceSize;
  const key = `BASE${bmCount},${bkCount},${wmCount},${wkCount},${subslice},${side === -1 ? "b" : "w"}`;
  return { key, file: black + white <= 5 ? "db" + (black + white) : `db6-${bmCount}${bkCount}${wmCount}${wkCount}`, index, ordinal, subslice, positions, reversed, side, material: [bmCount, bkCount, wmCount, wkCount] };
}
var MissingInternationalBlock = class extends Error {
  constructor(file, offset, length) {
    super("Missing International block " + file + ":" + offset);
    this.file = file;
    this.offset = offset;
    this.length = length;
    this.name = "MissingInternationalBlock";
  }
};
function createInternationalBlockDatabase(sources, dictionarySource) {
  return createDatabase(sources.map((source) => {
    if (!Number.isSafeInteger(source.byteLength) || source.byteLength < 0 || !Array.isArray(source.blocks)) throw new RangeError("Invalid International block file");
    const blocks = /* @__PURE__ */ new Map(), length = source.byteLength, name = source.name;
    for (const block of source.blocks) {
      if (!Number.isSafeInteger(block.offset) || block.offset < 0 || block.offset % blockSize !== 0 || block.offset >= length || blocks.has(block.offset) || !(block.data instanceof Uint8Array) || block.data.length !== Math.min(blockSize, length - block.offset)) throw new RangeError("Invalid International supplied block");
      blocks.set(block.offset, new Uint8Array(block.data));
    }
    return { name, indexText: source.indexText, bytes: { length, range: (start, end) => {
      const offset = Math.floor(start / blockSize) * blockSize, block = blocks.get(offset);
      if (end > offset + blockSize) throw new RangeError("International block read crosses its boundary");
      if (!block) throw new MissingInternationalBlock(name, offset, Math.min(blockSize, length - offset));
      return block.subarray(start - offset, end - offset);
    } } };
  }), dictionarySource);
}
function createDatabase(sources, dictionarySource) {
  if (!(dictionarySource instanceof Uint8Array) || dictionarySource.length !== 61077) throw new RangeError("Invalid International v2 dictionary size");
  const dictionary = new Uint8Array(dictionarySource), view = new DataView(dictionary.buffer), runs = dictionary.subarray(51200);
  const lengths = Array.from({ length: 12800 }, (_, index) => view.getUint16(index * 2, true));
  const offsets = Array.from({ length: 12800 }, (_, index) => view.getUint16(25600 + index * 2, true));
  for (let token = 0; token < lengths.length; token++) {
    let remaining = lengths[token], cursor = offsets[token];
    if (remaining === 0) throw new RangeError("Zero International token extent");
    while (remaining > 0) {
      if (cursor + 2 >= runs.length || runs[cursor] > 3) throw new RangeError("Invalid International value run");
      const count = runs[cursor + 1] + 256 * runs[cursor + 2];
      if (count === 0) throw new RangeError("Zero International value run");
      remaining -= count;
      cursor += 3;
    }
  }
  const slices = /* @__PURE__ */ new Map(), names = /* @__PURE__ */ new Set();
  let totalBytes = 0;
  const checkMark = (mark) => {
    if (!Number.isSafeInteger(mark.ordinal) || mark.ordinal < 0 || mark.catalogue < 0 || mark.catalogue >= 50 || mark.permutation < 0 || mark.permutation > 255) throw new RangeError("Invalid International block metadata");
    const values = Array.from({ length: 4 }, (_, i) => mark.permutation >> 2 * i & 3);
    if (new Set(values).size !== 4) throw new RangeError("Invalid International outcome permutation");
  };
  for (const source of sources) {
    if (!/^db(?:[2-5]|6-[0-5]{4})$/.test(source.name) || names.has(source.name) || typeof source.indexText !== "string") throw new RangeError("Invalid or repeated International file");
    names.add(source.name);
    const bytes = source.bytes;
    totalBytes += bytes.length;
    let active = null;
    const local = [];
    for (const line of source.indexText.split(/\r?\n/).map((text) => text.trim()).filter(Boolean)) {
      if (line.startsWith("BASE")) {
        const match = /^BASE([0-5]),([0-5]),([0-5]),([0-5]),(\d+),([bw]):(.+)$/.exec(line);
        if (!match) throw new RangeError("Invalid International slice header");
        const [bm, bk, wm, wk, subslice] = match.slice(1, 6).map(Number), pieces = bm + bk + wm + wk, positions = materialSize(bm, bk, wm, wk);
        const expected = pieces <= 5 ? "db" + pieces : `db6-${bm}${bk}${wm}${wk}`;
        const key = line.slice(0, line.indexOf(":"));
        if (expected !== source.name || pieces < 2 || pieces > 6 || bm + bk === 0 || wm + wk === 0 || bm + bk > 5 || wm + wk > 5 || !Number.isSafeInteger(subslice) || subslice * subsliceSize >= positions || slices.has(key)) throw new RangeError("Incompatible International slice material");
        const tail = match[7];
        active = { bytes, start: 0, end: bytes.length, uniform: void 0, marks: [], positions: Math.min(subsliceSize, positions - subslice * subsliceSize) };
        if (/^[+\-=.]$/.test(tail)) active.uniform = tail === "+" ? 1 : tail === "-" ? -1 : tail === "=" ? 0 : null;
        else {
          const first = /^(\d+)\/(\d+),(\d+),(\d+)$/.exec(tail);
          if (!first) throw new RangeError("Invalid International initial checkpoint");
          const [block, offset, catalogue, permutation] = first.slice(1).map(Number);
          if (!Number.isSafeInteger(block) || offset >= blockSize) throw new RangeError("Invalid International checkpoint offset");
          active.start = block * blockSize + offset;
          if (active.start >= bytes.length) throw new RangeError("International checkpoint outside bytes");
          const mark = { ordinal: 0, catalogue, permutation };
          checkMark(mark);
          active.marks.push(mark);
          local.push(active);
        }
        slices.set(key, active);
      } else {
        const checkpoint = /^(\d+),(\d+),(\d+)$/.exec(line);
        if (!checkpoint || !active || active.uniform !== void 0) throw new RangeError("Unexpected International checkpoint");
        const [ordinal, catalogue, permutation] = checkpoint.slice(1).map(Number), mark = { ordinal, catalogue, permutation };
        checkMark(mark);
        if (ordinal <= active.marks.at(-1).ordinal || ordinal >= active.positions) throw new RangeError("Unordered International checkpoints");
        active.marks.push(mark);
      }
    }
    if (!source.indexText.trim()) throw new RangeError("Empty International index");
    local.sort((a, b) => a.start - b.start);
    for (let i = 0; i < local.length; i++) {
      const slice = local[i];
      slice.end = local[i + 1]?.start ?? bytes.length;
      const lastBlock = Math.floor(slice.start / blockSize) + slice.marks.length - 1;
      if (slice.end <= slice.start || lastBlock * blockSize >= slice.end) throw new RangeError("International slice extent exceeds bytes");
    }
  }
  function probe(board, side) {
    const location = internationalRank(board, side);
    if (!location) return null;
    if (legalMoves(board, "international", side).some((move) => move.captures.length)) return null;
    const slice = slices.get(location.key);
    if (!slice) return null;
    if (slice.uniform !== void 0) return slice.uniform;
    let block = 0, upper = slice.marks.length;
    while (block + 1 < upper) {
      const middle = Math.floor((block + upper) / 2);
      if (slice.marks[middle].ordinal <= location.ordinal) block = middle;
      else upper = middle;
    }
    const mark = slice.marks[block], end = Math.min(slice.end, (Math.floor(slice.start / blockSize) + block + 1) * blockSize);
    let cursor = block === 0 ? slice.start : (Math.floor(slice.start / blockSize) + block) * blockSize, ordinal = mark.ordinal;
    const data = slice.bytes.range(cursor, end), first = cursor;
    while (cursor < end) {
      const token = data[cursor++ - first], entry = mark.catalogue * 256 + token, length = lengths[entry];
      if (ordinal + length > location.ordinal) {
        let run = offsets[entry], within = location.ordinal - ordinal;
        while (run + 2 < runs.length) {
          const value = runs[run], count = runs[run + 1] + 256 * runs[run + 2];
          if (within < count) {
            const decoded = mark.permutation >> 2 * value & 3;
            return decoded === 1 ? 1 : decoded === 2 ? -1 : decoded === 3 ? 0 : null;
          }
          within -= count;
          run += 3;
        }
        return null;
      }
      ordinal += length;
    }
    return null;
  }
  return Object.freeze({ probe, locate: internationalRank, coverage: () => ({ files: [...names].sort(), slices: slices.size, bytes: totalBytes, maximumPieces: 6, scope: "International theoretical board-only WLD v2; current-side captures require exact resolution; absent slices remain unknown" }) });
}

// ../../contract/rng.ts
var TWO_POW_32 = 4294967296;
function mix(seed, step) {
  let h = (seed ^ Math.imul(step + 1663821227, 2654435761)) >>> 0;
  h = Math.imul(h ^ h >>> 16, 2246822507) >>> 0;
  h = Math.imul(h ^ h >>> 13, 3266489909) >>> 0;
  h = (h ^ h >>> 16) >>> 0;
  h = Math.imul(h ^ h >>> 15, 739982445) >>> 0;
  h = Math.imul(h ^ h >>> 12, 695872825) >>> 0;
  return (h ^ h >>> 15) >>> 0;
}
function nextFloat(rng) {
  return [mix(rng.seed, rng.step) / TWO_POW_32, { seed: rng.seed, step: rng.step + 1 }];
}
function nextInt(rng, min, max) {
  const [f, next] = nextFloat(rng);
  const span = Math.max(0, Math.floor(max) - Math.ceil(min) + 1);
  return [Math.ceil(min) + Math.floor(f * span), next];
}
function shuffle(rng, items) {
  const out = [...items];
  let state = rng;
  for (let i = out.length - 1; i > 0; i--) {
    const [j, next] = nextInt(state, 0, i);
    state = next;
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return [out, state];
}
function pick(rng, items) {
  if (items.length === 0) throw new Error("pick: empty list");
  const [i, next] = nextInt(rng, 0, items.length - 1);
  return [items[i], next];
}

// src/international-search.ts
function searchWithInternationalBlocks(request, sources, dictionary) {
  let cursor = { ...request.cursor };
  const rng = {
    float() {
      const [value, next] = nextFloat(cursor);
      cursor = next;
      return value;
    },
    int(min, max) {
      const [value, next] = nextInt(cursor, min, max);
      cursor = next;
      return value;
    },
    pick(items) {
      const [value, next] = pick(cursor, items);
      cursor = next;
      return value;
    },
    shuffle(items) {
      const [value, next] = shuffle(cursor, items);
      cursor = next;
      return value;
    },
    chance(probability) {
      return rng.float() < probability;
    },
    state() {
      return { ...cursor };
    }
  };
  if (request.skill !== "sharp") return { report: searchMove(request.position, request.settings, rng, request.skill), cursor };
  const database = createInternationalBlockDatabase(sources, dictionary), missing = /* @__PURE__ */ new Map();
  const report = searchMove(request.position, request.settings, rng, request.skill, (board, variant, side) => {
    try {
      return probeEndgame2(board, variant, side, database);
    } catch (error) {
      if (!(error instanceof MissingInternationalBlock)) throw error;
      const need = { file: error.file, offset: error.offset, length: error.length };
      missing.set(need.file + ":" + need.offset, need);
      return null;
    }
  });
  if (missing.size) return { missing: [...missing.values()].sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : a.offset - b.offset) };
  return { report, cursor };
}
export {
  searchWithInternationalBlocks
};
