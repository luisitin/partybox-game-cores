import { describe, expect, it } from 'vitest';
import { game } from '../server';
import { roundPoints } from '../server/scoring';
import type { State } from '../server/types';
import { fire, GRID, input, room, skip, STRANDED, until } from './helpers';

// Paths on GRID: S T R A / E D N I / R E D L / O M Qu T
const TRAIN = [1, 2, 3, 7, 6];
const RED = [8, 9, 10];
const hunt = (n: number, settings = {}) => ({ ...until(room(n, settings), 'hunt'), grid: GRID.slice() }) as State;
const say = (s: State, id: string, path: number[]) => game.reduce(s, input(id, { t: 'word', path }, s.phase.startedAt + 1500));

describe('scoring', () => {
  it('unique words score by length, shared words score zero, never negative', () => {
    let s = hunt(3);
    s = say(s, 'p1', STRANDED);
    s = say(s, 'p1', TRAIN);
    s = say(s, 'p2', TRAIN);
    s = say(s, 'p3', RED);
    expect(roundPoints(s)).toEqual({ p1: 11, p2: 0, p3: 1 });
  });
  it('solo play scores every valid word', () => {
    let s = hunt(1);
    s = say(s, 'p1', STRANDED);
    s = say(s, 'p1', TRAIN);
    expect(roundPoints(s)).toEqual({ p1: 11 + 2 });
  });
  it('a non-dictionary word scores only after the VIP rules it counts, and only once revealed', () => {
    let s = hunt(2);
    s = say(s, 'p1', [1, 5, 4]); // t d e
    expect(s.words.p1?.[0]).toMatchObject({ w: 'tde', ok: false });
    expect(s.verdicts.p1?.kind).toBe('unknown');
    s = say(s, 'p2', STRANDED);
    s = skip(s); // → reveal; p1 (0 pts) is first beat
    expect(s.phase.id).toBe('reveal');
    const tooEarly = game.reduce(s, input('p2', { t: 'counts', word: 'tde', counts: true }, s.phase.startedAt + 1, false));
    expect(tooEarly).toBe(s); // not the VIP
    s = game.reduce(s, input('p2', { t: 'counts', word: 'tde', counts: true }, s.phase.startedAt + 1, true));
    expect(s.counted).toEqual(['tde']);
    expect(roundPoints(s).p1).toBe(1);
    s = game.reduce(s, input('p2', { t: 'counts', word: 'tde', counts: false }, s.phase.startedAt + 2, true));
    expect(roundPoints(s).p1).toBe(0);
  });
  it('totals accumulate and ties share a place', () => {
    let s = hunt(3);
    s = say(s, 'p1', STRANDED);
    s = say(s, 'p2', [0, 1, 2, 3, 6, 5, 9]); // STRANDE? not a word → unknown, 0
    s = until(fire(s), 'tally');
    expect(s.scores).toEqual({ p1: 11, p2: 0, p3: 0 });
    const r = game.results({ ...s, phase: { id: 'done', startedAt: 0 } });
    expect(r.ranking.map((x) => x.place)).toEqual([1, 2, 2]);
    expect(r.winnerIds).toEqual(['p1']);
  });
});

describe('results', () => {
  it('lists every player with finite scores and 3–5 awards, even when nobody played', () => {
    let s = room(4, { rounds: 1 });
    s = until(s, 'done');
    const r = game.results(s);
    expect(r.ranking).toHaveLength(4);
    expect(r.ranking.every((x) => Number.isFinite(x.score))).toBe(true);
    expect(r.awards.length).toBeGreaterThanOrEqual(3);
    expect(r.awards.length).toBeLessThanOrEqual(5);
    expect(r.headline).toBe('Nobody scored. The cubes win.');
  });
  it('carries the outro detail: longest word, per player, missed', () => {
    let s = hunt(2, { rounds: 1 });
    s = say(s, 'p1', STRANDED);
    s = say(s, 'p2', TRAIN);
    s = until(fire(s), 'done');
    const r = game.results(s);
    const d = r.detail as { longest: { word: string; playerId: string; letters: number }; perPlayer: unknown[]; missed: { word: string } | null };
    expect(d.longest).toEqual({ word: 'STRANDED', playerId: 'p1', letters: 8 });
    expect(d.perPlayer).toHaveLength(2);
    expect(r.awards.map((a) => a.id)).toContain('wordsmith');
    expect(r.headline).toBe('Ana out-spelled the room');
  });
});
