import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {core,makeState,input,clone,deepFreeze,botEvent} from './helpers.mjs';
import {SAVE_KEY,MAX_SESSION_BYTES,encodeSession,decodeSession,restoreSessionState,createResumableRng,phaseKey,currentBidKey} from '../dist/session.mjs';

function snapshot(state,savedHostNow=state.phase.startedAt){
  return {version:1,gameId:core.manifest.id,gameVersion:core.manifest.version,state,savedHostNow,
    botRng:{seed:0xffffffff,step:197},skills:state.order.map((id,i)=>[id,['easy','normal','sharp'][i%3]]),
    pace:'manual',currentTimerConsumed:false,sampledCurrentBid:state.bid!==null};
}
function roundtrip(saved){
  const before=JSON.stringify(saved),raw=encodeSession(deepFreeze(saved));
  assert.equal(raw,before,'save must retain the exact original state and metadata');
  const restored=decodeSession(raw);
  assert.deepEqual(restored,saved);
  assert.equal(JSON.stringify(saved),before,'saving mutated the source');
  assert.equal(encodeSession(restored),raw,'repeat save is not byte-identical');
  return restored;
}
const own=(target,key,value)=>Object.defineProperty(target,key,{value,writable:true,enumerable:true,configurable:true});

test('authoritative fixture states and genuine prototype-named seats retain every own map value',()=>{
  assert.equal(SAVE_KEY,'partybox.g07.session.v1');
  for(const phase of ['bid','reveal','done'])roundtrip(snapshot(JSON.parse(readFileSync(`fixtures/${phase}.json`,'utf8'))));
  const state=makeState(3,17,{},['','__proto__','constructor']);
  const restored=roundtrip(snapshot(state));
  for(const map of ['players','cups','diceCount','seenPalifico','models']){
    assert(Object.hasOwn(restored.state[map],'__proto__'));
    assert.deepEqual(restored.state[map].__proto__,state[map].__proto__);
  }
  assert.equal({}.polluted,undefined);
});

test('same-tick future phase stamps and earlier deadlines preserve core pause/resume semantics',()=>{
  let state=core.init({players:[0,1,2].map(i=>({id:`p${i}`,name:`P${i}`,avatarId:'face',connected:true})),settings:{turnSeconds:1},seed:7,now:0});
  for(let i=1;i<=1101;i++)state=core.reduce(state,input(state,{type:'bid',quantity:i,face:2},state.turn,0));
  assert(state.phase.startedAt>state.phase.deadline);
  const saved=roundtrip(snapshot(state,0)),before=JSON.stringify(saved);
  const expected=core.reduce(core.reduce(state,{type:'vip',action:'pause',now:0}),{type:'vip',action:'resume',now:5000.125});
  assert.deepEqual(restoreSessionState(deepFreeze(saved),5000.125),expected);
  assert.equal(expected.phase.deadline,6000.125);
  assert.equal(expected.phase.startedAt,state.phase.startedAt);
  assert.equal(JSON.stringify(saved),before);
  assert.equal(phaseKey(state),`${state.phase.id}:${state.phase.startedAt}`);
  assert.equal(currentBidKey(state),`${state.round}:${state.bidLog.length}:${state.bid.playerId}:${state.bid.quantity}:${state.bid.face}`);
  for(const now of [-1,-0,Infinity,NaN,1e15+1])assert.throws(()=>restoreSessionState(saved,now),RangeError);
});

test('existing intentional and automatic holds and both legal terminal hold shapes stay unchanged',()=>{
  const state=makeState(3,7,{turnSeconds:2});
  const intentional=core.reduce(state,{type:'vip',action:'pause',now:1200});
  let automatic=state;
  for(const id of state.order)automatic=core.reduce(automatic,{type:'player',playerId:id,connected:false,now:1300});
  assert(automatic.autoPaused&&automatic.phase.paused);
  const emptyDone=core.reduce(automatic,{type:'vip',action:'end',now:1400});
  assert(emptyDone.autoPaused&&!emptyDone.phase.paused);
  for(const held of [intentional,automatic,emptyDone]){
    const saved=roundtrip(snapshot(held,1500));
    assert.equal(restoreSessionState(saved,9999),saved.state);
  }
  let terminal=core.reduce(makeState(2,9),{type:'vip',action:'pause',now:1200});
  for(let i=0;terminal.phase.id!=='done'&&i<1000;i++)terminal=core.reduce(terminal,{type:'vip',action:'skip',now:2000+i});
  assert.equal(terminal.phase.id,'done');assert(terminal.phase.paused);
  const saved=roundtrip(snapshot(terminal));assert.equal(restoreSessionState(saved,9999),saved.state);
});

