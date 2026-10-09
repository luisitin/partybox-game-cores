import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// This is a bounded, independently written review of the unchanged game.
// It records semantic outcomes, not elapsed performance or strategy advantage.
const root=resolve(import.meta.dirname,'../../..');
const core=await import(pathToFileURL(resolve(root,'dist/core.mjs')));
const session=await import(pathToFileURL(resolve(root,'dist/session.mjs')));
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const transcript=createHash('sha256');
let assertions=0;
function check(condition,label){assertions++;assert(condition,label);}
function equal(actual,expected,label){assertions++;assert.deepEqual(actual,expected,label);}
const stats={games:0,states:0,events:0,savedStates:0,privacyStates:0,botCounterfactuals:0,
  dudo:0,calza:0,correctCalza:0,eliminations:0,palificoStarts:0,exemptFaceChanges:0,
  staleTimers:0,unknownInputs:0,maxStateBytes:0,byCount:{},bySettings:{}};
let context=null;
const guards={};
for(const path of ['src/core.ts','src/rules.ts','src/probability.ts','src/session.ts',
 'src/browser.ts','src/play.template.html','play.html','manifest.json',
 'dist/core.mjs','dist/session.mjs','dist/rules.mjs','dist/probability.mjs',
 '../../contract/contract.ts','../../contract/rng.ts'])guards[path]=hash(readFileSync(resolve(root,path)));
function snapshot(state,now){return {version:1,gameId:core.manifest.id,gameVersion:core.manifest.version,
 state,savedHostNow:now,botRng:{seed:0x49d4a32e,step:113},
 skills:state.order.map((id,i)=>[id,['easy','normal','sharp'][i%3]]),pace:'manual',
 currentTimerConsumed:false,sampledCurrentBid:state.bid!==null};}
function matches(state){let n=0;const face=state.bid.face,wild=state.settings.onesWild&&!state.palifico;
 for(const id of state.order)for(const die of state.cups[id])if(die===face||(wild&&face!==1&&die===1))n++;
 return n;}
function eligibleCalza(state,id){const alive=state.order.filter(seat=>state.diceCount[seat]>0);
 return state.phase.id==='bid'&&!state.phase.paused&&state.settings.calzaEnabled&&!state.palifico&&
 alive.length>2&&state.diceCount[id]>0&&state.players[id].connected&&!state.left.includes(id)&&
 state.bid!==null&&id!==state.bid.playerId&&(state.settings.calzaPolicy!=='interruptOnly'||id!==state.turn);}
function nextSurvivor(state,after){let index=state.order.indexOf(after);
 for(let n=0;n<state.order.length;n++){index=(index+1)%state.order.length;const id=state.order[index];
  if(state.diceCount[id]>0)return id;}throw new Error('No surviving seat');}
