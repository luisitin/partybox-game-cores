import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import * as original from '../../dist/moves.mjs';
import * as candidate from './moves-candidate.mjs';
const startedAt=new Date().toISOString(),corpus=[];
const files=(await readdir('.work/league-phase-full/league-games')).filter(name=>name.endsWith('.jsonl')).sort();
for(const name of files){
 const rows=(await readFile('.work/league-phase-full/league-games/'+name,'utf8')).trim().split('\n').map(line=>JSON.parse(line));
 for(const row of rows)corpus.push({board:row.finalBoard,variant:row.variant,side:row.plies%2===0?1:-1});
}
let seed=0xC10C2026;
for(let i=0;i<10000;i++){
 const variant=i%2?'american':'international',board=Array.from({length:variant==='american'?32:50},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%5-2;});
 corpus.push({board,variant,side:i%3?1:-1});
}
const edge=[];
for(const length of [0,1,32,50]){
 const board=new Array(length);if(length>0)board[0]=0;if(length>2)board[2]=undefined;if(length>5)board[5]=-2;
 edge.push({board,variant:'american',side:1});
}
const transcript=createHash('sha256');
for(const {board,variant,side} of [...corpus,...edge]){
 const before=JSON.stringify(board),a=original.positionKey(board,side,variant),b=candidate.positionKey(board,side,variant);
 assert.equal(b,a);assert.equal(JSON.stringify(board),before);transcript.update(JSON.stringify([variant,side,a]));
}
const batches=[],iterations=20;
let sink=0;
for(const version of ['original','candidate','candidate','original']){
 const key=version==='original'?original.positionKey:candidate.positionKey,start=performance.now();
 for(let i=0;i<iterations;i++)for(const {board,side,variant} of corpus)sink+=key(board,side,variant).length;
 batches.push({version,elapsedMs:performance.now()-start,calls:corpus.length*iterations});
}
const report={status:'PASS',startedAt,closedAt:new Date().toISOString(),node:process.version,cases:corpus.length+edge.length,actualFinalBoards:4000,syntheticPositions:10000,sparseEdgeCases:edge.length,exactTranscriptSha256:transcript.digest('hex'),sink,batches,scope:'Exact key output/immutability across current actual final boards, synthetic dense boards and sparse edge inputs. Native ABBA string-construction microbenchmark only; not whole-game/search improvement, CI fit or frame acceptance.'};
await writeFile('.work/key-loop-private/key-bench.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
