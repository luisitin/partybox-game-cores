import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import * as core from '../dist/core.mjs';
import {legalMoves,positionKey} from '../dist/moves.mjs';
import {context,positionState,freeze} from './helpers.mjs';
import {PUBLISHED_DRAW_REGRESSION,sparseBoard} from './reference-rule-cases.mjs';
const {drawReason,nextPosition,endingWindows}=await import(process.env.G10_DRAWS?pathToFileURL(process.env.G10_DRAWS).href:'../dist/draws.mjs');
const config=(variant='american',extra={})=>({variant,drawPolicy:'official',repetition:true,turnSeconds:0,...extra});
const position=(variant,board,extra={})=>({board,variant,side:1,ply:0,quietPlies:0,repetition:{[positionKey(board,1,variant)]:1},drawWindows:[],...extra});

test('source-backed forty/25 move allowances use both players, with exact boundary',()=>{
  for(const [variant,policy,limit] of [['american','official',80],['international','official',50],['international','fortyMove',80]]){
    const board=sparseBoard(variant,variant==='american'?{0:2,31:-2}:{0:2,49:-2}),settings=config(variant,{drawPolicy:policy});
    assert.equal(drawReason(position(variant,board,{quietPlies:limit-1}),settings),null);
    assert.equal(drawReason(position(variant,board,{quietPlies:limit}),settings),limit===50?'twenty-five-move-draw':'forty-move-draw');
  }
});

test('quiet king moves increment while every man move and capture reset counters/history',()=>{
  const cases=[{board:sparseBoard('american',{18:2,0:-2}),path:[18,14],quiet:10},
    {board:sparseBoard('american',{18:1,0:-2}),path:[18,14],quiet:0},
    {board:sparseBoard('american',{18:2,14:-1,0:-2}),path:[18,9],quiet:0}];
  for(const fixture of cases){const move=legalMoves(fixture.board,'american',1).find(move=>JSON.stringify(move.path)===JSON.stringify(fixture.path));assert(move);const first=freeze(position('american',fixture.board,{quietPlies:9,repetition:{old:2},ply:20}));
    const next=nextPosition(first,move,config());assert.equal(next.quietPlies,fixture.quiet);assert.equal(next.ply,21);assert.equal(next.side,-1);assert.equal(next.repetition[positionKey(next.board,-1,'american')],1);assert.equal(Object.hasOwn(next.repetition,'old'),fixture.quiet>0);
  }
});

test('threefold includes side to move and can be disabled explicitly',()=>{
  const board=sparseBoard('american',{18:2,0:-2});const key=positionKey(board,1,'american'),other=positionKey(board,-1,'american');assert.notEqual(key,other);
  const state=position('american',board,{repetition:{[key]:3,[other]:1}});assert.equal(drawReason(state,config()),'threefold-repetition');assert.equal(drawReason(state,config('american',{repetition:false})),null);
  const sameBoardOtherSide={...state,side:-1};assert.equal(drawReason(sameBoardOtherSide,config()),null);
});

test('official king windows start after creation, preserve old deadlines and intersect',()=>{
  const board=sparseBoard('international',{2:-2,45:2,46:2,47:2});const windows=endingWindows(board,'international',[],12,'official');assert.deepEqual(windows,[{kind:'sixteen',weak:-1,started:12,limit:32}]);
  assert.equal(drawReason(position('international',board,{ply:43,drawWindows:windows}),config('international')),null);
  assert.equal(drawReason(position('international',board,{ply:44,drawWindows:windows}),config('international')),'sixteen-move-ending');
  const smaller=[...board];smaller[45]=0;const combined=endingWindows(smaller,'international',windows,26,'official');assert.deepEqual(combined,[...windows,{kind:'five',weak:-1,started:26,limit:10}]);assert.equal(combined[0].started,12);
  const duplicate=endingWindows(smaller,'international',combined,30,'official');assert.deepEqual(duplicate,combined);assert.notEqual(duplicate,combined);assert.notEqual(duplicate[0],combined[0]);
  assert.equal(drawReason(position('international',smaller,{ply:35,drawWindows:[combined[1]]}),config('international')),null);assert.equal(drawReason(position('international',smaller,{ply:36,drawWindows:[combined[1]]}),config('international')),'five-move-ending');
  assert.deepEqual(endingWindows(board,'american',windows,13,'official'),[]);assert.deepEqual(endingWindows(board,'international',windows,13,'fortyMove'),[]);
});

test('latest FMJD large diagonal has a five-each window only when occupied solely by weak king',()=>{
  const board=sparseBoard('international',{4:-2,46:2,47:2,48:2});let windows=endingWindows(board,'international',[],0,'official');assert(windows.some(window=>window.kind==='diagonalFive'));const shorter=windows.find(window=>window.kind==='diagonalFive');assert.equal(shorter.limit,10);
  assert.equal(drawReason(position('international',board,{ply:10,drawWindows:windows}),config('international')),'long-diagonal-five-move-ending');
  const occupied=[...board];occupied[46]=0;occupied[45]=2;windows=endingWindows(occupied,'international',[],0,'official');assert.equal(windows.some(window=>window.kind==='diagonalFive'),false);
});

test('published32-ply FMJD regression draws when original16-each window expires',()=>{
  const replay=PUBLISHED_DRAW_REGRESSION,board=sparseBoard(replay.variant,replay.pieces);let state=positionState(core,board,replay.variant,1,{drawWindows:endingWindows(board,replay.variant,[],0,'official')});
  for(let ply=0;ply<replay.paths.length;ply++){
    assert.equal(state.phase.id,'move');const path=replay.paths[ply].map(square=>square-1),playerId=state.order[state.side===1?0:1];state=core.reduce(state,{type:'input',playerId,input:{type:'move',path},now:2000+ply});assert.equal(state.ply,ply+1);
    if(ply+1===replay.captureAtPly){assert(state.drawWindows.some(window=>window.kind==='five'&&window.started===26));assert(state.drawWindows.some(window=>window.kind==='sixteen'&&window.started===0));}
  }
  assert.equal(state.phase.id,'done');assert.equal(state.endReason,'sixteen-move-ending');assert.equal(state.winner,null);
});

test('last permitted move capturing final opponent wins before a draw counter expires',()=>{
  const board=sparseBoard('american',{10:1,6:-1});const state=positionState(core,board,'american',1,{drawWindows:[{kind:'five',weak:-1,started:0,limit:10}],ply:9,quietPlies:79});const next=core.reduce(state,{type:'input',playerId:'light',input:{type:'move',path:[10,1]},now:2000});assert.equal(next.phase.id,'done');assert.equal(next.winner,'light');assert.equal(next.endReason,'no-legal-move');
});
