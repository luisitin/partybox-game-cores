import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('actual capture CLI refuses invalid tags and existing media/report before any browser launch',()=>{
 const paths=['media/round-12-final-review-desktop.webm','media/round-12-final-review-phone4x.webm','evidence/resume-20261008/round-12-final-review-captures.json'];
 const hashes=()=>paths.map(path=>createHash('sha256').update(readFileSync(path)).digest('hex'));
 const before=hashes();
 for(const tag of ['../unsafe','round-12-final-review']){
  const child=spawnSync(process.execPath,['scripts/capture.mjs',tag],{encoding:'utf8',timeout:15000});
  assert.equal(child.status,1);assert.equal(child.stdout,'','refusal must precede launch/start logging');
  assert.match(child.stderr,tag==='../unsafe'?/AssertionError/:/refusing to overwrite actual capture/);
 }
 assert.deepEqual(hashes(),before);
});
