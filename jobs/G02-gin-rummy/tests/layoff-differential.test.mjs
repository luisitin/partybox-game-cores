import {test} from 'node:test';
import assert from 'node:assert/strict';
import {optimalDefense} from '../dist/cards.mjs';
import {bruteDefense} from './layoff-reference.mjs';
import {rng} from './helpers.mjs';
test('2000 independent joint meld/layoff weighted packings including chained extensions',()=>{
 const r=rng(816777);let checksum=0,laid=0;
 for(let i=0;i<2000;i++) {
  const suit=r.int(0,3),start=r.int(0,8),setRank=r.int(0,12);
  const targets=[[suit*13+start,suit*13+start+1,suit*13+start+2],
   [0,1,2,3].filter(s=>s!==suit).map(s=>s*13+setRank)];
  if(i%2===0){
   const secondSuit=(suit+1)%4,starts=Array.from({length:11},(_,i)=>i).filter(x=>setRank<x||setRank>x+2),secondStart=r.pick(starts);
   targets.push([secondSuit*13+secondStart,secondSuit*13+secondStart+1,secondSuit*13+secondStart+2]);
  }
  const used=targets.flat(),hand=r.shuffle(Array.from({length:52},(_,i)=>i).filter(c=>!used.includes(c))).slice(0,10);
  const expected=bruteDefense(hand,targets),actual=optimalDefense(hand,targets,true);
  assert.equal(actual.deadwood,expected,JSON.stringify({hand,targets}));checksum+=expected;laid+=actual.laid.length;
 }
 assert.equal(optimalDefense([6,7],[[3,4,5],[19,32,45]],true).deadwood,0);
 assert.equal(bruteDefense([6,7],[[3,4,5],[19,32,45]]),0);
 console.log(JSON.stringify({suite:'joint-layoff-proof',hands:2000,twoTarget:1000,threeTarget:1000,seed:816777,checksum,actualLaidCards:laid}));
});
