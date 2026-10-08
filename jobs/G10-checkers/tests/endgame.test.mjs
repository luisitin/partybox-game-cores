import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {probeEndgame,databaseCoverage} from '../dist/endgame.mjs';
import {referenceWdl,referenceTwoPieceRoots} from './reference-endgame.mjs';
import {referenceMoves,referenceAfter} from './reference-moves.mjs';
import {sparseBoard} from './reference-rule-cases.mjs';
const dataset=JSON.parse(readFileSync(new URL('../data/endgames.json',import.meta.url),'utf8'));
const dataKey=(board,variant,side)=>`${variant}:${side}:${board.map(piece=>piece+2).join('')}`;

test('production complete one-vs-one lookup matches independent WDL AND distance on every row',()=>{
  const reports=[],transcript=createHash('sha256');
  for(const variant of ['american','international']){
    const solved=referenceWdl([...referenceTwoPieceRoots(variant)],variant,50000);assert.equal(solved.complete,true);
    for(const entry of solved.entries){const hit=probeEndgame(entry.board,variant,entry.side);assert(hit,entry.key);const outcome={win:1,draw:0,loss:-1}[entry.value];assert.equal(hit.outcome,outcome,entry.key);assert.equal(hit.dtm,entry.distance,entry.key);transcript.update(JSON.stringify([entry.key,hit.outcome,hit.dtm]));}
    reports.push({variant,compared:solved.entries.length});
  }
  mkdirSync(new URL('../evidence/checks/',import.meta.url),{recursive:true});writeFileSync(new URL('../evidence/checks/endgame-differential.json',import.meta.url),JSON.stringify({command:'node --test tests/endgame.test.mjs',reports,transcriptSha256:transcript.digest('hex'),datasetSha256:createHash('sha256').update(readFileSync(new URL('../data/endgames.json',import.meta.url))).digest('hex'),scope:'Complete one-vs-one legal domain and terminal successors, not full six-piece coverage'},null,2)+'\n');
});

test('every generated three-to-six witness is independently one-turn terminal win',()=>{
  let compared=0;for(const [key,outcome,dtm] of dataset.rows){const [variant,sideText,pieces]=key.split(':'),board=[...pieces].map(char=>Number(char)-2),count=board.filter(Boolean).length;if(count<3)continue;compared++;const side=Number(sideText),moves=referenceMoves(board,variant,side);assert(moves.length);assert(moves.every(move=>move.captures.length>0));assert(moves.every(move=>!referenceAfter(board,move).some(piece=>piece&&Math.sign(piece)===-side)));assert.equal(outcome,1);assert.equal(dtm,1);const hit=probeEndgame(board,variant,side);assert.equal(hit.outcome,1);assert.equal(hit.dtm,1);}
  assert.equal(compared,4000);
});

test('six-piece full multi-jumps are proved and unresolved quiet material remains honest',()=>{
  for(const [variant,pieces] of [['american',{17:2,31:1,14:-1,15:-1,23:-1,22:-1}],['international',{40:1,49:1,36:-1,27:-1,18:-1,9:-1}]]){const board=sparseBoard(variant,pieces),hit=probeEndgame(board,variant,1);assert(hit);assert.equal(hit.outcome,1);assert.equal(hit.dtm,1);}
  const unknown=sparseBoard('american',{0:-2,2:-2,25:2,31:2});assert.equal(probeEndgame(unknown,'american',1),null);
  const above=sparseBoard('american',{0:-2,2:-2,4:-2,6:-2,25:2,29:2,31:2});assert.equal(probeEndgame(above,'american',1),null);
  assert.equal(databaseCoverage().fullSixPieceCoverage,false);
  for(let i=1;i<dataset.rows.length;i++)assert(dataset.rows[i-1][0]<dataset.rows[i][0]);
});

test('exact generator/dataset includes all legal one-per-side roots and cloned coverage',()=>{
  const keys=new Set(dataset.rows.map(row=>row[0]));for(const variant of ['american','international'])for(const root of referenceTwoPieceRoots(variant))assert(keys.has(dataKey(root.board,variant,root.side)));
  const coverage=databaseCoverage();coverage.maximumPieces=100;assert.equal(databaseCoverage().maximumPieces,6);
});
