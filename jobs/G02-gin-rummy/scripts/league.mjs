import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {play} from '../tests/helpers.mjs';
const games=Number(process.argv[2]||2000),rows=[];
for(const [stronger,weaker]of [['sharp','normal'],['normal','easy']]){
 let wins=0,losses=0,ties=0,events=0;
 for(let i=0;i<games;i++){
  const index=i%2,skills=index===0?[stronger,weaker]:[weaker,stronger];
  const run=play(70000+Math.floor(i/2),2,skills);events+=run.steps;
  const winnerIds=run.results.winnerIds;
  if(winnerIds.length>1)ties++;else if(winnerIds.includes('p'+index))wins++;else losses++;
 }
 const winRate=(wins+.5*ties)/games,z=1.96,p=wins/games;
 const wilsonLower=(p+z*z/(2*games)-z*Math.sqrt(p*(1-p)/games+z*z/(4*games*games)))/(1+z*z/games);
 rows.push({stronger,weaker,games,wins,losses,ties,winRate,wilsonLower,events,pairedSeeds:true});
 console.log(JSON.stringify(rows.at(-1)));
 if(games===2000){assert(winRate>=.55,`${stronger} fails clear win advantage`);assert(wilsonLower>.5);}
}
await mkdir('.work',{recursive:true});await writeFile('.work/league-'+games+'.json',JSON.stringify(rows,null,2)+'\n');
if(games===2000)await writeFile('evidence/bot-league.json',JSON.stringify(rows,null,2)+'\n');
