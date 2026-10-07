// Loaded by both phone and TV: strings, phase sound cues, music beds.
import { strings } from './strings';

export { strings };

/** Phase cue on the frame the phase appears. phase = "pick up your phone"; reveal/card/tally = "look at the TV". */
export const sounds = { shake: 'reveal', hunt: 'phase', reveal: 'card', tally: 'tally', done: 'silence' } as const;

/**
 * One bed for the whole round so music never restarts on a phase change:
 * a 96 bpm synth bed; a hi-hat layer joins for the last 30 s of the hunt,
 * and the bed ducks −9 dB under the reader during the reveal. Results are silent (shell).
 */
export const beds = {
  shake: { id: 'shake-up-round', bpm: 96, layers: ['pad', 'pluck'] },
  hunt: { id: 'shake-up-round', bpm: 96, layers: ['pad', 'pluck', 'bass'], lastCallLayer: 'hats' },
  reveal: { id: 'shake-up-round', bpm: 96, layers: ['pad'], duckDb: -9 },
  tally: { id: 'shake-up-round', bpm: 96, layers: ['pad', 'pluck'] },
} as const;
