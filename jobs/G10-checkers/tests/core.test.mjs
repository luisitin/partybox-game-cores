import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {context,freeze,assertJson,positionState} from './helpers.mjs';
import {REFERENCE_RULE_CASES,sparseBoard} from './reference-rule-cases.mjs';
const core=await import(process.env.G10_CORE?pathToFileURL(process.env.G10_CORE).href:'../dist/core.mjs');
const {init,reduce,tvView,controllerView,results,sampleInput,createRng,manifest,inputSchema}=core;
const moveEvent=(state,path,now=2000)=>({type:'input',playerId:state.order[state.side===1?0:1],input:{type:'move',path},now});

test('contract manifest/counts/settings and deterministic initial boards',()=>{
  assert.equal(manifest.minPlayers,2);assert.equal(manifest.maxPlayers,2);assert.equal(manifest.unlimitedDuration,true);assert.equal(manifest.supportsBots,true);
  assert.throws(()=>init({...context(),players:[]}),RangeError);assert.throws(()=>init(context({},1,['same','same'])),RangeError);
  for(const now of [NaN,Infinity,-1,-0,1e15+1])assert.throws(()=>init({...context(),now}));
  const first=init(context());assert.deepEqual(first,init(context()));assert.equal(first.board.filter(value=>value===1).length,12);assert.equal(first.board.filter(value=>value===-1).length,12);assert.equal(first.phase.deadline,null);
  const international=init(context({variant:'international'}));assert.equal(international.board.length,50);assert.equal(international.board.filter(value=>value===1).length,20);
  const normalized=init(context({variant:'oops',drawPolicy:'oops',turnSeconds:400,repetition:false}));assert.equal(normalized.settings.turnSeconds,300);assert.equal(normalized.settings.variant,'american');assert.equal(normalized.settings.drawPolicy,'official');assert.equal(normalized.settings.repetition,false);
  assert.equal(init(context({turnSeconds:NaN})).settings.turnSeconds,0);assert.equal(init(context({turnSeconds:-10})).settings.turnSeconds,0);assert.equal(init(context({turnSeconds:1.7})).settings.turnSeconds,2);
});

test('contract total immutable reducer ignores malformed/unknown events in both phases',()=>{
  const first=freeze(init(context({turnSeconds:3}))),done=freeze(reduce(first,{type:'vip',action:'end',now:2000}));
  const invalid=[null,undefined,{},[],{type:'unexpected',now:1000},{type:'input',playerId:'unknown',input:{type:'resign'},now:1000},
    {type:'input',playerId:'light',input:{type:'move',path:[0,1],injected:true},now:1000},{type:'input',playerId:'light',input:{type:'move',path:[-1,99]},now:1000},
    {type:'input',playerId:'dark',input:{type:'resign'},now:1000},{type:'player',playerId:'unknown',connected:false,now:1000},
    {type:'player',playerId:'light',connected:'false',now:1000},{type:'player',playerId:'light',connected:false,gone:'anything',now:1000},
    {type:'vip',action:'anything',now:1000},{type:'speech',key:'voice',ms:500,now:1000},{type:'speechStart',key:'voice',now:1000},
    {type:'timer',phaseId:'other',startedAt:1000,now:5000},{type:'timer',phaseId:'move',startedAt:999,now:5000}];
  for(const state of [first,done])for(const event of invalid)assert.equal(reduce(state,event),state);
  for(const now of [NaN,Infinity,-1,-0,1e15+1])assert.equal(reduce(first,{type:'vip',action:'end',now}),first);
  const before=JSON.stringify(first),input=sampleInput(first,'light',createRng(4),'easy');assert(input);const after=reduce(first,{type:'input',playerId:'light',input,now:2000});assert.notEqual(after,first);assert.equal(JSON.stringify(first),before);assertJson(after);
});

test('contract live timer requires exact phase instance and elapsed deadline',()=>{
  const first=init(context({turnSeconds:2}));assert.equal(first.phase.deadline,3000);
  const timer={type:'timer',phaseId:'move',startedAt:first.phase.startedAt,now:2999};assert.equal(reduce(first,timer),first);
  const done=reduce(first,{...timer,now:3000});assert.equal(done.phase.id,'done');assert.equal(done.winner,'dark');assert.equal(done.endReason,'turn-clock-forfeit');assert.equal(done.phase.deadline,null);
  const input=sampleInput(first,'light',createRng(1),'easy');const next=reduce(first,{type:'input',playerId:'light',input,now:1000});assert(next.phase.startedAt>first.phase.startedAt);assert.equal(reduce(next,{...timer,now:4000}),next);
  const untimed=init(context());assert.equal(reduce(untimed,{...timer,startedAt:untimed.phase.startedAt,now:1e6}),untimed);
});

