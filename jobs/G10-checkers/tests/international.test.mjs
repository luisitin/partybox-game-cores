import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createInternationalDatabase,internationalRank} from '../dist/international.mjs';
import {createRng} from '../dist/core.mjs';
import {createReferenceInternational,referenceInternationalRank} from './reference-international.mjs';
import {referenceWdl,referenceTwoPieceRoots} from './reference-endgame.mjs';
import {referenceMoves} from './reference-moves.mjs';
import {evidence} from './evidence.mjs';
const bytes=path=>new Uint8Array(readFileSync(new URL('../data/international/'+path,import.meta.url)));
const dictionary=bytes('tunstall-v2.bin'),data=bytes('db2.bin'),indexText=readFileSync(new URL('../data/international/db2.idx',import.meta.url),'utf8');
const factory=createInternationalDatabase([{name:'db2',data,indexText}],dictionary);
const dictionaryView=new DataView(dictionary.buffer,dictionary.byteOffset,dictionary.byteLength);
const tables={lengths:Array.from({length:50},(_,row)=>Array.from({length:256},(_,column)=>dictionaryView.getUint16(2*(row*256+column),true))),offsets:Array.from({length:50},(_,row)=>Array.from({length:256},(_,column)=>dictionaryView.getUint16(25600+2*(row*256+column),true))),valueRuns:dictionary.slice(51200)};
const reference=createReferenceInternational(new Map([['db2',{data,indexText}]]),tables);
const outcome=value=>value==='win'?1:value==='loss'?-1:value==='draw'?0:null;

test('production actual2–5 WLD/ranks match 10,000 retained original C++ and independent queries',()=>{
  const files=[2,3,4,5].map(n=>({name:'db'+n,data:bytes('db'+n+'.bin'),indexText:readFileSync(new URL('../data/international/db'+n+'.idx',import.meta.url),'utf8')}));
  const all=createInternationalDatabase(files,dictionary),raw=readFileSync(new URL('../evidence/checks/international-original/international-original-reference.jsonl',import.meta.url),'utf8');
  assert.equal(createHash('sha256').update(raw).digest('hex'),'4aa8260f24306d6f28d2c81fd40b92285994f9c4b5ae1773135f4de6a463a49a');
  const rows=raw.trim().split('\n').map(line=>JSON.parse(line));assert.equal(rows.length,10000);let wins=0,losses=0,draws=0;
  for(const row of rows){const location=all.locate(row.board,row.side);assert(location);assert.equal(location.key,row.key);assert.equal(location.ordinal,row.ordinal);assert.equal(location.index,row.index);
    const expected=outcome(row.value);assert.equal(all.probe(row.board,row.side),expected,JSON.stringify(row));assert.equal(row.originalCpp,expected===1?1:expected===-1?2:3);
    if(expected===1)wins++;else if(expected===-1)losses++;else draws++;
  }
  assert.deepEqual({wins,losses,draws},{wins:2441,losses:2228,draws:5331});
  evidence('international-production-original.json',{cases:10000,wins,losses,draws,inputSha256:createHash('sha256').update(raw).digest('hex'),scope:'Actual supplied2–5 theoretical WLD; original unchanged Boost C++, independent reference, and production all agree; quiet6 not supplied'});
});

test('actual International dictionary/data match pinned licensed-source hashes',()=>{
  assert.equal(createHash('sha256').update(dictionary).digest('hex'),'92fa921a410c270c3126811dc2d8af22e1691aedaaf0d020ee01adbe572d26a9');
  assert.equal(createHash('sha256').update(data).digest('hex'),'305a1e7eabb4bab13577774009592e1614ddf8a4efe334d6fe3cb8221000b4ed');
  assert.equal(createHash('sha256').update(indexText).digest('hex'),'9622e861c67ea250396b384bb95fec00fd541964c3109bdc1b27ae7aae1f73f2');
  assert.deepEqual(factory.coverage().files,['db2']);assert.equal(factory.coverage().slices,4);assert.equal(factory.coverage().bytes,404);
});

