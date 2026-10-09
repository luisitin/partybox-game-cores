import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,mkdirSync,createReadStream} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const directory=resolve('.work/international-four-pool-private');mkdirSync(directory,{recursive:true});
const GiB=1024**3,guards={maximumProcessRssBytes:9*GiB,minimumHostMemAvailableBytes:1.5*GiB,
  minimumCgroupReclaimAwareHeadroomBytes:1.5*GiB,samplingIntervalMs:100};
const keyValues=path=>Object.fromEntries(readFileSync(path,'utf8').trim().split('\n').map(line=>{const [key,value]=line.trim().split(/\s+/);return [key.replace(/:$/,''),Number(value)];}));
function memory(){
  const proc=keyValues('/proc/self/status'),host=keyValues('/proc/meminfo'),stat=keyValues('/sys/fs/cgroup/memory.stat'),
    current=Number(readFileSync('/sys/fs/cgroup/memory.current','utf8')),rawLimit=readFileSync('/sys/fs/cgroup/memory.max','utf8').trim(),limit=rawLimit==='max'?null:Number(rawLimit),
    ordinaryFileLru=(stat.active_file??0)+(stat.inactive_file??0),nonreclaimableEstimate=Math.max(0,current-ordinaryFileLru);
  return {rssBytes:(proc.VmRSS??0)*1024,kernelProcessPeakRssBytes:(proc.VmHWM??0)*1024,hostMemAvailableBytes:(host.MemAvailable??0)*1024,
    cgroup:{currentBytes:current,limitBytes:limit,anonBytes:stat.anon,fileBytes:stat.file,shmemBytes:stat.shmem,
      activeFileBytes:stat.active_file,inactiveFileBytes:stat.inactive_file,ordinaryFileLruBytes:ordinaryFileLru,
      nonreclaimableEstimateBytes:nonreclaimableEstimate,reclaimAwareHeadroomBytes:limit===null?null:limit-nonreclaimableEstimate,
      events:readFileSync('/sys/fs/cgroup/memory.events','utf8')}};
}
const paths=['.work/international-four-pool-private/probe.mjs','scripts/league-worker.mjs','dist/core-international.mjs',
  'dist/bots-international.mjs','dist/endgame-international.mjs','data/international/manifest.json','data/international/six/manifest.json',
  'evidence/checks/league-dedicated-pool-pilot/international-sharp-normal-0000.jsonl',
  'evidence/checks/league-dedicated-pool-pilot/international-normal-easy-0000.jsonl',process.execPath];
const hashes=async()=>{const rows=[];for(const path of paths){const digest=createHash('sha256');for await(const bytes of createReadStream(path))digest.update(bytes);rows.push({path,sha256:digest.digest('hex')});}return rows;};
const report={status:'RUNNING',startedAt:new Date().toISOString(),runtime:process.version,command:process.argv,guards,
  scope:'Private local 16GiB resource trial: four unchanged public International league-worker isolates; sequential prewarm and eight exact pilot records. No public pool adoption, performance or CI-fit claim.',warmups:[],tasks:[]};
