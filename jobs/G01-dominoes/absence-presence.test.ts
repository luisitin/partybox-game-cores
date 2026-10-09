import test from 'node:test';
import assert from 'node:assert/strict';
import {createRng} from '../../contract/rng.ts';
const C:typeof import('./core.ts')=await import(process.env.ABSENCE_CORE_PATH??'./core.ts');
function context(n:number,seed=1,mask=(1<<n)-1,settings:Record<string,string|boolean|number>={}) {
 return {players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'plain',connected:!!(mask&(1<<i)),bot:false})),settings,seed,now:0};
}
function freeze<T>(x:T):T {if(x&&typeof x==='object'){Object.freeze(x);for(const v of Object.values(x))freeze(v);}return x;}
test('an absent first seat yields to a present human with a full turn',()=>{
 const s=C.init(context(2,1,2,{opening:'rotating'}));assert.equal(s.turn,1);assert.equal(s.board.length,1);assert.equal(s.phase.deadline!-s.phase.startedAt,30000);assert.equal(s.idleTurns,0);
});
test('all nonempty connected masks settle declared starts without consuming entropy',()=>{
 for(const n of [2,3,4])for(const seed of [1,2,3,146,700064])for(const mode of ['draw','block'])for(const deal of ['block-sized','traditional'])for(const opening of ['highest-double','rotating'])for(let mask=1;mask<(1<<n);mask++){
  const ctx=context(n,seed,mask,{mode,deal,opening,partners:n===4&&seed%2===0});const s=C.init(ctx),all=C.init({...ctx,players:ctx.players.map(p=>({...p,connected:true}))});
  assert.equal(s.phase.id,'play');assert(s.players[s.seats[s.turn]!]!.connected);assert.equal(s.phase.deadline!-s.phase.startedAt,30000);assert.equal(s.idleTurns,0);assert.deepEqual(s.rng,all.rng);assert.deepEqual([...s.hands.flat(),...s.stock,...s.board.map(t=>t.tile)].sort((a,b)=>a-b),C.allTiles());
 }
});
test('a declared active departure advances legal play while preserving next human time',()=>{
 const s=freeze(C.init(context(3,19,7,{opening:'rotating',mode:'draw'})));const next=C.reduce(s,{type:'player',now:20,playerId:'p0',connected:false,gone:'left'});
 assert.equal(next.turn,1);assert.equal(next.board.length,1);assert.equal(next.hands[0]!.length,s.hands[0]!.length-1);assert.deepEqual(next.rng,s.rng);assert.equal(next.phase.deadline!-next.phase.startedAt,30000);assert.equal(next.idleTurns,s.idleTurns);assert.equal(s.players.p0!.connected,true);
});
test('paused departure waits until resume and retains a full new human turn',()=>{
 const s=C.init(context(2,23,3,{opening:'rotating'}));const paused=C.reduce(s,{type:'vip',now:5,action:'pause'});const dropped=C.reduce(freeze(paused),{type:'player',now:8,playerId:'p0',connected:false});
 assert.deepEqual(dropped.board,s.board);assert.deepEqual(dropped.phase,paused.phase);assert.equal(C.reduce(dropped,{type:'vip',now:9,action:'skip'}),dropped);
 const resumed=C.reduce(freeze(dropped),{type:'vip',now:105,action:'resume'});assert(!resumed.phase.paused);assert.equal(resumed.turn,1);assert.equal(resumed.board.length,1);assert.equal(resumed.phase.deadline!-resumed.phase.startedAt,30000);
});
test('empty tables retain their deal; reconnect starts only a connected table',()=>{
 for(const n of [2,3,4])for(const seed of [1,2,3]){
  const empty=C.init(context(n,seed,0,{opening:'rotating'}));assert.equal(empty.board.length,0);assert.equal(empty.turn,0);assert.equal(empty.idleTurns,0);
  const paused=C.reduce(empty,{type:'vip',now:1,action:'pause'});const joined=C.reduce(paused,{type:'player',now:2,playerId:`p${n-1}`,connected:true});assert.equal(joined.board.length,0);
  const resumed=C.reduce(freeze(joined),{type:'vip',now:101,action:'resume'});assert.equal(resumed.turn,n-1);assert.equal(resumed.board.length,n-1);assert.equal(resumed.phase.deadline!-resumed.phase.startedAt,30000);
 }
});
test('malformed, stale, early and wrong-player events remain identity no-ops',()=>{
 const s=freeze(C.init(context(3,146,2,{opening:'rotating'})));
 for(const e of [{type:'input',now:1,playerId:'unknown',input:{type:'pass'}},{type:'input',now:1,playerId:s.seats[(s.turn+1)%3],input:C.legal(s)[0]},{type:'timer',now:s.phase.deadline!-1,phaseId:s.phase.id,startedAt:s.phase.startedAt},{type:'timer',now:s.phase.deadline!+1000,phaseId:s.phase.id,startedAt:s.phase.startedAt-1},{type:'player',now:1,playerId:'unknown',connected:false},{type:'vip',now:1,action:'invalid'}])assert.equal(C.reduce(s,e as never),s);
});
test('ordinary one-present matches at every count finish inside the unchanged budget',()=>{
 for(const n of [2,3,4])for(const mode of ['draw','block'])for(const seed of [1,2,3,146,700064]){
  const present=seed%n;let s=C.init(context(n,seed,1<<present,{mode,target:'250',opening:'rotating',partners:n===4&&seed%2===0})),steps=0;
  while(s.phase.id!=='done'&&steps++<12000){if(s.phase.id==='round-end')s=C.reduce(freeze(s),{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});else{assert.equal(s.turn,present);const input=C.game.bot.sampleInput(s,s.seats[present]!,createRng(seed+steps),'normal');assert(input&&C.inputSchema.safeParse(input).success);s=C.reduce(freeze(s),{type:'input',now:s.phase.startedAt+1,playerId:s.seats[present]!,input});}}
  assert.equal(s.phase.id,'done');assert(s.phase.startedAt<=C.manifest.estimatedMinutes*3*60000);assert.deepEqual(Object.keys(C.results(s)!.scores).sort(),s.seats.slice().sort());
 }
});

