import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {validatePartitionReport,validateGameRecords} from './league-partition-evidence.mjs';
import {stageCommands,CI_STAGES,validateStageReceipt} from './check-stages.mjs';
import {hashFile} from './browser-evidence.mjs';
const guarded=['scripts/check.mjs','scripts/check-stages.mjs','scripts/league.mjs','scripts/league-partitions.mjs','scripts/league-partition-evidence.mjs','scripts/league-partition-controls.mjs','scripts/standalone-receipt.mjs','tests/reference-moves.mjs','dist/core.mjs','dist/endgame.mjs','../../.github/workflows/G10.yml'];
const fingerprints=async()=>Object.fromEntries(await Promise.all(guarded.map(async path=>[path,await hashFile(path)])));
const sourceGuardsBefore=await fingerprints();
const original=JSON.parse(await readFile('evidence/checks/league-phase-full/league.json','utf8')),output=resolve(process.env.G10_EVIDENCE_DIR??'.work/partition-controls');await mkdir(output,{recursive:true});
const rows=[],clone=value=>structuredClone(value);
const negative=(name,fn)=>{assert.throws(fn,undefined,name);rows.push({name,result:'REJECTED'});};
const asyncNegative=async(name,fn)=>{await assert.rejects(fn,undefined,name);rows.push({name,result:'REJECTED'});};
for(const variant of ['american','international']){
 const partition={...original,ciPartition:variant,command:'node scripts/league.mjs --variant '+variant+' --ci-partition',totalGames:2000,gamesPerComparison:1000,comparisons:original.comparisons.filter(row=>row.variant===variant)};
 validatePartitionReport(partition,variant,original.gameInputHashes,original.botSourceSha256);rows.push({name:variant+' derived structural partition component',result:'PASS'});
 for(const [name,change] of [['reduced games',value=>{value.totalGames=1999;}],['wrong variant',value=>{value.ciPartition='other';}],['missing comparison',value=>{value.comparisons.pop();}],['duplicate comparison',value=>{value.comparisons[1]=clone(value.comparisons[0]);}],['changed bot source',value=>{value.botSourceSha256='0'.repeat(64);}],['changed game input',value=>{value.gameInputHashes['src/core.ts']='0'.repeat(64);}],['weak score',value=>{value.comparisons[0].scoreShare=.55;}],['unclear strength',value=>{value.comparisons[0].decisiveWilson95[0]=.5;}]]){
  const bad=clone(partition);change(bad);negative(variant+' rejects '+name,()=>validatePartitionReport(bad,variant,original.gameInputHashes,original.botSourceSha256));
 }
 for(const summary of partition.comparisons){
  const records=[];for(let start=0;start<1000;start+=50){const name=variant+'-'+summary.higher+'-'+summary.lower+'-'+String(start).padStart(4,'0')+'.jsonl';records.push(...(await readFile('evidence/checks/league-phase-full/league-games/'+name,'utf8')).trim().split('\n').map(line=>JSON.parse(line)));}
  await validateGameRecords(records,summary);rows.push({name:variant+' '+summary.higher+'/'+summary.lower+' actual1000 independent legal-move/current-core terminal replay',result:'PASS'});
  for(const [name,change] of [['missing record',value=>{value.pop();}],['changed index',value=>{value[0].index=1;}],['changed seed',value=>{value[0].seed++;}],['changed side',value=>{value[0].stronger='dark';}],['illegal first move',value=>{value[0].moves[0].path=[0,0];}],['changed final board',value=>{value[0].finalBoard[0]=3;}]]){const bad=clone(records);change(bad);await asyncNegative(variant+' '+summary.higher+' rejects '+name,()=>validateGameRecords(bad,summary));}
  const forged=clone(records),forgedSummary=clone(summary);forged[0].winner=forged[0].winner==='light'?'dark':'light';forged[0].endReason='fabricated-terminal';
  const wins=forged.filter(game=>game.winner===game.stronger).length,draws=forged.filter(game=>game.winner===null).length,losses=1000-wins-draws,p=wins/(wins+losses),z=1.96,denom=1+z*z/(wins+losses),center=(p+z*z/(2*(wins+losses)))/denom,margin=z*Math.sqrt((p*(1-p)+z*z/(4*(wins+losses)))/(wins+losses))/denom;
  Object.assign(forgedSummary,{wins,draws,losses,scoreShare:(wins+draws/2)/1000,decisiveWinRate:p,decisiveWilson95:[center-margin,center+margin]});
  const digest=createHash('sha256');for(const game of forged)digest.update(JSON.stringify([variant,summary.higher,summary.lower,game.seed,game.stronger,game.winner,game.endReason,game.plies,game.finalBoard]));forgedSummary.transcriptSha256=digest.digest('hex');
  await asyncNegative(variant+' '+summary.higher+' rejects coherently forged terminal/outcome/summary/transcript',()=>validateGameRecords(forged,forgedSummary));
 }
}
for(const stage of CI_STAGES){
 const commands=await stageCommands(stage),guards={component:'actual source-inventory schema unit component only'},options={stage,commit:'1'.repeat(40),guards,htmlSha256:'2'.repeat(64),htmlBytes:1390845993,commands,runtime:process.version,runId:'123',runAttempt:'1'};
 const receipt={status:'PASS',stage,sourceCommit:options.commit,runtime:process.version,workflowRunId:'123',workflowRunAttempt:'1',htmlSha256:options.htmlSha256,htmlBytes:options.htmlBytes,sourceGuardsBefore:guards,sourceGuardsAfter:guards,startedAt:'2026-10-08T00:00:00Z',closedAt:'2026-10-08T00:00:01Z',elapsedSeconds:1,commands:commands.map(row=>({...row,exitCode:0,signal:null,elapsedSeconds:1,executable:'component-unit-fixture'}))};
 validateStageReceipt(receipt,options);rows.push({name:stage+' explicit synthetic stage-schema unit component',result:'PASS'});
 for(const [name,change] of [['stale head',value=>{value.sourceCommit='3'.repeat(40);}],['different run',value=>{value.workflowRunId='124';}],['missing command',value=>{value.commands.pop();}],['substituted arguments',value=>{value.commands[0].args=['other'];}],['failed command',value=>{value.commands[0].exitCode=1;}],['changed runtime source',value=>{value.sourceGuardsAfter={};}],['wrong page',value=>{value.htmlSha256='3'.repeat(64);}]] ){
  const bad=clone(receipt);change(bad);negative(stage+' rejects '+name,()=>validateStageReceipt(bad,options));
 }
}
const sourceGuardsAfter=await fingerprints();assert.deepEqual(sourceGuardsAfter,sourceGuardsBefore);
const report={status:'PASS',closedAt:new Date().toISOString(),sourceGuardsBefore,sourceGuardsAfter,positives:rows.filter(row=>row.result==='PASS').length,rejected:rows.filter(row=>row.result==='REJECTED').length,rows,scope:'Genuine current historical4000-game records replayed independently; derived partition metadata and explicit synthetic stage-schema fixtures test components only. No fresh partition execution, current hosted acceptance or CI-fit inference.'};
await writeFile(output+'/league-partition-controls.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,positives:report.positives,rejected:report.rejected,scope:report.scope}));
