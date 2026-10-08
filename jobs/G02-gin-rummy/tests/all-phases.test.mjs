import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {game} from '../dist/core.mjs';
import {rng,initial,freeze,invariant} from './helpers.mjs';
test('every event family, roster id and bot skill in every delivered phase',async()=>{
 let cases=0;
 for(const phase of game.phases){
  const s=JSON.parse(await readFile(`fixtures/${phase}.json`,'utf8'));freeze(s);
  for(const id of [...s.order,'spectator','__proto__','constructor']){
   assert.doesNotThrow(()=>game.controllerView(s,id));
   for(const skill of ['easy','normal','sharp']){
    const input=game.bot.sampleInput(s,id,rng(42),skill);
    assert(input===null||game.inputSchema.safeParse(input).success);
    if(input)assert.doesNotThrow(()=>game.reduce(s,{type:'input',playerId:id,input,now:99}));cases++;
   }
   for(const input of [{type:'pass'},{type:'draw',source:'stock'},{type:'draw',source:'discard'},{type:'discard',card:51},{type:'discard',card:50,knock:true},{type:'bigGin'},{type:'finishLayoff'},{type:'next'}]){
    assert.doesNotThrow(()=>game.reduce(s,{type:'input',playerId:id,input,now:99}));cases++;
   }
   assert.doesNotThrow(()=>game.reduce(s,{type:'player',playerId:id,connected:false,now:99}));cases++;
  }
  for(const action of ['pause','resume','skip','end']){assert.doesNotThrow(()=>game.reduce(s,{type:'vip',action,now:99}));cases++;}
  for(const e of [{type:'speech',now:99,key:'none',ms:-1},{type:'speechStart',now:99,key:'none'},
   {type:'timer',now:99,phaseId:phase,startedAt:-1},{type:'timer',now:1e9,phaseId:'stale',startedAt:s.phase.startedAt}]){
    assert.equal(game.reduce(s,e),s);cases++;
  }
  const ended=game.reduce(s,{type:'vip',action:'end',now:99});assert(game.results(ended));
 }
 console.log(JSON.stringify({suite:'all-phases',phases:game.phases.length,cases}));
});
test('registered prototype-looking ids remain valid players and finite result keys',()=>{
 const s=game.init({players:['__proto__','constructor'].map(id=>({id,name:id,avatarId:'face',connected:true})),settings:{},seed:8,now:0});
 assert(Object.hasOwn(s.players,'__proto__'));assert(Object.hasOwn(s.players,'constructor'));
 const input=game.bot.sampleInput(s,s.turn,rng(8),'normal');assert(input);freeze(s);
 const next=game.reduce(s,{type:'input',playerId:s.turn,input,now:1});assert.notEqual(next,s);invariant(next);
 const end=game.reduce(next,{type:'vip',action:'end',now:2});
 assert.deepEqual(Object.keys(game.results(end).scores).sort(),['__proto__','constructor']);
 for(const score of Object.values(game.results(end).scores))assert(Number.isFinite(score));
});
