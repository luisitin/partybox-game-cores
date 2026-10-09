// Four disjoint seed ranges; the aggregate still contains exactly 2,000 matches.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const study=process.env.IMPROVEMENT_STUDY??'depth4';
const seedStart=Number(process.env.IMPROVEMENT_SEED_START??1);
assert(Number.isSafeInteger(seedStart)&&seedStart>0);
const directory=mkdtempSync(join(tmpdir(),'G01-improvement-'));
const baselineSha=createHash('sha256').update(readFileSync('study-current-baseline.ts')).digest('hex');
const workers=4,gamesPerWorker=500;
const shardPaths=Array.from({length:workers},(_,i)=>join(directory,`${i}.json`));
try{
 await Promise.all(shardPaths.map((output,i)=>new Promise<void>((resolve,reject)=>{
  const child=spawn(process.execPath,['improvement-study.ts'],{env:{...process.env,IMPROVEMENT_STUDY:study,IMPROVEMENT_SEED_START:String(seedStart+i*gamesPerWorker),IMPROVEMENT_SHARD_GAMES:String(gamesPerWorker),IMPROVEMENT_OUTPUT:output},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',data=>process.stdout.write(data));
  child.stderr.on('data',data=>process.stderr.write(data));
  child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`shard ${i} exited ${code}`)));
 })));
 const reports=shardPaths.map(path=>JSON.parse(readFileSync(path,'utf8')));
 reports.forEach((r,i)=>{
  assert.equal(r.study,study);assert.equal(r.sourceSha256,baselineSha);
  assert.equal(r.games,gamesPerWorker);assert.deepEqual(r.seedRange,[seedStart+i*gamesPerWorker,seedStart+(i+1)*gamesPerWorker-1]);
  assert.equal(r.wins+r.losses+r.ties,r.games);assert.equal(r.candidateRegressions,'passed');
  assert.equal(r.productionVersion,reports[0].productionVersion);
 });
 const sum=(key:string)=>reports.reduce((n,r)=>n+r[key],0);
 const games=sum('games'),wins=sum('wins'),rate=wins/games,se=Math.sqrt(rate*(1-rate)/games);
 assert.equal(games,2000);
 const report={study,sourceSha256:baselineSha,productionVersion:reports[0].productionVersion,games,wins,losses:sum('losses'),ties:sum('ties'),winRate:rate,confidence95:[rate-1.96*se,rate+1.96*se],steps:sum('steps'),seedRange:[seedStart,seedStart+games-1],mode:reports[0].mode,candidateRegressions:'passed in every shard',workers,shards:reports};
 const path=`improvement-${study}${seedStart===1?'':'-confirmation'}-report.json`;
 writeFileSync(path,JSON.stringify(report,null,2)+'\n');console.log('AGGREGATE',report);
}finally{rmSync(directory,{recursive:true,force:true});}
