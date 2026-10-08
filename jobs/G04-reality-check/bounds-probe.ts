import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {game,validAnswer,type State} from './core.ts';
import {fromView} from './bots.ts';
import {sampleRows} from './samples.ts';
import {createRng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
let s=game.init({players:[0,1].map(i=>({id:'p'+i,name:'Player '+i,avatarId:'🙂',connected:true})),seed:1,now:0,settings:{mode:'quick'}});
while(s.phase.id!=='answer')s=game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});
const cases=[{kind:'number',min:1e-200,max:1e-180,correct:1e-190,prompt:'Estimate within the shown bounds.'},{kind:'number',min:Number.MIN_VALUE,max:1e-310,correct:1e-317,prompt:'Estimate within the shown bounds.'},{kind:'century',min:-1,max:0,correct:-1,prompt:'Label: 9 BCE'}];
const results=[];
for(const c of cases)for(const skill of ['easy','normal','sharp'] as BotSkill[]){
 const row={...sampleRows.find(r=>r.kind===c.kind)!,...c} as State['question'];let invalid=0;
 for(let seed=1;seed<=1000;seed++){
  const v=game.controllerView({...s,question:row},'p0');const action=fromView(v,createRng(seed),skill);
  if(action?.type!=='answer'||!validAnswer(row,action.value))invalid++;
 }
 results.push({kind:c.kind,min:c.min,max:c.max,skill,actions:1000,invalid});
}
const report={actions:9000,invalid:results.reduce((sum,r)=>sum+r.invalid,0),results};
writeFileSync('bounds-report.json',JSON.stringify(report,null,2)+'\n');assert.equal(report.invalid,0);console.log(report);