function legalRaise(state,id,bid){
 if(!Number.isSafeInteger(bid.quantity)||bid.quantity<1||bid.quantity>1000000||
   !Number.isInteger(bid.face)||bid.face<1||bid.face>6)return false;
 const previous=state.bid,wild=state.settings.onesWild&&!state.palifico;
 if(previous===null)return !wild||bid.face!==1;
 const experienced=state.seenPalifico[id]&&id!==state.palificoStarter;
 const exemption=experienced&&(state.settings.palificoExemption==='experienced'||
   (state.settings.palificoExemption==='oneDie'&&state.diceCount[id]===1));
 if(state.palifico&&!exemption)return bid.face===previous.face&&bid.quantity>previous.quantity;
 if(wild&&bid.face===1&&previous.face!==1)return 2*bid.quantity>=previous.quantity;
 if(wild&&previous.face===1&&bid.face!==1)return bid.quantity>2*previous.quantity;
 return bid.quantity>previous.quantity||(bid.quantity===previous.quantity&&bid.face>previous.face);
}
function inspect(state,now,step){
 const bytes=JSON.stringify(state);stats.states++;stats.maxStateBytes=Math.max(stats.maxStateBytes,Buffer.byteLength(bytes));
 check(Buffer.byteLength(bytes)<=256*1024,'state budget');equal(JSON.stringify(JSON.parse(bytes)),bytes,'exact JSON');
 const saved=snapshot(state,now),raw=session.encodeSession(saved);
 check(raw!==null,'naturally reachable state must save');equal(session.decodeSession(raw),saved,'exact natural save');
 stats.savedStates++;transcript.update(hash(bytes));
 for(const id of state.order)equal(core.canCalza(state,id),eligibleCalza(state,id),'independent calza eligibility');
 if(state.phase.id!=='bid'||step%17!==0)return;
 stats.privacyStates++;
 const publicBefore=core.tvView(state);
 for(const viewer of [...state.order,'spectator','__proto__','constructor']){
  if(!state.order.includes(viewer)){equal(core.controllerView(state,viewer).ownDice,[],'spectator cup');continue;}
  const counter=clone(state);
  for(const id of counter.order)if(id!==viewer)counter.cups[id]=counter.cups[id].map(die=>die%6+1);
  counter.rng={seed:0xf4a58313,step:0x17fa};counter.nextStarter=nextSurvivor(counter,viewer);
  equal(core.tvView(counter),publicBefore,'TV independence from every unseen cup');
  equal(core.controllerView(counter,viewer),core.controllerView(state,viewer),'controller hidden-cup/RNG independence');
  for(const skill of ['easy','normal','sharp']){
   const seed=0x512649ab^step;
   const a=core.sampleInput(state,viewer,core.createRng(seed),skill);
   const b=core.sampleInput(counter,viewer,core.createRng(seed),skill);
   equal(a,b,'bot hidden-cup/RNG/future-starter independence');
   check(a===null||core.inputSchema.safeParse(a).success,'bot schema');stats.botCounterfactuals++;
  }
 }
 const unknown={type:'input',playerId:'unoccupied-review-seat',input:{type:'dudo'},now};
 equal(core.reduce(state,unknown),state,'unknown seat unchanged');stats.unknownInputs++;
 const timer={type:'timer',phaseId:state.phase.id,startedAt:state.phase.startedAt-1,now};
 equal(core.reduce(state,timer),state,'stale timer unchanged');stats.staleTimers++;
}
function verifyChallenge(before,event,after){
 const kind=event.input.type;
 if(kind!=='dudo'&&kind!=='calza')return;
 const counted=matches(before),correct=kind==='dudo'?counted<before.bid.quantity:counted===before.bid.quantity;
 const loser=kind==='dudo'?(correct?before.bid.playerId:event.playerId):(correct?null:event.playerId);
 const expected={...before.diceCount};
 if(loser!==null)expected[loser]--;
 else expected[event.playerId]=Math.min(5,expected[event.playerId]+1);
 equal(after.reveal.matches,counted,'independently counted challenge');
 equal(after.reveal.correct,correct,'challenge truth/equality');equal(after.reveal.loser,loser,'challenge loser');
 equal(after.diceCount,expected,'exact die loss/recovery cap');
 const starter=kind==='calza'?event.playerId:loser;
 equal(after.nextStarter,expected[starter]>0?starter:nextSurvivor(after,starter),'clockwise next starter');
 equal(after.reveal.dice,before.cups,'reveal retains original pre-loss/pre-reward dice');
 if(kind==='dudo')stats.dudo++;else{stats.calza++;if(correct)stats.correctCalza++;}
 if(loser!==null&&expected[loser]===0)stats.eliminations++;
}

