import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const script=process.env.G06_CAPTURE_TEST_SCRIPT??'capture.ts',milestone=process.env.G06_CAPTURE_TEST_MILESTONE??'13';
const paths=[`media/milestone-${milestone}-pinned-encoder.webm`,`capture-milestone-${milestone}-report.json`];
const snapshot=()=>Object.fromEntries(paths.map(path=>[path,{bytes:readFileSync(path).length,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}]));
const before=snapshot();let controls=0;
function refused(args:string[],pattern:RegExp){
 const result=spawnSync(process.execPath,[script,...args],{encoding:'utf8',timeout:10000});
 assert.equal(result.error,undefined,'must actually execute; no timeout/tool errors counted');assert.equal(result.signal,null,'must exit rather than be killed');assert.equal(result.status,1,'argument/collision guard must reject before capture');assert.match(result.stderr,pattern);assert.deepEqual(snapshot(),before,'both genuine existing media and metadata must remain byte-identical');controls++;
}
test('repeat of the actual published milestone refuses overwrite and preserves both files',()=>refused([`--milestone=${milestone}`],/refusing to overwrite an existing capture milestone/));
test('missing, extra and repeated arguments cannot silently select a previous milestone',()=>{
 for(const args of [[],[`--milestone=${milestone}`,'--unknown'],[`--milestone=${milestone}`,`--milestone=${milestone}`]])refused(args,/supply exactly one --milestone/);
});
test('invalid milestone values reject without browser or media production',()=>{
 for(const invalid of ['0','-1','1.5','0013','10000','13x',''])refused([`--milestone=${invalid}`],/valid --milestone/);
 refused(['--unknown'],/valid --milestone/);
});
after(()=>console.log('G06_CAPTURE_PREFLIGHT_CONTROLS '+JSON.stringify({script,milestone,negativeControls:controls,actualExistingFiles:before,unchanged:true,scope:'Real CLI rejection and existing byte preservation; no new capture or FPS claim'})));
