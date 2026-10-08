import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
assert(Number(process.versions.node.split('.')[0])>=24,'Node 24+ required');
for(const [command,args] of [['ffmpeg',['-version']],['python',['-c','import dominoes; print("dominoes reference import OK")']]] as const){
 const result=spawnSync(command,[...args],{encoding:'utf8',env:{...process.env,PYTHONPATH:process.env.BASELINE_PYTHONPATH??'/workspace/.baseline-libs'}});
 assert.equal(result.status,0,`${command} prerequisite: ${result.error?.message??result.stderr??String(result.signal)}`);
 console.log(result.stdout.split('\n')[0]);
}