test('natural elimination, palifico-to-duel and duel pending-palifico reveal states remain recoverable',()=>{
  let state=makeState(3,4),now=1000,paliToDuel=false,duelPending=false,eliminated=false;
  while(state.phase.id!=='done'&&now<50000){
    if(state.phase.id==='reveal')state=core.reduce(state,input(state,{type:'continue'},state.order[0],++now));
    else if(state.bid===null)state=core.reduce(state,input(state,{type:'bid',quantity:1000000,face:2},state.turn,++now));
    else state=core.reduce(state,input(state,{type:'dudo'},state.turn,++now));
    roundtrip(snapshot(state,now));
    const alive=state.order.filter(id=>state.diceCount[id]>0).length;
    if(state.reveal){
      paliToDuel ||=state.palifico&&alive===2;
      duelPending ||=!state.palifico&&alive===2&&state.nextPalifico!==null;
      eliminated ||=state.reveal.loser!==null&&state.diceCount[state.reveal.loser]===0;
    }
  }
  assert.equal(state.phase.id,'done');assert(paliToDuel);assert(duelPending);assert(eliminated);
});

test('naturally successful calza keeps pre-reward cups and bounded learned models intact',()=>{
  let state=makeState(3,5,{calzaEnabled:true}),now=1000;
  const first=state.turn;
  state=core.reduce(state,input(state,{type:'bid',quantity:1000000,face:2},first,++now));
  state=core.reduce(state,input(state,{type:'dudo'},state.turn,++now));
  state=core.reduce(state,input(state,{type:'continue'},state.order[0],++now));
  assert.equal(state.turn,first);
  state=core.reduce(state,input(state,{type:'bid',quantity:1,face:2},first,++now));
  const dice=state.order.flatMap(id=>state.cups[id]);
  const exact=[2,3,4,5,6].map(face=>({face,matches:dice.filter(die=>die===1||die===face).length}))
    .sort((a,b)=>b.matches-a.matches)[0];
  assert(exact.matches>=2);
  state=core.reduce(state,input(state,{type:'bid',quantity:exact.matches,face:exact.face},state.turn,++now));
  state=core.reduce(state,input(state,{type:'calza'},first,++now));
  assert.equal(state.reveal?.kind,'calza');assert(state.reveal.correct&&state.reveal.gained);
  assert.equal(state.cups[first].length,state.diceCount[first]-1);
  roundtrip(snapshot(state,now));
});

test('all accepted events in varied natural seeded games survive save validation without changing results',()=>{
  let checked=0;
  for(let count=2;count<=8;count++){
    let state=makeState(count,300+count,{calzaEnabled:true,palificoExemption:'experienced',onesWild:count%2===0});
    for(let step=0;state.phase.id!=='done'&&step<5000;step++){
      const event=botEvent(state,step,id=>['easy','normal','sharp'][state.order.indexOf(id)%3],300+count);
      state=core.reduce(state,event);
      assert.deepEqual(decodeSession(JSON.stringify(snapshot(state,event.now)))?.state,state,`rejected count=${count}, step=${step}`);
      checked++;
    }
    assert.equal(state.phase.id,'done');
  }
  assert(checked>500);
});

