import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
// Host-only MJS helper deliberately supplies no game state or timestamps.
// @ts-expect-error development coordination has no separate declaration file
import {waitForFrameWindow,closeFrameWindow,summarizeFrameWorkload} from '../scripts/frame-window.mjs';

async function ready(folder:string,previousNonce?:string){
  for(let n=0;n<100;n++){try{const value=JSON.parse(await readFile(join(folder,'desktop-ready.json'),'utf8'));if(value.attemptNonce!==previousNonce)return value;}catch{}await delay(5);}
  throw new Error('READY did not arrive');
}
test('only an exact fresh grant authorizes a frame window; closure preserves actual summary',async()=>{
  const folder=await mkdtemp(join(tmpdir(),'g09-frame-'));
  try{
    const source='a'.repeat(64);await writeFile(join(folder,'desktop-grant.json'),JSON.stringify({profile:'desktop',sourceSha256:source,attemptNonce:'old'}));
    await writeFile(join(folder,'phone4x-ready.json'),'untouched');
    let settled=false;const pending=waitForFrameWindow(folder,'desktop',source,5000).then((result:unknown)=>{settled=true;return result;});
    const row=await ready(folder);assert.equal(row.count,600);assert.equal(row.minFps,59);assert.equal(row.maxP99Ms,17);assert.match(row.attemptNonce,/^[0-9a-f-]{36}$/);
    const base={profile:row.profile,sourceSha256:row.sourceSha256,attemptNonce:row.attemptNonce};
    for(const invalid of ['{',JSON.stringify(null),JSON.stringify([]),JSON.stringify({...base,attemptNonce:'old'}),JSON.stringify({...base,profile:'phone4x'}),JSON.stringify({...base,sourceSha256:'b'.repeat(64)}),JSON.stringify({...base,extra:true}),JSON.stringify({profile:'desktop',sourceSha256:source})]){
      await writeFile(join(folder,'desktop-grant.json'),invalid);await delay(45);assert.equal(settled,false,'wrong/malformed grant never authorizes frames');
    }
    await writeFile(join(folder,'desktop-grant.json'),JSON.stringify(base));const window=await pending;
    await closeFrameWindow(window,{count:600,fps:58,passed:false,recordingDuringMeasurement:false});
    const closed=JSON.parse(await readFile(join(folder,'desktop-closed.json'),'utf8'));assert.equal(closed.attemptNonce,row.attemptNonce);assert.equal(closed.count,600);assert.equal(closed.fps,58);assert.equal(closed.passed,false);
    assert.equal(await readFile(join(folder,'phone4x-ready.json'),'utf8'),'untouched');
    const timeout=waitForFrameWindow(folder,'desktop',source,80);const rejected=assert.rejects(timeout,/no matching fresh/);const next=await ready(folder,row.attemptNonce);assert.notEqual(next.attemptNonce,row.attemptNonce);await rejected;
  }finally{await rm(folder,{recursive:true,force:true});}
});
test('CI without local coordination performs no waits or disk marker work',async()=>{
  assert.equal(await waitForFrameWindow(undefined,'desktop','a'.repeat(64)),null);await closeFrameWindow(null,{passed:true});
});

test('every native callback must retain a visible private answer form and an advancing real timer',()=>{
  const initialWall=Date.UTC(2026,9,8,18,0,0);
  const witnesses=Array.from({length:601},(_,n)=>{const left=60-Math.floor(n/60);return {wallMs:initialWall+Math.round(n*1000/60),answerFormVisible:true,modalAbsent:true,timerText:`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`};});
  const good=summarizeFrameWorkload(witnesses,true);assert.equal(good.passed,true);assert.equal(good.wallElapsedMs,10000);assert.equal(good.timerStartSeconds,60);assert.equal(good.timerEndSeconds,50);
  for(const index of [0,1,299,599,600])for(const change of [{answerFormVisible:false},{modalAbsent:false},{timerText:'0:00'},{timerText:'invalid'}]){
    const rows=structuredClone(witnesses);Object.assign(rows[index],change);assert.equal(summarizeFrameWorkload(rows,true).passed,false,`invalid callback${index}/${JSON.stringify(change)}`);
  }
  assert.equal(summarizeFrameWorkload(witnesses,false).passed,false,'non-native clock rejected');
  assert.equal(summarizeFrameWorkload(witnesses.slice(1),true).passed,false,'all601 callbacks required');
  const paused=structuredClone(witnesses);for(const row of paused)row.timerText='1:00';assert.equal(summarizeFrameWorkload(paused,true).passed,false,'stopped player timer rejected');
  const clockBack=structuredClone(witnesses);clockBack[300].wallMs=initialWall-1;assert.equal(summarizeFrameWorkload(clockBack,true).passed,false,'backward wall clock rejected');
  const jumped=structuredClone(witnesses);jumped[300].timerText='0:30';assert.equal(summarizeFrameWorkload(jumped,true).passed,false,'timer outside the actual deadline rejected');
  const fake=structuredClone(witnesses);for(const row of fake)row.wallMs=initialWall;assert.equal(summarizeFrameWorkload(fake,true).passed,false,'frozen wall clock rejected even with plausible timer labels');
});
