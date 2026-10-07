import { describe, expect, it } from 'vitest';
import { cubePackSchema, botWordsSchema } from '../content/schema';
import { LANGS, packFor } from '../server/content';
import { hasPrefix, hasWord, isSorted } from '../server/dict';
import { areNeighbours, firstBreak, foldWord, isLegalPath, pointsFor, wordFromPath } from '../server/rules';
import { bestMissed, solve } from '../server/solver';
import { GRID, STRANDED } from './helpers';


describe('grid rules', () => {
  it('neighbours include diagonals and nothing else', () => {
    expect(areNeighbours(0, 5, 4)).toBe(true);
    expect(areNeighbours(3, 4, 4)).toBe(false); // row wrap
    expect(areNeighbours(0, 2, 4)).toBe(false);
    expect(areNeighbours(5, 5, 4)).toBe(false);
  });
  it('a legal path touches, never repeats, stays in range', () => {
    expect(isLegalPath(STRANDED, 4)).toBe(true);
    expect(isLegalPath([0, 1, 0], 4)).toBe(false);
    expect(isLegalPath([0, 2], 4)).toBe(false);
    expect(isLegalPath([15, 16], 4)).toBe(false);
    expect(isLegalPath([0.5], 4)).toBe(false);
    expect(firstBreak([4, 1, 8], 4)).toEqual([1, 8]);
  });
  it('spells words from the grid; Qu is two letters', () => {
    expect(wordFromPath(GRID, STRANDED)).toBe('stranded');
    expect(pointsFor('stranded')).toBe(11);
    expect(pointsFor('quit')).toBe(1);
    expect(pointsFor('quite')).toBe(2);
    expect([3, 4, 5, 6, 7, 8, 12].map((n) => pointsFor('a'.repeat(n)))).toEqual([1, 1, 2, 3, 5, 11, 11]);
  });
  it('folds accents and keeps ñ', () => {
    expect(foldWord('CAÑÓN')).toBe('cañon');
    expect(foldWord('Pingüino')).toBe('pinguino');
  });
});

describe('content', () => {
  it.each(LANGS)('%s packs validate and are sorted', (lang) => {
    const p = packFor(lang);
    expect(cubePackSchema.parse(p.cubes).lang).toBe(lang);
    expect(botWordsSchema.safeParse(p.bots).success).toBe(true);
    expect(isSorted(p.words)).toBe(true);
    expect(isSorted(p.blocked)).toBe(true);
    for (const k of ['easy', 'normal', 'sharp'] as const) {
      expect(isSorted(p.bots[k])).toBe(true);
      expect(p.bots[k].every((w) => hasWord(p.words, w))).toBe(true);
    }
    expect(p.words.length).toBeGreaterThan(200_000);
  });
  it('the Spanish set has Ñ and the dictionary has ñ words', () => {
    const es = packFor('es');
    expect(es.cubes.sets['4x4'].some((c) => c.faces.includes('Ñ'))).toBe(true);
    expect(hasWord(es.words, 'año')).toBe(true);
    expect(hasPrefix(es.words, 'señor')).toBe(true);
  });
});

describe('solver', () => {
  it('finds STRANDED and the longest missed word', () => {
    const all = solve(GRID, 4, packFor('en').words, 3);
    const found = all.find((f) => f.w === 'stranded');
    expect(found).toBeDefined();
    expect(isLegalPath(found!.path, 4)).toBe(true);
    const m = bestMissed(all, new Set(['stranded']));
    expect(m && m.w.length).toBeGreaterThanOrEqual(7);
  });
});
