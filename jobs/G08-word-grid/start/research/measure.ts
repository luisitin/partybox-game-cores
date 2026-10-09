// Reproducible measured facts, no runtime network or downloaded commercial dictionary.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createRng, hashString } from '../../../../contract/rng';
import { packFor, type Lang } from '../games/shake-up/server/content';
import { solve } from '../games/shake-up/server/solver';
import { referenceDictionary, referenceSolve, referencePath } from './reference-solver';
const read = (name: string) => readFileSync(new URL(name, import.meta.url), 'utf8');
const seal = read('./REFERENCE.sha256').split(' ')[0];
assert.equal(createHash('sha256').update(read('./reference-solver.ts')).digest('hex'), seal, 'independent oracle changed after its seal');
type Candidate = { id: string; lang: Lang; size: number; origin: string; faces: string[][] };
const candidates = JSON.parse(read('./cube-candidates.json')) as Candidate[];
const common = JSON.parse(read('../games/shake-up/content/common-words.en.json')) as string[];
const grids = 10_000;
const round = (n: number) => Number(n.toFixed(6));
function stats(values: number[]) {
  const sorted = values.slice().sort((a,b) => a-b), n=values.length;
  const mean=values.reduce((s,v)=>s+v,0)/n;
  const quantile=(p:number)=>sorted[Math.max(0,Math.ceil(p*n)-1)]!;
  return { mean:round(mean), standardDeviation:round(Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/n)), min:sorted[0]!, p05:quantile(.05), median:quantile(.5), p95:quantile(.95), max:sorted[n-1]!, below60:values.filter(v=>v<60).length, shareBelow60:round(values.filter(v=>v<60).length/n) };
}
const results: unknown[] = [];
let differential=0, checkedPaths=0;
for (const lang of ['en','es'] as const) {
  const pack=packFor(lang), blocked=new Set(pack.blocked);
  const reference=referenceDictionary(pack.words);
  for (const candidate of candidates.filter(c=>c.lang===lang)) {
    const counts:number[]=[], commonCounts:number[]=[], qCounts:number[]=[];
    let qGrids=0, qPathFailures=0;
    for (let seed=1;seed<=grids;seed++) {
      const rng=createRng(hashString(`cube-study:${seed}`));
      const grid=rng.shuffle(candidate.faces).map(d=>rng.pick(d));
      const all=solve(grid,candidate.size,pack.words,candidate.size===4?3:4,Infinity);
      if(seed<=2000){
        const expected=referenceSolve(grid,candidate.size,reference,candidate.size===4?3:4);
        assert.deepEqual(all.map(w=>w.w).sort(), [...expected.keys()].sort(), `${candidate.id} seed ${seed}`);
        for (const word of all) { assert(referencePath(grid,candidate.size,word.path,word.w), `${candidate.id} invalid path ${word.w}`); checkedPaths++; }
        differential++;
      }
      const family=all.filter(w=>!blocked.has(w.w));
      counts.push(family.length);
      if(lang==='en') commonCounts.push(solve(grid,candidate.size,common,candidate.size===4?3:4,Infinity).filter(w=>!blocked.has(w.w)).length);
      if(grid.includes('qu')) {
        qGrids++;const withQ=family.filter(w=>w.w.includes('q'));qCounts.push(withQ.length);
        for(const word of withQ) if(!word.path.some(p=>grid[p]==='qu') || /q(?!u)/.test(word.w)) qPathFailures++;
      }
      if(seed%2000===0)console.log(JSON.stringify({candidate:candidate.id,completed:seed,total:grids}));
    }
    const result={candidate:candidate.id,lang,size:candidate.size,grids,seedRange:[1,grids],dictionaryWords:pack.words.length,blockedWords:pack.blocked.length,full:stats(counts),...(lang==='en'?{commonDictionaryWords:common.length,common:stats(commonCounts)}:{}),q:{gridsWithQu:qGrids,shareWithQu:round(qGrids/grids),wordsOnQuGrids:stats(qCounts),invalidQuPaths:qPathFailures},differentialCases:2000};
    assert.equal(qPathFailures,0);results.push(result);console.log(JSON.stringify(result));
  }
}
const report={version:1,method:'10,000 independently seeded uniform cube permutations/faces per candidate; distinct family-mode words; unbounded production solver. Same seeds pair candidates. Common=en SCOWL levels <=70 intersection. Quantiles nearest rank, population SD. First 2000 cases per candidate diff against sealed independent trie/frontier oracle.',referenceSha256:seal,differentialCases:differential,pathsChecked:checkedPaths,results};
assert.equal(differential,10_000);
writeFileSync(new URL('./cube-study.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({differential,checkedPaths,report:'start/research/cube-study.json'}));
