import {writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {start,finish,game} from '../tests/helpers.mjs';
export function wilson(wins,total){const z=1.95996398454,p=wins/total,d=1+z*z/total,m=(p+z*z/(2*total))/d,h=z*Math.sqrt(p*(1-p)/total+z*z/(4*total*total))/d;return[m-h,m+h];}
export function runLeagues(){
 const rows=[];
 for(const [strong,weak,seedStart]of[['sharp','normal',10000],['normal','easy',20000]]){
  const games=2000;let wins=0,ties=0,first=0,focalTotal=0,rivalTotal=0,steps=0;const digest=createHash('sha256');
  for(let k=0;k<games;k++){
   const s=start(seedStart+k,4);const focal=s.order[k%4],rival=s.order[(k+1)%4];
   const skills=Object.fromEntries(s.order.map(id=>[id,id===focal?strong:weak]));const done=finish(s,skills);const r=game.results(done.state);
   steps+=done.steps;focalTotal+=r.scores[focal];rivalTotal+=r.scores[rival];digest.update(JSON.stringify(done.state)+'\n');
   if(r.scores[focal]<r.scores[rival])wins++;else if(r.scores[focal]===r.scores[rival])ties++;
   if(r.winnerIds.includes(focal))first+=1/r.winnerIds.length;
  }
  rows.push({league:`${strong} vs ${weak}`,games,seedStart,seedEnd:seedStart+games-1,players:4,target:100,moon:'add',jack:false,wins,ties,headToHeadRate:wins/games,wilson95:wilson(wins,games),firstPlaceShare:first/games,focalMean:focalTotal/games,rivalMean:rivalTotal/games,steps,stateHash:digest.digest('hex')});
 }
 return {schemaVersion:1,method:'One focal stronger bot vs three weaker bots; focal seat cycles0–3; designated rival is the next seat; tied first places split credit. Full100-point matches with held-out seeds distinct from pilot0–199.',leagues:rows};
}
if(process.argv[1]?.endsWith('scripts/leagues.mjs')){const results=runLeagues();writeFileSync('data/bot-leagues.json',JSON.stringify(results,null,2)+'\n');for(const r of results.leagues)console.log(JSON.stringify(r));}