function fullyIdle(n:number,seed:number):ReturnType<typeof C.init> {
 let s=C.init(context(n,seed,(1<<n)-1,{mode:seed%2?'draw':'block',target:'250',opening:'rotating'}));
 for(let i=0;i<100&&s.phase.id==='play'&&s.idleTurns<n;i++)s=C.reduce(freeze(s),{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});
 assert.equal(s.phase.id,'play');assert.equal(s.idleTurns,n);assert.equal(s.phase.deadline!-s.phase.startedAt,1000);return s;
}
test('explicit active departure after a legal inactive cycle restores a full human turn',()=>{
 for(const n of [2,3,4])for(const seed of [1,2,3,146,700064]){
  const s=fullyIdle(n,seed),next=C.reduce(freeze(s),{type:'player',now:s.phase.startedAt+1,playerId:s.seats[s.turn]!,connected:false,gone:'left'});
  assert.equal(next.phase.id,'play');assert(next.players[next.seats[next.turn]!]!.connected);assert.equal(next.phase.deadline!-next.phase.startedAt,30000);assert.equal(next.idleTurns,0);assert.deepEqual(next.rng,s.rng);assert.deepEqual([...next.hands.flat(),...next.stock,...next.board.map(t=>t.tile)].sort((a,b)=>a-b),C.allTiles());
 }
});
test('paused active departure after an inactive cycle restores full time only on resume',()=>{
 for(const n of [2,3,4])for(const seed of [1,2,3,146,700064]){
  const s=fullyIdle(n,seed),paused=C.reduce(freeze(s),{type:'vip',now:s.phase.startedAt+1,action:'pause'}),dropped=C.reduce(freeze(paused),{type:'player',now:s.phase.startedAt+2,playerId:s.seats[s.turn]!,connected:false});
  assert.deepEqual(dropped.phase,paused.phase);assert.deepEqual(dropped.board,paused.board);assert.equal(dropped.idleTurns,n);
  const resumed=C.reduce(freeze(dropped),{type:'vip',now:s.phase.startedAt+101,action:'resume'});assert.equal(resumed.phase.id,'play');assert(resumed.players[resumed.seats[resumed.turn]!]!.connected);assert.equal(resumed.phase.deadline!-resumed.phase.startedAt,30000);assert.equal(resumed.idleTurns,0);assert.deepEqual(resumed.rng,s.rng);
 }
});
