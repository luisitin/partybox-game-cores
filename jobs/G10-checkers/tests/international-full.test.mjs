// Independently authored acceptance tests of the actual public default corpus.
// The retained queries were checked against unchanged original Boost C++ and
// the separately authored reference reader before this integration existed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,openSync,readSync,closeSync,createReadStream} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import * as core from '../dist/core.mjs';
import {searchMove} from '../dist/bots.mjs';
import {internationalCorpus,probeEndgame,databaseCoverage} from '../dist/endgame.mjs';
import {searchWithInternationalBlocks} from '../dist/international-search.mjs';
import {referenceMoves,referenceAfter as referenceApply,referenceMoveKey} from './reference-moves.mjs';
import {referenceInternationalRank,createReferenceInternational,unpackReferenceInternationalDictionary} from './reference-international.mjs';
import {freeze,positionState} from './helpers.mjs';

const root=new URL('../',import.meta.url),start=performance.now();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inputPath=new URL('evidence/checks/international-original-complete/international-original-reference.jsonl',root);
const raw=readFileSync(inputPath,'utf8'),rows=raw.trim().split('\n').map(JSON.parse);
assert.equal(hash(raw),'b47f0d22bbf35757eba24a34d7e0b02bbddbc6651985d43dd38c828c51908167');
assert.equal(rows.length,10000);
const out=resolve(process.env.G10_EVIDENCE_DIR??new URL('evidence/checks/international-default-full/',root).pathname);
mkdirSync(out,{recursive:true});
const save=(name,value)=>writeFileSync(resolve(out,name),JSON.stringify(value,null,2)+'\n');
const cfg=(drawPolicy='official',repetition=true)=>({variant:'international',drawPolicy,repetition,turnSeconds:0});
const key=(board,side)=>`international:${side}:${board.map(p=>p+2).join('')}`;
const referenceAfter=(board,move)=>referenceApply(board,move,Math.sign(board[move.path[0]]));
const pos=(row,extra={})=>({board:[...row.board],side:row.side,variant:'international',quietPlies:0,ply:0,repetition:{[key(row.board,row.side)]:1},drawWindows:[],...extra});
const outcome=word=>word==='win'?1:word==='loss'?-1:word==='draw'?0:null;
const materials=[];
for(let b=3;b<=5;b++)for(let bk=0;bk<=b;bk++)for(let wk=0;wk<=6-b;wk++){
  if(b===3&&bk<wk)continue;
  materials.push([b-bk,bk,6-b-wk,wk]);
}
materials.sort((a,b)=>a.join(',').localeCompare(b.join(',')));
assert.equal(materials.length,37);
const expectedFiles=['db2','db3','db4','db5',...materials.map(tuple=>'db6-'+tuple.join(''))].sort();
const record={schemaVersion:1,command:['node','--test','tests/international-full.test.mjs'],pid:process.pid,
  startedAt:new Date().toISOString(),inputSha256:hash(raw),scope:'Actual public default Node corpus and game API; full2–6 theoretical WLD, independent capture/draw rules, exact bounded-block search retry equivalence. Browser execution is a separate proof.',checks:[]};
record.invocation=process.env.G10_TEST_COMMAND??'node --test tests/international-full.test.mjs';
record.nodeArguments=[...process.execArgv];
record.expectedChecks=Number(process.env.G10_EXPECTED_CHECKS??4);
assert(Number.isInteger(record.expectedChecks)&&record.expectedChecks>=1&&record.expectedChecks<=4);
let peakRss=process.memoryUsage().rss;
const memory=()=>{peakRss=Math.max(peakRss,process.memoryUsage().rss);};
const check=(name,details)=>{memory();record.checks.push({name,...details});save('report.json',{...record,status:'RUNNING',peakRss});};
const inputPaths=['tests/international-full.test.mjs','tests/reference-moves.mjs','tests/reference-international.mjs',
  'dist/core.mjs','dist/bots.mjs','dist/endgame.mjs','dist/international-search.mjs',
  'src/core.ts','src/bots.ts','src/endgame.ts','src/international-search.ts','data/international/tunstall-v2.bin','data/international/six/manifest.json'];
