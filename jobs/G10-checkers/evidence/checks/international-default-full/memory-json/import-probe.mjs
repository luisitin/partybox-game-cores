import {performance} from 'node:perf_hooks';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const [kind='json',mode='import']=process.argv.slice(2),directory=resolve(kind==='json'?'.work/memory-json-private/shadow-dist':'dist'),start=performance.now();
const loaded={};for(const name of ['core','bots','endgame','international-search'])loaded[name]=await import(pathToFileURL(resolve(directory,name+'.mjs')));
const importSeconds=(performance.now()-start)/1000,importUsage=process.resourceUsage(),coverage=loaded.endgame.internationalCorpus.coverage();
if(coverage.files.length!==41||coverage.slices!==156||coverage.bytes!==1006478762)throw new Error('Incomplete corpus after representation change');
const report={status:'PASS_IMPORT',kind,mode,startedAt:new Date(Date.now()-(performance.now()-start)).toISOString(),node:process.version,pid:process.pid,importSeconds,importUsage,importMemory:process.memoryUsage(),coverage,scope:'Private source-equivalent complete corpus import. No browser acceptance or search proof from import alone.'};
if(mode==='probe'){
 const raw=await readFile('evidence/checks/international-original-complete/international-original-reference.jsonl','utf8');
 const rows=raw.trim().split('\n').map(JSON.parse),hash=createHash('sha256');let second=0;
 for(const row of rows){const result=loaded.endgame.internationalCorpus.probe(row.board,row.side),expected=row.value==='win'?1:row.value==='loss'?-1:0;
  if(result!==expected)throw new Error('Representation changed WLD '+row.id);const hit=loaded.endgame.probeEndgame(row.board,'international',row.side);if(hit?.outcome!==expected)throw new Error('Default resolver changed WLD '+row.id);
  hash.update(JSON.stringify([row.id,result])+'\n');if(row.index>=2147483648)second++;
 }
 report.status='PASS_IMPORT_AND_10000';report.cases=rows.length;report.secondSubslice=second;report.transcriptSha256=hash.digest('hex');report.probeSeconds=(performance.now()-start)/1000-importSeconds;
}
report.totalSeconds=(performance.now()-start)/1000;report.finalUsage=process.resourceUsage();report.finalMemory=process.memoryUsage();
await mkdir('.work/memory-json-private',{recursive:true});await writeFile('.work/memory-json-private/'+kind+'-'+mode+'-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
