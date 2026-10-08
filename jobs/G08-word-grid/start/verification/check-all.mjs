import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
mkdirSync('.tmp',{recursive:true});
function run(name,command,args=[]){
 console.log(`CHECK ${name} started`);const fd=openSync(`.tmp/check-${name}.log`,'w');
 return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{stdio:['ignore',fd,fd],env:process.env});
  child.on('error',e=>{closeSync(fd);reject(e);});
  child.on('close',code=>{closeSync(fd);const output=readFileSync(`.tmp/check-${name}.log`,'utf8');console.log(output.split('\n').slice(-32).join('\n'));console.log(`CHECK ${name} ${code===0?'PASS':'FAIL'}`);code===0?resolve():reject(new Error(`${name}: exit ${code}`));});
 });
}
await run('typecheck','npm',['run','typecheck']);
await run('unit','npx',['vitest','run']);
await Promise.all([
 run('cube-study','npx',['tsx','start/research/measure.ts']),
 run('bots','npx',['tsx','start/verification/bot-study.ts']),
 run('seeded','npx',['tsx','start/verification/seeded.ts']),
 run('mutations','node',['start/verification/mutations.mjs']),
]);
await run('dictionary-rebuild','node',['start/verification/rebuild.mjs']);
await run('fixture-rebuild','node',['start/verification/rebuild-fixtures.mjs']);
const original=JSON.parse(readFileSync('start/research/original-files.json','utf8'));let preserved=0;
for(const [path,hash] of Object.entries(original))if(path.endsWith('.glb')||path.endsWith('.css')||path.startsWith('cine/')){
 assert.equal(createHash('sha256').update(readFileSync('start/'+path)).digest('hex'),hash,`owner visual changed: ${path}`);preserved++;
}
console.log(JSON.stringify({originalVisualFilesPreserved:preserved}));
await run('build-play','npm',['run','build:play']);
await run('data','npx',['tsx','start/verification/data-check.ts']);
// Run the benchmark after every CPU-heavy check, separate from video encoding.
await run('frames','npx',['tsx','start/verification/frames.ts']);
await run('frame-integrity','node',['start/verification/verify-browser.mjs']);
await run('frame-negative-controls','node',['start/verification/verify-browser-negatives.mjs']);
await run('browser','npx',['tsx','start/verification/browser.ts']);
execFileSync('sha256sum',['-c','SHA256SUMS.txt'],{stdio:'pipe'});
console.log('All Shake Up gates passed, including checksums and actual browser mode reported above.');
