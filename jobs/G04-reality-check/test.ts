import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {manifestSchema} from './preflight.ts';
import {sampleRows,makeSamples,catalogSchema,realms} from './samples.ts';
import {numberScore,quickScore,normalize} from './scoring.ts';
import {numberMidpoint,initialEstimate} from './estimates.ts';
import {replaySeeds,replaySamplerSeed} from './verification-seeds.ts';
import type {State,Input} from './core.ts';
const C:typeof import('./core.ts')=await import(process.env.CORE_PATH??'./core.ts');
export const context=(n=2,seed=1,settings:Record<string,string|boolean|number>={})=>({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings});
function freeze<T>(o:T):T{if(o&&typeof o==='object'){Object.freeze(o);for(const value of Object.values(o))freeze(value);}return o;}
export const timer=(s:State)=>({type:'timer' as const,phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});
export function toPhase(id:string,seed=1,settings:Record<string,string|boolean|number>={}):State{
 let s=C.init(context(3,seed,settings));
 for(let step=0;step<2000&&s.phase.id!=='done';step++){
  if(s.phase.id===id)return s;
  const actor=s.seats.find(p=>C.game.bot.sampleInput(s,p,createRng(seed+step),'normal'));
  if(actor){const input=C.game.bot.sampleInput(s,actor,createRng(seed+step),'normal')!;s=C.reduce(s,{type:'input',playerId:actor,input,now:s.phase.startedAt+1});}
  else s=C.reduce(s,timer(s));
 }
 if(s.phase.id===id)return s;throw new Error(`phase ${id} not found`);
}
function input(s:State,id:string,value:Input):State{return C.reduce(s,{type:'input',playerId:id,input:value,now:s.phase.startedAt+1});}

