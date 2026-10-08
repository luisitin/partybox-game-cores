// Offline host adapter. All letters, validation, scoring, bots and views come from the owner's game.
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createRng, hashString } from '../../../../contract/rng';
import { game } from '../games/shake-up/server';
import type { Input, State } from '../games/shake-up/server/types';
import { Controller } from '../games/shake-up/client/Controller';
import { PhoneStage } from '../games/shake-up/client/phone/Stage';
import { Tv } from '../games/shake-up/client/Tv';
import { strings } from '../games/shake-up/client/strings';
import { ShellProvider, setLocale } from '../test-support/ui';
import './shell.css';

type Skill = 'human' | 'easy' | 'normal' | 'sharp';
type Seat = { name: string; skill: Skill };
type Session = {
  state: State; seats: Seat[]; humans: string[]; turn: number; handoff: boolean;
  elapsed: number; now: number; lastWall: number; botSecond: number; pauseWall: number;
};
const freshSeed = () => String(crypto.getRandomValues(new Uint32Array(1))[0]);

function App() {
  const [seats, setSeats] = useState<Seat[]>([{ name: 'Ana', skill: 'human' }, { name: 'Ben', skill: 'human' }]);
  const [count, setCount] = useState(2), [lang, setLang] = useState('en'), [grid, setGrid] = useState('4x4');
  const [dictionary, setDictionary] = useState('full'), [rounds, setRounds] = useState('3'), [seconds, setSeconds] = useState('180');
  const [seed, setSeed] = useState(freshSeed), [publicStage, setPublicStage] = useState(false);
  const session = useRef<Session | null>(null), [, render] = useState(0);
  const [motion, setMotion] = useState(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const heading = useRef<HTMLHeadingElement>(null), ready = useRef<HTMLButtonElement>(null);
  const update = () => render(n => n + 1);
  const shell = useRef({ now: () => session.current?.now ?? 1000, play: (_s: string) => {}, say: (_s: unknown) => {}, motion });
  shell.current.motion = motion;

  const commit = (next: State) => {
    const r = session.current!; const was = r.state;
    r.state = next; r.now = next.phase.id === was.phase.id ? r.now : next.phase.startedAt;
    if (next.phase.id === 'hunt' && was.phase.id !== 'hunt') {
      r.turn = 0; r.elapsed = 0; r.botSecond = -1; r.handoff = r.humans.length > 0; setPublicStage(false);
    } else if (next.phase.id !== 'hunt') r.handoff = false;
    if (next.phase.id === 'done' && was.phase.id !== 'done') requestAnimationFrame(() => heading.current?.focus());
    update();
  };
  const finishTurn = () => {
    const r = session.current!; const id = r.humans[r.turn];
    if (!id || r.state.phase.id !== 'hunt') return;
    commit(game.reduce(r.state, { type: 'input', playerId: id, now: r.now, input: { t: 'done', done: true } }));
    if (r.state.phase.id === 'hunt' && r.turn + 1 < r.humans.length) {
      r.turn++; r.elapsed = 0; r.now = r.state.phase.startedAt + r.state.pausedMs; r.handoff = true; setPublicStage(false); update();
    }
  };
  const send = (input: Input) => {
    const r = session.current!;
    if (r.handoff || r.state.phase.paused) return;
    if (r.state.phase.id === 'hunt' && input.t === 'done' && input.done) return finishTurn();
    const playerId = r.state.phase.id === 'hunt' ? r.humans[r.turn]! : r.state.order[0]!;
    commit(game.reduce(r.state, { type: 'input', playerId, now: r.now, input, vip: true }));
  };
  const skip = () => {
    const r = session.current!;
    if (r.state.phase.id === 'hunt' && r.humans.length) return finishTurn();
    commit(game.reduce(r.state, { type: 'vip', action: 'skip', now: r.now }));
  };
  const pause = () => {
    const r = session.current!;
    if (r.state.phase.paused) {
      const held = Math.max(0, performance.now() - r.pauseWall);
      r.now = r.state.phase.paused.at + held;
      commit(game.reduce(r.state, { type: 'vip', action: 'resume', now: r.now }));
      r.lastWall = performance.now();
    } else {
      r.pauseWall = performance.now();
      commit(game.reduce(r.state, { type: 'vip', action: 'pause', now: r.now }));
    }
  };
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setMotion(!media.matches); media.addEventListener('change', changed);
    const timer = setInterval(() => {
      const r = session.current; if (!r) return;
      const previousState = r.state;
      const wall = performance.now(), dt = Math.max(0, wall - r.lastWall); r.lastWall = wall;
      if (r.handoff || r.state.phase.paused || r.state.phase.id === 'done') return;
      if (r.state.phase.id === 'hunt') {
        r.elapsed = Math.min(r.state.cfg.huntMs, r.elapsed + dt);
        r.now = r.state.phase.startedAt + r.state.pausedMs + r.elapsed;
        const second = Math.floor(r.elapsed / 1000);
        if (r.turn === 0 && second !== r.botSecond) {
          r.botSecond = second;
          for (const [i, seat] of r.seats.entries()) {
            if (seat.skill === 'human') continue;
            const id = r.state.order[i]!;
            const input = game.bot.sampleInput(r.state, id, createRng(hashString(`${seed}:${r.state.round}:${second}:${id}`)), seat.skill);
            if (input) r.state = game.reduce(r.state, { type: 'input', playerId: id, now: r.now, input });
          }
        }
        if (r.elapsed >= r.state.cfg.huntMs && r.humans.length) { finishTurn(); return; }
      } else r.now += dt;
      if (r.state.phase.deadline !== null && r.now >= r.state.phase.deadline) {
        commit(game.reduce(r.state, { type: 'timer', now: r.state.phase.deadline, phaseId: r.state.phase.id, startedAt: r.state.phase.startedAt }));
      } else if (r.state !== previousState) update();
    }, 100);
    return () => { clearInterval(timer); media.removeEventListener('change', changed); };
  }, [seed]);

  const start = (e: React.FormEvent) => {
    e.preventDefault(); const roster = seats.slice(0, count).map((s, i) => ({ ...s, name: s.name.trim() || `Player ${i + 1}` }));
    setLocale(lang, strings); document.documentElement.lang = lang;
    const state = game.init({ players: roster.map((s, i) => ({ id: `p${i + 1}`, name: s.name, avatarId: `face-${i}`, connected: true, bot: s.skill !== 'human' })), settings: { grid, dictionary, rounds: Number(rounds), huntSeconds: seconds, reader: 'none' }, contentLang: lang === 'es' ? 'es' : 'en', seed: Number(seed) >>> 0, now: 1000, presence: { mode: 'remote-text', phoneOnly: true } });
    session.current = { state, seats: roster, humans: state.order.filter(id => !state.players[id]!.bot), turn: 0, handoff: false, elapsed: 0, now: 1000, lastWall: performance.now(), botSecond: -1, pauseWall: 0 };
    setPublicStage(false); update();
  };
  const reset = () => {
    const running = session.current;
    if (running && running.state.phase.id !== 'done') {
      const discard = window.confirm('End this game and return to setup? Current scores will be lost.');
      // Native confirmation blocks callbacks. Cancellation preserves the private clock too.
      running.lastWall = performance.now();
      if (!discard) return;
    }
    session.current = null;
    const candidate = freshSeed();
    setSeed(candidate === seed ? String((Number(seed) + 1) >>> 0) : candidate);
    setPublicStage(false); update();
    requestAnimationFrame(() => heading.current?.focus());
  };
  const resize = (n: number) => {
    setCount(n); setSeats(previous => Array.from({ length: n }, (_, i) => previous[i] ?? { name: `Player ${i + 1}`, skill: 'human' }));
  };
  const r = session.current;
  useEffect(() => {
    if (r?.state.phase.id !== 'hunt') return;
    if (r.handoff) ready.current?.focus();
    else document.querySelector<HTMLElement>('.phone-owner [role="gridcell"][tabindex="0"]')?.focus();
  }, [r?.state.phase.id, r?.state.round, r?.handoff, r?.turn]);
  if (!r) return <main className="setup"><h1 ref={heading} tabIndex={-1}>Shake Up</h1><p>Trace touching cubes. Shared words cancel. Each person gets the same private clock; pass the device between turns.</p>
    <form onSubmit={start}><div className="options">
      <label>Players<select aria-label="Players" value={count} onChange={e => resize(Number(e.target.value))}>{Array.from({ length: 16 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label>
      <label>Words<select aria-label="Words" value={lang} onChange={e => setLang(e.target.value)}><option value="en">English</option><option value="es">Español</option></select></label>
      <label>Grid<select aria-label="Grid" value={grid} onChange={e => setGrid(e.target.value)}><option>4x4</option><option>5x5</option></select></label>
      <label>Dictionary<select aria-label="Dictionary" value={lang === 'es' ? 'full' : dictionary} disabled={lang === 'es'} onChange={e => setDictionary(e.target.value)}><option value="full">Full word list</option><option value="common">Common words (SCOWL 70)</option></select></label>
      <label>Rounds<select aria-label="Rounds" value={rounds} onChange={e => setRounds(e.target.value)}>{[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Seconds per person<select aria-label="Seconds per person" value={seconds} onChange={e => setSeconds(e.target.value)}>{[90, 120, 180, 240].map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Seed<input type="number" min="0" max="4294967295" value={seed} onChange={e => setSeed(e.target.value)} required /></label>
    </div><fieldset><legend>Who is playing?</legend>{seats.slice(0, count).map((s, i) => <div className="seat" key={i}><label>Name {i + 1}<input maxLength={80} value={s.name} onChange={e => setSeats(all => all.map((v, j) => j === i ? { ...v, name: e.target.value } : v))} /></label><label>Player {i + 1}<select aria-label={`Player ${i + 1}`} value={s.skill} onChange={e => setSeats(all => all.map((v, j) => j === i ? { ...v, skill: e.target.value as Skill } : v))}><option value="human">Person</option><option value="easy">Easy bot</option><option value="normal">Normal bot</option><option value="sharp">Sharp bot</option></select></label></div>)}</fieldset><button type="submit">Start Shake Up</button></form>
    <details><summary>How to play</summary><p>Drag across cubes and lift, or tap letters and press Submit. Keyboard: arrow keys move, Enter or Space adds a cube, Escape clears. Diagonals count; use each cube once. Qu is one cube and two letters. Minimum: 3 letters on 4×4, 4 on 5×5. Length 3–4 scores 1, 5 scores 2, 6 scores 3, 7 scores 5, 8+ scores 11. Words found by two or more players score zero. Unknown words may be accepted together at the reveal.</p><p>During private turns, everyone else looks away. Handoff hides the previous list. Bots play the same board during the first turn. Public stage shows counts during the hunt.</p></details>
    <details><summary>Credits and word-list licences</summary><div dangerouslySetInnerHTML={{ __html: '__INLINE_LICENSES__' }} /></details>
  </main>;
  const state = r.state, active = r.humans[r.turn] ?? state.order[0]!, isHunt = state.phase.id === 'hunt';
  const me = { id: active, name: state.players[active]!.name, isVip: true, canSeeTv: false };
  return <ShellProvider value={shell.current}><main className={publicStage ? 'room television' : 'room'} data-phase={state.phase.id} data-round={state.round} data-turn={r.turn}>
    <header className="host"><h1 ref={heading} tabIndex={-1}>Shake Up{state.phase.id === 'done' ? ' · Results' : ''}</h1><nav aria-label="Host controls">
      {state.phase.id !== 'done' ? <><button onClick={pause} disabled={r.handoff}>{state.phase.paused ? 'Resume' : 'Pause'}</button>{!r.handoff ? <button onClick={skip}>{isHunt ? 'Finish turn' : state.phase.id === 'reveal' ? 'Next card' : 'Continue'}</button> : null}<button aria-pressed={publicStage} disabled={r.handoff} onClick={() => setPublicStage(v => !v)}>Public stage</button></> : null}
      <button onClick={reset}>New game</button></nav></header>
    {r.handoff ? <section className="handoff" aria-label="Pass the device"><h2 id="handoff-name">Pass to {me.name}</h2><p id="handoff-clock">Everyone else looks away. Your {state.cfg.huntMs / 1000}-second clock starts when you’re ready.</p><button ref={ready} aria-describedby="handoff-name handoff-clock" onClick={() => { r.handoff = false; r.lastWall = performance.now(); update(); }}>I’m ready</button></section>
      : publicStage ? <div className="tv-owner"><Tv view={game.tvView(state)} /></div>
      : <div className="phone-owner" key={`${state.round}-${isHunt ? active : 'stage'}`}><p className="private-label">{isHunt ? `${me.name} · private turn` : `Round ${state.round} of ${state.cfg.rounds}`}</p>{isHunt ? <Controller view={game.controllerView(state, active)} send={send} me={me} skip={skip} /> : <PhoneStage view={game.controllerView(state, active)} send={send} me={me} skip={skip} />}</div>}
  </main></ShellProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
