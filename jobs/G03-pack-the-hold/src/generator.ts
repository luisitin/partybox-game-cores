import { createRng, nextInt, seedRng } from '../../../contract/rng.js';
import type { RngState } from '../../../contract/rng.js';
import { evaluateLayout, legalPlacements, normalize, orient } from './geometry.js';
import { solveExact } from './solver.js';
import type { Cell, Level, Placement, Template, Tier } from './types.js';
import { TIERS, FLIP_TIERS } from './tiers.js';

const VALUES = [120, 40, 30, 10] as const;
const DECOYS: readonly Cell[][] = [
  [[0, 0], [1, 0]], [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
];
export function templateLevel(template: Template, difficulty = 1, allowFlip = false): Level {
  return {
    width: 1 + Math.max(...template.cells.map(c => c[0])),
    height: 1 + Math.max(...template.cells.map(c => c[1])),
    cells: template.cells.map(c => [...c]), difficulty, allowFlip,
    crates: template.pieces.map((cells, i) => ({ id: `crate-${i + 1}`, cells: cells.map(c => [...c]), value: VALUES[i] as number })),
  };
}
/** All four expensive crates partition the hold; cheaper crates cannot improve it. */
export function certify(level: Level, witness: Placement[]): number {
  const packed = evaluateLayout(level, witness);
  if (!packed.valid || packed.cells.length !== level.cells.length || witness.length !== 4) throw new Error('invalid partition certificate');
  const ids = new Set(witness.map(p => p.crateId));
  for (const crate of level.crates) {
    if (ids.has(crate.id) ? crate.value < 2 * crate.cells.length : crate.value > crate.cells.length) throw new Error('invalid capacity certificate');
  }
  return packed.value;
}
export const holdKey = (cells: readonly Cell[]): string => cells.map(c => c.join(',')).join(';');
export function generateLevel(rng: RngState, difficulty: number, allowFlip = false, avoid: readonly string[] = []): {
  level: Level; optimum: number; solution: Placement[]; rng: RngState; nodes: number;
} {
  const tier = (allowFlip ? FLIP_TIERS : TIERS)[Math.max(0, Math.min(9, Math.trunc(difficulty) - 1))] as Tier;
  let state = rng;
  const draw = (min: number, max: number): number => { const [value, next] = nextInt(state, min, max); state = next; return value; };
  const fresh = tier.templates.filter(t => !avoid.includes(holdKey(t.cells)));
  const pool = fresh.length ? fresh : tier.templates;
  const template = pool[draw(0, pool.length - 1)] as Template;
  const level = templateLevel(template, tier.difficulty, allowFlip);
  const witness: Placement[] = [];
  for (let i = 0; i < 4; i++) {
    const rotation = draw(0, 3); const crate = level.crates[i] as typeof level.crates[number];
    crate.cells = orient(crate.cells, rotation);
    const anchor = template.anchors[i] as Cell;
    witness.push({ crateId: crate.id, x: anchor[0], y: anchor[1], rotation: (4 - rotation) % 4 });
  }
  const crateCount = draw(6, 12);
  for (let i = 4; i < crateCount; i++) {
    const shape = DECOYS[draw(0, DECOYS.length - 1)] as Cell[];
    level.crates.push({ id: `crate-${i + 1}`, cells: orient(shape, draw(0, 3)), value: 1 });
  }
  // Fisher–Yates avoids making premium crate order a visual clue.
  for (let i = level.crates.length - 1; i > 0; i--) {
    const j = draw(0, i); const a = level.crates[i] as typeof level.crates[number];
    level.crates[i] = level.crates[j] as typeof level.crates[number]; level.crates[j] = a;
  }
  const bound = certify(level, witness);
  const solution = solveExact(level);
  if (solution.value !== bound || !evaluateLayout(level, solution.placements).valid) throw new Error('exact solver/certificate mismatch');
  return { level, optimum: solution.value, solution: solution.placements, rng: state, nodes: solution.nodes };
}

/** Calibration policy: descending value, uniformly random legal placement, no backtracking. */
export function greedyValue(level: Level, seed: number): number {
  const rng = createRng(seed); const chosen: Placement[] = [];
  for (const crate of [...level.crates].sort((a, b) => b.value - a.value)) {
    const options = legalPlacements(level, crate).filter(p => evaluateLayout(level, [...chosen, p]).valid);
    if (options.length) chosen.push(rng.pick(options));
  }
  return evaluateLayout(level, chosen).value;
}

/** Offline candidate construction. Shapes and the connected hold are all original. */
export function makeTemplate(seed: number): Template {
  const rng = createRng(seed);
  const occupied = new Set<string>(); const globalPieces: Cell[][] = [];
  const neighbors = ([x, y]: Cell): Cell[] => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
  for (let i = 0; i < 4; i++) {
    const existing = globalPieces.flat();
    const starts: Cell[] = existing.length ? existing.flatMap(neighbors).filter(([x, y]) => x >= 0 && y >= 0 && x < 7 && y < 7 && !occupied.has(`${x},${y}`)) : [[3, 3]];
    if (!starts.length) return makeTemplate(seed + 100_003);
    const start = rng.pick(starts); const piece: Cell[] = [start]; occupied.add(start.join(','));
    const area = rng.int(2, 5);
    while (piece.length < area) {
      const frontier = piece.flatMap(neighbors).filter(([x, y]) => x >= 0 && y >= 0 && x < 7 && y < 7 && !occupied.has(`${x},${y}`));
      if (!frontier.length) return makeTemplate(seed + 100_003);
      const cell = rng.pick(frontier); occupied.add(cell.join(',')); piece.push(cell);
    }
    globalPieces.push(piece);
  }
  const all = globalPieces.flat(); const minX = Math.min(...all.map(c => c[0])); const minY = Math.min(...all.map(c => c[1]));
  return {
    cells: normalize(all), pieces: globalPieces.map(normalize),
    anchors: globalPieces.map(piece => [Math.min(...piece.map(c => c[0])) - minX, Math.min(...piece.map(c => c[1])) - minY]),
  };
}
export function wilson(successes: number, trials: number): readonly [number, number] {
  const z = 1.959963984540054; const p = successes / trials; const denom = 1 + z * z / trials;
  const mid = (p + z * z / (2 * trials)) / denom;
  const radius = z * Math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denom;
  return [Math.max(0, mid - radius), Math.min(1, mid + radius)];
}
export function levelForSeed(seed: number, difficulty: number, allowFlip = false): Level {
  return generateLevel(seedRng(seed), difficulty, allowFlip).level;
}