report.inputsBefore=await hashes();const began=performance.now(),workers=[],samples=[];let phase='initial',guardFired=null,guardReject;
const guardFailed=new Promise((_,reject)=>{guardReject=reject;});guardFailed.catch(()=>{});
function sample(){
  const snapshot=memory();samples.push({seconds:(performance.now()-began)/1000,phase,...snapshot});
  if(guardFired||phase==='closing')return;
  const causes=[];if(snapshot.rssBytes>guards.maximumProcessRssBytes)causes.push('process RSS exceeds 9 GiB');
  if(snapshot.hostMemAvailableBytes<guards.minimumHostMemAvailableBytes)causes.push('host MemAvailable below 1.5 GiB');
  if(snapshot.cgroup.reclaimAwareHeadroomBytes!==null&&snapshot.cgroup.reclaimAwareHeadroomBytes<guards.minimumCgroupReclaimAwareHeadroomBytes)causes.push('cgroup reclaim-aware headroom below 1.5 GiB');
  if(causes.length){guardFired={at:new Date().toISOString(),phase,causes,snapshot};guardReject(new Error('MEMORY_GUARD_INCOMPLETE: '+causes.join('; ')));}
}
const waitMessage=(worker,predicate)=>Promise.race([guardFailed,new Promise((resolveMessage,reject)=>{
  const message=value=>{if(predicate(value)){cleanup();resolveMessage(value);}};const failed=error=>{cleanup();reject(error);};
  const exited=code=>failed(new Error('Worker exited before expected response: '+code));
  const cleanup=()=>{worker.off('message',message);worker.off('error',failed);worker.off('exit',exited);};
  worker.on('message',message);worker.on('error',failed);worker.on('exit',exited);
})]);
const timer=setInterval(sample,guards.samplingIntervalMs);sample();report.initialMemory=memory();
try{
  for(let index=0;index<4;index++){
    phase='prewarm-'+index;sample();if(guardFired)throw new Error('Memory guard fired before next isolate');
    const worker=new Worker(new URL('../../scripts/league-worker.mjs',import.meta.url),{workerData:{variant:'international'}});workers.push(worker);
    const ready=await waitMessage(worker,value=>value.kind==='ready');assert.equal(ready.variant,'international');
    report.warmups.push({index,...ready,memory:memory()});sample();
    writeFileSync(directory+'/partial.json',JSON.stringify(report,null,2)+'\n');
  }
  phase='active-eight-games';sample();
  report.tasks=await Promise.all(workers.map(async(worker,index)=>{
    const higher=index<2?'sharp':'normal',lower=index<2?'normal':'easy',start=(index%2)*2,
      task={variant:'international',higher,lower,start,end:start+2},waiting=waitMessage(worker,value=>value.task!==undefined);
    worker.postMessage(task);const result=await waiting;assert.deepEqual(result.task,task);assert.equal(result.records.length,2);
    const allGold=readFileSync('evidence/checks/league-dedicated-pool-pilot/international-'+higher+'-'+lower+'-0000.jsonl','utf8').trim().split('\n').map(line=>JSON.parse(line)),
      expected=allGold.filter(record=>record.index>=start&&record.index<start+2),raw=result.records.map(record=>JSON.stringify(record)).join('\n')+'\n';
    assert.equal(raw,expected.map(record=>JSON.stringify(record)).join('\n')+'\n');
    writeFileSync(directory+'/task-'+index+'-'+higher+'-'+lower+'.jsonl',raw);sample();
    return {index,task,records:2,byteIdenticalGold:true,recordSha256:createHash('sha256').update(raw).digest('hex'),
      plies:result.records.map(record=>record.plies),rawInstrumentedWallSeconds:result.elapsedSeconds};
  }));assert.equal(report.tasks.reduce((sum,task)=>sum+task.records,0),8);report.status='PASS_LOCAL_EXACT_RECORDS';
}catch(error){report.status='INCOMPLETE';report.failure=String(error.stack??error);process.exitCode=2;}
finally{
  phase='closing';report.beforeTerminationMemory=memory();await Promise.all(workers.map(worker=>worker.terminate()));sample();clearInterval(timer);
  report.guardFired=guardFired;report.finalMemory=memory();report.wholeProcessPeakRssKiB=process.resourceUsage().maxRSS;
  report.sampledProcessPeakRssBytes=Math.max(...samples.map(sample=>sample.rssBytes));report.rssSampleCount=samples.length;
  report.closedAt=new Date().toISOString();report.elapsedSeconds=(performance.now()-began)/1000;report.inputsAfter=await hashes();
  report.allInputsUnchanged=JSON.stringify(report.inputsBefore)===JSON.stringify(report.inputsAfter);if(!report.allInputsUnchanged){report.status='INCOMPLETE';process.exitCode=2;}
  report.nominal7GiBNote=report.wholeProcessPeakRssKiB*1024>7*GiB?'Observed process peak alone exceeds 7 GiB; this trial does not support a 7 GiB CI host.':'Observed process peak alone is below 7 GiB; other host memory and actual CI run remain unmeasured.';
  report.guardNotes='Cgroup current is retained raw. Reclaim-aware headroom subtracts only ordinary active/inactive file LRU, never shmem; reclaimability is an estimate. A guard firing is INCOMPLETE, never a projection-based PASS. Sampling can miss brief transients; kernel/process-resource peak is retained.';
  writeFileSync(directory+'/rss-cgroup-samples.json',JSON.stringify(samples,null,2)+'\n');writeFileSync(directory+'/report.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,inputsBefore:undefined,inputsAfter:undefined}));
}
