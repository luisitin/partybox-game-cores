import {test} from 'node:test';
import assert from 'node:assert/strict';
import {optimalDefense,validMeld} from '../dist/cards.mjs';
import {bruteDefense} from './layoff-reference.mjs';
import {freeze} from './helpers.mjs';
test('branching target ends retain exact minima, legal chains, layouts and all cards',()=>{
 const targets=[[2,3,4],[15,16,17],[29,30,31]];freeze(targets);
 for(const hand of [[0,1,5,6,13,14,18,19,28,32],[0,1,5,6,13,14,18,19,38,32]]){
  freeze(hand);const before=JSON.stringify({hand,targets}),solution=optimalDefense(hand,targets,true);
  assert.equal(solution.deadwood,bruteDefense(hand,targets));
  assert.equal(JSON.stringify({hand,targets}),before);
  const board=targets.map(t=>[...t]);
  for(const {card,target}of solution.laid){board[target].push(card);assert(validMeld(board[target]));}
  const used=[...solution.melds.flat(),...solution.loose,...solution.laid.map(x=>x.card)];
  assert.deepEqual(used.sort((a,b)=>a-b),[...hand].sort((a,b)=>a-b));
  assert.deepEqual(optimalDefense(hand,targets,true),solution);
 }
});
