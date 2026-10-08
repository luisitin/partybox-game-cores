import {parentPort,workerData} from 'node:worker_threads';
import {Session} from 'node:inspector';
import {writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';

const importBegan=performance.now();
await import('../../dist/core-international.mjs');
await import('../../scripts/league-worker.mjs');
const session=new Session();session.connect();
const post=(name,parameters={})=>new Promise((resolve,reject)=>session.post(name,parameters,(error,result)=>error?reject(error):resolve(result)));
await post('Profiler.enable');await post('Profiler.setSamplingInterval',{interval:1000});await post('Profiler.start');
const startedAt=new Date().toISOString();
workerData.control.on('message',async message=>{
  if(message.kind!=='stop-profile')return;
  try{
    const {profile}=await post('Profiler.stop');const closedAt=new Date().toISOString();
    await writeFile(workerData.profilePath,JSON.stringify(profile)+'\n');
    workerData.control.postMessage({kind:'profile-finished',startedAt,closedAt,samples:profile.samples?.length??0});
  }catch(error){workerData.control.postMessage({kind:'profile-error',error:String(error.stack??error)});}
  finally{session.disconnect();workerData.control.close();}
});
parentPort.postMessage({kind:'profile-ready',importSeconds:(performance.now()-importBegan)/1000,startedAt});
