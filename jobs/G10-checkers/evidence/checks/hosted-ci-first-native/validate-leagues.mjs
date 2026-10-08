import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {gameInputHashes} from '../../scripts/game-inputs.mjs';
import {hashFile} from '../../scripts/browser-evidence.mjs';
import {stageGuards,stageCommands,validateStageReceipt} from '../../scripts/check-stages.mjs';
import {validatePartitionReport,validateGameRecords,VARIANTS} from '../../scripts/league-partition-evidence.mjs';
const startedAt=new Date().toISOString(),base=resolve('.work/hosted-a9-leagues'),head='a9c09a2dcef7fe8acf4014d879d87b550c99e9e4',run=37834410114;
const guards=await stageGuards(),inputs=await gameInputHashes(),botSha256=await hashFile('src/bots.ts');
const historicalWorkflow=execFileSync('git',['show',head+':.github/workflows/G10.yml']);
const oldGuards={...guards,'../../.github/workflows/G10.yml':createHash('sha256').update(historicalWorkflow).digest('hex')};
const components=[],audits=[],files=[];
for(const variant of VARIANTS){
 const directory=base+'/'+variant+'/.work/checks',report=JSON.parse(await readFile(directory+'/league-partition-'+variant+'.json','utf8')),stage=JSON.parse(await readFile(directory+'/stage-league-'+variant+'.json','utf8'));
 validateStageReceipt(stage,{stage:'league-'+variant,commit:head,guards:oldGuards,htmlSha256:'5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801',htmlBytes:1390845993,commands:await stageCommands('league-'+variant),runtime:'v22.16.0',runId:String(run),runAttempt:'1'});
 validatePartitionReport(report,variant,inputs,botSha256);
 const rawDirectory=directory+'/league-partition-'+variant+'-games',names=(await readdir(rawDirectory)).sort(),expected=report.comparisons.flatMap(row=>Array.from({length:20},(_,index)=>variant+'-'+row.higher+'-'+row.lower+'-'+String(index*50).padStart(4,'0')+'.jsonl')).sort();
 assert.deepEqual(names,expected);
 for(const row of report.comparisons){
  const records=[];
  for(let start=0;start<1000;start+=50){
   const name=variant+'-'+row.higher+'-'+row.lower+'-'+String(start).padStart(4,'0')+'.jsonl',bytes=await readFile(rawDirectory+'/'+name,'utf8');
   assert(bytes.endsWith('\n'));const batch=bytes.trim().split('\n').map(JSON.parse);assert.equal(batch.length,50);records.push(...batch);
   const sha256=await hashFile(rawDirectory+'/'+name);assert.equal(sha256,await hashFile('.work/league-phase-full/league-games/'+name),'Every hosted complete-game raw byte must match independently accepted original phase gold');
   files.push({name,sha256,goldByteIdentical:true});
  }
  audits.push({variant,higher:row.higher,lower:row.lower,...await validateGameRecords(records,row)});
 }
 components.push({variant,actualLeagueSeconds:report.elapsedSeconds,actualStageSeconds:stage.elapsedSeconds,startedAt:stage.startedAt,closedAt:stage.closedAt,comparisons:report.comparisons});
}
assert.deepEqual(await stageGuards(),guards);assert.deepEqual(await gameInputHashes(),inputs);assert.equal(await hashFile('src/bots.ts'),botSha256);
const receipt={status:'PASS',startedAt,closedAt:new Date().toISOString(),head,run,workflowRunAttempt:'1',gameInputCount:Object.keys(inputs).length,stageGuardCount:Object.keys(guards).length,games:4000,files,components,audits,
 scope:'Historical a9 native hosted league components only. Exact run/attempt/head/commands/full-page/guards validated using git-original a9 workflow bytes; all other current guards match. All4000 complete game bytes equal original full phase gold, independently coordinate-and-current-core replayed through true terminal/winner/endReason and summaries. Overall a9 node/browser failed, delivery skipped; this receipt does not claim current-head full CI or standalone delivery.'};
await writeFile(base+'/independent-league-validation.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:receipt.status,head,run,games:receipt.games,files:files.length,stageGuardCount:receipt.stageGuardCount,closedAt:receipt.closedAt,scope:receipt.scope}));

