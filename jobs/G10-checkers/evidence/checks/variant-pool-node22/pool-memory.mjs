import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';

const directory=new URL('./variant-pool-private/',import.meta.url);
mkdirSync(directory,{recursive:true});
const started=new Date().toISOString(),began=performance.now(),workers=[],samples=[],warmups=[],tasks=[];
let phase='initial',peakRssBytes=process.memoryUsage().rss;
const sample=()=>{const memory=process.memoryUsage();peakRssBytes=Math.max(peakRssBytes,memory.rss);
  samples.push({seconds:(performance.now()-began)/1000,phase,rssBytes:memory.rss,mainHeapUsedBytes:memory.heapUsed});};
const timer=setInterval(sample,25);sample();
const sourcePaths=['.work/variant-pool-worker.mjs','.work/variant-pool-memory.mjs','scripts/league-worker.mjs',
  ...['american','international'].flatMap(variant=>['core','bots','endgame'].map(name=>'dist/'+name+'-'+variant+'.mjs'))];
const sourceHashes=()=>sourcePaths.map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
const inputsBefore=sourceHashes();
const getMessage=(worker,predicate)=>new Promise((resolve,reject)=>{
  const cleanup=()=>{worker.off('message',onMessage);worker.off('error',onError);worker.off('exit',onExit);};
  const onMessage=message=>{if(predicate(message)){cleanup();resolve(message);}};
  const onError=error=>{cleanup();reject(error);};
  const onExit=code=>{cleanup();reject(new Error('Worker exited before expected reply: '+code));};
  worker.on('message',onMessage);worker.on('error',onError);worker.on('exit',onExit);
});
let status='INCOMPLETE',error=null;
try{
  // Prewarm the two International isolates sequentially. Each is restricted to its assigned variant.
  for(const variant of ['international','international','american','american']){
    const index=workers.length;phase='prewarm-'+index+'-'+variant;
    const worker=new Worker(new URL('./variant-pool-worker.mjs',import.meta.url),{workerData:{variant,index}});
    workers.push({worker,variant,index});
    const ready=await getMessage(worker,message=>message.kind==='ready');
    assert.equal(ready.variant,variant);assert.equal(ready.index,index);warmups.push(ready);sample();
  }
  for(const [higher,lower] of [['normal','easy'],['sharp','normal']]){
    phase='concurrent-'+higher+'-'+lower;sample();
    const batch=await Promise.all(workers.map(async({worker,variant,index})=>{
      const start=(index%2)*2,task={variant,higher,lower,start,end:start+2};
      const waiting=getMessage(worker,message=>message.task!==undefined);worker.postMessage(task);
      const result=await waiting;assert.deepEqual(result.task,task);assert.equal(result.records.length,2);
      const transcript=createHash('sha256');
      for(const record of result.records){assert.equal(record.variant,variant);assert(record.plies>0);transcript.update(JSON.stringify(record));}
      writeFileSync(new URL('task-'+index+'-'+higher+'-'+lower+'.jsonl',directory),result.records.map(record=>JSON.stringify(record)).join('\n')+'\n');
      return {workerIndex:index,...task,games:result.records.length,wins:result.wins,draws:result.draws,
        losses:result.losses,plies:result.records.map(record=>record.plies),elapsedSeconds:result.elapsedSeconds,
        transcriptSha256:transcript.digest('hex')};
    }));tasks.push(...batch);sample();
  }
  assert.equal(tasks.reduce((sum,task)=>sum+task.games,0),16);status='PASS';
}catch(caught){error=String(caught.stack??caught);process.exitCode=1;}
finally{
  phase='closing';await Promise.all(workers.map(({worker})=>worker.terminate()));sample();clearInterval(timer);
  const inputsAfter=sourceHashes();assert.deepEqual(inputsAfter,inputsBefore);
  const record={status,error,startedAt:started,closedAt:new Date().toISOString(),elapsedSeconds:(performance.now()-began)/1000,
    runtime:process.version,command:process.argv,scope:'Private resource experiment: two dedicated International plus two American isolates; sequential International prewarm; 16 paired actual existing league-worker games, no league source edits or canonical league claim.',
    peakRssBytes,samples:warmups.length,warmups,tasks,inputsBefore,inputsAfter,allInputsUnchanged:true,
    limitations:'Whole-process RSS includes all four Worker heaps but excludes unrelated processes. Timing is not a controlled comparison; raw RSS samples permit separate transient warmup and active-search peaks.'};
  writeFileSync(new URL('rss-samples.json',directory),JSON.stringify(samples,null,2)+'\n');
  writeFileSync(new URL('report.json',directory),JSON.stringify(record,null,2)+'\n');
  process.stdout.write(JSON.stringify(record)+'\n');
}
