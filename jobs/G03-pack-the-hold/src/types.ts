import type { GameStateBase, TvView, ControllerView } from '../../../contract/contract.js';

export type Cell = readonly [number, number];
export interface Crate { id: string; cells: Cell[]; value: number }
export interface Level {
  width: number; height: number; cells: Cell[]; crates: Crate[];
  allowFlip: boolean; difficulty: number;
}
export interface Placement { crateId: string; x: number; y: number; rotation: number }
export interface Solution { value: number; placements: Placement[]; nodes: number; pruned: number }
export interface Template { cells: Cell[]; pieces: Cell[][]; anchors: Cell[] }
export interface Tier {
  difficulty: number; templates: Template[]; trials: number; solved: number;
  solveRate: number; confidence95: readonly [number, number]; policy: string;
}
export interface Settings { rounds: number; turnSeconds: number; difficulty: number; allowFlip: boolean }
export interface RoundScore { value: number; optimum: number; ratio: number }
export interface HoldState extends GameStateBase {
  settings: Settings; order: string[]; left: string[]; round: number; seat: number;
  level: Level; optimum: number; solution: Placement[];
  layouts: Record<string, Placement[]>; submitted: string[];
  scores: Record<string, number>; history: Record<string, RoundScore[]>;
}
export type Input =
  | { type: 'place'; placement: Placement }
  | { type: 'remove'; crateId: string }
  | { type: 'clear' }
  | { type: 'submit'; placements: Placement[] }
  | { type: 'next' };
export interface HoldTvView extends TvView {
  round: number; rounds: number; seatId: string | null; level: Level;
  revealed: Record<string, Placement[]>; roundScores: Record<string, RoundScore>;
  optimum: number | null; solution: Placement[];
}
export interface HoldControllerView extends HoldTvView, ControllerView {
  ownLayout: Placement[]; ownValue: number; canPack: boolean;
}
