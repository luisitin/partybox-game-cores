// hunt (TV): the clock, who has how many words (never which), and a toast for
// long finds. Everything here is drama; phones carry every input.
import { useLayoutEffect, useRef, type RefObject } from 'react';
import { Avatar, L, useReading, useServerNow } from '@partybox/game-sdk/ui';
import { clock } from '../trace';
import type { TvView } from '../types';
import { cssMs, inLastCall } from './pace';
import s from './tv.module.css';

/** How far a row being overtaken steps back while the climber passes (never out of sight). */
const OVERTAKEN = 0.45;
/** How much a climbing row lifts toward the viewer at the moment it passes. */
const LIFT = 1.05;
/** Where in the glide (by time) the rows are crossing. */
const PASS = [0.12, 0.4] as const;

/**
 * FLIP: when the ranking changes, each row starts where it was and glides to its new slot on the row's own
 * CSS transition, so the board re-sorts in view instead of jumping. One column, so every move is vertical:
 * a climber lifts and swings a step aside as it passes the rows it overtakes (raised, full strength) while
 * they step back a shade, so the two never read as one smudge, and no row ever leaves the board.
 */
function useGlide(list: RefObject<HTMLOListElement>, order: string) {
  const last = useRef({ order, at: new Map<string, number>() });
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const moved = last.current.order !== order;
    const at = new Map<string, number>();
    const box = ol.getBoundingClientRect();
    const zoom = ol.offsetHeight ? box.height / ol.offsetHeight : 1; // the TV may be scaled to fit
    for (const li of Array.from(ol.children) as HTMLElement[]) {
      const now = li.offsetTop;
      at.set(li.dataset.id ?? '', now);
      const was = last.current.at.get(li.dataset.id ?? '');
      if (!moved || was === undefined || was === now) continue;
      // A row still gliding from the last re-sort starts from where it is seen, not where it was laid out.
      const flying = (li.getBoundingClientRect().top - box.top) / zoom - now;
      li.style.transition = 'none';
      li.style.transform = `translateY(${was - now + flying}px)`;
      li.getBoundingClientRect(); // commit the start pose before the transition takes over
      li.style.transition = '';
      li.style.transform = '';
      // On the glide's own clock.
      const cs = getComputedStyle(li);
      const ms = cssMs(cs.transitionDuration);
      if (ms <= 0) continue;
      // A climber lifts toward the viewer and swings a step aside as it passes. The ease is front-loaded,
      // so the rows cross early: the lift and the dim peak by PASS[0] of the glide, hold through PASS[1],
      // then settle by its end.
      const swing = cs.getPropertyValue('--pb-space-5').trim() || '0px';
      const lift = now < was
        ? { zIndex: ['1', '1', '1', '1'], translate: ['0 0', `${swing} 0`, `${swing} 0`, '0 0'], scale: ['1', String(LIFT), String(LIFT), '1'] }
        : { filter: ['opacity(1)', `opacity(${OVERTAKEN})`, `opacity(${OVERTAKEN})`, 'opacity(1)'] };
      try {
        li.animate({ ...lift, offset: [0, PASS[0], PASS[1], 1], easing: 'ease-in-out' }, { duration: ms });
      } catch {
        /* an engine that cannot animate these: the row still glides */
      }
    }
    last.current = { order, at };
  });
}

export function HuntPanel({ view }: { view: TvView }) {
  const now = useServerNow(250);
  const left = Math.max(0, (view.deadline ?? now) - now);
  const h = view.hunt;
  useReading(h && inLastCall(left) ? h.lastCall : undefined);
  const list = useRef<HTMLOListElement>(null);
  const rows = h ? view.players.slice().sort((a, b) => (h.counts[b.id] ?? 0) - (h.counts[a.id] ?? 0) || a.seat - b.seat) : [];
  useGlide(list, rows.map((p) => p.id).join(','));
  if (!h) return null;
  const danger = left <= 5000;
  const toastName = h.toast ? view.players.find((p) => p.id === h.toast?.id)?.name : undefined;
  return (
    <div className={s.panel}>
      <div className={`${s.timer} ${danger ? s.danger : ''}`} role="timer" aria-live="off">
        {danger ? '⏰ ' : ''}{clock(view.paused ? 0 : left)}<small>{view.paused ? L('paused') : L('left')}</small>
      </div>
      <h2 className={s.h2}>{L('Words found')}</h2>
      {/* One ranked column: a re-sort is a vertical glide, never a jump across. */}
      <ol ref={list} className={s.counts}>
        {rows.map((p) => (
          <li key={p.id} data-id={p.id} className={p.away ? s.away : ''}>
            <Avatar player={p} size={52} />
            <span className={s.name}>{p.name}</span>
            <b key={h.counts[p.id] ?? 0} className={h.counts[p.id] ? s.up : undefined}>{h.counts[p.id] ?? 0}</b>
            <span className={s.state} aria-label={h.done.includes(p.id) ? L('done') : p.away ? L('away') : L('hunting')}>
              {h.done.includes(p.id) ? '✓' : p.away ? '💤' : '✎'}
            </span>
          </li>
        ))}
      </ol>
      {h.toast && toastName ? (
        <div key={h.toast.seq} className={s.toast}>✨ {L('{name} just found a {n}-letter word', { name: toastName, n: h.toast.len })}</div>
      ) : null}
    </div>
  );
}
