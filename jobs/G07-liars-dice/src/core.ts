import {z} from 'zod';
import type {GameDefinition,GameEvent,InitContext,GameStateBase,GameResults,TvView,ControllerView,GameManifest} from '../../../contract/contract';
import type {BotSkill} from '../../../contract/constants';
import {seedRng,nextInt,createRng,hashString} from '../../../contract/rng';
import type {Rng} from '../../../contract/rng';
import {bidProbability,probability} from './probability';
import type {Probability} from './probability';
import {isRaise,countMatches} from './rules';
export {createRng};

export const inputSchema=z.discriminatedUnion('type',[
  z.object({type:z.literal('bid'),quantity:z.number().int().min(1).max(1_000_000),face:z.number().int().min(1).max(6)}).strict(),
  z.object({type:z.literal('dudo')}).strict(),
  z.object({type:z.literal('calza')}).strict(),
  z.object({type:z.literal('continue')}).strict(),
]);
export type Input=z.infer<typeof inputSchema>;
export interface Bid {quantity:number;face:number;playerId:string}
export interface Config {
  onesWild:boolean;palificoEnabled:boolean;palificoExemption:'none'|'oneDie'|'experienced';
  calzaEnabled:boolean;calzaPolicy:'anyOther'|'interruptOnly';turnSeconds:number;
}
export interface Reveal {
  kind:'dudo'|'calza';caller:string;bid:Bid;matches:number;correct:boolean;
  loser:string|null;gained:boolean;dice:Record<string,number[]>;
}
export interface Model {truth:number;false:number}
export interface State extends GameStateBase {
  phaseClock:number;order:string[];settings:Config;cups:Record<string,number[]>;
  diceCount:Record<string,number>;turn:string;round:number;bid:Bid|null;bidLog:Bid[];
  palifico:boolean;palificoStarter:string|null;seenPalifico:Record<string,boolean>;
  nextStarter:string;nextPalifico:string|null;reveal:Reveal|null;eliminated:string[];
  left:string[];models:Record<string,Model>;autoPaused:boolean;
  winner:string|null;endReason:string|null;contentLang:'en'|'es';phoneOnly:boolean;
}
export interface PublicView extends TvView {
  round:number;turn:string;bid:Bid|null;bidLog:Bid[];diceCount:Record<string,number>;
  totalDice:number;palifico:boolean;wild:boolean;settings:Config;reveal:Reveal|null;
  winner:string|null;endReason:string|null;
}
export interface PrivateView extends ControllerView,PublicView {
  ownDice:number[];legalBids:{quantity:number;face:number}[];
  canBid:boolean;canDudo:boolean;canCalza:boolean;canContinue:boolean;odds:Probability|null;
}
const select=(key:string,label:string,options:{value:string;label:string}[],fallback:string)=>
  ({key,label,type:'select' as const,default:fallback,options});
export const manifest:GameManifest={
  id:'liars-dice',name:"Liar's Dice",icon:'🎲',tagline:'Raise the bid. Read the bluff. Keep your dice.',
  description:'Private-cup Perudo for 2–8 players, wild ones, palifico and optional calza. Exact-odds bots with learned bluff tendencies.',
  howToPlay:['Look at your cup; bid how many of a face exist across all cups.',
    'Raise the bid, or call dudo if you think it is too high.',
    'A failed bid or challenge costs a die. The last player with dice wins.'],
  version:'1.0.0',minPlayers:2,maxPlayers:8,estimatedMinutes:15,unlimitedDuration:true,
  tags:['classic','strategy'],presence:{needs:'same-room'},addedOn:'2026-10-08',
  supportsBots:true,saveable:true,noCards:true,
  settings:[
    {key:'onesWild',label:'Ones are wild',type:'boolean',default:true},
    {key:'palificoEnabled',label:'Palifico at one die',type:'boolean',default:true},
    select('palificoExemption','Palifico face-change exception',[
      {value:'none',label:'Nobody (strict)'},{value:'oneDie',label:'Experienced one-die players'},
      {value:'experienced',label:'Any experienced player'}],'none'),
    {key:'calzaEnabled',label:'Allow exact-count calza',type:'boolean',default:false},
    select('calzaPolicy','Who may call calza',[
      {value:'anyOther',label:'Anyone except bidder'},{value:'interruptOnly',label:'Neither bidder nor next player'}],'anyOther'),
    {key:'turnSeconds',label:'Turn clock (0 is off)',type:'number',default:0,min:0,max:120,step:1},
  ],
};

