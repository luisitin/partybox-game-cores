import { z } from 'zod';
const card = z.number().int().min(0).max(51);
const play = z.object({playerId:z.string(),card}).strict();
const recordCards = z.record(z.string(),z.array(card).max(52));
const recordScores = z.record(z.string(),z.number().finite());
const settings = z.object({target:z.number().int().min(25).max(200),moon:z.enum(['add','subtract']),jack:z.boolean(),noPass:z.boolean(),queenBreaks:z.boolean(),threeDeck:z.enum(['diamonds','clubs']),turnSeconds:z.number().int().min(0).max(60)}).strict();
const handResult = z.object({hand:z.number().int().positive(),points:recordScores,moon:z.string().nullable()}).strict();
export const inputSchema = z.discriminatedUnion('type',[
 z.object({type:z.literal('pass'),cards:z.array(card).length(3)}).strict(),
 z.object({type:z.literal('play'),card}).strict(),
 z.object({type:z.literal('next')}).strict(),
]);
export const stateSchema = z.object({
 phase:z.object({id:z.enum(['pass','play','trick','hand','done']),startedAt:z.number().finite(),deadline:z.number().finite().nullable(),paused:z.object({at:z.number().finite()}).strict().optional()}).strict(),
 rng:z.object({seed:z.number().int().min(0).max(0xffffffff),step:z.number().int().nonnegative()}).strict(),
 players:z.record(z.string(),z.object({id:z.string(),name:z.string(),avatarId:z.string(),connected:z.boolean(),bot:z.boolean().optional(),canSeeTv:z.boolean().optional()}).strict()),
 settings,order:z.array(z.string()).min(3).max(6),left:z.array(z.string()),handNumber:z.number().int().positive(),dealer:z.number().int().min(0).max(5),
 hands:recordCards,passes:recordCards,sent:recordCards,received:recordCards,passOffset:z.number().int().min(-2).max(3),opening:card,actor:z.string(),
 trick:z.array(play).max(6),lastTrick:z.array(play).max(6),lastWinner:z.string().nullable(),trickNumber:z.number().int().min(0).max(17),played:z.array(play).max(52),
 captured:recordCards,heartsBroken:z.boolean(),scores:recordScores,handScored:z.boolean(),history:z.array(handResult).max(8),
}).strict();
