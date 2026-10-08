import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const build = process.env.G05_BUILD_DIR ?? '.build';
const mod = name => import(pathToFileURL(resolve(build, 'jobs/G05-hearts/src', name + '.js')).href);
export const { game, init, reduce, tvView, controllerView, results } = await mod('core');
export const { stateSchema } = await mod('schema');
export const rules = await mod('rules');
export const reference = await mod('reference');
export const { createRng } = await import(pathToFileURL(resolve(build,'contract/rng.js')).href);
export function players(count) { return Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'face-1',connected:true,bot:true})); }
export const start=(seed=1,count=4,settings={})=>game.init({players:players(count),settings,seed,now:1000});
export function timer(s) { return game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline ?? s.phase.startedAt+1}); }
export function eventFor(s,skill='normal',salt=0) {
 if(s.phase.id==='done')return null;
 if(s.phase.id==='trick'||s.phase.id==='hand')return {type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline};
 const input=game.bot.sampleInput(s,s.actor,createRng((s.rng.seed ^ Math.imul(s.handNumber,65537) ^ Math.imul(s.played.length,31337) ^ salt)>>>0),skill);
 if(!input)throw new Error(`No bot input in ${s.phase.id} for ${s.actor}`);
 return {type:'input',playerId:s.actor,input,now:s.phase.startedAt+1};
}
export function finish(initial,skills={},onStep=null) {
 let state=initial; let steps=0; const events=[];
 while(state.phase.id!=='done'&&steps++<30_000) {
  const event=eventFor(state,skills[state.actor]??'normal',steps);
  const next=game.reduce(state,event);
  if(next===state)throw new Error(`Stuck at ${state.phase.id}: ${JSON.stringify(event)}`);
  if(onStep)onStep(state,event,next); events.push(event);state=next;
 }
 if(state.phase.id!=='done')throw new Error('Game did not finish within 30,000 events');
 return {state,events,steps};
}
export function toPhase(s,phase,limit=30_000) {
 for(let n=0;s.phase.id!==phase&&n<limit;n++){if(s.phase.id==='done')throw new Error(`Cannot reach ${phase}`);s=game.reduce(s,eventFor(s));}
 if(s.phase.id!==phase)throw new Error(`Missing ${phase}`); return s;
}
export function propertySeeds(){const rng=createRng(0x6a09e667);return [1,2,3,...Array.from({length:1000},()=>rng.int(4,0xffffffff))];}
