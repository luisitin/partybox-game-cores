// Pure word-and-grid rules. No state, no content, no I/O.

export type GridSize = 4 | 5;

/** Lowercase, accents folded, ñ kept. "CAÑÓN" → "cañon". Never uses Intl. */
export function foldWord(raw: string): string {
  let out = '';
  for (const ch of raw.toLowerCase()) {
    if (ch === 'ñ') out += 'ñ';
    else if ('áàâäã'.includes(ch)) out += 'a';
    else if ('éèêë'.includes(ch)) out += 'e';
    else if ('íìîï'.includes(ch)) out += 'i';
    else if ('óòôöõ'.includes(ch)) out += 'o';
    else if ('úùûü'.includes(ch)) out += 'u';
    else if (ch === 'ç') out += 'c';
    else out += ch;
  }
  return out.trim();
}

/** Face as stored in state ("qu", "ñ", "e") → face as shown ("Qu", "Ñ", "E"). */
export function showFace(face: string): string {
  return face === 'qu' ? 'Qu' : face.toUpperCase();
}

export function showWord(word: string): string {
  return word.toUpperCase();
}

/** 4×4 needs 3+ letters, 5×5 needs 4+ (classic rule). */
export function minLength(size: GridSize): number {
  return size === 5 ? 4 : 3;
}

export function areNeighbours(a: number, b: number, size: number): boolean {
  if (a === b) return false;
  const ar = Math.floor(a / size);
  const br = Math.floor(b / size);
  const ac = a % size;
  const bc = b % size;
  return Math.abs(ar - br) <= 1 && Math.abs(ac - bc) <= 1;
}

function buildNeighbours(size: number): readonly (readonly number[])[] {
  const n = size * size;
  const table: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) if (areNeighbours(i, j, size)) row.push(j);
    table.push(row);
  }
  return table;
}
// Constant tables, built once at load (immutable; not game state).
const N4 = buildNeighbours(4);
const N5 = buildNeighbours(5);

/** Neighbour lists per cell. */
export function neighbours(size: number): readonly (readonly number[])[] {
  return size === 5 ? N5 : N4;
}

/** A legal trace: in-range integers, no repeats, each touching the last. */
export function isLegalPath(path: readonly number[], size: number): boolean {
  const n = size * size;
  if (path.length === 0 || path.length > n) return false;
  const seen = new Set<number>();
  for (let i = 0; i < path.length; i++) {
    const c = path[i];
    if (c === undefined || !Number.isInteger(c) || c < 0 || c >= n || seen.has(c)) return false;
    if (i > 0 && !areNeighbours(path[i - 1] as number, c, size)) return false;
    seen.add(c);
  }
  return true;
}

export function wordFromPath(grid: readonly string[], path: readonly number[]): string {
  let w = '';
  for (const c of path) w += grid[c] ?? '';
  return w;
}

/** Classic table: 3–4 letters 1 · 5 → 2 · 6 → 3 · 7 → 5 · 8+ → 11. "Qu" is two letters. */
export function pointsFor(word: string): number {
  const n = [...word].length;
  if (n >= 8) return 11;
  if (n === 7) return 5;
  if (n === 6) return 3;
  if (n === 5) return 2;
  return n >= 3 ? 1 : 0;
}

export function letterCount(word: string): number {
  return [...word].length;
}

/** First cell pair in a path that does not touch, for the phone's error line. */
export function firstBreak(path: readonly number[], size: number): [number, number] | null {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1] as number;
    const b = path[i] as number;
    if (!areNeighbours(a, b, size)) return [a, b];
  }
  return null;
}
