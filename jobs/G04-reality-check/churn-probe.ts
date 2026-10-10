import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {game,type State} from './core.ts';
function freeze<T>(o:T):T{if(o&&typeof o==='object'){Object.freeze(o);for(const v of Object.values(o))freeze(v);}return o;}
const samplerSeed=0x6040010,sampler=createRng(samplerSeed),bySeats:Record<string,number>={},byMode:Record<string,number>={};
let inputs=0,timers=0,pauses=0,presenceEvents=0,permanentLeaves=0,staleChecks=0,prototypeRosters=0,maxSteps=0;
for(let gameIndex=0;gameIndex<1000;gameIndex++){
 const seed=sampler.int(0,0xffffffff),rng=createRng(seed),n=2+gameIndex%7,mode=['quick','mixed','bluff'][gameIndex%3]!;
 const special=gameIndex%20===0;const ids=Array.from({length:n},(_,i)=>special&&i<3?['__proto__','constructor','toString'][i]!:`p${i}`);
 if(special)prototypeRosters++;
 let s=freeze(game.init({players:ids.map((id,i)=>({id,name:`Player ${i+1}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode,rounds:12}})),clock=0,steps=0;
 while(s.phase.id!=='done'&&steps++<3000){
  clock=Math.max(clock,s.phase.startedAt)+1;
  if(steps%13===0){
   const paused=freeze(game.reduce(s,{type:'vip',action:'pause',now:clock}));
   for(const id of ids)assert.equal(game.controllerView(paused,id).inputType,null);
   assert.equal(game.reduce(paused,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!}),paused);
   const id=rng.pick(ids),left=freeze(game.reduce(paused,{type:'player',playerId:id,connected:false,now:clock+1}));
   assert.equal(left.phase.id,paused.phase.id);assert.equal(left.phase.paused?.at,paused.phase.paused?.at);
   clock+=rng.int(10,1000);s=freeze(game.reduce(left,{type:'vip',action:'resume',now:clock}));assert(!s.phase.paused);pauses++;presenceEvents++;
  }
  if(s.phase.id==='done')break;
  if(rng.chance(.15)){
   const id=rng.pick(ids),gone=rng.chance(.2)?'left' as const:undefined,old=s;
   s=freeze(game.reduce(s,{type:'player',playerId:id,connected:rng.chance(.5),gone,now:clock}));presenceEvents++;if(gone)permanentLeaves++;
   if(s.left.includes(id)){assert.equal(s.players[id]!.connected,false);assert.equal(game.controllerView(s,id).inputType,null);}
   if(s.phase.id!==old.phase.id||s.phase.startedAt!==old.phase.startedAt){assert.equal(game.reduce(s,{type:'timer',phaseId:old.phase.id,startedAt:old.phase.startedAt,now:old.phase.deadline!}),s);staleChecks++;}
   continue;
  }
  let acted=false;
  for(const id of rng.shuffle(ids)){
   const action=game.bot.sampleInput(s,id,rng,rng.pick(['easy','normal','sharp'] as const));
   if(action){assert(game.inputSchema.safeParse(action).success);const next=game.reduce(s,{type:'input',playerId:id,input:action,now:clock});assert.notEqual(next,s);s=freeze(next);inputs++;acted=true;break;}
  }
  if(!acted){clock=s.phase.deadline!;const next=game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:clock});assert.notEqual(next,s);s=freeze(next);timers++;}
  assert.deepEqual(s.seats,ids);assert(ids.every(id=>Number.isFinite(s.scores[id]!)));assert.deepEqual(JSON.parse(JSON.stringify(s)),s);
 }
 assert.equal(s.phase.id,'done');const result=game.results(s)!;
 assert.deepEqual(Object.keys(result.scores).sort(),[...ids].sort());assert.equal(result.ranking.length,n);
 const sorted=[...ids].sort((a,b)=>result.scores[b]!-result.scores[a]!);
 for(const row of result.ranking)assert.equal(row.rank,sorted.findIndex(id=>result.scores[id]===row.score)+1);
 assert.deepEqual(result.winnerIds,ids.filter(id=>result.scores[id]===result.scores[sorted[0]!]));
 assert(Buffer.byteLength(JSON.stringify(s))<=256*1024);maxSteps=Math.max(maxSteps,steps);
 bySeats[n]=(bySeats[n]??0)+1;byMode[mode]=(byMode[mode]??0)+1;
}
const report={samplerSeed,games:1000,bySeats,byMode,prototypeRosters,inputs,timers,pauses,presenceEvents,permanentLeaves,staleChecks,maxSteps,failures:0};
writeFileSync('churn-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
