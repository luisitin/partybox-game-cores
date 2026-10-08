import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {initial,freeze,invariant} from './helpers.mjs';

function pass(state,now){
 const actor=state.turn,before=JSON.stringify(state);freeze(state);
 const next=game.reduce(state,{type:'input',playerId:actor,input:{type:'pass'},now});
 assert.notEqual(next,state);assert.equal(JSON.stringify(state),before);
 assert.equal(next.publicLog.at(-1).player,actor,'Pass history must identify the player who passed');
 assert.deepEqual(next.publicLog.at(-1),{player:actor,action:'pass',card:null});
 assert.notEqual(next.turn,actor);assert.deepEqual(next.hands,state.hands);
 assert.deepEqual(next.stock,state.stock);assert.deepEqual(next.discard,state.discard);
 assert.deepEqual(next.rng,state.rng);assert.deepEqual(next.scores,state.scores);invariant(next);
 for(const id of next.order)assert.deepEqual(game.controllerView(next,id).log,game.tvView(next).log);
 return next;
}
test('both opening passes identify their actual actors across counts, editions and seeds',()=>{
 let cases=0;
 for(const count of [2,3,4])for(const variant of ['standard','oklahoma'])for(let seed=1;seed<=30;seed++){
  let state=initial(seed,count,{variant});const actors=[];
  for(let i=0;i<2;i++){actors.push(state.turn);state=pass(state,i+1);cases++;}
  assert.deepEqual(state.publicLog.map(x=>x.player),actors);
  assert.equal(state.openingPasses,2);assert.equal(state.mustStock,true);assert.equal(state.phase.id,'draw');
 }
 console.log(JSON.stringify({suite:'opening-pass-attribution',directPassCases:cases,editions:2,counts:[2,3,4]}));
});
test('empty and prototype-shaped original IDs retain pass attribution as own keys',()=>{
 const ids=['','__proto__','constructor','last'];let cases=0;
 for(const count of [2,3,4])for(let shift=0;shift<ids.length;shift++)for(let seed=1;seed<=10;seed++){
  const order=[...ids.slice(shift),...ids.slice(0,shift)].slice(0,count);
  let state=game.init({players:order.map((id,i)=>({id,name:'Seat '+i,avatarId:'face-'+i,connected:true,bot:false})),settings:{mode:count===2?'duel':'rotation'},seed,now:0});
  state=pass(state,1);state=pass(state,2);cases+=2;
  for(const id of order)assert(Object.hasOwn(state.players,id));
 }
 console.log(JSON.stringify({suite:'pass-valid-ids',cases,ids}));
});
test('timer, VIP skip and absent-seat automation identify the automatic passer',()=>{
 let witness=null;
 for(let seed=1;seed<=100&&!witness;seed++){
  const state=initial(seed,2,{turnSeconds:10});
  const next=game.reduce(state,{type:'timer',phaseId:state.phase.id,startedAt:state.phase.startedAt,now:10001});
  if(next.publicLog.at(-1)?.action==='pass')witness=state;
 }
 assert(witness,'a real initialized pass position is required');
 const events=[{type:'timer',phaseId:witness.phase.id,startedAt:witness.phase.startedAt,now:10001},{type:'vip',action:'skip',now:10001},{type:'player',playerId:witness.turn,connected:false,now:10001}];
 for(const event of events){
  const next=game.reduce(witness,event);assert.notEqual(next,witness);
  assert.equal(next.publicLog[0].action,'pass');assert.equal(next.publicLog[0].player,witness.turn);
  invariant(next);
 }
 console.log(JSON.stringify({suite:'automatic-pass-attribution',routes:events.map(x=>x.type)}));
});