async function inputHashes(){const hashes={};for(const path of inputPaths){const digest=createHash('sha256');for await(const bytes of createReadStream(new URL(path,root)))digest.update(bytes);hashes[path]=digest.digest('hex');}return hashes;}
test.before(async()=>{record.inputSha256Before=await inputHashes();save('inputs-before.json',record.inputSha256Before);});

test('actual public default has all41 files/156 slices and agrees with all10k native/reference cases',async()=>{
  const coverage=internationalCorpus.coverage();
  assert.deepEqual([...coverage.files].sort(),expectedFiles);
  assert.equal(coverage.slices,156);assert.equal(coverage.bytes,1006478762);assert.equal(coverage.maximumPieces,6);
  const installed=databaseCoverage().byVariant.international;
  assert.equal(installed.fullQuietSixPieceCorpus,true);assert.equal(installed.maximumInstalledPieces,6);
  const orientations=new Set(),classes=new Set(),counts={win:0,loss:0,draw:0},transcript=[];
  let secondSubslice=0,opponentThreats=0;
  for(const row of rows){
    const tuple=materials[row.id%37],reversed=Math.floor(row.id/37)%2===1;
    const physical=[row.board.filter(p=>p===-1).length,row.board.filter(p=>p===-2).length,row.board.filter(p=>p===1).length,row.board.filter(p=>p===2).length];
    assert.deepEqual(physical,reversed?[tuple[2],tuple[3],tuple[0],tuple[1]]:tuple,`Independent material roster ${row.id}`);
    assert.equal(row.file,'db6-'+tuple.join(''));
    classes.add(tuple.join(','));orientations.add(`${tuple}:${row.side}:${reversed}`);
    const independent=referenceInternationalRank(row.board,row.side),actual=internationalCorpus.locate(row.board,row.side);
    assert.deepEqual(actual,independent,`Independent rank ${row.id}`);
    assert.equal(actual.key,row.key);assert.equal(actual.index,row.index);assert.equal(actual.ordinal,row.ordinal);
    assert(!referenceMoves(row.board,'international',row.side).some(move=>move.captures.length));
    const expected=outcome(row.value),value=internationalCorpus.probe(row.board,row.side);
    assert.equal(value,expected,`Default corpus ${row.id}`);
    assert.equal(row.originalCpp,expected===1?1:expected===-1?2:3);
    const hit=probeEndgame(row.board,'international',row.side);
    assert(hit);assert.equal(hit.outcome,expected);assert.equal(hit.source,'kingsrow');assert.equal(hit.pieceCount,6);
    counts[row.value]++;transcript.push([row.id,value]);
    if(row.index>=2147483648)secondSubslice++;
    if(referenceMoves(row.board,'international',-row.side).some(move=>move.captures.length))opponentThreats++;
  }
  assert.equal(classes.size,37);assert.equal(orientations.size,148);assert.equal(secondSubslice,22);assert(opponentThreats>0);
  assert.deepEqual(counts,{win:2880,loss:3106,draw:4014});
  const transcriptRaw=transcript.map(value=>JSON.stringify(value)+'\n').join('');
  writeFileSync(resolve(out,'default-probes.jsonl'),transcriptRaw);
  save('second-source-30.json',rows.filter(row=>row.id%333===0).slice(0,30).map(row=>({
    id:row.id,board:row.board,side:row.side,file:row.file,key:row.key,index:row.index,
    originalCpp:row.originalCpp,independentValue:row.value,actualDefaultValue:internationalCorpus.probe(row.board,row.side),
    source:'Retained unchanged original Boost C++ transcript + independently authored reader; replayed through actual default Node corpus.'})));
  check('default-10000',{cases:10000,coverage,classes:classes.size,orientations:orientations.size,counts,secondSubslice,opponentThreats,transcriptSha256:hash(transcriptRaw)});
});

const dictionary=new Uint8Array(readFileSync(new URL('data/international/tunstall-v2.bin',root)));
const lower=createReferenceInternational(new Map([2,3,4,5].map(n=>['db'+n,{
  data:new Uint8Array(readFileSync(new URL('data/international/db'+n+'.bin',root))),
  indexText:readFileSync(new URL('data/international/db'+n+'.idx',root),'ascii')}])) ,unpackReferenceInternationalDictionary(dictionary));
