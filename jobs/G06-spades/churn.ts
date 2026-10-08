import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createRng} from '../../contract/rng.ts';
import type {GameEvent} from '../../contract/contract.ts';
import {game,type State,type Input} from './core.ts';
import {stateSchema} from './data-schema.ts';
import {context,conservation} from './runner.ts';
const source=createRng(0x60006006),seeds=new Set([1,2,3]);while(seeds.size<1003)seeds.add(source.int(0,0xffffffff));
const counts:Record<string,number>={},phases=new Set<string>();let events=0,maxStateBytes=0,protoCases=0,privacyComparisons=0,botPrivacyComparisons=0;
const clock=performance.now();
for(const seed of seeds){
 const n=3+seed%2,ctx=context(n,seed,{cutDeck:seed>>>2&1?'stock':'low-club',cutLead:seed>>>3&1?'club':'dealer',nilValue:seed>>>4&1?50:100,failedNilCounts:!!(seed>>>5&1),mercy:!!(seed>>>6&1),blindGap:0,blind:!!(seed>>>8&1),exchange:!!(seed>>>9&1)});
 if(seed%7===0){protoCases++;for(let i=0;i<3;i++)ctx.players[i]!.id=['__proto__','constructor','toString'][i]!;}
 let s=game.init(ctx),replayed:State=JSON.parse(JSON.stringify(s)),now=0;
 const rng=createRng(seed^0xc606),botRngs=s.seats.map((_,i)=>createRng(seed^Math.imul(i+1,13)));
 function send(event:GameEvent<Input>){
  const before=JSON.stringify(s),next=game.reduce(s,event);assert.equal(JSON.stringify(s),before,'reducer must leave its input state intact');
  replayed=game.reduce(replayed,event);const encoded=JSON.stringify(next);assert.equal(encoded,JSON.stringify(replayed));assert(Buffer.byteLength(encoded)<=256*1024);maxStateBytes=Math.max(maxStateBytes,Buffer.byteLength(encoded));
  stateSchema.parse(next);conservation(next);s=next;now=Math.max(now,event.now);events++;phases.add(s.phase.id);const key=event.type==='vip'?event.action:event.type==='player'?event.gone??(event.connected?'reconnect':'drop'):event.type;counts[key]=(counts[key]??0)+1;
  assert.deepEqual(Object.keys(s.players),s.seats);for(const left of s.left)assert.equal(s.players[left]!.connected,false);
 }
 function privacy(){
  for(const viewer of [...s.seats,'spectator']){
   const changed:State=JSON.parse(JSON.stringify(s)),others=s.seats.filter(id=>id!==viewer&&s.hands[id]!.length);
   if(others.length>=2){const a=others[0]!,b=others[1]!;[changed.hands[a]![0],changed.hands[b]![0]]=[changed.hands[b]![0]!,changed.hands[a]![0]!];}
   else if(changed.stock!==null&&others.length){const a=others[0]!;[changed.hands[a]![0],changed.stock]=[changed.stock,changed.hands[a]![0]!];}
   changed.rng.seed=(changed.rng.seed^0x1234)>>>0;changed.rng.step++;
   assert.deepEqual(game.tvView(changed),game.tvView(s));assert.deepEqual(game.controllerView(changed,viewer),game.controllerView(s,viewer));privacyComparisons++;
   for(const skill of ['easy','normal','sharp'] as const){assert.deepEqual(game.bot.sampleInput(changed,viewer,createRng(6006),skill),game.bot.sampleInput(s,viewer,createRng(6006),skill));botPrivacyComparisons++;}
  }
 }
 for(let step=0;step<180&&s.phase.id!=='done';step++){
  now=Math.max(now+1,s.phase.startedAt+1);const choice=rng.int(0,99),id=s.seats[rng.int(0,n-1)]!;
  if(s.phase.paused){
   if(choice<25){const before={...s.phase};send({type:'player',playerId:id,connected:false,...choice%2?{gone:'left' as const}:{},now});assert.deepEqual(s.phase,before,'a paused drop must not advance the phase');}
   else if(choice<75)send({type:'vip',action:'resume',now:now+rng.int(1,20000)});
   else {const before=s;send(choice%2?{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now}:{type:'input',playerId:id,input:{type:'play',card:0},now});assert.equal(s,before);}
  }else if(choice<12)send({type:'player',playerId:id,connected:rng.chance(.5),now});
  else if(choice<16)send({type:'player',playerId:id,connected:false,gone:choice%2?'left':'kicked',now});
  else if(choice<22)send({type:'vip',action:'pause',now});
  else if(choice<28){const before=s;send({type:'input',playerId:'spectator',input:{type:'next'},now});assert.equal(s,before);}
  else if(choice<34){const before=s;send({type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt-1,now});assert.equal(s,before);}
  else if(s.phase.deadline!==null)send({type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:Math.max(now,s.phase.deadline)});
  else {
   const index=s.phase.id==='exchange'?s.seats.indexOf(s.exchangePlan[s.exchangeStep]!.from):s.turn,owner=s.seats[index]!;
   const value=s.phase.id==='blind'&&rng.chance(.5)?{type:'blind-nil' as const}:game.bot.sampleInput(s,owner,botRngs[index]!,(['easy','normal','sharp'] as const)[step%3]!);
   if(value&&s.players[owner]!.connected&&!s.left.includes(owner)){assert(game.inputSchema.safeParse(value).success);send({type:'input',playerId:owner,input:value,now});}
   else send({type:'vip',action:'skip',now});
  }
  if(step%20===0)privacy();
 }
 const beforeScores=[...s.scores];send({type:'vip',action:'end',now:Math.max(now+1,s.phase.startedAt+1)});assert.deepEqual(s.scores,beforeScores);
 const result=game.results(s)!;assert(result);assert.deepEqual(Object.keys(result.scores),ctx.players.map(p=>p.id));assert(result.ranking.length===n&&Object.values(result.scores).every(Number.isFinite));privacy();
}
assert.deepEqual([...phases].sort(),[...game.phases].sort());for(const key of ['pause','resume','drop','reconnect','left','kicked','timer','input','skip','end'])assert(counts[key]!>0,key);
const report={seeds:seeds.size,randomSeed:0x60006006,seedsOneTwoThree:true,events,phases:[...phases].sort(),counts,maxStateBytes,protoCases,privacyComparisons,botPrivacyComparisons};
if(process.argv.includes('--write'))writeFileSync('churn-results.json',JSON.stringify(report,null,2)+'\n');else assert.deepEqual(report,JSON.parse(readFileSync('churn-results.json','utf8')));
console.log(JSON.stringify({...report,durationMs:performance.now()-clock},null,2));
