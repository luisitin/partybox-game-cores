import { describe, expect, it } from 'vitest';
import { faceMaterialOrder, labelFontPx } from './letterFaces';

describe('Dice3d letter faces', () => {
  it('puts faces[up] in the +y slot and uses every face once', () => {
    for (let up = 0; up < 6; up++) {
      const order = faceMaterialOrder(up);
      expect(order[2]).toBe(up);
      expect([...order].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });
  it('shrinks two-letter labels like Qu so they fit', () => {
    expect(labelFontPx('A', 256)).toBeGreaterThan(labelFontPx('Qu', 256));
    expect(labelFontPx('Qu', 256)).toBeGreaterThan(labelFontPx('10', 256) - 1);
  });
});
