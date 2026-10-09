import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { core, root, makeState, input, sample, digest, validateJsonSchema } from '../tests/helpers.mjs';

const integer = { type: 'integer' }, string = { type: 'string' }, boolean = { type: 'boolean' };
const nullableString = { anyOf: [string, { type: 'null' }] };
const strings = { type: 'array', items: string };
const die = { type: 'integer', minimum: 1, maximum: 6 };
const dice = { type: 'array', maxItems: 5, items: die };
const object = (properties, required = Object.keys(properties), extra = false) => ({ type: 'object', properties, required, additionalProperties: extra });
const record = (child) => ({ type: 'object', additionalProperties: child });
const bid = object({ quantity: { type: 'integer', minimum: 1, maximum: 1000000 }, face: die, playerId: string });
const player = object({ id: string, name: string, avatarId: string, connected: boolean, bot: boolean, canSeeTv: boolean }, ['id', 'name', 'avatarId', 'connected']);
export const fixtureSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema', title: 'G07 complete saved state',
  ...object({
    phase: object({ id: { enum: ['bid', 'reveal', 'done'] }, startedAt: { type: 'number' }, deadline: { anyOf: [{ type: 'number' }, { type: 'null' }] }, paused: object({ at: { type: 'number' } }) }, ['id', 'startedAt', 'deadline']),
    phaseClock: { type: 'number' }, rng: object({ seed: integer, step: { type: 'integer', minimum: 0 } }), players: record(player), order: { ...strings, minItems: 2, maxItems: 8 },
    settings: object({ onesWild: boolean, palificoEnabled: boolean, palificoExemption: { enum: ['none', 'oneDie', 'experienced'] }, calzaEnabled: boolean, calzaPolicy: { enum: ['anyOther', 'interruptOnly'] }, turnSeconds: { type: 'integer', minimum: 0, maximum: 120 } }),
    cups: record(dice), diceCount: record({ type: 'integer', minimum: 0, maximum: 5 }), turn: string, round: { type: 'integer', minimum: 1 },
    bid: { anyOf: [bid, { type: 'null' }] }, bidLog: { type: 'array', items: bid }, palifico: boolean, palificoStarter: nullableString, seenPalifico: record(boolean), nextStarter: string, nextPalifico: nullableString,
    reveal: { anyOf: [{ type: 'null' }, object({ kind: { enum: ['dudo', 'calza'] }, caller: string, bid, matches: { type: 'integer', minimum: 0, maximum: 40 }, correct: boolean, loser: nullableString, gained: boolean, dice: record(dice) })] },
    eliminated: strings, left: strings, models: record(object({ truth: { type: 'number', minimum: 0 }, false: { type: 'number', minimum: 0 } })),
    autoPaused: boolean, winner: nullableString, endReason: nullableString, contentLang: { enum: ['en', 'es'] }, phoneOnly: boolean,
  }),
};

export function continueFixture(start) {
  let state = start;
  const nowStart = state.phase.startedAt;
  for (let step = 0; state.phase.id !== 'done' && step < 5000; step += 1) {
    const id = state.phase.id === 'reveal' ? state.order.find((seat) => state.players[seat].connected && !state.left.includes(seat)) : state.turn;
    const action = sample(state, id, 0xf17e ^ Math.imul(step + 1, 0x9e3779b1), 'normal');
    assert.ok(action !== null && core.game.inputSchema.safeParse(action).success);
    state = core.reduce(state, input(state, action, id, nowStart + 1000 + step * 1000));
  }
  assert.equal(state.phase.id, 'done');
  return state;
}

export function generateFixtures() {
  const manifestPath = resolve(root, 'manifest.json');
  assert.deepEqual(JSON.parse(readFileSync(manifestPath, 'utf8')), core.game.manifest, 'manifest drift must be reported before regeneration');
  writeFileSync(manifestPath, `${JSON.stringify(core.game.manifest, null, 2)}\n`);
  const bidState = makeState(3, 0xf17e);
  let revealState = bidState;
  for (let step = 0; revealState.phase.id === 'bid' && step < 100; step += 1) {
    const id = revealState.turn;
    const action = sample(revealState, id, 0xf17e ^ Math.imul(step + 1, 0x9e3779b1), 'normal');
    revealState = core.reduce(revealState, input(revealState, action, id, 2000 + step * 1000));
  }
  assert.equal(revealState.phase.id, 'reveal');
  const states = { bid: bidState, reveal: revealState, done: continueFixture(revealState) };
  mkdirSync(resolve(root, 'fixtures'), { recursive: true });
  const hashes = {};
  for (const [phase, state] of Object.entries(states)) {
    validateJsonSchema(fixtureSchema, state);
    const text = `${JSON.stringify(state, null, 2)}\n`;
    writeFileSync(resolve(root, 'fixtures', `${phase}.json`), text);
    hashes[`${phase}.json`] = digest(text);
  }
  const schemaText = `${JSON.stringify(fixtureSchema, null, 2)}\n`;
  writeFileSync(resolve(root, 'fixtures/schema.json'), schemaText);
  hashes['schema.json'] = digest(schemaText);
  hashes['manifest.json'] = digest(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
  return hashes;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const first = generateFixtures();
  const second = generateFixtures();
  assert.deepEqual(second, first, 'fixture/manifest regeneration is not byte-identical');
  const evidence = { result: 'PASS', command: 'node scripts/fixtures.mjs', generationPasses: 2, byteIdentical: true, sha256: first };
  mkdirSync(resolve(root, 'evidence/checks'), { recursive: true });
  writeFileSync(resolve(root, 'evidence/checks/fixture-regeneration.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence));
}
