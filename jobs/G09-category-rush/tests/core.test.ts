import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {game,init,reduce,tvView,controllerView,results,inputSchema,manifest,configuration} from '../src/index';
import {normalize,sameAnswer,groupAnswers,firstLetter} from '../src/match';
import {ballotAccepts,groupsFor,scoreCategory} from '../src/scoring';
import {createRng} from '../../../contract/rng';
import {gameManifestSchema} from '../../../contract/contract';
import type {GameEvent,PlayerInfo} from '../../../contract/contract';
import type {State,Input} from '../src/model';
import {referenceNormalize,referenceSame,referenceGroups,referenceCategory} from './reference';

export const players=(n:number):PlayerInfo[]=>Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Player ${i}`,avatarId:`face${i}`,connected:true,bot:true}));
export const setup=(n=2,seed=1)=>init({players:players(n),settings:{rounds:1,roundSeconds:30},seed,now:1000});
const restored=(s:State):State=>JSON.parse(JSON.stringify(s));
const event=(s:State,playerId:string,input:Input,vip=false):GameEvent<Input>=>({type:'input',now:s.phase.startedAt+10,playerId,input,vip});
const submit=(s:State,id:string,answers:string[])=>reduce(s,event(s,id,{type:'submit',answers}));
const asReview=(s:State):State=>({...s,letter:'B',phase:{id:'review',startedAt:2000,deadline:10000},reviewIndex:0,
  answers:Object.fromEntries(s.order.map(id=>[id,Array<string>(12).fill('')])),submitted:Object.fromEntries(s.order.map(id=>[id,true]))});
function freeze<T>(value:T):T {if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}

test('normalization: articles accents punctuation number words and plural matching',()=>{
  assert.deepEqual(normalize('  Thé Twenty-One Pilots! '),{norm:'21 pilots',compact:'21pilots'});
  assert.equal(firstLetter('The banana'),'B');assert.equal(firstLetter('an apple'),'A');
  assert.equal(firstLetter('one plum'),'O');assert.equal(firstLetter('The Twenty-One Pilots'),'T');
  assert(sameAnswer('berry','berries'));assert(sameAnswer('box','boxes'));assert(sameAnswer('movie','movies'));
  assert(sameAnswer('BANANA','banána'));assert(sameAnswer('the back-pack','backpack'));
  assert(sameAnswer('balloon','ballon'));assert(!sameAnswer('bus','business'));assert(!sameAnswer('12 castles','13 castles'));
  assert(!sameAnswer('',''));assert(!sameAnswer('bed','bad'));
  assert.deepEqual(groupAnswers(['balloons','balloon','baloon','bat']),[[0,1,2],[3]]);
});
test('independent hardest-function oracle: 10,000 seeded cases, normalization grouping adjudication',()=>{
  const rng=createRng(20261008),words=['banana','bananas','balloon','balloons','baloon','BálLoOn','the balloon','backpack','back-pack',
    'knife','knives','mouse','mice','child','children','person','people','leaf','leaves','foot','feet','tooth','teeth','goose','geese','shelf','shelves','news','new','hero','heroes','status','statuses','quiz','quizzes','axis','axes','basis','bases','roof','roofs','berry','berries','bus','buses','box','boxes','Book','book','the book','books','boat','boats','twenty one boots','21 boots','22 boots','one','1','','apple','bad','bed','The Twenty-One Pilots'];
  for(let i=0;i<10000;i++){
    const s=asReview(setup(rng.int(2,8),i));
    s.letter=rng.pick(['A','B','C','O','T']);
    for(const id of s.order)s.answers[id]=Array.from({length:12},()=>rng.pick(words));
    const texts=s.order.map(id=>s.answers[id][0]);
    for(const text of texts)assert.deepEqual(normalize(text),referenceNormalize(text));
    for(let j=0;j<texts.length;j++)assert.equal(sameAnswer(texts[j],texts[(j+1)%texts.length]),referenceSame(texts[j],texts[(j+1)%texts.length]));
    assert.deepEqual(groupAnswers(texts),referenceGroups(texts));
    const count=groupsFor(s,0).length;
    s.votes=Object.fromEntries(s.order.map(id=>[id,Array.from({length:count},()=>rng.pick([true,false,null]))]));
    assert.deepEqual(scoreCategory(s,0),referenceCategory(s,0));
  }
});
test('score cancellation and group vote ties exclude author, numeric and article handling',()=>{
  const s=asReview(setup(4));s.answers.p0[0]='Banana';s.answers.p1[0]='the BANANAS';s.answers.p2[0]='Berry';s.answers.p3[0]='Boat';
  const groups=groupsFor(s,0);assert.equal(groups.length,3);assert(groups[0].duplicate);
  s.votes={p0:[true,true,true],p1:[true,false,true],p2:[true,true,true],p3:[true,false,true]};
  const out=scoreCategory(s,0);assert.equal(out.groups[0].points,0);assert.equal(out.groups[1].points,0);assert.equal(out.groups[2].points,1);
  assert.equal(ballotAccepts(['p0'],{p0:[false],p1:[true],p2:[true],p3:[false]},0),true);
  assert.equal(ballotAccepts(['p0'],{p0:[true],p1:[false]},0),false);
  assert.equal(ballotAccepts(['p0'],{},0),true);
  s.answers.p3[1]='boats';assert.equal(scoreCategory(s,0).groups[2].eligible,false);
  s.answers.p3[0]='apple';assert.equal(scoreCategory(s,0).groups[2].points,0);
});
test('settings clamp stale values and phases have sound timers',()=>{
  assert.deepEqual(configuration({rounds:99,roundSeconds:-2}),{rounds:5,roundSeconds:30});
  assert.deepEqual(configuration({rounds:NaN,roundSeconds:Infinity}),{rounds:3,roundSeconds:180});
  const s=setup();assert.equal(s.phase.deadline,s.phase.startedAt+30000);
  const early={type:'timer' as const,now:s.phase.deadline!-1,phaseId:s.phase.id,startedAt:s.phase.startedAt};assert.equal(reduce(s,early),s);
  const stale={...early,now:s.phase.deadline!,startedAt:s.phase.startedAt-1};assert.equal(reduce(s,stale),s);
  const review=reduce(s,{...early,now:s.phase.deadline!});assert.equal(review.phase.id,'review');
  const step=reduce(review,{type:'timer',now:review.phase.deadline!,phaseId:'review',startedAt:review.phase.startedAt});
  assert.equal(step.reviewIndex,1);assert.equal(step.phase.startedAt,review.phase.startedAt);assert(step.phase.deadline!>review.phase.deadline!);
});
test('pause ignores inputs/timers, shifts deadlines, player drops close on resume, done remains terminal',()=>{
  const s=setup(),held=reduce(s,{type:'vip',now:2000,action:'pause'});
  assert(held.phase.paused);assert.equal(reduce(held,event(held,'p0',{type:'submit',answers:Array(12).fill('Banana')})),held);
  assert.equal(reduce(held,{type:'timer',now:99000,phaseId:'answer',startedAt:held.phase.startedAt}),held);
  const resumed=reduce(held,{type:'vip',now:7000,action:'resume'});assert(!resumed.phase.paused);assert.equal(resumed.phase.deadline,s.phase.deadline!+5000);
  let one=submit(s,'p0',Array(12).fill(''));one=reduce(one,{type:'vip',now:2000,action:'pause'});
  one=reduce(one,{type:'player',now:3000,playerId:'p1',connected:false});assert.equal(one.phase.id,'answer');
  one=reduce(one,{type:'vip',now:4000,action:'resume'});assert.equal(one.phase.id,'review');
  const skipped=reduce(held,{type:'vip',now:5000,action:'skip'});assert.equal(skipped.phase.id,'review');assert(skipped.phase.paused);
  const done=reduce(held,{type:'vip',now:5000,action:'end'});assert.equal(done.phase.id,'done');assert.equal(done.phase.deadline,null);assert(!done.phase.paused);
  for(const action of ['skip','pause','resume','end'] as const)assert.equal(reduce(done,{type:'vip',now:9000,action}),done);
});
test('pause ignores an empty-review deadline until explicit resume at both roster extremes',()=>{
  for(const count of [2,8]){
    let s=init({players:players(count).map(p=>({...p,bot:false})),settings:{rounds:1,roundSeconds:30},seed:42,now:1000});
    for(const id of s.order)s=submit(s,id,Array(12).fill(''));
    assert.equal(s.phase.id,'review');assert.deepEqual(tvView(s).review!.groups,[]);
    const pauseAt=s.phase.startedAt+5,held=reduce(s,{type:'vip',now:pauseAt,action:'pause'});
    assert.equal(reduce(held,{type:'timer',now:held.phase.deadline!+20,phaseId:'review',startedAt:held.phase.startedAt}),held);
    const resumed=reduce(held,{type:'vip',now:pauseAt+1000,action:'resume'});
    assert.equal(resumed.phase.deadline,held.phase.deadline!+1000);assert(!resumed.phase.paused);
    assert.equal(reduce(resumed,{type:'timer',now:resumed.phase.deadline!-1,phaseId:'review',startedAt:resumed.phase.startedAt}),resumed);
    const next=reduce(resumed,{type:'timer',now:resumed.phase.deadline!,phaseId:'review',startedAt:resumed.phase.startedAt});
    assert.equal(next.reviewIndex,1);assert.deepEqual(tvView(next).review!.groups,[]);
    const ended=reduce(next,{type:'vip',now:next.phase.deadline!,action:'end'});
    assert.equal(ended.phase.id,'done');for(const id of s.order)assert.equal(results(ended)!.scores[id],0);
  }
});
test('unknown prototype seats never act; genuine prototype ids survive JSON and results',()=>{
  const s=setup();for(const id of ['spectator','__proto__','constructor','toString','']){
    assert.equal(reduce(s,event(s,id,{type:'submit',answers:Array(12).fill('Banana')})),s);
    const view=controllerView(s,id);assert.equal(view.me.role,'spectator');assert.deepEqual(view.myAnswers,[]);
  }
  const proto=init({players:[{id:'__proto__',name:'Prototype',avatarId:'face1',connected:true},{id:'constructor',name:'Constructor',avatarId:'face2',connected:true}],settings:{},seed:99,now:0});
  assert.deepEqual(restored(proto),proto);assert.equal(controllerView(proto,'__proto__').me.role,'player');
  const done=reduce(proto,{type:'vip',now:1,action:'end'});assert.deepEqual(Object.keys(results(done)!.scores),proto.order);
});
test('views never expose others answers, authors, votes or future review; own views roundtrip',()=>{
  let s=setup(3);s=submit(s,'p0',Array.from({length:12},(_,i)=>`secretp0category${i}`));
  const tv=JSON.stringify(tvView(s)),other=JSON.stringify(controllerView(s,'p1'));
  assert(!tv.includes('secretp0'));assert(!other.includes('secretp0'));assert(JSON.stringify(controllerView(s,'p0')).includes('secretp0'));
  s=submit(s,'p1',Array.from({length:12},(_,i)=>`secretp1category${i}`));s=submit(s,'p2',Array.from({length:12},(_,i)=>`secretp2category${i}`));
  const review=JSON.stringify(tvView(s));assert(review.includes('secretp0category0'));assert(!review.includes('secretp0category1'));assert(!review.includes('owners'));assert(!review.includes('votes'));
  s=reduce(s,event(s,'p0',{type:'vote',votes:Array(groupsFor(s,0).length).fill(false)}));
  assert(!JSON.stringify(controllerView(s,'p1')).includes('false,false'));assert.equal(tvView(s).players[0].status,'submitted');
  for(const id of [...s.order,'spectator','__proto__']){const v=controllerView(s,id);assert.deepEqual(JSON.parse(JSON.stringify(v)),v);}
  const view=tvView(s);view.categories[0].prompt='changed';assert.notEqual(s.categories[0].prompt,'changed');
});
test('reducer is total across every event in every phase, immutable and strict inputs',()=>{
  const start=setup();const phases:State[]=[start,asReview(start),{...start,phase:{id:'scores',startedAt:1000,deadline:10000}},{...start,phase:{id:'done',startedAt:1000,deadline:null}}];
  const events:unknown[]=[null,{}, {type:'input',now:NaN,playerId:'p0',input:{}},
    {type:'input',now:1,playerId:'p0',input:{type:'submit',answers:['x']}},
    {type:'input',now:1,playerId:'p0',input:{type:'submit',answers:Array(12).fill(2)}},
    {type:'input',now:1,playerId:'p0',input:{type:'vote',votes:[true],extra:1}},
    {type:'speech',now:1,key:'abc',ms:100},{type:'speechStart',now:1,key:'abc'},
    {type:'timer',now:900000,phaseId:'unknown',startedAt:1},{type:'vip',now:1,action:'nonsense'},
    {type:'player',now:1,playerId:'p0',connected:'yes'}, {type:'player',now:1,playerId:'p0',connected:true,gone:'later'},
    {type:'input',now:1,playerId:'p0',input:{type:'next'}}];
  for(const phase of phases){freeze(phase);for(const e of events){assert.doesNotThrow(()=>reduce(phase,e as GameEvent<Input>));assert.equal(reduce(phase,e as GameEvent<Input>),phase);}}
  assert(!inputSchema.safeParse({type:'submit',answers:Array(12).fill('a'.repeat(81))}).success);
});
test('manifest exact types, JSON artifact and every phase fixture',()=>{
  assert(gameManifestSchema.safeParse(manifest).success);
  assert.deepEqual(manifest,JSON.parse(readFileSync(new URL('../manifest.json',import.meta.url),'utf8')));
  for(const id of game.phases){const fixture=JSON.parse(readFileSync(new URL(`../fixtures/${id}.json`,import.meta.url),'utf8')) as State;
    assert.equal(fixture.phase.id,id);assert.doesNotThrow(()=>tvView(fixture));assert.doesNotThrow(()=>controllerView(fixture,'spectator'));
    assert.deepEqual(restored(fixture),fixture);assert(Buffer.byteLength(JSON.stringify(fixture))<=256*1024);
    if(id!=='done')assert.notEqual(reduce(fixture,{type:'vip',now:fixture.phase.startedAt+100,action:'skip'}),fixture);
  }
  const final=JSON.parse(readFileSync(new URL('../fixtures/done.json',import.meta.url),'utf8'));assert(results(final));
});

export function simulate(n:number,seed:number,skills:('easy'|'normal'|'sharp')[]=[],verify=false):State {
  let s=init({players:players(n),settings:{rounds:3,roundSeconds:30},seed,now:0}),twin=restored(s);
  const rngs=s.order.map((_,i)=>createRng((seed^Math.imul(i+1,8191))>>>0));
  for(let step=0;step<500&&s.phase.id!=='done';step++){
    let e:GameEvent<Input>|null=null;
    for(let i=0;i<s.order.length;i++){
      const input=game.bot.sampleInput(s,s.order[i],rngs[i],skills[i]??(['easy','normal','sharp'] as const)[i%3]);
      if(input){assert(inputSchema.safeParse(input).success);e=event(s,s.order[i],input);break;}
    }
    if(!e)e={type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt};
    s=reduce(restored(s),e);
    if(verify){twin=reduce(restored(twin),e);assert.deepEqual(s,twin);assert.deepEqual(restored(s),s);
      assert(Buffer.byteLength(JSON.stringify(s))<=256*1024);
      for(const id of [...s.order,'spectator','__proto__']){const v=controllerView(s,id);assert.deepEqual(JSON.parse(JSON.stringify(v)),v);}
    }
  }
  assert.equal(s.phase.id,'done',`seed ${seed} roster ${n}`);
  const r=results(s)!;assert.equal(Object.keys(r.scores).length,n);assert(r.ranking.every(x=>Number.isFinite(x.score)));
  assert(r.winnerIds.length>=1);return s;
}
test('all nine invariants: 1,000 restored-every-event bot games at each roster 2–8',()=>{
  for(let n=2;n<=8;n++)for(let seed=1;seed<=1000;seed++)simulate(n,seed,[],seed<=3);
});
test('property seeds 1,2,3 plus 1,000 reproducible random seeds; idle and gone seats finish',()=>{
  const seeds=[1,2,3],rng=createRng(0x72910);for(let i=0;i<1000;i++)seeds.push(rng.int(0,0xffffffff));
  for(const seed of seeds){
    let s=setup(2+seed%7,seed),total=s.order.length;
    s=reduce(s,{type:'player',now:1100,playerId:s.order[0],connected:false,gone:'left'});
    for(let step=0;step<100&&s.phase.id!=='done';step++)s=reduce(restored(s),{type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt});
    assert.equal(s.phase.id,'done');assert.equal(Object.keys(results(s)!.scores).length,total);
    assert(s.usedLetters.length===new Set(s.usedLetters).size);assert(s.categories.length===12);
    assert(s.history.every(h=>Object.values(h.points).every(p=>p>=0&&p<=12)));
  }
});
test('bot strategies cannot inspect private answers or ballots; skill controls coverage',()=>{
  const s=setup(8,591),rngseed=829;
  const changed=restored(s);for(const id of s.order)changed.answers[id]=Array(12).fill('secret');
  changed.votes={p1:Array(8).fill(false)};
  for(const skill of ['easy','normal','sharp'] as const)
    assert.deepEqual(game.bot.sampleInput(s,'p0',createRng(rngseed),skill),game.bot.sampleInput(changed,'p0',createRng(rngseed),skill));
  assert.equal(game.bot.sampleInput(s,'__proto__',createRng(1)),null);
  const held=reduce(s,{type:'vip',now:1100,action:'pause'});assert.equal(game.bot.sampleInput(held,'p0',createRng(1)),null);
});
test('event fuzz across every real phase and bot/view role preserves totality and JSON',()=>{
  const rng=createRng(0xabc123);
  for(const phaseId of game.phases){
    let s=JSON.parse(readFileSync(new URL(`../fixtures/${phaseId}.json`,import.meta.url),'utf8')) as State;
    for(let i=0;i<500;i++){
      const id=rng.pick([...s.order,'spectator','__proto__','constructor','toString']);
      const now=Math.max(s.phase.startedAt,1000)+rng.int(0,300000);
      const input=rng.pick<Input>([{type:'submit',answers:Array(12).fill('Balloon')},{type:'vote',votes:[true,false,null]},{type:'next'}]);
      const e=rng.pick<GameEvent<Input>>([{type:'input',now,playerId:id,input,vip:rng.chance(0.5)},
        {type:'timer',now,phaseId:rng.pick([s.phase.id,'stale']),startedAt:s.phase.startedAt+rng.int(-1,1)},
        {type:'vip',now,action:rng.pick(['pause','resume','skip','end'])},
        {type:'player',now,playerId:id,connected:rng.chance(0.5),...(rng.chance(0.1)?{gone:'left' as const}:{})},
        {type:'speech',now,key:'unused-123',ms:rng.int(-1,10000)},{type:'speechStart',now,key:'unused-123'}]);
      const old=JSON.stringify(s);const next=reduce(freeze(restored(s)),e);
      assert.equal(JSON.stringify(s),old);assert.deepEqual(restored(next),next);s=restored(next);
      for(const viewer of [...s.order,id,'spectator']){
        const v=controllerView(s,viewer);assert.deepEqual(JSON.parse(JSON.stringify(v)),v);
        const botInput=game.bot.sampleInput(s,viewer,createRng(i),rng.pick(['easy','normal','sharp']));
        assert(botInput===null||inputSchema.safeParse(botInput).success);
      }
      if(s.phase.id==='done'){assert.equal(Object.keys(results(s)!.scores).length,s.order.length);s=JSON.parse(readFileSync(new URL(`../fixtures/${phaseId}.json`,import.meta.url),'utf8'));}
    }
  }
});
test('future own-repeat adjudication leaks neither a view flag nor bot ballot',()=>{
  const s=asReview(setup());s.answers.p0[0]='balloon';
  const changed=restored(s);changed.answers.p0[11]='balloons';
  assert.deepEqual(tvView(s),tvView(changed));
  assert.deepEqual(controllerView(s,'p1'),controllerView(changed,'p1'));
  assert.deepEqual(game.bot.sampleInput(s,'p1',createRng(1),'sharp'),game.bot.sampleInput(changed,'p1',createRng(1),'sharp'));
  assert.equal(scoreCategory(s,0).groups[0].eligible,true);
  assert.equal(scoreCategory(changed,0).groups[0].eligible,false);
});
