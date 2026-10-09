import test from 'node:test';import assert from 'node:assert/strict';
import{game,start,toPhase,finish,eventFor}from'./helpers.mjs';
import{makeSave,parseSave}from'../.build/jobs/G05-hearts/src/save.js';
const seats=n=>Array.from({length:n},(_,i)=>({name:`Player ${i+1}`,mode:'normal'}));
test('saved snapshots validate in all phases/counts, preserve live state and resume completed matches',()=>{
 for(const n of[3,4,5,6])for(const phase of game.phases){const s=toPhase(start(3,n,{target:25}),phase),before=JSON.stringify(s);const saved=makeSave(s,seats(n),1_000_000);assert.equal(JSON.stringify(s),before);const parsed=parseSave(JSON.parse(JSON.stringify(saved)));assert.ok(parsed,`${n}:${phase}`);if(phase!=='done')assert.ok(parsed.state.phase.paused);const resumed=game.reduce(parsed.state,{type:'vip',action:'resume',now:2_000_000});assert.deepEqual(finish(resumed).state.scores,finish(s).state.scores);}
});
test('saved snapshots reject malformed, missing-seat, duplicate-card and impossible-turn data',()=>{
 const s=start(1),saved=makeSave(s,seats(4),10_000);for(const invalid of[null,{}, {...saved,version:2},{...saved,seats:[]},{...saved,state:{...s,hands:{}}},{...saved,state:{...s,actor:'unknown'}},{...saved,state:{...s,dealer:5}}])assert.equal(parseSave(invalid),null);
 const corrupt=structuredClone(saved);corrupt.state.hands.p0[0]=corrupt.state.hands.p1[0];assert.equal(parseSave(corrupt),null);
 const trap=structuredClone(saved);trap.state.phase.id='trick';trap.state.lastWinner=null;assert.equal(parseSave(trap),null);
 const prototype=structuredClone(saved);prototype.state.order[0]='__proto__';assert.equal(parseSave(prototype),null);
});
test('saved clocks preserve remaining time and never expose a hand after resume',()=>{
 const bot=start(4,4,{turnSeconds:30});const s={...bot,players:Object.fromEntries(Object.entries(bot.players).map(([id,p])=>[id,{...p,bot:false}]))};
 const humans=seats(4).map(p=>({...p,mode:'human'}));const save=parseSave(makeSave(s,humans,s.phase.startedAt+12_000));assert.ok(save);const resumed=game.reduce(save.state,{type:'vip',action:'resume',now:100_000});assert.equal(resumed.phase.deadline-100_000,18_000);assert.ok(!Object.hasOwn(game.tvView(resumed),'hands'));
});

test('saved passing memory must be complete before any controller can see it',()=>{
 const s=toPhase(start(1),'play'),good=makeSave(s,seats(4),10000);const bad=structuredClone(good);delete bad.state.received[s.actor];assert.equal(parseSave(bad),null);
 const wrong=structuredClone(good);wrong.state.received.p0=wrong.state.received.p1;assert.equal(parseSave(wrong),null);
 const valid=parseSave(good);for(const id of s.order)assert.doesNotThrow(()=>game.controllerView(valid.state,id));
});

test('a caller mutating an exported save cannot change live hands, scores or paused clocks',()=>{
 const s=game.reduce(start(1),{type:'vip',action:'pause',now:2000}),before=JSON.stringify(s),saved=makeSave(s,seats(4),3000);saved.state.hands.p0[0]=99;saved.state.scores.p0=999;saved.state.phase.paused.at=999;assert.equal(JSON.stringify(s),before);
});

test('saved current trick and turn must agree with the actual played-card ledger',()=>{
 for(const n of[3,4,5,6]){
  let s=start(17,n,{target:25,noPass:true});let steps=0;
  while(!(s.phase.id==='play'&&s.trickNumber===1&&s.trick.length===1)&&steps++<200)s=game.reduce(s,eventFor(s));
  assert.equal(s.trickNumber,1);assert.equal(s.trick.length,1);
  const good=makeSave(s,seats(n),1_000_000);assert.ok(parseSave(good));
  const cases=[
   ['erased current trick',v=>v.trick=[]],
   ['substituted current card',v=>v.trick[0].card=v.hands[v.actor][0]],
   ['wrong next player',v=>v.actor=v.order[(v.order.indexOf(v.actor)+1)%n]],
   ['wrong trick number',v=>v.trickNumber=0],
   ['erased last completed trick',v=>v.lastTrick=[]],
   ['wrong last winner',v=>v.lastWinner=v.order[(v.order.indexOf(v.lastWinner)+1)%n]],
  ];
  for(const[label,corrupt]of cases){const bad=structuredClone(good);corrupt(bad.state);assert.equal(parseSave(bad)===null,true,`${n} seats: ${label} must be rejected before Resume`);}
 }
});

test('save ledger validation preserves genuine partial tricks, clocks and early endings',()=>{
 let snapshots=0;
 for(const n of[3,4,5,6])for(const noPass of[false,true])for(const turnSeconds of[0,10]){
  let s=start(41,n,{target:25,noPass,turnSeconds});let steps=0;
  while(s.trickNumber<3&&s.phase.id!=='done'&&steps++<100){
   const before=JSON.stringify(s),good=makeSave(s,seats(n),s.phase.startedAt+1);assert.ok(parseSave(good),`${n}/${noPass}/${turnSeconds}/${s.phase.id}/${s.trick.length}`);
   const ended=game.reduce(s,{type:'vip',action:'end',now:s.phase.startedAt+2});assert.ok(parseSave(makeSave(ended,seats(n),ended.phase.startedAt+1)),`valid early end ${s.phase.id}`);
   assert.equal(JSON.stringify(s),before,'saving and validating never mutate live state');snapshots+=2;
   s=game.reduce(s,eventFor(s));
  }
  assert.ok(steps<100,'genuine game reaches at least three tricks');
 }
 assert.ok(snapshots>400);console.log(JSON.stringify({validIntermediateAndEarlyEndSaves:snapshots}));
});
