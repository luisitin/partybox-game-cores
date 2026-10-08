import test from 'node:test';import assert from 'node:assert/strict';
import{game,start,toPhase,finish}from'./helpers.mjs';
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
