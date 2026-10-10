import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const root = resolve(import.meta.dirname, '..');
export const coreDir = resolve(process.env.CORE_DIR || resolve(root, 'dist'));
export const core = await import(pathToFileURL(resolve(coreDir, 'core.mjs')).href);
export const probabilityCore = await import(pathToFileURL(resolve(coreDir, 'probability.mjs')).href);
export const rulesCore = await import(pathToFileURL(resolve(coreDir, 'rules.mjs')).href);
export const contract = await import(pathToFileURL(resolve(coreDir, 'contract.mjs')).href);
export const skills = ['easy', 'normal', 'sharp'];
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const digest = (value) => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

export function roster(count = 3, ids = null, bot = true) {
  return Array.from({ length: count }, (_, index) => ({
    id: ids?.[index] ?? `p${index}`, name: `Player ${index + 1}`, avatarId: `face-${index}`,
    connected: true, bot, canSeeTv: true,
  }));
}
export function context(count = 3, seed = 1, settings = {}, ids = null, bot = true) {
  return { players: roster(count, ids, bot), settings, seed, now: 1000 };
}
export function makeState(count = 3, seed = 1, settings = {}, ids = null, bot = true) {
  return core.init(context(count, seed, settings, ids, bot));
}
export function input(state, value, playerId = state.turn, now = state.phase.startedAt + 1) {
  return { type: 'input', now, playerId, input: value };
}
export function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
export function assertJson(value, label = 'value', maxBytes = 256 * 1024) {
  const bytes = JSON.stringify(value);
  assert.ok(Buffer.byteLength(bytes) <= maxBytes, `${label} exceeds ${maxBytes} bytes`);
  assert.equal(JSON.stringify(JSON.parse(bytes)), bytes, `${label} byte JSON roundtrip`);
  assert.deepEqual(JSON.parse(bytes), value, `${label} changes through JSON`);
  return bytes;
}
export function checkReplayStep(state, twin, event, stats = null) {
  const before = JSON.stringify(state);
  const next = core.reduce(state, event);
  const nextTwin = core.reduce(twin, clone(event));
  assert.equal(JSON.stringify(state), before, 'reduce mutated its previous state');
  const bytes = JSON.stringify(next);
  const twinBytes = JSON.stringify(nextTwin);
  assert.equal(digest(bytes), digest(twinBytes), `event replay SHA-256 mismatch: ${JSON.stringify(event)}`);
  assert.equal(bytes, twinBytes, 'event replay differs byte-for-byte');
  assert.equal(JSON.stringify(JSON.parse(bytes)), bytes, 'state byte JSON roundtrip failed');
  assert.ok(Buffer.byteLength(bytes) <= 256 * 1024, 'state exceeds 256 KiB');
  if (stats) {
    stats.events += 1;
    stats.maxStateBytes = Math.max(stats.maxStateBytes, Buffer.byteLength(bytes));
    stats.transcript.update(digest(bytes));
  }
  // Continue the twin from the serialized save after EVERY event, rather than
  // merely checking that the original live objects serialize once.
  return [next, JSON.parse(twinBytes)];
}
export function checkResults(state, originalIds = state.order) {
  const result = core.results(state);
  assert.ok(result, 'done must expose results');
  assertJson(result, 'results');
  assert.deepEqual(Object.keys(result.scores).sort(), [...originalIds].sort(), 'results omit an original seat');
  assert.deepEqual(result.ranking.map((item) => item.playerId).sort(), [...originalIds].sort());
  for (const id of originalIds) assert.ok(Number.isFinite(result.scores[id]), `non-finite score for ${id}`);
  for (const item of result.ranking) {
    assert.ok(Number.isFinite(item.score));
    assert.ok(Number.isInteger(item.rank) && item.rank >= 1);
  }
  assert.ok(result.winnerIds.length >= 1);
  assert.ok(result.winnerIds.every((id) => originalIds.includes(id)));
  return result;
}
export function sample(state, id, seed, skill = 'normal') {
  return core.game.bot.sampleInput(state, id, core.createRng(seed >>> 0), skill);
}
export function botEvent(state, step, skillFor = () => 'normal', seed = 1) {
  if (state.phase.id === 'bid' && state.settings.calzaEnabled && !state.phase.paused) {
    for (const seat of state.order) if (seat !== state.turn) {
      const interrupt = sample(state, seat, seed ^ Math.imul(step + 1, 0x9e3779b1), skillFor(seat));
      assert.ok(interrupt === null || core.game.inputSchema.safeParse(interrupt).success, 'out-of-turn bot returned invalid input');
      if (interrupt !== null) {
        assert.equal(interrupt.type, 'calza', 'out-of-turn bot returned a non-interrupt action');
        assert.equal(core.canCalza(state, seat), true);
        return input(state, interrupt, seat, 1001 + step * 1000);
      }
    }
  }
  const id = state.phase.id === 'reveal'
    ? state.order.find((seat) => state.players[seat].connected && !state.left.includes(seat))
    : state.turn;
  const value = sample(state, id, seed ^ Math.imul(step + 1, 0x9e3779b1), skillFor(id));
  assert.ok(value !== null, `active bot returned null in ${state.phase.id} for ${JSON.stringify(id)}`);
  assert.ok(core.game.inputSchema.safeParse(value).success, `schema-invalid bot action: ${JSON.stringify(value)}`);
  return input(state, value, id, 1001 + step * 1000);
}
export function playGame({ count = 2, seed = 1, settings = {}, skillFor = () => 'normal', replay = false, stats = null, inspect = null } = {}) {
  let state = makeState(count, seed, settings);
  let twin = clone(state);
  const phases = new Set([state.phase.id]);
  for (let step = 0; state.phase.id !== 'done' && step < 5000; step += 1) {
    inspect?.(state, step);
    const event = botEvent(state, step, skillFor, seed);
    if (replay) [state, twin] = checkReplayStep(state, twin, event, stats);
    else state = core.reduce(state, event);
    phases.add(state.phase.id);
  }
  assert.equal(state.phase.id, 'done', `bot game did not terminate: count=${count} seed=${seed}`);
  inspect?.(state, 5000);
  checkResults(state);
  return { state, phases };
}
export function writeEvidence(name, value) {
  if (process.env.CORE_DIR) return;
  mkdirSync(resolve(root, 'evidence/checks'), { recursive: true });
  writeFileSync(resolve(root, 'evidence/checks', name), `${JSON.stringify(value, null, 2)}\n`);
}

