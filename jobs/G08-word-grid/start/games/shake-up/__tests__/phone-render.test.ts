// The phone's screens, as markup: the end of the game on every phone, the card title's total badge, the
// VIP's rulings (who found it, a solid "Counted"), the hunt overlays, and the 5×5 turn-over fitting the roll.
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ShellProvider, type Me } from '@partybox/game-sdk/ui';
import { Controller } from '../client/Controller';
import { LetterGrid } from '../client/LetterGrid';
import { PhoneStage } from '../client/phone/Stage';
import { phoneStagePhases } from '../client/phone-entry';
import type { ControllerView, PlayerRow } from '../client/types';

const players: PlayerRow[] = ['Ana', 'Ben', 'Cleo'].map((name, seat) => ({ id: name.toLowerCase(), name, seat, bot: false, away: false, score: 0 }));
const letters = 'STRAEDNIREDLOMQT'.split('');
const base = { round: 1, rounds: 1, size: 4, minLen: 3, lang: 'en', grid: letters, players, paused: false, me: { id: 'ben', role: 'player' as const, score: 0, done: false, words: [] } };
const shell = { now: () => 0, play: () => {}, say: () => {}, motion: true };
const me = (o: Partial<Me> = {}): Me => ({ id: 'ben', name: 'Ben', isVip: false, canSeeTv: true, ...o });
const stage = (view: Partial<ControllerView>, m = me({ canSeeTv: false })) =>
  renderToStaticMarkup(h(ShellProvider, { value: shell }, h(PhoneStage, { view: { ...base, ...view } as ControllerView, me: m, send: () => {}, skip: () => {} })));
const phone = (view: Partial<ControllerView>, m = me()) =>
  renderToStaticMarkup(h(ShellProvider, { value: shell }, h(Controller, { view: { ...base, ...view } as ControllerView, me: m, send: () => {}, skip: () => {} })));
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

beforeAll(() => {
  const error = console.error.bind(console);
  vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { if (!String(a[0]).includes('useLayoutEffect does nothing on the server')) error(...a); });
});

const done: Partial<ControllerView> = {
  phase: 'done',
  tally: { rows: [{ id: 'ana', before: 0, gained: 11, after: 11, place: 1 }, { id: 'ben', before: 0, gained: 3, after: 3, place: 2 }, { id: 'cleo', before: 0, gained: 0, after: 0, place: 3 }] },
  final: {
    headline: 'Ana out-spelled the room',
    awards: [{ id: 'lone-wolf', playerId: 'ben', icon: '🐺', title: 'Lone Wolf', description: 'Most words nobody else found.', playerIds: ['ben'], value: '3 unique words' }],
    longest: { id: 'ana', w: 'STRANDED', len: 8 },
    missed: { w: 'TRADES', len: 6 },
  },
};

describe('end of game', () => {
  it('routes done to PhoneStage for a phone that cannot see the TV', () => {
    expect(phoneStagePhases).toContain('done');
  });
  it('PhoneStage shows the whole result: winner, ranking, awards, the best word nobody found', () => {
    const t = text(stage(done));
    expect(t).toContain('Final results');
    expect(t).toContain('Ana out-spelled the room');
    expect(t.indexOf('Ana')).toBeLessThan(t.indexOf('Ben'));
    expect(t).toContain('Lone Wolf');
    expect(t).toContain('The best word nobody found');
    expect(stage(done)).toContain('aria-label="TRADES"');
  });
  it('a phone at the TV says where you finished, with your own awards', () => {
    const t = text(phone(done));
    expect(t).toContain('You finished 2nd with 3');
    expect(t).toContain('Lone Wolf');
    expect(text(phone(done, me({ id: 'cleo' })))).not.toContain('Lone Wolf');
  });
});

describe('PhoneStage reveal', () => {
  const card = (total: number): Partial<ControllerView> => ({
    phase: 'reveal',
    reveal: { step: 0, total: 2, mineShown: false, counted: ['FIHZ'], rulable: [{ w: 'FIHZ', by: ['ana'] }],
      beat: { kind: 'player', id: 'ana', total, glow: [], more: { words: 0, pts: 0, shared: 0 }, words: [{ w: 'FIHZ', len: 4, pts: total, status: 'counted', with: [] }] } },
  });
  it('keeps the total as its own badge beside the title (it never wraps away from the name)', () => {
    expect(stage(card(337))).toMatch(/<h1>Ana’s words<\/h1><b class="[^"]*">\+337<\/b>/);
    expect(stage(card(0))).toMatch(/<h1>Ana’s words<\/h1><b class="[^"]*">0<\/b>/);
  });
  it('the VIP rules with the finder’s face, a solid "Counted" and a quiet Undo; Next card is in the sticky bar', () => {
    const html = stage(card(1), me({ isVip: true, canSeeTv: false }));
    expect(html).toMatch(/aria-label="Ana"[^]*<b>FIHZ<\/b>/);
    expect(html).toMatch(/<span class="[^"]*">✓ Counted<\/span><button type="button"[^>]*>Undo<\/button>/);
    expect(html).toContain('Next card ▶');
  });
  it('an idle VIP screen names the card that is up, not the dictionary', () => {
    const idle = { ...card(0), reveal: { ...card(0).reveal!, rulable: [], counted: [] } };
    const t = text(phone(idle, me({ id: 'cleo', isVip: true })));
    expect(t).toContain('Up now: Ana’s words');
    expect(t).not.toContain('Not in the dictionary');
  });
});

describe('hunt', () => {
  it('puts "done" over the grid (after it in the page), never above it', () => {
    const html = phone({ phase: 'hunt', deadline: 60_000, me: { ...base.me, done: true }, waitingOn: 2 });
    expect(html.indexOf('role="grid"')).toBeGreaterThan(-1);
    expect(html.indexOf('You’re done')).toBeGreaterThan(html.indexOf('role="grid"'));
    expect(html.indexOf('You’re done')).toBeLessThan(html.indexOf('Your words'));
  });
});

describe('PhoneStage turn-over', () => {
  it('passes the time the wave may take, so the steps can shorten to fit a 5×5 grid', () => {
    const html = renderToStaticMarkup(h(LetterGrid, { letters: Array(25).fill('A'), size: 5, deal: 'up', turnMs: 1680, label: 'g' }));
    expect(html).toContain('--turn-span:1680ms');
    expect(stage({ phase: 'shake', size: 5, grid: Array(25).fill('A'), roll: { at: 0, ms: 4200 }, deadline: 4200 })).toContain('--turn-span:1680ms');
  });
});
