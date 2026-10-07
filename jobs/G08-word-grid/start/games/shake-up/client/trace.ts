// Pure tracing helpers for the phone grid (unit-tested, no DOM).

/** Neighbours include diagonals. */
export function touching(a: number, b: number, size: number): boolean {
  if (a === b) return false;
  return Math.abs(Math.floor(a / size) - Math.floor(b / size)) <= 1 && Math.abs((a % size) - (b % size)) <= 1;
}

/**
 * Cell under a point, using hit CIRCLES (radius as a share of the cell) so a
 * diagonal drag through a corner does not clip the cubes beside it.
 * x, y are relative to the grid's top-left; w is the grid's width. −1 = none.
 */
export function hitCell(x: number, y: number, w: number, size: number, radius = 0.4): number {
  if (w <= 0 || x < 0 || y < 0 || x >= w || y >= w) return -1;
  const step = w / size;
  const col = Math.floor(x / step);
  const row = Math.floor(y / step);
  const cx = (col + 0.5) * step;
  const cy = (row + 0.5) * step;
  return Math.hypot(x - cx, y - cy) <= radius * step ? row * size + col : -1;
}

/** Drag step: extend to a new touching cell, or back up one cell. */
export function dragStep(path: readonly number[], cell: number, size: number): number[] {
  if (cell < 0) return path.slice();
  const last = path[path.length - 1];
  if (last === undefined) return [cell];
  if (cell === last) return path.slice();
  if (cell === path[path.length - 2]) return path.slice(0, -1);
  if (!path.includes(cell) && touching(last, cell, size)) return [...path, cell];
  return path.slice();
}

/** Tap: extend if touching, undo if it is the last cell, else start again here. */
export function tapStep(path: readonly number[], cell: number, size: number): number[] {
  const last = path[path.length - 1];
  if (last === cell) return path.slice(0, -1);
  if (last !== undefined && !path.includes(cell) && touching(last, cell, size)) return [...path, cell];
  return [cell];
}

export function spell(letters: readonly string[], path: readonly number[]): string {
  return path.map((c) => letters[c] ?? '').join('').toUpperCase();
}

export function letterLen(word: string): number {
  return [...word].length;
}

export function points(len: number): number {
  return len >= 8 ? 11 : len === 7 ? 5 : len === 6 ? 3 : len === 5 ? 2 : len >= 3 ? 1 : 0;
}

/** mm:ss for the phone's clock line. */
export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
