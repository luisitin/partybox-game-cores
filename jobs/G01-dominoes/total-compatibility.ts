import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import type {GameEvent} from '../../contract/contract.ts';
import {createRng} from '../../contract/rng.ts';
import {game,init,reduce,results,type Input} from './core.ts';
import * as baseline from './study-total-baseline.ts';
import * as presenceBaseline from './study-presence-baseline.ts';

// Compare EVERY transition with the frozen pre-guard delivery. 0.2.8 intentionally changed only the
// idle speed-up (idleTurns and the resulting play deadline), so exactly those two fields are normalised;
// timers fire at the later of both deadlines so both cores take the same automatic move.
// The explicit-absence follow-up deliberately performs legal old-engine play at
// the declaration time. Replay that policy through the UNCHANGED frozen engine,
// then compare every physical/state field using the same two historical clock
// normalisations. No seed/event/physical/scoring/RNG field is skipped. A separate
// whole-state lane below compares fully connected games to exact Ready11 eadb.
const rng=createRng(0x71a1),seeds=[1,2,3];
while(seeds.length<1003){const seed=rng.int(4,0xffffffff);if(!seeds.includes(seed))seeds.push(seed);}
let transitions=0,games=0,idleDeadlineDifferences=0,absenceReplayActions=0;
const comparable=(s:unknown)=>{const {idleTurns:_idle,phase,...rest}=s as {idleTurns:number;phase:{deadline:number|null}};return JSON.stringify({...rest,phase:{...phase,deadline:null}});};
const kinds:Record<string,number>={};
function declaredAbsenceReference(s:ReturnType<typeof baseline.init>,now:number){
 if(s.phase.paused||s.phase.id!=='play'||s.seats.every(id=>!s.players[id]!.connected))return s;
 // Every raw Draw consumes a stock tile. Every other legal action must leave
 // the absent seat or finish the round. At least one seat is present: stock
 // plus N-1 absent seats is a tighter bound than the production safety cap.
 const maximum=s.stock.length+s.seats.length-1;let reference=s,actions=0;
 while(reference.phase.id==='play'&&!reference.players[reference.seats[reference.turn]!]!.connected){
  assert(actions++<maximum,'Independent absence replay must make bounded physical progress');
  const options=baseline.legal(reference),move=baseline.greedy(reference.hands[reference.turn]!,reference.ends,options);
  assert(options.some(option=>baseline.sameInput(move,option)));
  const next=baseline.apply(reference,move,now);assert.notEqual(next,reference);assert.deepEqual(next.rng,reference.rng);
  assert(next.stock.length<reference.stock.length||next.turn!==reference.turn||next.phase.id!=='play');
  const inventory=[...next.hands.flat(),...next.stock,...next.board.map(t=>t.tile)].sort((a,b)=>a-b);
  assert.deepEqual(inventory,baseline.allTiles(),'Each independent old-engine action conserves all 28 unique tiles');
  reference=next;absenceReplayActions++;
 }
 return reference;
}
for(const seed of seeds){
 const count=2+seed%3;
 const ctx={players:Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true})),seed,now:0,settings:{mode:seed%2?'draw':'block',partners:count===4&&seed%2===0,target:String([100,150,250][seed%3]),reserve:seed%2?'2':'0',opening:seed%3?'rotating':'highest-double',deal:seed%2?'traditional':'block-sized',blocked:seed%2?'difference':'opponents',teamPoints:seed%2?'opponents':'all'}};
 let current=init(ctx),old=baseline.init(ctx),steps=0;
 assert.equal(JSON.stringify(current),JSON.stringify(old));
 const botRng=createRng(seed^0x51b);
 function send(event:GameEvent<Input>){
  const before=JSON.stringify(current),oldBefore=JSON.stringify(old);
  const next=reduce(current,event),originalOldNext=baseline.reduce(old,event);
  const oldNext=originalOldNext===old?old:declaredAbsenceReference(originalOldNext,event.now);
  assert.equal(JSON.stringify(current),before);assert.equal(JSON.stringify(old),oldBefore);
  assert.equal(comparable(next),comparable(oldNext),`seed ${seed}, ${event.type}, transition ${steps}`);
  if(JSON.stringify(next)!==JSON.stringify(oldNext))idleDeadlineDifferences++;
  current=JSON.parse(JSON.stringify(next));old=JSON.parse(JSON.stringify(oldNext));
  transitions++;kinds[event.type]=(kinds[event.type]??0)+1;
 }
 send({type:'player',playerId:'p0',connected:false,gone:'left',now:1});
 send({type:'player',playerId:'p0',connected:true,now:2});
 send({type:'vip',action:'pause',now:3});
 send({type:'timer',phaseId:current.phase.id,startedAt:current.phase.startedAt,now:60000});
 send({type:'vip',action:'resume',now:13});
 while(current.phase.id!=='done'&&steps++<20000){
  const now=Math.max(current.phase.startedAt+1,steps*100);
  if(steps%17===0)send({type:'timer',phaseId:current.phase.id,startedAt:current.phase.startedAt,now:Math.max(current.phase.deadline!,old.phase.deadline!)});
  else if(steps%29===0)send({type:'vip',action:'skip',now});
  else{const input=game.bot.sampleInput(current,current.seats[current.turn]!,botRng,seed%2?'easy':'normal');assert(input);send({type:'input',playerId:current.seats[current.turn]!,input,now});}
 }
 assert.equal(current.phase.id,'done',`seed ${seed} did not terminate`);
 assert.deepEqual(results(current),baseline.results(old));games++;
}
let connectedGames=0,connectedTransitions=0;
for(const seed of seeds){
 const count=2+seed%3;
 const ctx={players:Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true})),seed,now:0,settings:{mode:seed%2?'draw':'block',partners:count===4&&seed%2===0,target:String([100,150,250][seed%3]),reserve:seed%2?'2':'0',opening:seed%3?'rotating':'highest-double',deal:seed%2?'traditional':'block-sized',blocked:seed%2?'difference':'opponents',teamPoints:seed%2?'opponents':'all'}};
 let current=init(ctx),old=presenceBaseline.init(ctx),steps=0;
 assert.deepEqual(current,old);const botRng=createRng(seed^0x51b);
 function send(event:GameEvent<Input>){
  const currentBefore=JSON.stringify(current),oldBefore=JSON.stringify(old);
  const next=reduce(current,event),oldNext=presenceBaseline.reduce(old,event);
  assert.equal(JSON.stringify(current),currentBefore);assert.equal(JSON.stringify(old),oldBefore);
  assert.equal(JSON.stringify(next),JSON.stringify(oldNext),`Fully connected whole-state seed ${seed}, ${event.type}, transition ${steps}`);
  current=JSON.parse(JSON.stringify(next));old=JSON.parse(JSON.stringify(oldNext));connectedTransitions++;
 }
 send({type:'player',playerId:'p0',connected:true,now:1});send({type:'vip',action:'pause',now:3});send({type:'timer',phaseId:current.phase.id,startedAt:current.phase.startedAt,now:60000});send({type:'vip',action:'resume',now:13});
 while(current.phase.id!=='done'&&steps++<20000){
  const now=Math.max(current.phase.startedAt+1,steps*100);
  if(steps%17===0)send({type:'timer',phaseId:current.phase.id,startedAt:current.phase.startedAt,now:current.phase.deadline!});
  else if(steps%29===0)send({type:'vip',action:'skip',now});
  else{const input=game.bot.sampleInput(current,current.seats[current.turn]!,botRng,seed%2?'easy':'normal');assert(input);send({type:'input',playerId:current.seats[current.turn]!,input,now});}
 }
 assert.equal(current.phase.id,'done',`Fully connected seed ${seed} did not terminate`);assert.deepEqual(results(current),presenceBaseline.results(old));connectedGames++;
}
const report={baselineCommit:'949c2e3de79c4665ea18145fe62bf5b908a77472',baselineSha256:createHash('sha256').update(readFileSync('study-total-baseline.ts')).digest('hex'),games,seeds:seeds.length,transitions,kinds,normalized:['idleTurns','phase.deadline'],idleDeadlineDifferences,stateMismatches:0,resultMismatches:0,explicitAbsencePolicy:'Unchanged frozen engine legal greedy actions at declaration time; full physical state comparison, stock plus N-1 progress bound; paused/empty tables unchanged',absenceReplayActions,connectedBaselineCommit:'eadb642bc1f9f4f2c839c7a6754932e7a5b640ec',connectedBaselineSha256:createHash('sha256').update(readFileSync('study-presence-baseline.ts')).digest('hex'),connectedGames,connectedTransitions,connectedWholeStateMismatches:0};
const bytes=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync('total-compatibility-report.json',bytes);
else assert.equal(readFileSync('total-compatibility-report.json','utf8'),bytes);
console.log(bytes);
