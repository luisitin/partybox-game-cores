import {z} from 'zod';
import fixtureSchema from '../fixtures/schema.json';
import {game} from './core.js';
import type {State} from './core.js';
import {seedRng,nextFloat,nextInt,pick,shuffle} from '../../../contract/rng';
import type {Rng,RngState} from '../../../contract/rng';
import {countMatches} from './rules.js';

export const SAVE_KEY='partybox.g07.session.v1';
export const MAX_SESSION_BYTES=256*1024;
export type Skill='easy'|'normal'|'sharp';
export type Pace='fast'|'normal'|'slow'|'manual';
export interface SavedSession {
  version:1;gameId:'liars-dice';gameVersion:string;state:State;savedHostNow:number;
  botRng:RngState;skills:[string,Skill][];pace:Pace;
  currentTimerConsumed:boolean;sampledCurrentBid:boolean;
}
type Schema={type?:string;properties?:Record<string,Schema>;required?:string[];
  additionalProperties?:boolean|Schema;items?:Schema;anyOf?:Schema[];[key:string]:unknown};
const schema=fixtureSchema as Schema;
const validators=new WeakMap<Schema,z.ZodType>();
function validator(part:Schema):z.ZodType {
  let result=validators.get(part);
  if(!result){result=z.fromJSONSchema(part as Parameters<typeof z.fromJSONSchema>[0]);validators.set(part,result);}
  return result;
}
// Inspect original own entries as well: a record parser may omit a prototype
// named seat. The fixture remains the single structural schema authority.
function validOriginal(part:Schema,value:unknown):boolean {
  if(!validator(part).safeParse(value).success)return false;
  if(part.anyOf)return part.anyOf.some(child=>validOriginal(child,value));
  if(part.type==='array')return Array.isArray(value)&&(!part.items||value.every(item=>validOriginal(part.items!,item)));
  if(part.type==='object'){
    if(value===null||typeof value!=='object'||Array.isArray(value))return false;
    if(part.required?.some(key=>!Object.hasOwn(value,key)))return false;
    for(const [key,item] of Object.entries(value)){
      const child=part.properties&&Object.hasOwn(part.properties,key)?part.properties[key]:undefined;
      if(child){if(!validOriginal(child,item))return false;}
      else if(part.additionalProperties===false)return false;
      else if(typeof part.additionalProperties==='object'&&!validOriginal(part.additionalProperties,item))return false;
    }
  }
  return true;
}
const finiteClock=(value:number)=>Number.isFinite(value)&&value>=0&&!Object.is(value,-0);
const hostClock=(value:number)=>finiteClock(value)&&value<=1e15;
const validRng=(value:RngState)=>Number.isSafeInteger(value.seed)&&value.seed>=0&&value.seed<=0xffffffff&&
  Number.isSafeInteger(value.step)&&value.step>=0;
const sameBid=(a:State['bid'],b:State['bid'])=>a===null?b===null:b!==null&&
  a.quantity===b.quantity&&a.face===b.face&&a.playerId===b.playerId;
