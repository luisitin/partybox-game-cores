import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evidence} from './evidence.mjs';
import {createHash} from 'node:crypto';
import {createChinookDatabase} from '../dist/chinook.mjs';
import {createRng} from '../dist/core.mjs';
import {createReferenceChinook} from './reference-chinook.mjs';
import {referenceWdl,referenceTwoPieceRoots} from './reference-endgame.mjs';
import {referenceMoves} from './reference-moves.mjs';
const bytesPath=process.env.G10_CHINOOK_BYTES??new URL('../data/chinook/DB6.bin',import.meta.url),indexPath=process.env.G10_CHINOOK_INDEX??new URL('../data/chinook/DB6.idx',import.meta.url);
const bytes=new Uint8Array(readFileSync(bytesPath)),indexText=readFileSync(indexPath,'utf8');
const production=createChinookDatabase(bytes,indexText),reference=createReferenceChinook(bytes,indexText),convert=value=>value==='win'?1:value==='loss'?-1:value==='draw'?0:null;

test('acquired full American corpus bytes/index match fixed primary-source hashes',()=>{
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'baee42a2b49390edd96e5a751189366275619c941d79021f3ca45774c3e7071f');
  assert.equal(createHash('sha256').update(indexText).digest('hex'),'10cb5cfc2a8c67e18c322563c17ceef0adeac87786a16c767c4616e9a574f4fd');
  assert.equal(production.coverage().slices,3935);assert.equal(production.coverage().maximumPieces,6);assert.equal(production.coverage().bytes,48132029);
  for(let total=2;total<=6;total++)for(let bk=0;bk<=total;bk++)for(let wk=0;wk<=total-bk;wk++)for(let bp=0;bp<=total-bk-wk;bp++){const wp=total-bk-wk-bp;if(bk+bp===0||wk+wp===0)continue;assert(reference.coverage.pieceTypeTuples.includes(''+bk+wk+bp+wp));}
});

test('both independent corpus readers match exact fully closed two-piece WDL where wire format applies',()=>{
  const solved=referenceWdl([...referenceTwoPieceRoots('american')],'american',50000);assert(solved.complete);let compared=0,excluded=0;
  for(const entry of solved.entries){if(!entry.board.some(piece=>piece>0)||!entry.board.some(piece=>piece<0))continue;
    const blocked=referenceMoves(entry.board,'american',entry.side).some(move=>move.captures.length)||referenceMoves(entry.board,'american',-entry.side).some(move=>move.captures.length);
    const result=production.probe(entry.board,entry.side),other=reference.probe(entry.board,entry.side);if(blocked){assert.equal(result,null);assert.equal(other,null);excluded++;}
    else{assert.equal(result,convert(entry.value),JSON.stringify(entry));assert.equal(result,convert(other));compared++;}
  }
  assert(compared>6000);assert(excluded>0);
});

test('10,000 mixed2–6piece production ranks/decodes equal independent enumeration and reject capture threats',()=>{
  const rng=createRng(0x6C10CAFE),transcript=createHash('sha256'),spots=[];let uniform=0,varying=0,applicable=0,excluded=0;
  for(let n=0;n<10000;n++){
    const count=rng.int(2,6),board=Array(32).fill(0),cells=rng.shuffle(Array.from({length:32},(_,i)=>i)).slice(0,count),side=rng.chance(.5)?1:-1;
    for(let k=0;k<count;k++){const owner=k===0?1:k===1?-1:rng.chance(.5)?1:-1,square=cells[k],king=rng.chance(.4)||(owner===1?square<4:square>=28);board[square]=owner*(king?2:1);}
    const a=production.locate(board,side),b=reference.locate(board,side);assert(a&&b,JSON.stringify({board,side,a,b}));assert.equal(a.slice,b.key);
    if(b.uniform===null){assert.equal(a.ordinal,b.ordinal,JSON.stringify({board,side,a,b}));varying++;}else uniform++;
    const hit=production.probe(board,side),other=reference.probe(board,side);assert.equal(hit,convert(other),JSON.stringify({board,side,a,b,hit,other}));
    const captures=referenceMoves(board,'american',side).some(move=>move.captures.length)||referenceMoves(board,'american',-side).some(move=>move.captures.length);
    if(captures){assert.equal(hit,null);excluded++;}else{assert.notEqual(hit,null);applicable++;if(spots.length<30)spots.push({board,side,material:count,slice:a.slice,ordinal:a.ordinal,production:hit,independent:other,wireCaptureFree:true,source:'https://webdocs.cs.ualberta.ca/~chinook/databases/code.c',dataSource:'https://webdocs.cs.ualberta.ca/~chinook/DataBases/DB6.zip'});}
    transcript.update(JSON.stringify([board,side,a,hit]));
  }
  assert(uniform>0&&varying>0&&applicable>0&&excluded>0);assert.equal(spots.length,30);evidence('chinook-differential.json',{command:'node --test tests/chinook.test.mjs',cases:10000,uniform,varying,applicable,excluded,transcriptSha256:transcript.digest('hex'),spots,scope:'Wire-supported no-capture-for-either-side positions; threat resolution is separately required'});
});

test('production corpus factory snapshots inputs and rejects damaged or incompatible metadata',()=>{
  const fixtureBytes=new Uint8Array([0]),fixtureIndex='BASE1100.00 =\nS 0 0/0\nE 995 0/1\n',snapshot=createChinookDatabase(fixtureBytes,fixtureIndex),board=Array(32).fill(0);board[28]=2;board[29]=-2;const before=snapshot.probe(board,1);assert.equal(before,0);fixtureBytes[0]=242;assert.equal(snapshot.probe(board,1),before);
  for(const corrupt of [fixtureIndex+'INVALID\n',fixtureIndex.replace('E 995','E 0'),fixtureIndex.replace('0/1','0/1024'),fixtureIndex.replace('S 0','S 1'),fixtureIndex+'BASE1100.00 ==\n'])assert.throws(()=>createChinookDatabase(new Uint8Array([0]),corrupt),RangeError);
  assert.equal(snapshot.probe([...board,0],1),null);assert.equal(snapshot.probe(board,0),null);const invalid=[...board];invalid[3]=7;assert.equal(snapshot.probe(invalid,1),null);
});
