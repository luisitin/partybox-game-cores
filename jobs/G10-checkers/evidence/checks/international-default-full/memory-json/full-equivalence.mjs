// Private acceptance runner: only the immutable data containers differ.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,openSync,readSync,closeSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {referenceMoves,referenceAfter,referenceMoveKey} from '../../tests/reference-moves.mjs';
import {freeze,positionState} from '../../tests/helpers.mjs';
const directory=resolve('.work/memory-json-private/shadow-dist'),start=performance.now();
const core=await import(pathToFileURL(resolve(directory,'core.mjs'))),bots=await import(pathToFileURL(resolve(directory,'bots.mjs')));
const {searchWithInternationalBlocks}=await import(pathToFileURL(resolve(directory,'international-search.mjs')));
const importedSeconds=(performance.now()-start)/1000;
const base=resolve('evidence/checks/international-default-full'),expectedCases=JSON.parse(readFileSync(resolve(base,'transactions-48.json'))),expectedGames=JSON.parse(readFileSync(resolve(base,'complete-games.json')));
const canonical=value=>JSON.parse(JSON.stringify(value));
const sha=value=>createHash('sha256').update(value).digest('hex');
const manifest=JSON.parse(readFileSync('data/international/six/manifest.json')),
 dictionary=new Uint8Array(readFileSync('data/international/tunstall-v2.bin'));
const sources=['db2','db3','db4','db5',...manifest.files.map(file=>file.name)].sort().map(name=>({name,
 byteLength:name.startsWith('db6-')?manifest.files.find(file=>file.name===name).bytes:{db2:404,db3:21628,db4:1176396,db5:33886572}[name],
 indexText:readFileSync(name.startsWith('db6-')?'data/international/six/'+name+'.idx':'data/international/'+name+'.idx','ascii'),blocks:[]}));
const emptySources=()=>sources.map(file=>({...file,blocks:[]}));
function fetch(need){const six=need.file.startsWith('db6-'),chunk=Math.floor(need.offset/manifest.chunkBytes),
 path=six?'data/international/six/'+need.file+'.'+String(chunk).padStart(3,'0')+'.chunk':'data/international/'+need.file+'.bin';
 const handle=openSync(path,'r'),data=new Uint8Array(need.length);try{assert.equal(readSync(handle,data,0,need.length,six?need.offset%manifest.chunkBytes:need.offset),need.length);}finally{closeSync(handle);}return {offset:need.offset,data};}
function transaction(request,files){let retries=0,blocks=0,bytes=0;const before=JSON.stringify(request);
 for(;;){const result=searchWithInternationalBlocks(request,files,dictionary);assert.equal(JSON.stringify(request),before);
  if(!('missing' in result))return {...result,retries,blocks,bytes};
  assert.deepEqual(Object.keys(result),['missing']);assert(result.missing.length);assert(++retries<=100);
  for(const need of result.missing){const file=files.find(file=>file.name===need.file);assert(file);assert.equal(need.offset%4096,0);assert.equal(need.length,Math.min(4096,file.byteLength-need.offset));assert(!file.blocks.some(block=>block.offset===need.offset));file.blocks.push(fetch(need));blocks++;bytes+=need.length;}
 }
}
const report={status:'RUNNING',node:process.version,pid:process.pid,startedAt:new Date().toISOString(),importedSeconds,
 expectedTransactionsSha256:sha(readFileSync(resolve(base,'transactions-48.json'))),expectedGamesSha256:sha(readFileSync(resolve(base,'complete-games.json'))),
 scope:'New private static-JSON data container, unchanged compiled default game/search/decoder code. Compare exact serialized SearchReport fields, PRNG cursor, requested blocks and full game transitions with retained actual-default acceptance receipts; signed zero follows the JSON protocol.'};
