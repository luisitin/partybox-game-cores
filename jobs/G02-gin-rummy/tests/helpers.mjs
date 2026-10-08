import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
// Contract RNG type without relying on TS execution in CI: independent xorshift test stream.
export function rng(seed=1) {
 let x=seed>>>0||0x12345678,step=0;
 const float=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;step++;return (x>>>0)/4294967296;};
 const r={float,int:(a,b)=>a+Math.floor(float()*(b-a+1)),pick:a=>a[Math.floor(float()*a.length)],chance:p=>float()<p,
 shuffle:a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(float()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;},state:()=>({seed,step})};
 return r;
}
export function initial(seed=1,count=2,settings={}) {
 return game.init({players:Array.from({length:count},(_,i)=>({id:'p'+i,name:'Seat '+i,avatarId:'face'+i,connected:true,bot:true})),seed,now:0,settings:{mode:count===2?'duel':'rotation',...settings}});
}
export function freeze(value) {if(value&&typeof value==='object'){Object.freeze(value);for(const x of Object.values(value))freeze(x);}return value;}
export function invariant(s) {
 const text=JSON.stringify(s);assert(Buffer.byteLength(text)<=256*1024);assert.deepEqual(JSON.parse(text),s);
 const cards=[...s.stock,...s.discard,...Object.values(s.hands).flat()];
 assert.equal(cards.length,52);assert.equal(new Set(cards).size,52);assert(cards.every(c=>Number.isInteger(c)&&c>=0&&c<52));
 assert(s.active.length===2);assert.equal(new Set([...s.active,...s.waiting]).size,s.order.length);
 for(const id of s.order)assert(Number.isFinite(s.scores[id]));
}
export function play(seed,count=2,skills=['sharp','normal'],settings={},check=false,verifyReplay=false) {
 let s=initial(seed,count,settings),r=rng(seed^0x7e123456),steps=0,now=0;
 let replay=verifyReplay?initial(seed,count,settings):null,replayChecks=0;
 if(replay)assert.deepEqual(replay,s);
 while(!s.finished&&steps<40000) {
  const index=s.order.indexOf(s.turn),input=game.bot.sampleInput(s,s.turn,r,skills[index%skills.length]);
  assert(input,`null input ${s.phase.id} ${s.turn}`);assert(game.inputSchema.safeParse(input).success);
  const event={type:'input',now:++now,playerId:s.turn,input};
  const next=game.reduce(s,event);
  assert.notEqual(next,s,`stalled ${s.phase.id} ${JSON.stringify(input)}`);
  if(replay){
   const repeated=game.reduce(replay,structuredClone(event));
   const text=JSON.stringify(next),replayedText=JSON.stringify(repeated);
   assert(Buffer.byteLength(text)<=256*1024);
   const hash=value=>createHash('sha256').update(value).digest('hex');
   assert.equal(hash(replayedText),hash(text),`replay hash seed ${seed} event ${steps+1}`);
   assert.equal(replayedText,text,`replay bytes seed ${seed} event ${steps+1}`);
   // The second reducer resumes from serialized state at EVERY transition.
   replay=JSON.parse(replayedText);assert.deepEqual(replay,next);replayChecks++;
  }
  if(check)invariant(next);s=next;steps++;
 }
 assert(s.finished,'bot match exceeded 40000 events');
 const results=game.results(s);assert(results);assert.deepEqual(Object.keys(results.scores).sort(),s.order.slice().sort());
 assert(results.ranking.every(x=>Number.isFinite(x.score)));return {state:s,results,steps,replayChecks};
}
