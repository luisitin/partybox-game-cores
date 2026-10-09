import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
import {freeze,invariant} from './helpers.mjs';

const context=(seed,count,variant,mask,turnSeconds=0)=>({
 players:Array.from({length:count},(_,i)=>({id:'p'+i,name:'Seat '+i,avatarId:'face'+i,connected:!!(mask&(1<<i))})),
 seed,now:100,settings:{mode:count===2?'duel':'rotation',variant,turnSeconds}
});
const ready=s=>s.finished||!!s.phase.paused||s.phase.id==='round-end'||s.players[s.turn].connected;

test('known initial presence is handled before either player needs to send an event',()=>{
 let cases=0;
 for(const count of [2,3,4])for(const variant of ['standard','oklahoma'])for(const seed of [1,2,3])for(let mask=0;mask<(1<<count);mask++)for(const clock of [0,10]){
  const ctx=context(seed,count,variant,mask,clock),before=JSON.stringify(ctx);freeze(ctx);
  const s=game.init(ctx),repeat=game.init(ctx);invariant(s);
  assert.equal(JSON.stringify(ctx),before);assert.deepEqual(s,repeat);assert(ready(s));
  if(mask===0){
   assert(s.roomEmpty);assert(s.phase.paused);assert.equal(s.phase.paused.at,ctx.now);
   assert.equal(s.phase.id,'upcard');assert.equal(s.publicLog.length,0);
  }else{
   assert(!s.roomEmpty);assert(!s.phase.paused);
   if(s.finished)assert(game.results(s));
   else assert(s.order.some(id=>game.controllerView(s,id).legal.length>0));
  }
  for(const id of s.order)if(!s.players[id].connected){
   assert.deepEqual(game.controllerView(s,id).handCards,[]);assert.deepEqual(game.controllerView(s,id).legal,[]);
  }
  cases++;
 }
 assert.equal(cases,336);
 console.log(JSON.stringify({suite:'initial-presence-exhaustive',cases,connectionMasks:'all',counts:[2,3,4],variants:['standard','oklahoma'],clocks:[0,10]}));
});

test('1000 seeded initial presence patterns are playable or paused without a duplicate drop event',()=>{
 for(let seed=1;seed<=1000;seed++){
  const count=2+seed%3,mask=(seed*73)%(1<<count),variant=seed%2?'standard':'oklahoma';
  const ctx=context(seed,count,variant,mask,seed%2?10:0),s=game.init(ctx);invariant(s);assert(ready(s));
  if(mask){assert(!s.phase.paused);if(s.finished)assert(game.results(s));else assert(s.order.some(id=>game.controllerView(s,id).legal.length));}
  else{
   assert(s.phase.paused);const frozen=game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:100000});
   assert.equal(frozen,s,'an empty initial room must not advance on the old deadline');
   const resumed=game.reduce(s,{type:'player',playerId:'p0',connected:true,now:5100});
   assert(!resumed.roomEmpty);assert(!resumed.phase.paused);assert(ready(resumed));invariant(resumed);
  }
 }
 console.log(JSON.stringify({suite:'initial-presence-seeded',cases:1000}));
});

test('all-connected opening states retain the exact 6000 pre-repair JSON states',async()=>{
 const proof=JSON.parse(await readFile('evidence/audit-20261009/connected-initialization-baseline.json','utf8'));
 const hash=createHash('sha256');let cases=0;
 for(const count of [2,3,4])for(const variant of ['standard','oklahoma'])for(let seed=1;seed<=1000;seed++){
  hash.update(JSON.stringify(game.init(context(seed,count,variant,(1<<count)-1)))+'\n');cases++;
 }
 assert.equal(cases,proof.cases);assert.equal(hash.digest('hex'),proof.jsonStatesSha256);
 console.log(JSON.stringify({suite:'connected-initialization-byte-equivalence',cases,baselineHead:proof.head}));
});
