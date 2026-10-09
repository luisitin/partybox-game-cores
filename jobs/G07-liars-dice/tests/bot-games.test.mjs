import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { core, sample, skills, playGame, writeEvidence } from './helpers.mjs';

test('contract 4, 6, 7, 8: 1,000 complete seeded bot games at EACH player count 2–8, every-event replay hash and byte JSON roundtrip', { timeout: 1_200_000 }, () => {
  const stats = { events: 0, maxStateBytes: 0, transcript: createHash('sha256') };
  const byCount = [], seen = new Set();
  let botSamples = 0;
  for (let count = 2; count <= 8; count += 1) {
    const beginning = stats.events;
    for (let index = 0; index < 1000; index += 1) {
      const seed = (Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(count, 0x85ebca6b)) >>> 0;
      const settings = { onesWild: index % 4 !== 0, palificoEnabled: index % 5 !== 0, palificoExemption: ['none', 'oneDie', 'experienced'][index % 3], calzaEnabled: index % 7 === 0, calzaPolicy: index % 2 ? 'anyOther' : 'interruptOnly' };
      const { phases } = playGame({ count, seed, settings, replay: true, stats,
        skillFor: (id) => skills[(Number(id.slice(1)) + index) % skills.length],
        inspect: (state, step) => {
          for (const id of [...state.order, '__proto__']) {
            const action = sample(state, id, seed ^ Math.imul(step + 1, 31), skills[(step + index) % 3]);
            assert.ok(action === null || core.game.inputSchema.safeParse(action).success, `count=${count} seed=${seed} bot=${id}`);
            botSamples += 1;
          }
        },
      });
      phases.forEach((phase) => seen.add(phase));
    }
    byCount.push({ players: count, games: 1000, events: stats.events - beginning });
  }
  assert.deepEqual([...seen].sort(), [...core.game.phases].sort());
  writeEvidence('bot-games.json', { result: 'PASS', completedGames: 7000, byCount, events: stats.events, botSamples, maxStateBytes: stats.maxStateBytes, replay: 'Twin reduction, previous-state immutability, SHA-256 and exact bytes, JSON roundtrip, ≤256 KiB after every event', everyEventReplaySha256: stats.transcript.digest('hex') });
});
