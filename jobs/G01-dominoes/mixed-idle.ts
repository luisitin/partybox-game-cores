import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
const C:typeof import('./core.ts')=await import(process.env.CORE_PATH??'./core.ts');
const groups:Record<string,{cases:number;failures:number;maximumMs:number}>={};let cases=0,failures=0,maximumMs=0;const examples:unknown[]=[];
const budgetMs=C.game.manifest.estimatedMinutes*3*60000;
for(const n of [2,3,4])for(let bots=1;bots<n;bots++)for(const mode of ['draw','block'])for(const target of [100,150,250]){
 const key=`${n} seats/${bots} bots/${mode}/${target}`;const group=groups[key]={cases:0,failures:0,maximumMs:0};
 for(let seed=1;seed<=1000;seed++){
  let s=C.init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true,bot:i>=n-bots})),seed,now:0,settings:{mode,target:String(target),partners:n===4&&seed%2===0,deal:seed%3?'traditional':'block-sized',reserve:seed%2?'2':'0',opening:seed%2?'rotating':'highest-double'}});
  const rng=createRng(seed);let steps=0;
  while(s.phase.id!=='done'&&steps++<20000){const actor=s.seats[s.turn]!;
   if(s.phase.id==='play'&&s.players[actor]!.bot){const input=C.game.bot.sampleInput(s,actor,rng,'normal');assert(input);s=C.reduce(s,{type:'input',playerId:actor,input,now:s.phase.startedAt+200});}
   else{assert(s.phase.deadline!==null);s=C.reduce(s,{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});}
  }
  assert.equal(s.phase.id,'done');cases++;group.cases++;maximumMs=Math.max(maximumMs,s.phase.startedAt);group.maximumMs=Math.max(group.maximumMs,s.phase.startedAt);
  if(s.phase.startedAt>budgetMs){failures++;group.failures++;if(examples.length<10)examples.push({key,seed,ms:s.phase.startedAt});}
 }
 console.log(key,group);
}
const report={cases,budgetMs,failures,maximumMs,humanInputs:0,botMoveDelayMs:200,groups,examples,passed:failures===0};writeFileSync(process.env.IDLE_REPORT??'mixed-idle-report.json',JSON.stringify(report,null,2)+'\n');console.log({cases,failures,maximumMs});if(process.argv.includes('--enforce'))assert.equal(failures,0);
