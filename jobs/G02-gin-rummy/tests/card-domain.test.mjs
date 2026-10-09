import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validMeld,declaredSolution} from '../dist/cards.mjs';
test('meld validation rejects impossible card IDs while preserving legitimate edge runs/sets',()=>{
 for(const cards of [[52,53,54],[-3,-2,-1],[.5,1.5,2.5],[0,13,52],[0,13,NaN],[0,13,Infinity]]){
  assert.equal(validMeld(cards),false);assert.equal(declaredSolution(cards,[cards]),null);
 }
 for(const cards of [[0,1,2],[10,11,12],[39,40,41],[49,50,51],[0,13,26,39],Array.from({length:13},(_,i)=>i)])assert(validMeld(cards));
 for(const cards of [[11,12,0],[0,1,15],[0,0,0],[0,13],[1,14,27,40,2]])assert.equal(validMeld(cards),false);
});
