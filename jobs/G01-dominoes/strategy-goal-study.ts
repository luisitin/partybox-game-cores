// Reproducible KEEP GOING experiment; candidate never replaces shipped rules.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import * as base from './study-goal-baseline.ts';
const path='./mutant-goal-selfish-study.ts';
const maxn=`
function selfish(p:Position,depth:number):number[]{
 const terminal=utility(p,0);
 if(terminal!==null)return p.hands.map((_,i)=>utility(p,i)!);
 if(depth<=0){const totals=p.hands.map(handPips);return totals.map((mine,i)=>totals.reduce((n,v,j)=>n+(i===j?0:v),0)/(totals.length-1)-mine);}
 const moves=positionMoves(p);const children=(moves.length?moves:[null]).map(m=>selfish(positionPlay(p,m),depth-1));
 return children.reduce((best,v)=>v[p.turn]!>best[p.turn]!?v:best);
}
`;
let source=readFileSync('./study-goal-baseline.ts','utf8');const call='solve(q,o.seat,total+(stock?.length??0)<=9?(total+(stock?.length??0)+1)*o.counts.length:3)';assert(source.includes(call));
source+=maxn;source=source.replace(call,`p.hands.length>2&&!p.partners&&!stock?selfish(q,total<=9?(total+1)*o.counts.length:3)[o.seat]!:${call}`);
// Parenthesize the conditional after +=; candidate is loaded only by this study.
source=source.replace('values[i]!+=p.hands.length','values[i]!+=(p.hands.length').replace(`:${call};`, `:${call});`);
writeFileSync(path,source);
try{
 const candidate:typeof base=await import(path);const games=2000;const wins=[0,0,0];let steps=0;
 for(let seed=1;seed<=games;seed++){
  const offset=seed%3;let s=base.init({players:[0,1,2].map(i=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode:'block'}});
  const rngs=[0,1,2].map(i=>createRng(seed^(0x1234+i*0x4567)));let turns=0;
  while(s.phase.id!=='done'&&turns<20000){const seat=s.turn;const policy=(seat+offset)%3;const core=policy===0?candidate:base;const input=core.game.bot.sampleInput(s,s.seats[seat]!,rngs[seat]!,policy===2?'normal':'sharp');assert(input);s=base.reduce(s,{type:'input',playerId:s.seats[seat]!,input,now:turns++*100});}
  assert.equal(s.phase.id,'done');const winner=Number(base.results(s)!.winnerIds[0]!.slice(1));wins[(winner+offset)%3]!++;steps+=turns;if(seed%100===0)console.log({seed,wins});
 }
 const report={games,policies:['selfish max-n candidate','shipped coalition sharp','normal'],wins,steps,mode:'three-seat Block',seedRange:[1,games]};writeFileSync('strategy-goal-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{unlinkSync(path);}
