// A reveal card's words, in three bands so a glance reads the story: the words
// that scored (chips with their points), dictionary misses, then the words
// someone else also found, crossed off, with who found them. Icon + text + style,
// never colour alone. Shared by the TV card and the phone's PhoneStage.
// Chips stagger in once, when the card first shows. When the VIP rules on a word
// later, its chip glides to its new band and everything it displaces glides too
// (FLIP), so nothing blinks out, waits, or jumps.
import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { Avatar, L, useMotion } from '@partybox/game-sdk/ui';
import type { BeatView, CardWord, PlayerRow } from './types';
import s from './words.module.css';

type PlayerBeat = Extract<BeatView, { kind: 'player' }>;
type Spot = [number, number];

/** Crossed-off entries a card lists before "+N more shared": the words that scored stay the story. */
const SHARED_SHOWN = { tv: 8, phone: 6 };

export function names(players: PlayerRow[], ids: string[], meId?: string): string {
  return ids.map((id) => (id === meId ? L('you') : players.find((p) => p.id === id)?.name ?? '')).join(', ');
}

const scores = (w: CardWord) => w.status === 'unique' || w.status === 'counted';

/** Layout offsets (transforms ignored) of every [data-flip] element, keyed by what it shows. */
function spots(root: HTMLElement): Map<string, Spot> {
  const m = new Map<string, Spot>();
  root.querySelectorAll<HTMLElement>('[data-flip]').forEach((n) => m.set(n.dataset.flip ?? '', [n.offsetLeft, n.offsetTop]));
  return m;
}

/** A motion token in ms, read from the theme. */
function token(el: Element, name: string): number {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(v);
  return Number.isFinite(n) ? (v.endsWith('ms') ? n : n * 1000) : 0;
}

/**
 * FLIP on content changes after the first frame: where things were is read while the DOM still shows
 * the old card (during render), where they are after the commit; each moved element slides the
 * difference (added on top of its own entrance) and the card's height follows instead of snapping.
 */
export function useGlide(root: RefObject<HTMLElement>, sig: string, motion: boolean, follow = true) {
  const snap = useRef<{ sig: string; from?: Map<string, Spot>; h?: number }>({ sig });
  const grow = useRef<Animation | null>(null);
  if (snap.current.sig !== sig && root.current) snap.current = { sig, from: spots(root.current), h: root.current.offsetHeight };
  useLayoutEffect(() => {
    const el = root.current;
    const { from, h } = snap.current;
    snap.current = { sig };
    if (!el || !from || h === undefined || !motion) return;
    const duration = token(el, '--pb-motion-base');
    const easing = getComputedStyle(el).getPropertyValue('--pb-ease').trim() || 'ease-out';
    for (const [key, [x, y]] of spots(el)) {
      const was = from.get(key);
      const node = el.querySelector<HTMLElement>(`[data-flip="${CSS.escape(key)}"]`);
      if (!was || !node || (was[0] === x && was[1] === y)) continue;
      node.animate([{ transform: `translate(${was[0] - x}px, ${was[1] - y}px)` }, { transform: 'translate(0, 0)' }], { duration, easing, composite: 'add' });
    }
    if (!follow) return;
    grow.current?.cancel();
    const to = el.offsetHeight;
    if (to !== h) grow.current = el.animate([{ height: `${h}px` }, { height: `${to}px` }], { duration, easing });
  }, [sig, root, motion, follow]);
}

/** A length in rem, in px: phone faces (Avatar takes px) follow the text size, so 200 % text keeps them legible. */
export function remPx(k: number): number {
  const rem = typeof document === 'undefined' ? NaN : parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Math.round((Number.isFinite(rem) ? rem : 16) * k);
}

/** A face in the shared band: phone faces are 1.25 rem, TV faces are couch-size. */
export function faceSize(compact?: boolean): number {
  return compact ? remPx(1.25) : 40;
}

type Seen = { i: number; status: CardWord['status'] | 'band'; moved: boolean };