test('VIP pause/resume shifts only the deadline; skip/end remain available',()=>{
  const first=init(context({turnSeconds:2})),held=reduce(first,{type:'vip',action:'pause',now:1500});assert.equal(held.phase.paused.at,1500);assert.equal(held.autoPaused,false);
  const input=sampleInput(first,'light',createRng(1),'easy');assert.equal(reduce(held,{type:'input',playerId:'light',input,now:4000}),held);assert.equal(reduce(held,{type:'timer',phaseId:'move',startedAt:first.phase.startedAt,now:4000}),held);
  assert.equal(reduce(held,{type:'vip',action:'pause',now:1800}),held);const resumed=reduce(held,{type:'vip',action:'resume',now:4500});assert.equal(resumed.phase.deadline,6000);assert.equal(resumed.phase.startedAt,first.phase.startedAt);assert.equal(resumed.phase.paused,undefined);
  assert.equal(reduce(resumed,{type:'vip',action:'resume',now:4600}),resumed);
  const skipped=reduce(held,{type:'vip',action:'skip',now:2000});assert.equal(skipped.ply,1);assert.equal(skipped.phase.paused.at,2000);assert.equal(skipped.side,-1);
  const ended=reduce(held,{type:'vip',action:'end',now:2200});assert.equal(ended.phase.id,'done');assert.equal(ended.endReason,'vip-end');assert.equal(ended.winner,null);
});

test('presence auto-holds empty rooms, resumes clocks and permanently preserves leavers',()=>{
  const first=init(context({turnSeconds:10}));
  const held=reduce(first,{type:'vip',action:'pause',now:1200});let empty=reduce(held,{type:'player',playerId:'light',connected:false,now:1300});empty=reduce(empty,{type:'player',playerId:'dark',connected:false,now:1400});assert.equal(empty.autoPaused,false);assert.equal(empty.phase.paused.at,1200);
  let automatic=reduce(first,{type:'player',playerId:'dark',connected:false,now:1200});automatic=reduce(automatic,{type:'player',playerId:'light',connected:false,now:1300});assert.equal(automatic.autoPaused,true);assert.equal(automatic.phase.paused.at,1300);
  assert.equal(reduce(automatic,{type:'vip',action:'resume',now:1500}),automatic);
  const back=reduce(automatic,{type:'player',playerId:'light',connected:true,now:2300});assert.equal(back.autoPaused,false);assert.equal(back.phase.paused,undefined);assert.equal(back.phase.deadline,12000);
  const intentional=reduce(automatic,{type:'vip',action:'pause',now:1600});assert.equal(intentional.autoPaused,false);const reconnected=reduce(intentional,{type:'player',playerId:'light',connected:true,now:2300});assert.equal(reconnected.phase.paused.at,1300);
  const gone=reduce(first,{type:'player',playerId:'light',connected:false,gone:'left',now:2000});assert.equal(gone.ply,1);assert.equal(gone.side,-1);assert.deepEqual(gone.left,['light']);assert.equal(gone.players.light.connected,false);
  const rejoin=reduce(gone,{type:'player',playerId:'light',connected:true,now:2200});assert.equal(rejoin,gone);assert.equal(reduce(gone,{type:'player',playerId:'light',connected:false,gone:'kicked',now:2200}),gone);
  const none=init({...context(),players:context().players.map(player=>({...player,connected:false}))});assert.equal(none.autoPaused,true);assert.equal(none.phase.paused.at,1000);
});