export function configuration(settings:InitContext['settings']):Config {
  const b=(key:string,fallback:boolean)=>typeof settings[key]==='boolean'?settings[key] as boolean:fallback;
  const exemption=settings.palificoExemption;
  const seconds=settings.turnSeconds;
  return {onesWild:b('onesWild',true),palificoEnabled:b('palificoEnabled',true),
    palificoExemption:exemption==='oneDie'||exemption==='experienced'?exemption:'none',
    calzaEnabled:b('calzaEnabled',false),calzaPolicy:settings.calzaPolicy==='interruptOnly'?'interruptOnly':'anyOther',
    turnSeconds:typeof seconds==='number'&&Number.isFinite(seconds)?Math.max(0,Math.min(120,Math.round(seconds))):0};
}
const known=(s:State,id:unknown):id is string=>typeof id==='string'&&Object.hasOwn(s.players,id)&&s.order.includes(id);
const present=(s:State,id:string)=>known(s,id)&&s.players[id].connected&&!s.left.includes(id);
const alive=(s:State)=>s.order.filter(id=>s.diceCount[id]>0);
const occupied=(s:State)=>s.order.some(id=>present(s,id));
// Host milliseconds may be fractional, but must permit distinct phase stamps
// and finite clock shifts. Normal Unix and local-browser times fit comfortably.
const validTime=(now:number)=>Number.isFinite(now)&&now>=0&&now<=1e15&&!Object.is(now,-0);
export const effectiveWild=(s:State)=>s.settings.onesWild&&!s.palifico;
const totalDice=(s:State)=>s.order.reduce((n,id)=>n+s.diceCount[id],0);

function enterPhase(s:State,id:string,now:number):State {
  const startedAt=Math.max(now,s.phaseClock+1);
  return {...s,phaseClock:startedAt,phase:{id,startedAt,
    deadline:id==='bid'&&s.settings.turnSeconds>0?now+s.settings.turnSeconds*1000:null}};
}
function nextAlive(s:State,after:string):string {
  const start=s.order.indexOf(after);
  for(let i=1;i<=s.order.length;i++){
    const id=s.order[(start+i+s.order.length)%s.order.length];
    if(s.diceCount[id]>0)return id;
  }
  return after;
}
export function canChangePalificoFace(s:State,id:string):boolean {
  if(!s.palifico)return true;
  if(!known(s,id)||id===s.palificoStarter||!s.seenPalifico[id])return false;
  return s.settings.palificoExemption==='experienced'||
    (s.settings.palificoExemption==='oneDie'&&s.diceCount[id]===1);
}
export function legalBids(s:State,id:string=s.turn):{quantity:number;face:number}[] {
  if(s.phase.id!=='bid'||s.phase.paused||!known(s,id)||s.diceCount[id]===0||id!==s.turn)return [];
  const bids:{quantity:number;face:number}[]=[];
  // N+1 is a legal impossible bluff, and guarantees a raise at the N endpoint.
  const max=Math.max(totalDice(s)+1,s.bid===null?1:Math.min(1_000_000,s.bid.quantity*2+1));
  const quantities=s.bid!==null&&max>82?
    [...new Set([s.bid.quantity,s.bid.quantity+1,Math.ceil(s.bid.quantity/2),s.bid.quantity*2+1].filter(q=>q<=1_000_000))]:
    Array.from({length:max},(_,i)=>i+1);
  for(const quantity of quantities)for(let face=1;face<=6;face++){
    const bid={quantity,face};
    if(isRaise(s.bid,bid,effectiveWild(s),s.palifico,canChangePalificoFace(s,id)))bids.push(bid);
  }
  return bids;
}
export function canCalza(s:State,id:string):boolean {
  return s.phase.id==='bid'&&!s.phase.paused&&s.settings.calzaEnabled&&!s.palifico&&alive(s).length>2&&
    known(s,id)&&present(s,id)&&s.diceCount[id]>0&&s.bid!==null&&id!==s.bid.playerId&&
    (s.settings.calzaPolicy==='anyOther'||id!==s.turn);
}

