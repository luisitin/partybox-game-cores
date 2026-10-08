/** Test/offline-preview bindings only. No production PartyBox SDK is included in this repo.
 * Types and RNG are the actual root contract; the small clock/dispatch bindings implement its
 * documented event ordering. The owner server keeps its @partybox/game-sdk import boundary.
 */
import type { GameEvent, GameStateBase, GameDefinition, InitContext, GameManifest, GameResults, GameAward, SpeechRequest } from '../../../../contract/contract';
import type { RngState } from '../../../../contract/rng';
export type { GameEvent, GameDefinition, SpeechRequest };
export type { Settings } from '../../../../contract/contract';
export type { BotSkill, PresenceMode } from '../../../../contract/constants';
export { seedRng, nextFloat } from '../../../../contract/rng';
import { nextInt as integer, shuffle as mix } from '../../../../contract/rng';
export const nextInt = (rng: RngState, exclusive: number) => integer(rng, 0, exclusive - 1);
export const shuffle = <T>(items: readonly T[], rng: RngState) => mix(rng, items);
export type Rng = import('../../../../contract/rng').Rng;
export type { RngState } from '../../../../contract/rng';
export type InitCtx = InitContext;
export type Manifest = GameManifest;
export type BaseState = GameStateBase;
export type PhaseState<P extends string> = GameStateBase['phase'] & { id: P; step?: number };
export type RankRow = GameResults['ranking'][number] & { place: number };
export type Award = GameAward & { icon: string; playerIds: string[]; value: string };
export type Results = Omit<GameResults, 'ranking' | 'awards'> & { ranking: RankRow[]; awards: Award[] };
export type Bot<V, I> = { sampleInput(view: V, ctx: { playerId: string; rng: Rng; skill: import('../../../../contract/constants').BotSkill }): I | null };
export const hasPlayer = (players: object, id: string): boolean => Object.hasOwn(players, id);
export function numberSetting(s: import('../../../../contract/contract').Settings, key: string, fallback: number, min: number, max: number): number {
  const raw = s[key]; return typeof raw === 'number' && Number.isFinite(raw) ? Math.max(min, Math.min(max, Math.round(raw))) + 0 : fallback;
}
export const boolSetting = (s: import('../../../../contract/contract').Settings, key: string, fallback: boolean): boolean => typeof s[key] === 'boolean' ? s[key] as boolean : fallback;
export function selectSetting<T extends string>(s: import('../../../../contract/contract').Settings, key: string, options: readonly T[], fallback: T): T {
  return options.includes(s[key] as T) ? s[key] as T : fallback;
}
// Shared test binding, not a per-game copy: exact documented contract reading formula.
export const readingMs = (words: number, o: { lang?: string; ui?: boolean; largeText?: boolean } = {}): number =>
  Math.ceil((1500 + 333 * words) * (o.ui ? 1.3 : 1) * (o.lang === 'es' ? 1.1 : 1) * (o.largeText ? 1.2 : 1));
export function isTimerFor<I>(s: GameStateBase, e: GameEvent<I>): boolean {
  return e.type === 'timer' && !s.phase.paused && s.phase.deadline !== null && e.phaseId === s.phase.id && e.startedAt === s.phase.startedAt && e.now >= s.phase.deadline;
}
export function nextStep<S extends GameStateBase>(s: S, deadline: number, change: (s: S) => S): S {
  const next = change(s);
  return { ...next, phase: { ...next.phase, deadline } };
}
type Vip<I> = Extract<GameEvent<I>, { type: 'vip' }>;
export function composeReduce<S extends GameStateBase, I>(o: {
  phases: Record<string, (s: S, e: GameEvent<I>, next: (s: S) => S) => S>;
  advance(s: S, now: number): S; end(s: S, now: number): S;
  onPlayer(s: S, e: Extract<GameEvent<I>, { type: 'player' }>, next: (s: S) => S): S;
  afterVip(s: S, e: Vip<I>, previous: S): S;
}): (s: S, e: GameEvent<I>) => S {
  return (s, e) => {
    if (!Number.isFinite(e.now) || e.now < s.phase.startedAt) return s;
    const next = (x: S) => o.advance(x, e.now);
    if (e.type === 'player') return o.onPlayer(s, e, next);
    if (e.type === 'speech' || e.type === 'speechStart') return s;
    if (e.type === 'vip') {
      if (s.phase.id === 'done') return s;
      if (e.action === 'end') return o.end(s, e.now);
      if (e.action === 'pause') return s.phase.paused || s.phase.deadline === null ? s : { ...s, phase: { ...s.phase, paused: { at: e.now } } };
      if (e.action === 'resume') {
        if (!s.phase.paused) return s;
        const { paused, ...phase } = s.phase;
        const shifted = { ...s, phase: { ...phase, deadline: phase.deadline === null ? null : phase.deadline + Math.max(0, e.now - paused.at) } };
        return o.afterVip(shifted, e, s);
      }
      if (e.action !== 'skip') return s;
      // A phase's reveal skip advances one beat, rather than leaving the phase.
      return o.phases[s.phase.id]?.(s, e, next) ?? s;
    }
    if (s.phase.paused) return s;
    return o.phases[s.phase.id]?.(s, e, next) ?? s;
  };
}
