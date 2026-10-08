// Separate diagnostic only. Never used by pure candidate, timing or adoption.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

const base=resolve('.work/search-memo-private'),out=base+'/frequency';await mkdir(out,{recursive:true});
const sha=value=>createHash('sha256').update(value).digest('hex');
const source=await readFile(base+'/bots.memo.ts','utf8');let counted=source;
const replace=(before,after)=>{assert.equal(counted.split(before).length-1,1);counted=counted.replace(before,after);};
replace('  const moveCache=new Map<string,Move[]>();','  const moveCache=new Map<string,Move[]>();\n  const memoStats={requests:0,hits:0,misses:0};');
replace('    let moves=moveCache.get(boardKey);\n    if(!moves){moves=legalMoves(current.board,current.variant,current.side);moveCache.set(boardKey,moves);}',
  '    memoStats.requests++;\n    let moves=moveCache.get(boardKey);\n    if(moves)memoStats.hits++;\n    else{memoStats.misses++;moves=legalMoves(current.board,current.variant,current.side);moveCache.set(boardKey,moves);}');
replace('nodes,completedDepth:completed,budgetExhausted:exhausted,databaseHits:hits,corpusHits};',
  'nodes,completedDepth:completed,budgetExhausted:exhausted,databaseHits:hits,corpusHits,_memoStats:{...memoStats,entries:moveCache.size}};');
await writeFile(out+'/bots.counted.ts',counted);
const report={status:'RUNNING',startedAt:new Date().toISOString(),runtime:process.version,sourceSha256:sha(counted),pureCandidateSourceSha256:sha(source),
  scope:'Separate untimed observer only: private search adds local cache counts to its returned diagnostic report. It is excluded from pure equivalence, timings and adoption. Sixteen fixed fixture/skill pairs derived from pilot n0 at ply0/one-third/two-thirds/last; compare original report fields and cursor against actual original bundles.',fixtures:[]};
try{
  for(const variant of ['international','american']){
    const filename=out+'/bots-'+variant+'.mjs';
    await build({entryPoints:['src/bots.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:filename,
      alias:{zod:resolve('node_modules/zod')},define:{G10_CHINOOK_ENABLED:String(variant==='american'),G10_INTERNATIONAL_ENABLED:String(variant==='international')},
      plugins:[{name:'private-local-returned-counters',setup(api){api.onLoad({filter:/src\/bots\.ts$/},args=>({contents:counted,loader:'ts',resolveDir:dirname(args.path)}));
        api.onResolve({filter:/endgame\.js$/},()=>({path:resolve('dist/endgame-'+variant+'.mjs'),external:true}));}}],logLevel:'error'});
    const core=await import(pathToFileURL(resolve('dist/core-'+variant+'.mjs'))),original=await import(pathToFileURL(resolve('dist/bots-'+variant+'.mjs'))),diagnostic=await import(pathToFileURL(filename));
    const gold=(await readFile('evidence/checks/league-dedicated-pool-pilot/'+variant+'-sharp-normal-0000.jsonl','utf8')).trim().split('\n').map(line=>JSON.parse(line))[0];
    const plies=[0,Math.floor(gold.plies/3),Math.floor(2*gold.plies/3),gold.plies-1];
    for(const ply of plies){
      let state=core.init({players:['light','dark'].map(id=>({id,name:id,avatarId:id,connected:true,bot:true})),settings:{variant},seed:gold.seed,now:1000});
      for(let at=0;at<ply;at++){state=core.reduce(state,{type:'input',playerId:core.turnId(state),input:gold.moves[at],now:2000+at});}
      assert.equal(state.phase.id,'move');assert.equal(state.ply,ply);
      for(const skill of ['normal','sharp']){
        const seed=(0x4D454D00+(variant==='international'?10000:0)+ply*7+(skill==='sharp'?1:0))>>>0,
          a=core.createRng(seed),b=core.createRng(seed),before=JSON.stringify(state),expected=original.searchMove(state,state.settings,a,skill),actual=diagnostic.searchMove(state,state.settings,b,skill);
        const {_memoStats,...plain}=actual;assert.deepEqual(JSON.parse(JSON.stringify(plain)),JSON.parse(JSON.stringify(expected)));assert.deepEqual(b.state(),a.state());assert.equal(JSON.stringify(state),before);
        assert(_memoStats);assert.equal(_memoStats.requests,_memoStats.hits+_memoStats.misses);assert.equal(_memoStats.entries,_memoStats.misses);assert(_memoStats.requests<=actual.nodes);
        report.fixtures.push({variant,sourceGame:0,ply,skill,seed,board:state.board,side:state.side,quietPlies:state.quietPlies,
          report:plain,cursor:b.state(),memoStats:_memoStats,generationAvoidedFraction:_memoStats.requests?_memoStats.hits/_memoStats.requests:0});
      }
    }
  }
  assert.equal(report.fixtures.length,16);report.status='PASS_SEPARATE_COUNTS';
}catch(error){report.status='INCOMPLETE';report.failure=String(error.stack??error);process.exitCode=2;}
finally{
  assert.equal(sha(await readFile(base+'/bots.memo.ts')),report.pureCandidateSourceSha256);report.pureCandidateSourceUnchanged=true;report.closedAt=new Date().toISOString();
  report.totalRequests=report.fixtures.reduce((sum,row)=>sum+row.memoStats.requests,0);report.totalHits=report.fixtures.reduce((sum,row)=>sum+row.memoStats.hits,0);
  report.totalMisses=report.fixtures.reduce((sum,row)=>sum+row.memoStats.misses,0);await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,fixtures:report.fixtures.length,totalRequests:report.totalRequests,totalHits:report.totalHits,totalMisses:report.totalMisses,pureCandidateSourceUnchanged:report.pureCandidateSourceUnchanged}));
}
