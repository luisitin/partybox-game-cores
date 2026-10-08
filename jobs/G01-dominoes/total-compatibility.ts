import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import type {GameEvent} from '../../contract/contract.ts';
import {createRng} from '../../contract/rng.ts';
import {game,init,reduce,results,type Input} from './core.ts';
import * as baseline from './study-total-baseline.ts';

// Compare EVERY transition with the frozen pre-guard delivery. 0.2.8 intentionally changed only the
// idle speed-up (idleTurns and the resulting play deadline), so exactly those two fields are normalised;
// timers fire at the later of both deadlines so both cores take the same automatic move.
const rng=createRng(0x71a1),seeds=[1,2,3];
while(seeds.length<1003){const seed=rng.int(4,0xffffffff);if(!seeds.includes(seed))seeds.push(seed);}
let transitions=0,games=0,idleDeadlineDifferences=0;
const comparable=(s:unknown)=>{const {idleTurns:_idle,phase,...rest}=s as {idleTurns:number;phase:{deadline:number|null}};return JSON.stringify({...rest,phase:{...phase,deadline:null}});};
const kinds:Record<string,number>={};
for(const seed of seeds){
 const count=2+seed%3;
 const ctx={players:Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true})),seed,now:0,settings:{mode:seed%2?'draw':'block',partners:count===4&&seed%2===0,target:String([100,150,250][seed%3]),reserve:seed%2?'2':'0',opening:seed%3?'rotating':'highest-double',deal:seed%2?'traditional':'block-sized',blocked:seed%2?'difference':'opponents',teamPoints:seed%2?'opponents':'all'}};
 let current=init(ctx),old=baseline.init(ctx),steps=0;
 assert.equal(JSON.stringify(current),JSON.stringify(old));
 const botRng=createRng(seed^0x51b);
 function send(event:GameEvent<Input>){
  const before=JSON.stringify(current),oldBefore=JSON.stringify(old);
  const next=reduce(current,event),oldNext=baseline.reduce(old,event);
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
const report={baselineCommit:'949c2e3de79c4665ea18145fe62bf5b908a77472',baselineSha256:createHash('sha256').update(readFileSync('study-total-baseline.ts')).digest('hex'),games,seeds:seeds.length,transitions,kinds,normalized:['idleTurns','phase.deadline'],idleDeadlineDifferences,stateMismatches:0,resultMismatches:0};
const bytes=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync('total-compatibility-report.json',bytes);
else assert.equal(readFileSync('total-compatibility-report.json','utf8'),bytes);
console.log(bytes);
