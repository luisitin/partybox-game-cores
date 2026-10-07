import {z} from 'zod';
import type {GameDefinition,GameStateBase,InitContext,GameEvent,TvView,ControllerView,GameResults,GameManifest} from '../../contract/contract.ts';
import type {BotSkill} from '../../contract/constants.ts';
import type {Rng} from '../../contract/rng.ts';
import {seedRng,shuffle} from '../../contract/rng.ts';
// Rng is defined in rng.ts; all entropy is supplied, never obtained from the host.
export type Tile = readonly [number,number];
export function tile(id:number):Tile { let k=0; for(let a=0;a<=6;a++)for(let b=a;b<=6;b++){if(k++===id)return [a,b];} return [-1,-1]; }
export const allTiles = ():number[] => Array.from({length:28},(_,i)=>i);
export const pips=(id:number):number=>{const [a,b]=tile(id);return a+b;};
export const handPips=(h:readonly number[]):number=>h.reduce((n,t)=>n+pips(t),0);
export type Input = {type:'play';tile:number;side:'left'|'right'} | {type:'draw'} | {type:'pass'} | {type:'next'};
export const inputSchema:z.ZodType<Input>=z.discriminatedUnion('type',[
 z.object({type:z.literal('play'),tile:z.number().int().min(0).max(27),side:z.enum(['left','right'])}).strict(),
 z.object({type:z.literal('draw')}).strict(),z.object({type:z.literal('pass')}).strict(),z.object({type:z.literal('next')}).strict()
]);
export interface Settings {mode:'draw'|'block';deal:'block-sized'|'traditional';partners:boolean;target:number;reserve:number;opening:'highest-double'|'rotating';blocked:'difference'|'opponents';teamPoints:'opponents'|'all';}
export interface State extends GameStateBase {
 seats:string[]; settings:Settings; hands:number[][]; stock:number[];
 board:{tile:number;a:number;b:number;player:number}[]; ends:Tile|null;
 turn:number; idleTurns:number; starter:number; forced:number|null; round:number; passes:number;
 scores:number[]; missed:number[]; history:{round:number;winner:number|null;points:number;blocked:boolean}[];
 last:{winner:number|null;points:number;blocked:boolean}|null;
}
export interface PublicView extends TvView {board:State['board'];ends:Tile|null;turn:string;counts:number[];stockCount:number;round:number;target:number;teams:number[];last:State['last'];}
export interface PhoneView extends PublicView,ControllerView {hand:number[];legal:Input[];}
export const manifest:GameManifest={
 id:'dominoes',name:'Dominoes',icon:'🁣',tagline:'Match the ends. Read the table. Empty your hand.',
 description:'Double-six Draw or Block dominoes with individual or four-seat partnership scoring.',
 howToPlay:['Play a tile matching either open end.','If stuck, draw in Draw mode or pass in Block mode.','Empty your hand or win a blocked board; reach the target score.'],
 version:'0.2.0',minPlayers:2,maxPlayers:4,estimatedMinutes:20,tags:['classic','strategy'],presence:{needs:'anywhere'},addedOn:'2026-10-07',supportsBots:true,saveable:true,noCards:true,
 settings:[
 {key:'mode',label:'Game',type:'select',default:'draw',options:[{value:'draw',label:'Draw'},{value:'block',label:'Block'}]},
 {key:'deal',label:'Draw hand sizes',type:'select',default:'block-sized',options:[{value:'block-sized',label:'House deal: 7/5/5'},{value:'traditional',label:'Pagat Draw: 7/7/6'}]},
 {key:'partners',label:'Partners (four seats only)',type:'boolean',default:false},
 {key:'target',label:'Target score',type:'select',default:'100',options:[{value:'100',label:'100'},{value:'150',label:'150'},{value:'250',label:'250'}]},
 {key:'reserve',label:'Tiles kept in the boneyard',type:'select',default:'0',options:[{value:'0',label:'Draw all'},{value:'2',label:'Keep last two'}]},
 {key:'opening',label:'First-round opener',type:'select',default:'highest-double',options:[{value:'highest-double',label:'Highest double'},{value:'rotating',label:'First seat / rotating'}]},
 {key:'blocked',label:'Individual blocked score',type:'select',default:'difference',options:[{value:'difference',label:'Opponents less winner'},{value:'opponents',label:'Opponents only'}]},
 {key:'teamPoints',label:'Partnership scoring',type:'select',default:'opponents',options:[{value:'opponents',label:'Opposing team pips'},{value:'all',label:'All remaining pips'}]}
 ]
};
export function team(s:Pick<State,'settings'>,seat:number):number{return s.settings.partners?seat%2:seat;}
const own=(s:State,id:string):boolean=>Object.hasOwn(s.players,id);
function phase(s:State,id:string,now:number):State['phase']{return {id,startedAt:Math.max(now,s.phase.startedAt+1),deadline:id==='done'?null:Math.max(now,s.phase.startedAt+1)+(id==='round-end'?5000:(s.idleTurns>=2?1000:30000))};}
export function legal(s:State,seat=s.turn):Input[]{
 if(s.phase.id==='round-end')return [{type:'next'}];
 if(s.phase.id!=='play'||seat!==s.turn)return [];
 const out:Input[]=[];
 for(const t of s.hands[seat]??[]){
  if(s.forced!==null&&t!==s.forced)continue;
  const [a,b]=tile(t);
  if(s.ends===null){out.push({type:'play',tile:t,side:'right'});continue;}
  if(a===s.ends[0]||b===s.ends[0])out.push({type:'play',tile:t,side:'left'});
  if(a===s.ends[1]||b===s.ends[1])out.push({type:'play',tile:t,side:'right'});
 }
 if(out.length)return out;
 return s.settings.mode==='draw'&&s.stock.length>s.settings.reserve?[{type:'draw'}]:[{type:'pass'}];
}
export function scoreRound(s:State,out:number|null):State['last']{
 const totals=s.hands.map(handPips);let winner=out;
 if(winner===null){
  const groups=s.seats.map((_,i)=>team(s,i));const uniq=[...new Set(groups)];
  const sums=uniq.map(g=>totals.reduce((n,v,i)=>n+(groups[i]===g?v:0),0));
  const minimum=Math.min(...sums);const wins=uniq.filter((_,i)=>sums[i]===minimum);
  if(wins.length!==1)return {winner:null,points:0,blocked:true};
  winner=groups.indexOf(wins[0]!);
 }
 const w=team(s,winner);const loser=totals.reduce((n,v,i)=>n+(team(s,i)!==w?v:0),0);
 const mine=totals.reduce((n,v,i)=>n+(team(s,i)===w?v:0),0);
 const points=s.settings.partners?(s.settings.teamPoints==='all'?loser+mine:loser):Math.max(0,loser-(out===null&&s.settings.blocked==='difference'?mine:0));
 return {winner,points,blocked:out===null};
}
function finishRound(s:State,out:number|null,now:number):State{
 const last=scoreRound(s,out)!;const scores=s.scores.map((v,i)=>v+(last.winner!==null&&team(s,i)===team(s,last.winner)?last.points:0));
 // A scoreless round is valid; there is no artificial player-visible round limit.
 const next={...s,scores,last,history:[...s.history,{round:s.round,...last}].slice(-100)};
 return {...next,phase:phase(next,Math.max(...scores)>=s.settings.target?'done':'round-end',now)};
}
function deal(s:State,now:number):State{
 const [deck,rng]=shuffle(s.rng,allTiles());const count=s.seats.length===2||s.settings.partners?7:s.settings.mode==='draw'&&s.settings.deal==='traditional'?(s.seats.length===3?7:6):5;
 const hands=s.seats.map((_,i)=>deck.slice(i*count,(i+1)*count));const stock=deck.slice(count*s.seats.length);
 let starter=s.last?.winner??((s.round-1)%s.seats.length);let forced:number|null=null;
 if(s.round===1&&s.settings.opening==='highest-double'){
  let best=-1;
  hands.forEach((h,i)=>h.forEach(t=>{const [a,b]=tile(t);const value=a===b?100+a:pips(t);if(value>best){best=value;starter=i;forced=t;}}));
 }
 return {...s,rng,hands,stock,board:[],ends:null,turn:starter,starter,forced,passes:0,missed:s.seats.map(()=>0),phase:phase(s,'play',now)};
}
export function init(ctx:InitContext):State{
 const seats=ctx.players.map(p=>p.id);if(seats.length<2||seats.length>4||new Set(seats).size!==seats.length)throw new Error('Dominoes requires 2–4 unique players');
 const c=ctx.settings;const settings:Settings={mode:c.mode==='block'?'block':'draw',deal:c.deal==='traditional'?'traditional':'block-sized',partners:c.partners===true&&seats.length===4,target:[100,150,250].includes(Number(c.target))?Number(c.target):100,reserve:c.reserve==='2'?2:0,opening:c.opening==='rotating'?'rotating':'highest-double',blocked:c.blocked==='opponents'?'opponents':'difference',teamPoints:c.teamPoints==='all'?'all':'opponents'};
 const s:State={players:Object.fromEntries(ctx.players.map(p=>[p.id,{...p}])),phase:{id:'play',startedAt:ctx.now-1,deadline:null},rng:seedRng(ctx.seed),seats,settings,hands:[],stock:[],board:[],ends:null,turn:0,idleTurns:0,starter:0,forced:null,round:1,passes:0,scores:seats.map(()=>0),missed:seats.map(()=>0),history:[],last:null};
 return deal(s,ctx.now);
}
export function sameInput(a:Input,b:Input):boolean{return a.type===b.type&&(a.type!=='play'||(b.type==='play'&&a.tile===b.tile&&a.side===b.side));}
export function apply(s:State,i:Input,now:number):State{
 const options=legal(s);if(!options.some(x=>sameInput(x,i)))return s;
 if(i.type==='next')return deal({...s,round:s.round+1},now);
 if(i.type==='draw'){
  const t=s.stock[0]!;const hands=s.hands.map((h,j)=>j===s.turn?[...h,t]:h);
  // Drawing may invalidate every prior pass inference for this seat.
  return {...s,hands,stock:s.stock.slice(1),missed:s.missed.map((v,j)=>j===s.turn?0:v),phase:phase(s,'play',now)};
 }
 if(i.type==='pass'){
  const mask=s.ends===null?0:(1<<s.ends[0])|(1<<s.ends[1]);
  const next={...s,passes:s.passes+1,missed:s.missed.map((v,j)=>j===s.turn?v|mask:v),turn:(s.turn+1)%s.seats.length,phase:phase(s,'play',now)};
  return next.passes>=s.seats.length?finishRound(next,null,now):next;
 }
 const [a,b]=tile(i.tile);let left=a,right=b;
 if(s.ends!==null){if(i.side==='left'){if(right!==s.ends[0])[left,right]=[right,left];}else if(left!==s.ends[1])[left,right]=[right,left];}
 const placed={tile:i.tile,a:left,b:right,player:s.turn};
 const board=i.side==='left'?[placed,...s.board]:[...s.board,placed];
 const hands=s.hands.map((h,j)=>j===s.turn?h.filter(t=>t!==i.tile):h);
 const next:State={...s,hands,board,ends:[board[0]!.a,board.at(-1)!.b],forced:null,passes:0,turn:(s.turn+1)%s.seats.length,phase:phase(s,'play',now)};
 return hands[s.turn]!.length===0?finishRound(next,s.turn,now):next;
}
function human(s:State,i:Input,now:number):State {return legal(s).some(x=>sameInput(x,i))?apply({...s,idleTurns:0},i,now):s;}
function automatic(s:State,now:number):State {return apply({...s,idleTurns:Math.min(2,s.idleTurns+1)},greedy(s.hands[s.turn]!,s.ends,legal(s)),now);}
export function reduce(s:State,e:GameEvent<Input>):State{
 if(e.type==='player')return own(s,e.playerId)?{...s,players:{...s.players,[e.playerId]:{...s.players[e.playerId]!,connected:e.connected}}}:s;
 if(e.type==='vip'){
  if(e.action==='end')return {...s,phase:phase(s,'done',e.now)};
  if(s.phase.id==='done')return s;
  if(e.action==='pause')return s.phase.paused?s:{...s,phase:{...s.phase,paused:{at:e.now}}};
  if(e.action==='resume'){
   if(!s.phase.paused)return s;const {paused,...p}=s.phase;
   return {...s,phase:{...p,deadline:p.deadline===null?null:p.deadline+Math.max(0,e.now-paused.at)}};
  }
  if(e.action==='skip'&&!s.phase.paused)return automatic(s,e.now);
  return s;
 }
 if(s.phase.paused||s.phase.id==='done')return s;
 if(e.type==='timer'){
  if(e.phaseId!==s.phase.id||e.startedAt!==s.phase.startedAt||s.phase.deadline===null||e.now<s.phase.deadline)return s;
  return automatic(s,e.now);
 }
 if(e.type!=='input'||!own(s,e.playerId))return s;
 if(s.phase.id==='round-end'){return e.input.type==='next'?human(s,e.input,e.now):s;}
 if(s.seats[s.turn]!==e.playerId)return s;
 return human(s,e.input,e.now);
}
export function tvView(s:State):PublicView{
 return {gameId:manifest.id,phaseId:s.phase.id,deadline:s.phase.deadline,paused:!!s.phase.paused,
 players:s.seats.map((id,i)=>({...s.players[id]!,status:i===s.turn&&s.phase.id==='play'?'active':'waiting',score:s.scores[i]})),
 board:s.board.map(t=>({...t})),ends:s.ends===null?null:[...s.ends],turn:s.seats[s.turn]!,counts:s.hands.map(h=>h.length),stockCount:s.stock.length,round:s.round,target:s.settings.target,teams:s.seats.map((_,i)=>team(s,i)),last:s.last===null?null:{...s.last}};
}
export function controllerView(s:State,id:string):PhoneView{
 const seat=s.seats.indexOf(id);return {...tvView(s),me:{id,role:seat<0?'spectator':'player'},hand:seat<0?[]:[...s.hands[seat]!],legal:seat<0?[]:legal(s,seat)};
}
export function results(s:State):GameResults|null{
 if(s.phase.id!=='done')return null;const max=Math.max(...s.scores);
 return {scores:Object.fromEntries(s.seats.map((id,i)=>[id,s.scores[i]!])),ranking:s.seats.map((id,i)=>({playerId:id,score:s.scores[i]!,rank:1+s.scores.filter(v=>v>s.scores[i]!).length})),winnerIds:s.seats.filter((_,i)=>s.scores[i]===max),awards:[]};
}
// Bot policy consumes only a sanitized observation. Changing opponents' tile
// identities or boneyard order cannot change a decision with the same supplied RNG.
export interface Observation {seat:number;counts:number[];hand:number[];played:number[];ends:Tile|null;missed:number[];settings:Settings;forced:number|null;legal:Input[];}
export function observe(s:State,id:string):Observation|null{
 const seat=s.seats.indexOf(id);if(seat<0||s.phase.paused)return null;
 return {seat,counts:s.hands.map(h=>h.length),hand:[...s.hands[seat]!],played:s.board.map(t=>t.tile),ends:s.ends,missed:[...s.missed],settings:{...s.settings},forced:s.forced,legal:legal(s,seat)};
}
export function greedy(hand:number[],ends:Tile|null,moves:Input[]):Input{
 const scored=moves.map((m,i)=>{
  if(m.type!=='play')return {m,value:0,i};const [a,b]=tile(m.tile);
  const remaining=hand.filter(t=>t!==m.tile);const counts=Array.from({length:7},(_,n)=>remaining.filter(t=>tile(t).includes(n)).length);
  const exposed=ends===null?(counts[a]!+counts[b]!):(counts[m.side==='left'?(b===ends[0]?a:b):(a===ends[1]?b:a)]!);
  return {m,value:pips(m.tile)*2+exposed*3+(a===b?2:0),i};
 });scored.sort((a,b)=>b.value-a.value||a.i-b.i);return scored[0]!.m;
}
export interface Position {hands:number[][];ends:Tile|null;turn:number;passes:number;partners:boolean;stock?:number[];reserve?:number;}
export function positionMoves(p:Position):{tile:number;side:'left'|'right'}[]{
 const out:{tile:number;side:'left'|'right'}[]=[];for(const t of p.hands[p.turn]!){const [a,b]=tile(t);if(p.ends===null)out.push({tile:t,side:'right'});else {if(a===p.ends[0]||b===p.ends[0])out.push({tile:t,side:'left'});if(a===p.ends[1]||b===p.ends[1])out.push({tile:t,side:'right'});}}return out;
}
export function positionPlay(p:Position,m:{tile:number;side:'left'|'right'}|null):Position{
 if(m===null)return {...p,turn:(p.turn+1)%p.hands.length,passes:p.passes+1};
 const [a,b]=tile(m.tile);const ends:Tile=p.ends===null?[a,b]:m.side==='left'?[a===p.ends[0]?b:a,p.ends[1]]:[p.ends[0],a===p.ends[1]?b:a];
 return {...p,hands:p.hands.map((h,i)=>i===p.turn?h.filter(t=>t!==m.tile):h),ends,turn:(p.turn+1)%p.hands.length,passes:0};
}
export function utility(p:Position,root:number):number|null{
 const group=(i:number)=>p.partners?i%2:i;const totals=p.hands.map(handPips);const empty=p.hands.findIndex(h=>h.length===0);
 let winning=empty<0?-1:group(empty);
 if(empty<0&&p.passes<p.hands.length)return null;
 if(empty<0){const groups=[...new Set(p.hands.map((_,i)=>group(i)))];const sums=groups.map(g=>totals.reduce((n,v,i)=>n+(group(i)===g?v:0),0));const min=Math.min(...sums);if(sums.filter(v=>v===min).length>1)return 0;winning=groups[sums.indexOf(min)]!;}
 const points=totals.reduce((n,v,i)=>n+(group(i)!==winning?v:0),0);
 return group(root)===winning?100+points:-100-points;
}
/** Adversarial team minimax with alpha-beta; exact when depth exhausts the hand. */
export function solve(p:Position,root:number,depth=128,alpha=-Infinity,beta=Infinity):number{
 const terminal=utility(p,root);if(terminal!==null)return terminal;
 const allied=(i:number)=>p.partners?i%2===root%2:i===root;
 if(depth<=0){const mine=p.hands.reduce((n,h,i)=>n+(allied(i)?handPips(h):0),0);const other=p.hands.reduce((n,h,i)=>n+(!allied(i)?handPips(h):0),0);return other/(p.partners?1:p.hands.length-1)-mine;}
 const moves=positionMoves(p);
 // In Draw, a forced draw keeps the same turn until a tile can be played.
 // The order is sampled from public unknown tiles, never the real boneyard.
 if(!moves.length&&p.stock&&p.stock.length>(p.reserve??0)){
  const next={...p,hands:p.hands.map((h,i)=>i===p.turn?[...h,p.stock![0]!]:h),stock:p.stock.slice(1),passes:0};
  return solve(next,root,depth-1,alpha,beta);
 }
 const choices=moves.length?moves:[null];const max=allied(p.turn);let best=max?-Infinity:Infinity;
 for(const m of choices){const v=solve(positionPlay(p,m),root,depth-1,alpha,beta);best=max?Math.max(best,v):Math.min(best,v);if(max)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);if(alpha>=beta)break;}return best;
}
/** Count and sample labelled tile partitions consistent with public suit evidence.
 * Memo keys are remaining bin capacities; these also determine the tile index.
 * At most 27 hidden tiles and four bins keep exact integer counts below 2^53.
 */
