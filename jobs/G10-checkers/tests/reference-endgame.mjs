/**
 * Independent theoretical WDL solver. Original MIT code.
 * Uses the independently authored coordinate move oracle and synchronous
 * whole-graph fixed-point scans, never a production reverse-edge queue.
 * Draw history is intentionally absent: callers must label board-only scope.
 * A budget-truncated graph is incomplete and emits NO WDL entries.
 */
import { referenceMoves, referenceAfter } from './reference-moves.mjs';

export function referencePositionKey(board, variant, side) {
  return `${variant}:${side}:${board.join(',')}`;
}

export function referenceWdl(roots, variant, maxNodes = 50000) {
  if (!Number.isSafeInteger(maxNodes) || maxNodes < 1) throw new RangeError('Invalid graph budget');
  const graph = new Map();
  const queue = [];
  function add(board, side) {
    const key = referencePositionKey(board, variant, side);
    if (graph.has(key)) return key;
    if (board.filter(Boolean).length > 6) throw new RangeError('Reference endgame exceeds six pieces');
    // This also validates side, board shape, and signed piece codes.
    const moves = referenceMoves(board, variant, side);
    if (graph.size >= maxNodes) return null;
    const own = board.some(piece => piece * side > 0);
    const enemy = board.some(piece => piece * side < 0);
    let value = null;
    if (!own) value = 'loss';
    else if (!enemy) value = 'win';
    else if (moves.length === 0) value = 'loss';
    const node = {
      key, board: board.slice(), side, moves,
      successors: [], value, distance: value === null ? null : 0
    };
    graph.set(key, node);
    queue.push(node);
    return key;
  }
  for (const root of roots) if (add(root.board, root.side) === null) {
    return { complete: false, variant, enumeratedNodes: graph.size, entries: [] };
  }
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const node = queue[cursor];
    if (node.value !== null) continue;
    for (const move of node.moves) {
      const child = add(referenceAfter(node.board, move, node.side), -node.side);
      if (child === null) return { complete: false, variant, enumeratedNodes: graph.size, entries: [] };
      node.successors.push(child);
    }
  }

  let rounds = 0;
  while (true) {
    const updates = [];
    for (const node of graph.values()) {
      if (node.value !== null) continue;
      const children = node.successors.map(key => graph.get(key));
      const losses = children.filter(child => child.value === 'loss');
      if (losses.length !== 0) {
        updates.push([node, 'win', 1 + Math.min(...losses.map(child => child.distance))]);
      } else if (children.length !== 0 && children.every(child => child.value === 'win')) {
        updates.push([node, 'loss', 1 + Math.max(...children.map(child => child.distance))]);
      }
    }
    if (updates.length === 0) break;
    for (const [node, value, distance] of updates) {
      node.value = value;
      node.distance = distance;
    }
    rounds++;
  }
  for (const node of graph.values()) if (node.value === null) node.value = 'draw';
  const entries = [...graph.values()].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  return { complete: true, variant, scope: 'theoretical board-plus-side WDL; no draw history', rounds, enumeratedNodes: graph.size, entries };
}

/** Both sides one piece, all man/king types, with crowned-row men excluded. */
export function* referenceTwoPieceRoots(variant) {
  const width = variant === 'american' ? 8 : variant === 'international' ? 10 : null;
  if (width === null) throw new RangeError('Invalid reference variant');
  const count = width * width / 2;
  for (let positive = 0; positive < count; positive++) for (let negative = 0; negative < count; negative++) {
    if (positive === negative) continue;
    for (const positiveKind of [1, 2]) for (const negativeKind of [1, 2]) {
      if (positiveKind === 1 && Math.floor(positive / (width / 2)) === 0) continue;
      if (negativeKind === 1 && Math.floor(negative / (width / 2)) === width - 1) continue;
      const board = Array(count).fill(0);
      board[positive] = positiveKind;
      board[negative] = -negativeKind;
      yield { board, side: 1 };
      yield { board: board.slice(), side: -1 };
    }
  }
}

/** Validate each certificate against independently regenerated legal edges. */
export function referenceCertificateErrors(solution) {
  if (!solution.complete) return ['Graph is incomplete; no exact certificate'];
  const byKey = new Map(solution.entries.map(entry => [entry.key, entry]));
  const errors = [];
  for (const node of solution.entries) {
    const own = node.board.some(piece => piece * node.side > 0);
    const enemy = node.board.some(piece => piece * node.side < 0);
    const moves = referenceMoves(node.board, solution.variant, node.side);
    if (!own || !enemy || moves.length === 0) {
      const expected = !own || (enemy && moves.length === 0) ? 'loss' : 'win';
      if (node.value !== expected || node.distance !== 0) errors.push(`${node.key}: terminal`);
      continue;
    }
    const successors = moves.map(move => referencePositionKey(referenceAfter(node.board, move, node.side), solution.variant, -node.side));
    if (successors.some(key => !byKey.has(key))) {
      errors.push(`${node.key}: missing successor`);
      continue;
    }
    const children = successors.map(key => byKey.get(key));
    const lossChildren = children.filter(child => child.value === 'loss');
    if (node.value === 'win' && (lossChildren.length === 0 || node.distance !== 1 + Math.min(...lossChildren.map(child => child.distance)))) errors.push(`${node.key}: WIN condition`);
    if (node.value === 'loss' && (!children.every(child => child.value === 'win') || node.distance !== 1 + Math.max(...children.map(child => child.distance)))) errors.push(`${node.key}: LOSS condition`);
    if (node.value === 'draw' && (lossChildren.length !== 0 || !children.some(child => child.value === 'draw') || node.distance !== null)) errors.push(`${node.key}: DRAW condition`);
    if (!['win', 'loss', 'draw'].includes(node.value)) errors.push(`${node.key}: unknown outcome`);
  }
  return errors;
}
