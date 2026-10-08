// Original reference implementation of the published Chinook DB6 wire format.
// No production imports, Chinook source functions, bitboard tables, or file I/O.
// The slow coordinate/colex enumeration deliberately differs from the runtime.
import { referenceMoves } from './reference-moves.mjs';

export const REFERENCE_CHINOOK_TERMS = Object.freeze({
  database: 'Chinook project, University of Alberta',
  termsUrl: 'https://webdocs.cs.ualberta.ca/~chinook/Software/',
  archiveUrl: 'https://webdocs.cs.ualberta.ca/~chinook/DataBases/DB6.zip',
  formatSourceUrl: 'https://webdocs.cs.ualberta.ca/~chinook/databases/code.c',
  distribution: 'Free database use with Chinook acknowledgement; database sale is prohibited.',
  scope: 'American theoretical board-plus-side WDL; no repetition or move-count history.'
});

const SYMBOL = { '=': 'draw', '+': 'win', '-': 'loss' };
const TERNARY = ['draw', 'win', 'loss'];
const RUN_LENGTHS = [10, 15, 20, 25, 30, 40, 50, 60, 100, 200, 400, 800, 1600];

function binomial(n, k) {
  if (k < 0 || k > n || n < 0) return 0;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
  return Math.round(result);
}

function colexRank(ascending) {
  return ascending.reduce((sum, square, index) => sum + binomial(square, index + 1), 0);
}

// Colexicographic order: (0,1,2), (0,1,3), (0,2,3), (1,2,3), ...
function* colexCombinations(count, limit) {
  if (count === 0) { yield []; return; }
  for (let largest = count - 1; largest < limit; largest++) {
    for (const prefix of colexCombinations(count - 1, largest)) yield [...prefix, largest];
  }
}

function readSlices(indexText, dataLength) {
  if (typeof indexText !== 'string') throw new TypeError('Chinook index must be text');
  const slices = new Map();
  let current;
  for (const line of indexText.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const header = /^BASE(\d)(\d)(\d)(\d)\.(\d)(\d) ([+=-]{1,2})$/.exec(line);
    if (header) {
      if (current && current.uniform === null && current.end === undefined) throw new Error('Unterminated Chinook slice');
      const [bk, wk, bp, wp, br, wr] = header.slice(1, 7).map(Number);
      const key = header.slice(1, 5).join('') + '.' + header.slice(5, 7).join('');
      if (slices.has(key)) throw new Error('Duplicate Chinook slice');
      const symbols = header[7];
      if (symbols.length === 2 && symbols[0] !== symbols[1]) throw new Error('Invalid uniform Chinook symbol');
      current = { key, bk, wk, bp, wp, br, wr, default: SYMBOL[symbols[0]],
        uniform: symbols.length === 2 ? SYMBOL[symbols[0]] : null, checkpoints: [] };
      slices.set(key, current);
      continue;
    }
    if (!current || current.uniform !== null) throw new Error('Record outside a varying Chinook slice');
    const address = /^([SE])\s*(\d+)\s+(\d+)\/(\d+)\s*$/.exec(line);
    if (address) {
      const ordinal = Number(address[2]), block = Number(address[3]), byte = Number(address[4]);
      if (byte < 0 || byte >= 1024 || block * 1024 + byte > dataLength) throw new Error('Chinook address outside corpus');
      if (address[1] === 'S') {
        if (ordinal !== 0 || current.checkpoints.length) throw new Error('Invalid Chinook slice start');
        current.checkpoints.push({ ordinal, offset: block * 1024 + byte, block });
      } else {
        current.positionsWithPadding = ordinal;
        current.end = block * 1024 + byte;
        if (!current.checkpoints.length || current.end < current.checkpoints[0].offset) throw new Error('Invalid Chinook slice end');
      }
      continue;
    }
    const continuation = /^\.\s*(\d+)\s+(\d+)\s*$/.exec(line);
    if (!continuation || current.end !== undefined || !current.checkpoints.length) throw new Error('Invalid Chinook index record');
    const ordinal = Number(continuation[1]), block = Number(continuation[2]);
    const previous = current.checkpoints.at(-1);
    if (ordinal <= previous.ordinal || block <= previous.block || block * 1024 >= dataLength) throw new Error('Unordered Chinook checkpoint');
    current.checkpoints.push({ ordinal, offset: block * 1024, block });
  }
  if (!slices.size || (current.uniform === null && current.end === undefined)) throw new Error('Incomplete Chinook index');
  return slices;
}

function canonicalPieces(board, side) {
  if (!Array.isArray(board) || board.length !== 32 || (side !== 1 && side !== -1)) return null;
  const pieces = { bp: [], wp: [], bk: [], wk: [] };
  for (let index = 0; index < 32; index++) {
    const piece = board[index];
    if (![0, 1, -1, 2, -2].includes(piece)) return null;
    if ((piece === 1 && index < 4) || (piece === -1 && index >= 28)) return null;
    if (!piece) continue;
    // Verified against the published conversion TABLE, not its board diagram.
    // Our +1 starts at the bottom; source black starts at the top. The table
    // mirrors each numbered rank. Canonicalizing source white rotates/colors.
    const square = (side === 1 ? 31 - index : index) ^ 3;
    const key = (Math.sign(piece) === side ? 'b' : 'w') + (Math.abs(piece) === 1 ? 'p' : 'k');
    pieces[key].push(square);
  }
  for (const group of Object.values(pieces)) group.sort((a, b) => a - b);
  const count = Object.values(pieces).reduce((sum, group) => sum + group.length, 0);
  if (count > 6 || pieces.bp.length + pieces.bk.length === 0 || pieces.wp.length + pieces.wk.length === 0) return null;
  return pieces;
}

