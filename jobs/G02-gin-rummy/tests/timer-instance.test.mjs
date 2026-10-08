import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {initial,rng} from './helpers.mjs';
test('same-timestamp turns cannot share timer instance identity',()=>{
 let s=initial(77,2,{turnSeconds:10}),oldDraw=null,currentDraw=null;
 const random=rng(7),instances=new Set([s.phase.id+':'+s.phase.startedAt]);
 for(let i=0;i<20;i++){
  const input=game.bot.sampleInput(s,s.turn,random,'normal');
  const next=game.reduce(s,{type:'input',playerId:s.turn,input,now:0});
  assert.notEqual(next,s);s=next;
  const key=s.phase.id+':'+s.phase.startedAt;assert(!instances.has(key));instances.add(key);
  if(s.phase.id==='draw'){if(!oldDraw)oldDraw=s.phase;else{currentDraw=s;break;}}
 }
 assert(currentDraw);assert.notEqual(currentDraw.phase.startedAt,oldDraw.startedAt);
 assert.equal(game.reduce(currentDraw,{type:'timer',phaseId:'draw',startedAt:oldDraw.startedAt,now:20000}),currentDraw);
 const live=game.reduce(currentDraw,{type:'timer',phaseId:'draw',startedAt:currentDraw.phase.startedAt,now:20000});
 assert.notEqual(live,currentDraw);assert.equal(live.phase.id,'discard');
});
