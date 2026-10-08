import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as core from '../dist/core.mjs';
const matrix=[{variant:'american'},{variant:'american',drawPolicy:'fortyMove'},{variant:'american',repetition:false},
  {variant:'american',turnSeconds:20},{variant:'international'},{variant:'international',drawPolicy:'fortyMove'},{variant:'international',repetition:false}];
const proofDirectory=process.env.G10_EVIDENCE_DIR??'evidence/checks';
const reports=[],hash=createHash('sha256');
for(let index=0;index<matrix.length;index++){
  const settings=matrix[index],totals={games:0,wins:0,draws:0,moves:0,maximumPlies:0};
  for(let n=0;n<1000;n++){
    const seed=0xCA100000+index*1000+n,ctx={players:[{id:'light',name:'Light',avatarId:'light',connected:true,bot:true},{id:'dark',name:'Dark',avatarId:'dark',connected:true,bot:true}],settings,seed,now:1000};
    let state=core.init(ctx),replay=core.init(structuredClone(ctx));const rng=core.createRng(seed^0x51DEC0DE);
    function dispatch(event){const next=core.reduce(state,event),again=core.reduce(replay,structuredClone(event));assert.deepEqual(next,again);state=next;replay=again;}
    dispatch({type:'vip',action:'pause',now:1100});const held=state;assert.equal(core.sampleInput(state,core.turnId(state),rng,'easy'),null);dispatch({type:'vip',action:'resume',now:1200});assert.equal(state.phase.startedAt,held.phase.startedAt);
    for(let ply=0;state.phase.id==='move'&&ply<2400;ply++){
      const id=core.turnId(state),input=core.sampleInput(state,id,rng,'easy');assert(input&&core.inputSchema.safeParse(input).success);assert.equal(core.sampleInput(state,id==='light'?'dark':'light',rng,'easy'),null);assert.equal(core.sampleInput(state,'unknown',rng,'easy'),null);
      const tv=core.tvView(state),view=core.controllerView(state,id),other=core.controllerView(state,id==='light'?'dark':'light');assert.deepEqual(tv.board,view.board);assert.deepEqual(view.board,other.board);assert.equal(other.canMove,false);assert.equal(Object.hasOwn(view,'rng'),false);assert.equal(Object.hasOwn(tv,'repetition'),false);
      const old=state,raw=JSON.stringify(old);dispatch({type:'input',playerId:id,input,now:2000+ply});assert.notEqual(state,old);assert.equal(JSON.stringify(old),raw);assert(JSON.stringify(state).length<=256*1024);assert(state.phase.startedAt>old.phase.startedAt);totals.moves++;
    }
    assert.equal(state.phase.id,'done',JSON.stringify({settings,seed,ply:state.ply}));const result=core.results(state);assert(result);assert.deepEqual(Object.keys(result.scores),['light','dark']);assert(Object.values(result.scores).every(Number.isFinite));assert.equal(state.phase.deadline,null);totals.games++;state.winner===null?totals.draws++:totals.wins++;totals.maximumPlies=Math.max(totals.maximumPlies,state.ply);hash.update(JSON.stringify([settings,seed,state]));
  }
  reports.push({settings,playerCount:2,...totals});process.stdout.write(JSON.stringify(reports.at(-1))+'\n');
}
await mkdir(proofDirectory,{recursive:true});await writeFile(proofDirectory+'/matrix.json',JSON.stringify({command:'node scripts/matrix.mjs',games:7000,skills:'easy seeded legal play for exhaustive contract matrix; all3levels separately tested and compared in leagues',reports,transcriptSha256:hash.digest('hex')},null,2)+'\n');
