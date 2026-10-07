// How words are drawn, as markup: the path line sits under the cubes, a face-down grid holds no letters,
// a card caps its crossed-off list and says what is hidden, and PhoneStage turns the grid over half-way
// through the roll and speaks the TV's words.
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ShellProvider } from '@partybox/game-sdk/ui';
import { CardList } from '../client/CardList';
import { LetterGrid } from '../client/LetterGrid';
import { PhoneStage } from '../client/phone/Stage';
import type { BeatView, CardWord, ControllerView, PlayerRow } from '../client/types';

const players: PlayerRow[] = ['Ana', 'Ben', 'Cleo'].map((name, seat) => ({ id: name.toLowerCase(), name, seat, bot: false, away: false, score: 0 }));
const word = (w: string, status: CardWord['status'], pts = 0, by: string[] = []): CardWord => ({ w, len: w.length, pts, status, with: by });
const letters = 'STRAEDNIREDLOMQT'.split('');
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

// Server rendering skips layout effects (the FLIP); that is expected here, so keep the log quiet about it.
beforeAll(() => {
  const error = console.error.bind(console);
  vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { if (!String(a[0]).includes('useLayoutEffect does nothing on the server')) error(...a); });
});

describe('LetterGrid', () => {
  it('draws the path line first, under the cubes, one link per step', () => {
    const html = renderToStaticMarkup(h(LetterGrid, { letters, size: 4, path: [0, 1, 2, 6], label: 'g' }));
    expect(html.indexOf('<svg')).toBeGreaterThan(-1);
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('role="gridcell"'));
    expect(count(html, /<line /g)).toBe(3);
  });
  it('a face-down grid has no letters in the page; turned up, it has all of them', () => {
    const down = renderToStaticMarkup(h(LetterGrid, { letters, size: 4, deal: 'down', label: 'g' }));
    const up = renderToStaticMarkup(h(LetterGrid, { letters, size: 4, deal: 'up', label: 'g' }));
    expect(down.replace(/<[^>]+>/g, '')).toBe('');
    expect(up.replace(/<[^>]+>/g, '')).toBe(letters.join(''));
  });
});

describe('CardList', () => {
  const shared = Array.from({ length: 12 }, (_, i) => word(`SHARED${String.fromCharCode(65 + i)}`, 'shared', 0, ['ben']));
  type More = { words?: number; pts?: number; shared?: number };
  const beat = (words: CardWord[], m: More = {}): Extract<BeatView, { kind: 'player' }> =>
    ({ kind: 'player', id: 'ana', total: 2, words, more: { words: 0, pts: 0, shared: 0, ...m }, glow: [] });
  it('caps the crossed-off list and names what is hidden', () => {
    const tv = renderToStaticMarkup(h(CardList, { beat: beat([word('GRITS', 'unique', 2), ...shared], { shared: 2 }), players }));
    expect(count(tv, /<s /g)).toBe(8);
    expect(tv).toContain('+6 more shared');
    const phone = renderToStaticMarkup(h(CardList, { beat: beat([word('GRITS', 'unique', 2), ...shared], { shared: 2 }), players, compact: true }));
    expect(count(phone, /<s /g)).toBe(6);
    expect(phone).toContain('+8 more shared');
  });
  it('says what scoring words are left off with their points (a chip the TV total counts), and shared ones apart', () => {
    const full = Array.from({ length: 14 }, (_, i) => word(`WORD${String.fromCharCode(65 + i)}`, 'unique', 1));
    const html = renderToStaticMarkup(h(CardList, { beat: beat(full, { words: 3, pts: 7, shared: 4 }), players }));
    expect(html).toMatch(/data-pts="7"[^>]*><b[^>]*>\+3 more words<\/b><span[^>]*>\+7</);
    expect(html).toContain('✕ 4 shared, so no points');
    expect(renderToStaticMarkup(h(CardList, { beat: beat(full, { words: 1, pts: 2 }), players }))).toContain('+1 more word<');
    expect(renderToStaticMarkup(h(CardList, { beat: beat(full), players }))).not.toContain('more');
  });
  it('stacks who-also-found-it faces without bot badges (the next face would cut them)', () => {
    const bots = players.map((p) => ({ ...p, bot: true }));
    const html = renderToStaticMarkup(h(CardList, { beat: beat([word('RASH', 'shared', 0, ['ben', 'cleo'])]), players: bots }));
    expect(html).not.toContain('🤖');
    expect(html).toContain('--face:40px');
  });
  it('marks every chip with its points (the TV total counts them as they land) and who shared each word', () => {
    const html = renderToStaticMarkup(h(CardList, { beat: beat([word('GRITS', 'unique', 2), word('FIHZ', 'unknown'), word('RASH', 'shared', 0, ['ben', 'cleo'])]), players }));
    expect(html).toContain('data-pts="2"');
    expect(html).toContain('data-pts="0"');
    expect(html).toContain('aria-label="RASH, also found by Ben, Cleo"');
  });
});

describe('PhoneStage', () => {
  const me = { id: 'ana', name: 'Ana', isVip: false, canSeeTv: false };
  const base = { round: 1, rounds: 3, size: 4, minLen: 3, lang: 'en', grid: letters, players, paused: false, me: { id: 'ana', score: 0, done: false, words: [] } };
  const at = (now: number, view: Partial<ControllerView>) =>
    renderToStaticMarkup(h(ShellProvider, { value: { now: () => now, play: () => {}, say: () => {}, motion: true } }, h(PhoneStage, { view: { ...base, ...view } as ControllerView, me, send: () => {} })));
  const grid = (html: string) => html.slice(html.lastIndexOf('<', html.indexOf('role="grid"'))).replace(/<p[^>]*>.*?<\/p>/g, '').replace(/<button[^>]*>.*?<\/button>/g, '').replace(/<[^>]+>/g, '');
  it('keeps the grid face down until 60% of the roll, so the turn-over wave meets the TV cubes coming to rest', () => {
    const shake = { phase: 'shake' as const, roll: { at: 10_000, ms: 4000 }, deadline: 14_000 };
    expect(grid(at(12_399, shake))).toBe('');
    expect(grid(at(12_400, shake))).toBe(letters.join(''));
  });
  it('uses the TV’s words for the missed word and the tally, with the longest word spotlit', () => {
    const missed = at(0, { phase: 'reveal', reveal: { step: 3, total: 4, beat: { kind: 'missed', w: 'STRAND', len: 6, glow: [0, 1, 2, 3, 6, 5] }, mineShown: true, rulable: [], counted: [] } });
    expect(missed).toContain('The best word nobody found');
    const tally = at(0, { phase: 'tally', tally: { rows: [{ id: 'ana', before: 0, gained: 11, after: 11, place: 1 }], spotlight: { id: 'ben', w: 'STRANDED', len: 8, pts: 11 } } });
    expect(tally).toContain('Scores after round 1');
    expect(tally).toContain('Longest unique word');
    expect(tally).toContain('aria-label="STRANDED"');
  });
});
