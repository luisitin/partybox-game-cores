// tally (TV): the round's longest unique word in the spotlight, then the board climbs.
import type { CSSProperties } from 'react';
import { Avatar, BigText, L, Scoreboard } from '@partybox/game-sdk/ui';
import { useMotionTokens } from '@partybox/game-sdk/ui/table3d';
import { names } from '../CardList';
import type { TvView } from '../types';
import { faces, WordTiles } from '../WordTiles';
import { panEnterMs } from './pace';
import s from './tv.module.css';

export function TallyStage({ view }: { view: TvView }) {
  const enter = panEnterMs(useMotionTokens());
  const t = view.tally;
  if (!t) return null;
  const sp = t.spotlight;
  const who = sp ? view.players.find((p) => p.id === sp.id) : undefined;
  const tied = sp ? (sp.tied ?? []).flatMap((id) => view.players.filter((p) => p.id === id)) : [];
  const rows = t.rows.flatMap((r) => {
    const p = view.players.find((x) => x.id === r.id);
    return p ? [{ player: p, score: r.after, delta: r.gained, place: r.place }] : [];
  });
  return (
    <div className={s.tally}>
      {/* --su-n: tile count, so the stat line waits for the last tile to land. */}
      <div className={s.spot} style={{ '--su-n': sp ? faces(sp.w).length : 0 } as CSSProperties}>
        {sp && who ? (
          <>
            <p className={s.kicker}>
              {[who, ...tied].map((p) => <Avatar key={p.id} player={p} size={56} />)}
              <span>{L('Longest unique word')}</span>
            </p>
            <WordTiles word={sp.w} className={s.spotWord} />
            {/* The credit lands after the word: who found it, then what it was worth. */}
            <p className={`${s.sub} ${s.afterTiles}`}>
              <b className={s.who}>{who.name}</b> · {L('{n} letters · +{pts}', { n: sp.len, pts: sp.pts })}
              {tied.length ? <> · {L('tied with {names}', { names: names(view.players, tied.map((p) => p.id)) })}</> : null}
            </p>
          </>
        ) : (
          <BigText size="h2">{L('No unique words this round')}</BigText>
        )}
      </div>
      <div className={s.board}>
        {/* The strip already says "Round n of N"; this heading says what the board is. */}
        <h2 className={s.h2}>{L('Scores after round {n}', { n: view.round })}</h2>
        <Scoreboard rows={rows} climb delay={enter} />
      </div>
    </div>
  );
}
