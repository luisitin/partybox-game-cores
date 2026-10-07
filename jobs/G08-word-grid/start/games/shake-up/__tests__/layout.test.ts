// Layout contracts the films check at 320×568 and at 200 % text, pinned here so a later edit cannot quietly
// undo them: the phone hunt keeps its list in view without scrolling the screen, the unknown-word verdict
// fits its two lines, the card badge wraps instead of leaving the screen, the stage phone's hand-offs, and
// the TV's one-column ranking that re-sorts by gliding (no row ever blanks).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { phoneRoute, phoneStagePhases } from '../client/phone-entry';
import { strings } from '../client/strings';

const client = join(__dirname, '..', 'client');
const read = (f: string) => readFileSync(join(client, f), 'utf8');
/** The declarations of the first rule whose selector is exactly `sel` (outside or inside an at-rule). */
const rule = (css: string, sel: string) => {
  const m = new RegExp(`(?:^|[}\\s])${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm').exec(css);
  return m?.[1] ?? '';
};

describe('phone hunt at small sizes', () => {
  const css = read('phone/phone.module.css');
  it('reserves two rows of chips for the list and clips the hunt, so only the list scrolls', () => {
    expect(rule(css, '.hunt')).toMatch(/--su-list:\s*calc\(2 \*/);
    expect(rule(css, '.hunt')).toMatch(/overflow:\s*clip/);
  });
  it('lets the grid give way down to a thumb, with no width floor that beats the list', () => {
    const stage = rule(css, '.stage');
    expect(stage).not.toMatch(/80%/);
    expect(stage).toMatch(/var\(--su-list\)/);
    expect(stage).toMatch(/var\(--su-cur\)/);
  });
  it('tightens on a short hunt (a small phone or large text) by a rem query', () => {
    expect(css).toMatch(/@container \(max-height: \d+rem\)/);
  });
  it('clamps the verdict to the two lines kept for it, and says it in one short clause', () => {
    expect(css).toMatch(/\.note \{[^}]*-webkit-line-clamp: 2/);
    expect(read('phone/Hunt.tsx')).toContain("L('❓ {word}: the VIP decides'");
    expect(strings['❓ {word}: the VIP decides']).toBe('❓ {word}: el VIP decide');
  });
  it('keeps the done card inside the grid', () => {
    expect(rule(css, '.doneCard')).toMatch(/max-width:\s*100%/);
  });
});

describe('PhoneStage card header', () => {
  const css = read('phone/phone.module.css');
  it('wraps the total badge under the title when both do not fit, right-aligned', () => {
    expect(rule(css, '.head')).toMatch(/flex-wrap:\s*wrap/);
    expect(rule(css, '.badge')).toMatch(/margin-inline-start:\s*auto/);
  });
});

describe('stage phone hand-offs', () => {
  it('crossfades Controller <-> PhoneStage, except shake -> hunt, which keeps the grid in place', () => {
    expect(phoneRoute('shake', false)).toBe(phoneRoute('hunt', false));
    expect(phoneRoute('hunt', false)).not.toBe(phoneRoute('reveal', false));
    for (const p of phoneStagePhases.filter((x) => x !== 'shake')) expect(phoneRoute(p, false)).toBe('stage');
    for (const p of ['lobby', 'shake', 'hunt', 'reveal', 'tally', 'done']) expect(phoneRoute(p, true)).toBe('controller');
  });
  it('PhoneStage leaves its entrance to the shell (it would rise twice)', () => {
    expect(read('phone/Stage.tsx')).not.toMatch(/s\.arrive/);
  });
});

describe('TV hunt ranking', () => {
  it('is one column, so a re-sort is a vertical glide', () => {
    const counts = rule(read('tv/tv.module.css'), '.counts');
    expect(counts).toMatch(/grid-auto-flow:\s*row/);
    expect(counts).not.toMatch(/1fr 1fr/);
  });
  it('never fades a row out while it moves', () => {
    expect(read('tv/HuntPanel.tsx')).not.toMatch(/opacity\(0\)/);
  });
});
