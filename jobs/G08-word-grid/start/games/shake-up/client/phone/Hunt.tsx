// hunt (phone): the whole game surface. Grid, the word being traced, your
// list, and one contextual action in the sticky bar. Nothing above the grid
// ever changes height, so the grid never moves: "done" and "paused" sit over
// it, and your list scrolls in the room left below it.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { buzz, L, PrimaryButton, Screen, useMotion, useServerNow, useSound } from '@partybox/game-sdk/ui';
import { useGlide } from '../CardList';
import type { ControllerView, Input } from '../types';
import { clock, letterLen, points, spell } from '../trace';
import { TraceGrid } from './TraceGrid';
import s from './phone.module.css';
import ws from '../words.module.css';

type Note = { tone: 'ok' | 'bad' | 'info'; text: string; key: number };

// Only the clock needs a periodic render. Rebuilding every cube/chip at CPU4x
// on each timer tick delayed input frames, especially with a long private list.
function HuntClock({ deadline, paused }: { deadline: number | null; paused: boolean }) {
  const now = useServerNow(250);
  const frozen = useRef(0);
  const left = paused ? frozen.current : Math.max(0, (deadline ?? now) - now);
  if (!paused) frozen.current = left;
  const danger = left <= 5000 && !paused;
  return <span className={`${s.clock} ${danger ? s.danger : ''}`}>{danger ? '⏰' : '⏱'} {clock(left)}</span>;
}

export function Hunt({ view, send }: { view: ControllerView; send: (i: Input) => void }) {
  const [path, setPath] = useState<number[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [broken, setBroken] = useState(false);
  const [hold, setHold] = useState(false);
  const play = useSound();
  const motion = useMotion();
  const list = useRef<HTMLUListElement>(null);
  // Newest first: when a word lands, the chips already there glide aside instead of jumping.
  useGlide(list, view.me.words.map((w) => w.w).join(' '), motion, false);
  const word = spell(view.grid, path);
  const len = letterLen(word);
  const have = new Set(view.me.words.map((w) => w.w));

  // Server verdicts (dictionary, family filter) arrive in the view.
  const seen = useRef(view.me.verdict?.seq ?? 0);
  useEffect(() => {
    const v = view.me.verdict;
    if (!v || v.seq === seen.current) return;
    seen.current = v.seq;
    const pts = points(letterLen(v.w));
    if (v.kind === 'ok') {
      play('submit');
      buzz([12, 40, 12]);
      setNote({ tone: 'ok', text: L('✓ {word} +{pts}', { word: v.w, pts }), key: v.seq });
    } else if (v.kind === 'unknown') {
      play('submit');
      buzz(20);
      setNote({ tone: 'info', text: L('❓ {word}: the VIP decides', { word: v.w }), key: v.seq });
    } else {
      play('error');
      buzz(120);
      const text = v.kind === 'blocked' ? L('🚫 {word} isn’t allowed in family mode.', { word: v.w }) : L('Your list is full for this round.');
      setNote({ tone: 'bad', text, key: v.seq });
    }
  }, [view.me.verdict, play]);

  const reject = (text: string) => {
    play('error');
    buzz(120);
    setBroken(true); // cleared when the shake animation ends
    setNote({ tone: 'bad', text, key: Date.now() });
  };
  const submit = (p: number[]) => {
    const w = spell(view.grid, p);
    setPath([]);
    if (letterLen(w) < view.minLen) return reject(L('Words need {n}+ letters.', { n: view.minLen }));
    if (have.has(w)) return reject(L('You already have {word}.', { word: w }));
    send({ t: 'word', path: p });
  };

  const done = view.me.done;
  // A drag submits on lift, so its bar stays put; only a path built by taps asks for Submit.
  const bar = done ? (
    <div key="done" className={s.bar}><PrimaryButton variant="secondary" onClick={() => send({ t: 'done', done: false })}>{L('↩ Keep hunting')}</PrimaryButton></div>
  ) : path.length > 0 && !hold ? (
    <div key="tap" className={s.bar}>
      <PrimaryButton variant="quiet" ariaLabel={L('Clear')} onClick={() => setPath([])}>✕</PrimaryButton>
      <PrimaryButton disabled={len < view.minLen} onClick={() => submit(path)}><span className={s.nowrap}>{L('✓ Submit')}</span></PrimaryButton>
    </div>
  ) : (
    <div key="hunt" className={s.bar}><PrimaryButton variant="secondary" onClick={() => { play('lock'); send({ t: 'done', done: true }); }}><span className={s.nowrap}>{L('I’m done ✓')}</span></PrimaryButton></div>
  );

  return (
    <Screen footer={bar}>
      <div className={s.hunt}>
        <div className={s.status} aria-live="polite">
          <HuntClock deadline={view.deadline} paused={view.paused} />
          <span className={s.count}>{view.me.words.length === 1 ? L('1 word') : L('{n} words', { n: view.me.words.length })}</span>
        </div>
        <div className={s.stage} style={{ '--su-n': view.size } as CSSProperties} onAnimationEnd={() => setBroken(false)}>
          <TraceGrid letters={view.grid} size={view.size} path={path} setPath={setPath} onDragEnd={submit} onHold={setHold} disabled={done || view.paused} broken={broken} />
          {/* Over the dimmed grid, never above it: the letters you were reading stay where they are. */}
          <div className={`${s.over} ${done && !view.paused ? s.shown : ''}`} aria-hidden={!done}>
            <div className={s.doneCard}>
              <strong>{L('✓ You’re done')}</strong>
              <span>{view.waitingOn ? L('Waiting for {n} others, or the clock.', { n: view.waitingOn }) : L('Waiting for the clock.')}</span>
            </div>
          </div>
          <div className={`${s.over} ${view.paused ? s.shown : ''}`} aria-hidden={!view.paused}><div className={s.pausedTag}>⏸ {L('Paused')}</div></div>
        </div>
        <div className={s.current} aria-live="polite">
          {path.length ? (
            <>
              <b className={s.word}>{word}</b>
              <span className={s.meta}>{len < view.minLen ? L('{n}+ letters', { n: view.minLen }) : L('{n} letters · +{pts}', { n: len, pts: points(len) })}</span>
            </>
          ) : note ? (
            <span key={note.key} className={`${s.note} ${s[note.tone]}`}>{note.text}</span>
          ) : (
            <span className={s.hint}>{L('Drag through touching letters, then lift.')}</span>
          )}
        </div>
        <ul ref={list} className={ws.mine} aria-label={L('Your words')}>
          {view.me.words.map((w) => (
            <li key={w.w} data-flip={w.w} className={w.ok ? '' : ws.unsure}>{w.ok ? w.w : `❓ ${w.w}`}</li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
