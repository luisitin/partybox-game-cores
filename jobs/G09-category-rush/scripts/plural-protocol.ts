/** Accepted-answer protocol through the actual reducer; every event is restored. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {game} from '../src/index';
import {sameAnswer} from '../src/match';
import {z} from 'zod';
import {pluralProtocolSchema} from '../content/plural-schema';
import type {GameEvent} from '../../../contract/contract';
import type {State,Input} from '../src/model';

const pairs=[['knife','knives'],['mouse','mice'],['person','people'],['leaf','leaves'],['child','children'],['tooth','teeth'],['foot','feet'],['goose','geese'],['shelf','shelves']];
const label=process.argv.includes('--baseline')?'baseline':'after';
const hash=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
const restore=(s:State):State=>JSON.parse(JSON.stringify(s));
const rows=[];
for(const count of [2,8])for(const [singular,plural] of pairs){
  const players=Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Player ${i}`,avatarId:'face0',connected:true,bot:false}));
  let seed=0,start=game.init({players,settings:{rounds:1,roundSeconds:30},seed,now:1000});
  while(start.letter!==singular[0].toUpperCase()){assert(++seed<10000);start=game.init({players,settings:{rounds:1,roundSeconds:30},seed,now:1000});}
  let state=restore(start),now=1001;const events:GameEvent<Input>[]=[];
  const apply=(event:GameEvent<Input>)=>{events.push(event);state=restore(game.reduce(state,event));};
  for(let i=0;i<count;i++){const answers=Array<string>(12).fill('');if(i<2)answers[0]=i===0?singular:plural;apply({type:'input',now:now++,playerId:`p${i}`,input:{type:'submit',answers}});}
  assert.equal(state.phase.id,'review');
  const publicGroups=game.tvView(state).review!.groups.length;
  while(state.phase.id==='review'){
    const index=state.reviewIndex,groups=game.tvView(state).review!.groups.length;
    for(const player of players){apply({type:'input',now:now++,playerId:player.id,input:{type:'vote',votes:Array<boolean>(groups).fill(true)}});}
    assert(state.reviewIndex!==index||state.phase.id!=='review');
  }
  assert.equal(state.phase.id,'scores');
  apply({type:'input',now:now++,playerId:'p0',vip:true,input:{type:'next'}});
  assert.equal(state.phase.id,'done');assert.equal(state.history.length,1);
  let replay=restore(start);for(const event of events)replay=restore(game.reduce(replay,event));assert.deepEqual(replay,state);
  const receipt=state.history[0].entries[0];
  const awarded=Object.values(state.scores).reduce((a,b)=>a+b,0);
  assert.equal(awarded,label==='baseline'?2:0);
  assert.equal(receipt.groups.length,label==='baseline'?2:1);
  assert(receipt.groups.every(group=>group.accepted&&group.eligible));
  rows.push({count,singular,plural,seed,letter:start.letter,layout:start.categories.map(c=>c.id),matches:sameAnswer(singular,plural),publicGroups,receipt,awarded,scores:state.scores,eventCount:events.length,replayMatches:true});
}
const report={protocol:'accepted-nine-plural-pairs-two-eight-seats-v1',label,assumption:'The players unanimously accept the two answers for the selected prompt; banks do not veto creative answers. This isolates duplicate adjudication, not semantic fitness for random prompts.',sourceHashes:{core:hash('../src/index.ts'),matcher:hash('../src/match.ts'),scoring:hash('../src/scoring.ts'),data:hash('../content/categories.json'),reference:hash('../tests/reference.ts'),experiment:hash('plural-protocol.ts')},rows};
pluralProtocolSchema.parse(report);
writeFileSync(new URL('../evidence/plural-protocol.schema.json',import.meta.url),JSON.stringify(z.toJSONSchema(pluralProtocolSchema),null,2)+'\n');
writeFileSync(new URL(`../evidence/plural-protocol-${label}.json`,import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({label,cases:rows.length,matched:rows.filter(row=>row.matches).length,awarded:rows.reduce((sum,row)=>sum+row.awarded,0),replayMatches:rows.filter(row=>row.replayMatches).length,sourceHashes:report.sourceHashes},null,2));
