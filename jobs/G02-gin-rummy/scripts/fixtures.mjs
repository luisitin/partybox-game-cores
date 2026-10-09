import {writeFile,mkdir} from 'node:fs/promises';
import {game} from '../dist/core.mjs';
import {initial,rng} from '../tests/helpers.mjs';
await mkdir('fixtures',{recursive:true});
await writeFile('manifest.json',JSON.stringify(game.manifest,null,2)+'\n');
const missing=new Set(game.phases),random=rng(9022);
for(let seed=1;seed<=100&&missing.size;seed++){
 let s=initial(seed),now=0;
 for(let i=0;i<20000;i++){
  if(missing.has(s.phase.id)){await writeFile(`fixtures/${s.phase.id}.json`,JSON.stringify(s,null,2)+'\n');missing.delete(s.phase.id);}
  if(s.finished)break;
  const input=game.bot.sampleInput(s,s.turn,random,'sharp');
  s=game.reduce(s,{type:'input',playerId:s.turn,input,now:++now});
 }
}
if(missing.size)throw new Error('Missing phases: '+[...missing]);
console.log('Regenerated manifest and every phase fixture from deterministic bot play.');
