import test from 'node:test';
import assert from 'node:assert/strict';
import {game, start, timer, toPhase, finish, createRng, rules} from './helpers.mjs';
const positive=[36,...Array.from({length:13},(_,i)=>39+i)];
const ids=['p0','p1','p2','p3'];

test('deck cuts, equal deals, and three/five/even-seat pass rotations',()=>{
 assert.deepEqual(rules.removedCards(3,'diamonds'),[13]);assert.deepEqual(rules.removedCards(3,'clubs'),[0]);
 assert.deepEqual(rules.removedCards(5,'diamonds'),[0,13]);assert.deepEqual(rules.removedCards(6,'diamonds'),[0,1,13,26]);
 for(const n of [3,4,5,6]){const s=start(4,n);const all=Object.values(s.hands).flat();assert.deepEqual([...all].sort((a,b)=>a-b),rules.deckFor(n,'diamonds'));assert.equal(new Set(all).size,all.length);assert.ok(Object.values(s.hands).every(h=>h.length===all.length/n));}
 assert.deepEqual([1,2,3,4,5].map(h=>rules.passingOffset(h,5,false)),[1,-1,2,-2,0]);
 assert.deepEqual([1,2,3,4,5].map(h=>rules.passingOffset(h,4,false)),[1,-1,2,0,1]);
 assert.deepEqual([1,2,3,4].map(h=>rules.passingOffset(h,3,false)),[1,-1,0,1]);assert.deepEqual([1,2,3,4,5,6].map(h=>rules.passingOffset(h,6,false)),[1,-1,2,-2,3,0]);assert.equal(rules.passingOffset(1,4,true),0);
});
test('atomic pass, exactly three unique owned cards, no early received/sent leakage',()=>{
 let s=start();const before=structuredClone(s);const chosen=Object.fromEntries(s.order.map(id=>[id,s.hands[id].slice(0,3)]));
 for(const cards of [[1,1,1],s.hands.p0.slice(0,2),[...s.hands.p1.slice(0,3)]])assert.equal(game.reduce(s,{type:'input',playerId:'p0',input:{type:'pass',cards},now:1001}),s);
 for(let i=0;i<4;i++){
  const id=s.order[i];s=game.reduce(s,{type:'input',playerId:id,input:{type:'pass',cards:chosen[id]},now:1002+i});
  if(i<3){assert.deepEqual(s.hands,before.hands);const cv=game.controllerView(s,'p0');assert.ok(!Object.hasOwn(cv,'sentCards'));assert.ok(!Object.hasOwn(cv,'receivedCards'));}
 }
 assert.equal(s.phase.id,'play');
 for(let i=0;i<4;i++){const id=s.order[i];const giver=s.order[(i+3)%4];assert.deepEqual(game.controllerView(s,id).receivedCards,chosen[giver]);assert.ok(chosen[giver].every(c=>s.hands[id].includes(c)));assert.ok(chosen[id].every(c=>!s.hands[id].includes(c)));}
 const all=Object.values(s.hands).flat();assert.equal(new Set(all).size,52);assert.equal(s.hands[s.actor].includes(s.opening),true);
});
test('suit-follow, point-free first trick with exception, unbroken heart leads, led-suit winner',()=>{
 const trick=[{playerId:'p0',card:0}];
 assert.deepEqual(rules.legalCards([0,12,36,39],[],true,false,0),[0]);
 assert.deepEqual(rules.legalCards([12,36,39],trick,true,false,0),[12]);
 assert.deepEqual(rules.legalCards([13,36,39],trick,true,false,0),[13]);
 assert.deepEqual(rules.legalCards([36,39],trick,true,false,0),[36,39]);
 assert.deepEqual(rules.legalCards([13,39],[],false,false,0),[13]);assert.deepEqual(rules.legalCards([39,51],[],false,false,0),[39,51]);
 assert.deepEqual(rules.legalCards([13,39],[],false,true,0),[13,39]);
 assert.equal(rules.trickWinner([{playerId:'a',card:0},{playerId:'b',card:51},{playerId:'c',card:12},{playerId:'d',card:11}]),'c');
 assert.equal(rules.penalty(36),13);assert.equal(rules.penalty(51),1);assert.equal(rules.penalty(22),0);
});
test('shoot both moons, independent jack taker, ordinary penalties',()=>{
 const captured={p0:positive,p1:[22],p2:[],p3:[]};
 assert.deepEqual(rules.settleHand(ids,captured,'add',true),{points:{p0:0,p1:16,p2:26,p3:26},moon:'p0'});
 assert.deepEqual(rules.settleHand(ids,captured,'subtract',true),{points:{p0:-26,p1:-10,p2:0,p3:0},moon:'p0'});
 assert.deepEqual(rules.settleHand(ids,{...captured,p0:[...positive,22],p1:[]},'add',true).points,{p0:-10,p1:26,p2:26,p3:26});
 assert.deepEqual(rules.settleHand(ids,{p0:[36,39],p1:[40],p2:[],p3:[]},'subtract',false),{points:{p0:14,p1:1,p2:0,p3:0},moon:null});
});
test('actor validation, legal ownership, captures and queen/hearts break setting',()=>{
 let s=toPhase(start(33,4,{noPass:true}),'play');
 const actor=s.actor;const other=s.order.find(id=>id!==actor);const cv=game.controllerView(s,actor);
 assert.equal(game.reduce(s,{type:'input',playerId:other,input:{type:'play',card:s.hands[other][0]},now:1002}),s);
 assert.equal(game.reduce(s,{type:'input',playerId:actor,input:{type:'play',card:s.hands[other][0]},now:1002}),s);
 const opening=cv.legal[0];s=game.reduce(s,{type:'input',playerId:actor,input:{type:'play',card:opening},now:s.phase.startedAt+1});assert.equal(s.hands[actor].includes(opening),false);
 const t=toPhase(s,'trick');const winner=rules.trickWinner(t.trick);assert.equal(t.actor,winner);assert.equal(t.lastWinner,winner);assert.deepEqual(t.captured[winner],t.trick.map(p=>p.card));
 const queen={...t,phase:{id:'play',startedAt:10,deadline:null},actor:'p0',trick:[],trickNumber:1,hands:{...t.hands,p0:[36,39]},heartsBroken:false};
 assert.equal(game.reduce(queen,{type:'input',playerId:'p0',input:{type:'play',card:36},now:11}).heartsBroken,false);
 assert.equal(game.reduce({...queen,settings:{...queen.settings,queenBreaks:true}},{type:'input',playerId:'p0',input:{type:'play',card:36},now:11}).heartsBroken,true);
 assert.equal(game.reduce({...queen,hands:{...queen.hands,p0:[39]}},{type:'input',playerId:'p0',input:{type:'play',card:39},now:11}).heartsBroken,true);
});
test('clock expiry, stale instances, pause freezes input and preserves remaining time',()=>{
 const s=start(8,4,{turnSeconds:10});
 for(const e of [{type:'timer',phaseId:'other',startedAt:s.phase.startedAt,now:s.phase.deadline},{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt-1,now:s.phase.deadline},{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline-1}])assert.equal(game.reduce(s,e),s);
 const pa=game.reduce(s,{type:'vip',action:'pause',now:2000});assert.ok(pa.phase.paused);
 assert.equal(timer(pa),pa);assert.equal(game.reduce(pa,{type:'input',playerId:pa.actor,input:{type:'pass',cards:pa.hands[pa.actor].slice(0,3)},now:2001}),pa);
 const resumed=game.reduce(pa,{type:'vip',action:'resume',now:6000});assert.equal(resumed.phase.deadline,s.phase.deadline+4000);assert.ok(!resumed.phase.paused);
 assert.notEqual(timer(resumed),resumed);assert.equal(game.reduce(s,{type:'input',playerId:s.actor,input:{type:'pass',cards:s.hands[s.actor].slice(0,3)},now:s.phase.deadline}),s);
 const idle=start();assert.equal(timer(idle),idle);
});
test('score once, lower totals win, leavers persist, known prototype ids work and unknown do not',()=>{
 const h=toPhase(start(8,4,{target:25}),'hand');const scores={...h.scores};const d=game.reduce(h,{type:'vip',action:'end',now:h.phase.startedAt+1});assert.deepEqual(d.scores,scores);
 const changed={...d,scores:{p0:0,p1:20,p2:0,p3:-10},left:['p3']};const r=game.results(changed);assert.deepEqual(r.winnerIds,['p3']);assert.deepEqual(r.ranking.map(x=>[x.playerId,x.rank]),[['p3',1],['p0',2],['p2',2],['p1',4]]);assert.equal(r.scores.p3,-10);
 const spectator=game.controllerView(h,'__proto__');assert.equal(spectator.me.role,'spectator');assert.deepEqual(spectator.hand,[]);
 assert.equal(game.reduce(h,{type:'player',playerId:'__proto__',connected:false,now:100}),h);
 const original=start();const actor=original.actor;const left=game.reduce(original,{type:'player',playerId:actor,connected:false,gone:'left',now:1100});assert.ok(left.left.includes(actor));assert.notEqual(left.actor,actor);
 const done=game.reduce(left,{type:'vip',action:'end',now:1200});assert.deepEqual(Object.keys(game.results(done).scores).sort(),original.order);
});
test('hidden opponent hands/pass selections do not change TV/another controller; views do not alias',()=>{
 const s=start(12);const altered={...s,hands:{...s.hands,p1:[...s.hands.p1].reverse()},passes:{p1:s.hands.p1.slice(0,3)}};
 // Public submitted status may change; private selections may not.
 const passed={...s,passes:{p1:s.hands.p1.slice(3,6)}};
 assert.deepEqual(game.tvView(altered),game.tvView({...passed,hands:altered.hands}));
 assert.deepEqual(game.controllerView(altered,'p0'),game.controllerView({...passed,hands:s.hands},'p0'));
 const json=JSON.stringify(s);const v=game.controllerView(s,'p0');v.hand[0]=99;v.scores.p0=999;v.settings.target=25;v.players[0].name='changed';assert.equal(JSON.stringify(s),json);
 for(const key of ['hands','passes','sent','received','captured','rng'])assert.ok(!Object.hasOwn(game.tvView(s),key));
});
test('complete seed-1 match and schema-valid bot inputs in every phase',()=>{
 const {state:d,events}=finish(start(1));assert.equal(d.phase.id,'done');assert.ok(d.handNumber>1);assert.equal(Object.keys(game.results(d).scores).length,4);
 assert.ok(events.length>100);for(const e of events)if(e.type==='input')assert.ok(game.inputSchema.safeParse(e.input).success);
 for(const phase of game.phases){const s=phase==='done'?d:toPhase(start(2),phase);for(const id of [...s.order,'spectator'])for(const skill of ['easy','normal','sharp']){const input=game.bot.sampleInput(s,id,createRng(1),skill);assert.ok(input===null||game.inputSchema.safeParse(input).success);}}
});