test('corrupt maps, prototype leaves, metadata, static keys and oversize payloads fail closed',()=>{
  const base=snapshot(makeState(3,17,{},['','__proto__','constructor']));
  const mutations=[
    s=>s.version=2,s=>s.gameId='other',s=>s.gameVersion='9.0.0',s=>s.savedHostNow=-1,
    s=>s.botRng.seed=0x100000000,s=>s.botRng.step=-1,s=>s.botRng.step=Number.MAX_SAFE_INTEGER+1,
    s=>s.pace='warp',s=>s.currentTimerConsumed=1,s=>s.sampledCurrentBid=null,
    s=>s.skills.pop(),s=>s.skills[1][0]=s.skills[0][0],s=>s.skills[0][1]='expert',
    s=>s.skills[0][0]='unknown',s=>s.state.order[1]=s.state.order[0],
    s=>delete s.state.players.__proto__,s=>s.state.players.__proto__.id='other',
    s=>s.state.cups.__proto__=[7],s=>s.state.cups.__proto__=[1,2,3,4,5,6],
    s=>s.state.diceCount.__proto__=6,s=>s.state.seenPalifico.__proto__='yes',
    s=>s.state.models.__proto__.truth=0,s=>s.state.models.__proto__.false=.5,
    s=>s.state.turn='unknown',s=>s.state.nextStarter='unknown',s=>s.state.rng.seed=-1,
    s=>s.state.phaseClock++,s=>s.state.phase.deadline=null,s=>s.state.settings.turnSeconds=3.5,
    s=>s.state.eliminated.push('__proto__'),s=>s.state.left.push('__proto__'),
    s=>own(s,'__proto__',{polluted:true}),s=>own(s.state.phase,'__proto__',{at:3}),
    s=>own(s.state.players.__proto__,'__proto__',{polluted:true}),
    s=>own(s.state.cups,'outsider',[]),s=>s.state.round=Number.MAX_SAFE_INTEGER+1,
  ];
  // Deadline corruption uses a genuine timed state.
  base.state.settings.turnSeconds=1;base.state.phase.deadline=2000;
  for(const mutate of mutations){const candidate=clone(base);mutate(candidate);assert.equal(decodeSession(JSON.stringify(candidate)),null);}
  for(const raw of [null,undefined,3,'','{','null','[]',' '.repeat(MAX_SESSION_BYTES+1)])assert.equal(decodeSession(raw),null);
  const huge=clone(base);huge.state.players[''].name='🎲'.repeat(MAX_SESSION_BYTES/3);
  assert.equal(encodeSession(huge),null);
  const reveal=JSON.parse(readFileSync('fixtures/reveal.json','utf8'));
  const id=reveal.order[0];own(reveal.reveal.dice,'__proto__',[7]);
  assert.equal(decodeSession(JSON.stringify(snapshot(reveal))),null);
  assert.equal({}.polluted,undefined);
});

test('resumable random wrapper matches shared generator across 1000 mixed calls and isolates cursor objects',()=>{
  for(const seed of [0,1,0xffffffff,-2147483648]){
    const expected=core.createRng(seed),restored=createResumableRng(seed);
    for(let i=0;i<1000;i++){
      const kind=i%7;
      const call=rng=>kind===0?rng.float():kind===1?rng.int(-7,19):kind===2?rng.pick(['a','b','c']):
        kind===3?rng.shuffle([0,1,2,3,4]):kind===4?rng.chance(.37):kind===5?rng.int(8,3):rng.shuffle([]);
      assert.deepEqual(call(restored),call(expected));assert.deepEqual(restored.state(),expected.state());
      if(i===500){const twin=createResumableRng(restored.state());assert.equal(twin.float(),createResumableRng(expected.state()).float());}
    }
    const cursor=restored.state(),copy=createResumableRng(cursor),next=restored.float();cursor.seed=7;cursor.step=0;
    assert.equal(copy.float(),next);
    const published=copy.state(),prior=copy.state();published.step=0;published.seed=0;assert.deepEqual(copy.state(),prior);
    const before=copy.state();assert.throws(()=>copy.pick([]));assert.deepEqual(copy.state(),before);
  }
  for(const cursor of [{seed:0,step:0xffffffff},{seed:0xffffffff,step:Number.MAX_SAFE_INTEGER-1000}]){
    const a=createResumableRng(deepFreeze(cursor)),b=createResumableRng(clone(cursor));
    for(let i=0;i<100;i++){assert.equal(a.float(),b.float());assert.deepEqual(a.state(),b.state());}
    assert.equal(cursor.step===0xffffffff||cursor.step===Number.MAX_SAFE_INTEGER-1000,true);
  }
  for(const cursor of [{seed:-1,step:0},{seed:2**32,step:0},{seed:1,step:-1},{seed:1,step:1.5}])assert.throws(()=>createResumableRng(cursor),RangeError);
});