function rollRound(s:State,now:number):State {
  let rng=s.rng;
  const cups:Record<string,number[]>=Object.fromEntries(s.order.map(id=>{
    const cup:number[]=[];
    for(let i=0;i<s.diceCount[id];i++){const [die,next]=nextInt(rng,1,6);rng=next;cup.push(die);}
    return [id,cup];
  }));
  const palificoStarter=s.nextPalifico!==null&&s.settings.palificoEnabled&&alive(s).length>2?s.nextPalifico:null;
  const seenPalifico=palificoStarter===null?s.seenPalifico:{...s.seenPalifico,[palificoStarter]:true};
  return enterPhase({...s,rng,cups,turn:s.nextStarter,bid:null,bidLog:[],reveal:null,
    palifico:palificoStarter!==null,palificoStarter,seenPalifico,nextPalifico:null},'bid',now);
}
export function init(ctx:InitContext):State {
  if(!validTime(ctx.now))throw new RangeError('Unsupported host timestamp');
  if(ctx.players.length<2||ctx.players.length>8||new Set(ctx.players.map(p=>p.id)).size!==ctx.players.length)
    throw new RangeError('Liar’s Dice requires 2–8 distinct seats');
  const order=ctx.players.map(p=>p.id);
  const players=Object.fromEntries(ctx.players.map(p=>[p.id,{...p}]));
  const [starterIndex,rng]=nextInt(seedRng(ctx.seed),0,order.length-1);
  const starter=order[starterIndex];
  const s:State={phase:{id:'bid',startedAt:ctx.now,deadline:null},phaseClock:ctx.now-1,rng,players,order,
    settings:configuration(ctx.settings),cups:{},diceCount:Object.fromEntries(order.map(id=>[id,5])),
    turn:starter,round:1,bid:null,bidLog:[],palifico:false,palificoStarter:null,
    seenPalifico:Object.fromEntries(order.map(id=>[id,false])),nextStarter:starter,nextPalifico:null,
    reveal:null,eliminated:[],left:[],models:Object.fromEntries(order.map(id=>[id,{truth:3,false:2}])),
    autoPaused:false,winner:null,endReason:null,contentLang:ctx.contentLang??'en',phoneOnly:ctx.presence?.phoneOnly??false};
  let rolled=rollRound(s,ctx.now);
  if(!occupied(rolled))rolled={...rolled,autoPaused:true,phase:{...rolled.phase,paused:{at:ctx.now}}};
  return drainAbsent(rolled,ctx.now);
}

