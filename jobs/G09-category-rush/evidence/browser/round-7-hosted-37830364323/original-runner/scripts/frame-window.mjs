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

// Validate the actual visible workload independently of the RAF frame gate.
// This runs after sampling; it does not replace, filter or repair timestamps.
export function summarizeFrameWorkload(witnesses,nativeDate){
  const seconds=witnesses.map(row=>{
    const match=/^(\d+):([0-5]\d)$/.exec(row.timerText??'');
    return match?Number(match[1])*60+Number(match[2]):NaN;
  });
  const first=witnesses[0],last=witnesses.at(-1),wallElapsedMs=(last?.wallMs??NaN)-(first?.wallMs??NaN);
  const deadlineUpperMs=(first?.wallMs??NaN)+seconds[0]*1000;
  const validWalls=witnesses.every((row,n)=>Number.isSafeInteger(row.wallMs)&&row.wallMs>=0&&(!n||row.wallMs>=witnesses[n-1].wallMs));
  const visibleAnswerEveryCallback=witnesses.every(row=>row.answerFormVisible===true&&row.modalAbsent===true);
  const liveTimerEveryCallback=seconds.every((value,n)=>Number.isFinite(value)&&value>0&&value<=60&&(!n||value<=seconds[n-1]));
  const deadlineConsistent=seconds.every((value,n)=>Math.abs(value*1000-(deadlineUpperMs-witnesses[n].wallMs))<=1200);
  const timerAdvanced=seconds[0]>seconds.at(-1);
  const passed=witnesses.length===601&&nativeDate===true&&validWalls&&visibleAnswerEveryCallback&&liveTimerEveryCallback&&wallElapsedMs>=1000&&timerAdvanced&&deadlineConsistent;
  return {passed,method:'Visible answer form, no modal and native Date.now/timer on every601 real RAF callback; checked after all600 unfiltered deltas',nativeDate,witnessCount:witnesses.length,validWalls,visibleAnswerEveryCallback,liveTimerEveryCallback,timerAdvanced,deadlineConsistent,wallElapsedMs,firstWallMs:first?.wallMs,lastWallMs:last?.wallMs,timerStartSeconds:seconds[0],timerEndSeconds:seconds.at(-1),deadlineUpperMs};
}
