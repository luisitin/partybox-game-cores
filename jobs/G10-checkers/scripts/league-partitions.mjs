import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {gameInputHashes} from './game-inputs.mjs';
import {hashFile} from './browser-evidence.mjs';
import {VARIANTS,validatePartitionReport,validateGameRecords} from './league-partition-evidence.mjs';
const directory=resolve(process.env.G10_EVIDENCE_DIR??'.work/checks'),inputs=await gameInputHashes(),botSha256=await hashFile('src/bots.ts');
const comparisons=[],audits=[],components=[],rawFiles=[];await mkdir(directory+'/league-games',{recursive:true});
for(const variant of VARIANTS){
 const report=JSON.parse(await readFile(directory+'/league-partition-'+variant+'.json','utf8'));validatePartitionReport(report,variant,inputs,botSha256);
 const rawDirectory=directory+'/league-partition-'+variant+'-games',names=(await readdir(rawDirectory)).sort();
 const expected=report.comparisons.flatMap(row=>Array.from({length:20},(_,index)=>variant+'-'+row.higher+'-'+row.lower+'-'+String(index*50).padStart(4,'0')+'.jsonl')).sort();
 assert.deepEqual(names,expected,'Require all40 exact files per variant; no extras or dropped games');
 for(const row of report.comparisons){
  const records=[];
  for(let start=0;start<1000;start+=50){
   const name=variant+'-'+row.higher+'-'+row.lower+'-'+String(start).padStart(4,'0')+'.jsonl',path=rawDirectory+'/'+name,bytes=await readFile(path,'utf8');
   assert(bytes.endsWith('\n'));const batch=bytes.trim().split('\n').map(line=>JSON.parse(line));assert.equal(batch.length,50);records.push(...batch);
   rawFiles.push({name,sha256:await hashFile(path)});await copyFile(path,directory+'/league-games/'+name);
  }
  audits.push({variant,higher:row.higher,lower:row.lower,...await validateGameRecords(records,row)});comparisons.push(row);
 }
 components.push({variant,elapsedSeconds:report.elapsedSeconds,sourceReport:'league-partition-'+variant+'.json',sha256:await hashFile(directory+'/league-partition-'+variant+'.json')});
}
assert.deepEqual(await gameInputHashes(),inputs);assert.equal(await hashFile('src/bots.ts'),botSha256);
const report={command:'node scripts/league-partitions.mjs',totalGames:4000,gamesPerVariantComparison:1000,gamesPerComparison:2000,botSourceSha256:botSha256,gameInputHashes:inputs,comparisons,
 components,rawFiles,audits,validatedAt:new Date().toISOString(),scope:'All80 actual current-source partition files and4000 games. Every seed/result/summary/transcript is checked; every recorded move independently replayed by the coordinate oracle. Component native timings remain separate; no combined elapsed time is invented.'};
await writeFile(directory+'/league.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',games:4000,files:80,independentLegalMoveReplay:true}));
