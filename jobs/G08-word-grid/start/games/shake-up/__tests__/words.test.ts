// What the views and results say about words: the tray glows only a word that scored, the phone
// learns when the roll began, and a Spanish room gets its results text in Spanish.
import { describe, expect, it } from 'vitest';
import { game } from '../server';
import { packFor } from '../server/content';
import { SHAKE_MS, type State } from '../server/types';
import { fire, GRID, input, room, solve, STRANDED, until } from './helpers';

const TRAIN = [1, 2, 3, 7, 6];
const RED = [8, 9, 10];
const hunt = (n: number, settings = {}, lang = 'en') => ({ ...until(room(n, settings, 1, { lang }), 'hunt'), grid: GRID.slice() }) as State;
const say = (s: State, id: string, path: number[]) => game.reduce(s, input(id, { t: 'word', path }, s.phase.startedAt + 1500));
const beatOf = (s: State, id: string) => {
  let x = fire(s); // → reveal
  for (let i = 0; i < 20 && x.phase.id === 'reveal'; i++) {
    const b = game.tvView(x).reveal?.beat;
    if (b?.kind === 'player' && b.id === id) return b;
    x = fire(x);
  }
  throw new Error(`no beat for ${id}`);
};

describe('reveal glow', () => {
  it('glows the best scoring word, never a crossed-off one', () => {
    let s = hunt(3);
    s = say(s, 'p1', STRANDED);
    s = say(s, 'p1', TRAIN);
    s = say(s, 'p2', TRAIN);
    s = say(s, 'p2', RED);
    s = say(s, 'p3', RED);
    expect(beatOf(s, 'p1').glow).toEqual(STRANDED);
  });
  it('glows nothing when every word was shared (the card says +0)', () => {
    let s = hunt(2);
    s = say(s, 'p1', TRAIN);
    s = say(s, 'p2', TRAIN);
    s = say(s, 'p2', STRANDED);
    const b = beatOf(s, 'p1');
    expect(b.total).toBe(0);
    expect(b.words.map((w) => w.status)).toEqual(['shared']);
    expect(b.glow).toEqual([]);
  });
  it('glows nothing for a list of dictionary misses until the VIP counts one', () => {
    let s = hunt(2);
    s = say(s, 'p1', [1, 5, 4]); // t d e, not a word
    s = say(s, 'p2', STRANDED);
    s = fire(s); // → reveal: p1 (0 pts) first
    const b0 = game.tvView(s).reveal?.beat;
    expect(b0?.kind === 'player' && b0.id === 'p1' ? b0.glow : null).toEqual([]);
    s = game.reduce(s, input('p1', { t: 'counts', word: 'tde', counts: true }, s.phase.startedAt + 10, true));
    const b1 = game.tvView(s).reveal?.beat;
    expect(b1?.kind === 'player' ? b1.glow : null).toEqual([1, 5, 4]);
  });
});

describe('shake timing on every screen', () => {
  it('tells the TV and the phones when the roll began, and only during the shake', () => {
    const s = room(2);
    const tv = game.tvView(s);
    const ph = game.controllerView(s, 'p1');
    expect(tv.roll).toEqual({ at: s.phase.startedAt, ms: SHAKE_MS });
    expect(ph.roll).toEqual(tv.roll);
    const h = until(s, 'hunt');
    expect(game.controllerView(h, 'p1').roll).toBeUndefined();
    expect(game.tvView(h).roll).toBeUndefined();
  });
});

describe('results text follows the room language', () => {
  it('a Spanish room reads its headline, note, place lines and awards in Spanish', () => {
    let s = hunt(2, { rounds: 1 }, 'es');
    const words = solve(s.grid, 4, packFor('es').words, 3).sort((a, b) => b.w.length - a.w.length);
    const [long, other] = [words[0]!, words[1]!];
    s = say(s, 'p1', long.path);
    s = say(s, 'p1', other.path);
    s = say(s, 'p2', other.path);
    const r = game.results(until(fire(s), 'done'))!;
    expect(r.headline).toBe('Ana dominó las letras');
    if (r.headlineNote) expect(r.headlineNote).toMatch(/^La mejor palabra que nadie encontró: [A-ZÑ]+$/u);
    expect(r.placeLines).toEqual({ p1: '1 palabra única', p2: '0 palabras únicas' });
    const smith = r.awards.find((a) => a.id === 'wordsmith');
    expect(smith?.title).toBe('Artesano de palabras');
    expect(smith?.value).toBe(`${long.w.toUpperCase()}, ${[...long.w].length} letras`);
    const text = r.awards.map((a) => `${a.title} ${a.description} ${a.value}`).join(' ');
    expect(text).not.toMatch(/\b(word|words|letters|unique|shared|first|ruled|in one round)\b/);
  });
  it('an idle Spanish game still has three Spanish awards', () => {
    const r = game.results(until(room(3, { rounds: 1 }, 1, { lang: 'es' }), 'done'))!;
    expect(r.headline).toBe('Nadie anotó. Ganan los cubos.');
    expect(r.awards.length).toBeGreaterThanOrEqual(3);
    expect(r.awards.map((a) => a.title)).toContain('Gran ronda');
    expect(r.awards.every((a) => !/\b(words?|round|calm)\b/i.test(`${a.description} ${a.value}`))).toBe(true);
  });
  it('English stays English, with "1 unique word" singular', () => {
    let s = hunt(2, { rounds: 1 });
    s = say(s, 'p1', STRANDED);
    const r = game.results(until(fire(s), 'done'))!;
    expect(r.headline).toBe('Ana out-spelled the room');
    expect(r.placeLines).toEqual({ p1: '1 unique word', p2: '0 unique words' });
    expect(r.awards.find((a) => a.id === 'lone-wolf')?.value).toBe('1 unique word');
    expect(r.awards.find((a) => a.id === 'wordsmith')).toMatchObject({ title: 'Wordsmith', value: 'STRANDED, 8 letters' });
  });
});

describe('tally spotlight', () => {
  const ART = [3, 2, 1];
  it('names the others whose longest unique word is as long, in seat order', () => {
    let s = hunt(3);
    s = say(s, 'p1', RED);
    s = say(s, 'p2', ART);
    expect(game.tvView(until(s, 'tally')).tally?.spotlight).toMatchObject({ id: 'p1', len: 3, tied: ['p2'] });
  });
  it('sends no tie list when one word is longest', () => {
    let s = hunt(3);
    s = say(s, 'p1', RED);
    s = say(s, 'p2', TRAIN);
    expect(game.tvView(until(s, 'tally')).tally?.spotlight).toMatchObject({ id: 'p2', len: 5 });
    expect(game.tvView(until(s, 'tally')).tally?.spotlight?.tied).toBeUndefined();
  });
});
