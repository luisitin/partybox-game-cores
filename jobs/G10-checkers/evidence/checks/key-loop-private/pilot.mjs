import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {resolve} from 'node:path';

const base=resolve('.work/key-loop-private'),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const paths=['src/bots.ts','src/moves.ts','src/draws.ts','scripts/league-worker.mjs',base+'/moves.candidate.ts',base+'/pilot-worker.mjs',base+'/pilot.mjs',
  ...['international','american'].flatMap(variant=>['dist/core-'+variant+'.mjs',base+'/candidate/core-'+variant+'.mjs',base+'/candidate/bots-'+variant+'.mjs'])];
const hashes=async()=>Object.fromEntries(await Promise.all(paths.map(async path=>[path,sha(await readFile(path))])));
const report={status:'RUNNING',startedAt:new Date().toISOString(),runtime:process.version,command:process.argv,order:[],results:[],
  scope:'Native ABBA game-body timing after importing both versions and variants. Four fixed identical original games per batch. Exact complete records required. Matched diagnostic evidence only; not canonical 4000-game or 30-minute workflow acceptance.'};
report.inputsBefore=await hashes();const worker=new Worker(new URL('./pilot-worker.mjs',import.meta.url));
const waiting=predicate=>new Promise((resolveMessage,reject)=>{const message=result=>{if(predicate(result)){cleanup();resolveMessage(result);}};
  const failure=error=>{cleanup();reject(error);};const exit=code=>failure(new Error('Worker exited before expected reply: '+code));
  const cleanup=()=>{worker.off('message',message);worker.off('error',failure);worker.off('exit',exit);};
  worker.on('message',message);worker.on('error',failure);worker.on('exit',exit);});
try{
  report.prepared=await waiting(message=>message.kind==='ready');
  for(const variant of ['international','american'])for(const version of ['original','candidate','candidate','original']){
    const task={variant,version,higher:'sharp',lower:'normal',start:0,end:4},startedAt=new Date().toISOString(),began=performance.now(),next=waiting(message=>message.task!==undefined);
    worker.postMessage(task);const result=await next;assert.deepEqual(result.task,task);assert.equal(result.records.length,4);
    const gold=await readFile('evidence/checks/league-dedicated-pool-pilot/'+variant+'-sharp-normal-0000.jsonl','utf8'),raw=result.records.map(record=>JSON.stringify(record)).join('\n')+'\n';
    assert.equal(raw,gold);await writeFile(base+'/'+variant+'-'+version+'-games.jsonl',raw);
    report.order.push(variant+'-'+version);report.results.push({variant,version,startedAt,closedAt:new Date().toISOString(),
      originalGameBodyWallSeconds:result.elapsedSeconds,parentObservedWallSeconds:(performance.now()-began)/1000,
      byteIdenticalGold:true,recordsSha256:sha(raw),plies:result.records.map(record=>record.plies)});
    await writeFile(base+'/pilot-report.json',JSON.stringify(report,null,2)+'\n');
  }
  report.status='PASS_EXACT_PILOT_RECORDS';
}catch(error){report.status='INCOMPLETE';report.failure=String(error.stack??error);process.exitCode=2;}
finally{
  await worker.terminate();report.inputsAfter=await hashes();report.allInputsUnchanged=JSON.stringify(report.inputsBefore)===JSON.stringify(report.inputsAfter);
  if(!report.allInputsUnchanged){report.status='INCOMPLETE';process.exitCode=2;}report.closedAt=new Date().toISOString();
  await writeFile(base+'/pilot-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
