import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {build} from 'esbuild';
const proofDirectory=resolve(process.env.G10_EVIDENCE_DIR??'evidence/checks');await mkdir(proofDirectory+'/mutations',{recursive:true});
const source=await readFile('src/core.ts','utf8');await mkdir('.work/mutations',{recursive:true});
const mutations=[
  ['input admits extra fields',").max(21)}).strict(),", ").max(21)}),"],
  ['International input truncated to32 squares','.int().min(0).max(49)','.int().min(0).max(31)'],
  ['International variant ignored',"values.variant==='international'",'false'],
  ['forty-move house setting ignored',"values.drawPolicy==='fortyMove'",'false'],
  ['repetition setting inverted',"typeof values.repetition==='boolean'?values.repetition:true","typeof values.repetition==='boolean'?!values.repetition:true"],
  ['turn clock cap becomes30','Math.min(300,Math.round(seconds))','Math.min(30,Math.round(seconds))'],
  ['zero host time rejected','now>=0','now>0'],
  ['duplicate seats accepted','new Set(ctx.players.map(player=>player.id)).size!==2','false'],
  ['wrong player count accepted','ctx.players.length!==2','ctx.players.length===2'],
  ['disconnected seats always present','s.players[id].connected&&!s.left.includes(id)','true&&!s.left.includes(id)'],
  ['light side assigned wrong turn',"s.side===1?0:1","s.side===1?1:0"],
  ['same-tick phase uniqueness removed','Math.max(now,s.phaseClock+1)','now'],
  ['untimed game receives immediate clock','s.settings.turnSeconds>0','s.settings.turnSeconds>=0'],
  ['seed discarded','rng:seedRng(ctx.seed)','rng:seedRng(0)'],
  ['empty initialization misses automatic hold','state={...state,autoPaused:true','state={...state,autoPaused:false'],
  ['winner assigned to losing side',"s.order[winner===1?0:1]","s.order[winner===1?1:0]"],
  ['finish reenters move phase',"endReason:reason},'done',now)","endReason:reason},'move',now)"],
  ['opponent legal moves cause incorrect win','if(!legalMoves(next.board,next.variant,next.side).length)','if(legalMoves(next.board,next.variant,next.side).length)'],
  ['left seat reconnects','connected=!wasLeft&&!gone&&e.connected','connected=e.connected'],
  ['resume subtracts held time','next.phase.deadline+delta','next.phase.deadline-delta'],
  ['paused VIP skip forgets to hold next turn',"s.phase.paused&&next.phase.id!=='done'","false&&next.phase.id!=='done'"],
  ['timer ignores instance identity','e.startedAt===s.phase.startedAt&&',''],
  ['exact deadline does not fire','e.now>=s.phase.deadline','e.now>s.phase.deadline'],
  ['inactive seat can resign','e.playerId!==turnId(s)||',''],
  ['paused game accepts inputs/timers',"if(s.phase.paused||s.phase.id==='done')","if(s.phase.id==='done')"],
];
const baseline=spawnSync(process.execPath,['--test','--test-reporter=tap','tests/core.test.mjs'],{encoding:'utf8',maxBuffer:4*1024*1024});assert.equal(baseline.status,0,baseline.stdout+'\n'+baseline.stderr);
await writeFile(proofDirectory+'/mutations/baseline.tap',baseline.stdout+baseline.stderr);const rows=[];
for(let index=0;index<mutations.length;index++){
  const [name,before,after]=mutations[index],matches=source.split(before).length-1;assert.equal(matches,1,'Mutation must identify one actual source site: '+name);
  const path=resolve('.work/mutations/'+String(index+1).padStart(2,'0')+'.mjs');
  await build({stdin:{contents:source.replace(before,after),resolveDir:resolve('src'),sourcefile:'core-mutant.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'es2022',outfile:path,alias:{zod:resolve('node_modules/zod')},plugins:[{name:'shared-endgame',setup(api){api.onResolve({filter:/endgame\.js$/},()=>({path:resolve('dist/endgame.mjs'),external:true}));}}]});
  const result=spawnSync(process.execPath,['--test','--test-reporter=tap','tests/core.test.mjs'],{encoding:'utf8',env:{...process.env,G10_CORE:path},maxBuffer:4*1024*1024});const raw=result.stdout+result.stderr;await writeFile(proofDirectory+'/mutations/'+String(index+1).padStart(2,'0')+'.tap',raw);
  const assertionKilled=result.status!==0&&/not ok/.test(raw)&&(/ERR_ASSERTION|AssertionError/.test(raw));rows.push({id:index+1,name,before,after,exitCode:result.status,assertionKilled});process.stdout.write(JSON.stringify(rows.at(-1))+'\n');
}
const killed=rows.filter(row=>row.assertionKilled).length;assert.equal(rows.length,25);assert(killed>=24,JSON.stringify(rows));await writeFile(proofDirectory+'/mutations.json',JSON.stringify({command:'node scripts/mutations.mjs',baseline:'PASS, unchanged actual source',total:25,assertionKilled:killed,mutations:rows},null,2)+'\n');
