// Measure a public deduction before changing the shipped sampler.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {createRng,type Rng} from '../../contract/rng.ts';
import * as base from './study-opener-baseline.ts';
const path='./mutant-draw-opener-before-study.ts';const currentPath='./mutant-draw-opener-current-study.ts';
const source=readFileSync('study-opener-baseline.ts','utf8');
assert(source.includes('function handSampler('));
writeFileSync(path,source.replace('function handSampler(','export function handSampler('));
writeFileSync(currentPath,readFileSync('core.ts','utf8').replace('function handSampler(','export function handSampler('));
const value=(t:number)=>{const [a,b]=base.tile(t);return a===b?100+a:a+b;};
try{
 const before:typeof base & {handSampler(o:base.Observation,rng:Rng):()=>number[][]|null}=await import(path);
 const current:typeof import('./core.ts') & {handSampler(o:import('./core.ts').Observation,rng:Rng):()=>number[][]|null}=await import(currentPath);
 let afterInvalidWorlds=0;const afterGroups:Record<string,{cases:number;invalidWorlds:number}>={};
 const groups:Record<string,{cases:number;invalidWorlds:number}>={};let invalidWorlds=0;
 for(let seed=1;seed<=10000;seed++){
  const n=2+seed%3;
  let s=base.init({seed,now:0,players:Array.from({length:n},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'🙂',connected:true,bot:true})),settings:{mode:'draw',opening:'highest-double'}});
  const input=base.legal(s)[0]!;assert.equal(input.type,'play');
  s=base.reduce(s,{type:'input',playerId:s.seats[s.turn]!,input,now:1});
  assert.equal(s.round,1);assert.equal(s.board.length,1);
  const o=base.observe(s,s.seats[s.turn]!);assert(o);
  const opening=value(o.played[0]!);
  assert(s.hands.flat().every(t=>value(t)<=opening),'actual dealt hands must obey public opener deduction');
  const hands=before.handSampler(o,createRng(seed^0x4567))();assert(hands);
  const invalid=hands.flat().some(t=>value(t)>opening);
  const after=current.handSampler({...o,round:s.round},createRng(seed^0x4567))();assert(after);const badAfter=after.flat().some(t=>value(t)>opening);afterInvalidWorlds+=Number(badAfter);const ag=afterGroups[n+' seats']??={cases:0,invalidWorlds:0};ag.cases++;ag.invalidWorlds+=Number(badAfter);
  invalidWorlds+=Number(invalid);const g=groups[n+' seats']??={cases:0,invalidWorlds:0};g.cases++;g.invalidWorlds+=Number(invalid);
 }
 const report={cases:10000,samplesPerDeal:1,invalidWorlds,invalidRate:invalidWorlds/10000,groups,scope:'first-round non-partner Draw before any stock draw, highest-double opener, next seat observation; only public played tile used for deduction'};
 writeFileSync('draw-opener-before-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
 const comparison={cases:10000,beforeInvalidWorlds:invalidWorlds,afterInvalidWorlds,afterGroups,scope:report.scope};writeFileSync('draw-opener-report.json',JSON.stringify(comparison,null,2)+'\n');console.log(comparison);if(process.argv.includes('--production'))assert.equal(afterInvalidWorlds,0);
}finally{unlinkSync(path);unlinkSync(currentPath);}
