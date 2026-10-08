import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createRng} from '../../contract/rng.ts';
import {init,game,reduce,observe,results,type Input} from './core.ts';
const python=spawn('python',['-u','baseline.py'],{env:{...process.env,PYTHONPATH:process.env.BASELINE_PYTHONPATH??'/workspace/.baseline-libs'},stdio:['pipe','pipe','inherit']});
const lines=createInterface({input:python.stdout});let resolveReply:((i:Input)=>void)|null=null;
lines.on('line',line=>{assert(resolveReply);const resolve=resolveReply;resolveReply=null;resolve(JSON.parse(line));});
const ask=(observation:ReturnType<typeof observe>,seed:number):Promise<Input>=>new Promise(resolve=>{assert(!resolveReply);resolveReply=resolve;python.stdin.write(JSON.stringify({observation,seed})+'\n');});
let wins=0,losses=0,ties=0,steps=0;const games=Number(process.env.BASELINE_GAMES??200);
try {
 for(let seed=1;seed<=games;seed++){
  const ourTeam=seed%2;let s=init({players:Array.from({length:4},(_,i)=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true,bot:true})),settings:{mode:'block',partners:true,teamPoints:'all'},seed:seed+20000,now:0});const rng=createRng(seed^0xFEED);let step=0;
  while(s.phase.id!=='done'&&step<20000){
   const seat=s.turn;const input=seat%2===ourTeam||s.phase.id!=='play'?game.bot.sampleInput(s,s.seats[seat]!,rng,'sharp')!:await ask(observe(s,s.seats[seat]!),seed*100000+step);
   assert(game.inputSchema.safeParse(input).success);const previous=s;s=reduce(s,{type:'input',playerId:s.seats[seat]!,input,now:step++*100});assert.notEqual(s,previous);
  }
  assert.equal(s.phase.id,'done');const winning=results(s)!.winnerIds;if(winning.length>2)ties++;else if(s.seats.indexOf(winning[0]!)%2===ourTeam)wins++;else losses++;steps+=step;
  if(seed%10===0)console.log(`${seed}/${games}: strong ${wins}, baseline ${losses}, ties ${ties}`);
 }
 const rate=wins/games,se=Math.sqrt(rate*(1-rate)/games);
 const report={package:'dominoes',version:'6.1.0',games,wins,losses,ties,winRate:rate,confidence95:[rate-1.96*se,rate+1.96*se],steps,baseline:'bota_gorda before <=9 remaining tiles; probabilistic_alphabeta(sample_size=16) thereafter',scope:'four-seat partnership Block, all-remaining scoring; alternate teams; no private opposing hand supplied'};
 writeFileSync('baseline-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
 // Bounded parity check, not a claim to beat every unlimited-budget AI.
 assert(report.confidence95[1]!>=0.5,'strong policy is demonstrably weaker than this measured reference');
} finally {python.stdin.end();python.kill();lines.close();}
