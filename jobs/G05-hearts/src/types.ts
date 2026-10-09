import type { ControllerView, GameStateBase, TvView } from '../../../contract/contract.js';
export type Card = number;
export type MoonMode = 'add' | 'subtract';
export interface Settings { target: number; moon: MoonMode; jack: boolean; noPass: boolean; queenBreaks: boolean; threeDeck: 'diamonds' | 'clubs'; turnSeconds: number }
export interface Play { playerId: string; card: Card }
export interface HandResult { hand: number; points: Record<string, number>; moon: string | null }
export interface HeartsState extends GameStateBase {
  settings: Settings; order: string[]; left: string[]; handNumber: number; dealer: number;
  hands: Record<string, Card[]>; passes: Record<string, Card[]>; sent: Record<string, Card[]>; received: Record<string, Card[]>;
  passOffset: number; opening: Card; actor: string; trick: Play[]; lastTrick: Play[]; lastWinner: string | null;
  trickNumber: number; played: Play[]; captured: Record<string, Card[]>; heartsBroken: boolean;
  scores: Record<string, number>; handScored: boolean; history: HandResult[];
}
export type Input = { type: 'pass'; cards: Card[] } | { type: 'play'; card: Card } | { type: 'next' };
export interface HeartsTv extends TvView {
  handNumber: number; actor: string | null; passOffset: number; opening: Card; trickNumber: number;
  trick: Play[]; lastTrick: Play[]; lastWinner: string | null; played: Play[];
  handCounts: Record<string, number>; takenPoints: Record<string, number>; scores: Record<string, number>;
  heartsBroken: boolean; settings: Settings; lastHand: HandResult | null;
}
export interface HeartsController extends HeartsTv, ControllerView {
  hand: Card[]; legal: Card[]; canPass: boolean; ownPass: Card[];
  sentTo?: string; sentCards?: Card[]; receivedCards?: Card[];
}
