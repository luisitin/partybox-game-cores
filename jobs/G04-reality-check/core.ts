import {z} from 'zod';
import type {GameDefinition,GameStateBase,GameManifest,InitContext,GameEvent,TvView,ControllerView,GameResults} from '../../contract/contract.ts';
import {seedRng,nextInt,shuffle,type Rng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
import {catalogSchema,sampleRows,realms,type Row,type RealmId,type Kind} from './samples.ts';
import {quickScore,cleanText,normalize} from './scoring.ts';
import {fromView} from './bots.ts';

export const inputSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('answer'),value:z.number().finite().min(-100).max(1e12)}).strict(),
 z.object({type:z.literal('write'),text:z.string().min(1).max(160)}).strict(),
 z.object({type:z.literal('vote'),choice:z.string().regex(/^o\d{1,2}$/)}).strict(),
 z.object({type:z.literal('next')}).strict()
]);
export type Input=z.infer<typeof inputSchema>;
export type Phase='wheel'|'demo'|'answer'|'write'|'vote'|'reveal'|'done';
export interface Option {id:string;text:string;owners:string[];correct:boolean;}
export interface RoundReport {round:number;realm:RealmId;prompt:string;kind:Kind;correct:string|number;awards:Record<string,number>;answers:Record<string,string|number>;options:Option[];votes:Record<string,string>;multiplier:number;fact:string;}
export interface State extends GameStateBase {
 seats:string[];left:string[];settings:{mode:'quick'|'mixed'|'bluff';rounds:number};
 order:RealmId[];round:number;seen:RealmId[];used:string[];
 question:Row;example:Row;responses:Record<string,string|number>;
 options:Option[];votes:Record<string,string>;knowledge:string[];
 scores:Record<string,number>;history:RoundReport[];last:RoundReport|null;
}
export interface QuestionView {realm:RealmId;name:string;kind:Kind;prompt:string;hint:string;min?:number;max?:number;left?:string;right?:string;}
export interface PublicView extends TvView {round:number;rounds:number;mode:string;realm:RealmId;realms:typeof realms;question:QuestionView|null;demo:{question:QuestionView;correct:string|number}|null;options:{id:string;text:string}[];received:number;last:RoundReport|null;fictional:boolean;}
export interface PhoneView extends PublicView,ControllerView {inputType:'answer'|'write'|'vote'|'next'|null;mine:string|number|null;foundTruth:boolean;menu:{id:string;text:string;mine:boolean}[];history:RoundReport[];}
export const manifest:GameManifest={id:'reality-check',name:'Reality Check',icon:'🧭',tagline:'Guess the scale. Write the bluff. Find the truth.',description:'An offline quiz and fake-answer party game with fictional workshop examples in eight realms.',howToPlay:['A realm wheel brings a question; its first appearance teaches the rules.','Estimate, choose a date, or write a fake and vote for the truth.','Earn points for accuracy and fooled voters; the final round doubles points.'],version:'0.1.0',minPlayers:2,maxPlayers:8,estimatedMinutes:12,estimate:{fixedSeconds:80,perRoundSeconds:78,perPlayerPerRoundSeconds:0,roundsSetting:'rounds'},tags:['trivia','bluff'],presence:{needs:'anywhere'},addedOn:'2026-10-08',supportsBots:true,saveable:true,settings:[
 {key:'mode',label:'Realms',type:'select',default:'mixed',options:[{value:'quick',label:'Quick only'},{value:'mixed',label:'Mixed'},{value:'bluff',label:'Bluff only'}]},
 {key:'rounds',label:'Rounds',type:'select',default:'8',options:[{value:'4',label:'4 — short'},{value:'8',label:'8 — standard'},{value:'12',label:'12 — long'}]}
]};
const durations:Record<Exclude<Phase,'done'>,number>={wheel:3000,demo:10000,answer:50000,write:40000,vote:30000,reveal:15000};
const copy=<T>(value:T):T=>structuredClone(value);
const member=(s:State,id:string)=>Object.hasOwn(s.players,id)&&s.seats.includes(id);
const eligible=(s:State)=>s.seats.filter(id=>s.players[id]!.connected&&!s.left.includes(id));
const voted=(s:State,id:string)=>Object.hasOwn(s.votes,id)||s.knowledge.includes(id);
const allReady=(s:State)=>s.phase.id==='answer'||s.phase.id==='write'?eligible(s).every(id=>Object.hasOwn(s.responses,id)):s.phase.id==='vote'?eligible(s).every(id=>voted(s,id)):false;
function enter(s:State,id:Phase,now:number):State{const startedAt=Math.max(now,s.phase.startedAt+1);return {...s,phase:{id,startedAt,deadline:id==='done'?null:startedAt+durations[id]}};}
export function validAnswer(row:Row,value:number):boolean{
 if(!Number.isFinite(value)||row.kind==='bluff')return false;
 if(row.kind==='choice')return value===0||value===1;
 if(value<row.min||value>row.max)return false;
 if(row.kind==='century')return Number.isInteger(value)&&value!==0;
 if(row.kind==='decade')return Number.isInteger(value)&&value%10===0;
 return value>=0;
}
function publicQuestion(row:Row):QuestionView{
 const out:QuestionView={realm:row.realm,name:realms.find(r=>r.id===row.realm)!.name,kind:row.kind,prompt:row.prompt,hint:row.hint};
 if(row.kind==='choice'){out.left=row.left;out.right=row.right;}
 else if(row.kind!=='bluff'){out.min=row.min;out.max=row.max;}
 return out;
}
function makeVote(s:State,now:number):State{
 const groups=new Map<string,{text:string;owners:string[]}>(),knowledge:string[]=[];
 const truth=String(s.question.correct),key=normalize(truth);
 for(const id of s.seats){const answer=s.responses[id];if(typeof answer!=='string'||!normalize(answer))continue;
  const normalized=normalize(answer);if(normalized===key){knowledge.push(id);continue;}
  const group=groups.get(normalized);if(group)group.owners.push(id);else groups.set(normalized,{text:answer,owners:[id]});
 }
 const choices=[{text:truth,owners:[] as string[],correct:true},...Array.from(groups.values()).map(o=>({...o,correct:false}))];
 const [ordered,rng]=shuffle(s.rng,choices);const options=ordered.map((o,i)=>({id:`o${i}`,...o}));
 return enter({...s,rng,options,knowledge,votes:{}},'vote',now);
}
export function reveal(s:State,now:number):State{
 const awards=Object.fromEntries(s.seats.map(id=>[id,0]));
 if(s.question.kind==='bluff'){
  for(const id of s.seats){if(s.knowledge.includes(id)){awards[id]!+=1000;continue;}
   const choice=s.options.find(o=>o.id===s.votes[id]);if(!choice)continue;
   if(choice.correct)awards[id]!+=1000;
   else if(!choice.owners.includes(id))for(const owner of choice.owners)awards[owner]!+=Math.floor(500/choice.owners.length);
  }
 }else for(const id of s.seats){const value=s.responses[id];if(typeof value==='number')awards[id]=quickScore(s.question,value);}
 const multiplier=s.round===s.settings.rounds?2:1;
 for(const id of s.seats)awards[id]!*=multiplier;
 const scores=Object.fromEntries(s.seats.map(id=>[id,s.scores[id]!+awards[id]!]));
 const last:RoundReport={round:s.round,realm:s.question.realm,prompt:s.question.prompt,kind:s.question.kind,correct:s.question.correct,awards,answers:{...s.responses},options:copy(s.options),votes:{...s.votes},multiplier,fact:s.question.fact};
 return enter({...s,scores,last,history:[...s.history,last].slice(-12)},'reveal',now);
}

