import {z} from 'zod';
const hash=z.string().regex(/^[a-f0-9]{64}$/);
const row=z.object({a:z.string(),b:z.string(),kind:z.enum(['positive','negative','ambiguous','nonselected-variant','semantic-fuzzy-guard']),same:z.boolean(),stemA:z.string(),stemB:z.string(),groups:z.array(z.array(z.number().int().nonnegative())),awarded:z.number().int().min(0).max(2),ownAwarded:z.number().int().min(0).max(2)}).strict();
export const lexicalAuditSchema=z.object({sourceHashes:z.object({match:hash,core:hash,scoring:hash,data:hash}).strict(),cases:z.literal(62),positive:z.literal(46),positiveSame:z.number().int().min(0).max(46),positiveFailures:z.array(row),stemFailures:z.array(row),negative:z.number().int().positive(),negativeFalseMerges:z.array(row),rows:z.array(row).length(62)}).strict();
