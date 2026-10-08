// Original independent in-memory reader for Kingsrow International WLD v2.
// Format facts: eygilbert/egdb_intl; no production module or source function is imported.
// Supplied dictionary arrays retain their separate Boost licence/provenance.
import { referenceMoves } from './reference-moves.mjs';

const BLOCK_BYTES = 4096;
const SUBSLICE_POSITIONS = 2 ** 31;

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || n < k) return 0;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
  return Math.round(result);
}

function colex(squares) {
  return squares.reduce((total, square, index) => total + choose(square, index + 1), 0);
}

function validBoard(board, side) {
  return Array.isArray(board) && board.length === 50 && (side === 1 || side === -1)
    && board.every((piece, index) => [0, 1, -1, 2, -2].includes(piece)
      && !(piece === 1 && index < 5) && !(piece === -1 && index >= 45));
}

function split(board) {
  const kinds = { bm: [], bk: [], wm: [], wk: [] };
  board.forEach((piece, index) => {
    if (piece === -1) kinds.bm.push(index);
    else if (piece === -2) kinds.bk.push(index);
    else if (piece === 1) kinds.wm.push(index);
    else if (piece === 2) kinds.wk.push(index);
  });
  return kinds;
}

function materialSize(bm, bk, wm, wk) {
  let men = 0;
  for (let back = 0; back <= Math.min(bm, 5); back++) {
    men += choose(5, back) * choose(40, bm - back) * choose(45 - bm + back, wm);
  }
  return men * choose(50 - bm - wm, bk) * choose(50 - bm - wm - bk, wk);
}

/** Raw original-format rank; capture/history exclusions are a separate probe contract. */
export function referenceInternationalRank(board, side) {
  if (!validBoard(board, side)) return null;
  let kinds = split(board);
  const nb = kinds.bm.length + kinds.bk.length;
  const nw = kinds.wm.length + kinds.wk.length;
  const pieces = nb + nw;
  if (!nb || !nw || pieces > 6 || nb > 5 || nw > 5) return null;
  const reversed = nw > nb || (nw === nb && (kinds.wk.length > kinds.bk.length
    || (kinds.wk.length === kinds.bk.length && side === 1)));
  if (reversed) {
    board = board.map((_, index) => -board[49 - index]);
    side = -side;
    kinds = split(board);
  }
  const { bm: blackMen, bk: blackKings, wm: whiteMen, wk: whiteKings } = kinds;
  const bm = blackMen.length, bk = blackKings.length, wm = whiteMen.length, wk = whiteKings.length;
  const backMen = blackMen.filter(square => square < 5);
  const outerMen = blackMen.filter(square => square >= 5);
  const back = backMen.length;
  let precedingGroups = 0;
  for (let earlier = Math.min(bm, 5); earlier > back; earlier--) {
    precedingGroups += choose(5, earlier) * choose(40, bm - earlier) * choose(45 - bm + earlier, wm);
  }
  const whiteRanks = [...whiteMen].reverse().map(square => 49 - square
    - blackMen.filter(black => black > square).length);
  const menRank = precedingGroups + colex(backMen) + choose(5, back)
    * (colex(outerMen.map(square => square - 5)) + choose(40, bm - back) * colex(whiteRanks));
  const occupiedMen = [...blackMen, ...whiteMen];
  const blackKingRank = colex(blackKings.map(square => square
    - occupiedMen.filter(taken => taken < square).length));
  const occupiedBeforeWhiteKings = [...occupiedMen, ...blackKings];
  const whiteKingRank = colex(whiteKings.map(square => square
    - occupiedBeforeWhiteKings.filter(taken => taken < square).length));
  const index = whiteKingRank + choose(50 - bm - wm - bk, wk)
    * (blackKingRank + choose(50 - bm - wm, bk) * menRank);
  const positions = materialSize(bm, bk, wm, wk);
  if (!Number.isSafeInteger(index) || index < 0 || index >= positions) throw new Error('Reference International rank is outside its material slice');
  const subslice = Math.floor(index / SUBSLICE_POSITIONS);
  const ordinal = index - subslice * SUBSLICE_POSITIONS;
  const key = `BASE${bm},${bk},${wm},${wk},${subslice},${side === -1 ? 'b' : 'w'}`;
  const file = pieces <= 5 ? `db${pieces}` : `db6-${bm}${bk}${wm}${wk}`;
  return { key, file, index, subslice, ordinal, positions, reversed, side, material: [bm, bk, wm, wk] };
}

