import {performance} from 'node:perf_hooks';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {optimalDefense} from '../dist/cards.mjs';
import {rng} from '../tests/helpers.mjs';
const hardTargets=[[2,3,4],[15,16,17],[29,30,31]];
const cases=[{hand:[0,1,5,6,13,14,18,19,28,32],targets:hardTargets},
 {hand:[0,1,5,6,13,14,18,19,38,32],targets:hardTargets}];
const r=rng(816777);
for(let i=0;i<2000;i++){
 const suit=r.int(0,3),start=r.int(0,8),setRank=r.int(0,12);
 const targets=[[suit*13+start,suit*13+start+1,suit*13+start+2],
  [0,1,2,3].filter(s=>s!==suit).map(s=>s*13+setRank)];
 if(i%2===0){const secondSuit=(suit+1)%4,starts=Array.from({length:11},(_,i)=>i).filter(x=>setRank<x||setRank>x+2),secondStart=r.pick(starts);
  targets.push([secondSuit*13+secondStart,secondSuit*13+secondStart+1,secondSuit*13+secondStart+2]);}
 const used=targets.flat(),hand=r.shuffle(Array.from({length:52},(_,i)=>i).filter(c=>!used.includes(c))).slice(0,10);cases.push({hand,targets});
}
const rows=[],solutions=[];const start=performance.now();
for(const {hand,targets}of cases){const at=performance.now(),solution=optimalDefense(hand,targets,true);solutions.push(solution);rows.push({hand,targets,elapsedMs:performance.now()-at,deadwood:solution.deadwood});}
const report={cases:cases.length,cardsSha256:createHash('sha256').update(await readFile('src/cards.ts')).digest('hex'),
 solutionSha256:createHash('sha256').update(JSON.stringify(solutions)).digest('hex'),wallMs:performance.now()-start,rows};
await writeFile('.work/layoff-profile.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,rows:undefined,hardCases:rows.slice(0,2)}));
