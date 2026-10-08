import test from 'node:test';
import assert from 'node:assert/strict';
import { referenceScore, referenceWinner, referenceLegal } from '../.build/jobs/G05-hearts/src/reference.js';
const positive = [36, ...Array.from({ length: 13 }, (_, i) => i + 39)];

test('independent reference: both moon choices and separate jack taker', () => {
  const ids = ['p0','p1','p2','p3'];
  const captured = { p0: positive, p1: [22], p2: [], p3: [] };
  assert.deepEqual(referenceScore(ids, captured, 'add', true), { points:{p0:0,p1:16,p2:26,p3:26},moon:'p0' });
  assert.deepEqual(referenceScore(ids, captured, 'subtract', true), { points:{p0:-26,p1:-10,p2:0,p3:0},moon:'p0' });
  assert.deepEqual(referenceScore(ids, { ...captured,p0:[...positive,22],p1:[] }, 'add',true).points,{p0:-10,p1:26,p2:26,p3:26});
  assert.equal(referenceScore(ids,{p0:[36,39],p1:[40],p2:[],p3:[]},'add',false).moon,null);
  assert.deepEqual(referenceScore(ids,{p0:[36,39],p1:[40],p2:[],p3:[]},'add',false).points,{p0:14,p1:1,p2:0,p3:0});
});
test('independent reference: suit following, opening and first-trick exceptions', () => {
  const led=[{playerId:'p0',card:0}];
  assert.deepEqual(referenceLegal([0,12,39,36],[],true,false,0),[0]);
  assert.deepEqual(referenceLegal([2,12,39,36],[],true,false,2),[2]);
  assert.deepEqual(referenceLegal([5,39,36],led,true,false,0),[5]);
  assert.deepEqual(referenceLegal([14,39,36],led,true,false,0),[14]);
  assert.deepEqual(referenceLegal([39,36],led,true,false,0),[39,36]);
  assert.deepEqual(referenceLegal([39,51],[],false,false,0),[39,51]);
  assert.deepEqual(referenceLegal([36,39,51],[],false,false,0),[36]);
  assert.deepEqual(referenceLegal([36,39,51],[],false,true,0),[36,39,51]);
});
test('independent reference: only the led suit can win, ace is high', () => {
  assert.equal(referenceWinner([{playerId:'p0',card:0},{playerId:'p1',card:51},{playerId:'p2',card:12},{playerId:'p3',card:11}]),'p2');
  assert.equal(referenceWinner([]),null);
});
