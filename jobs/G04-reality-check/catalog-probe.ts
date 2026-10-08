import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {rowSchema,sampleRows,makeSamples,type Row} from './samples.ts';
import {normalize} from './scoring.ts';
import {initialEstimate} from './estimates.ts';
import {game,createGame,validAnswer,type State} from './core.ts';
const samplerSeed=0x6040007,rng=createRng(samplerSeed),counts:Record<string,number>={};
let s=game.init({players:[0,1].map(i=>({id:'p'+i,name:'Player '+i,avatarId:'🙂',connected:true})),seed:1,now:0,settings:{mode:'quick'}});
while(s.phase.id!=='answer')s=game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});
let actions=0,defaults=0;
for(let i=0;i<10000;i++){
 const kind=(['number','century','decade','choice'] as const)[i%4]!;
 const base=sampleRows.find(r=>r.kind===kind)!;let row:Row;
 if(kind==='number'){
  const edge=[[0,Number.MIN_VALUE],[Number.MIN_VALUE,1e-310],[1e-200,1e-180],[.01,.02],[999999999999,1e12]][Math.floor(i/4)];
  const min=edge?.[0]??(rng.chance(.2)?0:10**rng.int(-323,10)),max=edge?.[1]??Math.min(1e12,(min||10**rng.int(-323,10))*10**rng.int(1,12));
  row=rowSchema.parse({...base,min,max,correct:min+rng.float()*(max-min),prompt:'Estimate within the public bounds.'});
 }else if(kind==='century'){
  const min=rng.int(-100,99),max=rng.int(min+1,100);let correct=rng.int(min,max);if(correct===0)correct=min<0?min:max;
  const year=Math.abs(correct)*100-rng.int(0,99);
  row=rowSchema.parse({...base,min,max,correct,prompt:`Object 7, dated ${year}${correct<0?'bce':'CE'}`});
 }else if(kind==='decade'){
  const min=rng.int(0,299)*10,max=rng.int(min/10+1,300)*10,correct=rng.int(min/10,max/10)*10;
  row=rowSchema.parse({...base,min,max,correct,prompt:`The name peaked in ${correct+rng.int(0,9)}`});
 }else row=rowSchema.parse({...base,correct:rng.int(0,1)});
 const current:State={...s,question:row};counts[kind]=(counts[kind]??0)+1;
 if(row.kind!=='choice'&&row.kind!=='bluff'){assert(validAnswer(row,initialEstimate(row.kind,row.min,row.max)));defaults++;}
 for(const skill of ['easy','normal','sharp'] as const){
  const action=game.bot.sampleInput(current,'p0',createRng(rng.int(0,0xffffffff)),skill);
  assert(action?.type==='answer'&&validAnswer(row,action.value));assert.notEqual(game.reduce(current,{type:'input',playerId:'p0',input:action,now:current.phase.startedAt+1}),current);actions++;
 }
}
const blankTruths=[' ','\u200b','\n\t','\u3000'];let rejected=0;
for(const correct of blankTruths){assert.equal(normalize(correct),'');const rows=makeSamples().map(r=>r.kind==='bluff'?{...r,correct}:r);assert.throws(()=>createGame(rows));rejected++;}
const report={samplerSeed,rows:10000,byKind:counts,actions,defaults,invalid:0,blankTruthsRejected:rejected,blankTruthsTested:blankTruths.length};
writeFileSync('catalog-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
