// TV pacing promises: the hunt caption never shows a line that is no longer true, a reveal card's
// total counts up with its chips and always ends on the beat's total, and a crossfade keeps only the
// keys that are actually leaving.
import { describe, expect, it } from 'vitest';
import { keepLeaving } from '@partybox/game-sdk/ui';
import { countAt, cssMs, huntCaption, inLastCall, LAST_CALL } from '../client/tv/pace';
import type { TvView } from '../client/types';

const go = { key: 'su:r1:go', text: 'Ninety seconds. Go!' };
const last = { key: 'su:r1:30', text: 'Thirty seconds!' };
const view = { phase: 'hunt', say: go, hunt: { counts: {}, done: [], lastCall: last } } as unknown as TvView;
const callMs = LAST_CALL.from - LAST_CALL.to;

describe('hunt caption', () => {
  it('shows the go line for one call window, then clears it', () => {
    expect(huntCaption(view, 90_000, 0)).toBe(go);
    expect(huntCaption(view, 90_000 - callMs + 1, callMs - 1)).toBe(go);
    expect(huntCaption(view, 90_000 - callMs, callMs)).toBeUndefined();
    expect(huntCaption(view, 64_000, 26_000)).toBeUndefined();
  });
  it('shows "Thirty seconds!" only inside its window, which is where it is read', () => {
    expect(huntCaption(view, LAST_CALL.from + 1, 60_000)).toBeUndefined();
    expect(huntCaption(view, LAST_CALL.from, 60_000)).toBe(last);
    expect(huntCaption(view, LAST_CALL.to + 1, 60_000)).toBe(last);
    expect(huntCaption(view, LAST_CALL.to, 60_000)).toBeUndefined();
    expect(inLastCall(LAST_CALL.from)).toBe(true);
    expect(inLastCall(LAST_CALL.to)).toBe(false);
  });
  it('a TV that joins late still captions the go line it has just been sent', () => {
    expect(huntCaption(view, 70_000, 0)).toBe(go);
  });
});

describe('card total count-up', () => {
  const plan = [{ at: 100, pts: 3 }, { at: 250, pts: 3 }, { at: 400, pts: 2 }];
  it('adds each chip as it lands and never goes down', () => {
    let prev = 0;
    for (let t = 0; t <= 500; t += 10) {
      const v = countAt(plan, t, 11);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
    expect(countAt(plan, 99, 11)).toBe(0);
    expect(countAt(plan, 100, 11)).toBe(3);
    expect(countAt(plan, 399, 11)).toBe(6);
  });
  it('ends on the beat total, including words beyond the card', () => {
    expect(countAt(plan, 400, 11)).toBe(11);
    expect(countAt([], 0, 4)).toBe(4);
  });
  it('reads computed CSS times', () => {
    expect(cssMs('0.45s')).toBe(450);
    expect(cssMs('300ms, 0s')).toBe(300);
    expect(cssMs('0s')).toBe(0);
    expect(cssMs('')).toBe(0);
  });
});

describe('crossfade keeps only leaving keys', () => {
  const k = (key: string) => ({ key, node: null, rose: true });
  it('A → B keeps A; A → B → C keeps A and B; A → B → A keeps only B', () => {
    const ab = keepLeaving([], k('A'), 'B');
    expect(ab.map((x) => x.key)).toEqual(['A']);
    expect(keepLeaving(ab, k('B'), 'C').map((x) => x.key)).toEqual(['A', 'B']);
    expect(keepLeaving(ab, k('B'), 'A').map((x) => x.key)).toEqual(['B']);
  });
});
