import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {init,reduce,game} from './core.ts';
let cases=0,maximum=0;
for(const n of [2,3,4])for(const mode of ['draw','block'])for(const target of ['100','150','250'])for(const deal of mode==='draw'?['block-sized','traditional']:['block-sized'])for(let seed=1;seed<=1000;seed++){
 let s=init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:'P',avatarId:'🙂',connected:true})),settings:{mode,target,deal,partners:n===4&&deal==='block-sized'},seed,now:0});let steps=0;
 while(s.phase.id!=='done'&&steps++<20000)s=reduce(s,{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});
 assert.equal(s.phase.id,'done');assert(s.phase.startedAt<=game.manifest.estimatedMinutes*3*60000,JSON.stringify({n,mode,target,deal,seed,ms:s.phase.startedAt}));maximum=Math.max(maximum,s.phase.startedAt);cases++;
}
writeFileSync('idle-report.json',JSON.stringify({cases,maximumMs:maximum,budgetMs:game.manifest.estimatedMinutes*3*60000,passed:true},null,2)+'\n');console.log({cases,maximum});
