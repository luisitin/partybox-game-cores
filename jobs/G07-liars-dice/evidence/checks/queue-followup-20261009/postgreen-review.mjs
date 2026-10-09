import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];}));
const root=resolve(args['--job']),out=resolve(args['--out']),round=Number(args['--round']);
assert([1,2,3].includes(round));mkdirSync(out,{recursive:true});
const core=await import(pathToFileURL(resolve(root,'dist/core.mjs')));
const session=await import(pathToFileURL(resolve(root,'dist/session.mjs')));
const clone=x=>JSON.parse(JSON.stringify(x));
const sha=x=>createHash('sha256').update(x).digest('hex');
const transcript=createHash('sha256');
const guardNames=['src/core.ts','src/session.ts','src/probability.ts','src/rules.ts','src/browser.ts',
 'src/play.template.html','play.html','manifest.json','dist/core.mjs','dist/session.mjs',
 'dist/probability.mjs','dist/rules.mjs','dist/contract.mjs','scripts/browser-check.mjs',
 'scripts/browser-evidence.mjs','scripts/integrity.mjs','scripts/clock-observation.mjs',
 'scripts/clock-observation-diagnostic.mjs','scripts/frame-coordination.mjs',
 '../../contract/contract.ts','../../contract/rng.ts','../../.github/workflows/G07.yml'];
const guards=Object.fromEntries(guardNames.map(p=>[p,sha(readFileSync(resolve(root,p)))]));
const names=['','__proto__','constructor','toString','alpha','beta','gamma','delta'];
const editions=[];
for(const onesWild of [false,true])for(const palificoEnabled of [false,true])
for(const palificoExemption of ['none','oneDie','experienced'])
for(const calzaEnabled of [false,true])for(const calzaPolicy of ['anyOther','interruptOnly'])
 editions.push({onesWild,palificoEnabled,palificoExemption,calzaEnabled,calzaPolicy});
const priorities={
 1:['Validated recovery of newly advanced initial states at clock endpoints','Empty-room reconnect versus intentional VIP hold','Stale timer identity after automatic initial turns','Hidden-cup and RNG independence after public automatic actions','Finite completion and original result seats with one connected player'],
 2:['Empty-room reconnect versus intentional VIP hold','Stale timer identity after automatic initial turns','Finite completion when the only connected player loses dice','Hidden-cup and RNG independence after public automatic actions','Initial context immutability across all rule settings'],
 3:['Finite completion with the connected seat rotated through every position','Hidden-cup and RNG independence after public automatic actions','Original result seats and finite standings after automatic play','Validated recovery of natural states reached after initial automation','Current evidence cannot be replaced by historical or stale-checker proof'],
};
const stats={contexts:0,saves:0,restores:0,reconnects:0,heldReconnects:0,permanentDepartures:0,
 liveTimerChecks:0,staleTimerChecks:0,games:0,gameEvents:0,privacyStates:0,botCounterfactuals:0,
 resultChecks:0,maxSavedBytes:0};
let assertions=0,context=null;
const startedAt=new Date().toISOString();
function equal(a,b,message){assertions++;assert.deepEqual(a,b,message);}
function check(ok,message){assertions++;assert(ok,message);}
function ctx(count,mask,edition,seed,now,turnSeconds){return {
 players:names.slice(0,count).map((id,i)=>({id,name:`Seat ${i}`,avatarId:'face',connected:!!(mask&(1<<i)),bot:true})),
 settings:{...editions[edition],turnSeconds},seed:seed>>>0,now};}
function saved(state,now){return {version:1,gameId:core.manifest.id,gameVersion:core.manifest.version,state,
 savedHostNow:now,botRng:{seed:73,step:19},skills:state.order.map((id,i)=>[id,['easy','normal','sharp'][i%3]]),
 pace:'manual',currentTimerConsumed:false,sampledCurrentBid:state.bid!==null};}
function saveExactly(state,now){const value=saved(state,now),raw=session.encodeSession(value);
 check(raw!==null,'natural state is accepted by actual save codec');stats.saves++;
 const decoded=session.decodeSession(raw);equal(decoded,value,'exact actual save decode');
 stats.maxSavedBytes=Math.max(stats.maxSavedBytes,Buffer.byteLength(raw));return decoded;}
function playable(state){
 if(state.phase.id==='bid')check(state.players[state.turn].connected&&!state.left.includes(state.turn),'connected active turn');
 else if(state.phase.id==='reveal')check(state.order.some(id=>core.controllerView(state,id).canContinue),'connected reveal acknowledgement');
 else check(state.phase.id==='done','finite terminal phase');
}
function results(state){const result=core.results(state);check(result!==null,'terminal results');
 equal(Object.keys(result.scores).sort(),[...state.order].sort(),'every original result seat');
 check(Object.values(result.scores).every(Number.isFinite),'finite scores');
 equal(result.ranking.map(x=>x.playerId).sort(),[...state.order].sort(),'every original ranked seat');
 for(const row of result.ranking)equal(row.rank,1+Object.values(result.scores).filter(score=>score>row.score).length,'independent competition rank');
 const max=Math.max(...Object.values(result.scores));equal([...result.winnerIds].sort(),state.order.filter(id=>result.scores[id]===max).sort(),'actual tied top scorers');
 stats.resultChecks++;}

