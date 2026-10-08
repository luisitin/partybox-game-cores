import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,rename,rm} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

// Host-only coordination. No code here is bundled into the game or fake clock.
export async function waitForFrameWindow(folder,profile,sourceSha256,timeoutMs=180000){
  if(!folder)return null;
  assert(['desktop','phone4x'].includes(profile));assert.match(sourceSha256,/^[a-f0-9]{64}$/);
  const path=resolve(folder);await mkdir(path,{recursive:true});
  for(const suffix of ['ready','grant','closed'])await rm(resolve(path,`${profile}-${suffix}.json`),{force:true});
  const attemptNonce=randomUUID(),expected={profile,sourceSha256,attemptNonce};
  const ready={...expected,readyAt:new Date().toISOString(),samplingRecording:false,count:600,minFps:59,maxP99Ms:17};
  const tmp=resolve(path,`${profile}-ready-${attemptNonce}.tmp`);await writeFile(tmp,JSON.stringify(ready,null,2)+'\n');await rename(tmp,resolve(path,`${profile}-ready.json`));
  const started=performance.now();
  while(performance.now()-started<timeoutMs){
    try{
      const grant=JSON.parse(await readFile(resolve(path,`${profile}-grant.json`),'utf8'));
      if(grant&&typeof grant==='object'&&!Array.isArray(grant)&&Object.keys(grant).sort().join(',')==='attemptNonce,profile,sourceSha256'&&Object.entries(expected).every(([key,value])=>grant[key]===value))return {...expected,folder:path,grantedAt:new Date().toISOString()};
    }catch(error){if(error?.code!=='ENOENT'&&!(error instanceof SyntaxError))throw error;}
    await delay(20);
  }
  throw new Error(`${profile}: no matching fresh frame-window grant within ${timeoutMs}ms`);
}

export async function closeFrameWindow(window,summary){
  if(!window)return;
  const {folder,...identity}=window,receipt={...identity,closedAt:new Date().toISOString(),...summary};
  const tmp=resolve(folder,`${window.profile}-closed-${window.attemptNonce}.tmp`);await writeFile(tmp,JSON.stringify(receipt,null,2)+'\n');await rename(tmp,resolve(folder,`${window.profile}-closed.json`));
}
