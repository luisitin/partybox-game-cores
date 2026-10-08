import {test} from 'node:test';
import assert from 'node:assert/strict';
import {minimizeDeadwood,validMeld,optimalDefense,declaredSolution} from '../dist/cards.mjs';
import {game,configuration,handAward,finalScores} from '../dist/core.mjs';
import {initial,rng,freeze,invariant} from './helpers.mjs';
const c=(rank,suit=0)=>suit*13+rank-1;
test('aces low, set cardinality, runs and overlap',()=>{
 assert(validMeld([0,1,2]));assert(!validMeld([11,12,0]));assert(!validMeld([1,15,29]));
 assert(validMeld([4,17,30,43]));assert(!validMeld([4,17]));assert(!validMeld([1,1,1]));
 assert.equal(minimizeDeadwood([4,17,30]).deadwood,0);
 assert.equal(minimizeDeadwood([c(7,0),c(7,1),c(7,2),c(8,2),c(9,2)]).deadwood,14);
 assert.equal(minimizeDeadwood([0,1,2,3,4,13,14,15,16,17]).deadwood,0);
 assert.throws(()=>minimizeDeadwood([0,0]));assert.throws(()=>minimizeDeadwood([52]));
 assert.equal(declaredSolution([0,1,2],[[0,1,2],[0,1,2]]),null);
});
test('joint meld/layoff optimizer finds chains and forbids gin/deadwood/four-card layoffs',()=>{
 const target=[[c(4),c(5),c(6)],[c(10,1),c(10,2),c(10,3)]];
 const hand=[c(2),c(3),c(7),c(8),c(10),c(1,1),c(2,1),c(3,1),c(12,2),c(13,3)];
 const result=optimalDefense(hand,target,true);assert.equal(result.deadwood,20);assert.equal(result.laid.length,5);
 assert.equal(optimalDefense(hand,target,false).laid.length,0);assert.equal(optimalDefense(hand,target,false).deadwood,50);
 assert.equal(optimalDefense([c(1),c(2),c(3)],[...target,[c(10),c(10,1),c(10,2),c(10,3)]],true).deadwood,0);
 assert.equal(optimalDefense([c(10)],[[c(10,1),c(10,2),c(10,3)]],true).deadwood,0);
 assert.equal(optimalDefense([c(1)],[[c(1),c(2),c(3)]],true).deadwood,1);
});
test('every score formula, tie undercut and spade whole-hand doubling',()=>{
 for(const profile of ['classic','northAmerican','rubl']) {
  const cfg=configuration({bonusProfile:profile});
  assert.deepEqual(handAward(cfg,7,9),{winner:'knocker',points:2,kind:'knock'});
  assert.equal(handAward(cfg,7,7).points,cfg.undercutBonus);assert.equal(handAward(cfg,7,4).points,cfg.undercutBonus+3);
  assert.equal(handAward(cfg,0,0).winner,'knocker');assert.equal(handAward(cfg,0,30).points,cfg.ginBonus+30);
  assert.equal(handAward(cfg,0,30,true).points,61);assert.equal(handAward(cfg,0,30,true,2).points,122);
  assert.equal(handAward(cfg,7,4,false,2).points,2*(cfg.undercutBonus+3));
 }
 assert.equal(handAward(configuration({bigGinBonus:'50'}),0,30,true).points,80);
 const s=initial();s.scores={p0:100,p1:20};s.boxes={p0:2,p1:1};s.wins={p0:2,p1:1};
 assert.deepEqual(finalScores(s,'p0'),{p0:240,p1:40});s.scores.p1=0;s.wins.p1=0;s.boxes.p1=0;
 for(const [shutout,score]of [['gameBonus',340],['handPoints',340],['wholeScore',440],['none',240]]) {
  s.config.shutout=shutout;assert.equal(finalScores(s,'p0').p0,score);
 }
});
test('opening offers, forced stock, exact immediate-return restriction, stock draw boundary',()=>{
 let s=initial(1),now=0;const first=s.turn;
 const act=input=>{s=game.reduce(s,{type:'input',playerId:s.turn,now:++now,input});};
 assert.equal(game.reduce(s,{type:'input',playerId:s.turn,now:1,input:{type:'draw',source:'stock'}}),s);
 act({type:'pass'});assert.notEqual(s.turn,first);act({type:'pass'});assert.equal(s.turn,first);assert(s.mustStock);
 assert.equal(game.reduce(s,{type:'input',playerId:s.turn,now:3,input:{type:'draw',source:'discard'}}),s);
 act({type:'draw',source:'stock'});assert.equal(s.hands[first].length,11);
 const newly=s.hands[first].at(-1);act({type:'discard',card:newly});assert.equal(s.phase.id,'draw');
 const top=s.discard.at(-1);act({type:'draw',source:'discard'});
 assert.equal(game.reduce(s,{type:'input',playerId:s.turn,now:6,input:{type:'discard',card:top}}),s);
 const d=game.controllerView(s,s.turn).legal.find(x=>x.type==='discard'&&!x.knock);act(d);invariant(s);
 // Reach the last stock draw legally; never cancel before its corresponding discard.
 for(let i=0;i<100&&s.stock.length>2;i++){if(s.phase.id==='draw')act({type:'draw',source:'stock'});else act(game.controllerView(s,s.turn).legal.find(x=>x.type==='discard'&&!x.knock));}
 assert.equal(s.stock.length,2);assert.equal(s.phase.id,'discard');
 act(game.controllerView(s,s.turn).legal.find(x=>x.type==='discard'&&!x.knock));assert.equal(s.phase.id,'round-end');assert.equal(s.roundResult.kind,'draw');
 const dealer=s.dealer;act({type:'next'});assert.equal(s.dealer,dealer);
});
test('Oklahoma limits / ace / spade configurations from all 52 initial upcards',()=>{
 const seen=new Set();
 for(let seed=1;seen.size<52&&seed<10000;seed++){
  const s=initial(seed,2,{variant:'oklahoma'});seen.add(s.initialUpcard);
  const r=s.initialUpcard%13+1;assert.equal(s.knockLimit,r===1?0:Math.min(r,10));assert.equal(s.multiplier,s.initialUpcard>=39?2:1);
  const plain=initial(seed,2,{variant:'oklahoma',aceGin:false,spadeDouble:false});assert.equal(plain.knockLimit,Math.min(r,10));assert.equal(plain.multiplier,1);
 }assert.equal(seen.size,52);
});
test('pause, resume, stale/early timer, spectators, malformed input, late leaver, explicit end',()=>{
 let s=initial(1,2,{turnSeconds:10}),now=0;
 const original=JSON.stringify(s);freeze(s);
 for(const id of ['spectator','__proto__','constructor',''])assert.equal(game.reduce(s,{type:'input',playerId:id,now:1,input:{type:'pass'}}),s);
 assert.equal(game.reduce(s,{type:'input',playerId:s.turn,now:1,input:{type:'discard',card:-1}}),s);
 for(const phaseId of ['bad',s.phase.id])assert.equal(game.reduce(s,{type:'timer',phaseId,startedAt:-1,now:20000}),s);
 assert.equal(game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:5}),s);
 s=game.reduce(s,{type:'vip',action:'pause',now:10});
 assert.equal(game.reduce(s,{type:'input',playerId:s.turn,input:{type:'pass'},now:11}),s);
 assert.equal(game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:20000}),s);
 s=game.reduce(s,{type:'vip',action:'resume',now:110});assert.equal(s.phase.deadline,10100);
 s=game.reduce(s,{type:'player',playerId:s.turn,connected:false,gone:'left',now:111});assert.notEqual(s.phase.id,'upcard');
 const ended=game.reduce(s,{type:'vip',action:'end',now:112});assert(game.results(ended));assert.equal(Object.keys(game.results(ended).scores).length,2);
 assert.deepEqual(game.results(ended).scores,s.scores);assert.equal(JSON.parse(original).hand,1);
 assert.equal(game.reduce(ended,{type:'vip',action:'skip',now:113}),ended);
});
test('all required roster settings, default sanitization, exact phase fixtures and manifest',async()=>{
 const {gameManifestSchema}=await import('../dist/contract.mjs');
 assert(gameManifestSchema.safeParse(game.manifest).success);
 const {readFile}=await import('node:fs/promises');assert.deepEqual(JSON.parse(await readFile('manifest.json','utf8')),game.manifest);
 assert.equal(configuration({target:'NaN',turnSeconds:NaN}).target,100);
 assert.equal(configuration({turnSeconds:155}).turnSeconds,120);
 assert.throws(()=>initial(1,3,{mode:'duel'}));assert.throws(()=>initial(1,2,{mode:'rotation'}));
 for(const phase of game.phases){const s=JSON.parse(await readFile(`fixtures/${phase}.json`,'utf8'));assert.equal(s.phase.id,phase);invariant(s);assert.doesNotThrow(()=>game.tvView(s));}
});
