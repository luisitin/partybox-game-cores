import {test} from 'node:test';
import assert from 'node:assert/strict';
import {minimizeDeadwood,validMeld} from '../dist/cards.mjs';
import {bruteDeadwood} from './brute-reference.mjs';
import {rng} from './helpers.mjs';
test('independent exhaustive meld-subset packing proves 10000 exact minima',()=>{
 const generator=rng(20261008);let checksum=0;
 for(let i=0;i<10000;i++){
  const hand=generator.shuffle(Array.from({length:52},(_,i)=>i)).slice(0,i%2===0?10:11);
  const actual=minimizeDeadwood(hand),expected=bruteDeadwood(hand);
  assert.equal(actual.deadwood,expected,JSON.stringify(hand));checksum+=expected;
  assert(actual.melds.every(validMeld));assert.equal(new Set([...actual.loose,...actual.melds.flat()]).size,hand.length);
  assert.equal(minimizeDeadwood([...hand].reverse()).deadwood,expected);
 }console.log(JSON.stringify({suite:'deadwood-proof',hands:10000,tenCard:5000,elevenCard:5000,seed:20261008,checksum}));
});
