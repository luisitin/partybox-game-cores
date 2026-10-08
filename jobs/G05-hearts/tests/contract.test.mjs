import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import ts from 'typescript';
import {game,start,finish,toPhase,timer,eventFor,stateSchema,createRng,propertySeeds,rules} from './helpers.mjs';
const jsonSafe=x=>assert.deepEqual(JSON.parse(JSON.stringify(x)),x);
function check(s){assert.ok(Buffer.byteLength(JSON.stringify(s))<=256*1024);assert.ok(stateSchema.safeParse(s).success,String(stateSchema.safeParse(s).error));jsonSafe(s);jsonSafe(game.tvView(s));for(const id of [...s.order,'spectator','__proto__','constructor']){jsonSafe(game.controllerView(s,id));const input=game.bot.sampleInput(s,id,createRng(3),'normal');assert.ok(input===null||game.inputSchema.safeParse(input).success);}}
function conservation(s){const remaining=Object.values(s.hands).flat();const played=s.played.map(p=>p.card);const all=[...remaining,...played];assert.equal(new Set(all).size,all.length);assert.deepEqual(all.sort((a,b)=>a-b),rules.deckFor(s.order.length,s.settings.threeDeck));const won=Object.values(s.captured).flat();const completed=s.played.slice(0,Math.floor(s.played.length/s.order.length)*s.order.length).map(p=>p.card);assert.deepEqual([...won].sort((a,b)=>a-b),completed.sort((a,b)=>a-b));}

