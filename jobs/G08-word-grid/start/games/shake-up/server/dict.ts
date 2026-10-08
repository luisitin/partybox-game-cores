// Lookups on a sorted (code-unit order) word array. No trie, no cache, no
// module-level state: binary search keeps a 270k–640k list cheap to query.

export type WordList = readonly string[];

/** Index of the first entry ≥ key. */
export function lowerBound(words: WordList, key: string, lo = 0, hi = words.length): number {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((words[mid] as string) < key) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** A child prefix can only occur inside its parent's sorted range. Still binary search,
 * with no trie or mutable cache. The high sentinel is above all letters in these packs. */
export function prefixRange(words: WordList, prefix: string, lo = 0, hi = words.length): [number, number] {
  const start = lowerBound(words, prefix, lo, hi);
  return [start, lowerBound(words, prefix + '\uffff', start, hi)];
}

export function hasWord(words: WordList, w: string): boolean {
  const i = lowerBound(words, w);
  return words[i] === w;
}

export function hasPrefix(words: WordList, prefix: string): boolean {
  const hit = words[lowerBound(words, prefix)];
  return hit !== undefined && hit.startsWith(prefix);
}

export function isSorted(words: WordList): boolean {
  for (let i = 1; i < words.length; i++) if (!((words[i - 1] as string) < (words[i] as string))) return false;
  return true;
}