try{
 if(round===1){
  const profiles=[{now:0,turnSeconds:0},{now:.5,turnSeconds:1},{now:1e15,turnSeconds:120}];
  for(let count=2;count<=8;count++)for(let edition=0;edition<48;edition++)for(let mask=0;mask<(1<<count);mask++)for(const profile of profiles){
   const seed=(Math.imul(mask+17,0x9e3779b1)^Math.imul(edition+31,0x85ebca6b)^count)>>>0;
   const initContext=ctx(count,mask,edition,seed,profile.now,profile.turnSeconds),input=JSON.stringify(initContext);
   context={count,edition,mask,profile,seed};const state=core.init(initContext),before=JSON.stringify(state);
   equal(JSON.stringify(initContext),input,'initial host context immutable');
   const decoded=saveExactly(state,profile.now),later=profile.now===1e15?profile.now:profile.now+733;
   const restored=session.restoreSessionState(decoded,later);stats.restores++;
   equal(restored.order,state.order,'recovery original seats');equal(restored.players,state.players,'recovery actual presence');
   equal(restored.cups,state.cups,'recovery exact natural cups');equal(restored.rng,state.rng,'recovery exact random cursor');
   equal(restored.bid,state.bid,'recovery exact public automatic bid');equal(restored.phase.id,state.phase.id,'recovery actual phase');
   equal(restored.phase.startedAt,state.phase.startedAt,'same phase instance retained');
   if(mask===0)equal(restored,state,'empty-room hold retained');
   else{playable(restored);equal(restored.phase.deadline,state.phase.deadline===null?null:state.phase.deadline+(later-profile.now),'remaining clock shifted by actual host delta');}
   equal(JSON.stringify(state),before,'save/recovery immutable');transcript.update(sha(before));stats.contexts++;
  }
  equal(stats.contexts,73152,'complete 48 settings/every presence mask/2-8 counts/three genuine host-clock profiles');
 }
 if(round===2){
  for(let count=2;count<=8;count++)for(let edition=0;edition<48;edition++)for(let seat=0;seat<count;seat++)for(const turnSeconds of [0,1,120])for(const now of [0,.5]){
   const seed=(0x517a0000+edition*73+count*19+seat)>>>0,initContext=ctx(count,0,edition,seed,now,turnSeconds);
   context={count,edition,seat,seed,now,turnSeconds};const empty=core.init(initContext),id=names[seat],joinNow=now+701;
   check(empty.autoPaused&&empty.phase.paused,'genuine empty-room hold');
   const joined=core.reduce(empty,{type:'player',playerId:id,connected:true,now:joinNow});stats.reconnects++;
   check(!joined.autoPaused&&!joined.phase.paused,'ordinary reconnect resumes automatic empty-room hold');playable(joined);
   equal(joined.order,empty.order,'reconnect original seats');equal(joined.cups,empty.cups,'reconnect no reroll');equal(joined.rng,empty.rng,'reconnect random cursor');
   equal(core.reduce(joined,{type:'player',playerId:id,connected:true,now:joinNow+1}),joined,'duplicate reconnect does not double-play');
   const intentional=core.reduce(empty,{type:'vip',action:'pause',now:now+3});
   const held=core.reduce(intentional,{type:'player',playerId:id,connected:true,now:joinNow});stats.heldReconnects++;
   check(!held.autoPaused,'VIP hold ownership retained');equal(held.phase.paused,intentional.phase.paused,'intentional hold does not silently resume');
   equal(held.bid,intentional.bid,'intentional hold does not play');equal(held.cups,intentional.cups,'intentional hold does not reroll');
   equal(core.reduce(held,{type:'timer',phaseId:held.phase.id,startedAt:held.phase.startedAt,now:joinNow+130000}),held,'VIP hold ignores timer');
   const resumed=core.reduce(held,{type:'vip',action:'resume',now:joinNow+7});check(!resumed.phase.paused,'explicit VIP resume');playable(resumed);
   const stale={type:'timer',phaseId:joined.phase.id,startedAt:joined.phase.startedAt-1,now:joinNow+130000};
   equal(core.reduce(joined,stale),joined,'stale timer cannot play newly advanced initial state');stats.staleTimerChecks++;
   if(joined.phase.id==='bid'&&joined.phase.deadline!==null){
    equal(core.reduce(joined,{type:'timer',phaseId:joined.phase.id,startedAt:joined.phase.startedAt,now:joined.phase.deadline-.01}),joined,'live timer does not fire before actual deadline');
    const event={type:'timer',phaseId:joined.phase.id,startedAt:joined.phase.startedAt,now:joined.phase.deadline};
    const after=core.reduce(joined,event);check(after!==joined,'exact actual deadline advances');equal(after,core.reduce(clone(joined),clone(event)),'deadline serialized replay deterministic');stats.liveTimerChecks++;
   }
   const departed=core.reduce(joined,{type:'player',playerId:id,connected:false,gone:'left',now:joinNow+9});stats.permanentDepartures++;
   check(departed.left.includes(id)&&!departed.players[id].connected,'actual permanent departure retained');
   equal(core.reduce(departed,{type:'player',playerId:id,connected:true,now:joinNow+10}),departed,'permanent departed seat cannot reconnect');
   saveExactly(joined,joinNow);saveExactly(held,joinNow);saveExactly(resumed,joinNow+7);saveExactly(departed,joinNow+9);
   transcript.update(sha(JSON.stringify(joined)));stats.contexts++;
  }
  equal(stats.contexts,10080,'complete 48 settings/2-8 counts/every rejoining seat/three clocks/two fractional host times');
 }
 if(round===3){
  for(let count=2;count<=8;count++)for(let edition=0;edition<48;edition++)for(let seat=0;seat<count;seat++){
   const seed=(0x6f810000+edition*59+count*29+seat)>>>0,initContext=ctx(count,1<<seat,edition,seed,1000,0),id=names[seat];
   let state=core.init(initContext),now=1000;const random=core.createRng(seed^0x1a73cf49);
   context={count,edition,seat,seed};stats.contexts++;
   for(let step=0;state.phase.id!=='done'&&step<5000;step++){
    context={count,edition,seat,seed,step};playable(state);
    if(step%19===0)saveExactly(state,now);
    if(state.phase.id==='bid'&&step%23===0){
     stats.privacyStates++;const publicBefore=core.tvView(state);
     equal(core.controllerView(state,'unoccupied-review-seat').ownDice,[],'unknown spectator receives no cup');
     for(const viewer of state.order){
      const counter=clone(state);for(const other of state.order)if(other!==viewer)counter.cups[other]=counter.cups[other].map(d=>d%6+1);
      counter.rng={seed:0xf4a58313,step:0x17fa};counter.nextStarter=state.order[(state.order.indexOf(viewer)+1)%count];
      equal(core.tvView(counter),publicBefore,'public independence from private cups/RNG/future starter');
      equal(core.controllerView(counter,viewer),core.controllerView(state,viewer),'controller independence from other cups/RNG/future starter');
      for(const skill of ['easy','normal','sharp']){
       const a=core.sampleInput(state,viewer,core.createRng(seed^step),skill),b=core.sampleInput(counter,viewer,core.createRng(seed^step),skill);
       equal(a,b,'all-skill independence from unseen cups/RNG/future starter');check(a===null||core.inputSchema.safeParse(a).success,'counterfactual bot schema');stats.botCounterfactuals++;
      }
     }
    }
    const move=core.sampleInput(state,id,random,['easy','normal','sharp'][(edition+seat+step)%3]);
    check(move!==null&&core.inputSchema.safeParse(move).success,'sole connected seat has a real legal action');
    const event={type:'input',playerId:id,input:move,now:++now},before=JSON.stringify(state),after=core.reduce(state,event);
    check(after!==state,'real action advances');equal(JSON.stringify(state),before,'reducer does not mutate input');
    equal(after,core.reduce(clone(state),clone(event)),'serialized replay exact');transcript.update(sha(before));
    state=after;stats.gameEvents++;
   }
   equal(state.phase.id,'done','finite complete game');saveExactly(state,now);results(state);stats.games++;
  }
  equal(stats.games,1680,'all 48 settings/2-8 counts/every connected seat position');
 }
 for(const [p,h] of Object.entries(guards))equal(sha(readFileSync(resolve(root,p))),h,'source and physical compiled guard '+p);
 const report={passed:true,startedAt,closedAt:new Date().toISOString(),round,sourceHeadAtStart:args['--head'],
  priorities:priorities[round],reviewedWorst:priorities[round][0],scope:'Finite semantic review of changed startup boundary; no frame timing or strategy win-rate measurement',
  assertions,stats,sourceGuards:guards,transcriptSha256:transcript.digest('hex'),runtimeChanges:0,playerVisibleGain:0,
  result:'No additional player defect established; preserve the adopted startup fix and publish actual review evidence'};
 writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}catch(error){
 writeFileSync(resolve(out,'FAILED.json'),JSON.stringify({passed:false,startedAt,closedAt:new Date().toISOString(),round,
  context,assertions,stats,error:String(error),stack:error.stack},null,2)+'\n');throw error;
}
