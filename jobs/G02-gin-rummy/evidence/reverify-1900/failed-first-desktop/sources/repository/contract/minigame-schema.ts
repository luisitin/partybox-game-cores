// ADR-087: the manifest's `minigame` block and the context `init` gets (split from contract.ts for size).
import { z } from 'zod';

/**
 * ADR-087: a game that can run as a minigame inside a board game (Party World). `ffa` = everyone
 * for themselves, `2v2` / `1v3` = two teams (the board's colours decide), `duel` = two players.
 */
export const MINIGAME_MODES = ['ffa', '2v2', '1v3', 'duel'] as const;
export type MinigameMode = (typeof MINIGAME_MODES)[number];
/** ADR-087: the manifest's `minigame` block. */
export const minigameSpecSchema = z
  .object({
    /** The modes the game plays; `ffa` needs 2+ players, `duel` 2, `2v2` and `1v3` 4. */
    modes: z.array(z.enum(MINIGAME_MODES)).min(1).max(MINIGAME_MODES.length),
    /** What the play takes with `settings` below, in seconds (the contract test checks it, with slack). */
    seconds: z.number().int().min(20).max(90),
    /** Settings in minigame mode: the game's defaults, then these. The room's own settings never apply. */
    settings: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional(),
    /** The instruction screen's Controls list: 1-4 short lines, "Tap · Lock an answer". */
    controls: z.array(z.string().min(1).max(60)).min(1).max(4),
    /** Toad's two lines on the instruction screen. */
    howTo: z.tuple([z.string().min(1).max(90), z.string().min(1).max(90)]),
    /** The instruction screen runs a live demo ("Practice Time!"): the game must be fine with
     *  players tapping before the real start. Absent = a still how-to. */
    practice: z.boolean().optional(),
    /** `sum`: in `2v2` / `1v3` the game plays free-for-all (it knows no sides) and a side's score is
     *  its members' `results().scores` added (`1v3`: the lone player's against the other three's
     *  average); more points wins, equal is a draw. Absent: the game plays its own teams. */
    teamScore: z.literal('sum').optional(),
    /** `boss`: a Jamboree boss fight (T-0597). It stays out of the ordinary round and VS pools; a host asks
     *  for it by category (`minigameGames(…, 'boss')`). Absent: an ordinary minigame. */
    category: z.literal('boss').optional(),
  })
  .strict();
export type MinigameSpec = z.infer<typeof minigameSpecSchema>;
/** ADR-087: what `init` is told when the game runs as a minigame (`InitContext.minigame`). */
export interface MinigameContext {
  mode: MinigameMode;
  /** Member ids per team, the lone player first in `1v3`; `[]` in `ffa`; two singletons in `duel`.
   *  A team game ends with `winnerIds` inside one team (or `outcome: teams`); the wrapper reads it. */
  teams: string[][];
  /** The play length the wrapper expects (`manifest.minigame.seconds`). */
  seconds: number;
}
