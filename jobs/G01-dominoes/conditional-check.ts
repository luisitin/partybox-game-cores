import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {conditionalDeals,allTiles,tile} from './core.ts';
const rng=createRng(0xC0DE);let checked=0,feasible=0;
for(let k=0;k<10000;k++){
 const unknown=rng.shuffle(allTiles()).slice(0,rng.int(1,7));const bins=rng.int(2,4);
 const capacities=Array.from({length:bins},()=>0);for(const t of unknown)capacities[rng.int(0,bins-1)]!++;
 const forbidden=capacities.map(()=>rng.int(0,127));forbidden[bins-1]=0;
 const brute=(index:number,caps:number[]):number=>{
  if(index===unknown.length)return 1;let n=0;
  for(let b=0;b<bins;b++)if(caps[b]!>0&&tile(unknown[index]!).every(p=>!(forbidden[b]!&(1<<p)))){const next=caps.slice();next[b]!--;n+=brute(index+1,next);}return n;
 };
 const expected=brute(0,capacities);const sampler=conditionalDeals(unknown,capacities,forbidden,createRng(k));assert.equal(sampler.ways,expected);checked++;
 const sample=sampler.sample();if(!expected){assert.equal(sample,null);continue;}feasible++;assert(sample);
 assert.deepEqual(sample.flat().sort((a,b)=>a-b),unknown.slice().sort((a,b)=>a-b));
 for(let b=0;b<bins;b++){assert.equal(sample[b]!.length,capacities[b]);assert(sample[b]!.every(t=>tile(t).every(p=>!(forbidden[b]!&(1<<p)))));}
}
const unknown=allTiles().filter(t=>t<1||t>6);const a=conditionalDeals(unknown,[3,19],[31,0],createRng(77)),b=conditionalDeals(unknown,[3,19],[31,0],createRng(77));assert.equal(a.ways,1);
for(let i=0;i<1000;i++){const sample=a.sample();assert.deepEqual(sample,b.sample());assert.deepEqual(sample![0]!.slice().sort((a,b)=>a-b),[25,26,27]);}
let rejectionValid=0;
for(let seed=0;seed<1000;seed++){const old=createRng(seed);for(let attempt=0;attempt<128;attempt++){const h=old.shuffle(unknown).slice(0,3);if(h.every(t=>tile(t).every(p=>!(31&(1<<p))))){rejectionValid++;break;}}}
const report={seed:0xC0DE,checked,feasible,rareDeal:{unconditionalPartitions:1540,conditionalPartitions:1,samples:1000,valid:1000,previous128AttemptValid:rejectionValid},passed:true};writeFileSync('conditional-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
