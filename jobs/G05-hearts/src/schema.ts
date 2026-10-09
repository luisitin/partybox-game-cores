import {number,string,object,array,record,boolean,enum as enumeration} from 'zod';
const card = number().int().min(0).max(51);
const play = object({playerId:string(),card}).strict();
const recordCards = record(string(),array(card).max(52));
const recordScores = record(string(),number().finite());
const settings = object({target:number().int().min(25).max(200),moon:enumeration(['add','subtract']),jack:boolean(),noPass:boolean(),queenBreaks:boolean(),threeDeck:enumeration(['diamonds','clubs']),turnSeconds:number().int().min(0).max(60)}).strict();
const handResult = object({hand:number().int().positive(),points:recordScores,moon:string().nullable()}).strict();
export { inputSchema } from './input.js';
export const stateSchema = object({
 phase:object({id:enumeration(['pass','play','trick','hand','done']),startedAt:number().finite(),deadline:number().finite().nullable(),paused:object({at:number().finite()}).strict().optional()}).strict(),
 rng:object({seed:number().int().min(0).max(0xffffffff),step:number().int().nonnegative()}).strict(),
 players:record(string(),object({id:string(),name:string(),avatarId:string(),connected:boolean(),bot:boolean().optional(),canSeeTv:boolean().optional()}).strict()),
 settings,order:array(string()).min(3).max(6),left:array(string()),handNumber:number().int().positive(),dealer:number().int().min(0).max(5),
 hands:recordCards,passes:recordCards,sent:recordCards,received:recordCards,passOffset:number().int().min(-2).max(3),opening:card,actor:string(),
 trick:array(play).max(6),lastTrick:array(play).max(6),lastWinner:string().nullable(),trickNumber:number().int().min(0).max(17),played:array(play).max(52),
 captured:recordCards,heartsBroken:boolean(),scores:recordScores,handScored:boolean(),history:array(handResult).max(8),
}).strict();
