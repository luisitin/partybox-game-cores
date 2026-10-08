import {test} from 'node:test';
import assert from 'node:assert/strict';
import {discardSolutions,minimizeDeadwood} from '../dist/cards.mjs';
import {bruteDeadwood} from './brute-reference.mjs';
import {rng,freeze} from './helpers.mjs';
test('10500 batch outcomes retain exact standalone layouts and independent minima',()=>{
 const r=rng(99971);let cases=0;
 for(let i=0;i<1000;i++){
  const hand=r.shuffle(Array.from({length:52},(_,i)=>i)).slice(0,10+(i%2));freeze(hand);
  const before=JSON.stringify(hand);
  for(const row of discardSolutions(hand)){
   const rest=hand.filter(c=>c!==row.card);
   assert.deepEqual(row.solution,minimizeDeadwood(rest));assert.equal(row.solution.deadwood,bruteDeadwood(rest));cases++;
  }
  assert.equal(JSON.stringify(hand),before);
 }assert.equal(cases,10500);console.log(JSON.stringify({suite:'batch-discard-proof',hands:1000,outcomes:cases,exactLayouts:true}));
});
