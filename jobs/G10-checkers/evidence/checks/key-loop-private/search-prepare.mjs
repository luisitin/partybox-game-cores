import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
const base=resolve('.work/key-loop-private'),directory=base+'/candidate';await mkdir(directory,{recursive:true});
const source=await readFile(base+'/moves.candidate.ts','utf8');
const patch={name:'private-equivalent-key-loop',setup(api){api.onLoad({filter:/src\/moves\.ts$/},args=>({contents:source,loader:'ts',resolveDir:dirname(args.path)}));}};
const shared=variant=>({name:'unchanged-shared-endgame',setup(api){api.onResolve({filter:/endgame\.js$/},()=>({path:resolve('dist/endgame'+(variant?'-'+variant:'')+'.mjs'),external:true}));}});
const hashes={};const sha=value=>createHash('sha256').update(value).digest('hex');
for(const variant of [null,'american','international'])for(const name of variant?['core','bots']:['core','bots','international-search']){
 const filename=name+(variant?'-'+variant:'')+'.mjs';
 await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:directory+'/'+filename,alias:{zod:resolve('node_modules/zod')},loader:{'.bin':'binary','.idx':'text','.chunk':'base64'},define:{G10_CHINOOK_ENABLED:String(variant!=='international'),G10_INTERNATIONAL_ENABLED:String(variant!=='american')},plugins:[patch,shared(variant)],logLevel:'error'});
 hashes[filename]=sha(await readFile(directory+'/'+filename));
}
let equivalent=await readFile('.work/search-memo-private/full-equivalence.mjs','utf8');
equivalent=equivalent.replaceAll('.work/search-memo-private','.work/key-loop-private').replaceAll('bots.original.ts','moves.original.ts').replaceAll('bots.memo.ts','moves.candidate.ts').replaceAll('prepare.mjs','search-prepare.mjs').replaceAll("'src/bots.ts'","'src/moves.ts'");
equivalent=equivalent.replace("scope:'Private stage-one local legal-move memo; unchanged root/Easy branch, budgets, nodes, probes, TT/order and RNG. Exact retained reports/cursors/block retries and complete games; signed zero follows JSON protocol.'","scope:'Private equivalent board-key construction only. Exact unchanged serialized search reports, RNG cursors, requested blocks and complete original game transitions. Shared endgame source remains unchanged; signed zero follows JSON protocol.'");
await writeFile(base+'/full-equivalence.mjs',equivalent);
const worker=(await readFile('.work/search-memo-private/pilot-worker.mjs','utf8')).replaceAll('.work/search-memo-private','.work/key-loop-private');
await writeFile(base+'/pilot-worker.mjs',worker);
let pilot=(await readFile('.work/search-memo-private/pilot.mjs','utf8')).replaceAll('.work/search-memo-private','.work/key-loop-private').replaceAll('bots.memo.ts','moves.candidate.ts');
pilot=pilot.replace("for(const variant of ['international','american'])for(const version of ['original','candidate']){","for(const variant of ['international','american'])for(const version of ['original','candidate','candidate','original']){");
pilot=pilot.replace("scope:'Same-process / same-Worker sequential original then candidate pilot timings after both variants and implementations import. Four fixed original games per variant; byte-identical game body. Sequential timings do not establish controlled causal or CI speed gain.'","scope:'Native ABBA game-body timing after importing both versions and variants. Four fixed identical original games per batch. Exact complete records required. Matched diagnostic evidence only; not canonical 4000-game or 30-minute workflow acceptance.'");
await writeFile(base+'/pilot.mjs',pilot);
await writeFile(base+'/search-preparation.json',JSON.stringify({preparedAt:new Date().toISOString(),scope:'Private key-loop only; public source unchanged',moduleSha256:hashes,equivalenceRunnerSha256:sha(equivalent),pilotWorkerSha256:sha(worker),pilotSha256:sha(pilot)},null,2)+'\n');
console.log('Prepared private exact search and ABBA complete-game checks.');
