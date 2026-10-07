// TV pacing (pure, unit-tested): which reader line the caption shows during the hunt, how far a reveal
// card's total has counted up, and when the tally's entrances start. The DOM side lives in the panels.
import type { TvView } from '../types';

type Line = NonNullable<TvView['say']>;

/** The 30 s call: HuntPanel has it read, and the caption shows it, while the clock is in this window. */
export const LAST_CALL = { from: 30_000, to: 25_000 };

export function inLastCall(left: number): boolean {
  return left <= LAST_CALL.from && left > LAST_CALL.to;
}

/**
 * The hunt caption: the go line for one call window after it first showed, "Thirty seconds!" inside its
 * window, and nothing in between, so the TV never shows a line that is no longer true.
 */
export function huntCaption(view: TvView, left: number, goShownMs: number): Line | undefined {
  if (view.hunt && inLastCall(left)) return view.hunt.lastCall;
  return goShownMs < LAST_CALL.from - LAST_CALL.to ? view.say : undefined;
}

/** One scoring chip: when it has landed (ms, same clock as `now`) and what it adds. */
export type Landing = { at: number; pts: number };

/** A card total counts up chip by chip; once every chip has landed it is the beat's full total. */
export function countAt(plan: readonly Landing[], now: number, total: number): number {
  let sum = 0;
  let due = 0;
  for (const c of plan) {
    if (c.at > now) continue;
    sum += c.pts;
    due++;
  }
  return due === plan.length ? total : sum;
}

/** The first entry of a computed CSS time list ("0.45s, 0s" or "300ms") in ms. */
export function cssMs(value: string): number {
  const first = value.split(',')[0]?.trim() ?? '';
  const n = parseFloat(first);
  if (!Number.isFinite(n)) return 0;
  return first.endsWith('ms') ? n : n * 1000;
}

/**
 * The tally arrives by the shell's camera pan (about the slow token, eased in and out). Its entrances wait
 * until the camera is easing into its stop, so the word lands on camera and nothing moves under the pan.
 * tv.module.css .tally --su-enter is the same sum in CSS.
 */
export function panEnterMs(m: { slow: number; fast: number }): number {
  return Math.max(0, m.slow - m.fast);
}
