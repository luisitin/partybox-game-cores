import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {init,reduce,controllerView,sideOf,type State,type Input} from './core.ts';
import {fromView as baseline} from './bots-before-opponent-nil.ts';
import {context,conservation} from './runner.ts';
import {stateSchema} from './data-schema.ts';
import {scoreSide} from './scoring.ts';
import {ledger} from './reference.ts';
import {createRng} from './../../contract/rng.ts';
const candidate=await import('./bots.ts');
const proof=JSON.parse(readFileSync('failed-opponent-nil-replay.json','utf8'));
let comparisons=0;
function advance(s:State,event:any){const before=JSON.stringify(s),n=reduce(s,event);assert.notEqual(n,s);assert.equal(JSON.stringify(s),before);assert.deepEqual(n,reduce(JSON.parse(before),event));stateSchema.parse(n);conservation(n);return n;}
function prefix(count=true,bonus=100,p=proof){let s=init(context(4,577,{blind:false,exchange:false,failedNilCounts:count,nilValue:bonus}));for(const e of p.prefix)s=advance(s,e);if(count&&bonus===100)assert.deepEqual(s,p.state);return s;}
function end(s:State,input:Input){s=advance(s,{type:'input',playerId:'p0',input,now:s.phase.startedAt+1});for(let step=0;s.phase.id!=='hand'&&step<30;step++){const id=s.seats[s.turn]!,e=s.phase.id==='trick'?{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!}:{type:'input',playerId:id,input:baseline(controllerView(s,id),createRng(731),'normal')!,now:s.phase.startedAt+1};s=advance(s,e);}assert.equal(s.phase.id,'hand');assert(s.report);for(let i=0;i<2;i++)assert.deepEqual(s.report.sides[i],ledger(s.seats.filter(id=>sideOf(s,id)===i).map(id=>({bid:s.bids[id]!,won:s.won[id]!})),0,0,s.settings.nilValue,s.settings.failedNilCounts));return s.report;}
test('legal failed-opponent-nil endgame wins the missing contract: -160 to -40',()=>{
 const s=prefix(),v=controllerView(s,'p0');assert.deepEqual(v.hand,[18,41]);assert.equal(v.trick.length,3);assert.equal(v.bids.p0!.value,6);assert.equal(v.bids.p1!.value,9);assert(v.won.p3!>0);assert.equal(v.won.p0!+v.won.p2!,4);assert.equal(v.won.p1!+v.won.p3!,7);
 for(const skill of ['normal','sharp'] as const){const a=baseline(v,createRng(731),skill),b=candidate.fromView(v,createRng(731),skill);assert.deepEqual(a,{type:'play',card:18});assert.deepEqual(b,{type:'play',card:41});const x=end(s,a!),y=end(s,b!);assert.equal(x.sides[0]!.score,-160);assert.equal(y.sides[0]!.score,-40);assert.equal(y.sides[0]!.score-x.sides[0]!.score,120);assert.equal(y.sides[1]!.score,x.sides[1]!.score);}
});
test('both nil bonuses and all valid two-team carried-bag boundaries independently preserve the 120-point gain',()=>{
 const old=proof.original.report,newer=proof.counterfactual.report;let count=0;
 for(const bonus of [50,100])for(let ownBag=0;ownBag<10;ownBag++)for(let opponentBag=0;opponentBag<10;opponentBag++){
  const records=[old,newer].map(r=>[0,1].map(side=>{const xs=['p0','p1','p2','p3'].filter((_,i)=>i%2===side).map(id=>({bid:r.bids[id],won:r.won[id]}));const carried=side===0?ownBag:opponentBag;const a=scoreSide(xs,0,carried,bonus,true);assert.deepEqual(a,ledger(xs,0,carried,bonus,true));return a;}));
  assert.equal(records[1]![0]!.score-records[0]![0]!.score,120);assert.equal(records[1]![1]!.score,records[0]![1]!.score);assert.equal((records[1]![0]!.score-records[1]![1]!.score)-(records[0]![0]!.score-records[0]![1]!.score),120);count++;
 }assert.equal(count,200);
 const s=prefix(true,50),v=controllerView(s,'p0'),x=end(s,baseline(v,createRng(731),'normal')!),y=end(s,candidate.fromView(v,createRng(731),'normal')!);assert.equal(y.sides[0]!.score-x.sides[0]!.score,120);
});
test('genuine one-trick opponent contract deficit preserves the original action',()=>{
 const p=structuredClone(proof);for(const e of p.prefix)if(e.type==='input'&&e.playerId==='p1'&&e.input.type==='bid')e.input.value=8;
 let s=init(context(4,577,{blind:false,exchange:false,failedNilCounts:true}));for(const e of p.prefix)s=advance(s,e);
 const v=controllerView(s,'p0');assert.equal(v.bids.p1!.value,8);assert.equal(v.won.p1!+v.won.p3!,7);
 for(const skill of ['easy','normal','sharp'] as const)for(let seed=1;seed<=100;seed++){const a=createRng(seed),b=createRng(seed);assert.deepEqual(candidate.fromView(v,b,skill),baseline(v,a,skill));assert.deepEqual(a.state(),b.state());comparisons++;}
});
test('default failed-nil exclusion and Easy preserve exact legal actions and RNG states',()=>{
 for(const count of [false,true])for(const bonus of [50,100])for(const skill of ['easy','normal','sharp'] as const)for(let seed=1;seed<=100;seed++){if(count&&skill!=='easy')continue;const v=controllerView(prefix(count,bonus),'p0'),a=createRng(seed),b=createRng(seed);assert.deepEqual(candidate.fromView(v,b,skill),baseline(v,a,skill));assert.deepEqual(a.state(),b.state());comparisons++;}
});
test('finite genuine first hands preserve unaffected choices, live nil and cutthroat',()=>{
 let liveNil=0,changed=0;
 for(const n of [3,4])for(const count of [false,true])for(let seed=1;seed<=100;seed++){
  let s=init(context(n,seed,{blind:false,exchange:false,failedNilCounts:count}));
  for(let step=0;s.phase.id!=='hand'&&step<150;step++){
   if(s.phase.id==='trick'){s=advance(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});continue;}
   const id=s.seats[s.turn]!,v=controllerView(s,id);
   for(const skill of ['easy','normal','sharp'] as const){const a=createRng(seed),b=createRng(seed),x=baseline(v,a,skill),y=candidate.fromView(v,b,skill);
    if(JSON.stringify(x)!==JSON.stringify(y)){changed++;assert.equal(n,4);assert(count);assert.notEqual(skill,'easy');assert.equal(v.inputType,'play');assert.equal(v.hand.length,2);assert.equal(v.trick.length,3);}
    else{assert.deepEqual(y,x);assert.deepEqual(a.state(),b.state());comparisons++;}
    if(v.inputType==='play')for(const other of s.seats.filter(p=>p!==id&&p!==v.partner))if(v.bids[other]?.kind!=='number'&&v.won[other]===0)liveNil++;
   }
   let input=baseline(v,createRng(seed),'normal')!;if(s.phase.id==='bid'&&id===(n===4?'p3':'p0'))input={type:'nil'};s=advance(s,{type:'input',playerId:id,input,now:s.phase.startedAt+1});
  }assert.equal(s.phase.id,'hand');
 }assert(liveNil>0);console.log(JSON.stringify({scope:'400 genuine first hands/unaffected actions and live opponent nil',comparisons,liveNil,changed}));
});
test('hidden-hand permutations preserve the public projection and winning legal action',()=>{
 const s=prefix(),v=controllerView(s,'p0');for(const [a,b] of [['p1','p2'],['p1','p3'],['p2','p3']] as const){const h=structuredClone(s),x=h.hands[a]![0]!,y=h.hands[b]![0]!;h.hands[a]![0]=y;h.hands[b]![0]=x;stateSchema.parse(h);conservation(h);assert.deepEqual(controllerView(h,'p0'),v);for(const skill of ['normal','sharp'] as const)assert.deepEqual(candidate.fromView(controllerView(h,'p0'),createRng(731),skill),{type:'play',card:41});}
});
