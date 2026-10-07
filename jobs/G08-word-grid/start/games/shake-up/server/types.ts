import { z } from 'zod';
import type { BaseState, PhaseState, PresenceMode } from '@partybox/game-sdk';
import type { Lang } from './content';
import type { GridSize } from './rules';

export const PHASES = ['shake', 'hunt', 'reveal', 'tally', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const MAX_ENTRIES = 150; // words per player per round
export const MAX_UNKNOWN = 12; // non-dictionary words kept per player per round
export const SHAKE_MS = 4200;
export const LAST_CALL_MS = 30_000;

export const inputSchema = z.discriminatedUnion('t', [
  // 3..17 cell indices; the server derives the word from the grid. Free text never enters.
  z.object({ t: z.literal('word'), path: z.array(z.number().int().min(0).max(24)).min(1).max(25) }),
  z.object({ t: z.literal('done'), done: z.boolean() }),
  // VIP only (event.vip), reveal only: "✓ That counts" / "Leave it" for a non-dictionary word.
  z.object({ t: z.literal('counts'), word: z.string().min(1).max(25), counts: z.boolean() }),
]);
export type Input = z.infer<typeof inputSchema>;

export type Player = {
  id: string;
  name: string;
  bot: boolean;
  away: boolean;
  seat: number;
};

/** One word on a player's list. t = ms into the hunt (pauses excluded). ok = in the dictionary. */
export type Entry = { w: string; p: number[]; t: number; ok: boolean };

export type VerdictKind = 'ok' | 'unknown' | 'blocked' | 'full';
export type Verdict = { seq: number; w: string; kind: VerdictKind };

export type Found = { w: string; path: number[] };

export type Beat =
  | { kind: 'player'; id: string }
  | { kind: 'empty'; ids: string[] } // players with no words, one card
  | { kind: 'missed' }; // best word nobody found

export type RoundLog = {
  round: number;
  points: Record<string, number>;
  unique: Record<string, number>;
  shared: Record<string, number>;
  counted: Record<string, number>;
  best: Record<string, string>; // longest scoring word per player
  firstMs: Record<string, number>; // first valid word, ms into the hunt
  missed: string | null;
};

export type Config = {
  rounds: number;
  huntMs: number;
  size: GridSize;
  minLen: number;
  spicy: boolean;
  lang: Lang;
  reader: string;
  mode: PresenceMode;
};

export type State = BaseState & {
  phase: PhaseState<PhaseId>;
  cfg: Config;
  order: string[];
  players: Record<string, Player>;
  round: number;
  grid: string[];
  /** Each cell's cube, shown face first (public: the cube set is printed on the box). */
  cubes: string[][];
  /** Seed for the TV's throw animation only (landing layout is `grid`; physics never decides). */
  throwSeed: number;
  words: Record<string, Entry[]>;
  done: Record<string, true>;
  verdicts: Record<string, Verdict>;
  seq: number;
  toast?: { id: string; len: number; seq: number };
  /** Non-dictionary words the VIP ruled "✓ That counts" this round. */
  counted: string[];
  beats: Beat[];
  missed: Found | null;
  pausedMs: number;
  scores: Record<string, number>;
  log: RoundLog[];
  /** Leader ids before the latest tally (for "takes the lead"). */
  leadersBefore: string[];
};