const outputs=[],games=[];
for(const expected of expectedCases){const rng=core.createRng(expected.cursor.seed);assert.deepEqual(rng.state(),expected.cursor);
 const request=freeze({position:expected.position,settings:expected.settings,skill:expected.skill,cursor:expected.cursor}),before=JSON.stringify(request);
 const actual=bots.searchMove(request.position,request.settings,rng,request.skill);
 assert.deepEqual(canonical(actual),expected.report,expected.name);assert.deepEqual(rng.state(),expected.nextCursor,expected.name);
 const partial=transaction(request,emptySources());assert.deepEqual(canonical(partial.report),expected.report);assert.deepEqual(partial.cursor,expected.nextCursor);
 assert.equal(partial.retries,expected.retries);assert.equal(partial.blocks,expected.blocks);assert.equal(partial.bytes,expected.bytes);
 assert.equal(JSON.stringify(request),before);assert(referenceMoves(request.position.board,'international',request.position.side).some(move=>referenceMoveKey(move)===referenceMoveKey(actual.move)));
 outputs.push({name:expected.name,report:canonical(actual),cursor:rng.state(),retries:partial.retries,blocks:partial.blocks,bytes:partial.bytes});
}
report.transactions=outputs;report.transactionSeconds=(performance.now()-start)/1000-importedSeconds;
writeFileSync('.work/memory-json-private/full-equivalence-report.json',JSON.stringify(report,null,2)+'\n');
for(const [index,expected] of expectedGames.entries()){
 let state=positionState(core,expected.initial.board,'international',expected.initial.side,{settings:expected.settings,...(index===2?{quietPlies:49}:{})});
 const rng=core.createRng(0x661000+index),files=emptySources(),turns=[];
 for(const turn of expected.turns){assert.equal(state.phase.id,'move');assert.equal(state.side,turn.side);assert.equal(state.ply,turn.ply);
  const position={board:state.board,side:state.side,variant:state.variant,quietPlies:state.quietPlies,ply:state.ply,repetition:state.repetition,drawWindows:state.drawWindows};
  const request=freeze({position,settings:expected.settings,skill:'sharp',cursor:rng.state()}),actual=bots.searchMove(position,expected.settings,rng,'sharp'),block=transaction(request,files);
  assert.deepEqual(canonical(actual),turn.report);assert.deepEqual(canonical(block.report),turn.report);assert.deepEqual(block.cursor,turn.cursor);assert.deepEqual(rng.state(),turn.cursor);
  assert(referenceMoves(state.board,'international',state.side).some(move=>referenceMoveKey(move)===referenceMoveKey(actual.move)));
  const previous=state;state=core.reduce(freeze(state),{type:'input',playerId:state.order[state.side===1?0:1],input:{type:'move',path:actual.move.path},now:1001+turns.length});
  assert.deepEqual(state.board,referenceAfter(previous.board,actual.move,previous.side));assert.deepEqual(state.board,turn.board);assert.equal(state.endReason,turn.endReason);
  turns.push({ply:previous.ply,side:previous.side,report:canonical(actual),cursor:rng.state(),board:state.board,endReason:state.endReason});
 }
 assert.equal(state.phase.id,'done');assert.equal(state.winner,expected.winner);assert.equal(state.endReason,expected.endReason);
 games.push({initial:expected.initial,settings:expected.settings,turns,winner:state.winner,endReason:state.endReason});
}
assert.deepEqual(games,expectedGames);
const prepared=JSON.parse(readFileSync('.work/memory-json-private/preparation.json')),moduleHashes={};
for(const [name,expected] of Object.entries(prepared.modules)){const digest=createHash('sha256');for await(const bytes of createReadStream(resolve(directory,name)))digest.update(bytes);moduleHashes[name]=digest.digest('hex');assert.equal(moduleHashes[name],expected);}
report.status='PASS';report.completedAt=new Date().toISOString();report.games=games;report.totalSeconds=(performance.now()-start)/1000;report.finalUsage=process.resourceUsage();report.finalMemory=process.memoryUsage();report.moduleSha256=moduleHashes;
report.gamesTranscriptSha256=sha(JSON.stringify(games));report.transactionTranscriptSha256=sha(JSON.stringify(outputs));
writeFileSync('.work/memory-json-private/full-equivalence-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',cases:outputs.length,games:games.length,gameLengths:games.map(game=>game.turns.length),totalSeconds:report.totalSeconds,maxRSSKiB:report.finalUsage.maxRSS,moduleHashes}));
