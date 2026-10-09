import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sourceGuards,hashFile} from './browser-evidence.mjs';

export const STAGES=Object.freeze(['full','node','league-american','league-international','browser','final']);
export const CI_STAGES=Object.freeze(['node','league-american','league-international','browser']);
export function sourceCommit(){
 const actual=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 assert(/^[a-f0-9]{40}$/.test(actual));
 if(process.env.G10_SOURCE_COMMIT)assert.equal(actual,process.env.G10_SOURCE_COMMIT,'Every stage must check out the exact PR head');
 return actual;
}
export async function stageGuards(){
 const guards=await sourceGuards();
 for(const directory of ['scripts','tests','dist'])for(const name of (await readdir(directory)).sort()){
  if(/\.(mjs|json|py)$/.test(name))guards[directory+'/'+name]=await hashFile(directory+'/'+name);
 }
 guards['../../.github/workflows/G10.yml']=await hashFile('../../.github/workflows/G10.yml');
 return Object.fromEntries(Object.entries(guards).sort(([a],[b])=>a.localeCompare(b)));
}
export async function stageCommands(stage){
 assert(STAGES.includes(stage));
 const commands=[{command:'npm',args:['run','build']},{command:'node',args:['scripts/integrity.mjs','--sources']}];
 const node=(...args)=>commands.push({command:'node',args});
 if(stage==='node'||stage==='full'){
  node('scripts/browser-evidence-controls.mjs');node('scripts/league-partition-controls.mjs');
  for(let attempt=0;attempt<2;attempt++){node('scripts/endgames.mjs');node('scripts/fixtures.mjs');}
  for(let attempt=0;attempt<2;attempt++)commands.push({command:'python3',args:['scripts/acquire-chinook.py','--out','.work/chinook-regeneration']});
  const tests=(await readdir('tests')).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>'tests/'+name);
  node('--test','--experimental-test-isolation=none','--test-reporter=tap','--test-concurrency=1',...tests);
  node('scripts/mutations.mjs');node('scripts/matrix.mjs');
 }
 if(stage==='full')node('scripts/league.mjs');
 if(stage.startsWith('league-'))node('scripts/league.mjs','--variant',stage.slice(7),'--ci-partition');
 if(stage==='browser'||stage==='full'){node('scripts/browser-check.mjs');node('scripts/browser-check.mjs','--capture');}
 if(stage==='final')node('scripts/league-partitions.mjs');
 if(stage==='final'||stage==='full')node('scripts/integrity.mjs');
 return commands;
}
export function validateStageReceipt(receipt,{stage,commit,guards,htmlSha256,htmlBytes,commands,runtime,runId,runAttempt}){
 assert.equal(receipt.status,'PASS');assert.equal(receipt.stage,stage);assert.equal(receipt.sourceCommit,commit);
 assert.equal(receipt.runtime,runtime);assert.equal(receipt.workflowRunId,runId);assert.equal(receipt.workflowRunAttempt,runAttempt);
 assert.equal(receipt.htmlSha256,htmlSha256);assert.equal(receipt.htmlBytes,htmlBytes);
 assert.deepEqual(receipt.sourceGuardsBefore,guards);assert.deepEqual(receipt.sourceGuardsAfter,guards);
 assert(Array.isArray(receipt.commands));assert.deepEqual(receipt.commands.map(({command,args})=>({command,args})),commands,'No missing or substituted stage workload');
 for(const row of receipt.commands){assert.equal(row.exitCode,0);assert.equal(row.signal,null);assert(Number.isFinite(row.elapsedSeconds)&&row.elapsedSeconds>0);assert(typeof row.executable==='string'&&row.executable.length>0);}
 assert(Number.isFinite(receipt.elapsedSeconds)&&receipt.elapsedSeconds>0);
 assert(Number.isFinite(Date.parse(receipt.startedAt))&&Number.isFinite(Date.parse(receipt.closedAt))&&Date.parse(receipt.closedAt)>=Date.parse(receipt.startedAt));
}
export async function readStageReceipt(directory,stage){return JSON.parse(await readFile(directory+'/stage-'+stage+'.json','utf8'));}
