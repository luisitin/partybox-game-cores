import {z} from 'zod';
const card=z.number().int().min(0).max(51),integer=z.number().int(),count=integer.min(0);
const bid=z.discriminatedUnion('kind',[z.object({kind:z.literal('number'),value:integer.min(1).max(17)}).strict(),z.object({kind:z.literal('nil'),value:z.literal(0)}).strict(),z.object({kind:z.literal('blind'),value:z.literal(0)}).strict()]);
const play=z.object({playerId:z.string(),card}).strict(),route=z.object({from:z.string(),to:z.string()}).strict();
const scored=z.object({bid:count,won:count,contractTricks:count,contract:integer,nil:integer,newBags:count,penalty:count,score:integer,bags:count.max(9)}).strict();
const report=z.object({hand:integer.min(1),bids:z.record(z.string(),bid),won:z.record(z.string(),count),sides:z.array(scored).min(2).max(3),before:z.array(integer).min(2).max(3)}).strict();
export const stateSchema=z.object({
 players:z.record(z.string(),z.object({id:z.string(),name:z.string(),avatarId:z.string(),connected:z.boolean(),bot:z.boolean().optional(),canSeeTv:z.boolean().optional()}).strict()),
 seats:z.array(z.string()).min(3).max(4),left:z.array(z.string()).max(4),
 settings:z.object({mode:z.enum(['partnership','cutthroat']),blind:z.boolean(),blindGap:z.union([z.literal(0),z.literal(100)]),exchange:z.boolean(),nilValue:z.union([z.literal(50),z.literal(100)]),failedNilCounts:z.boolean(),mercy:z.boolean(),cutDeck:z.enum(['low-club','stock']),cutLead:z.enum(['dealer','club'])}).strict(),
 dealer:count.max(3),turn:count.max(3),handNumber:integer.min(1),trickNumber:integer.min(1).max(17),hands:z.record(z.string(),z.array(card).max(19)),stock:card.nullable(),
 bids:z.record(z.string(),bid),looked:z.array(z.string()).max(4),won:z.record(z.string(),count.max(17)),scores:z.array(integer).min(2).max(3),bags:z.array(count.max(9)).min(2).max(3),
 trick:z.array(play).max(4),completed:z.array(z.object({number:integer.min(1).max(17),cards:z.array(play).min(3).max(4),winner:z.string()}).strict()).max(17),broken:z.boolean(),forcedLead:card.nullable(),
 exchangePlan:z.array(route).max(4),exchangeStep:count.max(4),report:report.nullable(),history:z.array(report).max(4),doneReason:z.enum(['target','mercy','host']).nullable(),
 rng:z.object({seed:count.max(0xffffffff),step:count}).strict(),phase:z.object({id:z.enum(['blind','bid','exchange','play','trick','hand','done']),startedAt:z.number().finite(),deadline:z.number().finite().nullable(),paused:z.object({at:z.number().finite()}).strict().optional()}).strict()
}).strict();
export const deckSchema=z.array(z.object({id:card,rank:integer.min(2).max(14),suit:z.enum(['clubs','diamonds','hearts','spades']),label:z.string().min(2).max(4)}).strict()).length(52);
