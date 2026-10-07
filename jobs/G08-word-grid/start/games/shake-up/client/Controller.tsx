// Phone view. Dumb: renders what the server hands it. Each phase crossfades
// into the next (old recedes, new rises), so the phone never hard-cuts.
import { CrossfadeSwap, L, WaitingScreen, type Me } from '@partybox/game-sdk/ui';
import { Final } from './phone/Final';
import { Hunt } from './phone/Hunt';
import { Reveal } from './phone/Reveal';
import { Tally } from './phone/Tally';
import type { ControllerView, Input } from './types';
import s from './phone/phone.module.css';

export type ControllerProps = { view: ControllerView; send: (i: Input) => void; me: Me; skip?: () => void };

function Page({ view, send, me, skip }: ControllerProps) {
  switch (view.phase) {
    case 'shake':
      // The grid arrives with the hunt clock (the TV's last ripple), so the copy promises exactly that.
      return <WaitingScreen icon="👀" title={L('Watch the TV')} body={L('The cubes are landing. Your grid appears here when the clock starts.')} />;
    case 'hunt':
      return <Hunt view={view} send={send} />;
    case 'reveal':
      return <Reveal view={view} send={send} me={me} skip={skip} />;
    case 'tally':
      return <Tally view={view} />;
    default:
      return <Final view={view} me={me} />;
  }
}

export function Controller(p: ControllerProps) {
  return (
    <div className={s.fill}>
      <CrossfadeSwap swapKey={`${p.view.round}-${p.view.phase}`}>
        <Page {...p} />
      </CrossfadeSwap>
    </div>
  );
}