test('catalog has twenty original rows per realm and reproducible validated bytes',()=>{
 assert.equal(sampleRows.length,160);for(const realm of realms)assert.equal(sampleRows.filter(r=>r.realm===realm.id).length,20);
 assert.deepEqual(makeSamples(),makeSamples());assert.deepEqual(catalogSchema.parse(sampleRows),sampleRows);
 assert.equal(catalogSchema.safeParse([...sampleRows,sampleRows[0]]).success,false);
 assert.equal(catalogSchema.safeParse(sampleRows.map(r=>r.kind==='number'?{...r,correct:-1}:r)).success,false);
});
test('language-bearing quiz manifest preserves default English content metadata',()=>{
 assert.equal(sampleRows.length,160);
 assert(sampleRows.every(row=>row.prompt.trim().length>0),'quiz prompts carry language');
 assert.equal(C.manifest.noCards,undefined,'noCards is reserved for games without cards, prompts or language text');
 assert.equal(C.manifest.contentLangs?.[0]??'en','en','absent contentLangs selects English');
 assert.deepEqual(JSON.parse(readFileSync('manifest.json','utf8')),C.manifest);
});
test('numeric score is symmetric, bounded, unit invariant and zero-safe without overflow',()=>{
 assert.equal(numberScore(1,2),500);assert.equal(numberScore(2,1),500);assert.equal(numberScore(.5,1),500);
 assert.equal(numberScore(0,0),1000);assert.equal(numberScore(0,1),0);assert.equal(numberScore(1,0),0);
 for(const bad of [NaN,Infinity,-1])assert.equal(numberScore(bad,1),0);
 assert.equal(numberScore(Number.MAX_VALUE,Number.MAX_VALUE/2),500);
 for(let n=1;n<=1000;n++)assert.equal(numberScore(n,317),numberScore(n*100,31700));
});
test('date and choice scoring use the declared exact/proximity units',()=>{
 const century=sampleRows.find(r=>r.kind==='century')!;assert.equal(quickScore(century,Number(century.correct)),1000);assert.equal(quickScore(century,Number(century.correct)+1),750);assert.equal(quickScore(century,Number(century.correct)+4),0);
 const decade=sampleRows.find(r=>r.kind==='decade')!;assert.equal(quickScore(decade,Number(decade.correct)+10),750);
 const choice=sampleRows.find(r=>r.kind==='choice')!;assert.equal(quickScore(choice,Number(choice.correct)),1000);assert.equal(quickScore(choice,1-Number(choice.correct)),0);
});
test('BCE and CE centuries are adjacent without an imaginary century zero',()=>{
 const row=sampleRows.find(r=>r.kind==='century')!;assert.equal(quickScore({...row,correct:-1} as State['question'],1),750);
 assert.equal(quickScore({...row,correct:1} as State['question'],-1),750);
 assert.equal(quickScore({...row,correct:1} as State['question'],0),0);
 assert.equal(quickScore({...row,correct:-2} as State['question'],2),250);
});
test('schema rejects nonfinite, malformed, oversized and additional fields',()=>{
 for(const value of [{type:'answer',value:NaN},{type:'answer',value:Infinity},{type:'answer',value:1e13},{type:'write',text:'x'.repeat(161)},{type:'vote',choice:'correct'},{type:'vote',choice:'o100'},{type:'next',extra:1},{type:'other'},null])assert.equal(C.inputSchema.safeParse(value).success,false);
 for(const value of [{type:'answer',value:0},{type:'write',text:'fiction'},{type:'vote',choice:'o0'},{type:'next'}])assert(C.inputSchema.safeParse(value).success);
});
test('settings, distinct rosters and mode balancing are explicit',()=>{
 assert.throws(()=>C.init(context(1)));assert.throws(()=>C.init(context(9)));const ctx=context();ctx.players[1]!.id='p0';assert.throws(()=>C.init(ctx));
 const s=C.init(context(2,1,{mode:'nonsense',rounds:99}));assert.equal(s.settings.mode,'mixed');assert.equal(s.settings.rounds,8);
 const isBluff=(id:string)=>realms.find(r=>r.id===id)!.kind==='bluff';assert.equal(s.order.filter(isBluff).length,4);
 for(const mode of ['quick','bluff'])assert(C.init(context(2,1,{mode})).order.every(id=>isBluff(id)===(mode==='bluff')));
});
test('factory clones injected content and keeps the exact shared init signature',()=>{
 const rows=makeSamples(),g=C.createGame(rows),before=g.init(context());for(const r of rows)r.prompt='changed';assert.equal(g.init(context()).question.prompt,before.question.prompt);
});
test('first appearances have ten-second demos using a distinct unscored row',()=>{
 const wheel=C.init(context());const demo=C.reduce(wheel,timer(wheel));assert.equal(demo.phase.id,'demo');assert.equal(demo.phase.deadline!-demo.phase.startedAt,10000);assert.notEqual(demo.question.id,demo.example.id);
 assert.equal(C.tvView(demo).demo!.correct,demo.example.correct);assert.deepEqual(demo.scores,wheel.scores);
 const next=C.reduce(demo,timer(demo));assert(['answer','write'].includes(next.phase.id));
 const seen={...wheel,seen:[wheel.question.realm]};assert.notEqual(C.reduce(seen,timer(seen)).phase.id,'demo');
});
test('bad contextual answers and repeated submissions preserve identity',()=>{
 const s=toPhase('answer',1,{mode:'quick'});assert.equal(input(s,'p0',{type:'answer',value:1e12}),s);
 const good=Number(s.question.correct),n=input(s,'p0',{type:'answer',value:good});assert.equal(input(n,'p0',{type:'answer',value:good}),n);
 const century={...s,question:sampleRows.find(r=>r.kind==='century')!};assert.equal(input(century,'p0',{type:'answer',value:0}),century);
 const decade={...s,question:sampleRows.find(r=>r.kind==='decade')!};assert.equal(input(decade,'p0',{type:'answer',value:1901}),decade);
 const numeric={...s,question:sampleRows.find(r=>r.kind==='number')!};
 assert.equal(input(numeric,'p0',{type:'answer',value:numeric.question.kind==='number'?numeric.question.min-1:-1}),numeric);
 assert.equal(input(numeric,'p0',{type:'answer',value:numeric.question.kind==='number'?numeric.question.max+1:1e12}),numeric);
});
test('all answers close a quick round and the last round doubles each award once',()=>{
 let s=toPhase('answer',1,{mode:'quick'});s={...s,round:s.settings.rounds};const correct=Number(s.question.correct);
 for(const id of s.seats)s=input(s,id,{type:'answer',value:correct});assert.equal(s.phase.id,'reveal');for(const id of s.seats)assert.equal(s.scores[id],2000);
 const again=C.reduce(s,{type:'timer',phaseId:'answer',startedAt:s.phase.startedAt-1,now:s.phase.deadline!});assert.equal(again,s);
 s=input(s,'p0',{type:'next'});assert.equal(s.phase.id,'done');assert.equal(C.results(s)!.winnerIds.length,3);
});
test('empty and format-only fakes are rejected; normalization merges equivalent text',()=>{
 const s=toPhase('write',1,{mode:'bluff'});assert.equal(input(s,'p0',{type:'write',text:'   '}),s);assert.equal(input(s,'p0',{type:'write',text:'\u200b'}),s);
 assert.equal(normalize('  ＣＯＰＰＥＲ\n Compass '),'copper compass');
});
test('Unicode normalization keeps stored bluff writes within the 160-unit limit',()=>{
 const s=toPhase('write',91,{mode:'bluff'});
 for(const text of ['\ufdfa'.repeat(9),'\ufdfa'.repeat(160),'a'.repeat(158)+'\ufb03']){
  assert(C.inputSchema.safeParse({type:'write',text}).success,'raw input fits the socket limit');
  assert.equal(input(s,'p0',{type:'write',text}),s,'expanded fake must not lock a submission');
 }
 for(const text of ['\ufdfa'.repeat(8)+'x'.repeat(16),'a'.repeat(157)+'\ufb03','Ａ'.repeat(160)]){
  const n=input(s,'p0',{type:'write',text});
  assert.equal(n.responses.p0,text.normalize('NFKC'),'valid normalized boundary is retained exactly');
  assert.equal(String(n.responses.p0).length,160);
 }
 assert.equal(input(input(s,'p0',{type:'write',text:'\ufdfa'.repeat(160)}),'p0',{type:'write',text:'valid retry'}).responses.p0,'valid retry','refused expansion permits a normal retry');
});
test('Unicode normalization cannot exceed the saved-state ceiling across twelve bluff rounds',()=>{
 let s=C.init(context(8,91,{mode:'bluff',rounds:12}));let rejected=0,steps=0;
 const oversized={type:'write' as const,text:'\ufdfa'.repeat(160)};
 while(s.phase.id!=='done'&&steps++<300){
  if(s.phase.id==='write'){
   for(const id of s.seats){assert.equal(input(s,id,oversized),s,'oversized normalized fake is refused for every seat');rejected++;}
   s=C.reduce(s,timer(s));
  }else if(s.phase.id==='vote'){
   const truth=s.options.find(option=>option.correct)!;
   for(const id of s.seats)if(s.phase.id==='vote')s=input(s,id,{type:'vote',choice:truth.id});
  }else s=C.reduce(s,timer(s));
  assert(Buffer.byteLength(JSON.stringify(s))<=256*1024,'every reached state fits the original contract ceiling');
 }
 assert.equal(s.phase.id,'done');assert.equal(rejected,96);
 assert.deepEqual(Object.keys(C.results(s)!.scores),s.seats);
});
test('catalog truth normalization uses the writable display limit without limiting casefold keys',()=>{
 for(const correct of ['\ufdfa'.repeat(9),'\ufb03'.repeat(54)]){
  const rows=makeSamples().map(row=>row.kind==='bluff'?{...row,correct}:row);
  assert.throws(()=>C.createGame(rows),'catalog must reject a truth that cannot fit a normalized submission');
 }
 for(const correct of ['\ufdfa'.repeat(8)+'x'.repeat(16),'Ａ'.repeat(160),'\u0130'.repeat(160)]){
  const rows=makeSamples().map(row=>row.kind==='bluff'?{...row,correct}:row),g=C.createGame(rows);
  let s=g.init(context(2,91,{mode:'bluff',rounds:4}));
  for(let step=0;step<10&&s.phase.id!=='write';step++)s=g.reduce(s,timer(s));
  assert.equal(s.phase.id,'write');
  s=g.reduce(s,{type:'input',playerId:'p0',input:{type:'write',text:correct},now:s.phase.startedAt+1});
  assert.equal(String(s.responses.p0).length,160,'bounded normalized display remains writable');
  s=g.reduce(s,timer(s));
  assert.equal(g.controllerView(s,'p0').foundTruth,true);
  s=g.reduce(s,timer(s));assert.equal(s.last!.awards.p0,1000,'valid truth is credited once');
 }
});
test('duplicate fake authors share credit, own votes are invalid, option IDs are anonymous',()=>{
 let s=toPhase('write',1,{mode:'bluff'});s=input(s,'p0',{type:'write',text:'same fake'});s=input(s,'p1',{type:'write',text:'SAME   FAKE'});s=input(s,'p2',{type:'write',text:'other fake'});
 assert.equal(s.phase.id,'vote');assert.equal(s.options.length,3);const shared=s.options.find(o=>o.owners.length===2)!;const truth=s.options.find(o=>o.correct)!;
 assert.equal(input(s,'p0',{type:'vote',choice:shared.id}),s);
 assert(!JSON.stringify(C.tvView(s).options).includes('owners'));assert(!JSON.stringify(C.tvView(s).options).includes('correct'));
 s=input(s,'p0',{type:'vote',choice:truth.id});s=input(s,'p1',{type:'vote',choice:truth.id});s=input(s,'p2',{type:'vote',choice:shared.id});
 assert.equal(s.phase.id,'reveal');assert.equal(s.last!.awards.p0,1250);assert.equal(s.last!.awards.p1,1250);assert.equal(s.last!.awards.p2,0);
});
test('correct writes receive truth credit once and private confirmation without a vote',()=>{
 let s=toPhase('write',1,{mode:'bluff'});s=input(s,'p0',{type:'write',text:String(s.question.correct)});s=input(s,'p1',{type:'write',text:'different one'});s=input(s,'p2',{type:'write',text:'different two'});
 assert.equal(C.controllerView(s,'p0').foundTruth,true);assert.equal(C.controllerView(s,'p0').inputType,null);assert.equal(s.scores.p0,0);
 const truth=s.options.find(o=>o.correct)!;assert.equal(input(s,'p0',{type:'vote',choice:truth.id}),s);
 s=input(s,'p1',{type:'vote',choice:truth.id});s=input(s,'p2',{type:'vote',choice:truth.id});assert.equal(s.scores.p0,1000);
});
test('fooled-vote credit is independent of author/voter seat order',()=>{
 let s=toPhase('write',1,{mode:'bluff'});
 for(const id of s.seats)s=input(s,id,{type:'write',text:`fake ${id}`});
 const fake=s.options.find(o=>o.owners.includes('p2'))!,truth=s.options.find(o=>o.correct)!;
 s=input(s,'p0',{type:'vote',choice:fake.id});s=input(s,'p1',{type:'vote',choice:truth.id});s=input(s,'p2',{type:'vote',choice:truth.id});
 assert.equal(s.last!.awards.p2,1500,'later truth award must retain already-earned fooled-vote credit');
});
test('live answers, other inputs, fake authors and vote choices stay private until reveal',()=>{
 const a=toPhase('answer',1,{mode:'quick'}),b={...a,question:{...a.question,correct:a.question.kind==='bluff'?'other':Number(a.question.correct)+1} as State['question']};
 assert.deepEqual(C.tvView(a),C.tvView(b));assert.deepEqual(C.controllerView(a,'p0'),C.controllerView(b,'p0'));
 let w=toPhase('write',1,{mode:'bluff'});w=input(w,'p0',{type:'write',text:'own fake'});w=input(w,'p1',{type:'write',text:'private one'});const w2={...w,responses:{...w.responses,p1:'private replacement'}};
 assert.deepEqual(C.tvView(w),C.tvView(w2));assert.deepEqual(C.controllerView(w,'p0'),C.controllerView(w2,'p0'));assert.equal(C.controllerView(w,'p1').mine,'private one');
 w=input(w,'p2',{type:'write',text:'private two'});const swap={...w,options:w.options.map(o=>({...o,correct:!o.correct,owners:o.owners.map(id=>id==='p1'?'p2':id==='p2'?'p1':id)}))};
 assert.deepEqual(C.tvView(w),C.tvView(swap));assert.deepEqual(C.controllerView(w,'p0'),C.controllerView(swap,'p0'));
 for(const skill of ['easy','normal','sharp'] as const)assert.deepEqual(C.game.bot.sampleInput(w,'p0',createRng(7),skill),C.game.bot.sampleInput(swap,'p0',createRng(7),skill));
 const votedState=input(w,'p1',{type:'vote',choice:w.options.find(o=>o.correct)!.id});
 if(votedState.phase.id==='vote'){const changed={...votedState,votes:{...votedState.votes,p1:'o99'}};assert.deepEqual(C.controllerView(votedState,'p0'),C.controllerView(changed,'p0'));}
});
test('views are detached copies and spectators never gain private controls',()=>{
 const s=freeze(toPhase('write',1,{mode:'bluff'}));for(const id of ['unknown','__proto__','constructor']){const v=C.controllerView(s,id);assert.equal(v.me.role,'spectator');assert.equal(v.mine,null);assert.equal(v.inputType,null);assert.equal(C.game.bot.sampleInput(s,id,createRng(1)),null);}
 const v=C.tvView(s);v.players[0]!.name='changed';assert.notEqual(s.players.p0!.name,'changed');
});
test('stale and early timers, wrong phases, spectators and unknown events preserve state',()=>{
 const s=freeze(C.init(context()));assert.equal(C.reduce(s,{...timer(s),now:s.phase.deadline!-1}),s);assert.equal(C.reduce(s,{...timer(s),startedAt:s.phase.startedAt-1}),s);assert.equal(C.reduce(s,{...timer(s),phaseId:'other'}),s);
 for(const id of ['unknown','__proto__','constructor'])for(const value of [{type:'next'},{type:'write',text:'fake'},{type:'answer',value:1}] as Input[])assert.equal(input(s,id,value),s);
 assert.equal(input(s,'p0',{type:'answer',value:1}),s);assert.equal(C.reduce(s,{type:'speech',key:'x',ms:20,now:1}),s);assert.equal(C.reduce(s,{type:'speechStart',key:'x',now:1}),s);
 assert.equal(C.reduce(s,{type:'vip',action:'other',now:1} as never),s);assert.equal(C.reduce(s,{type:'timer',now:Infinity,phaseId:s.phase.id,startedAt:s.phase.startedAt}),s);
});
test('pause freezes input/timers, shifts deadlines, and resumes a drop-finished phase',()=>{
 let s=toPhase('answer',1,{mode:'quick'});s=input(s,'p0',{type:'answer',value:Number(s.question.correct)});s=input(s,'p1',{type:'answer',value:Number(s.question.correct)});
 const p=C.reduce(s,{type:'vip',action:'pause',now:s.phase.startedAt+10});assert.equal(C.reduce(p,timer(p)),p);assert.equal(input(p,'p2',{type:'answer',value:Number(s.question.correct)}),p);
 const resume=C.reduce(p,{type:'vip',action:'resume',now:p.phase.paused!.at+1234});assert.equal(resume.phase.deadline,s.phase.deadline!+1234);
 assert.equal(resume.phase.paused,undefined);assert.equal(C.controllerView(resume,'p2').inputType,'answer');
 const dropped=C.reduce(p,{type:'player',playerId:'p2',connected:false,gone:'left',now:p.phase.startedAt+20});assert.equal(dropped.phase.id,'answer');
 const ended=C.reduce(dropped,{type:'vip',action:'resume',now:p.phase.paused!.at+1234});assert.equal(ended.phase.id,'reveal');assert.equal(ended.last!.awards.p2,0);
});
test('disconnect/leave preserve result seats and an unknown drop is ignored',()=>{
 const s=C.init(context()),n=C.reduce(s,{type:'player',playerId:'p1',connected:false,gone:'left',now:1});assert.equal(C.reduce(s,{type:'player',playerId:'__proto__',connected:false,now:1}),s);
 assert.equal(C.controllerView(n,'p1').inputType,null);const done=C.reduce(n,{type:'vip',action:'end',now:2});assert.deepEqual(Object.keys(C.results(done)!.scores),s.seats);assert.equal(C.results(done)!.ranking.length,2);
});
test('all phases exit on deadlines or VIP skip and ended games ignore play',()=>{
 for(const phase of C.game.phases){const s=toPhase(phase,1);if(phase==='done'){assert.equal(input(s,'p0',{type:'next'}),s);assert.equal(s.phase.deadline,null);}else{assert(s.phase.deadline!==null);assert.notEqual(C.reduce(s,timer(s)),s);assert.notEqual(C.reduce(s,{type:'vip',action:'skip',now:s.phase.deadline!}),s);}}
});
test('bots use only public/own data, remain deterministic, and distinguish real strategies',()=>{
 const s=toPhase('answer',1,{mode:'quick'});const rngA=createRng(42),rngB=createRng(42);
 assert.deepEqual(C.game.bot.sampleInput(s,'p0',rngA,'sharp'),C.game.bot.sampleInput(s,'p0',rngB,'sharp'));assert.deepEqual(rngA.state(),rngB.state());
 const row=sampleRows.find(r=>r.kind==='number')!,numeric={...s,question:row};assert.notDeepEqual(C.game.bot.sampleInput(numeric,'p0',createRng(1),'sharp'),C.game.bot.sampleInput(numeric,'p0',createRng(1),'normal'));
 const other={...numeric,question:{...row,correct:row.kind==='number'?row.max:0} as State['question']};assert.deepEqual(C.game.bot.sampleInput(numeric,'p0',createRng(8),'sharp'),C.game.bot.sampleInput(other,'p0',createRng(8),'sharp'));
 for(const phase of C.game.phases){const p=toPhase(phase);for(const id of [...p.seats,'unknown'])for(const skill of ['easy','normal','sharp'] as const){const action=C.game.bot.sampleInput(freeze(p),id,createRng(17),skill);if(action)assert(C.inputSchema.safeParse(action).success);}}
});
test('game modules contain no host entropy, clock, timers, network or I/O',()=>{
 for(const name of ['core.ts','bots.ts','scoring.ts','samples.ts','estimates.ts'])assert(!/Math\.random|Date\.now|setTimeout\(|setInterval\(|fetch\(|node:fs|node:child_process/.test(readFileSync(name,'utf8')),name);
 assert(manifestSchema.safeParse(C.manifest).success);
});
test('strong bots read short public years and explicit eras without seeing the answer',()=>{
 const s=toPhase('answer',1,{mode:'quick'});
 const cases:[string,string,number][]=[['century','Label: 1 CE',1],['century','Label: 9 BCE',-1],['century','Label: 23 bce',-1],['century','Object 7, dated 101CE',2],['century','Object 7, dated 2001CE',21],['century','Object 7, dated 10000 CE',100],['decade','The name peaked in 7',0],['decade','The name peaked in 23',20]];
 for(const [kind,prompt,expected] of cases){
  const row=sampleRows.find(r=>r.kind===kind)!,n={...s,question:{...row,prompt,min:kind==='century'?-100:0,max:kind==='century'?100:3000,correct:expected} as State['question']};
  const action=C.game.bot.sampleInput(n,'p0',createRng(1),'sharp');assert(action?.type==='answer');assert.equal(action.value,expected,prompt);
  const changed={...n,question:{...n.question,correct:kind==='century'?99:2900} as State['question']};assert.deepEqual(C.game.bot.sampleInput(changed,'p0',createRng(1),'sharp'),action,'live truth must not affect the public-clue answer');
 }
});
test('all bot skills submit legal answers on tiny numbers and negative-only century ranges',()=>{
 const base=toPhase('answer',1,{mode:'quick'});
 const cases=[{kind:'number',min:1e-200,max:1e-180,correct:1e-190,prompt:'Estimate within the shown bounds.'},{kind:'number',min:Number.MIN_VALUE,max:1e-310,correct:1e-317,prompt:'Estimate within the shown bounds.'},{kind:'century',min:-1,max:0,correct:-1,prompt:'Label: 9 BCE'}];
 for(const data of cases){const row={...sampleRows.find(r=>r.kind===data.kind)!,...data} as State['question'],s={...base,question:row};
  for(const skill of ['easy','normal','sharp'] as const)for(let seed=1;seed<=1000;seed++){
   const action=C.game.bot.sampleInput(s,'p0',createRng(seed),skill);assert(action?.type==='answer');assert(C.validAnswer(row,action.value),`${data.kind}/${skill}/${seed}`);assert.notEqual(input(s,'p0',action),s);
  }
 }
});
test('controller defaults stay inside fractional and one-sided date bounds',()=>{
 const number=sampleRows.find(r=>r.kind==='number')!,century=sampleRows.find(r=>r.kind==='century')!,decade=sampleRows.find(r=>r.kind==='decade')!;
 for(const [min,max] of [[.01,.02],[1e-200,1e-180],[Number.MIN_VALUE,1e-310],[0,Number.MIN_VALUE],[999999999999,1e12]]){
  const row={...number,min,max,correct:min} as State['question'];assert(C.validAnswer(row,initialEstimate('number',min!,max!)));const middle=numberMidpoint(min!,max!);assert(Number.isFinite(middle)&&middle>=min!&&middle<=max!);
 }
 for(const [min,max] of [[-1,0],[-100,-80],[0,1],[95,100],[-1,1]])assert(C.validAnswer({...century,min,max} as State['question'],initialEstimate('century',min!,max!)));
 assert(C.validAnswer(decade,initialEstimate('decade',1900,2100)));
});
test('medium bluffs follow the public two-word hint in every bluff realm',()=>{
 const s=toPhase('write',1,{mode:'bluff'});
 for(const realm of ['real-town-or-fake','patent-pending','do-not-use']){
  const row=sampleRows.find(r=>r.realm===realm)!;
  for(let seed=1;seed<=100;seed++){
   const action=C.game.bot.sampleInput({...s,question:row},'p0',createRng(seed),'normal');assert(action?.type==='write');assert.equal(action.text.trim().split(/\s+/).length,2);assert(C.inputSchema.safeParse(action).success);
  }
 }
});
test('catalog rejects whitespace and format-only truths before a blank vote can be created',()=>{
 for(const correct of [' ','\u200b','\n\t','\u3000']){
  const rows=makeSamples().map(r=>r.kind==='bluff'?{...r,correct}:r);
  assert.equal(catalogSchema.safeParse(rows).success,false);assert.throws(()=>C.createGame(rows));
 }
 assert(catalogSchema.safeParse(makeSamples().map(r=>r.kind==='bluff'?{...r,correct:' Ｃｏｐｐｅｒ\u200bCompass '}:r)).success);
});
test('manifest bytes and all seven phase fixtures use the contract and play to completion',()=>{
 assert.deepEqual(C.manifest,JSON.parse(readFileSync('manifest.json','utf8')));
 for(const phase of C.game.phases){let s:State=JSON.parse(readFileSync(`fixtures/${phase}.json`,'utf8'));assert.equal(s.phase.id,phase);let steps=0;
  while(s.phase.id!=='done'&&steps++<3000){const id=s.seats.find(id=>C.game.bot.sampleInput(s,id,createRng(steps),'normal'));s=id?input(s,id,C.game.bot.sampleInput(s,id,createRng(steps),'normal')!):C.reduce(s,timer(s));}
  assert.equal(s.phase.id,'done');assert(C.results(s));
 }
});
export function simulate(n:number,seed:number,mode='mixed',replay=false):State{
 let s=C.init(context(n,seed,{mode})),second=C.init(context(n,seed,{mode}));const rngs=s.seats.map((_,i)=>createRng(seed^(i+17)));
 let steps=0;
 while(s.phase.id!=='done'&&steps<3000){
  let actor:string|null=null,action:Input|null=null;
  for(let i=0;i<s.seats.length;i++){const sampled=C.game.bot.sampleInput(s,s.seats[i]!,rngs[i]!,i%3===0?'sharp':i%3===1?'normal':'easy');if(sampled){actor=s.seats[i]!;action=sampled;break;}}
  const event=action?{type:'input' as const,playerId:actor!,input:action,now:s.phase.startedAt+1}:timer(s);
  if(action)assert(C.inputSchema.safeParse(action).success);
  const before=s;s=C.reduce(s,event);assert.notEqual(s,before,'legal action/timer must make progress');
  if(replay){second=C.reduce(second,event);assert.equal(JSON.stringify(s),JSON.stringify(second));}
  assert(s.seats.every(id=>Number.isFinite(s.scores[id]!)));steps++;
 }
 assert.equal(s.phase.id,'done');assert(Buffer.byteLength(JSON.stringify(s))<=256*1024);const r=C.results(s)!;assert.deepEqual(Object.keys(r.scores),s.seats);assert.equal(r.ranking.length,n);return s;
}
if(!process.env.FAST_TEST){
 test('property replay seeds 1/2/3 plus 1000 random seeded event streams',()=>{
  const seeds=replaySeeds();assert.equal(seeds.length,1003);assert.equal(new Set(seeds).size,1003);
  assert.deepEqual(JSON.parse(readFileSync('property-seeds.json','utf8')),{samplerSeed:replaySamplerSeed,seeds});
  for(const seed of seeds)simulate(2+seed%7,seed,['quick','mixed','bluff'][seed%3],true);
 });
 for(const mode of ['quick','mixed','bluff'])for(let n=2;n<=8;n++)test(`1000 complete bot games: ${n} seats ${mode}`,()=>{for(let seed=1;seed<=1000;seed++)simulate(n,seed,mode);});
 test('1000 timer-only rosters finish inside estimatedMinutes × 3',()=>{
  for(let seed=1;seed<=1000;seed++){let s=C.init(context(2+seed%7,seed,{mode:['quick','mixed','bluff'][seed%3],rounds:12}));let steps=0;while(s.phase.id!=='done'&&steps++<200)s=C.reduce(s,timer(s));assert.equal(s.phase.id,'done');assert(s.phase.startedAt<=C.manifest.estimatedMinutes*3*60000);for(const score of Object.values(s.scores))assert.equal(score,0);}
 });
}