function finish(s:State,now:number,reason:string):State {
  const survivors=alive(s);
  return enterPhase({...s,winner:survivors.length===1?survivors[0]:null,endReason:reason},'done',now);
}
function learn(s:State):Record<string,Model> {
  const models={...s.models},dice=s.order.flatMap(id=>s.cups[id]);
  for(const bid of s.bidLog){
    let {truth,false:bluff}=models[bid.playerId];
    if(countMatches(dice,bid.face,effectiveWild(s))>=bid.quantity)truth++;else bluff++;
    if(truth+bluff>2048){truth=Math.max(1,Math.ceil(truth/2));bluff=Math.max(1,Math.ceil(bluff/2));}
    models[bid.playerId]={truth,false:bluff};
  }
  return models;
}
function challenge(s:State,caller:string,kind:'dudo'|'calza',now:number):State {
  if(s.bid===null)return s;
  const bid=s.bid,matches=countMatches(s.order.flatMap(id=>s.cups[id]),bid.face,effectiveWild(s));
  const correct=kind==='dudo'?matches<bid.quantity:matches===bid.quantity;
  const loser=kind==='dudo'?(correct?bid.playerId:caller):(correct?null:caller);
  const diceCount={...s.diceCount},eliminated=[...s.eliminated];
  let nextPalifico:string|null=null,gained=false;
  if(loser!==null){
    const before=diceCount[loser];diceCount[loser]=Math.max(0,before-1);
    if(diceCount[loser]===0&&!eliminated.includes(loser))eliminated.push(loser);
    if(before===2&&diceCount[loser]===1&&!s.seenPalifico[loser]&&s.settings.palificoEnabled)nextPalifico=loser;
  }else if(diceCount[caller]<5){diceCount[caller]++;gained=true;}
  let next:State={...s,diceCount,eliminated,nextPalifico,models:learn(s),
    reveal:{kind,caller,bid:{...bid},matches,correct,loser,gained,dice:Object.fromEntries(s.order.map(id=>[id,[...s.cups[id]]]))}};
  const starter=kind==='calza'?caller:loser!;
  next={...next,nextStarter:diceCount[starter]>0?starter:nextAlive(next,starter)};
  // Keep the last challenge's visible cups on the final results screen.
  if(alive(next).length===1)return finish(next,now,'last-die');
  return enterPhase(next,'reveal',now);
}
function phaseInput(s:State,id:string,input:Input,now:number):State {
  if(s.phase.id==='reveal')return input.type==='continue'&&present(s,id)?
    rollRound({...s,round:s.round+1},now):s;
  if(s.phase.id!=='bid'||s.diceCount[id]===0)return s;
  if(input.type==='calza')return canCalza(s,id)?challenge(s,id,'calza',now):s;
  if(id!==s.turn)return s;
  if(input.type==='dudo')return s.bid===null?s:challenge(s,id,'dudo',now);
  if(input.type==='bid'&&isRaise(s.bid,input,effectiveWild(s),s.palifico,canChangePalificoFace(s,id))){
    const bid:Bid={quantity:input.quantity,face:input.face,playerId:id};
    return enterPhase({...s,bid,bidLog:[...s.bidLog,bid].slice(-128),turn:nextAlive(s,id)},'bid',now);
  }
  return s;
}

