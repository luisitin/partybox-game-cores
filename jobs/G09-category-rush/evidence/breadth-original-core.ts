import {z} from 'zod';
import type {GameDefinition,GameManifest,GameEvent,InitContext,GameResults} from '../../../contract/contract';
import type {BotSkill} from '../../../contract/constants';
import {seedRng,nextInt,shuffle,hashString} from '../../../contract/rng';
import type {Rng} from '../../../contract/rng';
import {CATEGORIES,LETTERS} from '../content/categories';
import {firstLetter,sameAnswer} from './match';
import {groupsFor,scoreCategory} from './scoring';
import type {Input,State,Settings,PublicView,PrivateView,Category,RoundResult} from './model';
export type {Input,State,Settings} from './model';

export const inputSchema:z.ZodType<Input>=z.discriminatedUnion('type',[
  z.object({type:z.literal('submit'),answers:z.array(z.string().max(80)).length(12)}).strict(),
  z.object({type:z.literal('vote'),votes:z.array(z.boolean().nullable()).max(8)}).strict(),
  z.object({type:z.literal('next')}).strict(),
]);
export const manifest:GameManifest={
  id:'category-rush',name:'Category Rush',icon:'📝',tagline:'One letter. Twelve categories. Think differently.',
  description:'An original category game for 2–8 players. Race to fill twelve prompts, vote on creative answers, and score only answers nobody else wrote.',
  howToPlay:['Write one answer for each category, beginning with the round letter.',
    'Discuss answers and vote on whether each one fits the category.',
    'Valid unique answers score one point. Most points after all rounds wins.'],
  version:'1.0.0',minPlayers:2,maxPlayers:8,estimatedMinutes:20,tags:['words','classic'],
  presence:{needs:'voice-if-remote',note:'Discuss creative answers before voting.'},addedOn:'2026-10-08',
  supportsBots:true,saveable:true,contentLangs:['en'],
  settings:[{key:'rounds',label:'Rounds',type:'number',default:3,min:1,max:5,step:1},
    {key:'roundSeconds',label:'Writing time in seconds',type:'number',default:180,min:30,max:180,step:30}],
};
const known=(s:State,id:unknown):id is string=>typeof id==='string'&&Object.hasOwn(s.players,id);
const present=(s:State,id:string)=>s.players[id].connected&&!s.left.includes(id);
const finiteTime=(n:number)=>Number.isFinite(n)&&n>=0&&n<=1e15&&!Object.is(n,-0);
const safeNow=(n:number)=>finiteTime(n)?n:0;
const cleanAnswer=(s:string)=>s.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,80);
const dictionary=<T>(ids:readonly string[],value:(id:string)=>T):Record<string,T>=>Object.fromEntries(ids.map(id=>[id,value(id)]));
export function configuration(settings:InitContext['settings']):Settings {
  const number=(key:string,def:number,min:number,max:number,step:number)=>{
    const value=settings[key];return typeof value==='number'&&Number.isFinite(value)?
      Math.max(min,Math.min(max,Math.round(value/step)*step)):def;
  };
  return {rounds:number('rounds',3,1,5,1),roundSeconds:number('roundSeconds',180,30,180,30)};
}
function phase(s:State,id:string,now:number,ms:number|null):State {
  const startedAt=Math.max(now,s.phaseClock+1);
  return {...s,phaseClock:startedAt,phase:{id,startedAt,deadline:ms===null?null:startedAt+ms}};
}
function enterRound(s:State,now:number):State {
  const candidates=LETTERS.filter(letter=>!s.usedLetters.includes(letter));
  const [which,rng1]=nextInt(s.rng,0,candidates.length-1),letter=candidates[which];
  const pool=CATEGORIES.filter(category=>(category.answers[letter]?.length??0)>0);
  const [deck,rng]=shuffle(rng1,pool);
  // Prefer different themes, then fill remaining positions from the same seeded deck.
  const selected:typeof deck=[];const themes=new Set<string>();
  for(const category of deck)if(!themes.has(category.theme)&&selected.length<12){selected.push(category);themes.add(category.theme);}
  for(const category of deck)if(selected.length<12&&!selected.includes(category))selected.push(category);
  if(selected.length<12)throw new Error(`Insufficient original categories for ${letter}`);
  const categories:Category[]=selected.map(({id,prompt,clarification,theme})=>({id,prompt,clarification,theme}));
  return phase({...s,rng,letter,usedLetters:[...s.usedLetters,letter],categories,
    answers:dictionary(s.order,()=>Array<string>(12).fill('')),submitted:dictionary(s.order,()=>false),
    reviewIndex:0,votes:{},reviewed:[],roundResult:null},'answer',now,s.cfg.roundSeconds*1000);
}
export function init(ctx:InitContext):State {
  const order=ctx.players.map(p=>p.id);
  if(order.length<2||order.length>8||new Set(order).size!==order.length)throw new RangeError('Category Rush requires 2–8 distinct players');
  const now=safeNow(ctx.now);
  const state:State={phase:{id:'answer',startedAt:now,deadline:null},phaseClock:now-1,
    rng:seedRng(ctx.seed),players:Object.fromEntries(ctx.players.map(p=>[p.id,{...p}])),order,left:[],
    cfg:configuration(ctx.settings),round:1,letter:'',usedLetters:[],categories:[],answers:{},submitted:{},
    reviewIndex:0,votes:{},reviewed:[],scores:dictionary(order,()=>0),roundResult:null,history:[]};
  return enterRound(state,now);
}
function reviewMs(s:State,index:number):number {
  const words=[s.categories[index].prompt,s.categories[index].clarification,...groupsFor(s,index).map(g=>g.text)]
    .join(' ').trim().split(/\s+/).length;
  // Same documented readingMs formula as the absent SDK, plus time to discuss/vote.
  return Math.max(15_000,Math.ceil(1500+333*words*1.3)+10_000);
}
function enterReview(s:State,now:number):State {
  return phase({...s,reviewIndex:0,votes:{},reviewed:[]},'review',now,reviewMs(s,0));
}
function enterScores(s:State,now:number):State {
  const points=dictionary(s.order,()=>0);
  for(const category of s.reviewed)for(const group of category.groups)
    for(const id of group.owners)points[id]+=group.points;
  const result:RoundResult={round:s.round,letter:s.letter,categories:s.categories.map(c=>({...c})),points,entries:s.reviewed};
  const scores=dictionary(s.order,id=>s.scores[id]+points[id]);
  const readingWords=[...s.categories.map(c=>c.prompt),...s.reviewed.flatMap(c=>c.groups.map(g=>g.text)),
    ...s.order.map(id=>s.players[id].name),'Round complete. Valid unique answers score one point. Review the answers and points.']
    .join(' ').trim().split(/\s+/).length;
  return phase({...s,scores,roundResult:result,history:[...s.history,result]},'scores',now,
    Math.max(45_000,Math.ceil(1500+333*readingWords*1.3)));
}
function finish(s:State,now:number):State{return phase(s,'done',now,null);}
export function advance(s:State,now:number):State {
  if(s.phase.id==='answer')return enterReview(s,now);
  if(s.phase.id==='review'){
    const reviewed=[...s.reviewed,scoreCategory(s,s.reviewIndex)],index=s.reviewIndex+1;
    if(index===12)return enterScores({...s,reviewed},now);
    // One phase, a later data deadline: the engine can re-arm a second beat.
    const deadline=Math.max(now+reviewMs(s,index),(s.phase.deadline??now)+1);
    return {...s,reviewed,reviewIndex:index,votes:{},phase:{...s.phase,deadline}};
  }
  if(s.phase.id==='scores')return s.round>=s.cfg.rounds?finish(s,now):enterRound({...s,round:s.round+1},now);
  return s;
}
function closeIfDone(s:State,now:number):State {
  if(s.phase.paused||s.phase.id==='done')return s;
  const active=s.order.filter(id=>present(s,id));
  if(s.phase.id==='answer'&&active.every(id=>s.submitted[id]))return advance(s,now);
  if(s.phase.id==='review'&&active.every(id=>Object.hasOwn(s.votes,id)))return advance(s,now);
  return s;
}
// Faithful standalone composeReduce adapter: player -> speech -> VIP -> paused -> phase.
// Exact contract types are imported above. The workshop does not ship game-sdk.
export function reduce(s:State,event:GameEvent<Input>):State {
  if(event===null||typeof event!=='object'||!finiteTime(event.now))return s;
  if(event.type==='player'){
    if(!known(s,event.playerId)||typeof event.connected!=='boolean'||
      (event.gone!==undefined&&event.gone!=='left'&&event.gone!=='kicked'))return s;
    const id=event.playerId,gone=event.gone!==undefined,wasLeft=s.left.includes(id),connected=!gone&&!wasLeft&&event.connected;
    if(s.players[id].connected===connected&&(!gone||wasLeft))return s;
    const updated={...s,players:{...s.players,[id]:{...s.players[id],connected}},left:gone&&!wasLeft?[...s.left,id]:s.left};
    return closeIfDone(updated,event.now);
  }
  if(event.type==='speech'||event.type==='speechStart')return s;
  if(event.type==='vip'){
    if(s.phase.id==='done')return s;
    if(event.action==='end')return finish(s,event.now);
    if(event.action==='pause')return s.phase.paused?s:{...s,phase:{...s.phase,paused:{at:event.now}}};
    if(event.action==='resume'){
      if(!s.phase.paused)return s;
      const held=Math.max(0,event.now-s.phase.paused.at);
      return closeIfDone({...s,phase:{id:s.phase.id,startedAt:s.phase.startedAt,
        deadline:s.phase.deadline===null?null:s.phase.deadline+held}},event.now);
    }
    if(event.action==='skip'){
      const next=advance(s,event.now);
      return s.phase.paused&&next.phase.id!=='done'?{...next,phase:{...next.phase,paused:{at:event.now}}}:next;
    }
    return s;
  }
  if(s.phase.paused||s.phase.id==='done')return s;
  if(event.type==='timer')return event.phaseId===s.phase.id&&event.startedAt===s.phase.startedAt&&
    s.phase.deadline!==null&&event.now>=s.phase.deadline?advance(s,event.now):s;
  if(event.type!=='input'||!known(s,event.playerId)||!present(s,event.playerId))return s;
  const parsed=inputSchema.safeParse(event.input);if(!parsed.success)return s;
  const input=parsed.data,id=event.playerId;
  if(s.phase.id==='answer'&&input.type==='submit'&&!s.submitted[id])
    return closeIfDone({...s,answers:{...s.answers,[id]:input.answers.map(cleanAnswer)},submitted:{...s.submitted,[id]:true}},event.now);
  if(s.phase.id==='review'&&input.type==='vote'&&!Object.hasOwn(s.votes,id)&&input.votes.length===groupsFor(s,s.reviewIndex).length)
    return closeIfDone({...s,votes:{...s.votes,[id]:[...input.votes]}},event.now);
  if(s.phase.id==='scores'&&input.type==='next'&&event.vip===true)return advance(s,event.now);
  return s;
}
export function tvView(s:State):PublicView {
  const review=s.phase.id==='review'?{categoryIndex:s.reviewIndex,category:{...s.categories[s.reviewIndex]},
    groups:groupsFor(s,s.reviewIndex).map(g=>({id:g.id,text:g.text,duplicateCount:g.owners.length,eligible:g.eligible}))}:null;
  return {gameId:manifest.id,phaseId:s.phase.id,deadline:s.phase.deadline,paused:!!s.phase.paused,
    players:s.order.map(id=>({id,name:s.players[id].name,avatarId:s.players[id].avatarId,connected:s.players[id].connected,
      status:s.phase.id==='answer'?(s.submitted[id]?'submitted':'active'):s.phase.id==='review'?(Object.hasOwn(s.votes,id)?'submitted':'active'):'waiting',score:s.scores[id]})),
    round:s.round,totalRounds:s.cfg.rounds,letter:s.letter,categories:s.categories.map(c=>({...c})),review,
    roundResult:s.phase.id==='scores'||s.phase.id==='done'?structuredClone(s.roundResult):null,
    history:s.history.map(result=>structuredClone(result)),
    screen:s.phase.id==='review'?`category ${s.reviewIndex+1}`:s.phase.id,
    progressStep:{unit:'round',n:s.round,of:s.cfg.rounds},
    vipSkipLabel:s.phase.id==='answer'?'Finish writing':s.phase.id==='review'?`Next category (${s.reviewIndex+1} of 12)`:'Next round'};
}
export function controllerView(s:State,id:string):PrivateView {
  const valid=known(s,id),publicView=tvView(s);
  return {...publicView,me:{id,role:valid?'player':'spectator'},submitted:valid?s.submitted[id]:false,
    myAnswers:valid?[...s.answers[id]]:[],voted:valid&&Object.hasOwn(s.votes,id),myVotes:valid&&Object.hasOwn(s.votes,id)?[...s.votes[id]]:[]};
}
export function results(s:State):GameResults|null {
  if(s.phase.id!=='done')return null;
  const sorted=s.order.map(playerId=>({playerId,score:s.scores[playerId]})).sort((a,b)=>b.score-a.score||
    (a.playerId<b.playerId?-1:a.playerId>b.playerId?1:0));
  const ranking=sorted.map((item,index)=>({...item,rank:sorted.findIndex(x=>x.score===item.score)+1}));
  return {scores:{...s.scores},ranking,winnerIds:ranking.filter(x=>x.rank===1).map(x=>x.playerId),awards:[],
    headlineNote:ranking.filter(x=>x.rank===1).length>1?'Equal scores share the win.':'Valid unique answers decide the winner.'};
}
function sampleInput(s:State,id:string,rng:Rng,skill:BotSkill='normal'):Input|null {
  if(!known(s,id)||!present(s,id)||s.phase.paused)return null;
  if(s.phase.id==='answer'&&!s.submitted[id]){
    const used:string[]=[];
    const answers=s.categories.map(category=>{
      const source=CATEGORIES.find(c=>c.id===category.id)!;
      const bank=[...(source.answers[s.letter]??[])].filter(answer=>!used.some(old=>sameAnswer(answer,old)));
      if(bank.length===0||!rng.chance(skill==='easy'?0.55:skill==='normal'?0.82:0.98))return '';
      // Familiar options first. Strong samples less obvious members and diversifies
      // by seat/category without ever reading private submissions or ballots.
      const common=bank.slice(0,skill==='easy'?Math.min(2,bank.length):Math.min(4,bank.length));
      const rare=bank.length>2?bank.slice(Math.floor(bank.length/2)):bank;
      const choices=skill==='sharp'?rare:common;
      const offset=skill==='sharp'?(hashString(id+category.id+s.letter)%choices.length):0;
      const answer=choices[(rng.int(0,choices.length-1)+offset)%choices.length];used.push(answer);return answer;
    });
    return {type:'submit',answers};
  }
  if(s.phase.id==='review'&&!Object.hasOwn(s.votes,id)){
    const source=CATEGORIES.find(c=>c.id===s.categories[s.reviewIndex].id)!;
    const bank=source.answers[s.letter]??[];
    return {type:'vote',votes:groupsFor(s,s.reviewIndex).map(group=>
      !group.eligible?false:bank.some(answer=>sameAnswer(answer,group.text))?true:null)};
  }
  return null;
}
export const game:GameDefinition<State,Input,PublicView,PrivateView>={manifest,phases:['answer','review','scores','done'],
  inputSchema,init,reduce,tvView,controllerView,results,bot:{sampleInput}};