try{
 let variant=0;
 for(const onesWild of [false,true])for(const palificoEnabled of [false,true])
 for(const palificoExemption of ['none','oneDie','experienced'])
 for(const calzaEnabled of [false,true])for(const calzaPolicy of ['anyOther','interruptOnly']){
  const settings={onesWild,palificoEnabled,palificoExemption,calzaEnabled,calzaPolicy,turnSeconds:1};
  const key=JSON.stringify(settings);stats.bySettings[key]=0;
  for(let count=2;count<=8;count++){
   // Deliberately predeclared new seeds, no historical game/league seed reuse claim.
   const seed=(0x6b570000+variant*37+count)>>>0;
   const ids=Array.from({length:count},(_,i)=>i===0?'':i===1?'__proto__':i===2?'constructor':`seat${i}`);
   let state=core.init({players:ids.map((id,i)=>({id,name:`Review ${i}`,avatarId:'face',connected:true,bot:true})),
    settings,seed,now:1000}),now=1000;
   context={count,variant,seed,settings,step:0,state,event:null};
   const botRng=core.createRng(seed^0x78dc46f1);
   for(let step=0;state.phase.id!=='done'&&step<3000;step++){
    context={count,variant,seed,settings,step,state,event:null};inspect(state,now,step);
    let id=state.phase.id==='reveal'?state.order[0]:state.turn;
    let move=core.sampleInput(state,id,botRng,['easy','normal','sharp'][step%3]);
    if(state.phase.id==='bid'&&state.bid!==null&&step%11===7){
     const caller=state.order.find(seat=>eligibleCalza(state,seat));
     if(caller!==undefined){id=caller;move={type:'calza'};}
    }
    check(move!==null&&core.inputSchema.safeParse(move).success,'active schema-valid move');
    if(move.type==='bid'){
     check(legalRaise(state,id,move),'independent legal raise');
     if(state.palifico&&state.bid!==null&&move.face!==state.bid.face)stats.exemptFaceChanges++;
    }
    const event={type:'input',playerId:id,input:move,now:++now};context.event=event;
    const before=JSON.stringify(state),after=core.reduce(state,event);
    equal(JSON.stringify(state),before,'reducer immutability');
    equal(after,core.reduce(clone(state),clone(event)),'deterministic serialized replay');
    check(after!==state,'active move advances');
    if(state.phase.id==='bid'&&state.bid!==null)verifyChallenge(state,event,after);
    if(!state.palifico&&after.palifico)stats.palificoStarts++;
    state=after;stats.events++;
   }
   context={count,variant,seed,settings,state};
   equal(state.phase.id,'done','bounded game completion');inspect(state,now,3000);
   const results=core.results(state);check(results!==null,'finite results');
   equal(Object.keys(results.scores).sort(),[...ids].sort(),'every original seat retained');
   check(Object.values(results.scores).every(Number.isFinite),'all scores finite');
   stats.games++;stats.byCount[count]=(stats.byCount[count]??0)+1;stats.bySettings[key]++;
  }
  variant++;
 }
 check(stats.games===336&&Object.keys(stats.bySettings).length===48,'complete 48-setting/2–8 matrix');
 check(stats.palificoStarts>0&&stats.calza>0&&stats.correctCalza>0&&stats.exemptFaceChanges>0,'meaningful rule branch coverage');
 for(const [path,before]of Object.entries(guards))equal(hash(readFileSync(resolve(root,path))),before,'actual source/compiled guard '+path);
 const report={passed:true,checkedAt:new Date().toISOString(),runtime:process.version,
  scope:'Bounded independent semantic/privacy/recovery audit; no fresh timing, strategy win-rate or new full-delivery acceptance',
  canonicalHead:'1cc4a9709a60783ecad45476c02668d62f4c8a4a',assertions,stats,sourceGuards:guards,
  transcriptSha256:transcript.digest('hex'),gameplayChanges:0,playerVisibleGain:0};
 writeFileSync(resolve(import.meta.dirname,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:true,assertions,...stats,sourceGuards:Object.keys(guards).length,transcriptSha256:report.transcriptSha256}));
}catch(error){
 mkdirSync(resolve(root,'.work/G07-independent-audit'),{recursive:true});
 writeFileSync(resolve(root,'.work/G07-independent-audit/FAILED.json'),JSON.stringify({passed:false,
  checkedAt:new Date().toISOString(),runtime:process.version,error:String(error),stack:error.stack,assertions,stats,context},null,2)+'\n');
 throw error;
}
