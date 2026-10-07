// TV chunk. Stage moves: one persistent 3D tray from shake to reveal, the
// shell's camera pan into the tally, the shell's results curtain after.
export { Tv } from './Tv';
export const keepMounted = ['shake', 'hunt', 'reveal'] as const;
/** The hunt panel draws its own 128 px clock; other deadlines are pacing, not a race. */
export const quietTimer = ['shake', 'hunt', 'reveal', 'tally'] as const;
/** Strip chips mark who tapped "I'm done" during the hunt. */
export const ownLocks = ['hunt'] as const;