function integer(text) {
  if (!/^\d+$/u.test(text)) throw new Error('Invalid nonnegative index integer');
  const result = Number(text);
  if (!Number.isSafeInteger(result)) throw new Error('Index integer exceeds safe precision');
  return result;
}

function permutation(index) {
  if (!Number.isInteger(index) || index < 0 || index > 255) throw new Error('Invalid International value permutation');
  const values = [index & 3, (index >>> 2) & 3, (index >>> 4) & 3, (index >>> 6) & 3];
  if (new Set(values).size !== 4) throw new Error('Repeated value in International permutation');
  return values;
}

function parseFiles(files) {
  if (!(files instanceof Map)) throw new Error('Reference International files must be a Map');
  const slices = new Map();
  const names = [];
  for (const [name, supplied] of files) {
    if (!/^db(?:[2-5]|6-\d{4})$/u.test(name) || !(supplied?.data instanceof Uint8Array)
      || typeof supplied.indexText !== 'string') throw new Error('Invalid International file input');
    const physical = [];
    let current = null;
    for (const raw of supplied.indexText.split(/\r?\n/u)) {
      const line = raw.trim();
      if (!line) continue;
      const base = /^BASE(\d+),(\d+),(\d+),(\d+),(\d+),([bw]):(.+)$/u.exec(line);
      if (base) {
        const [bm, bk, wm, wk, subslice] = base.slice(1, 6).map(integer);
        const pieces = bm + bk + wm + wk;
        if (pieces < 2 || pieces > 6 || bm + bk < 1 || wm + wk < 1 || bm + bk > 5 || wm + wk > 5
          || (pieces <= 5 ? name !== `db${pieces}` : name !== `db6-${bm}${bk}${wm}${wk}`)) throw new Error('Index/file material mismatch');
        const positions = materialSize(bm, bk, wm, wk);
        const size = Math.min(SUBSLICE_POSITIONS, positions - subslice * SUBSLICE_POSITIONS);
        if (size <= 0) throw new Error('Invalid International rank subslice');
        const key = base[0].slice(0, base[0].indexOf(':'));
        if (slices.has(key)) throw new Error('Duplicate International slice');
        const tail = base[7];
        const uniform = { '+': 1, '-': 2, '=': 3, '.': 0 }[tail];
        current = { key, size, data: supplied.data, blocks: [], material: [bm, bk, wm, wk], file: name };
        if (uniform !== undefined) {
          current.uniform = uniform;
        } else {
          const first = /^(\d+)\/(\d+),(\d+),(\d+)$/u.exec(tail);
          if (!first) throw new Error('Invalid first International checkpoint');
          const [block, offset, catalogue, mapping] = first.slice(1).map(integer);
          if (offset >= BLOCK_BYTES || catalogue >= 50) throw new Error('Invalid International checkpoint bounds');
          permutation(mapping);
          current.firstBlock = block;
          current.startByte = offset;
          current.start = block * BLOCK_BYTES + offset;
          current.blocks.push({ ordinal: 0, catalogue, mapping });
          if (current.start >= supplied.data.length) throw new Error('International slice starts beyond supplied bytes');
          physical.push(current);
        }
        slices.set(key, current);
      } else {
        const next = /^(\d+),(\d+),(\d+)$/u.exec(line);
        if (!next || !current || current.uniform !== undefined) throw new Error('Unexpected International index record');
        const [ordinal, catalogue, mapping] = next.slice(1).map(integer);
        if (ordinal <= current.blocks.at(-1).ordinal || ordinal >= SUBSLICE_POSITIONS || catalogue >= 50) throw new Error('Unordered International checkpoints');
        permutation(mapping);
        current.blocks.push({ ordinal, catalogue, mapping });
      }
    }
    if (!slices.size) throw new Error('Empty International index');
    physical.sort((left, right) => left.start - right.start);
    physical.forEach((slice, index) => {
      slice.end = physical[index + 1]?.start ?? supplied.data.length;
      if (slice.end <= slice.start || (slice.firstBlock + slice.blocks.length - 1) * BLOCK_BYTES >= slice.end) throw new Error('Invalid International encoded slice extent');
    });
    names.push(name);
  }
  return { slices, names: names.sort() };
}

