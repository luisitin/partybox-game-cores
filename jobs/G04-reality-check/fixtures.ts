import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createRng} from '../../contract/rng.ts';
import {game,init,reduce,manifest} from './core.ts';
mkdirSync('fixtures',{recursive:true});
let s=init({players:[0,1,2].map(i=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true,bot:true})),seed:1,now:0,settings:{}});
const saved=new Set<string>();let steps=0;
while(steps<3000){
 if(!saved.has(s.phase.id)){writeFileSync(`fixtures/${s.phase.id}.json`,JSON.stringify(s,null,2)+'\n');saved.add(s.phase.id);}
 if(s.phase.id==='done')break;
 const id=s.seats.find(id=>game.bot.sampleInput(s,id,createRng(steps+1),'normal'));
 if(id)s=reduce(s,{type:'input',playerId:id,input:game.bot.sampleInput(s,id,createRng(steps+1),'normal')!,now:s.phase.startedAt+1});
 else s=reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});steps++;
}
assert.equal(s.phase.id,'done');assert.deepEqual([...saved].sort(),[...game.phases].sort());
writeFileSync('manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('All seven phase fixtures and final scores generated');
