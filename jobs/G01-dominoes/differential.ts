import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createRng} from '../../contract/rng.ts';
import {allTiles,solve,type Position} from './core.ts';
import {reference} from './reference.ts';
const rng=createRng(0xD1FF);const start=performance.now();let cases=0;
for(let i=0;i<20000;i++){
 const n=rng.int(2,4);const deck=rng.shuffle(allTiles());let offset=0;
 const hands=Array.from({length:n},()=>{const size=rng.int(1,2);const h=deck.slice(offset,offset+size);offset+=size;return h;});
 const p:Position={hands,ends:i%11===0?null:[rng.int(0,6),rng.int(0,6)],turn:rng.int(0,n-1),passes:rng.int(0,n-1),partners:n===4&&i%2===0};if(i>=10000){p.stock=deck.slice(offset,offset+rng.int(0,2));p.reserve=i%3===0?2:0;}const root=rng.int(0,n-1);
 assert.equal(solve(p,root),reference(p,root),JSON.stringify({i,p,root}));cases++;
}
const report={seed:0xD1FF,cases,passed:true,milliseconds:Math.round(performance.now()-start)};
writeFileSync('differential-report.json',JSON.stringify({seed:report.seed,cases:report.cases,blockCases:10000,drawCases:10000,passed:true},null,2)+'\n');console.log(report);