function automaticTurn(s:State,now:number):State {
  if(s.phase.id==='reveal')return rollRound({...s,round:s.round+1},now);
  if(s.phase.id!=='bid')return s;
  const rng=createRng(hashString(s.turn)^s.rng.seed^s.rng.step^s.bidLog.length);
  const input=chooseInput(s,s.turn,rng,'normal');
  return input===null?s:phaseInput(s,s.turn,input,now);
}
function drainAbsent(s:State,now:number):State {
  let next=s;
  for(let i=0;i<64&&next.phase.id==='bid'&&!next.phase.paused&&!present(next,next.turn)&&occupied(next);i++){
    const played=automaticTurn(next,now);
    if(played===next)break;
    next=played;
  }
  return next;
}
function playerEvent(s:State,e:Extract<GameEvent<Input>,{type:'player'}>):State {
  if(!known(s,e.playerId)||typeof e.connected!=='boolean'||
    (e.gone!==undefined&&e.gone!=='left'&&e.gone!=='kicked'))return s;
  const id=e.playerId,wasLeft=s.left.includes(id),gone=e.gone!==undefined;
  const connected=!wasLeft&&!gone&&e.connected;
  if(s.players[id].connected===connected&&(wasLeft||!gone))return s;
  let next:State={...s,players:{...s.players,[id]:{...s.players[id],connected}},
    left:gone&&!wasLeft?[...s.left,id]:s.left};
  if(s.phase.id==='done')return next;
  if(!occupied(next)){
    if(!next.phase.paused)next={...next,autoPaused:true,phase:{...next.phase,paused:{at:e.now}}};
    return next;
  }
  if(next.autoPaused&&next.phase.paused){
    const delta=Math.max(0,e.now-next.phase.paused.at);
    next={...next,autoPaused:false,phase:{id:next.phase.id,startedAt:next.phase.startedAt,
      deadline:next.phase.deadline===null?null:next.phase.deadline+delta}};
  }
  return drainAbsent(next,e.now);
}
function reduceEvent(s:State,e:GameEvent<Input>):State {
  if(e===null||typeof e!=='object'||!validTime(e.now))return s;
  // Local SDK adapter order: player, speech, VIP, paused, live phase.
  if(e.type==='player')return playerEvent(s,e);
  if(e.type==='speech'||e.type==='speechStart')return s;
  if(e.type==='vip'){
    if(s.phase.id==='done')return s;
    if(e.action==='end')return finish(s,e.now,'vip-end');
    if(e.action==='pause')return s.phase.paused?
      (s.autoPaused?{...s,autoPaused:false}:s):{...s,autoPaused:false,phase:{...s.phase,paused:{at:e.now}}};
    if(e.action==='resume'){
      if(!s.phase.paused)return s;
      if(!occupied(s))return s.autoPaused?s:{...s,autoPaused:true};
      const delta=Math.max(0,e.now-s.phase.paused.at);
      return drainAbsent({...s,autoPaused:false,phase:{id:s.phase.id,startedAt:s.phase.startedAt,
        deadline:s.phase.deadline===null?null:s.phase.deadline+delta}},e.now);
    }
    if(e.action==='skip'){
      // Skip can exit a held phase but preserves the hold in its destination.
      const played=automaticTurn({...s,phase:{id:s.phase.id,startedAt:s.phase.startedAt,deadline:s.phase.deadline}},e.now);
      return s.phase.paused&&played!==s?{...played,autoPaused:s.autoPaused,phase:{...played.phase,paused:{at:e.now}}}:drainAbsent(played,e.now);
    }
    return s;
  }
  if(s.phase.paused||s.phase.id==='done')return s;
  if(e.type==='timer')return e.phaseId===s.phase.id&&e.startedAt===s.phase.startedAt&&
    s.phase.deadline!==null&&e.now>=s.phase.deadline?drainAbsent(automaticTurn(s,e.now),e.now):s;
  if(e.type==='input'){
    if(!known(s,e.playerId)||!present(s,e.playerId))return s;
    const parsed=inputSchema.safeParse(e.input);if(!parsed.success)return s;
    return drainAbsent(phaseInput(s,e.playerId,parsed.data,e.now),e.now);
  }
  return s;
}
export function reduce(s:State,event:GameEvent<Input>):State {
  try{return reduceEvent(s,event);}catch{return s;}
}

function publicView(s:State):PublicView {
  return {gameId:manifest.id,phaseId:s.phase.id,deadline:s.phase.deadline,paused:!!s.phase.paused,
    players:s.order.map(id=>({id,name:s.players[id].name,avatarId:s.players[id].avatarId,
      connected:s.players[id].connected,status:s.diceCount[id]===0?'spectator':
        s.phase.id==='bid'&&id===s.turn?'active':'waiting',score:s.diceCount[id]})),
    round:s.round,turn:s.turn,bid:s.bid===null?null:{...s.bid},bidLog:s.bidLog.map(b=>({...b})),
    diceCount:{...s.diceCount},totalDice:totalDice(s),palifico:s.palifico,wild:effectiveWild(s),
    settings:{...s.settings},reveal:s.reveal===null?null:{...s.reveal,bid:{...s.reveal.bid},
      dice:Object.fromEntries(s.order.map(id=>[id,[...s.reveal!.dice[id]]]))},winner:s.winner,endReason:s.endReason,
    vipSkipLabel:s.phase.id==='reveal'?'Next round':'Play this turn',screen:`round ${s.round}`};
}
export function tvView(s:State):PublicView{return publicView(s);}
export function controllerView(s:State,playerId:string):PrivateView {
  const id=typeof playerId==='string'?playerId:'';
  const member=known(s,playerId),canAct=member&&present(s,id)&&s.diceCount[id]>0&&s.phase.id==='bid'&&!s.phase.paused;
  const ownDice=member?[...s.cups[id]]:[];
  return {...publicView(s),me:{id,role:member?'player':'spectator'},phoneOnly:s.phoneOnly,
    ownDice,legalBids:canAct&&id===s.turn?legalBids(s,id):[],canBid:canAct&&id===s.turn,
    canDudo:canAct&&id===s.turn&&s.bid!==null,canCalza:member&&canCalza(s,id),
    canContinue:member&&present(s,id)&&s.phase.id==='reveal'&&!s.phase.paused,
    odds:member&&s.bid!==null&&s.phase.id==='bid'?bidProbability(ownDice,totalDice(s),s.bid.quantity,s.bid.face,effectiveWild(s)):null};
}
export function results(s:State):GameResults|null {
  if(s.phase.id!=='done')return null;
  const scores=Object.fromEntries(s.order.map(id=>[id,s.diceCount[id]===0?s.eliminated.indexOf(id)+1:
    s.order.length+s.diceCount[id]/10]));
  const sorted=[...s.order].sort((a,b)=>scores[b]-scores[a]||s.order.indexOf(a)-s.order.indexOf(b));
  const best=Math.max(...Object.values(scores));
  const winnerIds=s.winner!==null?[s.winner]:sorted.filter(id=>scores[id]===best);
  return {scores,ranking:sorted.map(id=>({playerId:id,score:scores[id],rank:1+sorted.filter(other=>scores[other]>scores[id]).length})),
    winnerIds,awards:[],headlineNote:s.endReason==='vip-end'?'Ended by the host; remaining dice decide the standings.':'Last player with dice.'};
}

