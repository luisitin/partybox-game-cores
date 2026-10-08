import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {minimizeDeadwood} from '../dist/cards.mjs';
import {initial,invariant} from './helpers.mjs';
function arranged(hand,defender,extra={}) {
 const s=initial(1,2,extra);s.turn='p0';s.phase={id:'discard',startedAt:0,deadline:null};
 s.hands={p0:hand,p1:defender};s.drawnDiscard=null;s.pending=null;s.roundResult=null;
 const used=[...hand,...defender],free=Array.from({length:52},(_,i)=>i).filter(c=>!used.includes(c));
 s.discard=[free.pop()];s.stock=free;invariant(s);return s;
}
const opponent=[10,12,22,24,26,28,30,35,47,49];
test('actual Big Gin reducer keeps eleven cards, rejects disabled/incomplete claims and prevents layoffs',()=>{
 const hand=[0,1,2,3,4,5,6,13,14,15,16];let s=arranged(hand,opponent);
 const input={type:'input',playerId:'p0',now:1,input:{type:'bigGin'}};
 const ended=game.reduce(s,input);assert.notEqual(ended,s);assert.equal(ended.roundResult.kind,'bigGin');
 assert.equal(ended.hands.p0.length,11);assert.equal(ended.discard.length,1);
 assert.equal(ended.roundResult.points,31+minimizeDeadwood(opponent).deadwood);
 assert.deepEqual(ended.roundResult.defenderLayout.laid,[]);invariant(ended);
 assert.equal(game.reduce(arranged(hand,opponent,{bigGin:false}),input).phase.id,'discard');
 const bad=arranged([...hand.slice(0,-1),39],opponent);assert.equal(game.reduce(bad,input),bad);
});
test('actual Gin/normal knock phases, custom layout rejection, match completion and Oklahoma boxes',()=>{
 const ginHand=[0,1,2,3,4,13,14,15,16,17,51];
 let s=arranged(ginHand,opponent,{variant:'oklahoma',extraBoxes:true});s.multiplier=2;
 const gin=game.reduce(s,{type:'input',playerId:'p0',now:1,input:{type:'discard',card:51,knock:true}});
 assert.equal(gin.roundResult.kind,'gin');assert.equal(gin.roundResult.points,2*(20+minimizeDeadwood(opponent).deadwood));
 assert.equal(gin.boxes.p0,5);assert.equal(gin.phase.id,gin.roundResult.points>=100?'done':'round-end');invariant(gin);
 // Chosen legal layout has a different purpose than the automatic minimum.
 const hand=[0,1,2,13,14,15,26,27,28,3,51];s=arranged(hand,[7,9,10,12,19,21,22,24,35,49]);s.knockLimit=10;
 const bad=game.reduce(s,{type:'input',playerId:'p0',now:1,input:{type:'discard',card:51,knock:true,melds:[[0,1,2],[0,13,26]]}});assert.equal(bad,s);
 const knocked=game.reduce(s,{type:'input',playerId:'p0',now:1,input:{type:'discard',card:51,knock:true,melds:[[0,1,2],[13,14,15],[26,27,28]]}});
 assert.equal(knocked.phase.id,'layoff');assert.equal(knocked.turn,'p1');assert.equal(knocked.pending.layout.deadwood,4);
 assert.equal(game.reduce(knocked,{type:'input',playerId:'p0',now:2,input:{type:'finishLayoff'}}),knocked);
 const scored=game.reduce(knocked,{type:'input',playerId:'p1',now:2,input:{type:'finishLayoff'}});assert(scored.roundResult);invariant(scored);
 s=arranged(ginHand,opponent);s.scores.p0=99;
 const won=game.reduce(s,{type:'input',playerId:'p0',now:1,input:{type:'discard',card:51,knock:true}});
 assert.equal(won.phase.id,'done');assert(game.results(won));assert(won.scores.p0>=100+100+20);
});
test('winner-stays queue for every rotation size, drawn hand retains seats, each dealer setting',()=>{
 for(const count of [3,4]) {
  const s=initial(1,count);s.phase.id='round-end';s.roundResult={kind:'knock',winner:'p0',points:3};
  const next=game.reduce(s,{type:'input',playerId:'p0',now:2,input:{type:'next'}});
  assert.deepEqual(next.active,['p0','p2']);assert.equal(next.waiting.at(-1),'p1');assert.equal(next.dealer,'p2');invariant(next);
  s.roundResult={kind:'draw',winner:null,points:0};
  const draw=game.reduce(s,{type:'input',playerId:'p0',now:2,input:{type:'next'}});assert.deepEqual(draw.active,s.active);assert.deepEqual(draw.waiting,s.waiting);
 }
 for(const rule of ['winner','loser','alternate']) {
  const s=initial(1,2,{dealer:rule});s.phase.id='round-end';s.roundResult={kind:'knock',winner:'p0',points:3};
  const next=game.reduce(s,{type:'input',playerId:'p0',now:2,input:{type:'next'}});
  assert.equal(next.dealer,rule==='winner'?'p0':rule==='loser'?'p1':s.active.find(x=>x!==s.dealer));
 }
});
