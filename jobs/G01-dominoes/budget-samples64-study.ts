// Isolated search-budget experiments; production source is never edited.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createRng} from '../../contract/rng.ts';
import * as base from './study-samples64-baseline.ts';
const study=process.env.BUDGET_STUDY??'paired';assert(['depth4','paired'].includes(study));
const seedStart=Number(process.env.BUDGET_SEED_START??1);assert(Number.isSafeInteger(seedStart)&&seedStart>0);
const reportPath=`budget-samples64-${study}${seedStart===1?'':'-confirmation'}-report.json`;
const path=`./mutant-samples64-${study}-study.ts`;const text=readFileSync('study-samples64-baseline.ts','utf8');
let source=text;
if(study==='depth4'){
 const from='*o.counts.length:3)';assert(source.includes(from));source=source.replace(from,'*o.counts.length:4)');
}else{
 const from='const sampleHands=handSampler(o,rng);';assert(source.includes(from));
 source=source.replace(from,'const pairing=antithetic(rng);const sampleHands=handSampler(o,pairing.rng);');
 source=source.replace('for(let k=0;k<64;k++){','for(let k=0;k<64;k++){pairing.begin(k);');
 source+=`
function antithetic(original:Rng):{rng:Rng;begin(k:number):void}{
 const record:number[]=[];let mirrored=false,index=0;
 const pair:Rng={
  float(){if(mirrored){if(index>=record.length)throw new Error('paired call count mismatch');return (1-1/4294967296)-record[index++]!;}const u=original.float();record.push(u);return u;},
  int(min,max){const span=Math.max(0,Math.floor(max)-Math.ceil(min)+1);return Math.ceil(min)+Math.floor(this.float()*span);},
  pick<T>(items:readonly T[]):T{if(!items.length)throw new Error('empty paired pick');return items[this.int(0,items.length-1)]!;},
  shuffle<T>(items:readonly T[]):T[]{const out=[...items];for(let i=out.length-1;i>0;i--){const j=this.int(0,i);const v=out[i]!;out[i]=out[j]!;out[j]=v;}return out;},
  chance(p){return this.float()<p;},state(){return original.state();}
 };
 return {rng:pair,begin(k){mirrored=k%2===1;index=0;if(!mirrored)record.length=0;}};
}
`;
}
writeFileSync(path,source);
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
