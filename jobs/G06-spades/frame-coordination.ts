import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {setTimeout as delay} from 'node:timers/promises';

export type FrameProfile='TV'|'phone-4x';
export interface FrameReady {
 readonly profile:FrameProfile;
 readonly readyAt:string;
 readonly sourceSha256:string;
 readonly attemptNonce:string;
 readonly frames:900;
 readonly meanFpsMinimum:59;
 readonly p95MsMaximum:18;
}
export interface FrameGrant {
 readonly profile:FrameProfile;
 readonly sourceSha256:string;
 readonly attemptNonce:string;
}
export interface FrameCoordinationOptions {
 readonly directory:string;
 readonly profile:FrameProfile;
 readonly sourceSha256:string;
 /** Waiting bounds only; these never alter sampling or acceptance gates. */
 readonly timeoutMs?:number;
 readonly pollMs?:number;
}
const isMissing=(error:unknown)=>error!==null&&typeof error==='object'&&'code' in error&&error.code==='ENOENT';

/** Host/tooling only. One active call per directory/profile; use separate attempt directories for concurrent runners. */
export async function waitForFrameGrant(options:FrameCoordinationOptions):Promise<FrameReady> {
 const {directory,profile,sourceSha256,timeoutMs=10*60*1000,pollMs=100}=options;
 assert(typeof directory==='string'&&directory.trim().length>0,'frame coordination directory required');
 assert(profile==='TV'||profile==='phone-4x','known frame profile required');
 assert(typeof sourceSha256==='string'&&/^[0-9a-f]{64}$/.test(sourceSha256),'frame source SHA-256 required');
 assert(Number.isFinite(timeoutMs)&&timeoutMs>0,'positive frame coordination timeout required');
 assert(Number.isFinite(pollMs)&&pollMs>0,'positive frame poll interval required');
 const attemptNonce=randomUUID(),readyPath=join(directory,`${profile}-ready.json`),grantPath=join(directory,`${profile}-grant.json`);
 await mkdir(directory,{recursive:true});
 // Remove only this profile's obsolete coordination markers, never raw/browser evidence or the other profile's files.
 await Promise.all([readyPath,grantPath,join(directory,`${profile}-closed.json`)].map(path=>rm(path,{force:true})));
 const ready:FrameReady={profile,readyAt:new Date().toISOString(),sourceSha256,attemptNonce,frames:900,meanFpsMinimum:59,p95MsMaximum:18};
 const temporary=join(directory,`${profile}-ready-${attemptNonce}.tmp`);
 try {
  await writeFile(temporary,JSON.stringify(ready)+'\n',{flag:'wx'});
  await rename(temporary,readyPath);
 } finally {
  await rm(temporary,{force:true});
 }
 const started=performance.now();
 for(;;) {
  const remaining=timeoutMs-(performance.now()-started);
  assert(remaining>0,'frame coordination timed out');
  let text:string;
  try {text=await readFile(grantPath,'utf8');}
  catch(error) {if(!isMissing(error))throw error;await delay(Math.min(pollMs,remaining));continue;}
  const parsed:unknown=JSON.parse(text);
  assert(parsed!==null&&typeof parsed==='object'&&!Array.isArray(parsed),'frame grant object required');
  const grant=parsed as Record<string,unknown>;
  assert.deepEqual(Object.keys(grant).sort(),['attemptNonce','profile','sourceSha256'],'exact frame grant fields required');
  assert.equal(grant.profile,profile,'frame grant profile mismatch');
  assert.equal(grant.sourceSha256,sourceSha256,'frame grant source hash mismatch');
  assert.equal(grant.attemptNonce,attemptNonce,'frame grant attempt nonce mismatch; stale grant rejected');
  return ready;
 }
}
