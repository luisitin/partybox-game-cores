import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createRng, hashString } from '../../../../contract/rng';
import { game } from '../games/shake-up/server';
import type { State } from '../games/shake-up/server/types';
import { fire, input, jsonSafe, room, simulate, T0 } from '../games/shake-up/__tests__/helpers';
const generator=createRng(0x08a11ce),seeds=[1,2,3,...Array.from({length:1000},()=>generator.int(4,0x7fffffff))];
let propertyEvents=0,peakBytes=0;
for(const seed of seeds) {
  const players=1+seed%16,lang=seed%7===0?'es':'en';
  const settings={rounds:1,huntSeconds:'90',grid:seed%11===0?'5x5':'4x4',dictionary:seed%5===0?'common':'full'};
  const {state,events,ms}=simulate({players,seed,settings,lang,chaos:true,skill:'sharp'});
  assert.equal(state.phase.id,'done');assert(ms<game.manifest.estimatedMinutes*3*60_000);
  let replay=room(players,settings,seed,{lang});
  for(const event of events) {
    const before=JSON.stringify(replay),scores={...replay.scores};const next=game.reduce(replay,event);
    assert.equal(JSON.stringify(replay),before,'input state mutated');assert.equal(jsonSafe(next),null);
    const bytes=Buffer.byteLength(JSON.stringify(next));peakBytes=Math.max(bytes,peakBytes);assert(bytes<=256*1024);
    for(const id of next.order)assert(next.scores[id]!>=scores[id]!,'score decreased');
    assert.equal(jsonSafe(game.tvView(next)),null);assert.equal(jsonSafe(game.controllerView(next,'spectator')),null);
    if(next.phase.id==='hunt') {
      const tv=game.tvView(next);assert(tv.hunt);assert(!('botPlans' in tv));
      const player=next.order[0]!,view=game.controllerView(next,player);
      const clone=JSON.parse(JSON.stringify(next)) as State;
      for(const id of next.order)if(id!==player)clone.words[id]=(clone.words[id]??[]).map(e=>({...e,w:'SECRET_SENTINEL',p:[24],t:123}));
      // Counts are public; words/path/time and their dictionary judgement cannot change the phone.
      assert.deepEqual(game.controllerView(clone,player),view);
    }
    replay=next;propertyEvents++;
  }
  assert.equal(JSON.stringify(replay),JSON.stringify(state));assert.equal(jsonSafe(game.results(state)),null);
  if((seeds.indexOf(seed)+1)%200===0)console.log(JSON.stringify({propertySeeds:seeds.indexOf(seed)+1,propertyEvents,peakBytes}));
}
const rosters:unknown[]=[];
for(let count=1;count<=16;count++) {
  let maxMs=0,events=0,peak=0;
  for(let k=1;k<=1000;k++) {
    const seed=hashString(`roster:${count}:${k}`),lang=k%20===0?'es':'en';
    const settings={rounds:1,huntSeconds:'90',grid:k%25===0?'5x5':'4x4',dictionary:k%10===0?'common':'full'};
    const {state,events:history,ms}=simulate({players:count,seed,settings,lang,skill:(['easy','normal','sharp'] as const)[k%3]});
    assert.equal(state.phase.id,'done');assert(ms<game.manifest.estimatedMinutes*3*60_000);assert.equal(jsonSafe(state),null);
    const results=game.results(state)!;assert(results);assert.equal(results.ranking.length,count);assert.equal(jsonSafe(results),null);
    assert(results.awards.length>=3&&results.awards.length<=5);assert.equal(jsonSafe(game.controllerView(state,'unknown')),null);
    const bytes=Buffer.byteLength(JSON.stringify(state));assert(bytes<=256*1024);peak=Math.max(peak,bytes);events+=history.length;maxMs=Math.max(maxMs,ms);
  }
  const row={players:count,games:1000,rounds:1,clockSeconds:90,englishGames:950,spanishGames:50,fiveByFiveGames:40,commonRequestedGames:100,allFinished:true,maxMs,events,finalPeakBytes:peak};
  rosters.push(row);console.log(JSON.stringify({roster:row}));
}
let idle=0;
for(const players of [1,2,8,16]) {
  const {state,ms}=simulate({players,seed:100+players,settings:{rounds:5},idle:true});assert.equal(state.phase.id,'done');assert(ms<game.manifest.estimatedMinutes*3*60_000);idle++;
}
writeFileSync(new URL('./seeded-report.json',import.meta.url),JSON.stringify({version:1,propertySeeds:1003,requiredSeeds:[1,2,3],randomSeeds:seeds.slice(3),propertyEvents,peakEventBytes:peakBytes,rosterGames:16000,rosters,idleGames:idle,scope:'1003 adversarial full-game replays validate every event; all 16000 roster games complete one 90-second round, mix every skill plus en/es, 4x4/5x5 and common. Separate strength leagues use default three-round games.'},null,2)+'\n');
console.log(JSON.stringify({propertySeeds:1003,rosterGames:16000,idleGames:idle}));