export function conditionalDeals(unknown:number[],capacities:number[],forbidden:number[],rng:Rng):{ways:number;sample:()=>number[][]|null}{
 const allowed=unknown.map(t=>capacities.map((_,i)=>tile(t).every(n=>!(forbidden[i]!&(1<<n)))));
 const memo=new Map<string,number>();
 const count=(caps:number[]):number=>{
  const left=caps.reduce((a,b)=>a+b,0);if(left===0)return 1;
  const key=caps.join(',');const cached=memo.get(key);if(cached!==undefined)return cached;
  const index=unknown.length-left;let ways=0;
  for(let i=0;i<caps.length;i++)if(caps[i]!>0&&allowed[index]![i]){const next=[...caps];next[i]!--;ways+=count(next);}
  memo.set(key,ways);return ways;
 };
 const ways=count(capacities);
 return {ways,sample:()=>{
  if(ways===0)return null;
  const bins=capacities.map(()=>[] as number[]);const caps=[...capacities];
  for(let index=0;index<unknown.length;index++){
   const weights=caps.map((cap,i)=>{if(!cap||!allowed[index]![i])return 0;const next=[...caps];next[i]!--;return count(next);});
   let choice=rng.float()*weights.reduce((a,b)=>a+b,0);let selected=weights.length-1;
   for(let i=0;i<weights.length;i++){choice-=weights[i]!;if(choice<0){selected=i;break;}}
   bins[selected]!.push(unknown[index]!);caps[selected]!--;
  }
  return bins.map(bin=>rng.shuffle(bin));
 }};
}
function handSampler(o:Observation,rng:Rng):()=>number[][]|null{
 const unknown=allTiles().filter(t=>!o.hand.includes(t)&&!o.played.includes(t));
 const seats=o.counts.map((_,i)=>i).filter(i=>i!==o.seat);
 const capacities=seats.map(i=>o.counts[i]!);capacities.push(unknown.length-capacities.reduce((a,b)=>a+b,0));
 // Unconstrained deals retain the inexpensive uniform shuffle path.
 if(seats.every(i=>o.missed[i]===0))return ()=>{const shuffled=rng.shuffle(unknown);let offset=0;return o.counts.map((count,i)=>{if(i===o.seat)return [...o.hand];const h=shuffled.slice(offset,offset+count);offset+=count;return h;});};
 const sampler=conditionalDeals(unknown,capacities,[...seats.map(i=>o.missed[i]!),0],rng);
 return ()=>{const bins=sampler.sample();if(bins===null)return null;return o.counts.map((_,i)=>i===o.seat?[...o.hand]:bins[seats.indexOf(i)]!);};
}
export function choose(o:Observation,rng:Rng,skill:BotSkill='normal'):Input|null{
 const moves=o.legal;if(!moves.length)return null;if(moves.length===1)return moves[0]!;
 if(skill==='easy'){const doubles=moves.filter(m=>m.type==='play'&&tile(m.tile)[0]===tile(m.tile)[1]);return rng.pick(doubles.length?doubles:moves);}
 if(skill==='normal')return greedy(o.hand,o.ends,moves);
 const values=moves.map(()=>0);let samples=0;const sampleHands=handSampler(o,rng);
 const total=o.counts.reduce((a,b)=>a+b,0);
 for(let k=0;k<16;k++){
  const hands=sampleHands();if(hands===null)continue;samples++;
  const stock=o.settings.mode==='draw'?rng.shuffle(allTiles().filter(t=>!hands.flat().includes(t)&&!o.played.includes(t))):undefined;
  const p:Position={hands,ends:o.ends,turn:o.seat,passes:0,partners:o.settings.partners,stock,reserve:o.settings.reserve};
  moves.forEach((m,i)=>{if(m.type!=='play')return;const q=positionPlay(p,m);values[i]!+=solve(q,o.seat,total+(stock?.length??0)<=9?(total+(stock?.length??0)+1)*o.counts.length:3);});
 }
 if(samples===0)return greedy(o.hand,o.ends,moves);
 const preferred=greedy(o.hand,o.ends,moves);let best=moves.findIndex(m=>JSON.stringify(m)===JSON.stringify(preferred));
 for(let i=0;i<moves.length;i++)if(values[i]!>values[best]!)best=i;
 return moves[best]!;
}
export const game:GameDefinition<State,Input,PublicView,PhoneView>={manifest,phases:['play','round-end','done'],inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput(s,id,rng,skill){const o=observe(s,id);return o?choose(o,rng,skill):null;}}};
