// Host-only coordination; no game or owner asset imports.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {setTimeout as delay} from 'node:timers/promises';
export const frameProfiles=['en-4x4-TV','en-4x4-phone-4x','es-5x5-TV','es-5x5-phone-4x'] as const;
export type FrameProfile=typeof frameProfiles[number];
export function parseFrameGrantTimeout(value:string|undefined){
 if(value===undefined)return 600000;
 assert(/^[0-9]+$/.test(value),'grant timeout must be an integer in milliseconds');const parsed=Number(value);
 assert(Number.isSafeInteger(parsed)&&parsed>=600000&&parsed<=3600000,'grant timeout must be 600000..3600000ms');return parsed;
}
export async function waitForFrameGrant(directory:string,profile:FrameProfile,sourceSha256:string,timeoutMs=600000){
 assert(frameProfiles.includes(profile));assert(/^[0-9a-f]{64}$/.test(sourceSha256));assert(Number.isFinite(timeoutMs)&&timeoutMs>0);
 const attemptNonce=randomUUID(),readyPath=join(directory,`${profile}-ready.json`),grantPath=join(directory,`${profile}-grant.json`);
 await mkdir(directory,{recursive:true});
 await Promise.all([readyPath,grantPath,join(directory,`${profile}-closed.json`)].map(p=>rm(p,{force:true})));
 const ready={profile,sourceSha256,attemptNonce,readyAt:new Date().toISOString(),grantTimeoutMs:timeoutMs,frames:600,meanFpsMinimum:59,p95MsMaximum:20,capturing:false};
 const temporary=join(directory,`${profile}-${attemptNonce}.tmp`);await writeFile(temporary,JSON.stringify(ready)+'\n',{flag:'wx'});await rename(temporary,readyPath);
 const started=performance.now();
 for(;;){
  assert(performance.now()-started<timeoutMs,'frame grant timeout');
  let text:string;try{text=await readFile(grantPath,'utf8');}catch(error){if(!(error&&typeof error==='object'&&'code' in error&&error.code==='ENOENT'))throw error;await delay(100);continue;}
  const parsed:unknown=JSON.parse(text);assert(parsed&&typeof parsed==='object'&&!Array.isArray(parsed));const grant=parsed as Record<string,unknown>;
  assert.deepEqual(Object.keys(grant).sort(),['attemptNonce','profile','sourceSha256']);assert.equal(grant.profile,profile);assert.equal(grant.sourceSha256,sourceSha256);assert.equal(grant.attemptNonce,attemptNonce,'stale frame grant rejected');
  return ready;
 }
}
