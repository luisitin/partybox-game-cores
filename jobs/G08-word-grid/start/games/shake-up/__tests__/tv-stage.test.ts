// TV stage timing, as markup and pure maths: the tally's events wait for the shell's pan (and the strip
// holds its scores that much longer), a missed word's length waits for its tiles, and an empty beat
// fills its card at headline size.
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { climbMs, Scoreboard } from '@partybox/game-sdk/ui';
import { panEnterMs } from '../client/tv/pace';
import { RevealPanel } from '../client/tv/RevealPanel';
import { TallyStage } from '../client/tv/TallyStage';
import type { PlayerRow, TvView } from '../client/types';

const players: PlayerRow[] = ['Ana', 'Ben', 'Cleo'].map((name, seat) => ({ id: name.toLowerCase(), name, seat, bot: false, away: false, score: 0 }));
const base = { round: 1, rounds: 1, size: 4, minLen: 3, lang: 'en', grid: [], players, paused: false, throwSeed: 1, cubes: [] };
const tally = { ...base, phase: 'tally', tally: { rows: players.map((p, i) => ({ id: p.id, before: 0, gained: 3 - i, after: 3 - i, place: i + 1 })), spotlight: { id: 'ana', w: 'HAINTS', len: 6, pts: 3 } } } as unknown as TvView;
const reveal = (beat: unknown) => ({ ...base, phase: 'reveal', reveal: { step: 0, total: 2, beat, next: [] } }) as unknown as TvView;
const delays = (html: string) => [...html.matchAll(/animation-delay:(\d+)ms/g)].map((m) => Number(m[1]));

describe('tally after the pan', () => {
  it('starts its events as the camera eases into its stop, and not at all with motion off', () => {
    expect(panEnterMs({ slow: 600, fast: 150 })).toBe(450);
    expect(panEnterMs({ slow: 0, fast: 0 })).toBe(0);
  });
  it('the Scoreboard climb waits by its delay, and climbMs counts it, so the strip holds until the board is done', () => {
    const rows = players.map((p, i) => ({ player: p, score: 3 - i, place: i + 1 }));
    expect(delays(renderToStaticMarkup(h(Scoreboard, { rows, climb: true })))[0]).toBe(0);
    const late = delays(renderToStaticMarkup(h(Scoreboard, { rows, climb: true, delay: 450 })));
    expect(Math.min(...late)).toBe(450);
    expect(climbMs(3, 120, 450) - climbMs(3, 120)).toBe(450);
  });
  it('TallyStage hands the Scoreboard the pan wait', () => {
    expect(Math.min(...delays(renderToStaticMarkup(h(TallyStage, { view: tally }))))).toBe(panEnterMs({ slow: 600, fast: 150 }));
  });
});

describe('reveal cards', () => {
  it('a missed word carries its tile count, so its length line lands after the last tile', () => {
    const html = renderToStaticMarkup(h(RevealPanel, { view: reveal({ kind: 'missed', w: 'PITARAH', len: 7, glow: [] }) }));
    expect(html).toContain('--su-n:7');
    expect(html.indexOf('7 letters')).toBeGreaterThan(html.lastIndexOf('>H<'));
  });
  it('an empty beat speaks at h1 with couch-size faces', () => {
    const html = renderToStaticMarkup(h(RevealPanel, { view: reveal({ kind: 'empty', ids: ['ben'], all: false }) }));
    expect(html).toContain('var(--pb-tv-h1)');
    expect(html).toContain('width:96px');
  });
});
