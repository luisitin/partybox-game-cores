import type { Cell, Crate, Level, Placement } from './types.js';

export function normalize(cells: readonly Cell[]): Cell[] {
  if (!cells.length) return [];
  const minX = Math.min(...cells.map(c => c[0]));
  const minY = Math.min(...cells.map(c => c[1]));
  return cells.map(([x, y]): Cell => [x - minX, y - minY]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}
export function orient(cells: readonly Cell[], rotation: number): Cell[] {
  return normalize(cells.map(([x0, y0]): Cell => {
    let x = rotation >= 4 ? -x0 : x0; let y = y0;
    for (let k = 0; k < rotation % 4; k++) { const oldX = x; x = -y; y = oldX; }
    return [x, y];
  }));
}
export function placementCells(crate: Crate, placement: Placement): Cell[] {
  return orient(crate.cells, placement.rotation).map(([x, y]) => [x + placement.x, y + placement.y]);
}
export function legalPlacements(level: Level, crate: Crate): Placement[] {
  const inside = new Set(level.cells.map(c => c.join(',')));
  const seen = new Set<string>(); const result: Placement[] = [];
  for (let rotation = 0; rotation < (level.allowFlip ? 8 : 4); rotation++) {
    const shape = orient(crate.cells, rotation);
    const key = shape.map(c => c.join(',')).join(';');
    if (seen.has(key)) continue;
    seen.add(key);
    for (let y = 0; y < level.height; y++) for (let x = 0; x < level.width; x++) {
      if (shape.every(([a, b]) => inside.has(`${x + a},${y + b}`))) result.push({ crateId: crate.id, x, y, rotation });
    }
  }
  return result;
}
export function evaluateLayout(level: Level, placements: readonly Placement[]): { valid: boolean; value: number; cells: Cell[] } {
  const occupied = new Set<string>(); const used = new Set<string>(); const cells: Cell[] = [];
  const inside = new Set(level.cells.map(c => c.join(','))); let value = 0;
  for (const p of placements) {
    const crate = level.crates.find(c => c.id === p.crateId);
    if (!crate || used.has(p.crateId) || !Number.isInteger(p.x) || !Number.isInteger(p.y)
      || !Number.isInteger(p.rotation) || p.rotation < 0 || p.rotation >= (level.allowFlip ? 8 : 4)) return { valid: false, value: 0, cells: [] };
    used.add(p.crateId);
    for (const cell of placementCells(crate, p)) {
      const key = cell.join(',');
      if (!inside.has(key) || occupied.has(key)) return { valid: false, value: 0, cells: [] };
      occupied.add(key); cells.push(cell);
    }
    value += crate.value;
  }
  return { valid: true, value, cells };
}
