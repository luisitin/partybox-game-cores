import assert from 'node:assert/strict';
import {test} from 'node:test';
import {selectCategories} from '../src/select';
import {CATEGORIES,LETTERS} from '../content/categories';
import {createRng,nextInt,seedRng,shuffle} from '../../../contract/rng';
import {game} from '../src/index';
import type {State} from '../src/model';
import {referenceSelection} from './selection-reference';
import type {SelectionCard} from './selection-reference';

const card=(id:string,theme:string,width=1,letter='B'):SelectionCard=>({id,theme,
  answers:{[letter]:Array.from({length:width},(_,i)=>`${letter.toLowerCase()}${String(i).padStart(2,'0')}`)}});
const leaders=(letter='B')=>Array.from({length:12},(_,i)=>card(`leader-${i}`,`theme-${i}`,1,letter));
const ids=(rows:readonly {id:string}[])=>rows.map(row=>row.id);
function freeze<T>(value:T):T{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
const expectedLeaders=Array.from({length:12},(_,i)=>`leader-${i}`);

test('selector fixtures: fourth same-theme candidate is outside the bounded window',()=>{
  const deck=[...leaders(),card('second','theme-1',2),card('third','theme-1',3),card('fourth','theme-1',8)];
  const expected=[...expectedLeaders];expected[1]='third';
  assert.deepEqual(ids(selectCategories(deck,'B',8)),expected);
});
test('selector fixtures: earliest equal-quality candidate wins',()=>{
  const deck=leaders();deck[1]=card('earliest','theme-1',3);
  deck.push(card('equal-later','theme-1',3),card('narrow-later','theme-1',2));
  const expected=[...expectedLeaders];expected[1]='earliest';
  assert.deepEqual(ids(selectCategories(deck,'B',8)),expected);
});
test('selector fixtures: roster cap preserves equally adequate earlier candidates',()=>{
  const deck=leaders();deck[1]=card('four-options','theme-1',4);deck.push(card('nine-options','theme-1',9));
  assert.equal(selectCategories(deck,'B',4)[1].id,'four-options');
  assert.equal(selectCategories(deck,'B',8)[1].id,'nine-options');
});
test('selector fixtures: slots zero four and eight retain exploration and original theme order',()=>{
  const deck=[...leaders(),...[0,1,4,8].map(i=>card(`wide-${i}`,`theme-${i}`,8))];
  const selected=selectCategories(deck,'B',8),expected=[...expectedLeaders];expected[1]='wide-1';
  assert.deepEqual(ids(selected),expected);
  assert.deepEqual(selected.map(c=>c.theme),Array.from({length:12},(_,i)=>`theme-${i}`));
});
test('selector fixtures: semantic width counts plural families instead of raw examples',()=>{
  const deck=leaders();deck[1]={id:'four-forms-two-families',theme:'theme-1',answers:{B:['box','boxes','berry','berries']}};
  deck.push({id:'three-families',theme:'theme-1',answers:{B:['beet','bread','bean']}});
  assert.equal(selectCategories(deck,'B',4)[1].id,'three-families');
});
test('selector fixtures: transitive fuzzy chains and numeric no-fuzz determine width',()=>{
  const deck=leaders('A');deck[1]={id:'three-chained-forms',theme:'theme-1',answers:{A:['abcdef','abcdeg','abcdfg']}};
  deck.push({id:'two-numeric-families',theme:'theme-1',answers:{A:['a12','a13']}});
  assert.equal(selectCategories(deck,'A',4)[1].id,'two-numeric-families');
});
test('selector fixtures: empty banks have zero quality and still occupy the candidate window',()=>{
  const deck=leaders();deck[1]=card('first','theme-1',1);
  deck.push({id:'empty-second',theme:'theme-1',answers:{}},card('third','theme-1',2),card('fourth','theme-1',8));
  assert.equal(selectCategories(deck,'B',8)[1].id,'third');
});
test('selector fixtures: below four present seats retains exact old selection',()=>{
  const deck=[...leaders(),card('wide-later','theme-1',8)];
  for(const count of [0,1,2,3])assert.deepEqual(ids(selectCategories(deck,'B',count)),expectedLeaders);
  assert.equal(selectCategories(deck,'B',4)[1].id,'wide-later');
});
test('selector fixtures: scarce-theme fallback is entirely the original leaders then fill order',()=>{
  const deck=Array.from({length:15},(_,i)=>card(`fallback-${i}`,`theme-${i%3}`,i%5+1));
  const expected=Array.from({length:12},(_,i)=>`fallback-${i}`);
  for(const count of [2,4,8])assert.deepEqual(ids(selectCategories(deck,'B',count)),expected);
  const interleaved=[card('a','x'),card('b','x'),card('c','y'),card('d','z'),card('e','y')];
  assert.deepEqual(ids(selectCategories(interleaved,'B',8)),['a','c','d','b','e']);
});
test('selector fixtures: input arrays and cards stay immutable and returned references stay original',()=>{
  const deck=freeze([...leaders(),card('selected-later','theme-1',3)]),before=JSON.stringify(deck);
  const selected=selectCategories(deck,'B',8);
  assert.equal(JSON.stringify(deck),before);assert.notEqual(selected,deck);
  assert.equal(selected[0],deck[0]);assert.equal(selected[1],deck[12]);
  selected.pop();assert.equal(deck.length,13);
});
test('selector fixtures: hostile theme property names remain ordinary distinct themes',()=>{
  const deck=leaders();['__proto__','constructor','toString'].forEach((theme,i)=>{deck[i]={...deck[i],theme};});
  assert.deepEqual(ids(selectCategories(deck,'B',8)),expectedLeaders);
});
test('selector fixtures: exhaustive four-candidate orders respect bounds and earliest ties',()=>{
  const variants=[card('one','theme-1',1),card('two','theme-1',2),card('four-a','theme-1',4),card('four-b','theme-1',4)];
  function permutations<T>(items:T[]):T[][]{return items.length?items.flatMap((item,i)=>permutations(items.filter((_,j)=>j!==i)).map(rest=>[item,...rest])):[[]];}
  for(const order of permutations(variants)){
    const deck=leaders();deck[1]=order[0];deck.push(...order.slice(1));
    const quality=order.slice(0,3).map(c=>c.answers.B.length),max=Math.max(...quality);
    assert.equal(selectCategories(deck,'B',4)[1].id,order[quality.indexOf(max)].id);
  }
});

test('independent selection oracle: 10,000 varied synthetic and actual decks agree on exact ordered IDs',()=>{
  const rng=createRng(2026100815);
  const banks:readonly (readonly string[])[]=[['b01'],['b01','b02'],['b01','b02','b03'],['b01','b02','b03','b04'],
    ['box','boxes','berry','berries'],['banana','balana','balada'],['12','13','14'],[],['b01','b02','b03','b04','b05','b06','b07','b08','b09']];
  let actual=0,synthetic=0,fallback=0;
  for(let n=0;n<10000;n++){
    const presentCount=rng.int(0,8);let deck:readonly SelectionCard[],letter:string;
    if(n%5===0){letter=rng.pick([...LETTERS]);deck=rng.shuffle(CATEGORIES.filter(c=>(c.answers[letter]?.length??0)>0));actual++;}
    else{
      letter='B';const themeCount=rng.int(2,18);
      const rows=Array.from({length:themeCount},(_,t)=>Array.from({length:rng.int(1,5)},(_,i)=>({id:`case-${n}-${t}-${i}`,theme:`t${t}`,answers:{B:[...rng.pick(banks)]}}))).flat();
      deck=rng.shuffle(rows);synthetic++;if(themeCount<12)fallback++;
    }
    const before=JSON.stringify(deck),selected=selectCategories(deck,letter,presentCount),reference=referenceSelection(deck,letter,presentCount);
    assert.deepEqual(ids(selected),ids(reference),`case ${n}, letter ${letter}, present ${presentCount}`);
    assert.equal(JSON.stringify(deck),before,`case ${n} input changed`);
    assert.equal(new Set(ids(selected)).size,selected.length);
    assert.equal(selected.length,Math.min(12,deck.length));
  }
  assert.equal(actual,2000);assert.equal(synthetic,8000);assert(fallback>1000);
});
// Actual reducer integration against independently selected seeded decks.
type SelectionEvent=Parameters<typeof game.reduce>[1];
const selectionPlayers=(count:number,connected=count,bot=false)=>Array.from({length:count},(_,i)=>({
  id:`selection-p${i}`,name:`Selection Player ${i}`,avatarId:`face${i}`,connected:i<connected,bot,
}));
function expectedSelectionRound(rng:State['rng'],usedLetters:readonly string[],presentCount:number){
  const remaining=LETTERS.filter(letter=>!usedLetters.includes(letter));
  const [position,afterLetter]=nextInt(rng,0,remaining.length-1),letter=remaining[position];
  const pool=CATEGORIES.filter(category=>(category.answers[letter]?.length??0)>0);
  const [deck,nextRng]=shuffle(afterLetter,pool);
  return {letter,rng:nextRng,deck,selected:referenceSelection(deck,letter,presentCount),legacy:referenceSelection(deck,letter,0)};
}
function selectionStep(state:State,event:SelectionEvent):State{
  const before=JSON.stringify(state),actual=game.reduce(state,event);
  const replay=game.reduce(JSON.parse(before) as State,JSON.parse(JSON.stringify(event)) as SelectionEvent);
  assert.deepEqual(actual,replay,'actual event differs after JSON restoration');
  assert.equal(JSON.stringify(state),before,'actual reducer mutated the prior state');
  return actual;
}
function selectionTick(state:State):State{
  assert.notEqual(state.phase.id,'done');assert.notEqual(state.phase.deadline,null);
  return selectionStep(state,{type:'timer',now:state.phase.deadline!,phaseId:state.phase.id,startedAt:state.phase.startedAt});
}
function selectionScores(state:State):State{
  let current=state;
  for(let step=0;current.phase.id!=='scores'&&step<14;step++)current=selectionTick(current);
  assert.equal(current.phase.id,'scores');return current;
}
function assertSelectionRound(state:State,expected:ReturnType<typeof expectedSelectionRound>){
  assert.equal(state.letter,expected.letter);assert.deepEqual(state.rng,expected.rng);
  assert.deepEqual(ids(state.categories),ids(expected.selected));
  assert.deepEqual(state.categories.map(category=>category.theme),expected.legacy.map(category=>category.theme));
  assert.equal(new Set(ids(state.categories)).size,12);
  assert.equal(new Set(state.categories.map(category=>category.theme)).size,12);
  for(const category of expected.selected)assert((category.answers[state.letter]?.length??0)>0);
}

test('selector integration: actual one-to-five-round rosters preserve exact letter RNG theme schedules and restored events',()=>{
  for(const count of [2,4,8])for(const rounds of [1,2,3,4,5])for(const seed of [1,2,3,42]){
    let state=game.init({players:selectionPlayers(count),settings:{rounds,roundSeconds:30},seed,now:1000});
    let expectedRng=seedRng(seed);const usedLetters:string[]=[];
    for(let round=1;round<=rounds;round++){
      assert.equal(state.phase.id,'answer');assert.equal(state.round,round);
      const expected=expectedSelectionRound(expectedRng,usedLetters,count);
      assertSelectionRound(state,expected);usedLetters.push(expected.letter);expectedRng=expected.rng;
      assert.deepEqual(state.usedLetters,usedLetters);assert.equal(new Set(state.usedLetters).size,round);
      state=selectionScores(state);assert.equal(state.history.length,round);
      assert(Object.values(state.roundResult!.points).every(points=>points===0));
      state=selectionTick(state);
    }
    assert.equal(state.phase.id,'done');assert.equal(state.history.length,rounds);
    assert.deepEqual(state.rng,expectedRng);assert.deepEqual(state.usedLetters,usedLetters);
  }
});

test('selector integration: all twenty seeded letters retain a supported distinct-theme pool',()=>{
  const seen=new Set<string>();
  for(let seed=1;seed<=400&&seen.size<LETTERS.length;seed++){
    const state=game.init({players:selectionPlayers(8),settings:{rounds:1,roundSeconds:30},seed,now:0});
    if(seen.has(state.letter))continue;
    const expected=expectedSelectionRound(seedRng(seed),[],8);assertSelectionRound(state,expected);
    assert(new Set(expected.deck.map(category=>category.theme)).size>=12);seen.add(state.letter);
  }
  assert.deepEqual([...seen].sort(),[...LETTERS].sort());
});

test('selector integration: absent seats count by public presence and human bot flags do not affect prompts',()=>{
  let observedPolicyDifference=false;
  for(const seed of [1,2,3,42])for(const connected of [0,1,3,4,8]){
    const context={players:selectionPlayers(8,connected),settings:{rounds:1,roundSeconds:30},seed,now:1000};
    const humans=game.init(context),bots=game.init({...context,players:selectionPlayers(8,connected,true)});
    const mixed=game.init({...context,players:context.players.map((player,i)=>({...player,bot:i%2===0}))});
    const expected=expectedSelectionRound(seedRng(seed),[],connected);assertSelectionRound(humans,expected);
    assert.deepEqual(ids(bots.categories),ids(humans.categories));assert.deepEqual(bots.rng,humans.rng);
    assert.deepEqual(ids(mixed.categories),ids(humans.categories));assert.deepEqual(mixed.rng,humans.rng);
    if(connected<4)assert.deepEqual(ids(humans.categories),ids(expected.legacy));
    else if(JSON.stringify(ids(expected.selected))!==JSON.stringify(ids(expected.legacy)))observedPolicyDifference=true;
  }
  assert(observedPolicyDifference,'fixture never exercised a real crowded-table selection change');
});

test('selector integration: actual departure and reconnection events change next-round present count without extra RNG',()=>{
  let observedLegacyDifference=false;
  for(const seed of [1,2,3,42]){
    let scores=selectionScores(game.init({players:selectionPlayers(8),settings:{rounds:2,roundSeconds:30},seed,now:1000}));
    const allPresent=expectedSelectionRound(scores.rng,scores.usedLetters,8);
    const crowded=selectionTick(scores);assertSelectionRound(crowded,allPresent);
    for(const id of scores.order.slice(3))scores=selectionStep(scores,{type:'player',now:scores.phase.startedAt+10,playerId:id,connected:false});
    const reconnected=selectionStep(scores,{type:'player',now:scores.phase.startedAt+11,playerId:scores.order[3],connected:true});
    assertSelectionRound(selectionTick(reconnected),expectedSelectionRound(scores.rng,scores.usedLetters,4));
    for(const id of scores.order.slice(3))scores=selectionStep(scores,{type:'player',now:scores.phase.startedAt+12,playerId:id,connected:true,gone:'left'});
    const attemptedReturn=selectionStep(scores,{type:'player',now:scores.phase.startedAt+13,playerId:scores.order[3],connected:true});
    assert.equal(attemptedReturn.players[scores.order[3]].connected,false);
    assert.equal(attemptedReturn.left.length,5);
    const expected=expectedSelectionRound(scores.rng,scores.usedLetters,3),next=selectionTick(attemptedReturn);
    assertSelectionRound(next,expected);assert.deepEqual(ids(next.categories),ids(expected.legacy));
    if(JSON.stringify(ids(expected.legacy))!==JSON.stringify(ids(allPresent.selected)))observedLegacyDifference=true;
  }
  assert(observedLegacyDifference,'departure fixture did not distinguish crowded from legacy selection');
});

test('selector integration: controlled private answer ballot and submission perturbations cannot affect the next round',()=>{
  for(const count of [2,4,8])for(const seed of [1,2,3]){
    const scores=selectionScores(game.init({players:selectionPlayers(count),settings:{rounds:2,roundSeconds:30},seed,now:1000}));
    const changed=JSON.parse(JSON.stringify(scores)) as State;
    changed.answers=Object.fromEntries(changed.order.map((id,i)=>[id,Array.from({length:12},(_,slot)=>`private ${i} answer ${slot}`)]));
    changed.submitted=Object.fromEntries(changed.order.map((id,i)=>[id,i%2===0]));
    changed.votes=Object.fromEntries(changed.order.map((id,i)=>[id,[i%2===0,null,i%2!==0]]));
    assert.deepEqual(game.tvView(changed),game.tvView(scores),'private-state perturbation changed the public score view');
    const originalNext=selectionTick(scores),changedNext=selectionTick(changed);
    assert.deepEqual(changedNext,originalNext,'private state influenced the next round');
    assertSelectionRound(originalNext,expectedSelectionRound(scores.rng,scores.usedLetters,count));
  }
});
