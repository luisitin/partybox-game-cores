import { describe, expect, it } from 'vitest';
import { game } from '../server';
import { SHAKE_MS } from '../server/types';
import { fire, GRID, input, room, skip, STRANDED, T0, until } from './helpers';

const withGrid = (s: ReturnType<typeof room>) => ({ ...s, grid: GRID.slice() });

describe('phase flow', () => {
  it('runs shake → hunt → reveal → tally per round, then done', () => {
    let s = room(3, { rounds: 2 });
    expect(s.phase.id).toBe('shake');
    expect(s.phase.deadline).toBe(T0 + SHAKE_MS);
    const seen: string[] = [];
    for (let i = 0; i < 50 && s.phase.id !== 'done'; i++) { if (seen[seen.length - 1] !== s.phase.id) seen.push(s.phase.id); s = fire(s); }
    expect(seen.join(' ')).toBe('shake hunt reveal tally shake hunt reveal tally');
    expect(s.round).toBe(2);
  });
  it('VIP skip leaves every phase', () => {
    let s = room(3, { rounds: 1 });
    s = skip(s); expect(s.phase.id).toBe('hunt');
    s = withGrid(s);
    s = game.reduce(s, input('p1', { t: 'word', path: STRANDED }, s.phase.startedAt + 100));
    s = skip(s); expect(s.phase.id).toBe('reveal');
    while (s.phase.id === 'reveal') s = skip(s);
    expect(s.phase.id).toBe('tally');
    s = skip(s); expect(s.phase.id).toBe('done');
  });
  it('the hunt closes when every connected human is done; bots and away players never block', () => {
    let s = until(room(4, {}, 1, { bots: [3] }), 'hunt');
    const t = s.phase.startedAt + 1000;
    s = game.reduce(s, { type: 'player', playerId: 'p3', connected: false, now: t });
    s = game.reduce(s, input('p1', { t: 'done', done: true }, t));
    expect(s.phase.id).toBe('hunt');
    s = game.reduce(s, input('p2', { t: 'done', done: true }, t));
    expect(s.phase.id).toBe('reveal');
  });
  it('a drop can close the hunt (the last undone player leaves)', () => {
    let s = until(room(3), 'hunt');
    const t = s.phase.startedAt + 1000;
    s = game.reduce(s, input('p1', { t: 'done', done: true }, t));
    s = game.reduce(s, input('p2', { t: 'done', done: true }, t));
    expect(s.phase.id).toBe('hunt');
    s = game.reduce(s, { type: 'player', playerId: 'p3', connected: false, now: t });
    expect(s.phase.id).toBe('reveal');
  });
  it('"Keep hunting" undoes done; a done player cannot add words', () => {
    let s = withGrid(until(room(2), 'hunt'));
    const t = s.phase.startedAt + 500;
    s = game.reduce(s, input('p1', { t: 'done', done: true }, t));
    const before = s;
    s = game.reduce(s, input('p1', { t: 'word', path: STRANDED }, t));
    expect(s).toBe(before);
    s = game.reduce(s, input('p1', { t: 'done', done: false }, t));
    s = game.reduce(s, input('p1', { t: 'word', path: STRANDED }, t));
    expect(s.words.p1?.map((e) => e.w)).toEqual(['stranded']);
  });
  it('a late joiner plays at once with score 0', () => {
    let s = withGrid(until(room(2), 'hunt'));
    const t = s.phase.startedAt + 2000;
    s = game.reduce(s, { type: 'player', playerId: 'late', name: 'Zoe', connected: true, now: t });
    expect(s.order).toContain('late');
    expect(s.scores.late).toBe(0);
    s = game.reduce(s, input('late', { t: 'word', path: STRANDED }, t + 1));
    expect(s.words.late?.length).toBe(1);
    expect(game.controllerView(s, 'late').grid).toHaveLength(16);
  });
  it('pause freezes the clock and word times exclude the pause', () => {
    let s = withGrid(until(room(2), 'hunt'));
    const start = s.phase.startedAt;
    const dl = s.phase.deadline!;
    s = game.reduce(s, { type: 'vip', action: 'pause', now: start + 1000 });
    const frozen = game.reduce(s, input('p1', { t: 'word', path: STRANDED }, start + 2000));
    expect(frozen).toBe(s);
    s = game.reduce(s, { type: 'vip', action: 'resume', now: start + 61_000 });
    expect(s.phase.deadline).toBe(dl + 60_000);
    s = game.reduce(s, input('p1', { t: 'word', path: STRANDED }, start + 62_000));
    expect(s.words.p1?.[0]?.t).toBe(2000);
  });
  it('VIP end from any phase goes to done with finite scores', () => {
    for (const phase of ['shake', 'hunt', 'reveal', 'tally'] as const) {
      const s = until(room(3), phase);
      const e = game.reduce(s, { type: 'vip', action: 'end', now: s.phase.startedAt + 5 });
      expect(e.phase.id).toBe('done');
      expect(game.results(e).ranking).toHaveLength(3);
    }
  });
  it('invalid inputs change nothing', () => {
    const s = withGrid(until(room(2), 'hunt'));
    const t = s.phase.startedAt + 5;
    const bad = [
      input('p1', { t: 'word', path: [0, 2, 3] }, t), // not touching
      input('p1', { t: 'word', path: [0, 1] }, t), // too short
      input('nobody', { t: 'word', path: STRANDED }, t),
      input('p1', { t: 'counts', word: 'STRANDED', counts: true }, t, true), // wrong phase
      { type: 'timer' as const, now: t, phaseId: 'hunt', startedAt: 1 },
    ];
    for (const ev of bad) expect(game.reduce(s, ev)).toBe(s);
    const once = game.reduce(s, input('p1', { t: 'word', path: STRANDED }, t));
    expect(game.reduce(once, input('p1', { t: 'word', path: STRANDED }, t))).toBe(once); // duplicate
  });
  it('family mode refuses blocked words; spicy keeps them', () => {
    const grid = ['s', 'h', 'i', 't', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];
    const fam = { ...until(room(2), 'hunt'), grid };
    const a = game.reduce(fam, input('p1', { t: 'word', path: [0, 1, 2, 3] }, fam.phase.startedAt + 1));
    expect(a.words.p1).toHaveLength(0);
    expect(a.verdicts.p1?.kind).toBe('blocked');
    const sp = { ...until(room(2, { spicy: true }), 'hunt'), grid };
    const b = game.reduce(sp, input('p1', { t: 'word', path: [0, 1, 2, 3] }, sp.phase.startedAt + 1));
    expect(b.words.p1).toHaveLength(1);
  });
});
