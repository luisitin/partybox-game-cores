import { createRng } from '../../../../../../contract/rng';
import { describe, expect, it } from 'vitest';
import { game } from '../server';
import { inputSchema } from '../server/types';
import { jsonSafe, room, simulate } from './helpers';

const RUNS = Number(process.env.SIM_RUNS ?? 200);

describe('random play (bots + junk events)', () => {
  it(`${RUNS} games finish, never throw, keep views safe, never leak`, () => {
    for (let seed = 1; seed <= RUNS; seed++) {
      const players = 1 + (seed % 8);
      const settings = { rounds: 1 + (seed % 3), huntSeconds: ['90', '120', '180'][seed % 3]!, grid: seed % 5 === 0 ? '5x5' : '4x4', spicy: seed % 4 === 0 };
      const { state, events, ms } = simulate({ players, seed, settings, chaos: true, lang: seed % 3 === 0 ? 'es' : 'en', skill: (['easy', 'normal', 'sharp'] as const)[seed % 3] });
      expect(state.phase.id, `seed ${seed}`).toBe('done');
      expect(ms).toBeLessThan(game.manifest.estimatedMinutes * 3 * 60_000);
      // Replay: same seed + same events → byte-identical state.
      let again = room(players, settings, seed, { lang: seed % 3 === 0 ? 'es' : 'en' });
      for (const ev of events) again = game.reduce(again, ev);
      expect(JSON.stringify(again)).toBe(JSON.stringify(state));
      const r = game.results(state)!;
      expect(jsonSafe(r)).toBeNull();
      expect(r.ranking).toHaveLength(state.order.length);
      expect(r.awards.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('views are JSON-safe in every phase and secrets stay put during the hunt', () => {
    const { events } = simulate({ players: 6, seed: 7, settings: { rounds: 2 } });
    let s = room(6, { rounds: 2 }, 7);
    for (const ev of events) {
      s = game.reduce(s, ev);
      const tv = game.tvView(s);
      expect(jsonSafe(tv)).toBeNull();
      if (s.phase.id === 'hunt') {
        const tvJson = JSON.stringify(tv);
        for (const id of s.order) for (const e of s.words[id] ?? []) if (e.w.length >= 4) expect(tvJson).not.toContain(`"${e.w.toUpperCase()}"`);
      }
      for (const id of s.order) {
        const v = game.controllerView(s, id);
        expect(jsonSafe(v)).toBeNull();
        if (s.phase.id === 'hunt') {
          const mine = new Set((s.words[id] ?? []).map((e) => e.w.toUpperCase()));
          const json = JSON.stringify(v);
          for (const other of s.order) {
            if (other === id) continue;
            for (const e of s.words[other] ?? []) if (!mine.has(e.w.toUpperCase()) && e.w.length >= 5) expect(json).not.toContain(`"${e.w.toUpperCase()}"`);
          }
        }
      }
    }
  });

  it('bots give schema-valid input or null in every phase', () => {
    const { events } = simulate({ players: 4, seed: 3, settings: { rounds: 1 } });
    let s = room(4, { rounds: 1 }, 3);
    let words = 0;
    for (const ev of events) {
      s = game.reduce(s, ev);
      for (const id of s.order) {
        for (const skill of ['easy', 'normal', 'sharp'] as const) {
          const inp = game.bot.sampleInput(s, id, createRng(events.indexOf(ev)), skill);
          if (inp !== null) { expect(inputSchema.safeParse(inp).success).toBe(true); words++; }
        }
      }
    }
    expect(words).toBeGreaterThan(0);
  });

  it('everyone idle: the game still ends after the set rounds', () => {
    const { state } = simulate({ players: 5, seed: 9, settings: { rounds: 3 }, idle: true });
    expect(state.phase.id).toBe('done');
    expect(state.log).toHaveLength(3);
  });

  it('16 players stay far under 256 KB of state', () => {
    const { state } = simulate({ players: 16, seed: 11, settings: { rounds: 1 }, skill: 'sharp' });
    let peak = 0;
    const bytes = JSON.stringify(state).length;
    peak = Math.max(peak, bytes);
    console.log(`16-player state at the end: ${(bytes / 1024).toFixed(1)} KB`);
    expect(peak).toBeLessThan(256 * 1024);
  });
});
