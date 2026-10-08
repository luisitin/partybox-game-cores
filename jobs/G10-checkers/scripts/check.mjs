import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,stat,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {hashFile} from './browser-evidence.mjs';
import {STAGES,CI_STAGES,sourceCommit,stageGuards,stageCommands,validateStageReceipt,readStageReceipt} from './check-stages.mjs';
const arguments_=process.argv.slice(2),stage=arguments_.length===0?'full':arguments_[1];
assert(arguments_.length===0||(arguments_.length===2&&arguments_[0]==='--stage'&&STAGES.includes(stage)),'Use an explicit known stage or the complete default pipeline');
const startedAt=new Date().toISOString(),beginning=performance.now(),commit=sourceCommit(),commands=[];
const htmlOutput=resolve(process.env.G10_HTML_OUT??'.work/play.html');
assert(!process.env.G10_HTML_PATH||resolve(process.env.G10_HTML_PATH)===htmlOutput,'Checks must use the page rebuilt from the current source');
const environment={...process.env,G10_HTML_OUT:htmlOutput,G10_HTML_PATH:htmlOutput,G10_EVIDENCE_DIR:resolve(process.env.G10_EVIDENCE_DIR??'.work/checks'),G10_BROWSER_DIR:resolve(process.env.G10_BROWSER_DIR??'.work/browser'),G10_MEDIA_DIR:resolve(process.env.G10_MEDIA_DIR??'.work/media')};
for(const path of [environment.G10_EVIDENCE_DIR,environment.G10_BROWSER_DIR,environment.G10_MEDIA_DIR])await mkdir(path,{recursive:true});
async function run(command,args){
  const executable=command==='node'?process.execPath:command==='npm'&&process.platform==='win32'?'npm.cmd':command;
  const began=performance.now(),child=spawn(executable,args,{stdio:'inherit',env:environment});
  const result=await new Promise((yes,no)=>{child.once('error',no);child.once('exit',(exitCode,signal)=>yes({exitCode,signal}));});
  commands.push({command,args,executable,...result,elapsedSeconds:(performance.now()-began)/1000});
  assert.equal(result.exitCode,0,JSON.stringify({command,args,...result}));assert.equal(result.signal,null);
}
const node=(...args)=>run('node',args);
await run('npm',['run','build']);
await node('scripts/integrity.mjs','--sources');
const before=await stageGuards(),htmlSha256=await hashFile(htmlOutput),htmlBytes=(await stat(htmlOutput)).size;
if(stage==='node'||stage==='full'){
await run('python3',['scripts/standalone-parts.py','controls']);
await node('scripts/browser-evidence-controls.mjs');
await node('scripts/league-partition-controls.mjs');
const files=['manifest.json','data/endgames.json','data/schema.json','fixtures/schema.json','fixtures/move.json','fixtures/done.json','fixtures/move.views.json','fixtures/done.views.json'];
const original=await Promise.all(files.map(path=>readFile(path)));let prior=null;
for(let attempt=0;attempt<2;attempt++){
  await node('scripts/endgames.mjs');await node('scripts/fixtures.mjs');
  const current=await Promise.all(files.map(path=>readFile(path)));
  for(let i=0;i<files.length;i++){assert(current[i].equals(original[i]),'Regeneration changed delivered source: '+files[i]);if(prior)assert(current[i].equals(prior[i]),'Regenerations differ: '+files[i]);}prior=current;
}
const acquisition='.work/chinook-regeneration';
for(let attempt=0;attempt<2;attempt++){
  await run('python3',['scripts/acquire-chinook.py','--out',acquisition]);
  for(const [member,path] of [['DB6','data/chinook/DB6.bin'],['DB6.idx','data/chinook/DB6.idx'],['chinook-manifest.json','data/chinook/manifest.json']])assert((await readFile(acquisition+'/'+member)).equals(await readFile(path)),'Source corpus regeneration differs: '+member);
}
const testPaths=(await readdir('tests')).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>'tests/'+name);
await node('--test','--experimental-test-isolation=none','--test-reporter=tap','--test-concurrency=1',...testPaths);
await node('scripts/mutations.mjs');await node('scripts/matrix.mjs');
}
if(stage==='full')await node('scripts/league.mjs');
if(stage.startsWith('league-'))await node('scripts/league.mjs','--variant',stage.slice(7),'--ci-partition');
if(stage==='browser'||stage==='full'){await node('scripts/browser-check.mjs');await node('scripts/browser-check.mjs','--capture');}
if(stage==='final'){
 for(const component of CI_STAGES)validateStageReceipt(await readStageReceipt(environment.G10_EVIDENCE_DIR,component),{
  stage:component,commit,guards:before,htmlSha256,htmlBytes,commands:await stageCommands(component),runtime:process.version,
  runId:process.env.GITHUB_RUN_ID??null,runAttempt:process.env.GITHUB_RUN_ATTEMPT??null});
 await node('scripts/league-partitions.mjs');
}
if(stage==='final'||stage==='full')await node('scripts/integrity.mjs');
const after=await stageGuards();assert.deepEqual(after,before,'Every current input, test, runtime bundle and host source must remain frozen');
assert.equal(await hashFile(htmlOutput),htmlSha256);assert.equal((await stat(htmlOutput)).size,htmlBytes);
const receipt={status:'PASS',stage,sourceCommit:commit,runtime:process.version,workflowRunId:process.env.GITHUB_RUN_ID??null,workflowRunAttempt:process.env.GITHUB_RUN_ATTEMPT??null,
 startedAt,closedAt:new Date().toISOString(),elapsedSeconds:(performance.now()-beginning)/1000,htmlSha256,htmlBytes,sourceGuardsBefore:before,sourceGuardsAfter:after,commands};
validateStageReceipt(receipt,{stage,commit,guards:before,htmlSha256,htmlBytes,commands:await stageCommands(stage),runtime:process.version,runId:receipt.workflowRunId,runAttempt:receipt.workflowRunAttempt});
await writeFile(environment.G10_EVIDENCE_DIR+'/stage-'+stage+'.json',JSON.stringify(receipt,null,2)+'\n');
if(stage==='full'||stage==='final')await writeFile(environment.G10_EVIDENCE_DIR+'/complete-acceptance.json',JSON.stringify({...receipt,acceptedStages:stage==='full'?['full']:CI_STAGES},null,2)+'\n');
process.stdout.write(JSON.stringify({status:'PASS',stage,sourceCommit:commit,elapsedSeconds:receipt.elapsedSeconds})+'\n');
