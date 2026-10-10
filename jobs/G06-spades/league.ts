import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import type {BotSkill} from '../../contract/constants.ts';
import {simulate} from './runner.ts';
import {results} from './core.ts';
const start=Number(process.argv.find(v=>v.startsWith('--start='))?.slice(8)??1);assert(Number.isSafeInteger(start)&&start>0);
const filename=start===1?'bot-results.json':`bot-results-${start}.json`,games=2000;
const lower=(wins:number)=>{const p=wins/games,z=1.96;return (p+z*z/(2*games)-z*Math.sqrt(p*(1-p)/games+z*z/(4*games*games)))/(1+z*z/games);};
const records=[];const totalStart=performance.now();
for(const n of [3,4])for(const [higher,lowerSkill] of [['sharp','normal'],['normal','easy']] as [BotSkill,BotSkill][]){
 let wins=0,pairWins=0,ties=0,hands=0,steps=0,maxHands=0,maxStateBytes=0;const clock=performance.now();
 for(let seed=start;seed<start+games;seed++){
  const first=seed%(n===4?2:3),opponent=n===4?1-first:(first+1)%3;
  const skills:BotSkill[]=n===4?Array.from({length:4},(_,i)=>i%2===first?higher:lowerSkill):Array.from({length:3},(_,i)=>i===first?higher:i===opponent?lowerSkill:'easy');
  const run=simulate(n,seed,{skills}),r=results(run.state)!;
  if(r.winnerIds.includes(`p${first}`))wins++;if(r.scores[`p${first}`]!>r.scores[`p${opponent}`]!)pairWins++;else if(r.scores[`p${first}`]===r.scores[`p${opponent}`])ties++;
  hands+=run.state.handNumber;steps+=run.steps;maxHands=Math.max(maxHands,run.state.handNumber);maxStateBytes=Math.max(maxStateBytes,Buffer.byteLength(JSON.stringify(run.state)));
 }
 const record={players:n,higher,lower:lowerSkill,games,seedFirst:start,seedLast:start+games-1,wins,winRate:wins/games,wilson95Lower:lower(wins),pairWins,pairWinRate:pairWins/games,pairWilson95Lower:lower(pairWins),ties,averageHands:hands/games,maxHands,steps,maxStateBytes};
 assert(record.wilson95Lower>.5&&record.pairWilson95Lower>.5,JSON.stringify(record));records.push(record);console.log({...record,durationMs:performance.now()-clock});
}
const report={gamesPerComparison:2000,totalGames:8000,cutthroatThirdSeat:'easy',seatRotation:'each seed rotates higher/lower seats; partnership teams alternate opposite parity',tieTreatment:'strict pair wins only; ties count as losses for confidence bounds',records};
if(process.argv.includes('--write'))writeFileSync(filename,JSON.stringify(report,null,2)+'\n');
else assert.deepEqual(report,JSON.parse(readFileSync(filename,'utf8')));
console.log(`8000 full 500-point/mercy matches complete in ${performance.now()-totalStart} ms; all four 95% lower bounds exceed 50%`);
