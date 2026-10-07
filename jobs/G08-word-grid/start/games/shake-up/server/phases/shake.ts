// shake: the cubes are thrown. The landing layout comes from state.rng
// before the throw; the TV's physics only animates it.
import { isTimerFor, nextInt, shuffle, type GameEvent } from '@partybox/game-sdk';
import { cubeFaces } from '../content';
import { SHAKE_MS, type Input, type State } from '../types';

export function enterShake(state: State, now: number): State {
  const [order, r1] = shuffle(cubeFaces(state.cfg.lang, state.cfg.size), state.rng);
  let rng = r1;
  const grid: string[] = [];
  const cubes: string[][] = [];
  for (const faces of order) {
    const [k, r2] = nextInt(rng, faces.length);
    rng = r2;
    grid.push(faces[k] as string);
    cubes.push([...faces.slice(k), ...faces.slice(0, k)]);
  }
  const [throwSeed, r3] = nextInt(rng, 2 ** 31);
  const words: State['words'] = {};
  for (const id of state.order) words[id] = [];
  const { toast: _toast, ...rest } = state;
  return {
    ...rest,
    rng: r3,
    round: state.round + 1,
    grid,
    cubes,
    throwSeed,
    words,
    done: {},
    verdicts: {},
    counted: [],
    beats: [],
    missed: null,
    pausedMs: 0,
    phase: { id: 'shake', startedAt: now, deadline: now + SHAKE_MS },
  };
}

export function reduceShake(state: State, ev: GameEvent<Input>, next: (s: State) => State): State {
  if (isTimerFor(state, ev)) return next(state);
  if (ev.type === 'vip' && ev.action === 'skip') return next(state);
  return state;
}
