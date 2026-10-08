import {z} from 'zod';
import {createRng} from '../../contract/rng';
import type {Rng} from '../../contract/rng';
import type {BotSkill} from '../../contract/constants';
import {CATEGORIES,LETTERS} from './content/categories';
import {game} from './src/index';
import {groupsFor} from './src/scoring';
import type {State} from './src/model';

export const SAVE_KEY='category-rush.saved-game.v1';
export const MAX_SAVE_CHARS=200_000;
export const MAX_SAVE_BYTES=200_000;
const utf8=new TextEncoder();
export type SavedSeat={id:string;name:string;kind:'human'|BotSkill};
export interface SavedGame {
  version:1;compat:string;state:State;seats:SavedSeat[];
  config:{rounds:number;roundSeconds:number;seed:number};
  activeHuman:string|null;handover:boolean;draft:string[];ballot:(boolean|null)[];
  coreNow:number;phaseBase:number;phaseElapsed:number;seatElapsed:number;
  botRngs:Record<string,{seed:number;step:number}>;receiptRound:number|null;
}
const time=z.number().finite().nonnegative().max(1e15);
const id=z.string().regex(/^p[1-9]\d{0,9}$/);
const text=z.string().max(80);
const rng=z.object({seed:z.number().int().min(0).max(0xffffffff),step:z.number().int().min(0).max(4096)}).strict();
const category=z.object({id:z.string().max(80),prompt:z.string().max(200),clarification:z.string().max(400),theme:z.string().max(80)}).strict();
const categories=z.array(category).length(12);
const points=z.record(id,z.number().int().min(0).max(60));
const group=z.object({id:z.string().max(80),text:text.min(1),owners:z.array(id).min(1).max(8),duplicate:z.boolean(),eligible:z.boolean(),accepted:z.boolean(),points:z.union([z.literal(0),z.literal(1)])}).strict();
const entry=z.object({categoryId:z.string().max(80),groups:z.array(group).max(8)}).strict();
const result=z.object({round:z.number().int().min(1).max(5),letter:z.enum(LETTERS as [string,...string[]]),categories,points,entries:z.array(entry).length(12)}).strict();
const cfg=z.object({rounds:z.number().int().min(1).max(5),roundSeconds:z.number().int().min(30).max(180).refine(n=>n%30===0)}).strict();
const player=z.object({id,name:z.string().min(1).max(24),avatarId:z.string().max(80),connected:z.boolean(),bot:z.boolean().optional(),canSeeTv:z.boolean().optional()}).strict();
const stateSchema=z.object({phase:z.object({id:z.enum(['answer','review','scores','done']),startedAt:time,deadline:time.nullable(),paused:z.object({at:time}).strict().optional()}).strict(),rng,players:z.record(id,player),order:z.array(id).min(2).max(8),left:z.array(id).max(8),cfg,round:z.number().int().min(1).max(5),letter:z.enum(LETTERS as [string,...string[]]),usedLetters:z.array(z.string()).min(1).max(5),categories,answers:z.record(id,z.array(text).length(12)),submitted:z.record(id,z.boolean()),reviewIndex:z.number().int().min(0).max(11),votes:z.record(id,z.array(z.boolean().nullable()).max(8)),reviewed:z.array(entry).max(12),scores:points,roundResult:result.nullable(),history:z.array(result).max(5),phaseClock:time}).strict();
const shape=z.object({version:z.literal(1),compat:z.string().length(64),state:stateSchema,seats:z.array(z.object({id,name:z.string().min(1).max(24),kind:z.enum(['human','easy','normal','sharp'])}).strict()).min(2).max(8),config:cfg.extend({seed:z.number().int().min(0).max(0xffffffff)}),activeHuman:id.nullable(),handover:z.boolean(),draft:z.array(text).length(12),ballot:z.array(z.boolean().nullable()).max(8),coreNow:time,phaseBase:time,phaseElapsed:time,seatElapsed:time,botRngs:z.record(id,rng.extend({step:z.number().int().min(0).max(256)})),receiptRound:z.number().int().min(1).max(5).nullable()}).strict();
const sameKeys=(record:Record<string,unknown>,order:string[])=>Object.keys(record).length===order.length&&order.every(key=>Object.hasOwn(record,key));
function validEntries(entries:State['reviewed'],categories:State['categories'],round:number,order:string[]):boolean {
  return entries.every((entry,i)=>{
    if(entry.categoryId!==categories[i].id)return false;
    const seen=new Set<string>();
    return entry.groups.every((group,g)=>{
      if(group.id!==`r${round}-c${i}-g${g}`||group.text.trim()!==group.text||new Set(group.owners).size!==group.owners.length||group.owners.some(owner=>!order.includes(owner)||seen.has(owner))||group.duplicate!==(group.owners.length>1)||group.accepted&&!group.eligible||group.points!==(group.accepted&&!group.duplicate?1:0))return false;
      group.owners.forEach(owner=>seen.add(owner));return true;
    });
  });
}
function consistent(save:SavedGame):boolean {
  const s=save.state,order=s.order;
  if(new Set(order).size!==order.length||s.left.length!==0||!sameKeys(s.players,order)||!sameKeys(s.answers,order)||!sameKeys(s.submitted,order)||!sameKeys(s.scores,order)||!sameKeys(save.botRngs,order))return false;
  if(save.seats.length!==order.length||!save.seats.some(seat=>seat.kind==='human')||s.round>s.cfg.rounds||save.config.rounds!==s.cfg.rounds||save.config.roundSeconds!==s.cfg.roundSeconds||save.config.seed!==s.rng.seed)return false;
  if(save.coreNow<s.phase.startedAt||save.phaseBase>save.coreNow||s.phaseClock!==s.phase.startedAt||s.phase.deadline!==null&&s.phase.deadline<s.phase.startedAt||s.phase.paused&&s.phase.paused.at>save.coreNow)return false;
  if(s.phase.id==='done'&&s.phase.deadline!==null||s.phase.id!=='done'&&s.phase.deadline===null)return false;
  if(s.usedLetters.length!==s.round||new Set(s.usedLetters).size!==s.round||s.usedLetters.at(-1)!==s.letter||s.usedLetters.some(letter=>!LETTERS.includes(letter)))return false;
  for(let i=0;i<order.length;i++){
    const seat=save.seats[i],p=s.players[order[i]];
    if(seat.id!==order[i]||seat.name!==p.name||p.id!==seat.id||!p.connected||(seat.kind!=='human')!==(p.bot===true)||save.botRngs[seat.id].seed!==((save.config.seed+i*7919)>>>0))return false;
  }
  const canonical=(list:State['categories'])=>new Set(list.map(c=>c.id)).size===12&&list.every(c=>{const authored=CATEGORIES.find(row=>row.id===c.id);return authored&&authored.prompt===c.prompt&&authored.clarification===c.clarification&&authored.theme===c.theme;});
  if(!canonical(s.categories)||s.categories.some(c=>!(CATEGORIES.find(row=>row.id===c.id)!.answers[s.letter]?.length)))return false;
  const totals=Object.fromEntries(order.map(playerId=>[playerId,0]));
  for(let n=0;n<s.history.length;n++){
    const round=s.history[n];if(round.round!==n+1||round.letter!==s.usedLetters[n]||!canonical(round.categories)||!sameKeys(round.points,order))return false;
    if(!validEntries(round.entries,round.categories,round.round,order))return false;
    const roundTotals=Object.fromEntries(order.map(playerId=>[playerId,0]));
    for(let i=0;i<12;i++){
      const e=round.entries[i];if(e.categoryId!==round.categories[i].id)return false;
      const seen=new Set<string>();
      for(const g of e.groups){if(g.text.trim()!==g.text||new Set(g.owners).size!==g.owners.length||g.owners.some(owner=>!order.includes(owner)||seen.has(owner))||g.duplicate!==(g.owners.length>1)||g.accepted&&!g.eligible||g.points!==(g.accepted&&!g.duplicate?1:0))return false;for(const owner of g.owners){seen.add(owner);roundTotals[owner]+=g.points;}}
    }
    for(const playerId of order){if(roundTotals[playerId]!==round.points[playerId])return false;totals[playerId]+=round.points[playerId];}
  }
  if(order.some(playerId=>totals[playerId]!==s.scores[playerId]))return false;
  if((s.phase.id==='answer'||s.phase.id==='review')&&s.history.length!==s.round-1||s.phase.id==='scores'&&s.history.length!==s.round||s.phase.id==='done'&&s.history.length!==s.round&&s.history.length!==s.round-1)return false;
  if(s.roundResult!==null&&JSON.stringify(s.roundResult)!==JSON.stringify(s.history.at(-1)))return false;
  if(s.phase.id==='scores'&&s.roundResult===null||save.receiptRound!==null&&!s.history.some(round=>round.round===save.receiptRound))return false;
  if(s.phase.id==='answer'&&s.reviewed.length!==0||s.phase.id==='review'&&s.reviewed.length!==s.reviewIndex||s.phase.id==='scores'&&s.reviewed.length!==12)return false;
  if(!validEntries(s.reviewed,s.categories,s.round,order))return false;
  const review=game.tvView(s).review;
  const groupCount=groupsFor(s,s.reviewIndex).length;
  if(Object.entries(s.votes).some(([playerId,votes])=>!order.includes(playerId)||votes.length!==groupCount))return false;
  if(s.phase.id==='answer'||s.phase.id==='review'){
    const pending=save.seats.find(seat=>seat.kind==='human'&&(s.phase.id==='answer'?!s.submitted[seat.id]:!Object.hasOwn(s.votes,seat.id)));
    if(!pending||save.activeHuman!==pending.id||save.ballot.length!==(review?.groups.length??0))return false;
    const budget=s.phase.id==='answer'?s.cfg.roundSeconds*1000:(s.phase.deadline??0)-save.phaseBase;
    if(budget<0||save.seatElapsed>budget||save.phaseElapsed>budget)return false;
  }else if(save.activeHuman!==null||save.handover||save.ballot.length!==0)return false;
  return true;
}
export function decodeSave(raw:string,compat:string):{kind:'valid';snapshot:SavedGame}|{kind:'invalid'|'stale'} {
  if(raw.length>MAX_SAVE_CHARS||utf8.encode(raw).byteLength>MAX_SAVE_BYTES)return {kind:'invalid'};
  try {
    const value:unknown=JSON.parse(raw),meta=z.object({version:z.number(),compat:z.string()}).safeParse(value);
    if(meta.success&&(meta.data.version!==1||meta.data.compat!==compat))return {kind:'stale'};
    const parsed=shape.safeParse(value);if(!parsed.success)return {kind:'invalid'};
    const snapshot=parsed.data as SavedGame;return consistent(snapshot)?{kind:'valid',snapshot}:{kind:'invalid'};
  }catch{return {kind:'invalid'};}
}
export function encodeSave(save:SavedGame):string {
  const raw=JSON.stringify(save);if(decodeSave(raw,save.compat).kind!=='valid')throw new Error('Saved game failed bounded validation');return raw;
}
export function restoreBotRng(state:{seed:number;step:number}):Rng {
  if(!Number.isInteger(state.seed)||state.seed<0||state.seed>0xffffffff||!Number.isInteger(state.step)||state.step<0||state.step>256)throw new Error('Invalid bot RNG snapshot');
  const rng=createRng(state.seed);for(let i=0;i<state.step;i++)rng.float();return rng;
}
