import { performance } from 'node:perf_hooks';
import { writeFileSync, mkdirSync } from 'node:fs';
import { generateLevel } from '../.build/jobs/G03-pack-the-hold/src/generator.js';
import { seedRng } from '../.build/contract/rng.js';
const rows = [];
for (const allowFlip of [false, true]) for (let difficulty = 1; difficulty <= 10; difficulty++) {
  const ms = []; const nodes = [];
  for (let seed = 0; seed < 100; seed++) {
    const at = performance.now(); const result = generateLevel(seedRng(seed), difficulty, allowFlip);
    ms.push(performance.now() - at); nodes.push(result.nodes);
  }
  const sorted = [...ms].sort((a, b) => a - b);
  rows.push({ difficulty, allowFlip, levels: 100, minMs: sorted[0], medianMs: sorted[50], p95Ms: sorted[95], maxMs: sorted[99], maxNodes: Math.max(...nodes) });
}
mkdirSync('.tmp', { recursive: true }); writeFileSync('.tmp/solve-times.json', JSON.stringify(rows, null, 2) + '\n'); console.log(JSON.stringify({ generatedLevels: 2000, unit: 'milliseconds including generation/certificate/solver', rows }));
