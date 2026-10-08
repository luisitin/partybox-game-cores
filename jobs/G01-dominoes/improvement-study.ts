// Current-version strategy experiments. No production source is edited.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {spawnSync} from 'node:child_process';
import {createRng} from '../../contract/rng.ts';
import * as base from './study-current-baseline.ts';

const study=process.env.IMPROVEMENT_STUDY??'depth4';
assert(['depth4','leaf-count','exact10','draw-depth'].includes(study));
const seedStart=Number(process.env.IMPROVEMENT_SEED_START??1);
assert(Number.isSafeInteger(seedStart)&&seedStart>0);
const original=readFileSync('study-current-baseline.ts','utf8');
const sourceSha256=createHash('sha256').update(original).digest('hex');
assert.equal(readFileSync('core.ts','utf8'),original,'refresh the frozen baseline after a production change');
const substitutions:Record<string,[string,string]>={
 depth4:['*o.counts.length:3)','*o.counts.length:4)'],
 'leaf-count':[
  'if(depth<=0){const mine=p.hands.reduce',
  'if(depth<=0){const count=p.hands.reduce((n,h,i)=>n+(allied(i)?-h.length:h.length/(p.partners?1:p.hands.length-1)),0);const mine=p.hands.reduce'
 ],
 exact10:['total+(stock?.length??0)<=9?','total+(stock?.length??0)<=10?'],
 'draw-depth':['return solve(next,root,depth-1,alpha,beta);','return solve(next,root,depth,alpha,beta);']
};
const [from,to]=substitutions[study]!;
assert.equal(original.split(from).length,2,'candidate must change exactly one occurrence');
let source=original.replace(from,to);
if(study==='leaf-count'){
 const leaf='return other/(p.partners?1:p.hands.length-1)-mine;';
 assert.equal(source.split(leaf).length,2);
 source=source.replace(leaf,'return other/(p.partners?1:p.hands.length-1)-mine+5*count;');
}
const shardGames=Number(process.env.IMPROVEMENT_SHARD_GAMES??2000);
assert(Number.isSafeInteger(shardGames)&&shardGames>0&&shardGames<=2000);
const path=`./mutant-current-${study}-${seedStart}-study.ts`;
writeFileSync(path,source);
try{
 const focused=spawnSync(process.execPath,['--test','--test-name-pattern=hidden opponent|sample policies|Draw lookahead|search reward|match goal|partner target|tile-level|public opener|inactive observation|untouched-stock','test.ts'],{
  encoding:'utf8',env:{...process.env,FAST_TEST:'1',CORE_PATH:path}
 });
 process.stdout.write(focused.stdout);process.stderr.write(focused.stderr);
 assert.equal(focused.status,0,'candidate failed privacy, determinism or search-rule regressions');
 const candidate:typeof base=await import(path);
 const games=shardGames,mode=study==='draw-depth'?'draw':'block';let wins=0,losses=0,ties=0,steps=0;
 const start=performance.now();
 for(let seed=seedStart;seed<seedStart+games;seed++){
  const seatCandidate=seed%2;
  let s=base.init({players:[0,1].map(i=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode}});
  const rngs=[createRng(seed^0x1234),createRng(seed^0xabcd)];let turns=0;
  while(s.phase.id!=='done'&&turns<20000){
   const seat=s.turn,policy=seat===seatCandidate?candidate:base;
   const input=policy.game.bot.sampleInput(s,s.seats[seat]!,rngs[seat]!,'sharp');
   assert(input);assert(base.inputSchema.safeParse(input).success);
   s=base.reduce(s,{type:'input',playerId:s.seats[seat]!,input,now:turns++*100});
  }
  assert.equal(s.phase.id,'done');
  const winners=base.results(s)!.winnerIds;
  if(winners.length>1)ties++;else if(winners[0]===`p${seatCandidate}`)wins++;else losses++;
  steps+=turns;if((seed-seedStart+1)%100===0)console.log({study,seed,wins,losses,ties});
 }
 const rate=wins/games,se=Math.sqrt(rate*(1-rate)/games);
 const report={study,sourceSha256,productionVersion:base.manifest.version,games,wins,losses,ties,winRate:rate,confidence95:[rate-1.96*se,rate+1.96*se],steps,seedRange:[seedStart,seedStart+games-1],mode:`two-seat ${mode}; candidate versus current sharp; alternating seats`,candidateRegressions:'passed',seconds:Math.round((performance.now()-start)/1000)};
 const reportPath=process.env.IMPROVEMENT_OUTPUT??`improvement-${study}${seedStart===1?'':'-confirmation'}-report.json`;
 writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{unlinkSync(path);}
