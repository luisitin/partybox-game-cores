import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {stageGuards,stageCommands,validateStageReceipt,sourceCommit} from '../../scripts/check-stages.mjs';
import {validateCurrentBrowserEvidence,hashFile} from '../../scripts/browser-evidence.mjs';
import {gameInputHashes} from '../../scripts/game-inputs.mjs';
const base=resolve('.work/hosted-e7-final'),directory=base+'/extracted',checks=directory+'/.work/checks',head='e7a5c6463af2f0033ff08d333fb378ad160c1e43',run='37860295647',html=resolve('.work/play-full-guarded.html');
assert.equal(sourceCommit(),'0718272a91bfda8749c7e4df25ce22c5c578d7fd');assert.equal(process.version,'v22.16.0');
const json=async name=>JSON.parse(await readFile(checks+'/'+name+'.json','utf8')),startedAt=new Date().toISOString();
const historical=JSON.parse(await readFile(base+'/historical-git-guards.json','utf8'));assert.equal(historical.status,'PASS');assert.equal(historical.acceptedHead,head);assert(historical.sourceGuardCount>=349);assert(historical.gitTrackedOriginalBytes.length>=206);const guards=await stageGuards(),sourceSha256=await hashFile(html),htmlBytes=(await stat(html)).size;assert.equal(sourceSha256,'5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801');assert.equal(htmlBytes,1390845993);
const stages=[];
for(const stage of ['node','league-american','league-international','browser','final']){
 const receipt=await json('stage-'+stage);
 validateStageReceipt(receipt,{stage,commit:head,guards,htmlSha256:sourceSha256,htmlBytes,commands:await stageCommands(stage),runtime:process.version,runId:run,runAttempt:'1'});
 stages.push({stage,elapsedSeconds:receipt.elapsedSeconds,startedAt:receipt.startedAt,closedAt:receipt.closedAt,commands:receipt.commands.length});
}
const inputs=await gameInputHashes(),mutants=await json('mutations'),matrix=await json('matrix'),properties=await json('properties'),moves=await json('moves-reference');
assert.deepEqual(mutants.gameInputHashes,inputs);assert.equal(mutants.total,25);assert.equal(mutants.assertionKilled,25);assert.equal(mutants.mutations.length,25);assert(mutants.mutations.every(row=>row.assertionKilled===true));
assert.equal(matrix.games,7000);assert.equal(matrix.reports.length,7);assert(matrix.reports.every(row=>row.games===1000));
assert.deepEqual(properties.fixedSeeds,[1,2,3]);assert(Array.isArray(properties.randomSeeds));assert.equal(properties.randomSeeds.length,1000);assert.equal(new Set(properties.randomSeeds).size,1000);assert(properties.randomSeeds.every(seed=>Number.isInteger(seed)&&seed>=0&&seed<=0xffffffff));assert.equal(moves.randomCases,10000);
const stdout=await readFile(directory+'/.work-stage-node.stdout','utf8');
const deliveryControls=stdout.split('\n').filter(line=>line.startsWith('{')).map(line=>{try{return JSON.parse(line);}catch{return null;}}).find(row=>row&&Array.isArray(row.controls)&&row.controls.includes('coherent-sidecars-wrong-whole-sha'));assert(deliveryControls);assert.equal(deliveryControls.status,'PASS');assert.equal(deliveryControls.positives,4);assert.equal(deliveryControls.rejected,21);assert.equal(deliveryControls.controls.length,21);assert.equal(new Set(deliveryControls.controls).size,21);assert(/^# tests 91$/m.test(stdout));assert(/^# pass 91$/m.test(stdout));for(const key of ['fail','cancelled','skipped','todo'])assert(new RegExp('^# '+key+' 0$','m').test(stdout));
const hostControls=await json('browser-evidence-controls'),partitionControls=await json('league-partition-controls');assert.equal(hostControls.status,'PASS');assert.equal(hostControls.positives,14);assert.equal(hostControls.rejected,127);assert.equal(partitionControls.status,'PASS');assert.equal(partitionControls.positives,10);assert.equal(partitionControls.rejected,72);
await validateCurrentBrowserEvidence({browserDirectory:directory+'/.work/browser',mediaDirectory:directory+'/.work/media',htmlPath:html,sourceSha256});
const {validatePartitionReport,validateGameRecords}=await import('../../scripts/league-partition-evidence.mjs');
const league=await json('league'),acceptance=await json('complete-acceptance');
assert.equal(acceptance.status,'PASS');assert.equal(acceptance.stage,'final');assert.equal(acceptance.sourceCommit,head);assert.equal(acceptance.workflowRunId,run);assert.equal(acceptance.workflowRunAttempt,'1');assert.deepEqual(acceptance.sourceGuardsBefore,guards);assert.deepEqual(acceptance.sourceGuardsAfter,guards);assert.equal(acceptance.htmlSha256,sourceSha256);assert.equal(acceptance.htmlBytes,htmlBytes);assert.deepEqual(acceptance.acceptedStages,['node','league-american','league-international','browser']);assert.deepEqual(league.gameInputHashes,inputs);assert.equal(league.totalGames,4000);
const audits=[];let totalFiles=0;
for(const variant of ['american','international']){
 const partition=await json('league-partition-'+variant);validatePartitionReport(partition,variant,inputs,await hashFile('src/bots.ts'));
 for(const row of partition.comparisons){
  const records=[];
  for(let start=0;start<1000;start+=50){const name=variant+'-'+row.higher+'-'+row.lower+'-'+String(start).padStart(4,'0')+'.jsonl';const path=checks+'/league-partition-'+variant+'-games/'+name;const bytes=await readFile(path);assert.equal(Buffer.compare(bytes,await readFile(checks+'/league-games/'+name)),0);assert.equal(Buffer.compare(bytes,await readFile('.work/league-phase-full/league-games/'+name)),0);assert.equal(await hashFile(path),league.rawFiles.find(x=>x.name===name).sha256);const lines=bytes.toString().trim().split('\n');assert.equal(lines.length,50);records.push(...lines.map(line=>JSON.parse(line)));totalFiles++;}
  audits.push({variant,higher:row.higher,lower:row.lower,...await validateGameRecords(records,row)});
 }
}
assert.equal(totalFiles,80);assert.equal(audits.reduce((n,row)=>n+row.games,0),4000);
const strict=JSON.parse(await readFile(directory+'/.work/browser/checks.json','utf8')),capture=JSON.parse(await readFile(directory+'/.work/browser/capture.json','utf8'));
assert.deepEqual(await stageGuards(),guards);
assert.equal(sourceCommit(),'0718272a91bfda8749c7e4df25ce22c5c578d7fd');for(const doc of historical.sixCurrentDocumentationGitBridge){assert.equal(await hashFile(doc.path.replace('jobs/G10-checkers/','')),doc.currentGitSha256);}
const receipt={currentCheckoutPreserved:'0718272a91bfda8749c7e4df25ce22c5c578d7fd',sixCurrentDocumentationGitBridge:historical.sixCurrentDocumentationGitBridge,status:'PASS',startedAt,closedAt:new Date().toISOString(),head,workflowRunId:run,workflowRunAttempt:'1',stageGuardCount:Object.keys(guards).length,gameInputCount:Object.keys(inputs).length,htmlBytes,sourceSha256,stages,historicalOriginalGitGuardFiles:historical.gitTrackedOriginalBytes.length,generatedRuntimeExactByteGuards:historical.generatedRuntimePathsRequireCurrentByteMatch.length,league:{games:4000,files:80,audits},node:{tests:91,passes:91,failures:0,mutants:25,assertionKilled:25,matrixGames:7000,moveOracleRandomCases:10000,propertyFixedSeeds:[1,2,3],propertyRandomSeeds:1000,hostControls:[14,127],partitionControls:[10,72],deliveryControls:[4,21]},browser:{strictRunId:strict.runId,captureRunId:capture.runId,functionalChecks:strict.checks.length+capture.checks.length,strictIntervals:2400,nativeTimestamps:2404,profiles:strict.profiles,captures:capture.profiles.map(row=>({name:row.name,gameplay:row.gameplay,video:row.video}))},scope:'Independent historical exact-e7 complete hosted acceptance, with current071 runtime/six-doc Git bridge: all four stages/final exact guards/runtime/run/attempt/commands, all4000 true-terminal games/80 raw files equal original accepted gold, all2400 native intervals and current International clips/originals fully decoded. Bounded standalone actual ZIP/part/whole-byte validation is a separate required receipt. No delivery acceptance is inferred from these component checks. Historical local17.510FPS failure remains uncaused.'};
await writeFile(base+'/independent-complete-evidence.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:'PASS',closedAt:receipt.closedAt,stageGuardCount:receipt.stageGuardCount,node:receipt.node,browserFunctionalChecks:receipt.browser.functionalChecks,scope:receipt.scope}));