test('invariants1/3/4/5/7/8:1003 property seeds, complete event-by-event deterministic replays, no mutation',()=>{
 let total=0,maxBytes=0;
 for(const seed of propertySeeds()){
  const n=3+seed%4;let s=start(seed,n,{target:25,moon:seed%2?'subtract':'add',jack:Boolean(seed%3),noPass:seed%7===0,queenBreaks:Boolean(seed%5===0),threeDeck:seed%2?'clubs':'diamonds',turnSeconds:seed%3===0?10:0});
  let replay=JSON.parse(JSON.stringify(s));check(s);
  for(const e of [{type:'input',playerId:'spectator',input:{type:'next'},now:1001},{type:'input',playerId:'__proto__',input:{type:'play',card:0},now:1001},{type:'player',playerId:'constructor',connected:false,now:1001},{type:'player',playerId:s.actor,connected:'yes',now:1001},{type:'input',playerId:s.actor,input:null,now:1001},{type:'input',playerId:s.actor,input:{type:'pass',cards:[]},now:NaN},{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt-1,now:s.phase.deadline??1002},{type:'speech',key:'unrelated',ms:123,now:1001},{type:'speechStart',key:'unrelated',now:1001},{type:'vip',action:'resume',now:1001},{type:'unexpected',now:1001}])assert.equal(game.reduce(s,e),s);
  const done=finish(s,{},(prev,event,next)=>{
   const before=JSON.stringify(prev),ev=JSON.stringify(event);replay=game.reduce(replay,JSON.parse(ev));
   assert.equal(JSON.stringify(prev),before);assert.equal(JSON.stringify(event),ev);assert.equal(JSON.stringify(next),JSON.stringify(replay));
   jsonSafe(game.tvView(next));if(next.phase.id==='hand')conservation(next);maxBytes=Math.max(maxBytes,Buffer.byteLength(JSON.stringify(next)));total++;
  }).state;check(done);assert.deepEqual(Object.keys(game.results(done).scores).sort(),done.order);for(const v of Object.values(game.results(done).scores))assert.ok(Number.isFinite(v));
 }
 assert.ok(maxBytes<256*1024);console.log(JSON.stringify({propertySeeds:1003,replayedEvents:total,maxStateBytes:maxBytes}));
});
test('invariants6/7/8:1000 complete100-point bot matches at EVERY valid count3–6',()=>{
 for(const n of [3,4,5,6]){
  let maxSteps=0,maxDuration=0,events=0;
  for(let k=0;k<1000;k++){
   const seed=100_000+n*10_000+k;const s=start(seed,n,{moon:k%2?'add':'subtract',jack:Boolean(k%3===0),threeDeck:k%2?'clubs':'diamonds'});
   const skills=Object.fromEntries(s.order.map((id,i)=>[id,['easy','normal','sharp'][(i+k)%3]]));
   const done=finish(s,skills,(prev,e,next)=>{if(e.type==='input')assert.ok(game.inputSchema.safeParse(e.input).success);if(next.phase.id==='hand')conservation(next);});
   check(done.state);assert.ok(game.results(done.state));assert.equal(Object.keys(game.results(done.state).scores).length,n);
   maxSteps=Math.max(maxSteps,done.steps);maxDuration=Math.max(maxDuration,done.state.phase.startedAt-s.phase.startedAt);events+=done.events.length;
  }
  // Unlimited classical mode has an extended active-bot budget; all finite matches must complete.
  assert.ok(maxSteps<30_000);console.log(JSON.stringify({players:n,games:1000,events,maxSteps,maxDurationMinutes:maxDuration/60_000}));
 }
});
test('invariants1/3/6: every event in every phase, every phase exits, idle classic games persist',()=>{
 const states=game.phases.map(p=>toPhase(start(7,4,{target:25,turnSeconds:10}),p));
 for(const s of states){check(s);for(const action of ['pause','resume','skip','end'])check(game.reduce(s,{type:'vip',action,now:s.phase.startedAt+2}));for(const id of [...s.order,'unknown','__proto__']){
  for(const input of [{type:'next'},{type:'pass',cards:[0,1,2]},{type:'play',card:51},{},null])assert.doesNotThrow(()=>game.reduce(s,{type:'input',playerId:id,input,now:s.phase.startedAt+1}));
  for(const gone of [undefined,'left','kicked'])check(game.reduce(s,{type:'player',playerId:id,connected:false,...(gone?{gone}:{}),now:s.phase.startedAt+1}));
 }
 for(const e of [{type:'timer',phaseId:'stale',startedAt:s.phase.startedAt,now:s.phase.deadline??1000},{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt-1,now:s.phase.deadline??1000},{type:'speech',key:'any',ms:-1,now:s.phase.startedAt+1},{type:'speechStart',key:'any',now:s.phase.startedAt+1}])assert.equal(game.reduce(s,e),s);
 if(s.phase.id!=='done'){assert.notEqual(game.reduce(s,{type:'vip',action:'skip',now:s.phase.startedAt+1}),s);assert.equal(game.reduce(s,{type:'vip',action:'end',now:s.phase.startedAt+1}).phase.id,'done');}
 }
 for(const n of [3,4,5,6]){
  const idle=start(8,n);assert.equal(idle.phase.deadline,null);assert.equal(game.reduce(idle,{type:'timer',phaseId:idle.phase.id,startedAt:idle.phase.startedAt,now:1e9}),idle);
  let empty=idle;for(const id of empty.order)empty=game.reduce(empty,{type:'player',playerId:id,connected:false,gone:'left',now:1002});const snapshot=JSON.stringify(empty);assert.equal(game.reduce(empty,{type:'timer',phaseId:empty.phase.id,startedAt:empty.phase.startedAt,now:1e9}),empty);assert.equal(JSON.stringify(empty),snapshot);assert.equal(Object.keys(game.results(game.reduce(empty,{type:'vip',action:'end',now:1e9})).scores).length,n);
  let timed=start(9,n,{turnSeconds:10,target:25});for(let k=0;timed.phase.id!=='done'&&k<30_000;k++)timed=timer(timed);assert.equal(timed.phase.id,'done');
 }
});
test('invariant5: private hands and pass choices cannot alter another controller or TV; bot ignorance',()=>{
 for(const n of [3,4,5,6])for(const phase of ['pass','play','trick','hand','done']){
  const s=toPhase(start(44,n,{target:25}),phase);
  for(const owner of s.order){
   const altered={...s,hands:{...s.hands,[owner]:[...s.hands[owner]].reverse()},passes:{...s.passes},sent:{...s.sent},received:{...s.received}};
   if(Object.hasOwn(s.passes,owner))altered.passes[owner]=[51,50,49];if(Object.hasOwn(s.sent,owner))altered.sent[owner]=[51,50,49];if(Object.hasOwn(s.received,owner))altered.received[owner]=[51,50,49];
   assert.deepEqual(game.tvView(altered),game.tvView(s));
   for(const viewer of [...s.order.filter(id=>id!==owner),'spectator','__proto__']){assert.deepEqual(game.controllerView(altered,viewer),game.controllerView(s,viewer));for(const skill of ['easy','normal','sharp'])assert.deepEqual(game.bot.sampleInput(altered,viewer,createRng(37),skill),game.bot.sampleInput(s,viewer,createRng(37),skill));}
  }
  for(const forbidden of ['hands','passes','sent','received','captured','rng'])assert.ok(!Object.hasOwn(game.tvView(s),forbidden));
 }
});
test('invariant2: AST purity of every core/reference module, onlyzod runtime dependency',()=>{
 const banned=/^(?:(?:Math\.random|Date\.now|performance\.now|setTimeout|setInterval|fetch|require|eval|Function|XMLHttpRequest|WebSocket)$|console\.)/;
 for(const name of readdirSync('src').filter(n=>n.endsWith('.ts')&&n!=='browser.ts')){
  const ast=ts.createSourceFile(name,readFileSync('src/'+name,'utf8'),ts.ScriptTarget.Latest,true);
  function walk(node){if(ts.isCallExpression(node)||ts.isNewExpression(node))assert.ok(!banned.test(node.expression.getText(ast)),`${name}:${node.expression.getText(ast)}`);if(ts.isImportDeclaration(node))assert.ok(!/['"](?:node:|https?:)/.test(node.moduleSpecifier.getText(ast)));if(ts.isVariableStatement(node)&&node.parent===ast)assert.ok(node.declarationList.flags&ts.NodeFlags.Const);ts.forEachChild(node,walk);}walk(ast);
 }
 const pkg=JSON.parse(readFileSync('package.json','utf8'));assert.deepEqual(Object.keys(pkg.dependencies),['zod']);
});
test('invariant9: exact manifest contract, real fixtures for every phase, done played from finalhand',async()=>{
 const{gameManifestSchema}=await import('../.build/contract-validation.mjs');assert.ok(gameManifestSchema.safeParse(game.manifest).success,String(gameManifestSchema.safeParse(game.manifest).error));assert.deepEqual(JSON.parse(readFileSync('manifest.json','utf8')),game.manifest);
 const fixtures=Object.fromEntries(game.phases.map(p=>[p,JSON.parse(readFileSync(`fixtures/${p}.json`,'utf8'))]));
 for(const [p,s]of Object.entries(fixtures)){assert.equal(s.phase.id,p);check(s);conservation(s);assert.equal(finish(s).state.phase.id,'done');}
 assert.deepEqual(finish(fixtures.hand).state,fixtures.done);
});