function modelProbability(s:State,id:string,bid:Bid,raw:number,adaptive=true,queryQuantity=bid.quantity):number {
  const m=s.models[bid.playerId];
  const observations=Math.max(0,m.truth+m.false-5),confidence=observations/(observations+12);
  const truthRate=m.truth/(m.truth+m.false);
  const wild=effectiveWild(s),matchingFaces=wild&&bid.face!==1?2:1;
  const own=s.cups[id],knownMatches=countMatches(own,bid.face,wild);
  const bidderDice=s.diceCount[bid.playerId],otherHidden=totalDice(s)-own.length-bidderDice;
  let weight=0,numerator=0;
  // Hypothesize the bidder's possible match counts; never inspect their cup.
  // Bidders tend to select a face supported by their own dice. The likelihood
  // is an explicit heuristic, adjusted only by previously revealed outcomes.
  const exponent=adaptive?3+confidence*Math.max(0,truthRate-.6)*4:1.5;
  const bluffFloor=adaptive?Math.max(.015,.04-confidence*Math.max(0,truthRate-.6)*.25):.16;
  for(let k=0;k<=bidderDice;k++){
    const mass=probability(bidderDice,k,matchingFaces).exact;
    const supporting=probability(totalDice(s)-bidderDice,bid.quantity-k,matchingFaces).atLeast;
    const likelihood=bluffFloor+(1-bluffFloor)*supporting**exponent;
    const w=mass*likelihood;
    weight+=w;
    numerator+=w*probability(otherHidden,queryQuantity-knownMatches-k,matchingFaces).atLeast;
  }
  return weight>0?numerator/weight:raw;
}
function chooseInput(s:State,id:string,rng:Rng,skill:BotSkill):Input|null {
  if(!known(s,id)||s.phase.paused)return null;
  if(s.phase.id==='reveal')return {type:'continue'};
  if(s.phase.id!=='bid'||s.diceCount[id]===0)return null;
  const own=s.cups[id],total=totalDice(s),wild=effectiveWild(s);
  const raw=s.bid===null?null:bidProbability(own,total,s.bid.quantity,s.bid.face,wild);
  // Calza may interrupt another seat; consider it before the ordinary turn guard.
  if(raw!==null&&canCalza(s,id)&&raw.exact>(skill==='sharp'?.58:skill==='normal'?.75:.9))return {type:'calza'};
  if(id!==s.turn)return null;
  const legal=legalBids(s,id);
  if(legal.length===0)return s.bid===null?null:{type:'dudo'};
  const options=legal.map(b=>({...b,p:bidProbability(own,total,b.quantity,b.face,wild).atLeast,
    known:countMatches(own,b.face,wild)}));
  if(skill==='easy'){
    // Mental expected-count strategy: round a mean, without calculating variance
    // or adapting to another player's observed bidding history.
    const expected=(face:number)=>countMatches(own,face,wild)+(total-own.length)*(wild&&face!==1?2:1)/6;
    if(s.bid!==null&&s.bid.quantity>expected(s.bid.face)+1)return {type:'dudo'};
    const safe=options.filter(b=>b.quantity<=Math.max(1,Math.ceil(expected(b.face))));
    if(safe.length===0)return s.bid===null?{type:'bid',quantity:options[0].quantity,face:options[0].face}:{type:'dudo'};
    safe.sort((a,b)=>b.known-a.known||a.quantity-b.quantity||a.face-b.face);
    const selected=safe[rng.chance(.2)?rng.int(0,Math.min(safe.length-1,3)):0];
    return {type:'bid',quantity:selected.quantity,face:selected.face};
  }
  if(skill==='normal'){
    options.sort((a,b)=>b.p-a.p||a.quantity-b.quantity||b.known-a.known||a.face-b.face);
    const best=options[0];
    // A fixed, unlearned support likelihood recognizes that naming a face
    // is evidence about the bidder's cup; the raw binomial odds stay exact.
    const believable=raw===null?1:modelProbability(s,id,s.bid!,raw.atLeast,false);
    if(raw!==null&&raw.atLeastNumerator!==raw.total&&(believable<.4||best.p<.3))return {type:'dudo'};
    // Choose the most credible legal raise, rather than jumping to an average
    // pool quantity that discards the evidence in our own cup.
    return {type:'bid',quantity:best.quantity,face:best.face};
  }
  // Strong: exact cup-conditioned odds, an observed-only bluff model, and a
  // mixed safe/aggressive bid policy. The next seat's cup is never inspected.
  const believable=raw===null?1:modelProbability(s,id,s.bid!,raw.atLeast);
  // Reuse that same observed bid, rather than treating a hypothetical raise as
  // new evidence. Same-face raises inherit the inferred support in its cup.
  if(s.bid!==null)for(const option of options)if(option.face===s.bid.face)
    option.p=modelProbability(s,id,s.bid,option.p,true,option.quantity);
  options.sort((a,b)=>b.p-a.p||b.known-a.known||a.quantity-b.quantity||a.face-b.face);
  const best=options[0];
  // One-step survival: compare winning the challenge with the credibility of
  // our best raise, allowing a small margin to continue a mixed strategy.
  if(raw!==null&&1-believable>best.p+.01)return {type:'dudo'};
  const next=nextAlive(s,id),nextModel=s.models[next];
  const rate=nextModel.truth/(nextModel.truth+nextModel.false);
  const bluffChance=.035+Math.max(0,rate-.65)*.08;
  const candidates=options.filter(b=>b.p>=best.p-.015);
  candidates.sort((a,b)=>b.p-a.p||b.known-a.known||a.quantity-b.quantity||a.face-b.face);
  let chosen=best;
  if(rng.chance(bluffChance)){
    const bluffs=options.filter(b=>b.p>=.5&&b.p<.64&&b.known>0);
    bluffs.sort((a,b)=>b.p-a.p||a.quantity-b.quantity||b.face-a.face);
    if(bluffs.length>0)chosen=bluffs[rng.int(0,Math.min(bluffs.length-1,2))];
  }else{
    const ties=candidates.filter(b=>b.quantity===chosen.quantity&&Math.abs(b.p-chosen.p)<.04);
    if(ties.length>0)chosen=ties[rng.int(0,ties.length-1)];
  }
  return {type:'bid',quantity:chosen.quantity,face:chosen.face};
}
export function sampleInput(s:State,id:string,rng:Rng,skill:BotSkill='normal'):Input|null {
  if(!known(s,id)||!present(s,id))return null;
  return chooseInput(s,id,rng,skill);
}
export const game:GameDefinition<State,Input,PublicView,PrivateView>={manifest,phases:['bid','reveal','done'],
  inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput}};
