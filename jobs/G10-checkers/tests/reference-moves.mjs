/**
 * Independent G10 move oracle, authored from WCDF/FMJD rules before reading
 * production move code. Original MIT code. No production imports/helpers.
 * Board: 32/50 dark squares top-to-bottom, left-to-right; top row starts col1.
 * +1/-1 men; +2/-2 kings. +1 moves toward row0, -1 toward the last row.
 * Full coordinate matrices are copied per jump rather than using adjacency
 * tables, bitboards, or in-place undo. Captured pieces remain blockers.
 */
const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

function dimensions(variant) {
  if (variant === 'american') return 8;
  if (variant === 'international') return 10;
  throw new RangeError('Unknown reference variant');
}

function coordinates(index, width) {
  const row = Math.floor(index / (width / 2));
  return [row, 2 * (index % (width / 2)) + (row % 2 === 0 ? 1 : 0)];
}

function indexAt(row, column, width) {
  return row * (width / 2) + Math.floor(column / 2);
}

function inside(row, column, width) {
  return row >= 0 && row < width && column >= 0 && column < width;
}

function matrixFor(board, width, side) {
  if (side !== 1 && side !== -1) throw new RangeError('Reference side must be +1 or -1');
  if (!Array.isArray(board) || board.length !== width * width / 2 ||
      board.some(piece => !Number.isInteger(piece) || piece < -2 || piece > 2)) {
    throw new RangeError('Malformed reference board');
  }
  const matrix = Array.from({ length: width }, () => Array(width).fill(0));
  for (let index = 0; index < board.length; index++) {
    const [row, column] = coordinates(index, width);
    matrix[row][column] = board[index];
  }
  return matrix;
}

function crowned(row, side, width) {
  return row === (side === 1 ? 0 : width - 1);
}

function orderedUnique(moves) {
  const distinct = new Map();
  for (const move of moves) distinct.set(JSON.stringify([move.path, move.captures, move.promotes]), move);
  return [...distinct.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, move]) => move);
}

export function referenceMoves(board, variant, side) {
  const width = dimensions(variant);
  const original = matrixFor(board, width, side);
  const international = variant === 'international';
  const captures = [];

  function captureTree(matrix, row, column, king, path, taken) {
    const options = [];
    const directions = king || international ? DIAGONALS : DIAGONALS.filter(([dr]) => dr === -side);
    for (const [dr, dc] of directions) {
      let enemyRow = row + dr;
      let enemyColumn = column + dc;
      if (king && international) {
        while (inside(enemyRow, enemyColumn, width) && matrix[enemyRow][enemyColumn] === 0) {
          enemyRow += dr;
          enemyColumn += dc;
        }
      }
      if (!inside(enemyRow, enemyColumn, width) || matrix[enemyRow][enemyColumn] * side >= 0) continue;
      const jumped = indexAt(enemyRow, enemyColumn, width);
      if (taken.includes(jumped)) continue;
      let landingRow = enemyRow + dr;
      let landingColumn = enemyColumn + dc;
      while (inside(landingRow, landingColumn, width) && matrix[landingRow][landingColumn] === 0) {
        options.push([landingRow, landingColumn, jumped]);
        if (!(king && international)) break;
        landingRow += dr;
        landingColumn += dc;
      }
    }

    if (options.length === 0) {
      if (taken.length !== 0) captures.push({
        path: path.slice(), captures: taken.slice(), promotes: !king && crowned(row, side, width)
      });
      return;
    }
    for (const [landingRow, landingColumn, jumped] of options) {
      const nextPath = [...path, indexAt(landingRow, landingColumn, width)];
      const nextTaken = [...taken, jumped];
      if (!international && !king && crowned(landingRow, side, width)) {
        captures.push({ path: nextPath, captures: nextTaken, promotes: true });
        continue;
      }
      const nextMatrix = matrix.map(line => line.slice());
      nextMatrix[row][column] = 0;
      nextMatrix[landingRow][landingColumn] = side * (king ? 2 : 1);
      // Taken enemies stay on the matrix: they block a flying king and the
      // separate taken list forbids jumping an enemy for a second time.
      captureTree(nextMatrix, landingRow, landingColumn, king, nextPath, nextTaken);
    }
  }

  for (let origin = 0; origin < board.length; origin++) {
    if (board[origin] * side <= 0) continue;
    const [row, column] = coordinates(origin, width);
    captureTree(original, row, column, Math.abs(board[origin]) === 2, [origin], []);
  }
  if (captures.length !== 0) {
    if (!international) return orderedUnique(captures);
    const longest = Math.max(...captures.map(move => move.captures.length));
    return orderedUnique(captures.filter(move => move.captures.length === longest));
  }

  const quiet = [];
  for (let origin = 0; origin < board.length; origin++) {
    const piece = board[origin];
    if (piece * side <= 0) continue;
    const [row, column] = coordinates(origin, width);
    const king = Math.abs(piece) === 2;
    const directions = king ? DIAGONALS : DIAGONALS.filter(([dr]) => dr === -side);
    for (const [dr, dc] of directions) {
      let landingRow = row + dr;
      let landingColumn = column + dc;
      while (inside(landingRow, landingColumn, width) && original[landingRow][landingColumn] === 0) {
        quiet.push({
          path: [origin, indexAt(landingRow, landingColumn, width)], captures: [],
          promotes: !king && crowned(landingRow, side, width)
        });
        if (!(king && international)) break;
        landingRow += dr;
        landingColumn += dc;
      }
    }
  }
  return orderedUnique(quiet);
}

/** Apply an already legal oracle move, without modifying the input board. */
export function referenceAfter(board, move, side) {
  const next = board.slice();
  const initialPiece = next[move.path[0]];
  next[move.path[0]] = 0;
  for (const captured of move.captures) next[captured] = 0;
  next[move.path.at(-1)] = move.promotes ? side * 2 : initialPiece;
  return next;
}

export function referenceMoveKey(move) {
  return JSON.stringify([move.path, move.captures, move.promotes]);
}
