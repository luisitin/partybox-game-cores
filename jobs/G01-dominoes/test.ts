import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRng} from '../../contract/rng.ts';
import type {State,Input} from './core.ts';
const C:typeof import('./core.ts')=await import(process.env.CORE_PATH??'./core.ts');
const {game,init,reduce,apply,legal,tile,pips,scoreRound,tvView,controllerView,results,allTiles,observe,choose}=C;
export function context(n=2,seed=1,settings:Record<string,string|boolean|number>={}){return {players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),settings,seed,now:0};}
function freeze<T>(s:T):T {if(s&&typeof s==='object'){Object.freeze(s);for(const v of Object.values(s))freeze(v);}return s;}
const id=(a:number,b:number)=>allTiles().find(i=>JSON.stringify(tile(i))===JSON.stringify([Math.min(a,b),Math.max(a,b)]))!;
function custom(hands:number[][],ends:readonly[number,number]|null=null,settings:Record<string,string|boolean|number>={}):State{
 const s=init(context(hands.length,1,settings));return {...s,hands,stock:allTiles().filter(t=>!hands.flat().includes(t)),ends,forced:null,board:ends===null?[]:[{tile:id(ends[0],ends[1]),a:ends[0],b:ends[1],player:1}],turn:0,passes:0};
}
test('tile universe is exactly unordered double-six, and pip arithmetic agrees',()=>{
 assert.equal(new Set(allTiles().map(t=>JSON.stringify(tile(t)))).size,28);
 assert.deepEqual(tile(0),[0,0]);assert.deepEqual(tile(27),[6,6]);
 let sum=0;for(const t of allTiles()){const [a,b]=tile(t);assert(a>=0&&a<=b&&b<=6);assert.equal(pips(t),a+b);sum+=pips(t);}assert.equal(sum,168);
});
test('schema rejects out-of-range/fractional IDs, wrong sides, extra fields and unknown actions',()=>{
 for(const v of [{type:'play',tile:-1,side:'left'},{type:'play',tile:28,side:'right'},{type:'play',tile:1.5,side:'left'},{type:'play',tile:1,side:'middle'},{type:'pass',extra:true},{type:'cheat'},null])assert.equal(game.inputSchema.safeParse(v).success,false);
 for(const v of [{type:'play',tile:27,side:'left'},{type:'draw'},{type:'pass'},{type:'next'}])assert(game.inputSchema.safeParse(v).success);
});
test('settings validate roster, targets, partners, reserve and stale values',()=>{
 assert.throws(()=>init(context(1)));assert.throws(()=>init(context(5)));const c=context();c.players[1]!.id='p0';assert.throws(()=>init(c));
 for(const n of [2,3,4]){const s=init(context(n,1,{partners:true}));assert.equal(s.settings.partners,n===4);assert.equal(s.hands[0]!.length,n===3?5:7);}
 for(const t of [100,150,250])assert.equal(init(context(2,1,{target:String(t)})).settings.target,t);
 const s=init(context(2,1,{target:'999',reserve:'2',mode:'nonsense',opening:'unknown',blocked:'unknown',teamPoints:'unknown'}));assert.equal(s.settings.target,100);assert.equal(s.settings.reserve,2);assert.equal(s.settings.mode,'draw');
});
test('deals conserve all tiles, vary seeds, and force only the highest opening double',()=>{
 const a=init(context(4,1,{partners:true}));const b=init(context(4,2,{partners:true}));assert.notDeepEqual(a.hands,b.hands);assert.deepEqual([...a.hands.flat(),...a.stock].sort((a,b)=>a-b),allTiles());
 assert.equal(a.forced,27);assert(a.hands[a.turn]!.includes(27));assert.deepEqual(legal(a),[{type:'play',tile:27,side:'right'}]);
 const r=init(context(2,1,{opening:'rotating'}));assert.equal(r.turn,0);assert.equal(r.forced,null);assert.equal(legal(r).length,7);
 const s=freeze(init(context(2,17)));assert.deepEqual(init(context(2,17)),s);
});
test('left/right orientation and touching pips are correct without input mutation',()=>{
 const s=freeze(custom([[id(1,3),id(2,5)],[id(3,4)]],[3,5]));
 let v=apply(s,{type:'play',tile:id(1,3),side:'left'},1);assert.deepEqual(v.ends,[1,5]);assert.equal(v.board[0]!.b,3);assert.equal(v.turn,1);assert.equal(v.passes,0);assert.equal(v.forced,null);assert.equal(v.hands[0]!.length,1);
 v=apply(s,{type:'play',tile:id(2,5),side:'right'},1);assert.deepEqual(v.ends,[3,2]);assert.equal(v.board.at(-1)!.a,5);
 assert.equal(apply(s,{type:'play',tile:id(1,3),side:'right'},1),s);
 assert.equal(apply(s,{type:'play',tile:id(0,0),side:'left'},1),s);
 assert.equal(apply(s,{type:'pass'},1),s);assert.equal(apply(s,{type:'draw'},1),s);
});
test('draw is one tile at a time, keeps turn, clears pass inference and stops at reserve',()=>{
 const s=custom([[id(0,0)],[id(1,1)]],[6,6],{reserve:'2'});s.missed[0]=1<<6;s.stock=[id(0,1),id(0,6),id(2,2),id(3,3)];
 assert.deepEqual(legal(s),[{type:'draw'}]);let n=apply(freeze(s),{type:'draw'},1);assert.equal(n.turn,0);assert.equal(n.stock.length,3);assert.equal(n.hands[0]!.at(-1),id(0,1));assert.equal(n.missed[0],0);
 n=apply(n,{type:'draw'},2);assert.equal(n.stock.length,2);assert(legal(n).every(v=>v.type==='play'));assert.equal(apply(n,{type:'draw'},3),n);
 const depleted={...s,stock:s.stock.slice(-2)};assert.deepEqual(legal(depleted),[{type:'pass'}]);
 assert.deepEqual(legal({...s,settings:{...s.settings,mode:'block'}}),[{type:'pass'}]);
});
test('passes record public missing suits and N consecutive passes settle block',()=>{
 let s=custom([[id(0,0)],[id(1,1)]],[6,6],{mode:'block'});s.stock=[];
 s=apply(s,{type:'pass'},1);assert.equal(s.turn,1);assert.equal(s.passes,1);assert.equal(s.missed[0],1<<6);assert.equal(s.phase.id,'play');
 s=apply(s,{type:'pass'},2);assert.equal(s.phase.id,'round-end');assert.equal(s.last!.winner,0);assert.equal(s.last!.points,2);assert.equal(s.last!.blocked,true);
});
test('individual scoring, ties and partnership gross/opponent choices',()=>{
 let s=custom([[id(1,1)],[id(3,3)]],null,{mode:'block'});assert.deepEqual(scoreRound(s,null),{winner:0,points:4,blocked:true});
 s.settings.blocked='opponents';assert.equal(scoreRound(s,null)!.points,6);
 assert.deepEqual(scoreRound(custom([[id(1,1)],[id(0,2)]]),null),{winner:null,points:0,blocked:true});
 s=custom([[],[id(3,3)],[id(1,1)],[id(2,2)]],null,{partners:true});assert.deepEqual(scoreRound(s,0),{winner:0,points:10,blocked:false});s.settings.teamPoints='all';assert.equal(scoreRound(s,0)!.points,12);
 const blocked=custom([[id(1,1)],[id(5,5)],[id(2,2)],[id(4,4)]],null,{partners:true});assert.equal(scoreRound(blocked,null)!.winner,0);assert.equal(scoreRound(blocked,null)!.points,18);
});
test('empty hand awards score, targets end exactly and results include every seat',()=>{
 let s=custom([[id(2,2)],[id(3,3)]],null);s.scores=[94,0];s=apply(s,{type:'play',tile:id(2,2),side:'right'},1);
 assert.equal(s.phase.id,'done');assert.deepEqual(s.scores,[100,0]);const r=results(s)!;assert.deepEqual(r.winnerIds,['p0']);assert.deepEqual(r.scores,{p0:100,p1:0});assert.equal(r.ranking[1]!.rank,2);assert.equal(results(init(context())),null);
 const tie=reduce({...s,scores:[100,100]},{type:'vip',action:'end',now:2});assert.equal(results(tie)!.winnerIds.length,2);assert(results(tie)!.ranking.every(p=>p.rank===1));
 for(const target of [150,250]){let q=custom([[id(2,2)],[id(3,3)]],null,{target:String(target)});q.scores[0]=target-7;q=apply(q,{type:'play',tile:id(2,2),side:'right'},1);assert.equal(q.phase.id,'round-end');q.scores[0]=target;q=reduce(q,{type:'vip',action:'end',now:2});assert.equal(results(q)!.scores.p0,target);}
});
test('partner scores stay equal and round-next deals conserved new seed state',()=>{
 let s=custom([[id(1,1)],[id(4,4)],[id(2,2)],[id(3,3)]],null,{partners:true});s.hands[0]=[id(1,1)];s=apply(s,{type:'play',tile:id(1,1),side:'right'},1);assert.deepEqual(s.scores,[14,0,14,0]);
 const old=JSON.stringify(s.hands),step=s.rng.step;s=reduce(s,{type:'input',playerId:'p2',now:2,input:{type:'next'}});assert.equal(s.round,2);assert.equal(s.turn,0);assert.equal(s.forced,null);assert(s.rng.step>step);assert.notEqual(JSON.stringify(s.hands),old);assert.equal(s.board.length,0);assert.equal(s.last!.points,14);
});
test('unexpected events, spectators, wrong turns and stale/early timers preserve identity',()=>{
 const s=freeze(init(context()));
 for(const playerId of ['unknown','__proto__','constructor'])for(const input of [{type:'pass'},{type:'draw'},{type:'next'}] as Input[])assert.equal(reduce(s,{type:'input',playerId,input,now:1}),s);
 const other=s.seats[(s.turn+1)%2]!;assert.equal(reduce(s,{type:'input',playerId:other,input:legal(s)[0]!,now:1}),s);
 for(const e of [{type:'speech',now:1,key:'unused',ms:100},{type:'speechStart',now:1,key:'unused'},{type:'player',now:1,playerId:'__proto__',connected:false},{type:'timer',now:100000,phaseId:'stale',startedAt:s.phase.startedAt},{type:'timer',now:100000,phaseId:s.phase.id,startedAt:s.phase.startedAt-1},{type:'timer',now:1,phaseId:s.phase.id,startedAt:s.phase.startedAt}] as const)assert.equal(reduce(s,e),s);
 const n=reduce(s,{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});assert.notEqual(n,s);assert(n.phase.startedAt>s.phase.startedAt);
 assert.equal(reduce(n,{type:'timer',now:100000,phaseId:s.phase.id,startedAt:s.phase.startedAt}),n);
});
test('VIP pause/resume clock shifts, disconnected seats and end are total',()=>{
 const s=freeze(init(context()));let n=reduce(s,{type:'vip',action:'pause',now:100});assert(n.phase.paused);assert.equal(reduce(n,{type:'vip',action:'pause',now:120}),n);assert.equal(reduce(n,{type:'vip',action:'skip',now:120}),n);
 assert.equal(reduce(n,{type:'timer',phaseId:n.phase.id,startedAt:n.phase.startedAt,now:999999}),n);assert.equal(reduce(n,{type:'input',playerId:n.seats[n.turn]!,input:legal(n)[0]!,now:120}),n);
 n=reduce(n,{type:'player',playerId:'p0',connected:false,gone:'left',now:120});assert.equal(n.players.p0!.connected,false);assert.equal(n.seats.length,2);
 assert.equal(game.bot.sampleInput(n,'p0',createRng(1)),null);
 n=reduce(n,{type:'vip',action:'resume',now:600});assert(!n.phase.paused);assert.equal(n.phase.deadline,s.phase.deadline!+500);assert.equal(n.phase.startedAt,s.phase.startedAt);
 const end=reduce(n,{type:'vip',action:'end',now:700});assert.equal(end.phase.deadline,null);assert.equal(Object.keys(results(end)!.scores).length,2);assert.equal(reduce(end,{type:'vip',action:'pause',now:800}),end);
});
test('hidden opponent identities and stock order do not affect TV, other phone or any bot',()=>{
 for(const n of [2,3,4])for(const seed of [1,2,3,7,99]){
  const s=init(context(n,seed,{opening:'rotating'}));const viewer=s.turn,id=s.seats[viewer]!;
  const other=s.hands.map(h=>[...h]);const hidden=[...other.flatMap((h,i)=>i===viewer?[]:h),...s.stock].reverse();let offset=0;
  const hands=other.map((h,i)=>{if(i===viewer)return h;const v=hidden.slice(offset,offset+h.length);offset+=h.length;return v;});
  const altered={...s,hands,stock:hidden.slice(offset)};
  assert.deepEqual(tvView(s),tvView(altered));assert.deepEqual(controllerView(s,id),controllerView(altered,id));
  for(const skill of ['easy','normal','sharp'] as const)assert.deepEqual(game.bot.sampleInput(s,id,createRng(17),skill),game.bot.sampleInput(altered,id,createRng(17),skill));
  for(const unknown of ['unknown','__proto__']){assert.deepEqual(controllerView(s,unknown).hand,[]);assert.deepEqual(controllerView(s,unknown).legal,[]);assert.equal(game.bot.sampleInput(s,unknown,createRng(1)),null);}
  const v=controllerView(s,id);v.hand.pop();v.board.push({tile:0,a:0,b:0,player:0});assert.equal(s.hands[viewer]!.length,n===2?7:5);assert.equal(s.board.length,0);
 }
});
test('sample policies are valid, deterministic, and distinguish skill strategies',()=>{
 const s=custom([[id(0,0),id(6,6),id(1,6)],[id(2,2),id(3,3)]],null,{opening:'rotating'});const o=observe(s,'p0')!;assert.equal(choose(o,createRng(1),'normal')!.type,'play');
 const picks=new Set<string>();for(let seed=1;seed<=20;seed++)picks.add(JSON.stringify(choose(o,createRng(seed),'easy')));assert(picks.size>1);
 for(const skill of ['easy','normal','sharp'] as const){const i=choose(o,createRng(9),skill)!;assert(game.inputSchema.safeParse(i).success);assert(legal(s).some(m=>JSON.stringify(m)===JSON.stringify(i)));}
});
test('core has no host entropy, clocks, timers, I/O or mutable module state',()=>{
 const source=readFileSync(new URL(process.env.CORE_PATH??'./core.ts',import.meta.url),'utf8');
 for(const forbidden of ['Math.random(', 'Date.now(', 'setTimeout(', 'setInterval(',"from 'node:",'fetch(','XMLHttpRequest','localeCompare(','toLocale'])assert(!source.includes(forbidden),forbidden);
 assert(!/^let |^var /m.test(source));
});
function simulate(n:number,seed:number,settings:Record<string,string|boolean|number>,skill:'easy'|'normal'|'sharp'='normal'){
 let s=init(context(n,seed,settings)),r=init(context(n,seed,settings));const rng=createRng(seed+10000);let steps=0;
 while(s.phase.id!=='done'&&steps<20000){
  const input=game.bot.sampleInput(s,s.seats[s.turn]!,rng,skill);assert(input);assert(game.inputSchema.safeParse(input).success);
  const e={type:'input' as const,playerId:s.seats[s.turn]!,input,now:steps*100};
  const before=JSON.stringify(s);const next=reduce(s,e);assert.equal(JSON.stringify(s),before);r=reduce(r,e);s=next;assert.deepEqual(s,r);assert.equal(JSON.stringify(s),JSON.stringify(r));
  assert(Buffer.byteLength(JSON.stringify(s))<=256*1024);assert.equal(new Set([...s.hands.flat(),...s.stock,...s.board.map(t=>t.tile)]).size,28);
  assert.equal(s.hands.flat().length+s.stock.length+s.board.length,28);
  for(let i=1;i<s.board.length;i++)assert.equal(s.board[i-1]!.b,s.board[i]!.a);
  for(const id of s.seats)assert.doesNotThrow(()=>controllerView(s,id));assert.doesNotThrow(()=>controllerView(s,'__proto__'));assert.doesNotThrow(()=>tvView(s));
  for(const id of s.seats){const v=controllerView(s,id);assert.deepEqual(v.hand,s.hands[s.seats.indexOf(id)]);assert(!Object.hasOwn(v,'hands'));assert(!Object.hasOwn(v,'stock'));}
  steps++;
 }
 assert.equal(s.phase.id,'done',`seed ${seed}, seats ${n}, settings ${JSON.stringify(settings)}, ${steps} steps`);
 const result=results(s)!;assert.equal(Object.keys(result.scores).length,n);assert(Object.values(result.scores).every(Number.isFinite));assert(result.winnerIds.length>0);return steps;
}
if(!process.env.FAST_TEST){
 for(const n of [2,3,4])for(const mode of ['draw','block'])test(`1,000 seeded full bot matches: ${n} seats ${mode}`,()=>{for(let seed=1;seed<=1000;seed++)simulate(n,seed,{mode,partners:n===4});});
 test('1,000 independent random property seeds plus pinned seeds 1,2,3',()=>{
  const rng=createRng(0xC0FFEE);for(const seed of [1,2,3,...Array.from({length:1000},()=>rng.int(0,0xffffffff))]){
   const n=2+seed%3;simulate(n,seed,{mode:seed%2?'draw':'block',partners:n===4&&seed%2===0,reserve:seed%2?'2':'0',opening:seed%3?'rotating':'highest-double',target:String([100,150,250][seed%3]),blocked:seed%2?'difference':'opponents',teamPoints:seed%2?'opponents':'all'},'easy');
  }
 });
 test('idle timer-only full matches terminate for every valid count',()=>{
  for(const n of [2,3,4]){let s=init(context(n,3)),steps=0;while(s.phase.id!=='done'&&steps++<20000)s=reduce(s,{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});assert.equal(s.phase.id,'done');assert(s.phase.startedAt<=game.manifest.estimatedMinutes*3*60000);}
 });
}
test('manifest equals generated JSON, fixtures cover every phase and play on',()=>{
 assert.deepEqual(game.manifest,JSON.parse(readFileSync('manifest.json','utf8')));
 for(const phase of game.phases){let s=JSON.parse(readFileSync(`fixtures/${phase}.json`,'utf8')) as State;assert.equal(s.phase.id,phase);assert.doesNotThrow(()=>tvView(s));assert.doesNotThrow(()=>controllerView(s,'unknown'));const rng=createRng(24);let steps=0;
  while(s.phase.id!=='done'&&steps++<20000){const i=game.bot.sampleInput(s,s.seats[s.turn]!,rng)!;assert(game.inputSchema.safeParse(i).success);s=reduce(s,{type:'input',playerId:s.seats[s.turn]!,input:i,now:steps*100});}assert.equal(s.phase.id,'done');assert.equal(Object.keys(results(s)!.scores).length,s.seats.length);
 }
});
test('idle acceleration resets on human activity and input key order is immaterial',()=>{
 let s=init(context());s=reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});assert.equal(s.idleTurns,1);
 s=reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});assert.equal(s.idleTurns,2);assert.equal(s.phase.deadline!-s.phase.startedAt,s.phase.id==='play'?1000:5000);
 const i=legal(s)[0]!;s=reduce(s,{type:'input',playerId:s.seats[s.turn]!,input:i,now:s.phase.startedAt+1});assert.equal(s.idleTurns,0);if(s.phase.id==='play')assert.equal(s.phase.deadline!-s.phase.startedAt,30000);
 const q=init(context(2,1,{opening:'rotating'}));const p=legal(q)[0]!;assert.equal(p.type,'play');if(p.type==='play'){const reordered={side:p.side,tile:p.tile,type:p.type};assert.deepEqual(apply(q,reordered,1),apply(q,p,1));}
});
test('published Draw deal is selectable and never changes Block or partnership deals',()=>{
 for(const [n,count] of [[2,7],[3,7],[4,6]]){const s=init(context(n,1,{deal:'traditional'}));assert.equal(s.hands[0]!.length,count);assert.equal(s.stock.length,28-n!*count!);}
 assert.equal(init(context(3,1,{mode:'block',deal:'traditional'})).hands[0]!.length,5);
 assert.equal(init(context(4,1,{mode:'block',deal:'traditional'})).hands[0]!.length,5);
 assert.equal(init(context(4,1,{partners:true,deal:'traditional'})).hands[0]!.length,7);
 assert.equal(init(context(3,1,{deal:'unknown'})).settings.deal,'block-sized');
});
if(!process.env.FAST_TEST)for(const n of [3,4])test(`1,000 published-deal Draw matches: ${n} seats`,()=>{for(let seed=1;seed<=1000;seed++)simulate(n,seed,{mode:'draw',deal:'traditional'});});

