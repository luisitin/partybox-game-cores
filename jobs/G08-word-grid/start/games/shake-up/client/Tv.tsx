// TV view. One persistent stage for shake → hunt → reveal (keepMounted): the
// tray on the left never cuts, the right panel crossfades. tally pans away.
import { useRef } from 'react';
import { BigText, CrossfadeSwap, L, useMotion, useReading, useServerNow } from '@partybox/game-sdk/ui';
import { LetterGrid } from './LetterGrid';
import { HuntPanel } from './tv/HuntPanel';
import { huntCaption } from './tv/pace';
import { RevealPanel } from './tv/RevealPanel';
import { TallyStage } from './tv/TallyStage';
import { Tray3d } from './tv/Tray3d';
import type { TvView } from './types';
import s from './tv/tv.module.css';

function glowPath(view: TvView): number[] {
  const b = view.reveal?.beat;
  return b && (b.kind === 'player' || b.kind === 'missed') ? b.glow : [];
}

/** The reader's line as text, in a fixed slot at the foot of the column; each new line crossfades in. */
function Caption({ view }: { view: TvView }) {
  const now = useServerNow(250);
  const left = Math.max(0, (view.deadline ?? now) - now);
  const seen = useRef({ key: '', left });
  if (view.say && seen.current.key !== view.say.key) seen.current = { key: view.say.key, left };
  const line = view.phase === 'hunt' ? huntCaption(view, left, seen.current.left - left) : view.say;
  return (
    <div className={s.captionSlot}>
      <CrossfadeSwap swapKey={line?.key ?? 'quiet'}>{line ? <p className={s.caption}>🎙️ {line.text}</p> : null}</CrossfadeSwap>
    </div>
  );
}

export function Tv({ view }: { view: TvView }) {
  const motion = useMotion();
  useReading(view.say);
  if (view.phase === 'tally' || view.phase === 'done') {
    return (
      <div className={`${s.stage} ${s.column}`}>
        <TallyStage view={view} />
        <Caption view={view} />
      </div>
    );
  }
  const glow = glowPath(view);
  const flat = (
    <LetterGrid
      letters={view.grid}
      size={view.size}
      path={glow}
      dimOff={glow.length > 0}
      glow={glow.length > 0}
      numbers={glow.length > 0}
      className={s.flat}
      label={L('This round’s letter grid')}
    />
  );
  return (
    <div className={s.stage}>
      <div className={s.trayCol}>
        {motion ? (
          <Tray3d letters={view.grid} cubes={view.cubes} size={view.size} round={view.round} throwSeed={view.throwSeed} roll={view.roll} paused={view.paused} glow={glow} fallback={flat} />
        ) : (
          flat
        )}
      </div>
      <div className={s.side}>
        <CrossfadeSwap swapKey={view.phase}>
          {view.phase === 'shake' ? (
            <div className={`${s.panel} ${s.middle}`}>
              <p className={s.kicker}>{L('Round {n} of {total}', { n: view.round, total: view.rounds })}</p>
              <BigText>{L('Shake it up!')}</BigText>
              <p className={s.sub}>
                {L('{cubes} cubes · {min}+ letters · words only you find score', { cubes: view.size * view.size, min: view.minLen })}
              </p>
            </div>
          ) : view.phase === 'hunt' ? (
            <HuntPanel view={view} />
          ) : (
            <RevealPanel view={view} />
          )}
        </CrossfadeSwap>
        <Caption view={view} />
      </div>
    </div>
  );
}
