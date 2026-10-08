// Independent verification oracle, written and sealed before production solver edits.
// It indexes dictionary characters in a trie and uses an explicit frontier with bit masks.
// It imports no production game code, RNG, adjacency table, dictionary lookup or scoring.
type Node = { word?: string; edges: Map<string, Node> };
export function referenceDictionary(words: readonly string[]): Node {
  const root: Node = { edges: new Map() };
  for (const word of words) {
    let node = root;
    for (const letter of word) {
      let child = node.edges.get(letter);
      if (!child) { child = { edges: new Map() }; node.edges.set(letter, child); }
      node = child;
    }
    node.word = word;
  }
  return root;
}
export function referenceSolve(grid: readonly string[], width: number, dict: Node, minimum: number): Map<string, number[]> {
  type Visit = { last: number; node: Node; mask: number; path: number[] };
  const frontier: Visit[] = [];
  const found = new Map<string, number[]>();
  const follow = (node: Node, text: string): Node | undefined => {
    let cursor: Node | undefined = node;
    for (const letter of text) { cursor = cursor?.edges.get(letter); if (!cursor) break; }
    return cursor;
  };
  for (let i = grid.length - 1; i >= 0; i--) {
    const next = follow(dict, grid[i] ?? '');
    if (next) frontier.push({ last: i, node: next, mask: 1 << i, path: [i] });
  }
  while (frontier.length) {
    const v = frontier.pop()!;
    if (v.node.word && Array.from(v.node.word).length >= minimum && !found.has(v.node.word)) found.set(v.node.word, v.path);
    const row = Math.floor(v.last / width), col = v.last % width;
    for (let r = row + 1; r >= row - 1; r--) for (let c = col + 1; c >= col - 1; c--) {
      if (r < 0 || c < 0 || r >= width || c >= width) continue;
      const at = r * width + c;
      if (v.mask & (1 << at)) continue;
      const next = follow(v.node, grid[at] ?? '');
      if (next) frontier.push({ last: at, node: next, mask: v.mask | (1 << at), path: [...v.path, at] });
    }
  }
  return found;
}
export function referencePath(grid: readonly string[], width: number, path: readonly number[], word: string): boolean {
  if (!path.length || new Set(path).size !== path.length || path.some(p => !Number.isInteger(p) || p < 0 || p >= grid.length)) return false;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!, b = path[i]!;
    if (Math.abs(a % width - b % width) > 1 || Math.abs(Math.floor(a / width) - Math.floor(b / width)) > 1) return false;
  }
  return path.map(p => grid[p]).join('') === word;
}
