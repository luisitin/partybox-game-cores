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

test('seeded malformed JSON envelopes preserve all-phase frozen states', () => {
  function freeze(value) { if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value; }
  let states=0,probes=0,pausedStates=0;const phases={};
  for(const seed of propertySeeds()) {
    const initial=game.init({players:players(2+seed%7),settings:{rounds:1,difficulty:1+seed%10,allowFlip:Boolean(seed%2)},seed,now:1000});
    const paused=game.reduce(initial,{type:'vip',action:'pause',now:1001});
    let reveal=initial;
    for(let step=0;reveal.phase.id==='pack'&&step<9;step++)reveal=game.reduce(reveal,{type:'timer',phaseId:reveal.phase.id,startedAt:reveal.phase.startedAt,now:reveal.phase.deadline});
    assert.equal(reveal.phase.id,'reveal');
    const done=game.reduce(reveal,{type:'timer',phaseId:reveal.phase.id,startedAt:reveal.phase.startedAt,now:reveal.phase.deadline});assert.equal(done.phase.id,'done');
    for(const s of [initial,paused,reveal,done]) {
      freeze(s);const before=JSON.stringify(s),actor=s.order[s.seat],now=s.phase.startedAt+1;
      const invalidInputs=[null,false,0,'clear',[],{}, {type:'unknown'},{type:null},{type:['clear']},{type:'clear',extra:true},{type:'next',extra:true},{type:'submit',placements:null},{type:'place',placement:null},{type:'place',placement:[]},{type:'remove',crateId:{toString:null}}];
      const invalidActors=[null,false,0,[],[actor],{toString:null,valueOf:null},'unknown','__proto__','constructor'];
      const events=[null,false,0,'input',[],{}, {now},{type:'unknown',now},{type:{toString:null},now},{type:'vip',action:{toString:null},now},{type:'timer',phaseId:'stale',startedAt:s.phase.startedAt,now:now+600000},{type:'timer',phaseId:s.phase.id,startedAt:{toString:null},now:now+600000},{type:'speech',key:'unused',ms:100,now},{type:'speechStart',key:'unused',now}];
      for(const input of invalidInputs)events.push({type:'input',playerId:actor,input,now});
      for(const playerId of invalidActors)events.push({type:'input',playerId,input:{type:'clear'},now},{type:'player',playerId,connected:false,now});
      for(const connected of [null,0,'false',{},[]])events.push({type:'player',playerId:actor,connected,now});
      for(const gone of [null,false,0,'unknown',{},[]])events.push({type:'player',playerId:actor,connected:false,gone,now});
      for(const clock of [null,false,'1',[],{},undefined])events.push({type:'input',playerId:actor,input:{type:'clear'},now:clock},{type:'vip',action:'end',now:clock},{type:'player',playerId:actor,connected:false,now:clock});
      for(const event of events) {
        const jsonEvent=JSON.parse(JSON.stringify(event));assert.equal(game.reduce(s,jsonEvent),s,`seed ${seed}, ${s.phase.id}: ${JSON.stringify(jsonEvent)}`);assert.equal(JSON.stringify(s),before);probes++;
      }
      states++;if(s.phase.paused)pausedStates++;phases[s.phase.id]=(phases[s.phase.id]??0)+1;
    }
  }
  const report={seeds:propertySeeds().length,states,pausedStates,phases,jsonEnvelopeProbes:probes,exceptions:0,mutations:0,identityFailures:0};
  mkdirSync('.tmp',{recursive:true});writeFileSync('.tmp/total-envelopes.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
});