test('Draw lookahead draws on the same turn, respects reserve and does not mutate samples',()=>{
 const p={hands:[[id(0,0)],[id(6,6)]],ends:[1,1] as const,turn:0,passes:0,partners:false,stock:[id(0,1)],reserve:0};
 const before=JSON.stringify(p);
 // Root draws 0-1, plays it, opponent passes, root then empties with 0-0.
 assert.equal(C.solve(p,0),112);assert.equal(JSON.stringify(p),before);
 assert.equal(C.solve({...p,reserve:1},0),112); // blocked: root has fewer pips
 // Reserving the only useful draw reverses which player wins the blocked board.
 const q={...p,hands:[[id(5,5)],[id(0,0)]],stock:[id(1,5)]};
 assert.equal(C.solve(q,0),100);assert.equal(C.solve({...q,reserve:1},0),-110);
});

test('milestone archives and preceding comparison data retain checked content hashes',()=>{
 const sums=new Map(readFileSync('SHA256SUMS.txt','utf8').trim().split('\n').map(line=>[line.slice(66),line.slice(0,64)]));
 for(const file of ['draw-league-before.json','draw-league-stock.json','media/milestone-1.webm','media/milestone-2-deal.webm','media/milestone-3-stock.webm','media/milestone-4-conditional.webm','media/milestone-5-samples32.webm','media/milestone-6-score-policy.webm','media/milestone-7-match-goal.webm']){
  const data=readFileSync(file);assert.equal(sums.get(file),createHash('sha256').update(data).digest('hex'),file);if(file.endsWith('.webm'))assert(data.length>0&&data.length<10_000_000);
 }
});

