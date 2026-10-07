// Lookups on a sorted (code-unit order) word array. No trie, no cache, no
// module-level state: binary search keeps a 270k–640k list cheap to query.

export type WordList = readonly string[];

/** Index of the first entry ≥ key. */
export function lowerBound(words: WordList, key: string): number {
  let lo = 0;
  let hi = words.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((words[mid] as string) < key) lo = mid + 1;
    else hi = mid;
  }
  return lo;
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