function compressedPositions(group, occupied) {
  return group.map(square => square - occupied.filter(other => other < square).length);
}

export function createReferenceChinook(data, indexText) {
  if (!(data instanceof Uint8Array)) throw new TypeError('Chinook data must be a Uint8Array');
  const slices = readSlices(indexText, data.length);
  const pawnPrefixes = new Map();

  function pawnPrefix(slice, blackMen) {
    if (!slice.bp) return 0;
    let lookup = pawnPrefixes.get(slice.key);
    if (!lookup) {
      lookup = new Map();
      let precedingWhitePositions = 0;
      for (const candidate of colexCombinations(slice.bp, 4 * (slice.br + 1))) {
        if (Math.floor(candidate.at(-1) / 4) !== slice.br) continue;
        lookup.set(candidate.join(','), precedingWhitePositions);
        if (slice.wp === 0) precedingWhitePositions++;
        else {
          const low = 4 * (7 - slice.wr);
          const broadSquares = 32 - low - candidate.filter(square => square >= low).length;
          const narrowSquares = 28 - low - candidate.filter(square => square >= low + 4).length;
          precedingWhitePositions += binomial(broadSquares, slice.wp) - binomial(narrowSquares, slice.wp);
        }
      }
      pawnPrefixes.set(slice.key, lookup);
    }
    return lookup.get(blackMen.join(','));
  }

  function locate(board, side) {
    const pieces = canonicalPieces(board, side);
    if (!pieces) return null;
    const { bp, wp, bk, wk } = pieces;
    const br = bp.length ? Math.floor(bp.at(-1) / 4) : 0;
    const wr = wp.length ? Math.floor((31 - wp[0]) / 4) : 0;
    const key = `${bk.length}${wk.length}${bp.length}${wp.length}.${br}${wr}`;
    const slice = slices.get(key);
    if (!slice) return null;
    if (slice.uniform !== null) return { key, ordinal: null, uniform: slice.uniform };
    const prefix = pawnPrefix(slice, bp);
    if (prefix === undefined) return null;
    const reversedWhite = wp.map(square => 31 - square - bp.filter(other => other > square).length).sort((a, b) => a - b);
    const lowerWhiteSquares = 4 * wr - bp.filter(square => square >= 32 - 4 * wr).length;
    const whiteRank = wp.length ? colexRank(reversedWhite) - binomial(lowerWhiteSquares, wp.length) : 0;
    const men = [...bp, ...wp];
    const blackKingRank = colexRank(compressedPositions(bk, men));
    const whiteKingRank = colexRank(compressedPositions(wk, [...men, ...bk]));
    const whiteKingCount = binomial(32 - men.length - bk.length, wk.length);
    const blackKingCount = binomial(32 - men.length, bk.length);
    const ordinal = ((prefix + whiteRank) * blackKingCount + blackKingRank) * whiteKingCount + whiteKingRank;
    if (!Number.isSafeInteger(ordinal) || ordinal < 0 || ordinal >= slice.positionsWithPadding) return null;
    return { key, ordinal, uniform: null };
  }

  function decode(location) {
    if (location.uniform !== null) return location.uniform;
    const slice = slices.get(location.key);
    let left = 0, right = slice.checkpoints.length - 1;
    while (left < right) {
      const middle = Math.ceil((left + right) / 2);
      if (slice.checkpoints[middle].ordinal <= location.ordinal) left = middle;
      else right = middle - 1;
    }
    const checkpoint = slice.checkpoints[left];
    const limit = Math.min(slice.end, (checkpoint.block + 1) * 1024);
    let ordinal = checkpoint.ordinal;
    for (let cursor = checkpoint.offset; cursor < limit; cursor++) {
      const byte = data[cursor];
      const span = byte < 243 ? 5 : RUN_LENGTHS[byte - 243];
      if (location.ordinal < ordinal + span) {
        if (byte >= 243) return slice.default;
        const exponent = 4 - (location.ordinal - ordinal);
        return TERNARY[Math.floor(byte / 3 ** exponent) % 3];
      }
      ordinal += span;
    }
    return null;
  }

  function probe(board, side) {
    if (!canonicalPieces(board, side)) return null;
    // The author's stored-corpus contract excludes capture threats for either
    // side. The current side must search quiet moves if only the opponent has
    // a threat; flipping side and negating is not an exact substitute.
    if (referenceMoves(board, 'american', side).some(move => move.captures.length) ||
        referenceMoves(board, 'american', -side).some(move => move.captures.length)) return null;
    const location = locate(board, side);
    if (!location) return null;
    return decode(location);
  }

  const tuples = [...new Set([...slices.values()].map(slice => `${slice.bk}${slice.wk}${slice.bp}${slice.wp}`))].sort();
  return { probe, locate, slices, coverage: { sliceCount: slices.size, pieceTypeTuples: tuples }, scope: REFERENCE_CHINOOK_TERMS.scope };
}
