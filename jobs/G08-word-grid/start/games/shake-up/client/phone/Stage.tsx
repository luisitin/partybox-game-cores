// PhoneStage: for phones that cannot see the TV (remote, or "I can't see the TV").
// Same public information as the TV, a beat behind the reader, in the TV's words.
// Each card or phase crossfades into the next (the TV's own CrossfadeSwap), never a cut.
import type { CSSProperties, ReactNode } from 'react';
import { Avatar, CrossfadeSwap, L, PrimaryButton, Screen, useReading, useServerNow, type Me } from '@partybox/game-sdk/ui';
import { CardList, names, remPx } from '../CardList';
import { LetterGrid } from '../LetterGrid';
import type { ControllerView, Input, PlayerRow } from '../types';
import { faces, WordTiles } from '../WordTiles';
import { Final } from './Final';
import { NextCard, Rulings } from './Reveal';
import s from './phone.module.css';

/**
 * The grid stays face down until 60% of the roll, then turns over in a diagonal wave that must end before
 * the hunt takes over (one fast step of slack): on 5×5 the steps between diagonals shorten to fit. The
 * wave passes its middle as the TV's cubes come to rest, so a player without the TV reads the letters when
 * the room does, not seconds before it.
 */
export const TURN_AT = 0.6;

/**
 * Laid out like the hunt (status row, grid, a two-line block, a sticky bar), so at the hand-off the grid
 * does not move or resize; the bar says the clock is coming and becomes the hunt's "I'm done".
 */
function Shake({ view, caption }: { view: ControllerView; caption: ReactNode }) {
  const now = useServerNow(100);
  const up = !view.roll || now >= view.roll.at + view.roll.ms * TURN_AT;
  const bar = <div className={s.bar}><PrimaryButton variant="secondary" disabled><span className={s.nowrap}>{L('⏳ Get ready…')}</span></PrimaryButton></div>;
  return (
    <Screen footer={bar}>
      <div className={s.hunt}>
        <div className={s.status}>
          <span>🎲 {L('Shake it up!')}</span>
          <span className={s.count}>{L('Round {n} of {total}', { n: view.round, total: view.rounds })}</span>
        </div>
        <div className={s.stage} style={{ '--su-n': view.size } as CSSProperties}>
          {/* Keyed by side: the turned-up cubes are new elements, so no rattle can outlive the turn. */}
          <LetterGrid
            key={up ? 'up' : 'down'}
            letters={view.grid}
            size={view.size}
            deal={up ? 'up' : 'down'}
            turnMs={view.roll ? view.roll.ms * (1 - TURN_AT) : undefined}
            label={up ? L('This round’s grid') : L('Cubes are landing…')}
          />
        </div>
        <p className={`${s.current} ${s.hint}`}>{L('{cubes} cubes · {min}+ letters · words only you find score', { cubes: view.size * view.size, min: view.minLen })}</p>
        {caption}
      </div>
    </Screen>
  );
}

function Faces({ players, ids }: { players: PlayerRow[]; ids: string[] }) {
  return (
    <div className={s.faces}>
      {ids.flatMap((id) => {
        const p = players.find((x) => x.id === id);
        return p ? [<Avatar key={id} player={p} size={40} />] : [];
      })}
    </div>
  );
}

/** A card's title with its total as its own badge, so "+337" never wraps away from the name. */
function Head({ title, total }: { title: string; total?: number }) {
  return (
    <header className={s.head}>
      <h1>{title}</h1>
      {/* Re-keyed by value: a VIP ruling that changes the total pops the badge again, so the change is seen. */}
      {total !== undefined ? <b key={total} className={`${s.badge} ${total > 0 ? '' : s.zero}`}>{total > 0 ? `+${total}` : '0'}</b> : null}
    </header>
  );
}

