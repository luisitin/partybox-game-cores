// reveal (phone, at the TV): "Watch the TV". The VIP also rules on
// non-dictionary words the TV has already shown, and moves to the next card
// from the sticky bar, so it never scrolls away.
import { Avatar, buzz, L, PrimaryButton, Screen, useSound, WaitingScreen, type Me } from '@partybox/game-sdk/ui';
import { faceSize, names } from '../CardList';
import type { ControllerView, Input } from '../types';
import s from './phone.module.css';

/** The VIP's "next" button, for the Screen's sticky footer. */
export function NextCard({ view, skip }: { view: ControllerView; skip: () => void }) {
  const r = view.reveal;
  return <PrimaryButton onClick={skip}><span className={s.nowrap}>{r && r.step + 1 < r.total ? L('Next card ▶') : L('To the tally ▶')}</span></PrimaryButton>;
}

/** Which card the room is on, in the VIP's words. */
function upNow(view: ControllerView, meId: string): string {
  const b = view.reveal?.beat;
  if (!b) return L('Watch the TV');
  if (b.kind === 'missed') return L('Up now: the best word nobody found');
  if (b.kind === 'empty') return L('Up now: no words from {names}', { names: names(view.players, b.ids, meId) });
  if (b.id === meId) return L('Up now: your words');
  return L('Up now: {name}’s words', { name: view.players.find((p) => p.id === b.id)?.name ?? '' });
}

export function Rulings({ view, send }: { view: ControllerView; send: (i: Input) => void }) {
  const play = useSound();
  const r = view.reveal;
  if (!r || !r.rulable.length) return null;
  const rule = (word: string, counts: boolean) => {
    play('submit');
    buzz(15);
    send({ t: 'counts', word, counts });
  };
  const face = faceSize(true);
  return (
    <section className={s.rulingsBox} aria-label={L('Not in the dictionary')}>
      <h2 className={s.h2}>{L('Not in the dictionary')}</h2>
      <p className={s.lead}>{L('Rule on these before the tally. Everyone else is watching the TV.')}</p>
      <ul className={s.rulings}>
        {r.rulable.map(({ w, by }) => {
          const on = r.counted.includes(w);
          return (
            <li key={w} className={on ? s.ruledIn : ''}>
              <span className={s.ruleWord}>
                {by.flatMap((id) => {
                  const p = view.players.find((x) => x.id === id);
                  return p ? [<Avatar key={id} player={{ ...p, bot: false }} size={face} />] : [];
                })}
                <b>{w}</b>
              </span>
              {/* Counted: a solid chip that pops in (done, not greyed out), and a quiet Undo beside it. */}
              <span className={s.ruleBtns}>
                {on ? (
                  <>
                    <span className={s.counted}>{L('✓ Counted')}</span>
                    <button type="button" className={s.undo} onClick={() => rule(w, false)}>{L('Undo')}</button>
                  </>
                ) : (
                  <PrimaryButton variant="secondary" onClick={() => rule(w, true)}>{L('✓ That counts')}</PrimaryButton>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Reveal({ view, send, me, skip }: { view: ControllerView; send: (i: Input) => void; me: Me; skip?: () => void }) {
  const r = view.reveal;
  const beat = r?.beat;
  const mineNow = (beat?.kind === 'player' && beat.id === me.id) || (beat?.kind === 'empty' && beat.ids.includes(me.id));
  if (me.isVip) {
    return (
      <Screen title={upNow(view, me.id)} footer={skip ? <NextCard view={view} skip={skip} /> : undefined}>
        {r?.rulable.length ? null : <p className={s.lead}>{L('Everyone is watching the TV. Words that aren’t in the dictionary show up here for you to rule on.')}</p>}
        <Rulings view={view} send={send} />
      </Screen>
    );
  }
  return <WaitingScreen icon="👀" title={L('Watch the TV')} body={mineNow ? L('Your words are up right now.') : L('Words are being read out. Shared ones get crossed off.')} />;
}
