import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {z} from 'zod';
import {stateSchema,endgameDataSchema} from '../dist/schema.mjs';
const json=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));

test('authoritative state/data schemas validate generated files and reject corrupt rows',()=>{
  for(const phase of ['move','done']){const state=json('fixtures/'+phase+'.json');assert(stateSchema.safeParse(state).success);const schema=z.fromJSONSchema(json('fixtures/schema.json'));assert(schema.safeParse(state).success);assert.equal(state.board.length,state.variant==='american'?32:50);assert.equal(state.phaseClock,state.phase.startedAt);assert.deepEqual(Object.keys(state.players),state.order);}
  assert(z.fromJSONSchema(json('data/international/schema.json')).safeParse(json('data/international/manifest.json')).success);
  assert(z.fromJSONSchema(json('data/chinook/schema.json')).safeParse(json('data/chinook/manifest.json')).success);
  const data=json('data/endgames.json'),schema=z.fromJSONSchema(json('data/schema.json'));assert(endgameDataSchema.safeParse(data).success);assert(schema.safeParse(data).success);
  for(const row of data.rows){assert.equal(row[0].split(':')[2].length,row[0].startsWith('american:')?32:50);assert.equal(row[1]===0,row[2]===null);}
  const corrupt=structuredClone(data);corrupt.rows[0][1]=2;assert.equal(schema.safeParse(corrupt).success,false);
  const badState=json('fixtures/move.json');badState.board[0]=7;assert.equal(stateSchema.safeParse(badState).success,false);badState.board[0]=-1;badState.phase.startedAt=Infinity;assert.equal(stateSchema.safeParse(badState).success,false);
});
