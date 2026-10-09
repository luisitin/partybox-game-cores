import {z} from 'zod';
import type {GameDefinition,GameEvent,InitContext,GameStateBase,GameResults,TvView,ControllerView,GameManifest} from '../../../contract/contract';
import type {BotSkill} from '../../../contract/constants';
import {shuffle,seedRng,nextInt,createRng} from '../../../contract/rng';
import type {Rng} from '../../../contract/rng';
import {minimizeDeadwood,declaredSolution,optimalDefense,discardSolutions,value,rank,suit,validMeld} from './cards';
import type {Card,MeldSolution,Defense} from './cards';

export const inputSchema=z.discriminatedUnion('type',[
  z.object({type:z.literal('pass')}).strict(),
  z.object({type:z.literal('draw'),source:z.enum(['stock','discard'])}).strict(),
  z.object({type:z.literal('discard'),card:z.number().int().min(0).max(51),knock:z.boolean().optional(),melds:z.array(z.array(z.number().int().min(0).max(51)).min(3).max(11)).max(3).optional()}).strict(),
  z.object({type:z.literal('bigGin')}).strict(),
  z.object({type:z.literal('finishLayoff')}).strict(),
  z.object({type:z.literal('next')}).strict()
]);
export type Input=z.infer<typeof inputSchema>;
export interface Config {
  variant:'standard'|'oklahoma';mode:'duel'|'rotation';target:number;
  ginBonus:number;undercutBonus:number;boxBonus:number;bigGin:boolean;bigGinBonus:number;
  dealer:'winner'|'loser'|'alternate';aceGin:boolean;spadeDouble:boolean;extraBoxes:boolean;
  shutout:'gameBonus'|'handPoints'|'wholeScore'|'none';turnSeconds:number;
}
export interface RoundResult {
  kind:'knock'|'gin'|'bigGin'|'undercut'|'draw';winner:string|null;points:number;
  knocker:string|null;knockerLayout:MeldSolution|null;defenderLayout:Defense|null;
  hands:Record<string,Card[]>;multiplier:number;
}
export interface State extends GameStateBase {
  phaseClock:number;roomEmpty:boolean;
  config:Config;order:string[];active:string[];waiting:string[];left:string[];
  scores:Record<string,number>;boxes:Record<string,number>;wins:Record<string,number>;
  dealer:string;turn:string;hand:number;hands:Record<string,Card[]>;
  stock:Card[];discard:Card[];initialUpcard:Card;knockLimit:number;multiplier:number;
  openingPasses:number;mustStock:boolean;drawnDiscard:Card|null;
  pending:{knocker:string;layout:MeldSolution;big:boolean}|null;
  roundResult:RoundResult|null;finished:boolean;endedEarly:boolean;
  publicLog:{player:string;action:string;card:Card|null}[];
}
export interface PublicView extends TvView {
  hand:number;active:string[];waiting:string[];turn:string;dealer:string;
  stockCount:number;discard:Card[];knockLimit:number;multiplier:number;
  scores:Record<string,number>;boxes:Record<string,number>;target:number;
  roundResult:RoundResult|null;log:{player:string;action:string;card:Card|null}[];
}
export interface PrivateView extends ControllerView,PublicView {
  handCards:Card[];deadwood:number|null;legal:Input[];canBigGin:boolean;
  forbiddenDiscard:Card|null;
  config:Config;
}
const select=(key:string,label:string,options:string[],fallback:string)=>({key,label,type:'select' as const,default:fallback,options:options.map(value=>({value,label:value}))});
export const manifest:GameManifest={
  id:'gin-rummy',name:'Gin Rummy',icon:'🃏',tagline:'Build melds, keep your deadwood low.',
  description:'Standard or Oklahoma Gin, exact meld scoring, and an optional winner-stays rotation.',
  howToPlay:['Draw a card, then discard one.','Make sets and runs; knock with low deadwood.','Gin earns a bonus. First to the target ends the match.'],
  version:'1.2.1',minPlayers:2,maxPlayers:4,estimatedMinutes:20,unlimitedDuration:true,
  tags:['classic','strategy'],presence:{needs:'same-room'},addedOn:'2026-10-08',supportsBots:true,saveable:true,
  playerCounts:{setting:'mode',default:[2,2],overrides:{duel:[2,2],rotation:[3,4]}},
  settings:[
    select('variant','Rules',['standard','oklahoma'],'standard'),
    select('mode','Seats',['duel','rotation'],'duel'),
    select('target','Hand-point target',['100','150','250'],'100'),
    select('bonusProfile','Bonus profile',['classic','northAmerican','rubl'],'classic'),
    {key:'bigGin',label:'Allow eleven-card Big Gin',type:'boolean',default:true},
    select('bigGinBonus','Big Gin bonus',['31','50'],'31'),
    select('dealer','Next dealer',['winner','loser','alternate'],'winner'),
    {key:'aceGin',label:'Oklahoma ace requires Gin',type:'boolean',default:true},
    {key:'spadeDouble',label:'Oklahoma spade doubles hand',type:'boolean',default:true},
    {key:'extraBoxes',label:'Oklahoma extra boxes',type:'boolean',default:false},
    select('shutout','Shutout formula',['gameBonus','handPoints','wholeScore','none'],'gameBonus'),
    {key:'turnSeconds',label:'Optional turn clock (0 is off)',type:'number',default:0,min:0,max:120,step:10}
  ]
};
export function configuration(settings:InitContext['settings']):Config {
  const s=(key:string,choices:string[],fallback:string):string=>typeof settings[key]==='string'&&choices.includes(settings[key] as string)?settings[key] as string:fallback;
  const b=(key:string,otherwise:boolean):boolean=>typeof settings[key]==='boolean'?settings[key] as boolean:otherwise;
  const profile=s('bonusProfile',['classic','northAmerican','rubl'],'classic');
  const seconds=typeof settings.turnSeconds==='number'&&Number.isFinite(settings.turnSeconds)?Math.max(0,Math.min(120,Math.round(settings.turnSeconds/10)*10)):0;
  return {variant:s('variant',['standard','oklahoma'],'standard') as Config['variant'],mode:s('mode',['duel','rotation'],'duel') as Config['mode'],
    target:Number(s('target',['100','150','250'],'100')),ginBonus:profile==='classic'?20:25,
    undercutBonus:profile==='classic'?10:profile==='rubl'?20:25,boxBonus:profile==='classic'?20:25,
    bigGin:b('bigGin',true),bigGinBonus:Number(s('bigGinBonus',['31','50'],'31')),
    dealer:s('dealer',['winner','loser','alternate'],'winner') as Config['dealer'],aceGin:b('aceGin',true),
    spadeDouble:b('spadeDouble',true),extraBoxes:b('extraBoxes',false),
    shutout:s('shutout',['gameBonus','handPoints','wholeScore','none'],'gameBonus') as Config['shutout'],turnSeconds:seconds};
}
function phase(state:State,id:string,now:number):State {
  const startedAt=Math.max(now,state.phaseClock+1);
  return {...state,phaseClock:startedAt,phase:{id,startedAt,deadline:['round-end','done'].includes(id)||!state.config.turnSeconds?null:now+state.config.turnSeconds*1000}};
}
function other(state:State,id=state.turn):string {return state.active.find(x=>x!==id)!;}
function appendLog(state:State,action:string,card:Card|null=null):State {
  return {...state,publicLog:[...state.publicLog,{player:state.turn,action,card}].slice(-128)};
}
function deal(state:State,now:number):State {
  const [deck,rng]=shuffle(state.rng,Array.from({length:52},(_,i)=>i));
  const nonDealer=state.active.find(x=>x!==state.dealer)!;
  const hands:Record<string,Card[]>=Object.fromEntries(state.order.map(id=>[id,[]]));
  for(let i=0;i<20;i++)hands[i%2===0?nonDealer:state.dealer].push(deck[i]);
  const initialUpcard=deck[20];
  const limit=state.config.variant==='oklahoma'?(rank(initialUpcard)===1&&state.config.aceGin?0:value(initialUpcard)):10;
  const multiplier=state.config.variant==='oklahoma'&&state.config.spadeDouble&&suit(initialUpcard)===3?2:1;
  return phase({...state,rng,hand:state.hand+1,hands,stock:deck.slice(21),discard:[initialUpcard],initialUpcard,
    knockLimit:limit,multiplier,turn:nonDealer,openingPasses:0,mustStock:false,drawnDiscard:null,pending:null,roundResult:null,publicLog:[]},'upcard',now);
}
export function init(ctx:InitContext):State {
  const config=configuration(ctx.settings),order=ctx.players.map(p=>p.id);
  if(order.length<(config.mode==='duel'?2:3)||order.length>(config.mode==='duel'?2:4)||new Set(order).size!==order.length)
    throw new Error('Roster must match duel 2 or rotation 3–4');
  const [dealerIndex,rng]=nextInt(seedRng(ctx.seed),0,1);
  const state:State={phase:{id:'upcard',startedAt:ctx.now,deadline:null},phaseClock:ctx.now-1,roomEmpty:false,rng,
    players:Object.fromEntries(ctx.players.map(p=>[p.id,{...p}])),config,order,active:order.slice(0,2),waiting:order.slice(2),left:[],
    scores:Object.fromEntries(order.map(id=>[id,0])),boxes:Object.fromEntries(order.map(id=>[id,0])),wins:Object.fromEntries(order.map(id=>[id,0])),
    dealer:order[dealerIndex],turn:order[1-dealerIndex],hand:0,hands:{},stock:[],discard:[],initialUpcard:0,
    knockLimit:10,multiplier:1,openingPasses:0,mustStock:false,drawnDiscard:null,pending:null,roundResult:null,finished:false,endedEarly:false,publicLog:[]};
  // Presence is already known at initialization; no duplicate player event is
  // needed to drain an absent opening turn or pause an empty room.
  return continueAbsent(deal(state,ctx.now),ctx.now);
}
export function handAward(config:Config,knockerDeadwood:number,defenderDeadwood:number,big=false,multiplier=1):{winner:'knocker'|'defender';points:number;kind:RoundResult['kind']} {
  if(big)return {winner:'knocker',points:(config.bigGinBonus+defenderDeadwood)*multiplier,kind:'bigGin'};
  if(knockerDeadwood===0)return {winner:'knocker',points:(config.ginBonus+defenderDeadwood)*multiplier,kind:'gin'};
  if(defenderDeadwood<=knockerDeadwood)return {winner:'defender',points:(config.undercutBonus+knockerDeadwood-defenderDeadwood)*multiplier,kind:'undercut'};
  return {winner:'knocker',points:(defenderDeadwood-knockerDeadwood)*multiplier,kind:'knock'};
}
export function finalScores(state:State,matchWinner:string|null):Record<string,number> {
  const scores={...state.scores};
  for(const id of state.order)scores[id]+=state.boxes[id]*state.config.boxBonus;
  if(matchWinner!==null) {
    const shutout=state.order.filter(id=>id!==matchWinner).every(id=>state.wins[id]===0);
    scores[matchWinner]+=100;
    if(shutout) {
      if(state.config.shutout==='gameBonus')scores[matchWinner]+=100;
      if(state.config.shutout==='handPoints')scores[matchWinner]+=state.scores[matchWinner];
      if(state.config.shutout==='wholeScore')scores[matchWinner]+=state.scores[matchWinner]+100;
    }
  }
  return scores;
}
function endRound(state:State,now:number,result:RoundResult):State {
  if(result.winner===null)return phase({...state,pending:null,roundResult:result},'round-end',now);
  const id=result.winner,scores={...state.scores,[id]:state.scores[id]+result.points};
  const extras=state.config.variant==='oklahoma'&&state.config.extraBoxes?(result.kind==='undercut'?1:result.kind==='gin'||result.kind==='bigGin'?2:0)*state.multiplier:0;
  const next={...state,pending:null,roundResult:result,scores,boxes:{...state.boxes,[id]:state.boxes[id]+1+extras},wins:{...state.wins,[id]:state.wins[id]+1}};
  return scores[id]>=state.config.target?phase({...next,scores:finalScores(next,id),finished:true},'done',now):phase(next,'round-end',now);
}
function settle(state:State,now:number):State {
  const p=state.pending!;
  const defender=state.active.find(x=>x!==p.knocker)!;
  const defense=optimalDefense(state.hands[defender],p.layout.melds,p.layout.deadwood!==0&&!p.big);
  const award=handAward(state.config,p.layout.deadwood,defense.deadwood,p.big,state.multiplier);
  return endRound(state,now,{...award,winner:award.winner==='knocker'?p.knocker:defender,knocker:p.knocker,
    knockerLayout:p.layout,defenderLayout:defense,hands:Object.fromEntries(state.active.map(id=>[id,[...state.hands[id]]])),multiplier:state.multiplier});
}
function nextHand(state:State,now:number):State {
  if(state.phase.id!=='round-end')return state;
  const winner=state.roundResult?.winner;
  let active=[...state.active],waiting=[...state.waiting],dealer=state.dealer;
  if(winner!==null&&winner!==undefined) {
    const loser=state.active.find(x=>x!==winner)!;
    if(state.config.mode==='rotation') {
      const entrant=waiting.shift()!;waiting.push(loser);active=[winner,entrant];dealer=entrant;
    }else dealer=state.config.dealer==='winner'?winner:state.config.dealer==='loser'?loser:other(state,state.dealer);
  }
  return deal({...state,active,waiting,dealer},now);
}
function phaseInput(state:State,id:string,input:Input,now:number):State {
  if(input.type==='next')return state.phase.id==='round-end'?nextHand(state,now):state;
  if(state.phase.id==='layoff')return input.type==='finishLayoff'&&id===state.turn?settle(state,now):state;
  if(id!==state.turn||!state.active.includes(id))return state;
  if(state.phase.id==='upcard'&&input.type==='pass') {
    const passes=state.openingPasses+1;
    return phase({...appendLog(state,'pass'),turn:other(state),openingPasses:passes,mustStock:passes===2},passes===2?'draw':'upcard',now);
  }
  if((state.phase.id==='upcard'||state.phase.id==='draw')&&input.type==='draw') {
    if(state.phase.id==='upcard'&&input.source!=='discard'||state.mustStock&&input.source!=='stock')return state;
    if(input.source==='stock'&&state.stock.length<=2)return state;
    const card=input.source==='stock'?state.stock[0]:state.discard.at(-1)!;
    if(card===undefined)return state;
    return phase(appendLog({...state,hands:{...state.hands,[id]:[...state.hands[id],card]},
      stock:input.source==='stock'?state.stock.slice(1):state.stock,
      discard:input.source==='discard'?state.discard.slice(0,-1):state.discard,
      drawnDiscard:input.source==='discard'?card:null,mustStock:false},input.source==='discard'?'take-discard':'draw-stock',input.source==='discard'?card:null),'discard',now);
  }
  if(state.phase.id!=='discard')return state;
  if(input.type==='bigGin') {
    if(!state.config.bigGin)return state;
    const layout=minimizeDeadwood(state.hands[id]);
    if(layout.deadwood!==0||state.hands[id].length!==11)return state;
    return settle({...state,pending:{knocker:id,layout,big:true}},now);
  }
  if(input.type!=='discard'||!state.hands[id].includes(input.card)||input.card===state.drawnDiscard)return state;
  const hand=state.hands[id].filter(c=>c!==input.card);
  const layout=input.melds?declaredSolution(hand,input.melds):minimizeDeadwood(hand);
  if(input.knock&&(!layout||layout.deadwood>state.knockLimit))return state;
  const next=appendLog({...state,hands:{...state.hands,[id]:hand},discard:[...state.discard,input.card],drawnDiscard:null},input.knock?'knock':'discard',input.card);
  if(input.knock) {
    const pending={knocker:id,layout:layout!,big:false};
    if(layout!.deadwood===0)return settle({...next,pending},now);
    return phase({...next,pending,turn:other(state)},'layoff',now);
  }
  if(state.stock.length<=2)return endRound(next,now,{kind:'draw',winner:null,points:0,knocker:null,knockerLayout:null,defenderLayout:null,hands:Object.fromEntries(state.active.map(id=>[id,[...next.hands[id]]])),multiplier:state.multiplier});
  return phase({...next,turn:other(state)},'draw',now);
}
function advance(state:State,now:number):State {
  if(state.phase.id==='round-end')return nextHand(state,now);
  if(state.phase.id==='done')return state;
  const automationState={...state,left:state.left.filter(id=>id!==state.turn),
    players:{...state.players,[state.turn]:{...state.players[state.turn],connected:true}}};
  const input=sampleInput(automationState,state.turn,createRng((state.rng.seed+state.rng.step+state.hand)>>>0),'normal');
  return input?phaseInput(state,state.turn,input,now):state;
}
// Local contract adapter: player → speech → VIP → paused → live phase event.
// The application SDK is not shipped in this workshop; its ordered semantics are reproduced here.
function reduceEvent(state:State,event:GameEvent<Input>):State {
  if(!event||typeof event!=='object'||!Number.isFinite(event.now))return state;
  if(event.type==='player') {
    if(typeof event.playerId!=='string'||!Object.hasOwn(state.players,event.playerId)||typeof event.connected!=='boolean'||
      ![undefined,'left','kicked'].includes(event.gone))return state;
    const left=event.gone&&!state.left.includes(event.playerId)?[...state.left,event.playerId]:state.left;
    return {...state,left,players:{...state.players,[event.playerId]:{...state.players[event.playerId],connected:event.connected&&!left.includes(event.playerId)}}};
  }
  if(event.type==='speech'||event.type==='speechStart')return state;
  if(event.type==='vip') {
    if(event.action==='end')return state.finished?state:phase({...state,finished:true,endedEarly:true},'done',event.now);
    if(event.action==='pause')return state.finished||state.phase.paused?state:{...state,phase:{...state.phase,paused:{at:event.now}}};
    if(event.action==='resume') {
      if(!state.phase.paused)return state;
      const delta=Math.max(0,event.now-state.phase.paused.at);
      const resumed={...state,phase:{id:state.phase.id,startedAt:state.phase.startedAt,deadline:state.phase.deadline===null?null:state.phase.deadline+delta}};
      return resumed;
    }
    return event.action!=='skip'||state.phase.paused?state:advance(state,event.now);
  }
  if(state.phase.paused||state.finished)return state;
  if(event.type==='timer')return event.phaseId===state.phase.id&&event.startedAt===state.phase.startedAt&&state.phase.deadline!==null&&event.now>=state.phase.deadline?advance(state,event.now):state;
  if(event.type==='input') {
    if(typeof event.playerId!=='string'||!Object.hasOwn(state.players,event.playerId)||state.left.includes(event.playerId)||!state.players[event.playerId].connected)return state;
    const parsed=inputSchema.safeParse(event.input);
    return parsed.success?phaseInput(state,event.playerId,parsed.data,event.now):state;
  }
  return state;
}
function available(state:State,id:string):boolean {
  return state.players[id].connected&&!state.left.includes(id);
}
function continueAbsent(state:State,now:number):State {
  if(state.finished)return state;
  const occupied=state.order.some(id=>available(state,id));
  if(!occupied)return state.phase.paused?state:{...state,roomEmpty:true,phase:{...state.phase,paused:{at:now}}};
  let next=state;
  if(next.roomEmpty){
    const delta=next.phase.paused?Math.max(0,now-next.phase.paused.at):0;
    next={...next,roomEmpty:false,phase:{id:next.phase.id,startedAt:next.phase.startedAt,
      deadline:next.phase.deadline===null?null:next.phase.deadline+delta}};
  }
  if(next.phase.paused)return next;
  // A normal bot strictly reduces deadwood on a discard pickup. A stock draw
  // raises it by at most ten; at most 29 such draws remain. Even two absent
  // active seats reach the hand reveal within 2*(200+29*10+29)+2 transitions.
  for(let steps=0;steps<2048&&next.phase.id!=='round-end'&&!next.finished&&!available(next,next.turn);steps++){
    const advanced=advance(next,now);if(advanced===next)return next;next=advanced;
  }
  return next;
}
export function reduce(state:State,event:GameEvent<Input>):State {
  const next=reduceEvent(state,event);
  return next===state?state:continueAbsent(next,event.now);
}
function legal(state:State,id:string):Input[] {
  if(state.finished||state.phase.paused||typeof id!=='string'||!Object.hasOwn(state.players,id)||!available(state,id))return [];
  if(state.phase.id==='round-end')return [{type:'next'}];
  if(id!==state.turn)return [];
  if(state.phase.id==='upcard')return [{type:'pass'},{type:'draw',source:'discard'}];
  if(state.phase.id==='draw')return state.mustStock?[{type:'draw',source:'stock'}]:[{type:'draw',source:'stock'},...(state.discard.length?[{type:'draw' as const,source:'discard' as const}]:[])];
  if(state.phase.id==='layoff')return [{type:'finishLayoff'}];
  if(state.phase.id==='discard')return discardSolutions(state.hands[id]).filter(x=>x.card!==state.drawnDiscard).flatMap(({card,solution})=>{
    const choices:Input[]=[{type:'discard',card}];
    if(solution.deadwood<=state.knockLimit)choices.push({type:'discard',card,knock:true});
    return choices;
  });
  return [];
}
export function tvView(state:State):PublicView {
  const revealed=['layoff','round-end','done'].includes(state.phase.id);
  return {gameId:manifest.id,phaseId:state.phase.id,deadline:state.phase.deadline,paused:!!state.phase.paused,
    players:state.order.map(id=>({id,name:state.players[id].name,avatarId:state.players[id].avatarId,connected:state.players[id].connected,
      status:id===state.turn&&!state.finished?'active':'waiting',score:state.scores[id]})),
    hand:state.hand,active:[...state.active],waiting:[...state.waiting],turn:state.turn,dealer:state.dealer,
    stockCount:state.stock.length,discard:[...state.discard],knockLimit:state.knockLimit,multiplier:state.multiplier,
    scores:{...state.scores},boxes:{...state.boxes},target:state.config.target,
    roundResult:state.roundResult?structuredClone(state.roundResult):state.pending&&revealed?{
      kind:'knock',winner:null,points:0,knocker:state.pending.knocker,knockerLayout:structuredClone(state.pending.layout),defenderLayout:null,
      hands:Object.fromEntries(state.active.map(id=>[id,[...state.hands[id]]])),multiplier:state.multiplier}:null,
    log:state.publicLog.map(x=>({...x}))};
}
export function controllerView(state:State,id:string):PrivateView {
  const player=typeof id==='string'&&Object.hasOwn(state.players,id),hand=player&&available(state,id)&&state.active.includes(id)?state.hands[id]:[];
  return {...tvView(state),me:{id:typeof id==='string'?id:'',role:player?'player':'spectator'},handCards:[...hand],
    deadwood:hand.length?minimizeDeadwood(hand).deadwood:null,legal:legal(state,id),
    canBigGin:state.phase.id==='discard'&&id===state.turn&&state.config.bigGin&&hand.length===11&&minimizeDeadwood(hand).deadwood===0,
    forbiddenDiscard:id===state.turn?state.drawnDiscard:null,
    config:{...state.config}};
}
export function results(state:State):GameResults|null {
  if(!state.finished)return null;
  const targetWinner=state.endedEarly?null:state.roundResult?.winner??null;
  const ranking=state.order.map(playerId=>({playerId,score:state.scores[playerId],rank:targetWinner===null?
    1+state.order.filter(id=>state.scores[id]>state.scores[playerId]).length:playerId===targetWinner?1:
    2+state.order.filter(id=>id!==targetWinner&&state.scores[id]>state.scores[playerId]).length})).sort((a,b)=>a.rank-b.rank);
  return {scores:{...state.scores},ranking,winnerIds:targetWinner===null?ranking.filter(x=>x.rank===1).map(x=>x.playerId):[targetWinner],awards:[],
    headline:state.endedEarly?'Match ended early':'Gin match complete',
    headlineNote:state.endedEarly?'Current hand-point standings; no end-of-match bonuses.':`First to ${state.config.target} hand points wins; final points include earned game and line bonuses.`,
    placeLines:targetWinner===null?{}:Object.fromEntries(state.order.map(id=>[id,id===targetWinner?'Reached the hand-point target first.':'Final points include line bonuses; the winner reached the hand-point target first.'])),
    detail:{handPointTarget:state.config.target,targetWinner}};
}
// Strategy reads only the controller observation: no stock order, opponent hand or state RNG.
export function sampleInput(state:State,id:string,rng:Rng,skill:BotSkill='normal'):Input|null {
  const v=controllerView(state,id);
  if(!v.legal.length)return null;
  if(v.canBigGin)return {type:'bigGin'};
  if(v.phaseId==='round-end')return {type:'next'};
  if(v.phaseId==='layoff')return {type:'finishLayoff'};
  const hand=v.handCards;
  if(v.phaseId==='upcard'||v.phaseId==='draw') {
    if(v.legal.length===1)return v.legal[0];
    const top=v.discard.at(-1);
    const currentDeadwood=minimizeDeadwood(hand).deadwood;
    const candidate=top!==undefined?bestDiscard([...hand,top],top,v,skill):null;
    // A zero-deadwood hand cannot improve numerically, but a legal pickup that
    // preserves zero can end the hand immediately (including enabled Big Gin).
    if(currentDeadwood===0&&candidate?.deadwood===0)return {type:'draw',source:'discard'};
    const helped=candidate!==null&&candidate.deadwood<currentDeadwood;
    if(skill==='easy')return helped&&rng.chance(.7)?{type:'draw',source:'discard'}:v.phaseId==='upcard'?{type:'pass'}:{type:'draw',source:'stock'};
    return helped?{type:'draw',source:'discard'}:v.phaseId==='upcard'?{type:'pass'}:{type:'draw',source:'stock'};
  }
  if(skill==='easy') {
    const discards=v.legal.filter((x):x is Extract<Input,{type:'discard'}>=>x.type==='discard'&&!x.knock);
    const best=bestDiscard(hand,v.forbiddenDiscard,v,'normal');
    if(best.deadwood<=v.knockLimit)return {type:'discard',card:best.card,knock:true};
    const loose=minimizeDeadwood(hand).loose.filter(c=>c!==v.forbiddenDiscard);
    const candidates=discards.filter(x=>loose.includes(x.card));
    if(!candidates.length)return rng.pick(discards);
    if(rng.chance(.35))return rng.pick(candidates);
    return candidates.reduce((a,b)=>value(a.card)>=value(b.card)?a:b);
  }
  const best=bestDiscard(hand,v.forbiddenDiscard,v,skill);
  return {type:'discard',card:best.card,...(best.deadwood<=v.knockLimit?{knock:true}:{})};
}
function bestDiscard(hand:Card[],forbidden:Card|null,v:PrivateView,skill:BotSkill):{card:Card;deadwood:number} {
  let best={card:hand.find(c=>c!==forbidden)!,deadwood:999},bestScore=Infinity;
  const choices=discardSolutions(hand);
  for(const {card,solution} of choices)if(card!==forbidden) {
    let score=solution.deadwood;
    if(skill==='sharp') {
      let potential=0;
      for(let i=0;i<solution.loose.length;i++)for(let j=i+1;j<solution.loose.length;j++) {
        const a=solution.loose[i],b=solution.loose[j];
        if(rank(a)===rank(b))potential+=Math.min(value(a),7)*.3;
        else if(suit(a)===suit(b)&&Math.abs(rank(a)-rank(b))<=2)potential+=Math.abs(rank(a)-rank(b))===1?2:1;
      }
      const opponent=v.active.find(x=>x!==v.me.id);
      const pickups=v.log.filter(x=>x.player===opponent&&x.action==='take-discard'&&x.card!==null).map(x=>x.card!);
      const danger=pickups.some(c=>rank(c)===rank(card)||suit(c)===suit(card)&&Math.abs(rank(c)-rank(card))<=2)?2.5:0;
      score-=potential;score+=danger;
    }
    // A legal knock/GIN always outranks a non-knocking heuristic alternative.
    if(solution.deadwood<=v.knockLimit)score-=1000;
    score-=value(card)*.001;
    // Gin ends the hand with a positive bonus and no layoffs; public discard
    // danger cannot make an ordinary knock score better against that defender.
    const gin=solution.deadwood===0,bestGin=best.deadwood===0;
    if(gin&&!bestGin||gin===bestGin&&score<bestScore){bestScore=score;best={card,deadwood:solution.deadwood};}
  }
  if(skill==='sharp'&&v.phaseId==='discard'&&best.deadwood>0&&best.deadwood<=v.knockLimit) {
    // A meld with no possible first layoff outside our eleven known cards
    // cannot ever accept a defender card. Ignore those closed targets only;
    // identical remaining targets give every defender identical layoff options.
    // Lower deadwood then strictly improves the finishing score.
    const outside=Array.from({length:52},(_,card)=>card).filter(card=>!hand.includes(card));
    const meldKey=(melds:Card[][])=>melds.filter(m=>outside.some(card=>validMeld([...m,card])))
      .map(m=>[...m].sort((a,b)=>a-b).join(',')).sort().join(';');
    const key=meldKey(choices.find(x=>x.card===best.card)!.solution.melds);
    for(const {card,solution} of choices)if(card!==forbidden&&solution.deadwood>0&&solution.deadwood<best.deadwood&&meldKey(solution.melds)===key)
      best={card,deadwood:solution.deadwood};
  }
  return best;
}
export const game:GameDefinition<State,Input,PublicView,PrivateView>={manifest,phases:['upcard','draw','discard','layoff','round-end','done'],inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput}};
