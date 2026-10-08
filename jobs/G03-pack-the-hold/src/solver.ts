import { legalPlacements, placementCells } from './geometry.js';
import type { Level, Placement, Solution } from './types.js';

/** Generic exact weighted set packing, not restricted to the generated bank. */
export function solveExact(level: Level): Solution {
  const indices = new Map(level.cells.map((c, i) => [c.join(','), i]));
  const crates = [...level.crates].sort((a, b) => b.value - a.value || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const candidates = crates.map(crate => legalPlacements(level, crate).map(placement => {
    let mask = 0n;
    for (const cell of placementCells(crate, placement)) mask |= 1n << BigInt(indices.get(cell.join(',')) as number);
    return { placement, mask };
  }));
  const count = crates.length; const capacity = level.cells.length;
  const bounds = Array.from({ length: count + 1 }, () => Array<number>(capacity + 1).fill(0));
  for (let i = count - 1; i >= 0; i--) {
    const crate = crates[i] as typeof crates[number];
    for (let free = 0; free <= capacity; free++) {
      const skip = bounds[i + 1]?.[free] ?? 0;
      const include = free >= crate.cells.length ? crate.value + (bounds[i + 1]?.[free - crate.cells.length] ?? 0) : 0;
      (bounds[i] as number[])[free] = Math.max(skip, include);
    }
  }
  let value = 0; let placements: Placement[] = []; let nodes = 0; let pruned = 0;
  const memo = Array.from({ length: count }, () => new Map<bigint, number>());
  const path: Placement[] = [];
  function search(i: number, occupied: bigint, used: number, score: number): void {
    nodes++;
    if (score > value) { value = score; placements = [...path]; }
    if (i === count) return;
    if (score + (bounds[i]?.[capacity - used] ?? 0) <= value) { pruned++; return; }
    const previous = memo[i]?.get(occupied);
    if (previous !== undefined && previous >= score) { pruned++; return; }
    memo[i]?.set(occupied, score);
    const crate = crates[i] as typeof crates[number];
    for (const candidate of candidates[i] ?? []) {
      if ((occupied & candidate.mask) !== 0n) continue;
      path.push(candidate.placement);
      search(i + 1, occupied | candidate.mask, used + crate.cells.length, score + crate.value);
      path.pop();
      if (score + (bounds[i]?.[capacity - used] ?? 0) <= value) break;
    }
    search(i + 1, occupied, used, score);
  }
  search(0, 0n, 0, 0);
  return { value, placements, nodes, pruned };
}
