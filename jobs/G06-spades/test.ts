import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {manifestSchema} from './preflight.ts';
import {stateSchema,deckSchema} from './data-schema.ts';
import {context,simulate,conservation} from './runner.ts';
import type {State,Input} from './core.ts';
const C:typeof import('./core.ts')=await import(process.env.CORE_PATH??'./core.ts');
const Card:typeof import('./cards.ts')=await import(process.env.CARD_PATH??'./cards.ts');
const Score:typeof import('./scoring.ts')=await import(process.env.SCORE_PATH??'./scoring.ts');
const freeze=<T>(o:T):T=>{if(o&&typeof o==='object'){Object.freeze(o);for(const v of Object.values(o))freeze(v);}return o;};
const fixture=(phase:string):State=>JSON.parse(readFileSync(`fixtures/${phase}.json`,'utf8'));
const input=(s:State,id:string,value:Input):State=>C.reduce(s,{type:'input',playerId:id,input:value,now:s.phase.startedAt+1});
const timer=(s:State)=>({type:'timer' as const,phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline??s.phase.startedAt+1});
test('shared manifest, canonical 52-card deck and schemas regenerate valid data',()=>{
 assert.deepEqual(C.manifest,JSON.parse(readFileSync('manifest.json','utf8')));assert(manifestSchema.safeParse(C.manifest).success);assert.equal(C.manifest.unlimitedDuration,true);
 const data=deckSchema.parse(JSON.parse(readFileSync('deck.json','utf8')));assert.equal(new Set(data.map(c=>c.id)).size,52);for(let color=0;color<4;color++)assert.equal(data.filter(c=>c.suit===['clubs','diamonds','hearts','spades'][color]).length,13);
 assert.equal(Card.cardName(0),'2♣');assert.equal(Card.cardName(51),'A♠');assert.equal(Card.rank(51),14);
});
test('edition rosters, clone safety, deterministic shuffling and default settings',()=>{
 for(const n of [2,5])assert.throws(()=>C.init(context(n)));assert.throws(()=>C.init(context(3,1,{mode:'partnership'})));
 const ctx=context();ctx.players[1]!.id='p0';assert.throws(()=>C.init(ctx));
 const original=context(),s=C.init(original);original.players[0]!.name='Changed';assert.equal(s.players.p0!.name,'Player 1');assert.deepEqual(C.init(context()),s);assert.notDeepEqual(C.init(context(4,2)).hands,s.hands);
 assert.equal(s.settings.nilValue,100);assert.equal(s.settings.blindGap,100);assert.equal(s.settings.failedNilCounts,false);assert.equal(s.settings.mercy,true);
 assert.equal(C.sideOf(s,'p0'),C.sideOf(s,'p2'));assert.notEqual(C.sideOf(s,'p0'),C.sideOf(s,'p1'));conservation(s);
});
test('three-player stock and club-removal presets conserve their exact deck',()=>{
 for(const cutDeck of ['stock','low-club']){const s=C.init(context(3,1,{cutDeck}));assert(Object.values(s.hands).every(h=>h.length===17));conservation(s);if(cutDeck==='stock')assert(s.stock!==null);else {assert.equal(s.stock,null);assert(!Object.values(s.hands).flat().includes(0));}}
 for(const cutDeck of ['stock','low-club'])for(let seed=1;seed<=30;seed++){
  let s=C.init(context(3,seed,{cutDeck,cutLead:'club'}));for(let i=0;i<3;i++)s=C.reduce(s,{type:'vip',action:'skip',now:i+1});
  assert.equal(s.phase.id,'play');const club=Math.min(...Object.values(s.hands).flat().filter(c=>c<13)),id=s.seats[s.turn]!;
  assert.equal(s.forcedLead,club);assert.deepEqual(C.controllerView(s,id).legal,[club]);assert(s.hands[id]!.includes(club));
  const played=C.reduce(s,{type:'vip',action:'skip',now:4});assert.equal(played.trick[0]!.card,club);conservation(played);
 }
});
test('original lead suit remains compulsory after another player trumps',()=>{
 const trick=[{playerId:'p0',card:1},{playerId:'p1',card:51}];assert.deepEqual(Card.legalCards([0,39],trick,true),[0]);
 assert.deepEqual(Card.legalCards([13,39],trick,true),[13,39]);
});
test('unbroken-spade leads wait except when every remaining card is spades',()=>{
 assert.deepEqual(Card.legalCards([0,51],[],false),[0]);assert.deepEqual(Card.legalCards([39,51],[],false),[39,51]);assert.deepEqual(Card.legalCards([0,51],[],true),[0,51]);
 assert.deepEqual(Card.legalCards([0,1,51],[],false,1),[1]);
});
test('highest trump or original-lead card wins regardless of off-suit aces',()=>{
 assert.equal(Card.winningPlay([{playerId:'a',card:0},{playerId:'b',card:25},{playerId:'c',card:11}])!.playerId,'c');
 assert.equal(Card.winningPlay([{playerId:'a',card:12},{playerId:'b',card:39},{playerId:'c',card:51}])!.playerId,'c');assert.equal(Card.winningPlay([]),null);
});
test('contract exact/missed/overtrick scoring and carried multiple ten-bag penalties',()=>{
 const normal=(value:number,won:number)=>({bid:{kind:'number' as const,value},won});
 assert.equal(Score.scoreSide([normal(4,4)],0,0).score,40);assert.equal(Score.scoreSide([normal(4,3)],0,0).score,-40);
 assert.deepEqual(Score.scoreSide([normal(4,6)],59,9),{bid:4,won:6,contractTricks:6,contract:40,nil:0,newBags:2,penalty:100,score:1,bags:1});
 const tenth=Score.scoreSide([normal(4,5)],0,9);assert.equal(tenth.penalty,100);assert.equal(tenth.bags,0);assert.equal(tenth.score,-59);
 const big=Score.scoreSide([{bid:{kind:'nil',value:0},won:17}],0,9);assert.equal(big.penalty,200);assert.equal(big.bags,6);
});
test('ordinary and blind nil bonuses are independent of partner success',()=>{
 const nil={bid:{kind:'nil' as const,value:0},won:0},blind={bid:{kind:'blind' as const,value:0},won:0},partner={bid:{kind:'number' as const,value:4},won:3};
 assert.equal(Score.scoreSide([nil,partner],0,0).score,60);assert.equal(Score.scoreSide([blind,partner],0,0).score,160);
 assert.equal(Score.scoreSide([{...nil,won:1},partner],0,0).score,-139);assert.equal(Score.scoreSide([{...blind,won:1},partner],0,0).score,-239);
 assert.equal(Score.scoreSide([nil,blind],0,0).score,300);assert.equal(Score.scoreSide([nil],0,0,50).score,50);
});
test('failed nil tricks never silently rescue the default contract; contribution is selectable',()=>{
 const seats=[{bid:{kind:'nil' as const,value:0},won:1},{bid:{kind:'number' as const,value:4},won:3}];
 const usual=Score.scoreSide(seats,0,0),alternate=Score.scoreSide(seats,0,0,100,true);
 assert.equal(usual.contract,-40);assert.equal(usual.newBags,1);assert.equal(usual.score,-139);assert.equal(alternate.contract,40);assert.equal(alternate.score,-60);
});
test('schema rejects unknown, extra, malformed and nonfinite inputs',()=>{
 for(const value of [null,{type:'play',card:52},{type:'play',card:-1},{type:'bid',value:NaN},{type:'bid',value:Infinity},{type:'bid',value:0},{type:'bid',value:18},{type:'exchange',cards:[0]},{type:'next',extra:true},{type:'other'}])assert.equal(C.inputSchema.safeParse(value).success,false);
 for(const value of [{type:'look'},{type:'blind-nil'},{type:'bid',value:1},{type:'nil'},{type:'exchange',cards:[0,1]},{type:'play',card:51},{type:'next'}])assert(C.inputSchema.safeParse(value).success);
});
test('blind nil cannot inspect a hand or be declared after looking',()=>{
 const s=C.init(context(4,1,{blindGap:0})),id=s.seats[s.turn]!;assert.equal(s.phase.id,'blind');assert.deepEqual(C.controllerView(s,id).hand,[]);
 const looked=input(s,id,{type:'look'});assert.equal(looked.phase.id,'bid');assert.equal(C.controllerView(looked,id).hand.length,13);assert.equal(input(looked,id,{type:'blind-nil'}),looked);
 const blinded=input(s,id,{type:'blind-nil'});assert.deepEqual(blinded.bids[id],{kind:'blind',value:0});assert.equal(C.controllerView(blinded,id).hand.length,13);assert.equal(input(blinded,id,{type:'bid',value:5}),blinded);
});
test('blind score deficit, disabled blind and contextual bid ceilings are enforced',()=>{
 const s=C.init(context()),id=s.seats[s.turn]!;assert.equal(s.phase.id,'bid');assert.equal(C.blindEligible(s,id),false);assert.equal(input(s,id,{type:'blind-nil'}),s);assert.equal(input(s,id,{type:'bid',value:14}),s);
 const side=C.sideOf(s,id),down={...s,scores:s.scores.map((v,i)=>i===side?-100:0)};assert(C.blindEligible(down,id));assert(!C.blindEligible({...down,settings:{...down.settings,blind:false}},id));
 const cut=C.init(context(3,1));assert.notEqual(input(cut,cut.seats[cut.turn]!,{type:'bid',value:17}),cut);
});
test('sequential exchange conserves cards and permits returning a received card',()=>{
 const s=fixture('exchange'),route=s.exchangePlan[0]!,cards=s.hands[route.from]!.slice(0,2);
 const sent=input(freeze(s),route.from,{type:'exchange',cards});assert.equal(sent.hands[route.from]!.length,11);assert.equal(sent.hands[route.to]!.length,15);conservation(sent);
 const returned=input(sent,route.to,{type:'exchange',cards});assert.equal(returned.phase.id,'play');assert.deepEqual(returned.hands,s.hands);conservation(returned);
});
test('exchange rejects duplicate or unheld cards and wrong actors without changing identity',()=>{
 const s=fixture('exchange'),route=s.exchangePlan[0]!,card=s.hands[route.from]![0]!,other=s.seats.find(id=>id!==route.from&&id!==route.to)!;
 assert.equal(input(s,route.from,{type:'exchange',cards:[card,card]}),s);assert.equal(input(s,other,{type:'exchange',cards:s.hands[other]!.slice(0,2)}),s);
 assert.equal(input(s,route.from,{type:'exchange',cards:s.hands[other]!.slice(0,2)}),s);
});
test('play rejects wrong seats, unheld cards and illegal suit choices',()=>{
 const s=fixture('play'),id=s.seats[s.turn]!,other=s.seats[(s.turn+1)%s.seats.length]!;
 assert.equal(input(s,other,{type:'play',card:s.hands[other]![0]!}),s);assert.equal(input(s,id,{type:'play',card:s.hands[other]![0]!}),s);
 const follow={...s,trick:[{playerId:other,card:1}],hands:{...s.hands,[id]:[0,51]},broken:true};assert.equal(input(follow,id,{type:'play',card:51}),follow);
});
test('each completed trick has one winner who leads next; hands score once',()=>{
 const s=fixture('trick'),winner=s.completed.at(-1)!.winner,next=input(s,'p0',{type:'next'});assert.equal(next.phase.id,'play');assert.equal(next.seats[next.turn],winner);assert.equal(next.trickNumber,s.trickNumber+1);assert.deepEqual(next.trick,[]);
 const hand=fixture('hand'),done=input(hand,'p0',{type:'next'});assert.equal(done.phase.id,'done');assert.deepEqual(done.scores,hand.scores);
 assert.equal(C.reduce(done,{...timer(hand),now:hand.phase.deadline!}),done);
});
test('500 threshold, mercy threshold and shared leading ties follow the selected rules',()=>{
 const s=fixture('hand');assert.equal(input({...s,scores:[500,499]},'p0',{type:'next'}).doneReason,'target');
 assert.notEqual(input({...s,scores:[500,500]},'p0',{type:'next'}).phase.id,'done');
 assert.equal(input({...s,scores:[-500,0]},'p0',{type:'next'}).doneReason,'mercy');
 assert.notEqual(input({...s,scores:[-500,0],settings:{...s.settings,mercy:false}},'p0',{type:'next'}).phase.id,'done');
});
test('all phases ignore spectators, unexpected inputs, stale timers and early deadlines',()=>{
 for(const phase of C.game.phases){const s=freeze(fixture(phase));for(const id of ['unknown','__proto__','constructor','toString'])for(const value of [{type:'look'},{type:'nil'},{type:'bid',value:1},{type:'play',card:0},{type:'next'}] as Input[])assert.equal(input(s,id,value),s);
  assert.equal(C.reduce(s,{...timer(s),phaseId:'old'}),s);assert.equal(C.reduce(s,{...timer(s),startedAt:s.phase.startedAt-1}),s);
  if(s.phase.deadline!==null)assert.equal(C.reduce(s,{...timer(s),now:s.phase.deadline-1}),s);
  for(const event of [null,{},[],{type:'input',playerId:{toString:null,valueOf:null},input:{type:'next'},now:1},{type:'player',playerId:{toString:null},connected:false,now:1},{type:'speech',key:'reader',ms:20,now:1},{type:'speechStart',key:'reader',now:1},{type:'vip',action:'unknown',now:1},{...timer(s),now:Infinity}])assert.equal(C.reduce(s,event as never),s);
 }
});
test('pause freezes input and timer; resume shifts visible deadlines exactly',()=>{
 for(const phase of C.game.phases.filter(p=>p!=='done')){
  const s=fixture(phase),now=s.phase.startedAt+1,paused=C.reduce(s,{type:'vip',action:'pause',now});assert(paused.phase.paused);assert.equal(C.reduce(paused,timer(paused)),paused);assert.equal(input(paused,s.seats[0]!,{type:'next'}),paused);
  for(const id of s.seats)assert.equal(C.controllerView(paused,id).inputType,null);
  const resumed=C.reduce(paused,{type:'vip',action:'resume',now:now+1234});assert(!resumed.phase.paused);assert.equal(resumed.phase.deadline,s.phase.deadline===null?null:s.phase.deadline+1234);
 }
});
test('disconnect defaults retain seats; paused drops finish on resume; permanent leave stays left',()=>{
 const s=C.init(context()),id=s.seats[s.turn]!,paused=C.reduce(s,{type:'vip',action:'pause',now:1});
 const left=C.reduce(paused,{type:'player',playerId:id,connected:false,gone:'left',now:2});assert.equal(left.phase.startedAt,paused.phase.startedAt);
 const resumed=C.reduce(left,{type:'vip',action:'resume',now:3});assert.notEqual(resumed.phase.startedAt,s.phase.startedAt);assert.equal(C.controllerView(resumed,id).inputType,null);
 const reconnect=C.reduce(resumed,{type:'player',playerId:id,connected:true,now:4});assert.equal(reconnect.players[id]!.connected,false);
 const done=C.reduce(reconnect,{type:'vip',action:'end',now:5});assert.deepEqual(Object.keys(C.results(done)!.scores),s.seats);assert(C.results(done)!.winnerIds.length>0);
});
test('initially disconnected actors take legal defaults, while an empty table waits',()=>{
 const ctx=context(),actor=C.init(ctx).seats[C.init(ctx).turn]!;
 ctx.players.find(p=>p.id===actor)!.connected=false;
 const started=C.init(ctx);assert.notEqual(started.seats[started.turn],actor);assert.deepEqual(started.bids[actor],{kind:'number',value:1});conservation(started);
 for(const p of ctx.players)p.connected=false;
 const empty=C.init(ctx);assert.equal(Object.keys(empty.bids).length,0);assert.equal(empty.seats[empty.turn],actor);
 assert.equal(C.reduce(empty,timer(empty)),empty);assert.equal(C.reduce(empty,{type:'vip',action:'end',now:1}).phase.id,'done');
});
test('ending a partial trick leaves the unfinished hand unscored and conserves every card',()=>{
 const s=fixture('play'),id=s.seats[s.turn]!,card=C.controllerView(s,id).legal[0]!;
 const played=input(s,id,{type:'play',card}),end=C.reduce(played,{type:'vip',action:'end',now:played.phase.startedAt+1});
 assert.deepEqual(end.scores,s.scores);assert.equal(end.doneReason,'host');conservation(end);
});
test('private hands and stock never influence another viewer or bot policy',()=>{
 for(const phase of C.game.phases){const s=fixture(phase);for(const id of [...s.seats,'unknown','__proto__']){
  const changed={...s,hands:Object.fromEntries(s.seats.map(key=>[key,key===id?[...s.hands[key]!]:s.hands[key]!.map(c=>(c+1)%52)])),stock:s.stock===null?51:(s.stock+1)%52};
  assert.deepEqual(C.tvView(changed),C.tvView(s));assert.deepEqual(C.controllerView(changed,id),C.controllerView(s,id));
  for(const skill of ['easy','normal','sharp'] as const)assert.deepEqual(C.game.bot.sampleInput(changed,id,createRng(17),skill),C.game.bot.sampleInput(s,id,createRng(17),skill));
 }}
});
test('view arrays/objects are detached; unknown viewers receive no hand, role or controls',()=>{
 const s=freeze(fixture('play'));for(const id of ['unknown','__proto__','constructor']){const v=C.controllerView(s,id);assert.equal(v.me.role,'spectator');assert.deepEqual(v.hand,[]);assert.deepEqual(v.legal,[]);assert.equal(v.partner,null);assert.equal(v.inputType,null);}
 const id=s.seats[s.turn]!,v=C.controllerView(s,id);v.hand[0]=99;v.players[0]!.name='Changed';v.settings.mode='cutthroat';assert.notEqual(s.hands[id]![0],99);assert.notEqual(s.players.p0!.name,'Changed');assert.equal(s.settings.mode,'partnership');
});
test('all fixtures conform to JSON schemas and every phase is exitable',()=>{
 for(const phase of C.game.phases){const s=fixture(phase);stateSchema.parse(s);conservation(s);assert.equal(s.phase.id,phase);
  for(const id of [...s.seats,'unknown','__proto__'])for(const skill of ['easy','normal','sharp'] as const){const value=C.game.bot.sampleInput(s,id,createRng(601),skill);assert(value===null||C.inputSchema.safeParse(value).success);}
  if(phase==='done'){assert(C.results(s));assert.equal(input(s,'p0',{type:'next'}),s);}else assert.notEqual(C.reduce(freeze(s),{type:'vip',action:'skip',now:s.phase.startedAt+1}),s);
 }
});
test('long-match idle persists until explicit VIP end; no invented round cutoff',()=>{
 let s=freeze(C.init(context()));for(let i=0;i<1000;i++){const next=C.reduce(s,{...timer(s),now:1e9+i});assert.equal(next,s);s=next;}
 assert.equal(s.handNumber,1);assert.equal(s.phase.id,'bid');const end=C.reduce(s,{type:'vip',action:'end',now:1e9+1001});assert.equal(end.phase.id,'done');assert(Object.values(C.results(end)!.scores).every(Number.isFinite));
});
test('legitimate prototype-name seats can act without becoming spectator aliases',()=>{
 const ctx=context();ctx.players[0]!.id='__proto__';ctx.players[1]!.id='constructor';ctx.players[2]!.id='toString';const s=C.init(ctx),id=s.seats[s.turn]!;
 assert.equal(C.controllerView(s,id).me.role,'player');assert.notEqual(input(s,id,{type:'bid',value:1}),s);assert.deepEqual(Object.keys(C.results(C.reduce(s,{type:'vip',action:'end',now:1}))!.scores),s.seats);
});
test('pure game modules use no host entropy, clock, timers, I/O or network',()=>{
 for(const path of ['core.ts','cards.ts','scoring.ts','bots.ts'])assert(!/Math\.random|Date\.now|setTimeout\(|setInterval\(|fetch\(|node:fs|node:child_process/.test(readFileSync(path,'utf8')),path);
});
if(!process.env.FAST_TEST){
 test('seeds 1/2/3 plus 1000 unique random seeds replay every full match byte-identically',()=>{
  const rng=createRng(0x6006001),seeds=new Set([1,2,3]);while(seeds.size<1003)seeds.add(rng.int(0,0xffffffff));
  for(const seed of seeds)simulate(3+seed%2,seed,{replay:true,check:true,settings:{cutDeck:seed>>>2&1?'stock':'low-club',cutLead:seed>>>3&1?'club':'dealer',nilValue:seed>>>4&1?50:100,failedNilCounts:!!(seed>>>5&1),mercy:!!(seed>>>6&1),blindGap:seed>>>7&1?0:100,blind:!!(seed>>>8&1),exchange:!!(seed>>>9&1)}});
 });
 for(const n of [3,4])test(`1000 complete bot matches at ${n} players`,()=>{for(let seed=1;seed<=1000;seed++)simulate(n,seed,{check:true});});
}
