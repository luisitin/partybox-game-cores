import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {init,reduce,controllerView,sideOf,type State,type Input} from './core.ts';
import {fromView as original} from './bots-before-failed-nil.ts';
import {context,conservation} from './runner.ts';
import {stateSchema} from './data-schema.ts';
import {ledger,orderedWinner} from './reference.ts';
import {createRng} from '../../contract/rng.ts';
const candidate:typeof import('./bots.ts')=await import('./bots.ts');
const proof=JSON.parse(readFileSync('failed-nil-replay.json','utf8'));
let comparisons=0;
function advance(s:State,event:any){
 const encoded=JSON.stringify(s),n=reduce(s,event);assert.notEqual(n,s);
 assert.equal(JSON.stringify(s),encoded);assert.deepEqual(n,reduce(JSON.parse(encoded),event));
 conservation(n);stateSchema.parse(n);return n;
}
function prefix(failedNilCounts=true,nilValue=100){
 let s=init(context(4,377,{blind:false,exchange:false,failedNilCounts,nilValue}));
 for(const event of proof.prefix)s=advance(s,event);
 if(failedNilCounts&&nilValue===100)assert.deepEqual(s,proof.state);
 return s;
}
function end(start:State,first:Input){
 let s=advance(start,{type:'input',playerId:'p0',input:first,now:start.phase.startedAt+1});
 for(let step=0;s.phase.id!=='hand'&&step<30;step++){
  const event=s.phase.id==='trick'?{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!}:{type:'input',playerId:s.seats[s.turn]!,input:original(controllerView(s,s.seats[s.turn]!),createRng(731),'normal')!,now:s.phase.startedAt+1};
  s=advance(s,event);
 }
 assert.equal(s.phase.id,'hand');assert(s.report);
 for(let side=0;side<2;side++)assert.deepEqual(s.report.sides[side],ledger(s.seats.filter(id=>sideOf(s,id)===side).map(id=>({bid:s.bids[id]!,won:s.won[id]!})),0,0,s.settings.nilValue,s.settings.failedNilCounts));
 return s.report;
}
test('legitimate failed-nil final-two-trick replay rescues a six-trick contract for both strategic skills',()=>{
 const s=prefix(),v=controllerView(s,'p0');
 assert.deepEqual(v.hand,[46,48]);assert.equal(s.won.p0,2);assert.equal(v.trick.length,3);
 assert.equal(orderedWinner([...v.trick,{playerId:'p0',card:46}])!.playerId,'p1');
 assert.equal(orderedWinner([...v.trick,{playerId:'p0',card:48}])!.playerId,'p0');
 for(const skill of ['normal','sharp'] as const){
  const old=original(v,createRng(731),skill),next=candidate.fromView(v,createRng(731),skill);
  assert.deepEqual(old,{type:'play',card:46});assert.deepEqual(next,{type:'play',card:48});
  const a=end(s,old!),b=end(s,next!);
  assert.equal(a.sides[0]!.contract,-60);assert.equal(b.sides[0]!.contract,60);
  assert.equal(a.sides[0]!.nil,-100);assert.equal(b.sides[0]!.nil,-100);
  assert.equal(a.sides[0]!.score,-160);assert.equal(b.sides[0]!.score,-40);comparisons++;
 }
});
test('selectable half-nil bonus preserves the same independently checked contract recovery',()=>{
 const s=prefix(true,50),v=controllerView(s,'p0');
 const old=end(s,original(v,createRng(731),'normal')!),next=end(s,candidate.fromView(v,createRng(731),'normal')!);
 assert.equal(next.sides[0]!.score-old.sides[0]!.score,120);assert.equal(old.sides[0]!.nil,-50);assert.equal(next.sides[0]!.nil,-50);
});
test('default failed-nil exclusion and Easy policy retain exact actions and RNG state',()=>{
 for(const bonus of [50,100])for(const skill of ['easy','normal','sharp'] as const)for(let seed=1;seed<=100;seed++){
  const v=controllerView(prefix(false,bonus),'p0'),a=createRng(seed),b=createRng(seed);
  assert.deepEqual(candidate.fromView(v,b,skill),original(v,a,skill));assert.deepEqual(a.state(),b.state());comparisons++;
 }
 for(const count of [false,true])for(const bonus of [50,100])for(let seed=1;seed<=100;seed++){
  const v=controllerView(prefix(count,bonus),'p0'),a=createRng(seed),b=createRng(seed);
  assert.deepEqual(candidate.fromView(v,b,'easy'),original(v,a,'easy'));assert.deepEqual(a.state(),b.state());comparisons++;
 }
});
test('unfailed nil and every unaffected action along genuine partnership/cutthroat paths stay byte-identical',()=>{
 let observedUnfailedNil=0;
 for(const n of [3,4])for(const count of [false,true])for(let seed=1;seed<=100;seed++){
  let s=init(context(n,seed,{blind:false,exchange:false,failedNilCounts:count}));
  for(let step=0;s.phase.id!=='hand'&&step<150;step++){
   if(s.phase.id==='trick'){s=advance(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});continue;}
   const id=s.seats[s.turn]!,v=controllerView(s,id);
   for(const skill of ['easy','normal','sharp'] as const){
    const a=createRng(seed),b=createRng(seed),x=original(v,a,skill),y=candidate.fromView(v,b,skill);
    if(n===3||skill==='easy'||v.inputType!=='play'||v.bids[id]?.kind==='number'||!count||v.won[id]===0){assert.deepEqual(y,x);assert.deepEqual(b.state(),a.state());comparisons++;}
    if(v.inputType==='play'&&v.bids[id]?.kind!=='number'&&v.won[id]===0)observedUnfailedNil++;
   }
   let input=original(v,createRng(seed),'normal')!;if(s.phase.id==='bid'&&id==='p0')input={type:'nil'};
   s=advance(s,{type:'input',playerId:id,input,now:s.phase.startedAt+1});
  }
  assert.equal(s.phase.id,'hand');
 }
 assert(observedUnfailedNil>0);console.log(JSON.stringify({scope:'400 legitimate full first hands, finite unaffected-policy and successful-nil controls',comparisons,observedUnfailedNil}));
});
test('opponent hidden-hand swaps preserve public/own projections and changed bot choice',()=>{
 const s=prefix(),v=controllerView(s,'p0');
 for(const [a,b] of [['p1','p2'],['p1','p3'],['p2','p3']] as const){
  const hidden=structuredClone(s),ca=hidden.hands[a]![0]!,cb=hidden.hands[b]![0]!;
  hidden.hands[a]![0]=cb;hidden.hands[b]![0]=ca;conservation(hidden);stateSchema.parse(hidden);
  assert.deepEqual(controllerView(hidden,'p0'),v);
  for(const skill of ['normal','sharp'] as const)assert.deepEqual(candidate.fromView(controllerView(hidden,'p0'),createRng(731),skill),{type:'play',card:48});
 }
});
