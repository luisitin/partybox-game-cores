import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {game,type State,type Input} from './core.ts';
import type {GameEvent} from '../../contract/contract.ts';
function freeze<T>(o:T):T{if(o&&typeof o==='object'){Object.freeze(o);for(const v of Object.values(o))freeze(v);}return o;}
interface PhaseReport {phase:string;samples:number;ignoredEvents:number;pausedEvents:number;privateComparisons:number;botComparisons:number;acceptedActions:number;detachedViews:number;}
const random=createRng(0x6042026),reports:PhaseReport[]=[];
for(const phase of game.phases){
 const fixture:State=JSON.parse(readFileSync(`fixtures/${phase}.json`,'utf8'));
 let ignoredEvents=0,pausedEvents=0,privateComparisons=0,botComparisons=0,acceptedActions=0,detachedViews=0;
 for(let sample=0;sample<1000;sample++){
  const seed=random.int(0,0xffffffff),s=freeze(structuredClone(fixture)),now=s.phase.startedAt+1;
  const values:Input[]=[{type:'answer',value:1},{type:'write',text:'A legal fake'},{type:'vote',choice:'o0'},{type:'next'}];
  const events:unknown[]=[null,undefined,{},[],{type:'unknown',now},{type:'speechStart',key:'anything',now},
   {type:'vip',action:'unknown',now},{type:'vip',action:'resume',now},
   {type:'player',playerId:'unknown',connected:false,now},{type:'player',playerId:'p0',connected:'false',now},
   {type:'input',playerId:'p0',input:{type:'answer',value:NaN},now},{type:'input',playerId:'p0',input:{type:'next',extra:true},now},
   {type:'timer',phaseId:phase,startedAt:s.phase.startedAt,now:Infinity},
   {type:'timer',phaseId:'stale',startedAt:s.phase.startedAt,now:s.phase.deadline??now},
   {type:'timer',phaseId:phase,startedAt:s.phase.startedAt-1,now:s.phase.deadline??now}];
  if(s.phase.deadline!==null)events.push({type:'timer',phaseId:phase,startedAt:s.phase.startedAt,now:s.phase.deadline-1});
  for(const id of ['unknown','__proto__','constructor'])for(const input of values)events.push({type:'input',playerId:id,input,now});
  for(const event of createRng(seed).shuffle(events)){assert.equal(game.reduce(s,event as GameEvent<Input>),s,`${phase}: ${JSON.stringify(event)}`);ignoredEvents++;}
  if(phase!=='done'){
   const paused=freeze(game.reduce(s,{type:'vip',action:'pause',now}));
   for(const input of values){assert.equal(game.reduce(paused,{type:'input',playerId:'p0',input,now:now+1}),paused);pausedEvents++;}
   assert.equal(game.reduce(paused,{type:'timer',phaseId:phase,startedAt:s.phase.startedAt,now:s.phase.deadline!}),paused);pausedEvents++;
  }
  for(const id of [...s.seats,'unknown','__proto__','constructor']){
   const view=game.controllerView(s,id);
   if(!s.seats.includes(id)){assert.equal(view.inputType,null);assert.equal(view.mine,null);assert.equal(view.me.role,'spectator');}
   if(['wheel','demo','answer','write','vote'].includes(phase)){
    const other=structuredClone(s);
    other.question.correct=other.question.kind==='bluff'?`Hidden truth ${seed}`:Number(other.question.correct)+1;
    for(const key of Object.keys(other.responses))if(key!==id)other.responses[key]=typeof other.responses[key]==='number'?Number(other.responses[key])+1:`Hidden submission ${seed}`;
    for(const key of Object.keys(other.votes))if(key!==id)other.votes[key]='o99';
    const others=s.seats.filter(key=>key!==id);
    other.knowledge=other.knowledge.filter(key=>key===id).concat(others);
    other.options=other.options.map(o=>({...o,correct:!o.correct,owners:o.owners.map(key=>key===id?key:others[(others.indexOf(key)+1)%others.length]!)}));
    assert.deepEqual(game.tvView(other),game.tvView(s));assert.deepEqual(game.controllerView(other,id),view);privateComparisons+=2;
    for(const skill of ['easy','normal','sharp'] as const){assert.deepEqual(game.bot.sampleInput(other,id,createRng(seed),skill),game.bot.sampleInput(s,id,createRng(seed),skill));botComparisons++;}
   }
   for(const skill of ['easy','normal','sharp'] as const){
    const action=game.bot.sampleInput(s,id,createRng(seed),skill);
    if(action){assert(game.inputSchema.safeParse(action).success);assert.notEqual(game.reduce(s,{type:'input',playerId:id,input:action,now}),s,`${phase}/${id}/${skill}`);acceptedActions++;}
   }
   view.players[0]!.name='Changed detached controller';assert.notEqual(s.players[s.seats[0]!]!.name,view.players[0]!.name);detachedViews++;
  }
  const tv=game.tvView(s);tv.players[0]!.name='Changed detached TV';assert.notEqual(s.players[s.seats[0]!]!.name,tv.players[0]!.name);detachedViews++;
  assert.equal(JSON.stringify(s),JSON.stringify(fixture));
 }
 reports.push({phase,samples:1000,ignoredEvents,pausedEvents,privateComparisons,botComparisons,acceptedActions,detachedViews});
}
const total=(key:Exclude<keyof PhaseReport,'phase'>)=>reports.reduce((n,r)=>n+r[key],0);
const report={randomSeed:0x6042026,states:total('samples'),ignoredEvents:total('ignoredEvents'),pausedEvents:total('pausedEvents'),privateComparisons:total('privateComparisons'),botComparisons:total('botComparisons'),acceptedActions:total('acceptedActions'),detachedViews:total('detachedViews'),failures:0,phases:reports};
writeFileSync('phase-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
