import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {scoreSide,type ScoreSeat} from './scoring.ts';
import {winningPlay,deck} from './cards.ts';
import {ledger,orderedWinner} from './reference.ts';
const rng=createRng(0x600d1ff),kinds=['number','nil','blind'] as const;
let nilCases=0,blindCases=0,penalties=0,failedContracts=0,madeContracts=0,stockLengthCases=0;
for(let i=0;i<10000;i++){
 const partnership=rng.chance(.5),limit=partnership?13:17,count=partnership?2:1;let available=limit;
 const seats:ScoreSeat[]=Array.from({length:count},()=>{const kind=rng.pick(kinds),won=rng.int(0,available);available-=won;return {bid:{kind,value:kind==='number'?rng.int(1,limit):0},won};});
 const before=rng.int(-1200,1200),bags=rng.int(0,9),bonus=rng.pick([50,100]),countNil=rng.chance(.5);
 const actual=scoreSide(seats,before,bags,bonus,countNil);assert.deepEqual(actual,ledger(seats,before,bags,bonus,countNil),`scoring case ${i}`);
 if(seats.some(s=>s.bid.kind==='nil'))nilCases++;if(seats.some(s=>s.bid.kind==='blind'))blindCases++;if(actual.penalty)penalties++;if(actual.contract<0)failedContracts++;if(actual.contract>0)madeContracts++;if(limit===17)stockLengthCases++;
 const trick=rng.shuffle(deck).slice(0,rng.int(0,4)).map((card,j)=>({playerId:`p${j}`,card}));
 assert.deepEqual(winningPlay(trick),orderedWinner(trick),`trick case ${i}`);
}
const report={seed:0x600d1ff,scoreCases:10000,trickCases:10000,mismatches:0,nilCases,blindCases,penalties,failedContracts,madeContracts,stockLengthCases};
if(process.argv.includes('--write'))writeFileSync('differential-results.json',JSON.stringify(report,null,2)+'\n');
else assert.deepEqual(report,JSON.parse(readFileSync('differential-results.json','utf8')));
console.log(report);
