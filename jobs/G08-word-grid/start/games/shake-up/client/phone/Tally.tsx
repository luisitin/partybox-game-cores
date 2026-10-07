// tally (phone): your round, shown after the TV's board has climbed.
import { L, Screen } from '@partybox/game-sdk/ui';
import type { ControllerView } from '../types';
import s from './phone.module.css';

export function ordinal(n: number): string {
  return n === 1 ? L('1st') : n === 2 ? L('2nd') : n === 3 ? L('3rd') : L('{n}th', { n });
}

export function Tally({ view }: { view: ControllerView }) {
  const m = view.tally?.mine;
  if (!m) return <Screen title={L('Round {n}', { n: view.round })}><p className={s.lead}>{L('Scores are climbing on the TV.')}</p></Screen>;
  const last = view.round >= view.rounds;
  return (
    <Screen title={L('Round {n}: +{pts}', { n: view.round, pts: m.gained })}>
      <div className={s.afterClimb}>
        <p className={s.lead}>{L('You’re {place} with {total}.', { place: ordinal(m.place), total: m.total })}</p>
        <ul className={s.summary}>
          <li><span aria-hidden>✓</span> {L('Unique words')} <b>{m.unique}</b></li>
          <li><span aria-hidden>✕</span> {L('Shared words')} <b>{m.shared}</b></li>
          {m.best ? <li><span aria-hidden>⭐</span> {L('Best')} <b>{m.best}</b></li> : null}
        </ul>
        {m.shared > m.unique ? <p className={s.tip}>💡 {L('Tip: long words are rarely shared. Try endings like -ED, -ER and -ING.')}</p> : null}
        <p className={s.next}>{last ? L('Final results next') : L('Round {n} shakes next', { n: view.round + 1 })}</p>
      </div>
    </Screen>
  );
}
