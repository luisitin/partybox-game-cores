import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {Worker} from 'node:worker_threads';
import {gameInputHashes} from './game-inputs.mjs';
const arg=name=>{const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:null;};
const games=Number(arg('--games')??1000),selected=arg('--variant'),variants=selected?[selected]:['american','international'];
const workers=Number(arg('--workers')??4),canonical=games===1000&&variants.length===2;
const partition=process.argv.includes('--ci-partition');assert(!partition||(games===1000&&variants.length===1&&selected),'CI partitions must retain exactly1,000 games per comparison for one explicit variant');
assert(Number.isInteger(games)&&games>0&&games%2===0);assert(variants.every(value=>['american','international'].includes(value)));
assert(Number.isInteger(workers)&&workers>=1&&workers<=4);
const directory=resolve(process.env.G10_EVIDENCE_DIR??'evidence/checks'),label=canonical?'league':partition?'league-partition-'+selected:'league-smoke-'+games+(selected?'-'+selected:'');
await mkdir(directory+'/'+label+'-games',{recursive:true});
const report={command:'node scripts/league.mjs'+process.argv.slice(2).map(value=>' '+value).join(''),gamesPerVariantComparison:games,gamesPerComparison:games*variants.length,workers,
  ciPartition:partition?selected:null,
  opening:'Standard starting board; paired identical seed with stronger side alternated. No outcome-based opening selection.',startAt:new Date().toISOString(),comparisons:[],
  botSourceSha256:createHash('sha256').update(await readFile('src/bots.ts')).digest('hex'),gameInputHashes:await gameInputHashes()};
const tasks=[];
for(const [higher,lower] of [['sharp','normal'],['normal','easy']])for(const variant of [...variants].reverse())for(let start=0;start<games;start+=50){
  tasks.push({variant,higher,lower,start,end:Math.min(start+50,games)});
}
const beginning=performance.now(),finished=[],warmups=[];
const orderedVariants=[...variants].sort((a,b)=>a==='international'?-1:b==='international'?1:0);
const phaseVariants=orderedVariants.map(variant=>[variant]);
const allocationFor=group=>group.map((variant,index)=>({variant,workers:Math.floor(workers/group.length)+(index<workers%group.length?1:0)}));
report.workerAllocation=phaseVariants.map(allocationFor);
for(const group of phaseVariants){
  const pool=[],queues=new Map(group.map(variant=>[variant,tasks.filter(task=>task.variant===variant)])),cursors=new Map(group.map(variant=>[variant,0]));
  try{
    for(const {variant,workers:count} of allocationFor(group))for(let index=0;index<count;index++){
      const worker=new Worker(new URL('./league-worker.mjs',import.meta.url),{workerData:{variant}});pool.push({worker,variant});
      const ready=await new Promise((resolveReady,reject)=>{
        const failed=error=>{cleanup();reject(error);},exited=code=>failed(new Error('Worker exited during prewarm: '+code));
        const message=record=>{if(record.kind==='ready'){cleanup();resolveReady(record);}};
        const cleanup=()=>{worker.off('message',message);worker.off('error',failed);worker.off('exit',exited);};
        worker.on('message',message);worker.once('error',failed);worker.once('exit',exited);
      });
      assert.equal(ready.variant,variant);warmups.push(ready);
      process.stdout.write(JSON.stringify({prewarm:variant,index,...ready})+'\n');
    }
    await Promise.all(pool.map(({worker,variant})=>new Promise((resolveTask,reject)=>{
      let active=null,closing=false;
      const next=()=>{const queue=queues.get(variant),cursor=cursors.get(variant);if(cursor>=queue.length){closing=true;worker.terminate().then(()=>resolveTask());return;}active=queue[cursor];cursors.set(variant,cursor+1);worker.postMessage(active);};
      worker.on('error',reject);worker.on('exit',code=>{if(!closing)reject(new Error('League worker exited before finishing: '+code));});
      worker.on('message',async message=>{
        try{
          assert(active);assert.deepEqual(message.task,active);
          const name=active.variant+'-'+active.higher+'-'+active.lower+'-'+String(active.start).padStart(4,'0')+'.jsonl';
          const raw=message.records.map(record=>JSON.stringify(record)).join('\n')+'\n';await writeFile(directory+'/'+label+'-games/'+name,raw);
          finished.push(message);process.stdout.write(JSON.stringify({...active,games:message.records.length,wins:message.wins,draws:message.draws,losses:message.losses,elapsedSeconds:message.elapsedSeconds,raw:name})+'\n');next();
        }catch(error){reject(error);closing=true;await worker.terminate();}
      });next();
    })));
  }finally{await Promise.all(pool.map(({worker})=>worker.terminate()));}
}
report.warmups=warmups;report.wholeProcessPeakRssKiB=process.resourceUsage().maxRSS;

for(const variant of variants)for(const [higher,lower] of [['sharp','normal'],['normal','easy']]){
  const rows=finished.filter(result=>result.task.variant===variant&&result.task.higher===higher&&result.task.lower===lower).sort((a,b)=>a.task.start-b.task.start);
  const records=rows.flatMap(result=>result.records);assert.equal(records.length,games);
  const wins=rows.reduce((sum,row)=>sum+row.wins,0),draws=rows.reduce((sum,row)=>sum+row.draws,0),losses=rows.reduce((sum,row)=>sum+row.losses,0);
  const score=(wins+draws/2)/games,decisive=wins+losses,p=decisive?wins/decisive:0,z=1.96,denom=1+z*z/Math.max(1,decisive),center=(p+z*z/(2*Math.max(1,decisive)))/denom;
  const margin=z*Math.sqrt((p*(1-p)+z*z/(4*Math.max(1,decisive)))/Math.max(1,decisive))/denom,transcript=createHash('sha256');
  for(const record of records)transcript.update(JSON.stringify([variant,higher,lower,record.seed,record.stronger,record.winner,record.endReason,record.plies,record.finalBoard]));
  report.comparisons.push({variant,higher,lower,games,wins,draws,losses,scoreShare:score,decisiveWinRate:p,decisiveWilson95:[center-margin,center+margin],
    moves:records.reduce((sum,row)=>sum+row.plies,0),maximumPlies:Math.max(...records.map(row=>row.plies)),workerSeconds:rows.reduce((sum,row)=>sum+row.elapsedSeconds,0),transcriptSha256:transcript.digest('hex')});
}
report.totalGames=games*variants.length*2;report.elapsedSeconds=(performance.now()-beginning)/1000;
await writeFile(directory+'/'+label+'.json',JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report)+'\n');
if(canonical||partition){assert.equal(report.totalGames,partition?2000:4000);for(const row of report.comparisons){assert(row.scoreShare>.55,JSON.stringify(row));assert(row.decisiveWilson95[0]>.5,'Stronger advantage must be clear separately for each rule variant');}}
