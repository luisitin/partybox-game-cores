// done (phone): the game's last screen. With the TV in view, your own finish
// and awards (the TV holds the ceremony). Without it (PhoneStage), the whole
// result: the winner, the final ranking, the awards, the best word nobody found.
import type { CSSProperties } from 'react';
import { Avatar, L, Screen, type Me } from '@partybox/game-sdk/ui';
import type { ControllerView } from '../types';
import { WordTiles } from '../WordTiles';
import { remPx } from '../CardList';
import { ordinal } from './Tally';
import s from './phone.module.css';

type Award = NonNullable<ControllerView['final']>['awards'][number];

const MEDAL = ['🏆', '🥈', '🥉'];

function Awards({ list, view, start }: { list: Award[]; view: ControllerView; start: number }) {
  return (
    <ul className={s.awards}>
      {list.map((a, i) => (
        <li key={a.id} style={{ '--i': start + i } as CSSProperties}>
          <span className={s.awardIcon} aria-hidden>{a.icon}</span>
          <b>{a.title}</b>
          <small>{[a.playerIds.map((id) => view.players.find((p) => p.id === id)?.name ?? '').join(', '), a.value].filter(Boolean).join(' · ')}</small>
        </li>
      ))}
    </ul>
  );
}

export function Final({ view, me, full }: { view: ControllerView; me: Me; full?: boolean }) {
  const rows = view.tally?.rows ?? [];
  const mine = rows.find((r) => r.id === me.id);
  const awards = view.final?.awards ?? [];
  if (!full) {
    const own = awards.filter((a) => a.playerIds.includes(me.id));
    return (
      <div className={s.finish}>
        <div className={s.medal} aria-hidden>{(mine && MEDAL[mine.place - 1]) ?? '🏁'}</div>
        <h1>{mine ? L('You finished {place} with {total}', { place: ordinal(mine.place), total: mine.after }) : L('Final scores on the TV')}</h1>
        {mine ? <p className={s.lead}>{L('The final scores are on the TV.')}</p> : null}
        {own.length ? <Awards list={own} view={view} start={1} /> : null}
      </div>
    );
  }
  const winners = rows.filter((r) => r.place === 1 && r.after > 0);
  const f = view.final;
  return (
    <Screen title={L('Final results')}>
      <div className={s.winner}>
        <span className={s.crowned}>
          {winners.flatMap((r) => {
            const p = view.players.find((x) => x.id === r.id);
            return p ? [<Avatar key={r.id} player={p} size={56} />] : [];
          })}
        </span>
        {f?.headline ? <p className={s.headline}>{f.headline}</p> : null}
      </div>
      <ol className={`${s.board} ${s.closing}`}>
        {rows.map((r, i) => {
          const p = view.players.find((x) => x.id === r.id);
          return p ? (
            <li key={r.id} className={r.id === me.id ? s.meRow : ''} style={{ '--i': i } as CSSProperties}>
              <span>{r.place}</span><Avatar player={p} size={remPx(2)} /><span>{p.name}</span><b>{r.after}</b>
            </li>
          ) : null;
        })}
      </ol>
      {awards.length ? <Awards list={awards} view={view} start={rows.length} /> : null}
      {f?.missed ? (
        <div className={s.spot}>
          <p className={s.kicker}>{L('The best word nobody found')}</p>
          <WordTiles word={f.missed.w} className={s.spotWord} />
        </div>
      ) : null}
    </Screen>
  );
}