function Reveal({ view, me, send, skip, caption }: { view: ControllerView; me: Me; send: (i: Input) => void; skip?: () => void; caption: ReactNode }) {
  const r = view.reveal;
  if (!r) return null;
  const b = r.beat;
  const who = b.kind === 'player' ? view.players.find((p) => p.id === b.id) : undefined;
  const head =
    b.kind === 'player' ? <Head title={who?.id === me.id ? L('Your words') : L('{name}’s words', { name: who?.name ?? '' })} total={b.total} />
    : <Head title={b.kind === 'missed' ? L('The best word nobody found') : b.all ? L('No words this round') : L('No words from {names}', { names: names(view.players, b.ids, me.id) })} />;
  return (
    <Screen footer={me.isVip && skip ? <NextCard view={view} skip={skip} /> : undefined}>
      {head}
      {caption}
      {b.kind === 'player' ? <CardList beat={b} players={view.players} meId={me.id} compact /> : null}
      {b.kind === 'missed' ? (
        <div className={s.spot}>
          <WordTiles word={b.w} className={s.spotWord} />
          <p className={s.lead}>{L('{n} letters', { n: b.len })}</p>
          <LetterGrid letters={view.grid} size={view.size} path={b.glow} dimOff glow numbers={false} label={b.w} />
        </div>
      ) : null}
      {b.kind === 'empty' ? <Faces players={view.players} ids={b.ids} /> : null}
      {me.isVip ? <Rulings view={view} send={send} /> : null}
    </Screen>
  );
}

function Tally({ view, me, caption }: { view: ControllerView; me: Me; caption: ReactNode }) {
  const t = view.tally;
  if (!t) return null;
  const sp = t.spotlight;
  const spWho = sp ? view.players.find((p) => p.id === sp.id) : undefined;
  return (
    <Screen title={L('Scores after round {n}', { n: view.round })}>
      {caption}
      {sp && spWho ? (
        <div className={s.spot} style={{ '--su-n': faces(sp.w).length } as CSSProperties}>
          <p className={s.kicker}><Avatar player={spWho} size={28} /> {L('Longest unique word')}</p>
          <WordTiles word={sp.w} className={s.spotWord} />
          <p className={`${s.lead} ${s.afterTiles}`}>
            <b>{spWho.id === me.id ? L('you') : spWho.name}</b> · {L('{n} letters · +{pts}', { n: sp.len, pts: sp.pts })}
          </p>
        </div>
      ) : (
        <p className={s.lead}>{L('No unique words this round')}</p>
      )}
      <ol className={s.board}>
        {t.rows.map((r, i) => {
          const p = view.players.find((x) => x.id === r.id);
          return p ? (
            <li key={r.id} className={r.id === me.id ? s.meRow : ''} style={{ '--i': i } as CSSProperties}>
              <span>{r.place}</span><Avatar player={p} size={remPx(2)} /><span>{p.name}</span><b>{r.after}</b>
              <i>{r.gained ? `▲ +${r.gained}` : ''}</i>
            </li>
          ) : null;
        })}
      </ol>
    </Screen>
  );
}

export function PhoneStage({ view, me, send, skip }: { view: ControllerView; me: Me; send: (i: Input) => void; skip?: () => void }) {
  useReading(view.say);
  const caption = view.say ? <p className={s.caption}>🎙️ “{view.say.text}”</p> : null;
  const page =
    view.phase === 'shake' ? <Shake view={view} caption={caption} />
    : view.phase === 'reveal' ? <Reveal view={view} me={me} send={send} skip={skip} caption={caption} />
    : view.phase === 'tally' ? <Tally view={view} me={me} caption={caption} />
    : view.phase === 'done' ? <Final view={view} me={me} full />
    : null;
  // One page per phase and per reveal card; a VIP ruling updates its card in place (the chips glide).
  const key = `${view.round}-${view.phase}-${view.phase === 'reveal' ? view.reveal?.step ?? 0 : 0}`;
  // Mounting is a change of screen the shell owns: it crossfades the hunt (Controller) into the stage.
  return (
    <div className={s.fill}>
      <CrossfadeSwap swapKey={key}>{page}</CrossfadeSwap>
    </div>
  );
}
