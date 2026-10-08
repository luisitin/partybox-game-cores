import assert from 'node:assert/strict';
import {createRng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
import {game,init,reduce,results,type State,type Input} from './core.ts';
export const context=(n=4,seed=1,settings:Record<string,string|boolean|number>={})=>({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode:n===3?'cutthroat':'partnership',...settings}});
export function nextAction(s:State,rngs:ReturnType<typeof createRng>[],skills:readonly BotSkill[]):{playerId:string;input:Input}|null{
 for(let i=0;i<s.seats.length;i++){const input=game.bot.sampleInput(s,s.seats[i]!,rngs[i]!,skills[i]!);if(input)return {playerId:s.seats[i]!,input};}return null;
}
export function conservation(s:State):void{
 const completed=s.completed.flatMap(t=>t.cards.map(p=>p.card));
 const cards=[...Object.values(s.hands).flat(),...completed,...s.trick.map(p=>p.card).filter(c=>!completed.includes(c)),...(s.stock===null?[]:[s.stock])];
 const count=s.seats.length===3&&s.settings.cutDeck==='low-club'?51:52;
 assert.equal(cards.length,count);assert.equal(new Set(cards).size,count);assert(cards.every(c=>Number.isInteger(c)&&c>=0&&c<52));
 assert.equal(Object.values(s.won).reduce((n,v)=>n+v,0),s.completed.length);
 assert(s.history.length<=4);assert(s.bags.every(n=>Number.isInteger(n)&&n>=0&&n<10));
}
export function simulate(n:number,seed:number,{skills=Array.from({length:n},(_,i)=>(['sharp','normal','easy'] as const)[i%3]!),settings={},replay=false,check=false}:{skills?:readonly BotSkill[];settings?:Record<string,string|boolean|number>;replay?:boolean;check?:boolean}={}):{state:State;steps:number}{
 let s=init(context(n,seed,settings)),other=replay?init(context(n,seed,settings)):null;
 const rngs=s.seats.map((_,i)=>createRng(seed^Math.imul(i+13,0x9e3779b1)));let steps=0;
 while(s.phase.id!=='done'&&steps++<100000){
  const sampled=nextAction(s,rngs,skills);assert(sampled,`no action in ${s.phase.id}`);if(check)assert(game.inputSchema.safeParse(sampled.input).success);
  const event={type:'input' as const,...sampled,now:s.phase.startedAt+1},before=s;s=reduce(s,event);assert.notEqual(s,before,'legal bot must progress');
  if(other){other=reduce(other,event);assert.equal(JSON.stringify(s),JSON.stringify(other));}
  if(check)conservation(s);
 }
 assert.equal(s.phase.id,'done',`seed ${seed} ${n} failed completion`);const result=results(s)!;
 assert.deepEqual(Object.keys(result.scores),s.seats);assert.equal(result.ranking.length,n);assert(Object.values(result.scores).every(Number.isFinite));
 assert(Buffer.byteLength(JSON.stringify(s))<=256*1024);return {state:s,steps};
}