// Deliberately limited JSON Schema evaluator. It implements every keyword used
// by fixtures/schema.json and rejects unknown keywords, so validation cannot
// silently accept a schema feature we do not understand.
export function validateJsonSchema(schema, value, at = '$') {
  const supported = new Set(['$schema', 'title', 'description', 'type', 'enum', 'const', 'minimum', 'maximum', 'minItems', 'maxItems', 'items', 'required', 'properties', 'additionalProperties', 'anyOf']);
  for (const key of Object.keys(schema)) assert.ok(supported.has(key), `unsupported schema keyword ${key}`);
  if (schema.anyOf) {
    const ok = schema.anyOf.some((part) => { try { validateJsonSchema(part, value, at); return true; } catch { return false; } });
    assert.ok(ok, `${at} fails anyOf`);
    return;
  }
  if (schema.enum) assert.ok(schema.enum.some((item) => JSON.stringify(item) === JSON.stringify(value)), `${at} fails enum`);
  if (Object.hasOwn(schema, 'const')) assert.deepEqual(value, schema.const, `${at} fails const`);
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type) assert.ok(schema.type === type || (schema.type === 'integer' && Number.isSafeInteger(value)), `${at} expected ${schema.type}, received ${type}`);
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${at} is not finite`);
    if (schema.minimum !== undefined) assert.ok(value >= schema.minimum, `${at} below minimum`);
    if (schema.maximum !== undefined) assert.ok(value <= schema.maximum, `${at} above maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined) assert.ok(value.length >= schema.minItems, `${at} too short`);
    if (schema.maxItems !== undefined) assert.ok(value.length <= schema.maxItems, `${at} too long`);
    if (schema.items) value.forEach((item, i) => validateJsonSchema(schema.items, item, `${at}[${i}]`));
  }
  if (type === 'object') {
    for (const key of schema.required || []) assert.ok(Object.hasOwn(value, key), `${at}.${key} missing`);
    for (const [key, item] of Object.entries(value)) {
      const child = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : undefined;
      if (child) validateJsonSchema(child, item, `${at}.${key}`);
      else if (schema.additionalProperties === false) assert.fail(`${at}.${key} not permitted`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') validateJsonSchema(schema.additionalProperties, item, `${at}.${key}`);
    }
  }
}
