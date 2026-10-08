import {z} from 'zod';
const integer=z.number().int();
const clock=z.number().min(0).max(1e15);
const variant=z.enum(['american','international']);
const side=z.union([z.literal(1),z.literal(-1)]);
export const moveSchema=z.object({path:z.array(integer.min(0).max(49)).min(2).max(21),captures:z.array(integer.min(0).max(49)).max(20),promotes:z.boolean()}).strict();
const settings=z.object({variant,drawPolicy:z.enum(['official','fortyMove']),repetition:z.boolean(),turnSeconds:integer.min(0).max(300)}).strict();
const player=z.object({id:z.string(),name:z.string(),avatarId:z.string(),connected:z.boolean(),bot:z.boolean().optional(),canSeeTv:z.boolean().optional()}).strict();
const entry=z.object({playerId:z.string(),move:moveSchema}).strict();
export const stateSchema=z.object({
  phase:z.object({id:z.enum(['move','done']),startedAt:clock,deadline:clock.nullable(),paused:z.object({at:clock}).strict().optional()}).strict(),
  phaseClock:clock,rng:z.object({seed:integer.min(0).max(4294967295),step:integer.min(0).max(Number.MAX_SAFE_INTEGER)}).strict(),
  players:z.record(z.string(),player),order:z.tuple([z.string(),z.string()]),settings,
  board:z.array(integer.min(-2).max(2)).min(32).max(50),variant,side,quietPlies:integer.min(0).max(80),ply:integer.min(0),
  repetition:z.record(z.string(),integer.min(1).max(3)),drawWindows:z.array(z.object({kind:z.enum(['sixteen','five','diagonalFive']),weak:side,started:integer.min(0),limit:z.union([z.literal(10),z.literal(32)])}).strict()).max(6),
  lastMove:entry.nullable(),moveLog:z.array(entry).max(16),left:z.array(z.string()).max(2),autoPaused:z.boolean(),winner:z.string().nullable(),endReason:z.string().nullable(),contentLang:z.enum(['en','es']),phoneOnly:z.boolean(),
}).strict();
const stats=z.object({positions:integer.min(0),edges:integer.min(0),wins:integer.min(0),losses:integer.min(0),draws:integer.min(0),maximumDtm:integer.min(0),tacticalThreeToSix:z.object({candidates:integer.min(0),accepted:integer.min(0),definition:z.string()}).strict()}).strict();
export const endgameDataSchema=z.object({version:z.literal(1),seed:integer.min(0).max(4294967295),coverage:z.object({status:z.literal('generated'),maximumPieces:z.literal(6),completeMaterialClasses:z.array(z.string()),partialMaterialClasses:z.array(z.string()),fullSixPieceCoverage:z.boolean(),drawHistoryIncluded:z.literal(false),unresolved:z.string()}).strict(),stats:z.object({american:stats,international:stats}).strict(),rows:z.array(z.tuple([z.string().regex(/^(american|international):(-1|1):[0-4]+$/),integer.min(-1).max(1),integer.min(0).nullable()]))}).strict();
