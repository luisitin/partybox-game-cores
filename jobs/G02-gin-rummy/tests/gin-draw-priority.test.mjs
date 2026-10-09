import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
import {minimizeDeadwood,discardSolutions} from '../dist/cards.mjs';
import {bruteDeadwood} from './brute-reference.mjs';
import {rng,invariant,freeze} from './helpers.mjs';
import {ginOpening,normalGinDraw,step} from './gin-draw-cases.mjs';

test('all skills take a guaranteed finishing discard even when ten-card deadwood is already zero',()=>{
 let cases=0;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const phase of ['upcard','draw'])for(const bigGin of [false,true])for(const bigGinBonus of ['31','50'])for(const turnSeconds of [0,10])for(let suit=0;suit<4;suit++)for(const endpoint of ['high','low']){
  let s=ginOpening(suit,endpoint,{variant,bonusProfile,bigGin,bigGinBonus,turnSeconds,spadeDouble:turnSeconds===0},count);
  if(phase==='draw')s=normalGinDraw(s);
  assert.equal(minimizeDeadwood(s.hands.p0).deadwood,0);
  const before=JSON.stringify(s);freeze(s);
  for(const skill of ['easy','normal','sharp']){
   const random=rng(cases+1),input=game.bot.sampleInput(s,'p0',random,skill);
   assert.deepEqual(input,{type:'draw',source:'discard'});
   assert.equal(random.state().step,0,'guaranteed finish must not depend on a coin flip');
   assert.equal(JSON.stringify(s),before);
   const picked=step(s,input,8),finish=game.bot.sampleInput(picked,'p0',rng(7),skill);
   if(bigGin)assert.deepEqual(finish,{type:'bigGin'});
   else {assert.equal(finish.type,'discard');assert.equal(finish.knock,true);assert.notEqual(finish.card,picked.drawnDiscard);}
   const done=step(picked,finish,9),r=done.roundResult;
   assert.equal(r.winner,'p0');assert.equal(r.kind,bigGin?'bigGin':'gin');
   const bonus=bigGin?Number(bigGinBonus):bonusProfile==='classic'?20:25;
   assert.equal(r.points,(bonus+minimizeDeadwood(picked.hands.p1).deadwood)*s.multiplier);
   assert.deepEqual(r.defenderLayout.laid,[]);cases++;
  }
 }
 assert.equal(cases,6912);console.log(JSON.stringify({suite:'preexisting-gin-draw-matrix',cases,actualLegalDrawPhaseRoutes:true,skills:3,variants:2,counts:[2,3,4],suits:4,endpoints:2,clockSettings:[0,10]}));
});

test('1000 hidden defender completions keep the same guaranteed choice and exact independent finishing score',()=>{
 const r=rng(415991),checksum=createHash('sha256');let cases=0;
 for(let i=0;i<1000;i++){
  const bigGin=!!(i%2),bonusProfile=['classic','northAmerican','rubl'][i%3],bigGinBonus=i%3?'31':'50';
  const s=ginOpening(i%4,i%5?'high':'low',{variant:i%2?'oklahoma':'standard',bonusProfile,bigGin,bigGinBonus});
  const top=s.discard[0],free=Array.from({length:52},(_,n)=>n).filter(c=>!s.hands.p0.includes(c)&&c!==top);
  s.hands.p1=r.shuffle(free).slice(0,10);s.stock=free.filter(c=>!s.hands.p1.includes(c));invariant(s);
  for(const skill of ['easy','normal','sharp'])assert.deepEqual(game.bot.sampleInput(s,'p0',rng(i+1),skill),{type:'draw',source:'discard'});
  const picked=step(s,{type:'draw',source:'discard'},1),finish=game.bot.sampleInput(picked,'p0',rng(7),'sharp'),done=step(picked,finish,2);
  const bonus=bigGin?Number(bigGinBonus):bonusProfile==='classic'?20:25,independent=bruteDeadwood(s.hands.p1);
  assert.equal(done.roundResult.winner,'p0');assert.equal(done.roundResult.points,(bonus+independent)*s.multiplier);
  checksum.update(JSON.stringify({i,finish,points:done.roundResult.points,independent,multiplier:s.multiplier})+'\n');cases++;
 }
 assert.equal(cases,1000);console.log(JSON.stringify({suite:'preexisting-gin-hidden-defenders',cases,choices:3000,sha256:checksum.digest('hex')}));
});

test('forced stock, unavailable actors, pause and non-finishing discards retain the original legal boundaries',()=>{
 let controls=0;
 for(const variant of ['standard','oklahoma'])for(const count of [2,3,4])for(const skill of ['easy','normal','sharp']){
  const opening=ginOpening(0,'high',{variant},count);
  const forced=step(step(opening,{type:'pass'},1),{type:'pass'},2);assert.equal(forced.mustStock,true);
  const random=rng(7);assert.deepEqual(game.bot.sampleInput(forced,'p0',random,skill),{type:'draw',source:'stock'});assert.equal(random.state().step,0);controls++;
  const paused=game.reduce(opening,{type:'vip',action:'pause',now:1});assert.equal(game.bot.sampleInput(paused,'p0',rng(7),skill),null);controls++;
  assert.equal(game.bot.sampleInput(opening,'p1',rng(7),skill),null);controls++;
  const ended=game.reduce(opening,{type:'vip',action:'end',now:1});assert.equal(game.bot.sampleInput(ended,'p0',rng(7),skill),null);controls++;
  const foreign=structuredClone(opening),top=foreign.stock.find(c=>Math.floor(c/13)!==0);
  foreign.stock=foreign.stock.filter(c=>c!==top);foreign.stock.push(foreign.discard[0]);foreign.discard=[top];
  assert(discardSolutions([...foreign.hands.p0,top]).filter(x=>x.card!==top).every(x=>x.solution.deadwood>0));invariant(foreign);
  assert.deepEqual(game.bot.sampleInput(foreign,'p0',rng(7),skill),{type:'pass'});controls++;
 }
 assert.equal(controls,90);console.log(JSON.stringify({suite:'preexisting-gin-draw-boundaries',controls}));
});

test('the reproduced opening takes 31-point Big Gin instead of passing into a 20-point Gin',()=>{
 const s=ginOpening(),first=game.bot.sampleInput(s,'p0',rng(7),'sharp');assert.deepEqual(first,{type:'draw',source:'discard'});
 const picked=step(s,first,1),immediate=step(picked,game.bot.sampleInput(picked,'p0',rng(7),'sharp'),2);
 let delayed=step(step(s,{type:'pass'},1),{type:'pass'},2),draw=game.bot.sampleInput(delayed,'p0',rng(7),'sharp');
 delayed=step(delayed,draw,3);delayed=step(delayed,game.bot.sampleInput(delayed,'p0',rng(7),'sharp'),4);
 assert.equal(immediate.roundResult.kind,'bigGin');assert.equal(immediate.roundResult.points,31);
 assert.equal(delayed.roundResult.kind,'gin');assert.equal(delayed.roundResult.points,20);
 console.log(JSON.stringify({suite:'preexisting-gin-measured-gain',immediatePoints:31,priorPassRoutePoints:20,gain:11}));
});