function closedCapture(board,side){
  const legal=referenceMoves(board,'international',side);
  if(!legal.length)return -1;
  if(!legal[0].captures.length){const value=outcome(lower.probe(board,side));assert.notEqual(value,null);return value;}
  return Math.max(...legal.map(move=>-closedCapture(referenceAfter(board,move),-side)))||0;
}
const captureBoard=Array(50).fill(0);for(const [square,piece] of [[20,1],[24,1],[16,-1],[7,-1],[19,-1],[45,-2]])captureBoard[square]=piece;
const captureCase={board:captureBoard,side:1};
const immediateBoard=Array(50).fill(0);for(const [square,piece] of [[40,1],[0,2],[36,-1],[27,-1],[18,-1],[9,-1]])immediateBoard[square]=piece;
const immediateCase={board:immediateBoard,side:1};
const kingRow=rows.find(row=>row.value==='win'&&row.board.every(p=>Math.abs(p)!==1)&&
  referenceMoves(row.board,'international',row.side).every(move=>referenceMoves(referenceAfter(row.board,move),'international',-row.side).length>0));
assert(kingRow,'A pre-existing native winning all-king witness with nonterminal children is required');
const manRow=rows.find(row=>row.file==='db6-3030'&&row.value==='win');assert(manRow);
function coreChoice(position,settings,seed){
  const state=freeze(positionState(core,position.board,'international',position.side,{...position,settings})),before=JSON.stringify(state);
  const rng=core.createRng(seed),report=searchMove(position,settings,rng,'sharp');
  const playerId=state.order[state.side===1?0:1],chosen=core.sampleInput(state,playerId,core.createRng(seed),'sharp');
  assert.deepEqual(chosen,{type:'move',path:report.move.path});
  assert.equal(JSON.stringify(state),before);
  assert(referenceMoves(state.board,'international',state.side).some(move=>referenceMoveKey(move)===referenceMoveKey(report.move)));
  const next=core.reduce(state,{type:'input',playerId,input:chosen,now:1001});
  assert.deepEqual(next.board,referenceAfter(state.board,report.move));
  return {report,next,input:chosen};
}
test('actual default Strong game respects captures, official/house clocks and third repetition',()=>{
  assert.equal(internationalCorpus.probe(captureBoard,1),null,'Current-side capture must be rejected by the raw corpus');
  const captureExpected=closedCapture(captureBoard,1),captureHit=probeEndgame(captureBoard,'international',1);
  assert(captureHit);assert.equal(captureHit.outcome,captureExpected);
  const captures=coreChoice(pos(captureCase),cfg(),7001);
  assert(captures.report.move.captures.length>=2);
  const official=coreChoice(pos(kingRow,{quietPlies:49}),cfg(),7002);
  assert(official.report.score===0);assert.equal(official.report.corpusHits,0);
  assert.equal(official.next.endReason,'twenty-five-move-draw');
  const house=coreChoice(pos(kingRow,{quietPlies:79}),cfg('fortyMove'),7002);
  assert(house.report.score===0);assert.equal(house.next.endReason,'forty-move-draw');
  const fresh=coreChoice(pos(kingRow,{quietPlies:49}),cfg('fortyMove'),7002);
  assert(fresh.report.corpusHits>0);assert.equal(fresh.next.phase.id,'move');
  const repeat={};for(const move of referenceMoves(kingRow.board,'international',kingRow.side))repeat[key(referenceAfter(kingRow.board,move),-kingRow.side)]=2;
  const repetition=coreChoice(pos(kingRow,{repetition:{[key(kingRow.board,kingRow.side)]:1,...repeat}}),cfg(),7003);
  assert(repetition.report.score===0);assert.equal(repetition.report.corpusHits,0);assert.equal(repetition.next.endReason,'threefold-repetition');
  const irreversible=coreChoice(pos(manRow,{quietPlies:49}),cfg(),7004);
  assert.equal(irreversible.next.quietPlies,0);assert.equal(Object.keys(irreversible.next.repetition).length,1);
  assert.equal(Object.values(irreversible.next.repetition)[0],1);assert(irreversible.report.corpusHits>0);
  const win=coreChoice(pos(immediateCase,{quietPlies:49}),cfg(),7005);
  assert.equal(win.next.phase.id,'done');assert.notEqual(win.next.winner,null);
  check('strong-core-capture-history',{captureExpected,captureHit,captures,official,house,fresh,repetition,irreversible,win,
    sourceWitnesses:{king:kingRow.id,man:manRow.id}});
});

