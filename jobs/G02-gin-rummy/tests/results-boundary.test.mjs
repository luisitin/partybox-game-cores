import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {invariant} from './helpers.mjs';
import {targetFixture} from './browser-fixture.mjs';
const knock=(s,id=s.turn)=>game.reduce(s,{type:'input',playerId:id,now:1,input:{type:'discard',card:39,knock:true}});
test('first raw target winner keeps the crown even when final box settlement reverses points',()=>{
 for(const count of [2,3,4]){
  const won=knock(targetFixture('p0',count));invariant(won);assert(won.finished);
  assert.equal(won.roundResult.points,118);assert.equal(won.scores.p0,388);assert.equal(won.scores.p1,499);
  const result=game.results(won);assert.deepEqual(result.winnerIds,['p0']);assert.equal(result.ranking.find(x=>x.playerId==='p0').rank,1);
  assert.equal(result.ranking.find(x=>x.playerId==='p1').rank,2);assert(result.headlineNote.includes('hand points'));
  assert.deepEqual(Object.keys(result.scores).sort(),won.order.slice().sort());
 }
});
test('every valid string ID, including empty, wins, earns bonuses and stays in rotation',()=>{
 for(const id of ['', '0', 'null', '__proto__', 'constructor']){
  const won=knock(targetFixture(id));invariant(won);assert(won.finished);assert.equal(won.scores[id],388);
  assert.deepEqual(game.results(won).winnerIds,[id]);
  for(const count of [2,3,4]){
   const s=targetFixture(id,count,{target:'250'});s.scores[id]=0;s.scores.p1=0;s.boxes[id]=0;s.boxes.p1=0;s.wins[id]=0;s.wins.p1=0;
   const hand=knock(s);assert.equal(hand.phase.id,'round-end');assert.equal(hand.scores[id],118);assert.equal(hand.boxes[id],1);
   const next=game.reduce(hand,{type:'input',playerId:id,input:{type:'next'},now:2});invariant(next);
   if(count===2)assert.equal(next.dealer,id);else assert.deepEqual(next.active,[id,'p2']);
  }
 }
});
test('malformed identity metadata cannot coerce a registered ID, throw or reveal a hand',()=>{
 const s=targetFixture('');
 for(const id of [null,undefined,0,false,[],{}, {toString:null,valueOf:null}, {toString:''}, {valueOf:0}]){
  for(const event of [{type:'input',playerId:id,input:{type:'discard',card:39,knock:true},now:1},
   {type:'player',playerId:id,connected:false,now:1}])assert.equal(game.reduce(s,event),s);
  const view=game.controllerView(s,id);assert.equal(view.me.role,'spectator');assert.deepEqual(view.handCards,[]);assert.deepEqual(view.legal,[]);
  assert.deepEqual(JSON.parse(JSON.stringify(view)),view);
 }
});
test('early end preserves earned raw points and reports current standings',()=>{
 const s=targetFixture();const ended=game.reduce(s,{type:'vip',action:'end',now:1});invariant(ended);
 assert.deepEqual(ended.scores,s.scores);assert.deepEqual(game.results(ended).winnerIds,['p1']);
 assert(game.results(ended).headline.includes('early'));assert.equal(game.results(ended).ranking.find(x=>x.playerId==='p1').rank,1);
});
