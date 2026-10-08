import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {game} from './core.ts';
import {fromView} from './bots.ts';
import {createRng} from '../../contract/rng.ts';
import {sampleRows} from './samples.ts';
let s=game.init({players:[0,1].map(i=>({id:'p'+i,name:'Player '+i,avatarId:'🙂',connected:true})),seed:1,now:0,settings:{mode:'bluff'}});
while(s.phase.id!=='write')s=game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});
const results=[];
for(const realm of ['real-town-or-fake','patent-pending','do-not-use']){
 let twoWords=0,invalid=0;
 for(let seed=1;seed<=100;seed++){
  const row=sampleRows.find(r=>r.realm===realm)!,v=game.controllerView({...s,question:row},'p0'),action=fromView(v,createRng(seed),'normal');
  if(action?.type==='write'&&action.text.trim().split(/\s+/).length===2)twoWords++;
  if(!game.inputSchema.safeParse(action).success)invalid++;
 }
 results.push({realm,samples:100,twoWords,invalid});
}
const report={samples:300,twoWords:results.reduce((sum,r)=>sum+r.twoWords,0),invalid:results.reduce((sum,r)=>sum+r.invalid,0),results};
writeFileSync('style-report.json',JSON.stringify(report,null,2)+'\n');assert.equal(report.twoWords,300);assert.equal(report.invalid,0);console.log(report);
