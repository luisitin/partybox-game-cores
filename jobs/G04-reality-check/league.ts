import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
import {game,init,reduce,results} from './core.ts';
const reports=[];
for(const mode of ['quick','mixed','bluff'])for(const [a,b] of [['sharp','normal'],['normal','easy']] as [BotSkill,BotSkill][]){
 let wins=0,losses=0,ties=0,steps=0;const games=2000;
 for(let seed=1;seed<=games;seed++){
  const first=seed%2;let s=init({players:[0,1].map(i=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode}});
  const rngs=[createRng(seed^0x1234),createRng(seed^0xabcd)];let count=0;
  while(s.phase.id!=='done'&&count<3000){
   let action=null,actor='';
   for(let i=0;i<2;i++){const sampled=game.bot.sampleInput(s,`p${i}`,rngs[i]!,i===first?a:b);if(sampled){action=sampled;actor=`p${i}`;break;}}
   s=action?reduce(s,{type:'input',playerId:actor,input:action,now:s.phase.startedAt+1}):reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});count++;
  }
  assert.equal(s.phase.id,'done');const ids=results(s)!.winnerIds;
  if(ids.length>1)ties++;else if(ids[0]===`p${first}`)wins++;else losses++;steps+=count;
 }
 const rate=wins/games,se=Math.sqrt(rate*(1-rate)/games),confidence95=[rate-1.96*se,rate+1.96*se];
 const report={mode,a,b,games,wins,losses,ties,winRate:rate,confidence95,steps,scope:'fictional workshop rows; public clues and own controller only'};
 reports.push(report);console.log(report);assert(confidence95[0]!>.5,`${mode}: ${a} must clearly beat ${b}`);
}
writeFileSync('league-report.json',JSON.stringify(reports,null,2)+'\n');
