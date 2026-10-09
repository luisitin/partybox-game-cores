import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';

export async function writeAtomic(path,value) {
  const temp=path+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(value,null,2)+'\n');await rename(temp,path);
}
export async function waitForFrameGrant({directory,profile,sourceSha256,timeoutMs=600000}) {
  if(!directory)return null;
  assert(['desktop','phone4x'].includes(profile));assert(/^[0-9a-f]{64}$/.test(sourceSha256));
  assert(Number.isFinite(timeoutMs)&&timeoutMs>=0);
  directory=resolve(directory);await mkdir(directory,{recursive:true});
  const ready=resolve(directory,profile+'.ready.json'), grant=resolve(directory,profile+'.grant.json'),closed=resolve(directory,profile+'.closed.json');
  await Promise.all([ready,grant,closed].map(p=>rm(p,{force:true})));
  const identity={profile,sourceSha256,attemptNonce:randomUUID()};
  await writeAtomic(ready,{...identity,readyAt:new Date().toISOString(),intervals:600,minimumMeanFps:59,maximumP99Ms:17});
  const start=performance.now();
  while(performance.now()-start<=timeoutMs) {
    try {
      const value=JSON.parse(await readFile(grant,'utf8'));
      if(value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).sort().join(',')==='attemptNonce,profile,sourceSha256' && Object.entries(identity).every(([key,v])=>value[key]===v))return {directory,...identity};
    } catch(error) { if(error.code && error.code!=='ENOENT')throw error; }
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  await writeAtomic(closed,{...identity,closedAt:new Date().toISOString(),sampled:false,passed:false,reason:'matching grant timed out'});
  throw new Error('Timed out waiting for exact '+profile+' frame grant');
}
export async function closeFrameGrant(token,fields) {
  if(token)await writeAtomic(resolve(token.directory,token.profile+'.closed.json'),{profile:token.profile,sourceSha256:token.sourceSha256,attemptNonce:token.attemptNonce,closedAt:new Date().toISOString(),...fields});
}
