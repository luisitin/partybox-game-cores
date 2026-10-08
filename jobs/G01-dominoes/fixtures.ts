import {writeFileSync,mkdirSync} from 'node:fs';
import {init,reduce,game,manifest} from './core.ts';
import {createRng} from '../../contract/rng.ts';
const ctx={players:Array.from({length:4},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),settings:{partners:true},seed:1,now:0};
mkdirSync('fixtures',{recursive:true});writeFileSync('manifest.json',JSON.stringify(manifest,null,2)+'\n');
let s=init(ctx);writeFileSync('fixtures/play.json',JSON.stringify(s,null,2)+'\n');const rng=createRng(999);let steps=0,ended=false;
while(s.phase.id!=='done'&&steps++<20000){s=reduce(s,{type:'input',playerId:s.seats[s.turn]!,input:game.bot.sampleInput(s,s.seats[s.turn]!,rng)!,now:steps*100});if(s.phase.id==='round-end'&&!ended){writeFileSync('fixtures/round-end.json',JSON.stringify(s,null,2)+'\n');ended=true;}}
if(s.phase.id!=='done'||!ended)throw new Error('fixture generation failed');writeFileSync('fixtures/done.json',JSON.stringify(s,null,2)+'\n');