/** Local content factory; its default implements the exact shared InitContext. */
export function createGame(content:readonly Row[]=sampleRows):GameDefinition<State,Input,PublicView,PhoneView>{
 const catalog=catalogSchema.parse(content);
 const byRealm=Object.fromEntries(realms.map(r=>[r.id,catalog.filter(q=>q.realm===r.id)])) as Record<RealmId,Row[]>;
 function startRound(s:State,now:number):State{
  const realm=s.order[s.round-1]!;const rows=byRealm[realm];const example=rows[0]!;
  const available=rows.slice(1).filter(row=>!s.used.includes(row.id));const pool=available.length?available:rows.slice(1);
  const [index,rng]=nextInt(s.rng,0,pool.length-1);const question={...pool[index]!};
  return enter({...s,rng,question,example:{...example},used:[...s.used,question.id],responses:{},options:[],votes:{},knowledge:[]},'wheel',now);
 }
 function init(ctx:InitContext):State{
  const seats=ctx.players.map(p=>p.id);if(seats.length<2||seats.length>8||new Set(seats).size!==seats.length)throw new Error('Reality Check requires 2–8 distinct seats');
  const mode=ctx.settings.mode==='quick'?'quick':ctx.settings.mode==='bluff'?'bluff':'mixed';
  const rounds=[4,8,12].includes(Number(ctx.settings.rounds))?Number(ctx.settings.rounds):8;
  let rng=seedRng(ctx.seed);const quick=realms.filter(r=>r.kind!=='bluff').map(r=>r.id),bluff=realms.filter(r=>r.kind==='bluff').map(r=>r.id);
  let q:RealmId[],b:RealmId[];[q,rng]=shuffle(rng,quick);[b,rng]=shuffle(rng,bluff);
  const picked=Array.from({length:rounds},(_,i)=>mode==='quick'?q[i%q.length]!:mode==='bluff'?b[i%b.length]!:i%2===0?q[Math.floor(i/2)%q.length]!:b[Math.floor(i/2)%b.length]!);
  let order:RealmId[];[order,rng]=shuffle(rng,picked);
  const s:State={players:Object.fromEntries(ctx.players.map(p=>[p.id,{...p}])),seats,left:[],phase:{id:'wheel',startedAt:ctx.now-1,deadline:null},rng,settings:{mode,rounds},order,round:1,seen:[],used:[],question:{...catalog[0]!},example:{...catalog[0]!},responses:{},options:[],votes:{},knowledge:[],scores:Object.fromEntries(seats.map(id=>[id,0])),history:[],last:null};
  return startRound(s,ctx.now);
 }
 function advance(s:State,now:number):State{
  if(s.phase.id==='wheel'){
   if(!s.seen.includes(s.question.realm))return enter({...s,seen:[...s.seen,s.question.realm]},'demo',now);
   return enter(s,s.question.kind==='bluff'?'write':'answer',now);
  }
  if(s.phase.id==='demo')return enter(s,s.question.kind==='bluff'?'write':'answer',now);
  if(s.phase.id==='answer'||s.phase.id==='vote')return reveal(s,now);
  if(s.phase.id==='write'){const n=makeVote(s,now);return allReady(n)?reveal(n,now):n;}
  if(s.phase.id==='reveal')return s.round===s.settings.rounds?enter(s,'done',now):startRound({...s,round:s.round+1},now);
  return s;
 }
 function reduce(s:State,event:GameEvent<Input>):State{
  if(!event||typeof event!=='object'||!Number.isFinite(event.now))return s;
  if(event.type==='player'){
   if(!member(s,event.playerId)||typeof event.connected!=='boolean')return s;
   const left=event.gone&&!s.left.includes(event.playerId)?[...s.left,event.playerId]:s.left;
   const n={...s,left,players:{...s.players,[event.playerId]:{...s.players[event.playerId]!,connected:event.connected&&!left.includes(event.playerId)}}};
   return !n.phase.paused&&allReady(n)?advance(n,event.now):n;
  }
  if(event.type==='vip'){
   if(event.action==='end')return s.phase.id==='done'?s:enter(s,'done',event.now);
   if(event.action==='pause')return s.phase.paused||s.phase.id==='done'?s:{...s,phase:{...s.phase,paused:{at:event.now}}};
   if(event.action==='resume'){
    if(!s.phase.paused||event.now<s.phase.paused.at)return s;
    const delay=event.now-s.phase.paused.at;const {paused,...rest}=s.phase;
    const n={...s,phase:{...rest,deadline:rest.deadline===null?null:rest.deadline+delay}};
    return allReady(n)?advance(n,event.now):n;
   }
   return event.action==='skip'&&!s.phase.paused?advance(s,event.now):s;
  }
  if(s.phase.paused||s.phase.id==='done')return s;
  if(event.type==='timer')return event.phaseId===s.phase.id&&event.startedAt===s.phase.startedAt&&s.phase.deadline!==null&&event.now>=s.phase.deadline?advance(s,event.now):s;
  if(event.type!=='input'||!member(s,event.playerId)||!eligible(s).includes(event.playerId))return s;
  const parsed=inputSchema.safeParse(event.input);if(!parsed.success)return s;const input=parsed.data,id=event.playerId;
  if(input.type==='next')return s.phase.id==='reveal'?advance(s,event.now):s;
  if(input.type==='answer'){
   if(s.phase.id!=='answer'||Object.hasOwn(s.responses,id)||!validAnswer(s.question,input.value))return s;
   const n={...s,responses:{...s.responses,[id]:input.value}};return allReady(n)?advance(n,event.now):n;
  }
  if(input.type==='write'){
   const text=cleanText(input.text);
   if(s.phase.id!=='write'||Object.hasOwn(s.responses,id)||text.length>160||!normalize(text))return s;
   const n={...s,responses:{...s.responses,[id]:text}};return allReady(n)?advance(n,event.now):n;
  }
  if(input.type==='vote'){
   const option=s.options.find(o=>o.id===input.choice);
   if(s.phase.id!=='vote'||voted(s,id)||!option||option.owners.includes(id))return s;
   const n={...s,votes:{...s.votes,[id]:input.choice}};return allReady(n)?advance(n,event.now):n;
  }
  return s;
 }
 return {manifest,phases:['wheel','demo','answer','write','vote','reveal','done'],inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput(s,id,rng,skill){return fromView(controllerView(s,id),rng,skill);}}};
}
export function tvView(s:State):PublicView{
 const responding=s.phase.id==='answer'||s.phase.id==='write';
 return {gameId:manifest.id,phaseId:s.phase.id,deadline:s.phase.deadline,paused:!!s.phase.paused,players:s.seats.map(id=>({...s.players[id]!,score:s.scores[id],status:(responding?!Object.hasOwn(s.responses,id):s.phase.id==='vote'?!Object.hasOwn(s.votes,id):false)&&!s.left.includes(id)?'active':'waiting'})),round:s.round,rounds:s.settings.rounds,mode:s.settings.mode,realm:s.question.realm,realms:realms.map(r=>({...r})),question:['answer','write','vote','reveal'].includes(s.phase.id)?publicQuestion(s.question):null,demo:s.phase.id==='demo'?{question:publicQuestion(s.example),correct:s.example.correct}:null,options:['vote','reveal'].includes(s.phase.id)?s.options.map(o=>({id:o.id,text:o.text})):[],received:responding?Object.keys(s.responses).length:s.phase.id==='vote'?Object.keys(s.votes).length:0,last:s.last?copy(s.last):null,fictional:true};
}
export function controllerView(s:State,id:string):PhoneView{
 const can=member(s,id)&&eligible(s).includes(id)&&!s.phase.paused;
 const inputType=can?(s.phase.id==='answer'&&!Object.hasOwn(s.responses,id)?'answer':s.phase.id==='write'&&!Object.hasOwn(s.responses,id)?'write':s.phase.id==='vote'&&!voted(s,id)?'vote':s.phase.id==='reveal'?'next':null):null;
 return {...tvView(s),me:{id,role:member(s,id)?'player':'spectator'},inputType,mine:member(s,id)&&Object.hasOwn(s.responses,id)?s.responses[id]!:null,foundTruth:member(s,id)&&s.phase.id==='vote'&&s.knowledge.includes(id),menu:s.phase.id==='vote'?s.options.map(o=>({id:o.id,text:o.text,mine:member(s,id)&&o.owners.includes(id)})):[],history:copy(s.history)};
}
export function results(s:State):GameResults|null{
 if(s.phase.id!=='done')return null;const max=Math.max(...s.seats.map(id=>s.scores[id]!));
 return {scores:{...s.scores},ranking:s.seats.map(id=>({playerId:id,score:s.scores[id]!,rank:1+s.seats.filter(other=>s.scores[other]!>s.scores[id]!).length})),winnerIds:s.seats.filter(id=>s.scores[id]===max),awards:[]};
}
export const game=createGame();
export const init=game.init,reduce=game.reduce;