// Forty-eight cases are fixed before executing either transaction or default
// search. The first37 exercise every six-piece material, not selected successes.
const transactionCases=materials.map(tuple=>{const row=rows.find(r=>r.file==='db6-'+tuple.join(''));assert(row);return {name:row.file,position:pos(row),settings:cfg(),skill:'sharp'};});
transactionCases.push(
 {name:'mandatory-multicapture',position:pos(captureCase),settings:cfg(),skill:'sharp'},
 {name:'immediate-win-before-clock',position:pos(immediateCase,{quietPlies:49}),settings:cfg(),skill:'sharp'},
 {name:'official-last-ply',position:pos(kingRow,{quietPlies:49}),settings:cfg(),skill:'sharp'},
 {name:'house-last-ply',position:pos(kingRow,{quietPlies:79}),settings:cfg('fortyMove'),skill:'sharp'},
 {name:'man-reset',position:pos(manRow,{quietPlies:49}),settings:cfg(),skill:'sharp'},
 {name:'repeated-history',position:pos(kingRow,{repetition:{[key(kingRow.board,kingRow.side)]:2}}),settings:cfg(),skill:'sharp'},
 ...['easy','normal','sharp'].map(skill=>({name:'quiet-'+skill,position:pos(kingRow),settings:cfg(),skill})),
 ...['easy','normal'].map(skill=>({name:'capture-'+skill,position:pos(captureCase),settings:cfg(),skill}))
);
assert.equal(transactionCases.length,48);
save('predeclared-cases.json',transactionCases);
const privateSource=process.env.G10_INTERNATIONAL_SOURCE;
const originalReport=JSON.parse(readFileSync(new URL('evidence/checks/international-original-complete/international-original-reference-report.json',root)));
const sixManifest=JSON.parse(readFileSync(new URL('data/international/six/manifest.json',root)));
const lowerBytes={db2:404,db3:21628,db4:1176396,db5:33886572};
const sourceMetadata=expectedFiles.map(name=>({name,byteLength:name.startsWith('db6-')?
  originalReport.sourceFiles[name].bytes:lowerBytes[name],
  indexText:readFileSync(name.startsWith('db6-')?new URL('data/international/six/'+name+'.idx',root):new URL('data/international/'+name+'.idx',root),'ascii'),blocks:[]}));
