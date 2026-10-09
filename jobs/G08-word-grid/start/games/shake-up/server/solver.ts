// Grid solver: depth-first over neighbours, pruned by prefix lookups.
// Used for "the best word nobody found" and by the bot (on its own word list).
import { prefixRange, type WordList } from './dict';
import { neighbours } from './rules';

export type Found = { w: string; path: number[] };

/**
 * Every word in `words` that the grid can spell, first path found per word,
 * in a stable order (by first cell, then depth-first). Capped for safety.
 */
export function solve(grid: readonly string[], size: number, words: WordList, minLen: number, cap = Number.POSITIVE_INFINITY): Found[] {
  const adj = neighbours(size);
  const out: Found[] = [];
  const seen = new Set<string>();
  const used = new Array<boolean>(grid.length).fill(false);
  const path: number[] = [];

  const walk = (cell: number, prefix: string, lo: number, hi: number): void => {
    if (out.length >= cap) return;
    const w = prefix + (grid[cell] ?? '');
    const [start, end] = prefixRange(words, w, lo, hi);
    if (start === end) return;
    used[cell] = true;
    path.push(cell);
    if ([...w].length >= minLen && !seen.has(w) && words[start] === w) {
      seen.add(w);
      out.push({ w, path: path.slice() });
    }
    for (const nb of adj[cell] ?? []) if (!used[nb]) walk(nb, w, start, end);
    path.pop();
    used[cell] = false;
  };

  for (let c = 0; c < grid.length; c++) walk(c, '', 0, words.length);
  return out;
}

/** Longest word in `all` that is not in `taken`; ties → alphabetical. */
export function bestMissed(all: readonly Found[], taken: ReadonlySet<string>): Found | null {
  let best: Found | null = null;
  for (const f of all) {
    if (taken.has(f.w)) continue;
    const n = [...f.w].length;
    const bn = best ? [...best.w].length : -1;
    if (n > bn || (n === bn && best !== null && f.w < best.w)) best = f;
  }
  return best;
}