test('hostile seat IDs, public view equality, spectator safety and cloned projections',()=>{
  for(const ids of [['__proto__','constructor'],['','toString']]){
    const first=freeze(init(context({},1,ids)));assert.deepEqual(Object.keys(first.players),ids);const tv=tvView(first);
    for(const id of [...ids,'unknown',null,undefined,Symbol('x')]){const view=controllerView(first,id);assertJson(view);assert.deepEqual(view.board,tv.board);assert.equal(Object.hasOwn(view,'rng'),false);assert.equal(Object.hasOwn(view,'repetition'),false);assert.equal(Object.hasOwn(view,'left'),false);assert.equal(view.canMove,id===ids[0]);}
    const moved=reduce(first,{type:'input',playerId:ids[0],input:sampleInput(first,ids[0],createRng(1),'easy'),now:1000});assert.equal(moved.ply,1);
    tv.board[0]=99;assert.notEqual(first.board[0],99);tv.settings.turnSeconds=99;assert.notEqual(first.settings.turnSeconds,99);
    const end=reduce(moved,{type:'vip',action:'end',now:2000});const scores=results(end);assert.deepEqual(Object.keys(scores.scores),ids);assert.deepEqual(scores.winnerIds,ids);assertJson(scores);
  }
});

test('complete legal inputs and terminal scores preserve every original seat',()=>{
  const first=init(context());assert.equal(results(first),null);
  for(const fixture of REFERENCE_RULE_CASES){let state=positionState(core,sparseBoard(fixture.variant,fixture.pieces),fixture.variant,fixture.side);const before=JSON.stringify(state);const move=fixture.exact[0];state=reduce(freeze(state),moveEvent(state,move.path));assert.equal(state.ply,1,fixture.name);assert.notEqual(JSON.stringify(state),before);}
  const board=sparseBoard('american',{10:1,6:-1});const state=positionState(core,board);const won=reduce(state,moveEvent(state,[10,1]));assert.equal(won.phase.id,'done');assert.equal(won.winner,'light');assert.equal(won.endReason,'no-legal-move');const win=results(won);assert.deepEqual(win.scores,{light:1,dark:0});assert.deepEqual(win.winnerIds,['light']);assert.equal(win.ranking.find(row=>row.playerId==='dark').rank,2);
  const resigned=reduce(first,{type:'input',playerId:'light',input:{type:'resign'},now:1000});assert.equal(resigned.winner,'dark');assert.equal(resigned.endReason,'resignation');assert.equal(resigned.phase.deadline,null);
  const left=reduce(first,{type:'player',playerId:'dark',connected:false,gone:'kicked',now:1000});const ended=reduce(left,{type:'vip',action:'end',now:2000});assert.deepEqual(Object.keys(results(ended).scores),['light','dark']);assertJson(results(ended));
});

test('all three bot levels are schema-valid deterministic pure choices in every phase/role',()=>{
  for(const variant of ['american','international']){
    const states=[init(context({variant})),positionState(core,sparseBoard(variant,variant==='american'?{17:2,14:-1,15:-1,23:-1,22:-1}:{40:1,36:-1,27:-1,18:-1,9:-1}),variant)];
    for(const state of states)for(const skill of ['easy','normal','sharp']){
      freeze(state);const before=JSON.stringify(state),a=sampleInput(state,'light',createRng(23),skill),b=sampleInput(state,'light',createRng(23),skill);assert.deepEqual(a,b);assert(inputSchema.safeParse(a).success);assert.equal(JSON.stringify(state),before);
      const next=reduce(state,{type:'input',playerId:'light',input:a,now:1001});assert.notEqual(next,state);assert.equal(sampleInput(state,'dark',createRng(23),skill),null);assert.equal(sampleInput(state,'spectator',createRng(23),skill),null);
      const held=reduce(state,{type:'vip',action:'pause',now:1001});assert.equal(sampleInput(held,'light',createRng(23),skill),null);
      const done=reduce(state,{type:'vip',action:'end',now:1001});assert.equal(sampleInput(done,'light',createRng(23),skill),null);
    }
  }
});

test('manifest and every generated phase fixture replay without throwing',async()=>{
  const manifestFile=JSON.parse(await readFile(new URL('../manifest.json',import.meta.url),'utf8'));assert.deepEqual(manifest,manifestFile);
  let last;for(const phase of core.game.phases){const state=JSON.parse(await readFile(new URL('../fixtures/'+phase+'.json',import.meta.url),'utf8'));assert.equal(state.phase.id,phase);assertJson(state);assertJson(tvView(state));for(const id of [...state.order,'spectator'])assertJson(controllerView(state,id));const next=reduce(state,{type:'vip',action:'end',now:5000});assert.equal(next.phase.id,'done');assert(results(next));last=state;}
  const move=JSON.parse(await readFile(new URL('../fixtures/move.json',import.meta.url),'utf8'));assert.deepEqual(reduce(move,{type:'input',playerId:move.order[0],input:{type:'resign'},now:2000}),last);
});
