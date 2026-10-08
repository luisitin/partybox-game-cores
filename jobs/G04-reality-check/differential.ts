import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {numberScore} from './scoring.ts';
// Independent logarithmic form: no ratio/min/max from production.
export function referenceScore(guess:number,truth:number):number{
 if(!Number.isFinite(guess)||!Number.isFinite(truth)||guess<0||truth<0)return 0;
 if(guess===truth)return 1000;if(guess===0||truth===0)return 0;
 return Math.round(1000*Math.exp(-Math.abs(Math.log(guess)-Math.log(truth))));
}
let cases=0;
for(let seed=1;seed<=10000;seed++){
 const rng=createRng(seed);const truth=10**(-9+rng.float()*18),guess=10**(-9+rng.float()*18);
 assert.equal(numberScore(guess,truth),referenceScore(guess,truth),`seed ${seed}`);
 assert.equal(numberScore(guess,truth),numberScore(truth,guess));
 const scale=10**(-3+rng.float()*6);assert.equal(numberScore(guess,truth),numberScore(guess*scale,truth*scale));cases++;
}
const edges=[[0,0],[0,1],[1,0],[-1,1],[1,-1],[NaN,1],[1,Infinity],[1,1],[1,2],[2,1],[.5,1],[1e-9,1e9],[Number.MAX_VALUE,Number.MAX_VALUE/2],[Number.MIN_VALUE,Number.MIN_VALUE]];
for(const [g,t] of edges)assert.equal(numberScore(g!,t!),referenceScore(g!,t!));
const report={cases,edgeCases:edges.length,mismatches:0,scaleInvariance:'passed',reciprocalSymmetry:'passed',forms:['min/max ratio','absolute difference of logarithms']};
writeFileSync('differential-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
