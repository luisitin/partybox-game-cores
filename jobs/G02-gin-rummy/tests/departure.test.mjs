import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {game} from '../dist/core.mjs';
import {initial,rng,freeze,invariant} from './helpers.mjs';
const available=(s,id)=>s.players[id].connected&&!s.left.includes(id);
const ready=s=>s.finished||!!s.phase.paused||s.phase.id==='round-end'||available(s,s.turn);
test('departures in every live phase finish the absent turn without exposing its hand',async()=>{
 for(const phase of ['upcard','draw','discard','layoff']){
  const s=JSON.parse(await readFile(`fixtures/${phase}.json`,'utf8'));freeze(s);
  const before=JSON.stringify(s),id=s.turn,event={type:'player',playerId:id,connected:false,gone:'left',now:s.phaseClock};
  const a=game.reduce(s,event),b=game.reduce(s,event);invariant(a);
  assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(JSON.stringify(s),before);
  assert(ready(a));assert(!a.phase.paused);assert(!available(a,id));
  assert.deepEqual(game.controllerView(a,id).legal,[]);assert.deepEqual(game.controllerView(a,id).handCards,[]);
  assert.equal(game.bot.sampleInput(a,id,rng(1),'normal'),null);
 }
});
test('1000 departure/drop cases and 120 full matches never leave an absent seat blocking play',()=>{
 let events=0,maxAutomatedTransitions=0;
 for(let seed=1;seed<=1000;seed++){
  let s=initial(seed,2+seed%3,{variant:seed%2?'standard':'oklahoma'});
  const event={type:'player',playerId:s.turn,connected:false,...(seed%2?{gone:'left'}:{}),now:s.phaseClock};
  s=game.reduce(s,event);assert(ready(s));invariant(s);events++;
 }
 for(const count of [2,3,4])for(const variant of ['standard','oklahoma'])for(let seed=1;seed<=20;seed++){
  let s=initial(seed,count,{variant});const random=rng(seed),alive=count===2?s.active[1]:s.waiting.at(-1);
  for(const id of s.order)if(id!==alive){s=game.reduce(s,{type:'player',playerId:id,connected:false,gone:'left',now:s.phaseClock});events++;}
  for(let step=0;step<10000&&!s.finished;step++){
   assert(ready(s));assert(!s.phase.paused);const actor=s.phase.id==='round-end'?alive:s.turn;
   assert.equal(actor,alive);const input=game.bot.sampleInput(s,actor,random,'normal');assert(input);
   const oldClock=s.phaseClock,next=game.reduce(s,{type:'input',playerId:actor,input,now:oldClock});
   assert.notEqual(next,s);maxAutomatedTransitions=Math.max(maxAutomatedTransitions,next.phaseClock-oldClock);
   s=next;events++;invariant(s);
  }
  assert(s.finished);assert.deepEqual(Object.keys(game.results(s).scores).sort(),s.order.slice().sort());
 }
 console.log(JSON.stringify({suite:'departures',initialCases:1000,completeMatches:120,events,maxAutomatedTransitions}));
});
test('empty rooms pause, reconnect resumes only an automatic pause, and permanent leaves cannot rejoin',()=>{
 let s=initial(9,2,{turnSeconds:10});
 for(const id of s.order)s=game.reduce(s,{type:'player',playerId:id,connected:false,now:100});
 assert(s.phase.paused);assert(s.roomEmpty);assert(!s.finished);const oldDeadline=s.phase.deadline;
 const live=game.reduce(s,{type:'player',playerId:s.order[0],connected:true,now:5100});
 assert(!live.phase.paused);assert(!live.roomEmpty);assert(ready(live));
 if(live.phase.id===s.phase.id&&live.phase.startedAt===s.phase.startedAt)assert.equal(live.phase.deadline,oldDeadline+5000);
 let paused=game.reduce(initial(9),{type:'vip',action:'pause',now:10});
 for(const id of paused.order)paused=game.reduce(paused,{type:'player',playerId:id,connected:false,now:20});
 const rejoined=game.reduce(paused,{type:'player',playerId:paused.order[0],connected:true,now:30});
 assert(rejoined.phase.paused);assert(!rejoined.roomEmpty);
 let gone=initial(9);for(const id of gone.order)gone=game.reduce(gone,{type:'player',playerId:id,connected:false,gone:'left',now:10});
 assert(gone.roomEmpty);assert(gone.phase.paused);
 const never=game.reduce(gone,{type:'player',playerId:gone.order[0],connected:true,now:20});assert(!never.players[gone.order[0]].connected);
 const end=game.reduce(never,{type:'vip',action:'end',now:30});assert(game.results(end));invariant(end);
});
test('departures during VIP pause drain only on resume; malformed control events do nothing',()=>{
 const initialState=initial(1),id=initialState.turn;
 const paused=game.reduce(initialState,{type:'vip',action:'pause',now:10});
 const dropped=game.reduce(paused,{type:'player',playerId:id,connected:false,gone:'kicked',now:20});
 assert.equal(dropped.phase.id,paused.phase.id);assert.equal(dropped.phase.startedAt,paused.phase.startedAt);
 const resumed=game.reduce(dropped,{type:'vip',action:'resume',now:30});assert(ready(resumed));assert(!resumed.phase.paused);
 for(const e of [{type:'vip',action:'unknown',now:1},{type:'player',playerId:id,connected:'no',now:1},{type:'player',playerId:id,connected:false,gone:'unknown',now:1}])assert.equal(game.reduce(initialState,e),initialState);
});
