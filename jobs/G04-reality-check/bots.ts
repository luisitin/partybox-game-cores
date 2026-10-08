import type {Rng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
import type {PhoneView,Input,QuestionView} from './core.ts';
import {plants,harbours,materials,machines,defects} from './samples.ts';
function dateAnswer(q:QuestionView):number{
 const year=Number(q.prompt.match(/\b\d{3,4}\b/)?.[0]??2000);
 return q.kind==='decade'?Math.floor(year/10)*10:(q.prompt.includes('BCE')?-1:1)*Math.ceil(year/100);
}
function bluff(q:QuestionView,rng:Rng,skill:BotSkill):string{
 if(skill==='easy')return rng.pick(['A dancing spoon','A bucket of moonlight','The very surprising answer','A lost purple umbrella']);
 if(skill==='normal')return q.realm==='real-town-or-fake'?`Old ${rng.pick(plants)} Village`:q.realm==='patent-pending'?`The automatic ${rng.pick(machines)}`:`The ${rng.pick(materials).toLowerCase()} handle came loose`;
 return q.realm==='real-town-or-fake'?`${rng.pick(plants)} ${rng.pick(harbours)}`:q.realm==='patent-pending'?`${rng.pick(materials)} ${rng.pick(machines)}`:`${rng.pick(materials).toLowerCase()} ${rng.pick(defects)}`;
}
function plausibility(q:QuestionView,text:string):number{
 const words=text.toLowerCase().split(/\s+/),first=words[0]??'',second=words[1]??'';
 const a=q.realm==='real-town-or-fake'?plants:materials,b=q.realm==='real-town-or-fake'?harbours:q.realm==='patent-pending'?machines:defects;
 return (words.length===2?2:0)+(a.some(w=>w.toLowerCase()===first)?2:0)+(b.some(w=>w.toLowerCase()===second)?2:0);
}
/** No State argument: own controller and public reveal history are the boundary. */
export function fromView(v:PhoneView,rng:Rng,skill:BotSkill='normal'):Input|null{
 if(!v.inputType)return null;if(v.inputType==='next')return {type:'next'};
 const q=v.question;if(!q)return null;
 if(v.inputType==='write')return {type:'write',text:bluff(q,rng,skill)};
 if(v.inputType==='vote'){
  const choices=v.menu.filter(o=>!o.mine);if(!choices.length)return null;
  if(skill==='easy')return {type:'vote',choice:rng.pick(choices).id};
  const scored=choices.map(o=>({o,score:skill==='sharp'?plausibility(q,o.text):o.text.trim().split(/\s+/).length===2?1:0}));
  const best=Math.max(...scored.map(o=>o.score));return {type:'vote',choice:rng.pick(scored.filter(o=>o.score===best)).o.id};
 }
 let value:number;
 if(q.kind==='choice'){
  const counts=[...q.prompt.matchAll(/\((\d+)(?: shares)?\)/g)].map(m=>Number(m[1]));
  const best=counts.length===2&&counts[0]!>=counts[1]!?0:1;
  value=skill==='easy'?rng.int(0,1):skill==='normal'&&rng.chance(.3)?1-best:best;
 }else if(q.kind==='number'){
  const min=q.min!,max=q.max!;
  value=skill==='easy'?min+rng.float()*(max-min):skill==='normal'?(min+max)/2:min>0?Math.sqrt(min*max):max/10;
 }else {
  const min=q.min!,max=q.max!,step=q.kind==='decade'?10:1;
  value=skill==='easy'?rng.int(min/step,max/step)*step:dateAnswer(q);
  if(skill==='normal'&&rng.chance(.3))value+=rng.pick([-1,1])*step;
  value=Math.max(min,Math.min(max,value));if(q.kind==='century'&&value===0)value=1;
 }
 return {type:'answer',value};
}
