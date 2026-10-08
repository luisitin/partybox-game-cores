import {start,finish,game} from '../tests/helpers.mjs';
const games=Number(process.argv[2]??100);const seedBase=Number(process.argv[3]??0);
for(const [strong,weak]of[['sharp','normal'],['normal','easy']]){
 const stats={league:`${strong} vs ${weak}`,games,wins:0,ties:0,soleWins:0,score:0,rivalScore:0,steps:0,elapsedMs:0};const at=performance.now();
 for(let k=0;k<games;k++){
  const seed=seedBase+k;const n=4;const s=start(seed,n);const focal=s.order[k%n];const rival=s.order[(k+1)%n];
  const skills=Object.fromEntries(s.order.map(id=>[id,id===focal?strong:weak]));
  const done=finish(s,skills);const r=game.results(done.state);stats.steps+=done.steps;stats.score+=r.scores[focal];stats.rivalScore+=r.scores[rival];
  if(r.scores[focal]<r.scores[rival])stats.wins++;else if(r.scores[focal]===r.scores[rival])stats.ties++;
  if(r.winnerIds.includes(focal))stats.soleWins+=1/r.winnerIds.length;
 }
 stats.elapsedMs=Math.round(performance.now()-at);stats.winRate=stats.wins/games;stats.rankFirstRate=stats.soleWins/games;stats.score/=games;stats.rivalScore/=games;console.log(JSON.stringify(stats));
}
