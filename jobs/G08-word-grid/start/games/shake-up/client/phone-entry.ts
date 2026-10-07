// Phone chunk (loads when the VIP picks the game). Never imports a TV file.
export { Controller } from './Controller';
export { PhoneStage } from './phone/Stage';
/** Phones that cannot see the TV get the stage as text in these phases (done: the whole result, as on the TV). */
export const phoneStagePhases = ['shake', 'reveal', 'tally', 'done'] as const;
/**
 * The shell's crossfade key for a phone's screen (it swaps Controller and PhoneStage in a CrossfadeSwap
 * keyed by this). A stage phone's shake and hunt share one key: PhoneStage's shake and the Controller's hunt
 * lay the grid out in the same place, so that hand-off swaps in place and the letters never move.
 */
export function phoneRoute(phase: string, canSeeTv: boolean): 'grid' | 'stage' | 'controller' {
  if (canSeeTv) return 'controller';
  if (phase === 'shake' || phase === 'hunt') return 'grid';
  return (phoneStagePhases as readonly string[]).includes(phase) ? 'stage' : 'controller';
}
