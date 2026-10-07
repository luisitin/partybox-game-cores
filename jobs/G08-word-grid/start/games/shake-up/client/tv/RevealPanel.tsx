// reveal (TV): one card per beat; the tray glows the card's best word.
import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Avatar, BigText, CrossfadeSwap, L } from '@partybox/game-sdk/ui';
import { CardList, names } from '../CardList';
import type { BeatView, PlayerRow, TvView } from '../types';
import { faces, WordTiles } from '../WordTiles';
import { countAt, cssMs, type Landing } from './pace';
import s from './tv.module.css';

type PlayerBeat = Extract<BeatView, { kind: 'player' }>;

/**
 * The card total counts up in step with its chips: a chip's points are added as it pops in (half-way
 * through its own entrance, read from its CSS), so the payoff is never given away up front. A chip that
 * appears later (a VIP ruling) counts when it lands. Chips are found by data-pts, or by their word.
 */
function useCountUp(card: RefObject<HTMLDivElement>, b: PlayerBeat): number {
  const [shown, setShown] = useState(0);
  const born = useRef(new WeakMap<Element, number>());
  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const pts = new Map(b.words.filter((w) => w.pts > 0).map((w) => [w.w, w.pts]));
    const t0 = performance.now();
    const plan: Landing[] = [];
    for (const li of Array.from(el.querySelectorAll('li'))) {
      const p = Number((li as HTMLElement).dataset.pts ?? pts.get(li.querySelector('b')?.textContent ?? '') ?? 0);
      if (!(p > 0)) continue;
      if (!born.current.has(li)) born.current.set(li, t0);
      const cs = getComputedStyle(li);
      plan.push({ at: (born.current.get(li) ?? t0) + cssMs(cs.animationDelay) + cssMs(cs.animationDuration) / 2, pts: p });
    }
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      setShown(countAt(plan, now, b.total));
      if (plan.some((c) => c.at > now)) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [card, b]);
  return shown;
}

function PlayerCard({ b, who, players }: { b: PlayerBeat; who: PlayerRow; players: PlayerRow[] }) {
  const card = useRef<HTMLDivElement>(null);
  const total = useCountUp(card, b);
  // The entries CardList staggers in: each word not crossed off, the "+N more" chip, the shared band.
  const k = b.words.filter((w) => w.status !== 'shared').length + (b.more.words > 0 ? 1 : 0) + (b.words.some((w) => w.status === 'shared') || b.more.shared > 0 ? 1 : 0);
  return (
    <div ref={card} className={`${s.card} ${s.unroll}`} style={{ '--su-k': k } as CSSProperties}>
      <header className={s.cardHead}>
        <Avatar player={who} size={72} />
        <span>{L('{name}’s words', { name: who.name })}</span>
        {/* Re-keyed per step so each added chip ticks the number. 0 is not a gain: muted, no "+". */}
        <b key={total} className={`${s.total} ${total > 0 ? '' : s.zero}`}>{total > 0 ? `+${total}` : '0'}</b>
      </header>
      <CardList beat={b} players={players} />
    </div>
  );
}

export function RevealPanel({ view }: { view: TvView }) {
  const r = view.reveal;
  if (!r) return null;
  const b = r.beat;
  const who = b.kind === 'player' ? view.players.find((p) => p.id === b.id) : undefined;
  return (
    <div className={s.panel}>
      {/* Above the card, so neither it nor the card's header moves as cards change height. */}
      <ol className={s.progress} aria-label={L('Reveal order')}>
        {Array.from({ length: r.total }, (_, i) => (
          <li key={i} className={i < r.step ? s.past : i === r.step ? s.now : ''}>{i < r.step ? '✓' : i === r.step ? '▶' : '·'}</li>
        ))}
      </ol>
      <CrossfadeSwap swapKey={`beat-${view.round}-${r.step}`}>
        {b.kind === 'player' && who ? (
          <PlayerCard b={b} who={who} players={view.players} />
        ) : b.kind === 'missed' ? (
          // --su-n: tile count, so the length waits for the last tile (saying it first gives the word away).
          <div className={`${s.card} ${s.missed}`} style={{ '--su-n': faces(b.w).length } as CSSProperties}>
            <p className={s.kicker}>{L('The best word nobody found')}</p>
            <WordTiles word={b.w} className={s.spotWord} />
            <p className={`${s.sub} ${s.afterTiles}`}>{L('{n} letters', { n: b.len })}</p>
          </div>
        ) : b.kind === 'empty' ? (
          <div className={s.card}>
            <div className={s.faces}>
              {b.ids.flatMap((id) => {
                const p = view.players.find((x) => x.id === id);
                return p ? [<Avatar key={id} player={p} size={96} />] : [];
              })}
            </div>
            <BigText size="h1">{b.all ? L('No words this round') : L('No words from {names}', { names: names(view.players, b.ids) })}</BigText>
          </div>
        ) : null}
      </CrossfadeSwap>
    </div>
  );
}
