import assert from 'node:assert/strict';
import {parentPort,workerData} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
assert(parentPort);
const assignedVariant=null;
const importBegan=performance.now();
const modules={};for(const variant of ['international','american'])for(const version of ['original','candidate']){const path=resolve(version==='original'?'dist':'.work/search-memo-private/candidate','core-'+variant+'.mjs');modules[variant+':'+version]=await import(pathToFileURL(path));}
parentPort.on('message',async task=>{
  assert(!assignedVariant||task.variant===assignedVariant,'Dedicated workers must retain their assigned corpus');
  const core=modules[task.variant+':'+task.version];
  const beginning=performance.now(),records=[];let wins=0,draws=0,losses=0;
  const {variant,higher,lower,start,end}=task;
  for(let n=start;n<end;n++){
    const seed=(0xC10B0700+(n>>1)+(variant==='international'?200000:0)+(higher==='normal'?100000:0))>>>0;
    const stronger=n%2===0?'light':'dark',skills=Object.fromEntries(['light','dark'].map(id=>[id,id===stronger?higher:lower]));
    const cursors={light:core.createRng(seed^0x11A1),dark:core.createRng(seed^0xD4A4)},moves=[];
    let state=core.init({players:[{id:'light',name:'Light',avatarId:'light',connected:true,bot:true},{id:'dark',name:'Dark',avatarId:'dark',connected:true,bot:true}],settings:{variant},seed,now:1000});
    for(let ply=0;state.phase.id==='move'&&ply<2400;ply++){
      const id=core.turnId(state),input=core.sampleInput(state,id,cursors[id],skills[id]);assert(input&&core.inputSchema.safeParse(input).success);
      const next=core.reduce(state,{type:'input',playerId:id,input,now:2000+ply});assert.notEqual(next,state);moves.push(input);state=next;
    }
    assert.equal(state.phase.id,'done','Active bots must reach a real terminal result');assert(core.results(state));
    if(state.winner===stronger)wins++;else if(state.winner===null)draws++;else losses++;
    records.push({index:n,variant,higher,lower,seed,stronger,skills,moves,winner:state.winner,endReason:state.endReason,plies:state.ply,finalBoard:state.board});
  }
  parentPort.postMessage({task,records,wins,draws,losses,elapsedSeconds:(performance.now()-beginning)/1000});
});
parentPort.postMessage({kind:'ready',importSeconds:(performance.now()-importBegan)/1000,memory:process.memoryUsage()});
