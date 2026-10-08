import test from 'node:test';import assert from 'node:assert/strict';
import {createRng,rules,reference} from './helpers.mjs';
test('10,000 independent scoring, winner and legal-move comparisons on valid card partitions',()=>{
 const rng=createRng(0x8badf00d);let moons=0;
 for(let i=0;i<10_000;i++){
  const n=rng.int(3,6);const order=Array.from({length:n},(_,j)=>`p${j}`);const deck=rules.deckFor(n,i%2?'clubs':'diamonds');
  const captured=Object.fromEntries(order.map(id=>[id,[]]));const shooter=order[rng.int(0,n-1)];
  for(const c of deck){const id=i%20===0&&rules.penalty(c)>0?shooter:order[rng.int(0,n-1)];captured[id].push(c);}
  const mode=i%2?'add':'subtract',jack=Boolean(i%3);
  const a=rules.settleHand(order,captured,mode,jack);assert.deepEqual(a,reference.referenceScore(order,captured,mode,jack));if(a.moon)moons++;
  const shuffled=rng.shuffle(deck);const trick=shuffled.slice(0,rng.int(1,n)).map((card,j)=>({card,playerId:order[j]}));
  assert.equal(rules.trickWinner(trick),reference.referenceWinner(trick));
  const hand=shuffled.slice(n,n+rng.int(1,17));const first=Boolean(i%3===0),broken=Boolean(i%2),opening=Math.min(...deck.filter(c=>c<13));
  const current=i%4?trick:[];assert.deepEqual(rules.legalCards(hand,current,first,broken,opening),reference.referenceLegal(hand,current,first,broken,opening));
 }
 assert.ok(moons>=500);console.log(JSON.stringify({independentCases:10_000,forcedAndNaturalMoons:moons}));
});
