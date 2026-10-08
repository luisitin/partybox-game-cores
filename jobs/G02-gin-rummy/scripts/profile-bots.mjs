import {performance} from 'node:perf_hooks';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
import {initial,rng} from '../tests/helpers.mjs';
const states=[];
for(let seed=1;seed<=1000;seed++){
 let s=initial(seed),now=0;
 for(const input of [{type:'pass'},{type:'pass'},{type:'draw',source:'stock'}])
  s=game.reduce(s,{type:'input',playerId:s.turn,input,now:++now});
 states.push(s);
}
const rows=[];
for(const skill of ['normal','sharp']){
 const outputs=[],samples=[];const cpuStart=process.cpuUsage(),start=performance.now();
 for(let i=0;i<states.length;i++){
  const at=performance.now();const input=game.bot.sampleInput(states[i],states[i].turn,rng(i+10),skill);
  samples.push(performance.now()-at);outputs.push(input);
 }
 const wallMs=performance.now()-start,cpu=process.cpuUsage(cpuStart),sort=[...samples].sort((a,b)=>a-b);
 rows.push({skill,cases:states.length,wallMs,cpuMs:(cpu.user+cpu.system)/1000,meanMs:wallMs/states.length,
  p50Ms:sort[500],p99Ms:sort[990],maxMs:sort.at(-1),samplesMs:samples,
  decisionSha256:createHash('sha256').update(JSON.stringify(outputs)).digest('hex')});
 console.log(JSON.stringify({...rows.at(-1),samplesMs:undefined}));
}
const hashes={};for(const p of ['src/core.ts','src/cards.ts'])hashes[p]=createHash('sha256').update(await readFile(p)).digest('hex');
await mkdir('.work',{recursive:true});await writeFile('.work/bot-profile.json',JSON.stringify({sourceSha256:hashes,states:1000,rows},null,2)+'\n');
