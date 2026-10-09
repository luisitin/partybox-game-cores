import test from 'node:test';
import assert from 'node:assert/strict';
import {core,clone,assertJson,checkResults,writeEvidence} from './helpers.mjs';
import {decodeSession,encodeSession,restoreSessionState} from '../dist/session.mjs';

const ids=['','__proto__','constructor','toString','alpha','beta','gamma','delta'];
const editions=[];
for(const onesWild of [false,true])for(const palificoEnabled of [false,true])
for(const palificoExemption of ['none','oneDie','experienced'])
for(const calzaEnabled of [false,true])for(const calzaPolicy of ['anyOther','interruptOnly'])
  editions.push({onesWild,palificoEnabled,palificoExemption,calzaEnabled,calzaPolicy});
function context(count,mask,settings={},seed=1,now=1000){
  return {players:ids.slice(0,count).map((id,i)=>({id,name:`Seat ${i+1}`,avatarId:'face',connected:!!(mask&(1<<i)),bot:true})),settings,seed,now};
}
function assertPlayable(state,ctx){
  assertJson(state);
  assert.deepEqual(state.order,ctx.players.map(p=>p.id));
  for(const p of ctx.players){
    assert.equal(state.players[p.id].connected,p.connected,'initial presence must be preserved');
    assert.equal(state.players[p.id].id,p.id);
    assert.equal(core.controllerView(state,p.id).ownDice.length,state.cups[p.id].length);
  }
  if(!ctx.players.some(p=>p.connected)){
    assert.equal(state.autoPaused,true);assert.deepEqual(state.phase.paused,{at:ctx.now});
    assert.equal(state.bid,null);assert.equal(state.round,1);
    return;
  }
  assert.equal(state.autoPaused,false);assert.equal(state.phase.paused,undefined);
  if(state.phase.id==='bid'){
    assert.equal(state.players[state.turn].connected,true,'a disconnected initial turn must be played automatically');
    const view=core.controllerView(state,state.turn);
    assert.equal(view.canBid,true);
    const action=core.sampleInput(state,state.turn,core.createRng(17),'normal');
    assert.notEqual(action,null);assert.equal(core.inputSchema.safeParse(action).success,true);
  }else{
    assert.equal(state.phase.id,'reveal');
    assert.ok(ctx.players.some(p=>p.connected&&core.controllerView(state,p.id).canContinue));
  }
}

test('a disconnected random first seat does not strand the connected player with the default clock off',()=>{
  const ctx={players:[{id:'absent',name:'Absent seat',avatarId:'face',connected:false},{id:'here',name:'Connected seat',avatarId:'face',connected:true}],settings:{turnSeconds:0},seed:1,now:1000};
  const state=core.init(ctx);
  assert.equal(state.turn,'here');
  assert.deepEqual(state.bid,{quantity:1,face:5,playerId:'absent'});
  assert.equal(state.players.absent.connected,false);assert.equal(state.phase.deadline,null);
  assert.equal(core.controllerView(state,'here').canBid,true);
  assert.notEqual(core.sampleInput(state,'here',core.createRng(19),'normal'),null);
});

test('every presence mask at every 2–8 seat count is playable across all 48 rule settings',()=>{
  const stats={settings:editions.length,contexts:0,automaticStarts:0,emptyRooms:0,byCount:{}};
  for(let count=2;count<=8;count++){
    stats.byCount[count]=0;
    for(let edition=0;edition<editions.length;edition++)for(let mask=0;mask<(1<<count);mask++){
      const ctx=context(count,mask,{...editions[edition],turnSeconds:0},(Math.imul(mask+1,0x9e3779b1)^Math.imul(edition+1,0x85ebca6b)^count)>>>0);
      const before=JSON.stringify(ctx),state=core.init(ctx);
      assert.equal(JSON.stringify(ctx),before,'init must not mutate the host roster or settings');
      assertPlayable(state,ctx);
      if(state.bid!==null||state.phase.id==='reveal')stats.automaticStarts++;
      if(mask===0)stats.emptyRooms++;
      stats.contexts++;stats.byCount[count]++;
    }
  }
  assert.equal(stats.contexts,24384);assert.equal(stats.emptyRooms,336);
  writeEvidence('initial-presence-matrix.json',stats);
});

