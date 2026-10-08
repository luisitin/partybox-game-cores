// What a reveal card and the phone's last screens are told: rulable words always make the card, the
// shown numbers add up to the total, the VIP sees who found each miss, and done carries the results.
import { describe, expect, it } from 'vitest';
import { game } from '../server';
import { packFor } from '../server/content';
import { CARD_WORDS } from '../server/phases/reveal';
import { seconds } from '../server/results';
import type { Judged, Status } from '../server/scoring';
import type { State } from '../server/types';
import { cardWords } from '../server/views';
import { fire, GRID, input, room, solve, STRANDED, until } from './helpers';

const j = (w: string, status: Status, pts = 0): Judged => ({ w, p: [], len: w.length, pts, status, with: status === 'shared' ? ['p2'] : [] });
const hunt = (n: number, settings = {}, lang = 'en') => ({ ...until(room(n, settings, 1, { lang }), 'hunt'), grid: GRID.slice() }) as State;
const say = (s: State, id: string, path: number[]) => game.reduce(s, input(id, { t: 'word', path }, s.phase.startedAt + 1500));

describe('card words', () => {
  const unique = Array.from({ length: 20 }, (_, i) => j(`U${i}`, 'unique', 20 - i));
  const judged = [...unique.slice(0, 4), j('C0', 'counted', 3), ...unique.slice(4), j('X0', 'unknown'), j('X1', 'unknown'), j('X2', 'unknown'), j('S0', 'shared'), j('S1', 'shared')];
  it('always lists every dictionary miss and counted word, then the best unique words, within CARD_WORDS', () => {
    const { shown, more } = cardWords(judged);
    expect(shown.length).toBe(CARD_WORDS);
    expect(shown.filter((w) => w.status === 'unknown' || w.status === 'counted').map((w) => w.w)).toEqual(['C0', 'X0', 'X1', 'X2']);
    expect(shown.filter((w) => w.status === 'unique').map((w) => w.w)).toEqual(unique.slice(0, CARD_WORDS - 4).map((w) => w.w));
    expect(more).toEqual({ words: 20 - (CARD_WORDS - 4), pts: unique.slice(CARD_WORDS - 4).reduce((s, w) => s + w.pts, 0), shared: 2 });
  });
  it('the points shown plus the points left off are the card total', () => {
    const { shown, more } = cardWords(judged);
    expect(shown.reduce((s, w) => s + w.pts, 0) + more.pts).toBe(judged.reduce((s, w) => s + w.pts, 0));
  });
  it('a short list shows everything, shared words included, in judged order', () => {
    const short = [j('A', 'unique', 2), j('B', 'unknown'), j('C', 'shared')];
    expect(cardWords(short)).toEqual({ shown: short, more: { words: 0, pts: 0, shared: 0 } });
  });
  it('a long list in a real room keeps its dictionary misses on the card', () => {
    let s = hunt(2);
    for (const w of solve(GRID, 4, packFor('en').words, 3).slice(0, 24)) s = say(s, 'p1', w.path);
    s = say(s, 'p1', [1, 5, 4]); // t d e: not a word
    s = fire(s); // → reveal
    let b = game.tvView(s).reveal?.beat;
    for (let i = 0; i < 5 && !(b?.kind === 'player' && b.id === 'p1'); i++) { s = fire(s); b = game.tvView(s).reveal?.beat; }
    expect(b?.kind === 'player' ? b.words.map((w) => w.w) : []).toContain('TDE');
    expect(b?.kind === 'player' ? b.words.length + b.more.words + b.more.shared : 0).toBe(25);
  });
});

describe('VIP rulings', () => {
  it('names who found each dictionary miss', () => {
    let s = hunt(3);
    s = say(s, 'p2', [1, 5, 4]);
    s = say(s, 'p3', [1, 5, 4]);
    s = say(s, 'p1', STRANDED);
    s = fire(s); // → reveal: p2 and p3 (0 pts) come first
    s = fire(s, s.phase.deadline!);
    expect(game.controllerView(s, 'p1').reveal?.rulable).toEqual([{ w: 'TDE', by: ['p2', 'p3'] }]);
  });
});

describe('the phone at the end of the game', () => {
  it('gets the headline, awards, longest word and best missed word in done, and only then', () => {
    let s = hunt(2, { rounds: 1 });
    s = say(s, 'p1', STRANDED);
    expect(game.controllerView(until(s, 'tally'), 'p1').final).toBeUndefined();
    const done = until(fire(s), 'done');
    const f = game.controllerView(done, 'p2').final;
    expect(f?.headline).toBe('Ana out-spelled the room');
    expect(f?.longest).toEqual({ id: 'p1', w: 'STRANDED', len: 8 });
    expect(f?.awards.map((a) => a.id)).toContain('wordsmith');
    expect(f?.awards).toEqual(game.results(done)!.awards);
    expect(game.controllerView(done, 'p2').tally?.rows.map((r) => r.id)).toEqual(['p1', 'p2']);
  });
  it('writes seconds in the room’s notation (0,5 s in Spanish)', () => {
    expect(seconds(true, 500)).toBe('0,5');
    expect(seconds(false, 500)).toBe('0.5');
    let s = hunt(2, { rounds: 1 }, 'es');
    const w = solve(s.grid, 4, packFor('es').words, 3)[0]!;
    s = say(s, 'p1', w.path);
    const quick = game.results(until(fire(s), 'done'))!.awards.find((a) => a.id === 'quick-draw');
    expect(quick?.value).toMatch(/^primera palabra en \d+,\d s$/);
  });
});
