import {readFileSync,writeFileSync,mkdirSync,cpSync,symlinkSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
mkdirSync('.tmp/mutations',{recursive:true});
// Isolate the mutations so the required independent studies can run concurrently on
// the untouched core. Preserve exactly the root contract's relative import structure.
const root=process.cwd(),project=resolve('.tmp/mutations/project'),work=resolve(project,'jobs/G08-word-grid');
rmSync(project,{recursive:true,force:true});mkdirSync(work,{recursive:true});
cpSync('../../contract',resolve(project,'contract'),{recursive:true});
for(const directory of ['start/games/shake-up','start/test-support','start/verification'])cpSync(directory,resolve(work,directory),{recursive:true});
for(const file of ['package.json','tsconfig.json','vitest.config.ts'])cpSync(file,resolve(work,file));
symlinkSync(resolve('node_modules'),resolve(work,'node_modules'),'dir');
const base=resolve(work,'start/games/shake-up/server')+'/';
// Each is a compilable behavioral change, restored before the next. Assertion failures,
// rather than compiler/startup errors, are required to count a kill.
const mutations=[
 ['diagonals excluded','rules.ts','Math.abs(ar - br) <= 1','Math.abs(ar - br) === 0'],
 ['same cube adjacent to itself','rules.ts','if (a === b) return false;','if (a === b) return true;'],
 ['reuse allowed','rules.ts',' || seen.has(c)',''],
 ['last board cell rejected','rules.ts','c >= n','c >= n - 1'],
 ['5x5 three-letter minimum','rules.ts','return size === 5 ? 4 : 3;','return 3;'],
 ['Qu loses u','rules.ts',"w += grid[c] ?? '';","w += grid[c] === 'qu' ? 'q' : grid[c] ?? '';"],
 ['seven-letter score four','rules.ts','if (n === 7) return 5;','if (n === 7) return 4;'],
 ['long-word score ten','rules.ts','if (n >= 8) return 11;','if (n >= 8) return 10;'],
 ['Spanish enye lost','rules.ts',"if (ch === 'ñ') out += 'ñ';","if (ch === 'ñ') out += 'n';"],
 ['dictionary accepts all','dict.ts','return words[i] === w;','return true;'],
 ['solver truncates full results','solver.ts','cap = Number.POSITIVE_INFINITY','cap = 1'],
 ['solver minimum becomes exclusive','solver.ts','[...w].length >= minLen','[...w].length > minLen'],
 ['shared words earn points','scoring.ts','pts: 0, status: \'shared\'','pts: pointsFor(e.w), status: \'shared\''],
 ['unknown words earn points','scoring.ts',"pts: 0, status: 'unknown'","pts: pointsFor(e.w), status: 'unknown'"],
 ['round totals overwritten','scoring.ts','scores[id] = (scores[id] ?? 0) + pts;','scores[id] = pts;'],
 ['duplicate submissions accepted','phases/hunt.ts',' || mine.some((e) => e.w === w)',''],
 ['blocked words accepted','phases/hunt.ts','!cfg.spicy && hasWord(pack.blocked, w)','false && hasWord(pack.blocked, w)'],
 ['done players can submit','phases/hunt.ts',"return state.done[id] === true ? state : addWord(state, id, inp.path, ev.now);","return addWord(state, id, inp.path, ev.now);"],
 ['any finished human closes hunt','phases/hunt.ts','live.every((id) => state.done[id] === true)','live.some((id) => state.done[id] === true)'],
 ['pause duration counted as word speed','phases/hunt.ts','now - state.phase.startedAt - state.pausedMs','now - state.phase.startedAt'],
 ['non-VIP can accept words','phases/reveal.ts',"ev.vip === true && ev.input.t === 'counts'","ev.input.t === 'counts'"],
 ['unrevealed words rulable','phases/reveal.ts','state.beats.slice(0, step + 1)','state.beats.slice(0)'],
 ['other phone receives first seat words','views.ts','state.words[playerId] ?? []','state.words[state.order[0]!] ?? []'],
 ['early results exposed','index.ts',"state.phase.id === 'done' ? results(state) : null","results(state)"],
 ['hunt never leaves','index.ts',"case 'hunt': return enterReveal(state, now);","case 'hunt': return state;"],
];
const tests=['start/games/shake-up/__tests__/rules.test.ts','start/games/shake-up/__tests__/flow.test.ts','start/games/shake-up/__tests__/scoring.test.ts','start/games/shake-up/__tests__/words.test.ts','start/games/shake-up/__tests__/cards.test.ts','start/verification/contract.test.ts','start/verification/rules.test.ts'];
const results=[];
for(const [i,[name,file,from,to]] of mutations.entries()){
 const path=base+file,original=readFileSync(path,'utf8');assert.equal(original.split(from).length-1,1,`${name}: target must occur once`);
 try{
  writeFileSync(path,original.replace(from,to));const report=resolve(root,`.tmp/mutations/${i+1}.json`);
  const run=spawnSync('npx',['vitest','run',...tests,'--testNamePattern','^(?!.*sixteen maximum-length).*','--reporter=json',`--outputFile=${report}`],{cwd:work,encoding:'utf8',timeout:90000,maxBuffer:3*1024*1024});
  writeFileSync(`.tmp/mutations/${i+1}.log`,(run.stdout??'')+(run.stderr??''));assert(!run.error,`${name}: runner error ${run.error}`);
  const data=JSON.parse(readFileSync(report,'utf8'));const failures=data.testResults.flatMap(s=>s.assertionResults??[]).filter(t=>t.status==='failed').map(t=>t.fullName).sort();
  const killed=run.status!==0&&failures.length>0;results.push({number:i+1,name,file,killed,failedAssertions:failures});console.log(JSON.stringify({mutation:i+1,name,killed,failedAssertions:failures.length}));
 } finally {writeFileSync(path,original);}
}
const killed=results.filter(r=>r.killed).length;
writeFileSync('start/verification/mutation-report.json',JSON.stringify({version:1,mutations:25,killed,minimumRequired:24,method:'One compilable behavioral change at a time, restored after targeted rule/flow/scoring/privacy/contract regression tests. Actual failed assertions required; startup/type failures cannot count. Crowded-state stress runs in full baseline suite, not repeated per unrelated mutant.',results},null,2)+'\n');
assert(killed>=24,`only ${killed}/25 mutations killed`);console.log(JSON.stringify({mutations:25,killed}));