function validState(s:State):boolean {
  const order=s.order,known=(id:string)=>order.includes(id)&&Object.hasOwn(s.players,id);
  if(new Set(order).size!==order.length||!Number.isSafeInteger(s.round)||!validRng(s.rng))return false;
  const maps=[s.players,s.cups,s.diceCount,s.seenPalifico,s.models];
  if(maps.some(map=>Object.keys(map).length!==order.length||order.some(id=>!Object.hasOwn(map,id))))return false;
  if(!finiteClock(s.phase.startedAt)||s.phaseClock!==s.phase.startedAt||
    (s.phase.deadline!==null&&!finiteClock(s.phase.deadline))||
    (s.phase.paused&&!hostClock(s.phase.paused.at)))return false;
  if(s.phase.id!=='bid'&&s.phase.deadline!==null)return false;
  if(s.phase.id==='bid'&&((s.settings.turnSeconds===0)!==(s.phase.deadline===null)))return false;
  if(!known(s.turn)||!known(s.nextStarter)||
    [s.palificoStarter,s.nextPalifico,s.winner].some(id=>id!==null&&!known(id)))return false;
  for(const entries of [s.eliminated,s.left])if(new Set(entries).size!==entries.length||entries.some(id=>!known(id)))return false;
  if(s.left.some(id=>s.players[id].connected))return false;
  if(order.some(id=>s.players[id].id!==id||((s.diceCount[id]===0)!==s.eliminated.includes(id))||
    !Number.isSafeInteger(s.models[id].truth)||s.models[id].truth<1||
    !Number.isSafeInteger(s.models[id].false)||s.models[id].false<1))return false;
  if(s.bidLog.length>128||s.bidLog.some(bid=>!known(bid.playerId))||
    (s.bid===null?s.bidLog.length!==0:!known(s.bid.playerId)||s.bidLog.length===0||!sameBid(s.bid,s.bidLog.at(-1)!)))return false;
  if(s.palifico!==(s.palificoStarter!==null)||
    (s.palificoStarter!==null&&(!s.settings.palificoEnabled||!s.seenPalifico[s.palificoStarter])))return false;
  if(s.nextPalifico!==null&&(!s.settings.palificoEnabled||s.diceCount[s.nextPalifico]!==1||s.seenPalifico[s.nextPalifico]))return false;
  const survivors=order.filter(id=>s.diceCount[id]>0);
  if(survivors.length<1)return false;
  if(s.phase.id==='done'){
    if(s.endReason!=='last-die'&&s.endReason!=='vip-end')return false;
    if(s.winner!==(survivors.length===1?survivors[0]:null))return false;
    if(s.endReason==='last-die'&&(survivors.length!==1||s.reveal===null))return false;
  }else if(survivors.length<2||s.winner!==null||s.endReason!==null)return false;
  if(s.phase.id==='bid'&&(s.reveal!==null||s.diceCount[s.turn]===0||s.diceCount[s.nextStarter]===0||
    (s.palifico&&(survivors.length<=2||s.diceCount[s.palificoStarter!]===0))))return false;
  if(s.phase.id==='reveal'&&s.reveal===null)return false;
  const reveal=s.reveal;
  if(reveal!==null){
    if(!known(reveal.caller)||!known(reveal.bid.playerId)||
      (reveal.loser!==null&&!known(reveal.loser))||!sameBid(s.bid,reveal.bid)||
      Object.keys(reveal.dice).length!==order.length||order.some(id=>!Object.hasOwn(reveal.dice,id)||
        reveal.dice[id].length!==s.cups[id].length||reveal.dice[id].some((die,i)=>die!==s.cups[id][i])))return false;
    const matches=countMatches(order.flatMap(id=>s.cups[id]),reveal.bid.face,s.settings.onesWild&&!s.palifico);
    const correct=reveal.kind==='dudo'?matches<reveal.bid.quantity:matches===reveal.bid.quantity;
    const loser=reveal.kind==='dudo'?(correct?reveal.bid.playerId:reveal.caller):(correct?null:reveal.caller);
    if(matches!==reveal.matches||correct!==reveal.correct||loser!==reveal.loser||
      reveal.caller===reveal.bid.playerId||
      (reveal.kind==='calza'&&(!s.settings.calzaEnabled||s.palifico))||
      (reveal.gained&&(reveal.kind!=='calza'||!correct||reveal.loser!==null)))return false;
  }
  if(order.some(id=>s.cups[id].length!==s.diceCount[id]+
    (reveal?.loser===id?1:0)-(reveal?.gained&&reveal.caller===id?1:0)))return false;
  if(s.phase.id!=='done'&&s.autoPaused&&!s.phase.paused)return false;
  return true;
}
const envelope=z.object({version:z.literal(1),gameId:z.literal('liars-dice'),gameVersion:z.literal(game.manifest.version),
  state:z.unknown(),savedHostNow:z.number().refine(hostClock),
  botRng:z.object({seed:z.number(),step:z.number()}).strict().refine(validRng),
  skills:z.array(z.tuple([z.string(),z.enum(['easy','normal','sharp'])])).min(2).max(8),
  pace:z.enum(['fast','normal','slow','manual']),currentTimerConsumed:z.boolean(),sampledCurrentBid:z.boolean()}).strict();
export function decodeSession(raw:unknown):SavedSession|null {
  try{
    if(typeof raw!=='string'||raw.length>MAX_SESSION_BYTES||new TextEncoder().encode(raw).length>MAX_SESSION_BYTES)return null;
    const value:unknown=JSON.parse(raw);
    if(!envelope.safeParse(value).success)return null;
    const saved=value as SavedSession;
    if(!validOriginal(schema,saved.state)||!validState(saved.state))return null;
    const ids=saved.skills.map(([id])=>id);
    if(new Set(ids).size!==ids.length||ids.length!==saved.state.order.length||
      ids.some(id=>!saved.state.order.includes(id)||!Object.hasOwn(saved.state.players,id)))return null;
    return saved;
  }catch{return null;}
}
export function encodeSession(saved:SavedSession):string|null {
  try{
    const raw=JSON.stringify(saved);
    return decodeSession(raw)?raw:null;
  }catch{return null;}
}
export function phaseKey(state:State):string{return `${state.phase.id}:${state.phase.startedAt}`;}
export function currentBidKey(state:State):string|null {
  return state.bid?`${state.round}:${state.bidLog.length}:${state.bid.playerId}:${state.bid.quantity}:${state.bid.face}`:null;
}
export function restoreSessionState(saved:SavedSession,now:number):State {
  if(!hostClock(now))throw new RangeError('Unsupported restored host timestamp');
  const state=saved.state;
  if(state.phase.id==='done'||state.phase.paused)return state;
  const held=game.reduce(state,{type:'vip',action:'pause',now:saved.savedHostNow});
  return game.reduce(held,{type:'vip',action:'resume',now});
}
export function createResumableRng(initial:number|RngState):Rng {
  let cursor=typeof initial==='number'?seedRng(initial):{...initial};
  if(!validRng(cursor))throw new RangeError('Unsupported saved random cursor');
  const rng:Rng={
    float(){const [value,next]=nextFloat(cursor);cursor=next;return value;},
    int(min,max){const [value,next]=nextInt(cursor,min,max);cursor=next;return value;},
    pick(items){const [value,next]=pick(cursor,items);cursor=next;return value;},
    shuffle(items){const [value,next]=shuffle(cursor,items);cursor=next;return value;},
    chance(probability){return rng.float()<probability;},
    state(){return {...cursor};},
  };
  return rng;
}
