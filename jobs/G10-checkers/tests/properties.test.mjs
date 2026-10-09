import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';
import {evidence} from './evidence.mjs';
import * as core from '../dist/core.mjs';
import {legalMoves,applyMove,positionKey,geometry} from '../dist/moves.mjs';
import {context,freeze,assertJson} from './helpers.mjs';

test('property seeds1,2,3 plus1,000 recorded random seeds conserve material and deterministic replay',()=>{
  const randomSeeds=Array.from({length:1000},()=>randomBytes(4).readUInt32LE());
  const supplied=process.env.G10_PROPERTY_SEEDS?JSON.parse(process.env.G10_PROPERTY_SEEDS):randomSeeds;
  const seeds=[1,2,3,...supplied],hash=createHash('sha256');let movesChecked=0;
  for(const seed of seeds){
    const rng=core.createRng(seed),variant=rng.chance(.5)?'american':'international';let state=core.init(context({variant},seed));
    for(let step=0;step<30&&state.phase.id==='move';step++){
      const g=geometry(variant),moves=legalMoves(state.board,variant,state.side);assert(moves.length);const move=rng.pick(moves),before=state.board.filter(Boolean).length;freeze(state);
      const board=applyMove(state.board,move);assert.equal(board.filter(Boolean).length,before-move.captures.length);assert(move.path.every(square=>Number.isInteger(square)&&square>=0&&square<g.count));assert.equal(new Set(move.captures).size,move.captures.length);
      assert.equal(Math.sign(board[move.path.at(-1)]),state.side);assert.equal(Math.abs(board[move.path.at(-1)]),move.promotes?2:Math.abs(state.board[move.path[0]]));
      const event={type:'input',playerId:core.turnId(state),input:{type:'move',path:move.path},now:1000+step};const a=core.reduce(state,event),b=core.reduce(structuredClone(state),structuredClone(event));assert.deepEqual(a,b);assert.notEqual(a,state);assert.deepEqual(a.board,board);assertJson(a);hash.update(JSON.stringify(a));movesChecked++;
      if(a.phase.id==='move'){assert.equal(a.side,-state.side);assert.equal(a.repetition[positionKey(a.board,a.side,variant)]>=1,true);assert(a.phase.startedAt>state.phase.startedAt);}
      const view=core.tvView(a);assert.deepEqual(view.board,a.board);assert.equal(Object.hasOwn(view,'repetition'),false);assert.equal(Object.hasOwn(view,'rng'),false);state=a;
    }
  }
  evidence('properties.json',{command:'node --test tests/properties.test.mjs',fixedSeeds:[1,2,3],randomSeeds:supplied,seeds:seeds.length,movesChecked,transcriptSha256:hash.digest('hex')});
});
