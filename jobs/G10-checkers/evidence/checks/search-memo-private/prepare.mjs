import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';

const base=resolve('.work/search-memo-private'),directory=base+'/candidate';await mkdir(directory,{recursive:true});
const source=await readFile('src/bots.ts','utf8');let candidate=source;
const replace=(before,after)=>{assert.equal(candidate.split(before).length-1,1);candidate=candidate.replace(before,after);};
replace("  const table=new Map<string,{depth:number;score:number;bound:'exact'|'lower'|'upper';move:string|null}>();",
  "  const table=new Map<string,{depth:number;score:number;bound:'exact'|'lower'|'upper';move:string|null}>();\n  const moveCache=new Map<string,Move[]>();");
replace("    const key=positionKey(current.board,current.side,current.variant)+'|'+current.quietPlies+'|'+ply+'|'+",
  "    const boardKey=positionKey(current.board,current.side,current.variant);\n    const key=boardKey+'|'+current.quietPlies+'|'+ply+'|'+");
replace('    const moves=legalMoves(current.board,current.variant,current.side);',
  '    let moves=moveCache.get(boardKey);\n    if(!moves){moves=legalMoves(current.board,current.variant,current.side);moveCache.set(boardKey,moves);}');
await writeFile(base+'/bots.original.ts',source);await writeFile(base+'/bots.memo.ts',candidate);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const flags=(american,international)=>({G10_CHINOOK_ENABLED:String(american),G10_INTERNATIONAL_ENABLED:String(international)});
const memo={name:'private-local-legal-moves-memo',setup(api){api.onLoad({filter:/src\/bots\.ts$/},args=>({contents:candidate,loader:'ts',resolveDir:dirname(args.path)}));}};
const shared=variant=>({name:'actual-immutable-shared-endgame',setup(api){api.onResolve({filter:/endgame\.js$/},()=>({path:resolve('dist/endgame'+(variant?'-'+variant:'')+'.mjs'),external:true}));}});
const modules={};
for(const variant of [null,'american','international'])for(const name of variant?['core','bots']:['core','bots','international-search']){
  const filename=name+(variant?'-'+variant:'')+'.mjs',american=variant!=='international',international=variant!=='american';
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:directory+'/'+filename,
    alias:{zod:resolve('node_modules/zod')},loader:{'.bin':'binary','.idx':'text','.chunk':'base64'},define:flags(american,international),plugins:[memo,shared(variant)],logLevel:'error'});
  modules[filename]=sha(await readFile(directory+'/'+filename));
}
const originalAcceptance=await readFile('.work/memory-json-private/full-equivalence.mjs','utf8');let acceptance=originalAcceptance;
assert(acceptance.includes("const directory=resolve('.work/memory-json-private/shadow-dist')"));
acceptance=acceptance.replace("const directory=resolve('.work/memory-json-private/shadow-dist')","const directory=resolve('.work/search-memo-private/candidate')")
  .replace("process.env.G10_JSON_OUTPUT_DIR??'.work/memory-json-private'","process.env.G10_JSON_OUTPUT_DIR??'.work/search-memo-private'")
  .replace('// Private acceptance runner: only the immutable data containers differ.','// Private stage-one acceptance: only a local per-search legal-move memo differs.')
  .replace("scope:'New private static-JSON data container, unchanged compiled default game/search/decoder code. Compare exact serialized SearchReport fields, PRNG cursor, requested blocks and full game transitions with retained actual-default acceptance receipts; signed zero follows the JSON protocol.'",
    "scope:'Private stage-one local legal-move memo; unchanged root/Easy branch, budgets, nodes, probes, TT/order and RNG. Exact retained reports/cursors/block retries and complete games; signed zero follows JSON protocol.'");
const guard="const memoInputPaths=['.work/search-memo-private/bots.original.ts','.work/search-memo-private/bots.memo.ts','.work/search-memo-private/prepare.mjs','src/bots.ts',...['core.mjs','bots.mjs','international-search.mjs','core-american.mjs','bots-american.mjs','core-international.mjs','bots-international.mjs'].map(name=>resolve(directory,name))];\nconst memoInputHashes=()=>Object.fromEntries(memoInputPaths.map(path=>[path,sha(readFileSync(path))]));\nconst candidateInputsBefore=memoInputHashes();\n";
acceptance=acceptance.replace('const outputs=[],games=[];',guard+'const outputs=[],games=[];');
const begin=acceptance.indexOf("const prepared=JSON.parse(readFileSync('.work/memory-json-private/preparation.json'))"),end=acceptance.indexOf("\nreport.status='PASS'",begin);assert(begin>=0&&end>begin);
acceptance=acceptance.slice(0,begin)+"const moduleHashes=memoInputHashes();assert.deepEqual(moduleHashes,candidateInputsBefore);report.candidateInputsBefore=candidateInputsBefore;report.candidateInputsAfter=moduleHashes;report.allCandidateInputsUnchanged=true;"+acceptance.slice(end);
await writeFile(base+'/full-equivalence.mjs',acceptance);
const originalWorker=await readFile('scripts/league-worker.mjs','utf8');let worker=originalWorker;
worker=worker.replace("import {performance} from 'node:perf_hooks';","import {performance} from 'node:perf_hooks';\nimport {resolve} from 'node:path';\nimport {pathToFileURL} from 'node:url';");
worker=worker.replace("const assignedVariant=workerData?.variant??null;",'const assignedVariant=null;');
worker=worker.replace("const prepared=assignedVariant?await import('../dist/core-'+assignedVariant+'.mjs'):null;",
  "const modules={};for(const variant of ['international','american'])for(const version of ['original','candidate']){const path=resolve(version==='original'?'dist':'.work/search-memo-private/candidate','core-'+variant+'.mjs');modules[variant+':'+version]=await import(pathToFileURL(path));}");
worker=worker.replace("  const core=prepared??await import('../dist/core-'+task.variant+'.mjs');",'  const core=modules[task.variant+\':\'+task.version];');
worker=worker.replace("if(prepared)parentPort.postMessage({kind:'ready',variant:assignedVariant,importSeconds:(performance.now()-importBegan)/1000,memory:process.memoryUsage()});",
  "parentPort.postMessage({kind:'ready',importSeconds:(performance.now()-importBegan)/1000,memory:process.memoryUsage()});");
const body=text=>text.slice(text.indexOf('  const beginning=performance.now(),records=[];'),text.indexOf("\n});"));
assert.equal(body(worker),body(originalWorker));await writeFile(base+'/pilot-worker.mjs',worker);
const preparation={status:'PREPARED',startedAt:new Date().toISOString(),scope:'Private stage one only: local per-search memo of legalMoves; same existing boardKey reused for TT; no other memo or nextPosition/probe change.',
  originalBotsSha256:sha(source),candidateBotsSha256:sha(candidate),modules,originalAcceptanceSha256:sha(originalAcceptance),adaptedAcceptanceSha256:sha(acceptance),
  pilotGameBodySha256:sha(body(originalWorker)),pilotGameBodyByteIdentical:true,
  originalBudgetBranchesPreserved:source.slice(0,source.indexOf('  const table='))===candidate.slice(0,candidate.indexOf('  const table=')),
  privateExternalImports:'Existing actual dist/endgame[-variant].mjs; no corpus copies, no full build, no delivered files rewritten.'};
await writeFile(base+'/preparation.json',JSON.stringify(preparation,null,2)+'\n');console.log(JSON.stringify(preparation));
