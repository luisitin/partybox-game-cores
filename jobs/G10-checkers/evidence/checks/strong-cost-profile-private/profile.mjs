import assert from 'node:assert/strict';
import {Worker,MessageChannel} from 'node:worker_threads';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {resolve} from 'node:path';

const directory=resolve('.work/strong-cost-profile-private');await mkdir(directory,{recursive:true});
const hash=async path=>{const result=createHash('sha256');for await(const bytes of createReadStream(path))result.update(bytes);return result.digest('hex');};
const goldPath='evidence/checks/league-dedicated-pool-pilot/international-sharp-normal-0000.jsonl';
const inputPaths=['.work/strong-cost-profile-private/profile.mjs','.work/strong-cost-profile-private/worker.mjs',
  'scripts/league-worker.mjs','src/bots.ts','src/moves.ts','src/core.ts','dist/core-international.mjs',
  'dist/bots-international.mjs','dist/endgame-international.mjs','dist/core.mjs','dist/bots.mjs','dist/endgame.mjs',
  'data/international/manifest.json','data/international/six/manifest.json',goldPath,process.execPath];
const inputs=async()=>Promise.all(inputPaths.map(async path=>({path,sha256:await hash(path)})));
const record={status:'RUNNING',startedAt:new Date().toISOString(),runtime:process.version,command:process.argv,
  scope:'Private 1ms inspector CPU sampling of four exact International Strong/Medium pilot games using the unchanged existing league-worker game body. Profiler starts after full corpus import; no performance, CI or canonical-league claim.'};
record.inputsBefore=await inputs();const gold=await readFile(goldPath,'utf8');
const task={variant:'international',higher:'sharp',lower:'normal',start:0,end:4};
const {port1,port2}=new MessageChannel();let worker;
const waiting=(emitter,predicate)=>new Promise((resolveMessage,reject)=>{
  const message=record=>{if(predicate(record)){cleanup();resolveMessage(record);}};
  const failed=error=>{cleanup();reject(error);};const exited=code=>failed(new Error('Worker exited before expected message: '+code));
  const cleanup=()=>{emitter.off('message',message);emitter.off('error',failed);emitter.off('exit',exited);};
  emitter.on('message',message);emitter.on('error',failed);if(emitter instanceof Worker)emitter.on('exit',exited);
});
try{
  worker=new Worker(new URL('./worker.mjs',import.meta.url),{workerData:{variant:'international',control:port2,
    profilePath:directory+'/cpu-profile.json'},transferList:[port2]});
  record.profileReady=await waiting(worker,message=>message.kind==='profile-ready');
  record.gameStartedAt=new Date().toISOString();const began=performance.now();
  const finished=waiting(worker,message=>message.task!==undefined);worker.postMessage(task);const result=await finished;
  record.gameClosedAt=new Date().toISOString();record.parentObservedGameWallSeconds=(performance.now()-began)/1000;
  assert.deepEqual(result.task,task);assert.equal(result.records.length,4);
  const raw=result.records.map(value=>JSON.stringify(value)).join('\n')+'\n';
  await writeFile(directory+'/actual-games.jsonl',raw);await writeFile(directory+'/game-result.json',JSON.stringify(result,null,2)+'\n');
  assert.equal(raw,gold,'Every original pilot record, including every move and terminal field, must match byte-for-byte');
  record.exactGameRecordsMatch=true;record.gameRecordsSha256=createHash('sha256').update(raw).digest('hex');
  const stopped=waiting(port1,message=>message.kind==='profile-finished'||message.kind==='profile-error');port1.postMessage({kind:'stop-profile'});
  record.profile=await stopped;assert.equal(record.profile.kind,'profile-finished',record.profile.error);
  const profile=JSON.parse(await readFile(directory+'/cpu-profile.json','utf8')),nodes=new Map(profile.nodes.map(node=>[node.id,node])),self=new Map();
  for(let at=0;at<(profile.samples??[]).length;at++)self.set(profile.samples[at],(self.get(profile.samples[at])??0)+(profile.timeDeltas[at]??0)/1000);
  const cumulative=new Map(),inclusive=id=>{if(cumulative.has(id))return cumulative.get(id);const node=nodes.get(id);
    const value=(self.get(id)??0)+(node.children??[]).reduce((sum,child)=>sum+inclusive(child),0);cumulative.set(id,value);return value;};
  for(const node of profile.nodes)inclusive(node.id);
  const top=map=>[...map].sort((a,b)=>b[1]-a[1]).slice(0,50).map(([id,milliseconds])=>({id,milliseconds,callFrame:nodes.get(id).callFrame}));
  record.topSelf=top(self);record.topCumulative=top(cumulative);record.cpuSampleCount=profile.samples?.length??0;
  record.profileDurationMs=(profile.endTime-profile.startTime)/1000;
  record.nodeHitBudgetCursorNote='Inspector observes execution only. The existing game body, game/RNG modules and fixed-budget bot source are unmodified. The league records do not contain search node/hit totals or final cursor steps; those quantities are not invented here.';
  record.timingNote='Original game-result elapsedSeconds is raw instrumented wall time. Any actual whole-group holds are separately retained and subtracted only in a derived receipt.';
  record.status='PASS_EXACT_RECORDS_PROFILE';
}catch(error){record.status='INCOMPLETE';record.failure=String(error.stack??error);process.exitCode=2;}
finally{
  port1.close();if(worker)await worker.terminate();record.inputsAfter=await inputs();record.allInputsUnchanged=JSON.stringify(record.inputsBefore)===JSON.stringify(record.inputsAfter);
  if(!record.allInputsUnchanged){record.status='INCOMPLETE';process.exitCode=2;}record.closedAt=new Date().toISOString();
  await writeFile(directory+'/report.json',JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify({...record,topSelf:record.topSelf?.slice(0,12),topCumulative:record.topCumulative?.slice(0,12)}));
}
