import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {game} from '../src/index';
import type {State} from '../src/model';
test('pure core source has no random clock callback IO or runtime dependency beyond zod',()=>{
  for(const name of readdirSync(new URL('../src/',import.meta.url)).filter(n=>n.endsWith('.ts'))){
    const text=readFileSync(new URL(`../src/${name}`,import.meta.url),'utf8');
    assert(!/\b(?:Math\.random|Date\.now|setTimeout|setInterval|fetch|XMLHttpRequest)\s*\(/.test(text),name);
    assert(!/from\s+['"](?:node:|https?:|fs['"]|http['"])/.test(text),name);
    const imports=[...text.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]);
    assert(imports.every(path=>path.startsWith('.')||path==='zod'),name);
  }
});
test('done fixture is the played-out last scores fixture; every fixture reaches finite results',()=>{
  const fixture=(id:string)=>JSON.parse(readFileSync(new URL(`../fixtures/${id}.json`,import.meta.url),'utf8')) as State;
  const scores=fixture('scores');
  assert.deepEqual(game.reduce(scores,{type:'timer',now:scores.phase.deadline!,phaseId:'scores',startedAt:scores.phase.startedAt}),fixture('done'));
  for(const id of game.phases){let state=fixture(id);
    for(let n=0;n<100&&state.phase.id!=='done';n++)state=game.reduce(state,{type:'timer',now:state.phase.deadline!,phaseId:state.phase.id,startedAt:state.phase.startedAt});
    assert.equal(state.phase.id,'done',id);assert(game.results(state));
  }
});
