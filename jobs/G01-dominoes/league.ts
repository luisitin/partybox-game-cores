import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {init,reduce,game,results} from './core.ts';
import type {BotSkill} from '../../contract/constants.ts';
const games=Number(process.env.LEAGUE_GAMES??2000);
const reports=[];
for(const [a,b] of [['sharp','normal'],['normal','easy']] as [BotSkill,BotSkill][]){
 let wins=0,losses=0,ties=0,steps=0;const start=performance.now();
 for(let seed=1;seed<=games;seed++){
  // Swap seats on successive independent deals; no favorable fixed opener.
  const first=seed%2;let s=init({players:[0,1].map(i=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode:process.env.LEAGUE_MODE==='draw'?'draw':'block'}});
  const rngs=[createRng(seed^0x1234),createRng(seed^0xabcd)];let turn=0;
  while(s.phase.id!=='done'&&turn<20000){const seat=s.turn;const skill=seat===first?a:b;const input=game.bot.sampleInput(s,s.seats[seat]!,rngs[seat]!,skill);assert(input);s=reduce(s,{type:'input',playerId:s.seats[seat]!,input,now:turn++*100});}
  assert.equal(s.phase.id,'done');const winners=results(s)!.winnerIds;if(winners.length>1)ties++;else if(winners[0]===`p${first}`)wins++;else losses++;steps+=turn;
  if(seed%100===0)console.log(`${a}/${b}: ${seed}/${games}; ${wins} wins, ${losses} losses, ${ties} ties`);
 }
 const rate=wins/games;const se=Math.sqrt(rate*(1-rate)/games);
 const report={a,b,games,wins,losses,ties,winRate:rate,confidence95:[rate-1.96*se,rate+1.96*se],steps};reports.push(report);console.log(report,'seconds',Math.round((performance.now()-start)/1000));
}
writeFileSync(process.env.LEAGUE_MODE==='draw'?'draw-league-report.json':'league-report.json',JSON.stringify(reports,null,2)+'\n');
// A clear win: the lower 95% bound is above chance, rather than a point estimate.
if(games>=2000)for(const r of reports)assert(r.confidence95[0]!>0.5,`${r.a} does not clearly beat ${r.b}`);
