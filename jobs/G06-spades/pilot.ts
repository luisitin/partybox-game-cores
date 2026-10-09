import {performance} from 'node:perf_hooks';
import {createRng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
import {simulate} from './runner.ts';
import {results} from './core.ts';
const start=performance.now();
for(const n of [3,4])for(const [a,b] of [['sharp','normal'],['normal','easy']] as [BotSkill,BotSkill][]){
 let wins=0,pairWins=0,ties=0,hands=0,steps=0;const games=100;
 for(let seed=1;seed<=games;seed++){
  const first=seed%(n===4?2:3),lower=n===4?1-first:(first+1)%3;
  const skills:BotSkill[]=n===4?Array.from({length:4},(_,i)=>i%2===first?a:b):Array.from({length:3},(_,i)=>i===first?a:i===lower?b:'easy');
  const run=simulate(n,seed,{skills}),r=results(run.state)!;
  if(r.winnerIds.includes(`p${first}`))wins++;if(r.scores[`p${first}`]!>r.scores[`p${lower}`]!)pairWins++;else if(r.scores[`p${first}`]===r.scores[`p${lower}`])ties++;
  hands+=run.state.handNumber;steps+=run.steps;
 }
 console.log({n,a,b,games,wins,pairWins,ties,averageHands:hands/games,steps});
}
console.log({durationMs:performance.now()-start});
