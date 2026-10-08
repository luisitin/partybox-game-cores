import type { Level } from './types.js';

/** Independent exhaustive coordinate-grid oracle. Intentionally no geometry imports. */
export function referenceOptimum(level: Level): number {
  const inside = new Set(level.cells.map(([x, y]) => `${x}:${y}`));
  const alternatives = level.crates.map(crate => {
    const result: string[][] = [];
    const seen = new Set<string>();
    for (let turn = 0; turn < (level.allowFlip ? 8 : 4); turn++) {
      const raw = crate.cells.map(([a, b]) => {
        let x = turn >= 4 ? -a : a; let y = b;
        for (let k = 0; k < turn % 4; k++) { const old = x; x = -y; y = old; }
        return [x, y];
      });
      const minX = Math.min(...raw.map(p => p[0] as number));
      const minY = Math.min(...raw.map(p => p[1] as number));
      const shape = raw.map(p => [(p[0] as number) - minX, (p[1] as number) - minY]);
      const signature = shape.map(p => p.join(':')).sort().join(';');
      if (seen.has(signature)) continue;
      seen.add(signature);
      for (let y = 0; y < level.height; y++) for (let x = 0; x < level.width; x++) {
        const cells = shape.map(p => `${(p[0] as number) + x}:${(p[1] as number) + y}`);
        if (cells.every(c => inside.has(c))) result.push(cells);
      }
    }
    return result;
  });
  function enumerate(index: number, occupied: Set<string>): number {
    if (index === level.crates.length) return 0;
    let best = enumerate(index + 1, occupied);
    for (const cells of alternatives[index] as string[][]) {
      if (cells.some(cell => occupied.has(cell))) continue;
      const next = new Set(occupied);
      for (const cell of cells) next.add(cell);
      best = Math.max(best, (level.crates[index]?.value ?? 0) + enumerate(index + 1, next));
    }
    return best;
  }
  return enumerate(0, new Set());
}
