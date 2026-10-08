import {z} from 'zod';
import type {GameDefinition,GameEvent,InitContext,GameStateBase,GameManifest,TvView,ControllerView,GameResults} from '../../../contract/contract';
import type {BotSkill} from '../../../contract/constants';
import {seedRng,createRng} from '../../../contract/rng';
import type {Rng} from '../../../contract/rng';
import type {Config,Move,Position,Side} from './types.js';
import {initialBoard,legalMoves,moveKey,positionKey} from './moves.js';
import {nextPosition,drawReason} from './draws.js';
import {chooseMove} from './bots.js';
export {createRng};
export const inputSchema=z.discriminatedUnion('type',[
  z.object({type:z.literal('move'),path:z.array(z.number().int().min(0).max(49)).min(2).max(21)}).strict(),
  z.object({type:z.literal('resign')}).strict(),
]);
export type Input=z.infer<typeof inputSchema>;
export interface State extends GameStateBase,Position{
  phaseClock:number;order:[string,string];settings:Config;lastMove:{playerId:string;move:Move}|null;
  moveLog:{playerId:string;move:Move}[];left:string[];autoPaused:boolean;winner:string|null;
  endReason:string|null;contentLang:'en'|'es';phoneOnly:boolean;
}
export interface PublicView extends TvView{
  variant:Config['variant'];board:number[];side:number;turn:string;ply:number;settings:Config;
  lastMove:{playerId:string;move:Move}|null;moveLog:{playerId:string;move:Move}[];
  quietPlies:number;quietLimit:number;drawWindows:Position['drawWindows'];winner:string|null;endReason:string|null;
}
export interface PrivateView extends ControllerView,PublicView{canMove:boolean;legalMoves:Move[];canResign:boolean}
export const manifest:GameManifest={
  id:'checkers',name:'Checkers',icon:'⚫',tagline:'Every capture counts. Find the winning line.',
  description:'American and International draughts, complete capture sequences, three bot levels and official draw counters.',
  howToPlay:['Move diagonally on the dark squares; highlighted moves are legal.',
    'Capture whenever possible and complete every required jump.',
    'Crown your men and leave the opponent without a legal move.'],
  version:'1.0.0',minPlayers:2,maxPlayers:2,estimatedMinutes:20,unlimitedDuration:true,
  tags:['classic','strategy'],presence:{needs:'same-room'},addedOn:'2026-10-08',supportsBots:true,saveable:true,noCards:true,
  settings:[
    {key:'variant',label:'Rules',type:'select',default:'american',options:[{value:'american',label:'American · 8 × 8'},{value:'international',label:'International · 10 × 10'}]},
    {key:'drawPolicy',label:'Move-count draw',type:'select',default:'official',options:[{value:'official',label:'Official for selected rules'},{value:'fortyMove',label:'40 moves each · house rule'}]},
    {key:'repetition',label:'Threefold repetition draw',type:'boolean',default:true},
    {key:'turnSeconds',label:'Seconds per move (0 is off)',type:'number',default:0,min:0,max:300,step:1},
  ],
};
export function configuration(values:InitContext['settings']):Config{
  const seconds=values.turnSeconds;
  return {variant:values.variant==='international'?'international':'american',
    drawPolicy:values.drawPolicy==='fortyMove'?'fortyMove':'official',
    repetition:typeof values.repetition==='boolean'?values.repetition:true,
    turnSeconds:typeof seconds==='number'&&Number.isFinite(seconds)?Math.max(0,Math.min(300,Math.round(seconds))):0};
}
const validTime=(now:number)=>Number.isFinite(now)&&now>=0&&now<=1e15&&!Object.is(now,-0);
const known=(s:State,id:unknown):id is string=>typeof id==='string'&&Object.hasOwn(s.players,id)&&s.order.includes(id);
const present=(s:State,id:string)=>known(s,id)&&s.players[id].connected&&!s.left.includes(id);
const occupied=(s:State)=>s.order.some(id=>present(s,id));
export const turnId=(s:State)=>s.order[s.side===1?0:1];
const cloneMove=(move:Move):Move=>({path:[...move.path],captures:[...move.captures],promotes:move.promotes});
function enter(s:State,id:'move'|'done',now:number):State{
  const startedAt=Math.max(now,s.phaseClock+1);
  return {...s,phaseClock:startedAt,phase:{id,startedAt,deadline:id==='move'&&s.settings.turnSeconds>0?now+s.settings.turnSeconds*1000:null}};
}
export function init(ctx:InitContext):State{
  if(!validTime(ctx.now)||ctx.players.length!==2||ctx.players.some(player=>typeof player.id!=='string')||new Set(ctx.players.map(player=>player.id)).size!==2)
    throw new RangeError('Checkers requires two distinct seats and a supported host timestamp');
  const settings=configuration(ctx.settings),board=initialBoard(settings.variant),order=ctx.players.map(player=>player.id) as [string,string];
  const key=positionKey(board,1,settings.variant);
  let state=enter({phase:{id:'move',startedAt:ctx.now,deadline:null},phaseClock:ctx.now-1,
    rng:seedRng(ctx.seed),players:Object.fromEntries(ctx.players.map(player=>[player.id,{...player}])),
    order,settings,board,variant:settings.variant,side:1,ply:0,quietPlies:0,repetition:{[key]:1},drawWindows:[],
    lastMove:null,moveLog:[],left:[],autoPaused:false,winner:null,endReason:null,
    contentLang:ctx.contentLang??'en',phoneOnly:ctx.presence?.phoneOnly??false},'move',ctx.now);
  if(!occupied(state))state={...state,autoPaused:true,phase:{...state.phase,paused:{at:ctx.now}}};
  return state;
}
function finish(s:State,now:number,reason:string,winner:Side|null):State{
  return enter({...s,winner:winner===null?null:s.order[winner===1?0:1],endReason:reason},'done',now);
}
function play(s:State,move:Move,now:number):State{
  const id=turnId(s),position=nextPosition(s,move,s.settings),entry={playerId:id,move:cloneMove(move)};
  const next={...s,...position,lastMove:entry,moveLog:[...s.moveLog,entry].slice(-16)};
  // A final capture or block wins on the last allowed move before any draw.
  if(!legalMoves(next.board,next.variant,next.side).length)return finish(next,now,'no-legal-move',s.side);
  const drawn=drawReason(next,next.settings);
  return drawn?finish(next,now,drawn,null):enter(next,'move',now);
}
function automatic(s:State,now:number):State{
  if(s.phase.id!=='move')return s;
  const rng=createRng(s.rng.seed^Math.imul(s.ply+1,0x9e3779b1)^s.rng.step);
  const move=chooseMove(s,s.settings,rng,'normal');
  return move?{...play(s,move,now),rng:rng.state()}:finish(s,now,'no-legal-move',-s.side as Side);
}
function drainAbsent(s:State,now:number):State{
  let next=s;
  for(let i=0;i<2&&next.phase.id==='move'&&!next.phase.paused&&occupied(next)&&!present(next,turnId(next));i++){
    const played=automatic(next,now);if(played===next)break;next=played;
  }
  return next;
}
function playerEvent(s:State,e:Extract<GameEvent<Input>,{type:'player'}>):State{
  if(!known(s,e.playerId)||typeof e.connected!=='boolean'||(e.gone!==undefined&&e.gone!=='left'&&e.gone!=='kicked'))return s;
  const id=e.playerId,wasLeft=s.left.includes(id),gone=e.gone!==undefined,connected=!wasLeft&&!gone&&e.connected;
  if(s.players[id].connected===connected&&(wasLeft||!gone))return s;
  let next:State={...s,players:{...s.players,[id]:{...s.players[id],connected}},left:gone&&!wasLeft?[...s.left,id]:s.left};
  if(next.phase.id==='done')return next;
  if(!occupied(next))return next.phase.paused?next:{...next,autoPaused:true,phase:{...next.phase,paused:{at:e.now}}};
  if(next.autoPaused&&next.phase.paused){
    const delta=Math.max(0,e.now-next.phase.paused.at);
    next={...next,autoPaused:false,phase:{id:next.phase.id,startedAt:next.phase.startedAt,deadline:next.phase.deadline===null?null:next.phase.deadline+delta}};
  }
  return drainAbsent(next,e.now);
}
function reduceEvent(s:State,e:GameEvent<Input>):State{
  if(e===null||typeof e!=='object'||!validTime(e.now))return s;
  // Ordered local SDK adapter: presence, speech, VIP, pause, live phase.
  if(e.type==='player')return playerEvent(s,e);
  if(e.type==='speech'||e.type==='speechStart')return s;
  if(e.type==='vip'){
    if(s.phase.id==='done')return s;
    if(e.action==='end')return finish(s,e.now,'vip-end',null);
    if(e.action==='pause')return s.phase.paused?(s.autoPaused?{...s,autoPaused:false}:s):{...s,autoPaused:false,phase:{...s.phase,paused:{at:e.now}}};
    if(e.action==='resume'){
      if(!s.phase.paused)return s;
      if(!occupied(s))return s.autoPaused?s:{...s,autoPaused:true};
      const delta=Math.max(0,e.now-s.phase.paused.at);
      return drainAbsent({...s,autoPaused:false,phase:{id:s.phase.id,startedAt:s.phase.startedAt,deadline:s.phase.deadline===null?null:s.phase.deadline+delta}},e.now);
    }
    if(e.action==='skip'){
      const next=automatic({...s,phase:{id:s.phase.id,startedAt:s.phase.startedAt,deadline:s.phase.deadline}},e.now);
      return s.phase.paused&&next.phase.id!=='done'?{...next,autoPaused:s.autoPaused,phase:{...next.phase,paused:{at:e.now}}}:drainAbsent(next,e.now);
    }
    return s;
  }
  if(s.phase.paused||s.phase.id==='done')return s;
  if(e.type==='timer')return e.phaseId===s.phase.id&&e.startedAt===s.phase.startedAt&&s.phase.deadline!==null&&e.now>=s.phase.deadline?
    finish(s,e.now,'turn-clock-forfeit',-s.side as Side):s;
  if(e.type==='input'){
    if(!known(s,e.playerId)||e.playerId!==turnId(s)||!present(s,e.playerId))return s;
    const parsed=inputSchema.safeParse(e.input);if(!parsed.success)return s;
    if(parsed.data.type==='resign')return finish(s,e.now,'resignation',-s.side as Side);
    const key=moveKey(parsed.data),move=legalMoves(s.board,s.variant,s.side).find(candidate=>moveKey(candidate)===key);
    return move?drainAbsent(play(s,move,e.now),e.now):s;
  }
  return s;
}
export function reduce(s:State,event:GameEvent<Input>):State{try{return reduceEvent(s,event);}catch{return s;}}
export function tvView(s:State):PublicView{
  const turn=turnId(s);
  return {gameId:manifest.id,phaseId:s.phase.id,deadline:s.phase.deadline,paused:!!s.phase.paused,
    players:s.order.map(id=>({id,name:s.players[id].name,avatarId:s.players[id].avatarId,connected:s.players[id].connected,
      status:s.phase.id==='done'?'submitted':id===turn?'active':'waiting'})),
    variant:s.variant,board:[...s.board],side:s.side,turn,ply:s.ply,settings:{...s.settings},
    lastMove:s.lastMove?{playerId:s.lastMove.playerId,move:cloneMove(s.lastMove.move)}:null,
    moveLog:s.moveLog.map(entry=>({playerId:entry.playerId,move:cloneMove(entry.move)})),
    quietPlies:s.quietPlies,quietLimit:s.variant==='international'&&s.settings.drawPolicy==='official'?50:80,
    drawWindows:s.drawWindows.map(window=>({...window})),winner:s.winner,endReason:s.endReason};
}
export function controllerView(s:State,id:string):PrivateView{
  const player=known(s,id),canMove=player&&id===turnId(s)&&present(s,id)&&s.phase.id==='move'&&!s.phase.paused;
  const safeId=typeof id==='string'?id:'';
  return {...tvView(s),me:{id:safeId,role:player?'player':'spectator'},phoneOnly:s.phoneOnly,
    canMove,canResign:canMove,legalMoves:canMove?legalMoves(s.board,s.variant,s.side):[]};
}
export function results(s:State):GameResults|null{
  if(s.phase.id!=='done')return null;
  const scores=Object.fromEntries(s.order.map(id=>[id,s.winner===id?1:0]));
  return {scores,ranking:s.order.map(id=>({playerId:id,score:scores[id],rank:s.winner===null||s.winner===id?1:2})),
    winnerIds:s.winner===null?[...s.order]:[s.winner],awards:[],headlineNote:s.endReason??'Game ended'};
}
export function sampleInput(s:State,id:string,rng:Rng,skill:BotSkill='normal'):Input|null{
  if(!known(s,id)||!present(s,id)||id!==turnId(s)||s.phase.id!=='move'||s.phase.paused)return null;
  const move=chooseMove(s,s.settings,rng,skill);return move?{type:'move',path:[...move.path]}:null;
}
export const game:GameDefinition<State,Input,PublicView,PrivateView>={manifest,phases:['move','done'],inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput}};