test('search reward respects net blocked and all-remaining partner settings',()=>{
 const p={hands:[[id(5,5)],[id(6,6)]],ends:[0,0] as const,turn:0,passes:2,partners:false};
 assert.equal(C.utility(p,0),102);assert.equal(C.utility({...p,blocked:'difference'},0),102);assert.equal(C.utility({...p,blocked:'opponents'},0),112);
 const q={hands:[[],[id(0,1)],[id(6,6)],[id(1,1)]],ends:[0,1] as const,turn:1,passes:0,partners:true};
 assert.equal(C.utility(q,0),103);assert.equal(C.utility({...q,teamPoints:'all'},0),115);assert.equal(C.utility({...q,teamPoints:'all'},1),-115);
});

test('match goal dominates an ordinary round reward without exposing new private data',()=>{
 const p={hands:[[],[id(0,1)]],ends:[0,1] as const,turn:1,passes:0,partners:false};
 assert.equal(C.utility({...p,scores:[99,0],target:100},0),10000);assert.equal(C.utility({...p,scores:[99,0],target:100},1),-10000);
 assert.equal(C.utility({...p,scores:[0,0],target:100},0),101);
 const s=init(context(3));s.scores=[0,0,99];const o=observe(s,'p0')!;assert.deepEqual(o.scores,s.scores);o.scores[0]=100;assert.equal(s.scores[0],0);
});

test('partner target completion uses the shared team score for either teammate',()=>{
 const p={hands:[[],[id(0,1)],[id(6,6)],[id(1,1)]],ends:[0,1] as const,turn:1,passes:0,partners:true,teamPoints:'all' as const,scores:[99,0,99,0],target:100};
 assert.equal(C.utility(p,2),10000);assert.equal(C.utility(p,3),-10000);
});
