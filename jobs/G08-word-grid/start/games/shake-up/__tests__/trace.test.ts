import { describe, expect, it } from 'vitest';
import { clock, dragStep, hitCell, tapStep } from '../client/trace';

describe('phone tracing', () => {
  it('hit circles: centres hit, corners between cubes do not', () => {
    expect(hitCell(50, 50, 400, 4)).toBe(0);
    expect(hitCell(350, 350, 400, 4)).toBe(15);
    expect(hitCell(100, 100, 400, 4)).toBe(-1); // the corner where four cubes meet
    expect(hitCell(-1, 10, 400, 4)).toBe(-1);
  });
  it('drag extends to touching cells and backs up one', () => {
    let p = dragStep([], 0, 4);
    p = dragStep(p, 5, 4);
    p = dragStep(p, 10, 4);
    expect(p).toEqual([0, 5, 10]);
    expect(dragStep(p, 5, 4)).toEqual([0, 5]); // back up
    expect(dragStep(p, 2, 4)).toEqual([0, 5, 10]); // not touching: ignored
    expect(dragStep(p, 0, 4)).toEqual([0, 5, 10]); // already used
  });
  it('tap extends, undoes the last, or starts again', () => {
    expect(tapStep([0, 1], 2, 4)).toEqual([0, 1, 2]);
    expect(tapStep([0, 1], 1, 4)).toEqual([0]);
    expect(tapStep([0, 1], 15, 4)).toEqual([15]);
  });
  it('formats the clock', () => {
    expect(clock(12_000)).toBe('0:12');
    expect(clock(180_000)).toBe('3:00');
    expect(clock(-5)).toBe('0:00');
  });
});