function readTables(tables) {
  if (!tables || tables.lengths?.length !== 50 || tables.offsets?.length !== 50
    || !tables.valueRuns?.length) throw new Error('Invalid International dictionary tables');
  const valueRuns = Uint8Array.from(tables.valueRuns);
  if ([...tables.valueRuns].some(value => !Number.isInteger(value) || value < 0 || value > 255)) throw new Error('Invalid International value-run byte');
  const dictionaries = tables.lengths.map((lengths, catalogue) => {
    const offsets = tables.offsets[catalogue];
    if (lengths.length !== 256 || offsets.length !== 256) throw new Error('Invalid International dictionary width');
    return Array.from(lengths, (length, token) => {
      const offset = offsets[token];
      if (!Number.isInteger(length) || length < 1 || length > 65535 || !Number.isInteger(offset)
        || offset < 0 || offset >= valueRuns.length) throw new Error('Invalid International dictionary entry');
      let cursor = offset, total = 0;
      const runs = [];
      while (cursor < valueRuns.length && valueRuns[cursor] !== 6) {
        if (valueRuns[cursor] > 3 || cursor + 2 >= valueRuns.length) throw new Error('Invalid International virtual run');
        const count = valueRuns[cursor + 1] + 256 * valueRuns[cursor + 2];
        if (!count || total + count > length) throw new Error('Invalid International run length');
        runs.push({ value: valueRuns[cursor], count });
        total += count;
        cursor += 3;
      }
      if (cursor >= valueRuns.length || total !== length) throw new Error('Unterminated/inconsistent International token');
      return { length, runs };
    });
  });
  return dictionaries;
}

/** Input bytes/tables are supplied in memory; this module performs no file/network I/O. */
export function createReferenceInternational(files, tables) {
  const { slices, names } = parseFiles(files);
  const dictionaries = readTables(tables);
  const labels = [null, 'win', 'loss', 'draw'];

  function locate(board, side) {
    return referenceInternationalRank(board, side);
  }

  function probe(board, side) {
    if (!validBoard(board, side)) return null;
    const own = board.filter(piece => piece * side > 0).length;
    const opponent = board.filter(piece => piece * side < 0).length;
    if (!own && !opponent) return null;
    if (!own) return 'loss';
    if (!opponent) return 'win';
    const location = locate(board, side);
    if (!location || referenceMoves(board, 'international', side).some(move => move.captures.length)) return null;
    const slice = slices.get(location.key);
    if (!slice || location.ordinal >= slice.size) return null;
    if (slice.uniform !== undefined) return labels[slice.uniform];
    let checkpoint = 0;
    while (checkpoint + 1 < slice.blocks.length && slice.blocks[checkpoint + 1].ordinal <= location.ordinal) checkpoint++;
    const block = slice.blocks[checkpoint];
    const blockStart = (slice.firstBlock + checkpoint) * BLOCK_BYTES;
    let byte = blockStart + (checkpoint === 0 ? slice.startByte : 0);
    const end = Math.min(blockStart + BLOCK_BYTES, slice.end);
    let position = block.ordinal;
    const mapping = permutation(block.mapping);
    while (byte < end) {
      const token = dictionaries[block.catalogue][slice.data[byte++]];
      if (position + token.length > location.ordinal) {
        for (const run of token.runs) {
          if (position + run.count > location.ordinal) return labels[mapping[run.value]];
          position += run.count;
        }
        throw new Error('International token did not contain requested rank');
      }
      position += token.length;
    }
    throw new Error('International checkpoint does not span requested rank');
  }

  const coverage = Object.freeze({ files: Object.freeze(names), sliceCount: slices.size,
    materialTuples: Object.freeze([...new Set([...slices.values()].map(slice => slice.material.join(',')))].sort()) });
  return Object.freeze({ probe, locate, coverage,
    scope: 'International theoretical WDL v2, supplied material only, at most six pieces; current captures excluded, draw history absent.' });
}