test('production/reference International probes agree with independently closed full two-piece WLD',()=>{
  const solved=referenceWdl([...referenceTwoPieceRoots('international')],'international',50000);assert(solved.complete);
  let applicable=0,captures=0,opponentThreats=0;const transcript=createHash('sha256');
  for(const row of solved.entries){
    if(!row.board.some(piece=>piece>0)||!row.board.some(piece=>piece<0))continue;
    const current=referenceMoves(row.board,'international',row.side).some(move=>move.captures.length);
    const hit=factory.probe(row.board,row.side),other=reference.probe(row.board,row.side);
    assert.equal(hit,outcome(other),JSON.stringify(row));
    if(current){assert.equal(hit,null);captures++;}
    else{assert.equal(hit,outcome(row.value),JSON.stringify(row));applicable++;if(referenceMoves(row.board,'international',-row.side).some(move=>move.captures.length))opponentThreats++;}
    transcript.update(JSON.stringify([row.board,row.side,hit]));
  }
  assert(applicable>15000);assert(captures>0);assert(opponentThreats>0);
  evidence('international-two-piece.json',{applicable,captures,opponentThreats,transcriptSha256:transcript.digest('hex'),scope:'Full stored two-piece theoretical WLD where current capture exclusion applies; opponent-only threats are valid at <=6; broader payload is not yet integrated'});
});

test('10,000 International material/orientation ranks agree with separately authored reference',()=>{
  const rng=createRng(0x1A10C0DE),transcript=createHash('sha256');
  for(let n=0;n<10000;n++){
    const board=Array(50).fill(0),squares=rng.shuffle(Array.from({length:50},(_,i)=>i));
    for(let i=0;i<2+n%5;i++){
      const owner=i===0?1:i===1?-1:rng.chance(.5)?1:-1,square=squares[i];
      board[square]=owner*(rng.chance(.5)||(owner===1?square<5:square>=45)?2:1);
    }
    const side=rng.chance(.5)?1:-1,a=internationalRank(board,side),b=referenceInternationalRank(board,side);
    assert(a&&b);assert.deepEqual(a,b);transcript.update(JSON.stringify([board,side,a]));
  }
  evidence('international-ranks.json',{cases:10000,transcriptSha256:transcript.digest('hex'),scope:'All2–6 material rank arithmetic, both orientations; this does not establish absent3–6 data/probe coverage'});
});

test('International constructor snapshots buffers and rejects corrupt dictionaries/index metadata',()=>{
  const copyData=data.slice(),copyDictionary=dictionary.slice(),copy=createInternationalDatabase([{name:'db2',data:copyData,indexText}],copyDictionary);
  const board=Array(50).fill(0);board[0]=-2;board[49]=2;const expected=copy.probe(board,1);copyData.fill(255);copyDictionary.fill(0);assert.equal(copy.probe(board,1),expected);
  const zero=dictionary.slice();zero[0]=0;zero[1]=0;
  assert.throws(()=>createInternationalDatabase([{name:'db2',data,indexText}],zero),RangeError);
  for(const corrupt of [indexText+'INVALID\n',indexText.replace('0/0,0,39','0/5000,0,39'),indexText.replace('0/0,0,39','0/0,50,39'),indexText.replace('0/0,0,39','0/0,0,0'),indexText+indexText])assert.throws(()=>createInternationalDatabase([{name:'db2',data,indexText:corrupt}],dictionary),RangeError);
  assert.equal(copy.probe(Array(49).fill(0),1),null);assert.equal(copy.probe(board,0),null);board[1]=7;assert.equal(copy.probe(board,1),null);
  const coverage=copy.coverage();coverage.files.push('fake');assert.deepEqual(copy.coverage().files,['db2']);
});
