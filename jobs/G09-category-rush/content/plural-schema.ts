import {z} from 'zod';
const hash=z.string().regex(/^[a-f0-9]{64}$/);
const group=z.object({id:z.string(),text:z.string(),owners:z.array(z.string()).min(1).max(8),duplicate:z.boolean(),eligible:z.boolean(),accepted:z.boolean(),points:z.number().int().min(0).max(1)}).strict();
export const pluralProtocolSchema=z.object({
 protocol:z.literal('accepted-nine-plural-pairs-two-eight-seats-v1'),label:z.enum(['baseline','after']),assumption:z.string(),
 sourceHashes:z.object({core:hash,matcher:hash,scoring:hash,data:hash,reference:hash,experiment:hash}).strict(),
 rows:z.array(z.object({count:z.union([z.literal(2),z.literal(8)]),singular:z.string(),plural:z.string(),seed:z.number().int().nonnegative(),letter:z.string().length(1),layout:z.array(z.string()).length(12),matches:z.boolean(),publicGroups:z.number().int().min(1).max(2),receipt:z.object({categoryId:z.string(),groups:z.array(group).min(1).max(2)}).strict(),awarded:z.number().int().min(0).max(2),scores:z.record(z.string(),z.number().int().min(0).max(1)),eventCount:z.number().int().positive(),replayMatches:z.literal(true)}).strict()).length(18),
}).strict();
