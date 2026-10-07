// Isolated search-budget experiments; production source is never edited.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createRng} from '../../contract/rng.ts';
import * as base from './core.ts';
const study=process.env.BUDGET_STUDY??'depth4';assert(['depth4','samples32'].includes(study));
const seedStart=Number(process.env.BUDGET_SEED_START??1);assert(Number.isSafeInteger(seedStart)&&seedStart>0);
const reportPath=`budget-${study}${seedStart===1?'':'-confirmation'}-report.json`;
const path=`./mutant-${study}-study.ts`;const text=readFileSync('core.ts','utf8');
const from=study==='depth4'?'*o.counts.length:3)':'k<16';const to=study==='depth4'?'*o.counts.length:4)':'k<32';assert(text.includes(from));writeFileSync(path,text.replace(from,to));
try{
 const candidate:typeof base=await import(path);const games=2000;let wins=0,losses=0,ties=0,steps=0;const start=performance.now();
 for(let seed=seedStart;seed<seedStart+games;seed++){
  const seatCandidate=seed%2;let s=base.init({players:[0,1].map(i=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode:'block'}});
  const rngs=[createRng(seed^0x1234),createRng(seed^0xabcd)];let turns=0;
  while(s.phase.id!=='done'&&turns<20000){const seat=s.turn;const core=seat===seatCandidate?candidate:base;const input=core.game.bot.sampleInput(s,s.seats[seat]!,rngs[seat]!,'sharp');assert(input);s=base.reduce(s,{type:'input',playerId:s.seats[seat]!,input,now:turns++*100});}
  assert.equal(s.phase.id,'done');const ids=base.results(s)!.winnerIds;if(ids.length>1)ties++;else if(ids[0]===`p${seatCandidate}`)wins++;else losses++;steps+=turns;if(seed%100===0)console.log({study,seed,wins,losses,ties});
 }
 const rate=wins/games,se=Math.sqrt(rate*(1-rate)/games);const report={study,games,wins,losses,ties,winRate:rate,confidence95:[rate-1.96*se,rate+1.96*se],steps,seedRange:[seedStart,seedStart+games-1],mode:'two-seat Block; candidate versus shipped sharp; alternating seats'};writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(report,'seconds',Math.round((performance.now()-start)/1000));
}finally{unlinkSync(path);}
