import {writeFileSync,readFileSync} from 'node:fs';
import {game,manifest} from '../src/index';
import {createRng} from '../../../contract/rng';
import type {State,Input} from '../src/model';
import type {GameEvent} from '../../../contract/contract';
const root=new URL('../',import.meta.url);
writeFileSync(new URL('manifest.json',root),JSON.stringify(manifest,null,2)+'\n');
let s=game.init({players:Array.from({length:3},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:`face${i+1}`,connected:true,bot:true})),settings:{rounds:1,roundSeconds:30},seed:42,now:1000});
const rngs=s.order.map((_,i)=>createRng(42+i));const saved=new Set<string>();
for(let step=0;step<300;step++){
  if(!saved.has(s.phase.id)){writeFileSync(new URL(`fixtures/${s.phase.id}.json`,root),JSON.stringify(s,null,2)+'\n');saved.add(s.phase.id);}
  if(s.phase.id==='done')break;
  let event:GameEvent<Input>|null=null;
  for(let i=0;i<s.order.length;i++){
    const input=game.bot.sampleInput(s,s.order[i],rngs[i],(['easy','normal','sharp'] as const)[i]);
    if(input){event={type:'input',now:s.phase.startedAt+10,playerId:s.order[i],input};break;}
  }
  if(event===null)event={type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt};
  s=game.reduce(JSON.parse(JSON.stringify(s)),event);
}
if(saved.size!==game.phases.length)throw new Error('Missing fixtures');
console.log(`Generated manifest and ${saved.size} actual-core fixtures.`);
