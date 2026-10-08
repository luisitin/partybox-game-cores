import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {game,createRng,players,propertySeeds} from './helpers.mjs';
import * as baseline from '../.build/jobs/G03-pack-the-hold/src/study-total-baseline.js';

test('guarded reducer preserves every valid transition from the prior delivery', () => {
  const baselineSha256=createHash('sha256').update(readFileSync('src/study-total-baseline.ts')).digest('hex');
  assert.equal(baselineSha256,'e9db2ffa11a4723283776c60aa22bcccf1a78c1d25df53b06261fec49d853c17');
  let games=0,transitions=0;const kinds={};
  for(const seed of propertySeeds()) {
    const ctx={players:players(2+seed%7),settings:{rounds:1+seed%3,turnSeconds:20+seed%41,difficulty:1+seed%10,allowFlip:Boolean(seed%2)},seed,now:1000};
    let current=game.init(ctx),old=baseline.init(ctx),steps=0;const rng=createRng(seed^0x771);
    assert.equal(JSON.stringify(current),JSON.stringify(old));
    function send(event) {
      const before=JSON.stringify(current),oldBefore=JSON.stringify(old);
      const next=game.reduce(current,event),oldNext=baseline.reduce(old,event);
      assert.equal(JSON.stringify(current),before);assert.equal(JSON.stringify(old),oldBefore);
      assert.equal(JSON.stringify(next),JSON.stringify(oldNext),`seed ${seed}, ${event.type}, step ${steps}`);
      current=JSON.parse(JSON.stringify(next));old=JSON.parse(JSON.stringify(oldNext));
      transitions++;kinds[event.type]=(kinds[event.type]??0)+1;
    }
    send({type:'vip',action:'pause',now:1001});
    send({type:'player',playerId:'p0',connected:false,now:1002});
    send({type:'player',playerId:'p0',connected:true,now:1003});
    send({type:'timer',phaseId:current.phase.id,startedAt:current.phase.startedAt,now:current.phase.deadline+1000});
    send({type:'vip',action:'resume',now:1101});
    while(current.phase.id!=='done'&&steps++<100) {
      const now=current.phase.startedAt+1;
      if(steps%5===0)send({type:'timer',phaseId:current.phase.id,startedAt:current.phase.startedAt,now:current.phase.deadline});
      else if(steps%7===0)send({type:'vip',action:'skip',now});
      else {
        const playerId=current.order[current.seat],input=game.bot.sampleInput(current,playerId,rng,['easy','normal','sharp'][seed%3]);assert(input);
        send({type:'input',playerId,input,now});
      }
    }
    assert.equal(current.phase.id,'done');assert.deepEqual(game.results(current),baseline.results(old));games++;
  }
  const report={baselineCommit:'2a9c5e1777a97f3047b77a1bf33012e26f30b53d',baselineSha256,games,transitions,kinds,stateMismatches:0,resultMismatches:0};
  mkdirSync('.tmp',{recursive:true});writeFileSync('.tmp/total-compatibility.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
});
