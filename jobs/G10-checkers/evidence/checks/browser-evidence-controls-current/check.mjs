import assert from 'node:assert/strict';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
const htmlOutput=resolve(process.env.G10_HTML_OUT??'.work/play.html');
assert(!process.env.G10_HTML_PATH||resolve(process.env.G10_HTML_PATH)===htmlOutput,'Checks must use the page rebuilt from the current source');
const environment={...process.env,G10_HTML_OUT:htmlOutput,G10_HTML_PATH:htmlOutput,G10_EVIDENCE_DIR:resolve(process.env.G10_EVIDENCE_DIR??'.work/checks'),G10_BROWSER_DIR:resolve(process.env.G10_BROWSER_DIR??'.work/browser'),G10_MEDIA_DIR:resolve(process.env.G10_MEDIA_DIR??'.work/media')};
for(const path of [environment.G10_EVIDENCE_DIR,environment.G10_BROWSER_DIR,environment.G10_MEDIA_DIR])await mkdir(path,{recursive:true});
async function run(command,args){
  const child=spawn(command,args,{stdio:'inherit',env:environment});
  await new Promise((yes,no)=>{child.once('error',no);child.once('exit',(code,signal)=>code===0?yes():no(new Error(JSON.stringify({command,args,code,signal}))));});
}
const node=(...args)=>run(process.execPath,args);
await run(process.platform==='win32'?'npm.cmd':'npm',['run','build']);
await node('scripts/integrity.mjs','--sources');
await node('scripts/browser-evidence-controls.mjs');
const files=['manifest.json','data/endgames.json','data/schema.json','fixtures/schema.json','fixtures/move.json','fixtures/done.json','fixtures/move.views.json','fixtures/done.views.json'];
const original=await Promise.all(files.map(path=>readFile(path)));let prior=null;
for(let attempt=0;attempt<2;attempt++){
  await node('scripts/endgames.mjs');await node('scripts/fixtures.mjs');
  const current=await Promise.all(files.map(path=>readFile(path)));
  for(let i=0;i<files.length;i++){assert(current[i].equals(original[i]),'Regeneration changed delivered source: '+files[i]);if(prior)assert(current[i].equals(prior[i]),'Regenerations differ: '+files[i]);}prior=current;
}
const acquisition=resolve('.work/chinook-regeneration');
for(let attempt=0;attempt<2;attempt++){
  await run('python3',['scripts/acquire-chinook.py','--out',acquisition]);
  for(const [member,path] of [['DB6','data/chinook/DB6.bin'],['DB6.idx','data/chinook/DB6.idx'],['chinook-manifest.json','data/chinook/manifest.json']])assert((await readFile(acquisition+'/'+member)).equals(await readFile(path)),'Source corpus regeneration differs: '+member);
}
const tests=(await readdir('tests')).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>'tests/'+name);
await node('--test','--experimental-test-isolation=none','--test-reporter=tap','--test-concurrency=1',...tests);
await node('scripts/mutations.mjs');await node('scripts/matrix.mjs');await node('scripts/league.mjs');
await node('scripts/browser-check.mjs');await node('scripts/browser-check.mjs','--capture');
await node('scripts/integrity.mjs');