test('initial absent turns use exactly the ordinary departure behavior, including clock boundaries',()=>{
  let contexts=0,automated=0;
  for(let count=2;count<=8;count++)for(let mask=0;mask<(1<<count);mask++)
  for(const turnSeconds of [1,120])for(const now of [0,0.5,1000]){
    const ctx=context(count,mask,{turnSeconds},Math.imul(mask+3,1799)^count,now);
    const allHere=core.init({...ctx,players:ctx.players.map(p=>({...p,connected:true}))});
    const starter=allHere.turn,state=core.init(ctx);
    assertPlayable(state,ctx);
    if(mask!==0&&!state.players[starter].connected){
      const ordinary=core.init({...ctx,players:ctx.players.map(p=>p.id===starter?{...p,connected:true}:p)});
      const expected=core.reduce(ordinary,{type:'player',now,playerId:starter,connected:false});
      assert.deepEqual(state,expected,'startup must preserve the existing departure policy');
      automated++;
    }else if(mask===(1<<count)-1)assert.deepEqual(state,allHere);
    contexts++;
  }
  assert.equal(contexts,3048);assert.ok(automated>0);
});

test('initial automatic bids do not double-play on duplicate presence or override an intentional hold',()=>{
  let state=core.init(context(3,4,{turnSeconds:10},1));
  assertPlayable(state,context(3,4,{turnSeconds:10},1));
  for(const id of state.order){
    const duplicate=core.reduce(state,{type:'player',now:1100,playerId:id,connected:state.players[id].connected});
    assert.equal(duplicate,state);
  }
  const held=core.reduce(state,{type:'vip',now:1200,action:'pause'});
  for(const id of state.order){
    const changed=core.reduce(held,{type:'player',now:1300,playerId:id,connected:!held.players[id].connected});
    assert.deepEqual(changed.phase.paused,{at:1200});assert.equal(changed.autoPaused,false);
    assert.deepEqual(changed.bid,held.bid);
  }
  assert.equal(core.reduce(held,{type:'timer',now:20000,phaseId:held.phase.id,startedAt:held.phase.startedAt}),held);
});

test('natural mixed-presence starts roundtrip through validated recovery and retain every original seat',()=>{
  let cases=0;
  for(let count=2;count<=8;count++)for(const mask of [0,1,(1<<count)-2,(1<<count)-1]){
    const ctx=context(count,mask,{calzaEnabled:true,turnSeconds:3},7),state=core.init(ctx);
    const saved={version:1,gameId:'liars-dice',gameVersion:core.manifest.version,state,savedHostNow:1000,botRng:{seed:73,step:9},skills:state.order.map(id=>[id,'normal']),pace:'normal',currentTimerConsumed:false,sampledCurrentBid:false};
    const raw=encodeSession(saved);assert.equal(typeof raw,'string');
    const decoded=decodeSession(raw);assert.deepEqual(decoded,saved);
    const recovered=restoreSessionState(decoded,9000);
    assert.deepEqual(recovered.order,state.order);assert.deepEqual(recovered.cups,state.cups);
    assert.deepEqual(recovered.rng,state.rng);assert.deepEqual(recovered.players,state.players);
    if(mask===0)assert.deepEqual(recovered,state);
    else if(state.phase.id==='bid')assert.equal(recovered.phase.deadline,state.phase.deadline+8000);
    const ended=core.reduce(recovered,{type:'vip',now:10000,action:'end'});checkResults(ended,state.order);
    cases++;
  }
  assert.equal(cases,28);
});

test('one connected seat can complete genuine games with every other seat initially absent',()=>{
  let games=0;
  for(let count=2;count<=8;count++)for(let edition=0;edition<editions.length;edition++){
    const ctx=context(count,1,{...editions[edition],turnSeconds:0},Math.imul(edition+1,7199)^count);
    let state=core.init(ctx);
    for(let step=0;step<5000&&state.phase.id!=='done';step++){
      const input=core.sampleInput(state,'',core.createRng(ctx.seed^step),'normal');
      assert.notEqual(input,null,'the connected seat must retain a legal action');
      assert.equal(core.inputSchema.safeParse(input).success,true);
      state=core.reduce(state,{type:'input',playerId:'',input,now:1001+step});
    }
    assert.equal(state.phase.id,'done');checkResults(state,ctx.players.map(p=>p.id));games++;
  }
  assert.equal(games,336);
});
