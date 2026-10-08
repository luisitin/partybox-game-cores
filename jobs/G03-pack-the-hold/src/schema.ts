import { z } from 'zod';
import type { Input } from './types.js';

export const cellSchema = z.tuple([z.number().int().min(0).max(63), z.number().int().min(0).max(63)]);
export const placementSchema = z.object({
  crateId: z.string().min(1).max(40), x: z.number().int().min(-64).max(64),
  y: z.number().int().min(-64).max(64), rotation: z.number().int().min(0).max(7),
}).strict();
export const inputSchema: z.ZodType<Input> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('place'), placement: placementSchema }).strict(),
  z.object({ type: z.literal('remove'), crateId: z.string().min(1).max(40) }).strict(),
  z.object({ type: z.literal('clear') }).strict(),
  z.object({ type: z.literal('submit'), placements: z.array(placementSchema).max(12) }).strict(),
  z.object({ type: z.literal('next') }).strict(),
]);
export const levelSchema = z.object({
  width: z.number().int().min(1).max(64), height: z.number().int().min(1).max(64),
  cells: z.array(cellSchema).min(1).max(256),
  crates: z.array(z.object({ id: z.string(), cells: z.array(cellSchema).min(1).max(8), value: z.number().int().positive() }).strict()).min(6).max(12),
  allowFlip: z.boolean(), difficulty: z.number().int().min(1).max(10),
}).strict();
export const roundScoreSchema = z.object({ value: z.number().nonnegative(), optimum: z.number().positive(), ratio: z.number().min(0).max(1) }).strict();
export const stateSchema = z.object({
  phase: z.object({ id: z.enum(['pack', 'reveal', 'done']), startedAt: z.number(), deadline: z.number().nullable(), paused: z.object({ at: z.number() }).strict().optional() }).strict(),
  rng: z.object({ seed: z.number().int().nonnegative(), step: z.number().int().nonnegative() }).strict(),
  players: z.record(z.string(), z.object({ id: z.string(), name: z.string(), avatarId: z.string(), connected: z.boolean(), bot: z.boolean().optional(), canSeeTv: z.boolean().optional() }).strict()),
  settings: z.object({ rounds: z.number().int().min(1).max(3), turnSeconds: z.number().int().min(20).max(60), difficulty: z.number().int().min(1).max(10), allowFlip: z.boolean() }).strict(),
  order: z.array(z.string()).min(2).max(8), left: z.array(z.string()), round: z.number().int().min(1).max(3), seat: z.number().int().min(0).max(7),
  level: levelSchema, optimum: z.number().positive(), solution: z.array(placementSchema).max(12),
  layouts: z.record(z.string(), z.array(placementSchema).max(12)), submitted: z.array(z.string()),
  scores: z.record(z.string(), z.number().nonnegative()), history: z.record(z.string(), z.array(roundScoreSchema).max(3)),
  seenHolds: z.array(z.string().max(800)).min(1).max(3),
}).strict();
