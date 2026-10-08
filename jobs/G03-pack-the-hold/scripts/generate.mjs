import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { game } from '../.build/jobs/G03-pack-the-hold/src/core.js';
import { createRng } from '../.build/contract/rng.js';
import { stateSchema, levelSchema, cellSchema } from '../.build/jobs/G03-pack-the-hold/src/schema.js';
import { gameManifestSchema } from '../.build/contract-validation.mjs';

// Reload the calibrated core in a fresh process: ES module imports are cached.
if (!process.argv.includes('--fixtures-only')) {
  execFileSync(process.execPath, ['scripts/calibrate.mjs'], { stdio: 'inherit' });
  execFileSync('node_modules/.bin/tsc', ['-p', 'tsconfig.json'], { stdio: 'inherit' });
  execFileSync(process.execPath, [import.meta.filename, '--fixtures-only'], { stdio: 'inherit' });
  process.exit(0);
}
const json = (name, value) => writeFileSync(name, JSON.stringify(value, null, 2) + '\n');
mkdirSync('fixtures', { recursive: true }); mkdirSync('schemas', { recursive: true });
const roster = Array.from({ length: 4 }, (_, i) => ({ id: `p${i}`, name: `Player ${i + 1}`, avatarId: `${i}`, connected: true, bot: true }));
let s = game.init({ players: roster, settings: { rounds: 1, difficulty: 4 }, seed: 103, now: 1000 });
json('fixtures/pack.json', s);
for (let steps = 0; s.phase.id === 'pack'; steps++) {
  const playerId = s.order[s.seat]; const input = game.bot.sampleInput(s, playerId, createRng(steps), ['easy', 'normal', 'sharp', 'normal'][s.seat]);
  s = game.reduce(s, { type: 'input', playerId, input, now: s.phase.startedAt + 1 });
}
json('fixtures/reveal.json', s);
s = game.reduce(s, { type: 'input', playerId: 'p0', input: { type: 'next' }, now: s.phase.startedAt + 1 });
json('fixtures/done.json', s); json('manifest.json', game.manifest);
const templateSchema = z.object({ cells: z.array(cellSchema), pieces: z.array(z.array(cellSchema)).length(4), anchors: z.array(cellSchema).length(4) }).strict();
const tierSchema = z.object({ difficulty: z.number().int().min(1).max(10), templates: z.array(templateSchema).length(12), trials: z.literal(2000), solved: z.number().int().min(0).max(2000), solveRate: z.number().min(0).max(1), confidence95: z.tuple([z.number(), z.number()]), policy: z.string() }).strict();
const calibrationSchema = z.object({ schemaVersion: z.literal(1), humanRates: z.literal(false), policy: z.string(), candidateCount: z.literal(120), screeningTrials: z.literal(384), tiers: z.array(tierSchema).length(10), flip: z.array(tierSchema).length(10) }).strict();
const receipt = JSON.parse(readFileSync('research-access.json', 'utf8'));
// Research receipts are observations, preserved exactly rather than fabricated by re-fetching.
const researchSchema = z.object({ schemaVersion: z.literal(1), sources: z.array(z.object({ repo: z.string(), commit: z.string(), path: z.string(), url: z.string(), utc: z.string(), exit: z.number().int(), http: z.string(), error: z.string(), bytes: z.number().int(), sha256: z.string().regex(/^[a-f0-9]{64}$/), tls_verified: z.literal(true) }).strict()), blockedCandidates: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))) }).strict();
researchSchema.parse(receipt);
const framesSchema = z.object({ width: z.number().int().positive(), height: z.number().int().positive(), cpu: z.number().positive(), warmupFrames: z.number().int().nonnegative(), interaction: z.string(), frames: z.number().int().positive(), meanMs: z.number().positive(), p95Ms: z.number().positive(), maxMs: z.number().positive(), fps: z.number().positive(), overflow: z.boolean() }).strict();
const visualSchema = z.object({ schemaVersion: z.literal(1), chrome: z.string(), fileOpened: z.boolean(), serving: z.string(), desktop: framesSchema, phone: framesSchema, reducedMotion: z.boolean(), externalRequests: z.number().int().nonnegative(), runtimeExceptions: z.number().int().nonnegative(), completedTwoPlayerGame: z.boolean(), completedPlayerCounts: z.array(z.number().int().min(2).max(8)).length(7), pointerDrag: z.boolean(), touchDrag: z.boolean(), keyboardFocus: z.boolean(), keyboardPlacement: z.boolean(), longNamesFit: z.boolean(), videoBytes: z.number().int().positive().max(10_000_000) }).strict();
for (const [name, schema] of Object.entries({ state: stateSchema, level: levelSchema, manifest: gameManifestSchema, calibration: calibrationSchema, research: researchSchema, visual: visualSchema })) {
  json(`schemas/${name}.schema.json`, z.toJSONSchema(schema, { target: 'draft-2020-12', unrepresentable: 'any' }));
}
const seedsRng = createRng(0x103cafe); const seeds = new Set([1, 2, 3]); while (seeds.size < 1003) seeds.add(seedsRng.int(0, 0xffffffff));
json('data/property-seeds.json', [...seeds]);
json('schemas/seeds.schema.json', z.toJSONSchema(z.array(z.number().int().min(0).max(0xffffffff)).length(1003), { target: 'draft-2020-12' }));
const dataFiles = ['research-access.json', 'manifest.json', ...readdirSync('data').filter(f => f.endsWith('.json')).map(f => `data/${f}`), ...readdirSync('fixtures').map(f => `fixtures/${f}`), ...readdirSync('schemas').map(f => `schemas/${f}`)];
const media = (() => { try { return readdirSync('media').filter(f => /\.(?:webm|mp4|png|json)$/.test(f)).map(f => `media/${f}`); } catch { return []; } })();
writeFileSync('SHA256SUMS.txt', [...dataFiles, ...media].sort().map(f => `${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`).join('\n') + '\n');
console.log(JSON.stringify({ generated: dataFiles.length, fixtures: game.phases }));
