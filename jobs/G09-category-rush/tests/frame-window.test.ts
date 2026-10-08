import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
// Host-only MJS helper deliberately supplies no game state or timestamps.
// @ts-expect-error development coordination has no separate declaration file
import {waitForFrameWindow,closeFrameWindow} from '../scripts/frame-window.mjs';

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
