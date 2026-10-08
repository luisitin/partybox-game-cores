import {z} from 'zod';
import type {GameDefinition,GameStateBase,GameManifest,InitContext,GameEvent,TvView,ControllerView,GameResults} from '../../contract/contract.ts';
import {seedRng,nextInt,shuffle} from '../../contract/rng.ts';
import {deck,legalCards,winningPlay,suit,type Play} from './cards.ts';
import {scoreSide,type Bid,type ScoreResult} from './scoring.ts';
import {fromView} from './bots.ts';
export const inputSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('look')}).strict(),z.object({type:z.literal('blind-nil')}).strict(),
 z.object({type:z.literal('bid'),value:z.number().int().min(1).max(17)}).strict(),z.object({type:z.literal('nil')}).strict(),
 z.object({type:z.literal('exchange'),cards:z.array(z.number().int().min(0).max(51)).length(2)}).strict(),
 z.object({type:z.literal('play'),card:z.number().int().min(0).max(51)}).strict(),z.object({type:z.literal('next')}).strict()
]);
export type Input=z.infer<typeof inputSchema>;
export type Phase='blind'|'bid'|'exchange'|'play'|'trick'|'hand'|'done';
export interface Settings {mode:'partnership'|'cutthroat';blind:boolean;blindGap:number;exchange:boolean;nilValue:number;failedNilCounts:boolean;mercy:boolean;cutDeck:'low-club'|'stock';cutLead:'dealer'|'club';}
export interface Route {from:string;to:string;}
export interface Trick {number:number;cards:Play[];winner:string;}
export interface HandReport {hand:number;bids:Record<string,Bid>;won:Record<string,number>;sides:ScoreResult[];before:number[];}
export interface State extends GameStateBase {
 seats:string[];left:string[];settings:Settings;dealer:number;turn:number;handNumber:number;trickNumber:number;
 hands:Record<string,number[]>;stock:number|null;bids:Record<string,Bid>;looked:string[];won:Record<string,number>;
 scores:number[];bags:number[];trick:Play[];completed:Trick[];broken:boolean;forcedLead:number|null;
 exchangePlan:Route[];exchangeStep:number;report:HandReport|null;history:HandReport[];doneReason:'target'|'mercy'|'host'|null;
}
export interface PublicView extends TvView {
 mode:Settings['mode'];handNumber:number;trickNumber:number;tricksPerHand:number;dealer:string;turn:string|null;
 sides:{ids:string[];score:number;bags:number}[];bids:Record<string,Bid>;won:Record<string,number>;handCounts:Record<string,number>;
 trick:Play[];completed:Trick[];broken:boolean;forcedLead:number|null;exchange:Route|null;report:HandReport|null;
 target:number;nilValue:number;doneReason:State['doneReason'];settings:Settings;
}
export interface PhoneView extends PublicView,ControllerView {hand:number[];legal:number[];inputType:'blind'|'bid'|'exchange'|'play'|'next'|null;blindEligible:boolean;partner:string|null;}
export const manifest:GameManifest={id:'spades',name:'Spades',icon:'♠️',tagline:'Make your bid. Protect your partner. Watch the bags.',description:'Classic 500-point partnership Spades or three-player Cutthroat, with nil, blind nil, optional two-card exchange and accumulated bags.',howToPlay:['Declare how many tricks you will take; nil promises none.','Follow the lead suit; spades always trump and the winner leads.','Meet contracts, protect nils and avoid ten bags. First to 500 wins.'],version:'0.1.0',minPlayers:3,maxPlayers:4,playerCounts:{setting:'mode',default:[4,4],overrides:{cutthroat:[3,3]}},estimatedMinutes:60,unlimitedDuration:true,tags:['classic','strategy','teams'],presence:{needs:'anywhere'},addedOn:'2026-10-08',supportsBots:true,saveable:true,settings:[
 {key:'mode',label:'Table',type:'select',default:'partnership',options:[{value:'partnership',label:'Partnership — four players'},{value:'cutthroat',label:'Cutthroat — three players'}]},
 {key:'blind',label:'Allow blind nil',type:'boolean',default:true},
 {key:'blindGap',label:'Blind nil deficit',type:'select',default:'100',options:[{value:'100',label:'At least 100 behind'},{value:'0',label:'Any score'}]},
 {key:'exchange',label:'Blind nil two-card exchange',type:'boolean',default:true},
 {key:'nilValue',label:'Nil bonus',type:'select',default:'100',options:[{value:'100',label:'100 / blind 200'},{value:'50',label:'50 / blind 100'}]},
 {key:'failedNilCounts',label:'Failed nil tricks help the contract',type:'boolean',default:false},
 {key:'mercy',label:'End if a side reaches −500',type:'boolean',default:true},
 {key:'cutDeck',label:'Cutthroat deck',type:'select',default:'low-club',options:[{value:'low-club',label:'Remove 2♣'},{value:'stock',label:'One unseen undealt card'}]},
 {key:'cutLead',label:'Cutthroat first lead',type:'select',default:'dealer',options:[{value:'dealer',label:'Dealer’s left'},{value:'club',label:'Lowest club holder'}]}
]};
const clone=<T>(value:T):T=>structuredClone(value);
export const sideOf=(s:Pick<State,'seats'>,id:string)=>s.seats.length===4?s.seats.indexOf(id)%2:s.seats.indexOf(id);
const member=(s:State,id:string)=>typeof id==='string'&&Object.hasOwn(s.players,id)&&s.seats.includes(id);
const eligible=(s:State,id:string)=>member(s,id)&&s.players[id]!.connected&&!s.left.includes(id);
const actor=(s:State)=>s.phase.id==='exchange'?s.exchangePlan[s.exchangeStep]?.from??null:['blind','bid','play'].includes(s.phase.id)?s.seats[s.turn]!:null;
export function blindEligible(s:State,id:string):boolean{const side=sideOf(s,id);return member(s,id)&&s.settings.blind&&s.scores[side]!<=Math.max(...s.scores.filter((_,i)=>i!==side))-s.settings.blindGap;}
function enter(s:State,id:Phase,now:number):State{const startedAt=Math.max(now,s.phase.startedAt+1);return {...s,phase:{id,startedAt,deadline:id==='trick'?startedAt+8000:id==='hand'?startedAt+(s.seats.length===3?90000:60000):null}};}
function bidTurn(s:State,now:number):State{
 const id=s.seats[s.turn]!;return blindEligible(s,id)?enter(s,'blind',now):enter({...s,looked:[...s.looked,id]},'bid',now);
}
function deal(s:State,now:number):State{
 const base=s.seats.length===3&&s.settings.cutDeck==='low-club'?deck.filter(c=>c!==0):deck;
 const [cards,rng]=shuffle(s.rng,base),count=s.seats.length===4?13:17,hands=Object.fromEntries(s.seats.map(id=>[id,[] as number[]]));
 for(let i=0;i<count*s.seats.length;i++)hands[s.seats[(s.dealer+1+i)%s.seats.length]!]!.push(cards[i]!);
 for(const hand of Object.values(hands))hand.sort((a,b)=>a-b);
 return bidTurn({...s,rng,hands,stock:cards[count*s.seats.length]??null,bids:{},looked:[],won:Object.fromEntries(s.seats.map(id=>[id,0])),turn:(s.dealer+1)%s.seats.length,trickNumber:1,trick:[],completed:[],broken:false,forcedLead:null,exchangePlan:[],exchangeStep:0},now);
}
export function init(ctx:InitContext):State{
 const seats=ctx.players.map(p=>p.id),mode=ctx.settings.mode==='cutthroat'?'cutthroat':ctx.settings.mode==='partnership'?'partnership':seats.length===3?'cutthroat':'partnership';
 if(new Set(seats).size!==seats.length||seats.length!==(mode==='partnership'?4:3))throw new Error('Spades requires four partners or three Cutthroat players');
 const bool=(key:string,fallback:boolean)=>typeof ctx.settings[key]==='boolean'?ctx.settings[key] as boolean:fallback;
 const settings:Settings={mode,blind:bool('blind',true),blindGap:Number(ctx.settings.blindGap)===0?0:100,exchange:bool('exchange',true),nilValue:Number(ctx.settings.nilValue)===50?50:100,failedNilCounts:bool('failedNilCounts',false),mercy:bool('mercy',true),cutDeck:ctx.settings.cutDeck==='stock'?'stock':'low-club',cutLead:ctx.settings.cutLead==='club'?'club':'dealer'};
 const [dealer,rng]=nextInt(seedRng(ctx.seed),0,seats.length-1),sides=seats.length===4?2:3;
 return settleAbsent(deal({players:Object.fromEntries(ctx.players.map(p=>[p.id,{...p}])),seats,left:[],settings,dealer,turn:0,handNumber:1,trickNumber:1,hands:{},stock:null,bids:{},looked:[],won:{},scores:Array(sides).fill(0),bags:Array(sides).fill(0),trick:[],completed:[],broken:false,forcedLead:null,exchangePlan:[],exchangeStep:0,report:null,history:[],doneReason:null,rng,phase:{id:'bid',startedAt:ctx.now-1,deadline:null}},ctx.now),ctx.now);
}
function beginPlay(s:State,now:number):State{
 let turn=(s.dealer+1)%s.seats.length,forcedLead:number|null=null;
 if(s.seats.length===3&&s.settings.cutLead==='club'){
  forcedLead=Math.min(...Object.values(s.hands).flat().filter(c=>suit(c)===0));turn=s.seats.findIndex(id=>s.hands[id]!.includes(forcedLead!));
 }
 return enter({...s,turn,forcedLead},'play',now);
}
function finishBids(s:State,now:number):State{
 const plan:Route[]=[],paired=new Set<number>();
 if(s.seats.length===4&&s.settings.exchange)for(let i=1;i<=4;i++){
  const id=s.seats[(s.dealer+i)%4]!,side=sideOf(s,id);
  if(s.bids[id]!.kind==='blind'&&!paired.has(side)){const to=s.seats[(s.seats.indexOf(id)+2)%4]!;plan.push({from:id,to},{from:to,to:id});paired.add(side);}
 }
 const n={...s,looked:[...s.seats],exchangePlan:plan,exchangeStep:0};return plan.length?enter(n,'exchange',now):beginPlay(n,now);
}
function submitBid(s:State,bid:Bid,now:number):State{
 const id=s.seats[s.turn]!,bids={...s.bids,[id]:bid},n={...s,bids,looked:s.looked.includes(id)?s.looked:[...s.looked,id]};
 return Object.keys(bids).length===s.seats.length?finishBids(n,now):bidTurn({...n,turn:(s.turn+1)%s.seats.length},now);
}
function finishHand(s:State,now:number):State{
 const sides=s.scores.map((before,side)=>scoreSide(s.seats.filter(id=>sideOf(s,id)===side).map(id=>({bid:s.bids[id]!,won:s.won[id]!})),before,s.bags[side]!,s.settings.nilValue,s.settings.failedNilCounts));
 const report:HandReport={hand:s.handNumber,bids:clone(s.bids),won:{...s.won},sides,before:[...s.scores]};
 return enter({...s,scores:sides.map(r=>r.score),bags:sides.map(r=>r.bags),report,history:[...s.history,report].slice(-4)},'hand',now);
}
function afterTrick(s:State,now:number):State{return s.completed.length===(s.seats.length===4?13:17)?finishHand(s,now):enter({...s,trick:[],turn:s.seats.indexOf(s.completed.at(-1)!.winner),trickNumber:s.trickNumber+1,forcedLead:null},'play',now);}
function afterHand(s:State,now:number):State{
 const high=Math.max(...s.scores),leaders=s.scores.filter(n=>n===high).length,target=high>=500,mercy=s.settings.mercy&&Math.min(...s.scores)<=-500;
 if(leaders===1&&(target||mercy))return enter({...s,doneReason:target?'target':'mercy'},'done',now);
 return deal({...s,dealer:(s.dealer+1)%s.seats.length,handNumber:s.handNumber+1},now);
}
function apply(s:State,id:string,input:Input,now:number):State{
 const current=actor(s);
 if(input.type==='next')return s.phase.id==='trick'?afterTrick(s,now):s.phase.id==='hand'?afterHand(s,now):s;
 if(current!==id)return s;
 if(input.type==='look')return s.phase.id==='blind'?enter({...s,looked:[...s.looked,id]},'bid',now):s;
 if(input.type==='blind-nil')return s.phase.id==='blind'&&blindEligible(s,id)&&!s.looked.includes(id)?submitBid(s,{kind:'blind',value:0},now):s;
 if(input.type==='nil')return s.phase.id==='bid'?submitBid(s,{kind:'nil',value:0},now):s;
 if(input.type==='bid')return s.phase.id==='bid'&&input.value<=(s.seats.length===4?13:17)?submitBid(s,{kind:'number',value:input.value},now):s;
 if(input.type==='exchange'){
  if(s.phase.id!=='exchange'||new Set(input.cards).size!==2||!input.cards.every(c=>s.hands[id]!.includes(c)))return s;
  const route=s.exchangePlan[s.exchangeStep]!,hands={...s.hands,[id]:s.hands[id]!.filter(c=>!input.cards.includes(c)),[route.to]:[...s.hands[route.to]!,...input.cards].sort((a,b)=>a-b)},n={...s,hands,exchangeStep:s.exchangeStep+1};
  return n.exchangeStep===n.exchangePlan.length?beginPlay(n,now):enter(n,'exchange',now);
 }
 if(input.type==='play'){
  if(s.phase.id!=='play'||!legalCards(s.hands[id]!,s.trick,s.broken,s.forcedLead).includes(input.card))return s;
  const hands={...s.hands,[id]:s.hands[id]!.filter(c=>c!==input.card)},trick=[...s.trick,{playerId:id,card:input.card}],broken=s.broken||suit(input.card)===3,n={...s,hands,trick,broken,forcedLead:null};
  if(trick.length<s.seats.length)return enter({...n,turn:(s.turn+1)%s.seats.length},'play',now);
  const winner=winningPlay(trick)!.playerId;return enter({...n,won:{...s.won,[winner]:s.won[winner]!+1},completed:[...s.completed,{number:s.trickNumber,cards:trick.map(p=>({...p})),winner}]},'trick',now);
 }
 return s;
}
function automatic(s:State,now:number):State{
 const id=actor(s);if(s.phase.id==='trick')return afterTrick(s,now);if(s.phase.id==='hand')return afterHand(s,now);if(!id)return s;
 const input:Input=s.phase.id==='blind'?{type:'look'}:s.phase.id==='bid'?{type:'bid',value:1}:s.phase.id==='exchange'?{type:'exchange',cards:s.hands[id]!.slice(0,2)}:{type:'play',card:legalCards(s.hands[id]!,s.trick,s.broken,s.forcedLead)[0]!};
 return apply(s,id,input,now);
}
function settleAbsent(s:State,now:number):State{
 if(s.phase.paused||!s.seats.some(id=>eligible(s,id)))return s;
 for(let i=0;i<16;i++){const id=actor(s);if(!id||eligible(s,id))return s;const next=automatic(s,now);if(next===s)return s;s=next;}
 return s;
}
export function reduce(s:State,event:GameEvent<Input>):State{
 if(!event||typeof event!=='object'||!Number.isFinite(event.now))return s;let n=s;
 if(event.type==='player'){
  if(!member(s,event.playerId)||typeof event.connected!=='boolean'||(event.gone!==undefined&&!['left','kicked'].includes(event.gone)))return s;
  const left=event.gone&&!s.left.includes(event.playerId)?[...s.left,event.playerId]:s.left;
  n={...s,left,players:{...s.players,[event.playerId]:{...s.players[event.playerId]!,connected:event.connected&&!left.includes(event.playerId)}}};
 }else if(event.type==='vip'){
  if(event.action==='end')return s.phase.id==='done'?s:enter({...s,doneReason:'host'},'done',event.now);
  if(event.action==='pause')return s.phase.paused||s.phase.id==='done'?s:{...s,phase:{...s.phase,paused:{at:event.now}}};
  if(event.action==='resume'){
   if(!s.phase.paused||event.now<s.phase.paused.at)return s;const {paused,...phase}=s.phase;
   n={...s,phase:{...phase,deadline:phase.deadline===null?null:phase.deadline+event.now-paused.at}};
  }else if(event.action==='skip')n=s.phase.paused||s.phase.id==='done'?s:automatic(s,event.now);else return s;
 }else{
  if(s.phase.paused||s.phase.id==='done')return s;
  if(event.type==='timer')n=event.phaseId===s.phase.id&&event.startedAt===s.phase.startedAt&&s.phase.deadline!==null&&event.now>=s.phase.deadline?automatic(s,event.now):s;
  else if(event.type==='input'){
   if(!eligible(s,event.playerId))return s;const parsed=inputSchema.safeParse(event.input);if(!parsed.success)return s;n=apply(s,event.playerId,parsed.data,event.now);
  }else return s;
 }
 return n===s?s:settleAbsent(n,event.now);
}
export function tvView(s:State):PublicView{
 const turn=actor(s);return {gameId:manifest.id,phaseId:s.phase.id,deadline:s.phase.deadline,paused:!!s.phase.paused,players:s.seats.map(id=>({...s.players[id]!,score:s.scores[sideOf(s,id)]!,status:id===turn?'active':'waiting'})),mode:s.settings.mode,handNumber:s.handNumber,trickNumber:s.trickNumber,tricksPerHand:s.seats.length===4?13:17,dealer:s.seats[s.dealer]!,turn,sides:s.scores.map((score,i)=>({ids:s.seats.filter(id=>sideOf(s,id)===i),score,bags:s.bags[i]!})),bids:clone(s.bids),won:{...s.won},handCounts:Object.fromEntries(s.seats.map(id=>[id,s.hands[id]!.length])),trick:s.trick.map(p=>({...p})),completed:clone(s.completed),broken:s.broken,forcedLead:s.forcedLead,exchange:s.phase.id==='exchange'?{...s.exchangePlan[s.exchangeStep]!}:null,report:s.report?clone(s.report):null,target:500,nilValue:s.settings.nilValue,doneReason:s.doneReason,settings:{...s.settings}};
}
export function controllerView(s:State,id:string):PhoneView{
 const playing=member(s,id),can=eligible(s,id)&&!s.phase.paused,current=actor(s),own=playing&&s.looked.includes(id)?[...s.hands[id]!]:[];
 const inputType=can?(current===id?(['blind','bid','exchange','play'].includes(s.phase.id)?s.phase.id as PhoneView['inputType']:null):s.phase.id==='trick'||s.phase.id==='hand'?'next':null):null;
 return {...tvView(s),me:{id,role:playing?'player':'spectator'},hand:own,legal:inputType==='play'?legalCards(own,s.trick,s.broken,s.forcedLead):[],inputType,blindEligible:playing&&!s.looked.includes(id)&&blindEligible(s,id),partner:playing&&s.seats.length===4?s.seats[(s.seats.indexOf(id)+2)%4]!:null};
}
export function results(s:State):GameResults|null{
 if(s.phase.id!=='done')return null;const scores=Object.fromEntries(s.seats.map(id=>[id,s.scores[sideOf(s,id)]!])),high=Math.max(...s.scores);
 return {scores,ranking:s.seats.map(playerId=>({playerId,score:scores[playerId]!,rank:1+s.seats.filter(id=>scores[id]!>scores[playerId]!).length})),winnerIds:s.seats.filter(id=>scores[id]===high),awards:[],headline:s.doneReason==='host'?'Match ended by the host':s.doneReason==='mercy'?'A side reached −500':'500-point match complete'};
}
export const game:GameDefinition<State,Input,PublicView,PhoneView>={manifest,phases:['blind','bid','exchange','play','trick','hand','done'],inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput(s,id,rng,skill){
 if(!eligible(s,id)||s.phase.paused||!['blind','bid','exchange','play'].includes(s.phase.id)||actor(s)!==id)return null;
 return fromView(controllerView(s,id),rng,skill);
}}};
