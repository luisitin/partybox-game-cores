import { pathToFileURL } from 'node:url';
const base = process.env.G03_BUILD_DIR ? pathToFileURL(process.env.G03_BUILD_DIR + '/') : new URL('../.build/', import.meta.url);
export const { game, advance } = await import(new URL('jobs/G03-pack-the-hold/src/core.js', base));
export const { solveExact } = await import(new URL('jobs/G03-pack-the-hold/src/solver.js', base));
export const { referenceOptimum } = await import(new URL('jobs/G03-pack-the-hold/src/reference.js', base));
export const { orient, normalize, evaluateLayout, legalPlacements, placementCells } = await import(new URL('jobs/G03-pack-the-hold/src/geometry.js', base));
export const { generateLevel, certify, makeTemplate, templateLevel } = await import(new URL('jobs/G03-pack-the-hold/src/generator.js', base));
export const { stateSchema, levelSchema } = await import(new URL('jobs/G03-pack-the-hold/src/schema.js', base));
export const { createRng, seedRng } = await import(new URL('contract/rng.js', base));
export function players(count, ids) {
  return Array.from({ length: count }, (_, i) => ({ id: ids?.[i] ?? `p${i}`, name: `Player ${i + 1}`, avatarId: `${i}`, connected: true }));
}
export function start(seed = 1, count = 2, settings = {}) { return game.init({ players: players(count), settings: { rounds: 1, ...settings }, seed, now: 1000 }); }
export function input(s, value, playerId = s.order[s.seat]) { return game.reduce(s, { type: 'input', playerId, input: value, now: s.phase.startedAt + 1 }); }
export function timer(s) { return game.reduce(s, { type: 'timer', phaseId: s.phase.id, startedAt: s.phase.startedAt, now: s.phase.deadline }); }
export function finish(initial, skills = {}) {
  let s = initial; const events = []; let steps = 0;
  while (s.phase.id !== 'done') {
    if (++steps > 100) throw new Error('no completion');
    const id = s.order[s.seat]; const value = game.bot.sampleInput(s, id, createRng(steps), skills[id] ?? 'normal');
    const event = value ? { type: 'input', playerId: id, input: value, now: s.phase.startedAt + 1 } : { type: 'timer', phaseId: s.phase.id, startedAt: s.phase.startedAt, now: s.phase.deadline };
    events.push(event); s = game.reduce(s, event);
  }
  return { state: s, events };
}
export function propertySeeds() {
  const rng = createRng(0x103cafe); const set = new Set([1, 2, 3]);
  while (set.size < 1003) set.add(rng.int(0, 0xffffffff));
  return [...set];
}