export function CardList({ beat, players, meId, compact }: { beat: PlayerBeat; players: PlayerRow[]; meId?: string; compact?: boolean }) {
  const motion = useMotion();
  const root = useRef<HTMLDivElement>(null);
  const scored = beat.words.filter(scores);
  const unknown = beat.words.filter((w) => w.status === 'unknown');
  const sharedAll = beat.words.filter((w) => w.status === 'shared');
  const shared = sharedAll.slice(0, compact ? SHARED_SHOWN.phone : SHARED_SHOWN.tv);
  // Left off: scoring words (said with their points, after the chips) and shared ones (after their band).
  const moreShared = sharedAll.length - shared.length + beat.more.shared;
  const face = faceSize(compact);
  const sig = `${beat.words.map((w) => `${w.w}:${w.status}`).join(' ')}|${beat.more.words}|${moreShared}`;
  useGlide(root, sig, motion);

  // Stagger order is fixed on the card's first frame. A chip that later changes band (a VIP ruling)
  // is "moved": no stagger wait, it glides over and pulses as it lands, when the total adds it.
  const seen = useRef(new Map<string, Seen>());
  const first = seen.current.size === 0;
  const now = new Map<string, Seen>();
  const at = (key: string, status: Seen['status']): Seen => {
    const was = seen.current.get(key);
    const it = { i: was ? was.i : first ? now.size : 0, status, moved: was ? was.moved || was.status !== status : false };
    now.set(key, it);
    return it;
  };
  useLayoutEffect(() => { seen.current = now; });
  const chip = (w: CardWord) => {
    const it = at(w.w, w.status);
    return { 'data-flip': w.w, 'data-pts': w.pts, style: { '--i': it.i } as CSSProperties, className: `${s.chip} ${s[w.status]} ${it.moved ? s.moved : ''}` };
  };
  const band = (key: string) => ({ 'data-flip': key, style: { '--i': at(key, 'band').i } as CSSProperties });
  const n = beat.more.words;

  return (
    <div ref={root} className={`${s.card} ${compact ? s.compact : ''}`}>
      {scored.length || n > 0 ? (
        <ul className={s.chips} aria-label={L('Words that score')}>
          {scored.map((w) => (
            <li key={w.w} {...chip(w)}>
              <b className={s.word}>{w.w}</b>
              <span className={s.pts}>{w.status === 'counted' ? L('VIP ✓ +{pts}', { pts: w.pts }) : `+${w.pts}`}</span>
            </li>
          ))}
          {/* The words left off, as one last chip with their points: the TV total counts it like the rest. */}
          {n > 0 ? (
            <li {...band('more-words')} data-pts={beat.more.pts} className={`${s.chip} ${s.extra}`}>
              <b className={s.word}>{n === 1 ? L('+1 more word') : L('+{n} more words', { n })}</b>
              <span className={s.pts}>+{beat.more.pts}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
      {unknown.length ? (
        <ul className={s.chips} aria-label={L('Not in the dictionary')}>
          {unknown.map((w) => (
            <li key={w.w} {...chip(w)}>
              <span aria-hidden>❓</span>
              <b className={s.word}>{w.w}</b>
              <span className={s.pts}>{L('not in the dictionary')}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {shared.length ? (
        <div className={s.crossed} {...band('crossed')}>
          <p className={s.band}>✕ {L('Shared, so no points')}</p>
          <ul className={s.sharedList}>
            {shared.map((w, k) => (
              <li key={w.w} style={{ '--k': k } as CSSProperties} aria-label={L('{word}, also found by {names}', { word: w.w, names: names(players, w.with, meId) })}>
                <s className={s.struck}>{w.w}</s>
                <span className={s.who} style={{ '--face': `${face}px` } as CSSProperties} aria-hidden>
                  {w.with.flatMap((id) => {
                    const p = players.find((x) => x.id === id);
                    // No bot badge in a stack of faces: the next face would cut it in half.
                    return p ? [<span key={id} className={id === meId ? s.me : undefined}><Avatar player={{ ...p, bot: false }} size={face} /></span>] : [];
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {moreShared > 0 ? (
        <p className={s.more} {...band('more')}>{shared.length ? L('+{n} more shared', { n: moreShared }) : moreShared === 1 ? L('✕ 1 shared, so no points') : L('✕ {n} shared, so no points', { n: moreShared })}</p>
      ) : null}
    </div>
  );
}