const makeSources=()=>sourceMetadata.map(source=>({...source,blocks:[]}));
function materialize(need){
  const six=need.file.startsWith('db6-'),chunk=Math.floor(need.offset/sixManifest.chunkBytes);
  const path=six?(privateSource?resolve(privateSource,need.file+'.cpr1'):
    new URL('data/international/six/'+need.file+'.'+String(chunk).padStart(3,'0')+'.chunk',root)):
    new URL('data/international/'+need.file+'.bin',root);
  const physicalOffset=six&&!privateSource?need.offset%sixManifest.chunkBytes:need.offset;
  const descriptor=openSync(path,'r'),data=new Uint8Array(need.length);
  try{assert.equal(readSync(descriptor,data,0,need.length,physicalOffset),need.length);}finally{closeSync(descriptor);}
  return {offset:need.offset,data};
}
function transact(request,sources){
  const before=JSON.stringify(request);let retries=0,bytes=0,blocks=0;
  for(;;){
    const result=searchWithInternationalBlocks(request,sources,dictionary);assert.equal(JSON.stringify(request),before);
    if(!('missing' in result))return {...result,retries,bytes,blocks};
    assert.deepEqual(Object.keys(result),['missing']);assert(result.missing.length);assert(++retries<=100,'Finite bounded-block retry');
    for(const need of result.missing){
      const file=sources.find(source=>source.name===need.file);assert(file);assert(need.offset>=0&&need.offset%4096===0);
      assert.equal(need.length,Math.min(4096,file.byteLength-need.offset));
      assert(!file.blocks.some(block=>block.offset===need.offset),'No request for an already supplied block');
      file.blocks.push(materialize(need));blocks++;bytes+=need.length;
    }
  }
}
test('48 predeclared default/block transactions preserve every report field and random cursor',()=>{
  const outputs=[];
  for(const [index,item] of transactionCases.entries()){
    const rng=core.createRng(0x660000+index),cursor=rng.state();
    const request=freeze({...item,cursor}),expected=searchMove(item.position,item.settings,rng,item.skill);
    const actual=transact(request,makeSources());
    assert.deepEqual(actual.report,expected,item.name);assert.deepEqual(actual.cursor,rng.state(),item.name);
    assert(referenceMoves(item.position.board,'international',item.position.side).some(move=>referenceMoveKey(move)===referenceMoveKey(actual.report.move)));
    outputs.push({name:item.name,skill:item.skill,position:item.position,settings:item.settings,cursor,
      report:actual.report,nextCursor:actual.cursor,retries:actual.retries,blocks:actual.blocks,bytes:actual.bytes});
  }
  assert(outputs.some(row=>row.retries>0));assert(outputs.some(row=>row.report.corpusHits>0));
  save('transactions-48.json',outputs);check('transactions-48',{cases:outputs.length,retries:outputs.reduce((n,r)=>n+r.retries,0),
    blocks:outputs.reduce((n,r)=>n+r.blocks,0),bytes:outputs.reduce((n,r)=>n+r.bytes,0),transcriptSha256:hash(JSON.stringify(outputs))});
});

test('three complete game transcripts match default/block decisions and independent legal transitions',()=>{
  const games=[];
  for(const [index,initial] of [immediateCase,captureCase,kingRow].entries()){
    // The king witness starts at the final official ply. The other games use
    // the explicit forty-ply house clock to bound complete continuation.
    const settings=cfg(index===2?'official':'fortyMove'),extra=index===2?{quietPlies:49}:{};
    let state=positionState(core,initial.board,'international',initial.side,{...extra,settings});
    const rng=core.createRng(0x661000+index),sources=makeSources(),turns=[];
    while(state.phase.id!=='done'&&turns.length<400){
      const request=freeze({position:pos(state,{quietPlies:state.quietPlies,ply:state.ply,repetition:state.repetition,drawWindows:state.drawWindows}),settings,skill:'sharp',cursor:rng.state()});
      const expected=searchMove(request.position,settings,rng,'sharp'),actual=transact(request,sources);
      assert.deepEqual(actual.report,expected);assert.deepEqual(actual.cursor,rng.state());
      const legal=referenceMoves(state.board,'international',state.side);assert(legal.some(move=>referenceMoveKey(move)===referenceMoveKey(expected.move)));
      const playerId=state.order[state.side===1?0:1],previous=state;
      state=core.reduce(freeze(state),{type:'input',playerId,input:{type:'move',path:expected.move.path},now:1001+turns.length});
      assert.deepEqual(state.board,referenceAfter(previous.board,expected.move));
      turns.push({ply:previous.ply,side:previous.side,report:expected,cursor:rng.state(),board:state.board,endReason:state.endReason});
    }
    assert.equal(state.phase.id,'done','A complete transcript must actually terminate');
    games.push({initial,settings,turns,winner:state.winner,endReason:state.endReason});
  }
  save('complete-games.json',games);check('complete-games',{games:games.length,lengths:games.map(game=>game.turns.length),
    endings:games.map(game=>game.endReason),transcriptSha256:hash(JSON.stringify(games))});
});

test.after(async()=>{
  const hashes=await inputHashes();assert.deepEqual(hashes,record.inputSha256Before,'Every actual public test input must remain unchanged during the proof');
  memory();save('report.json',{...record,status:record.checks.length===record.expectedChecks?'PASS':'INCOMPLETE',completedAt:new Date().toISOString(),
    wallSeconds:(performance.now()-start)/1000,peakRss,resourceUsage:process.resourceUsage(),sourceSha256:hashes});
});
