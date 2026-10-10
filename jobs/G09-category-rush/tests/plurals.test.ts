import assert from 'node:assert/strict';
import {test} from 'node:test';
import {normalize,stem,sameAnswer,groupAnswers,firstLetter} from '../src/match';
import {init} from '../src/index';
import {scoreCategory} from '../src/scoring';
import {CATEGORIES} from '../content/categories';
import {createRng} from '../../../contract/rng';
import {referenceSame,referenceGroups,referenceCategory,referenceStem} from './reference';

// Each pair has two independently read sources in SOURCES-MATCHER.md.
const facts:[string,string][]=[
  ['child','children'],['foot','feet'],['tooth','teeth'],['person','people'],
  ['mouse','mice'],['goose','geese'],['man','men'],['woman','women'],
  ['knife','knives'],['leaf','leaves'],['shelf','shelves'],['life','lives'],
  ['wife','wives'],['half','halves'],['loaf','loaves'],['elf','elves'],
  ['cactus','cacti'],['fungus','fungi'],['datum','data'],['syllabus','syllabi'],
  ['analysis','analyses'],['diagnosis','diagnoses'],['oasis','oases'],
  ['thesis','theses'],['crisis','crises'],['potato','potatoes'],['tomato','tomatoes'],
  ['sheep','sheep'],['fish','fish'],['deer','deer'],['species','species'],['aircraft','aircraft'],
  ['hero','heroes'],['echo','echoes'],['bus','buses'],['quiz','quizzes'],
  ['status','statuses'],['roof','roofs'],['chief','chiefs'],['proof','proofs'],
  ['wolf','wolves'],['calf','calves'],['gas','gases'],['gas','gasses'],
  ['cactus','cactuses'],['house','houses'],['bus','busses'],
];
const separate:[string,string][]=[['news','new'],['chief','chieves'],['proof','prooves'],
  ['roof','rooves'],['axis','axe'],['basis','base'],['bus','business'],
  ['leaf','leave'],['knife','knave'],['house','hose'],['12 knives','13 knives']];
const setup=(seats:number)=>init({players:Array.from({length:seats},(_,i)=>({id:`p${i}`,name:`P${i}`,avatarId:`face${i}`,connected:true,bot:false})),settings:{rounds:1,roundSeconds:30},seed:177,now:0});

test('47 independently sourced singular/plural facts meet in stems and sameAnswer',()=>{
  for(const [a,b] of facts){
    assert.equal(stem(a),stem(b),`${a}/${b} stems`);
    assert.equal(referenceStem(a),referenceStem(b),`${a}/${b} independent stems`);
    assert.equal(sameAnswer(a,b),true,`${a}/${b}`);
    assert.equal(referenceSame(a,b),true,`${a}/${b} independent matcher`);
  }
});
test('noun exceptions compose with normalization, compound words and existing possessives',()=>{
  for(const [a,b] of [['the sharp knife','sharp knives'],['bay leaf','bay leaves'],
    ['A MOUSE','mice'],['women',"women's"],['men',"men's"],['mice',"mice's"],
    ['children',"children's"],['people',"people's"]]){
    assert.equal(sameAnswer(a,b),true,`${a}/${b}`);
    assert.equal(referenceSame(a,b),true,`${a}/${b} reference`);
  }
  // Whole words only: a suffix does not make an unrelated noun an irregular plural.
  assert.equal(stem('amen'),'amen');assert.equal(stem('gasmask'),'gasmask');
  assert.equal(stem('constructor'),'constructor');assert.equal(stem('toString'),'toString');
});
test('bounded noun facts preserve regular exceptions and do not resolve ambiguous plurals blindly',()=>{
  for(const [a,b] of separate){assert.equal(sameAnswer(a,b),false,`${a}/${b}`);assert.equal(referenceSame(a,b),false,`${a}/${b} reference`);}
  assert.deepEqual(groupAnswers(['axis','axe','axes']),[[0],[1,2]]);
  assert.deepEqual(groupAnswers(['basis','base','bases']),[[0],[1,2]]);
  assert.deepEqual(groupAnswers(['news','news','new']),[[0,1],[2]]);
  assert.deepEqual(groupAnswers(['woman','women',"women's"]),[[0,1,2]]);
  // The contract's six-letter one-edit policy remains broader than noun meaning.
  assert.equal(sameAnswer('status','statue'),true);
  assert.equal(sameAnswer('species','specie'),true);
});
test('sourced plural duplicates cancel actual two-seat and eight-seat scores',()=>{
  for(const seats of [2,8])for(const [a,b] of facts){
    const s=setup(seats);s.letter=firstLetter(a);s.votes={};
    s.answers=Object.fromEntries(s.order.map((id,i)=>{const row=Array<string>(12).fill('');row[0]=i%2?a:b;return[id,row];}));
    const result=scoreCategory(s,0);
    assert.equal(result.groups.length,1,`${seats} ${a}/${b}`);
    assert.equal(result.groups[0].duplicate,true);
    assert.equal(result.groups[0].owners.length,seats);
    assert.equal(result.groups[0].points,0);
    assert.deepEqual(result,referenceCategory(s,0));
  }
});
test('using singular and plural in separate rows cancels both own scores',()=>{
  for(const [a,b] of facts){
    const s=setup(2);s.letter=firstLetter(a);s.votes={};s.answers={p0:Array(12).fill(''),p1:Array(12).fill('')};
    s.answers.p0[0]=a;s.answers.p0[1]=b;
    for(const i of [0,1]){const out=scoreCategory(s,i);assert.equal(out.groups[0].eligible,false,`${a}/${b} row ${i}`);assert.equal(out.groups[0].points,0);assert.deepEqual(out,referenceCategory(s,i));}
  }
});
test('750 seeded lexical, spelling, numeric and ballot cases agree with the independent graph oracle',()=>{
  const rng=createRng(2026100812),words=[...facts.flat(),...separate.flat(),'',"women's",'the sharp knives','sharp knife','statue','status','12 leaves','13 leaves','THE MÍCE'];
  for(let n=0;n<750;n++){
    const s=setup(rng.int(2,8));s.letter=rng.pick(['A','B','C','F','G','H','K','L','M','N','P','Q','R','S','T','W']);
    s.answers=Object.fromEntries(s.order.map(id=>[id,Array.from({length:12},()=>rng.pick(words))]));
    const texts=s.order.map(id=>s.answers[id][0]);
    for(let i=0;i<texts.length;i++)assert.equal(sameAnswer(texts[i],texts[(i+1)%texts.length]),referenceSame(texts[i],texts[(i+1)%texts.length]));
    assert.deepEqual(groupAnswers(texts),referenceGroups(texts));
    s.votes=Object.fromEntries(s.order.map(id=>[id,Array.from({length:groupAnswers(texts).length},()=>rng.pick([true,false,null]))]));
    assert.deepEqual(scoreCategory(s,0),referenceCategory(s,0));
  }
});
test('the bounded fix introduces no new equivalent options within the 2,565 frozen banks',()=>{
  const equivalent:{id:string;letter:string;a:string;b:string}[]=[];
  for(const c of CATEGORIES)for(const [letter,answers] of Object.entries(c.answers))for(let i=0;i<answers.length;i++)for(let j=0;j<i;j++)
    if(sameAnswer(answers[j],answers[i]))equivalent.push({id:c.id,letter,a:answers[j],b:answers[i]});
  assert.deepEqual(equivalent,[{id:'home-rooms-02',letter:'G',a:'glass',b:'glasses'},
    {id:'games-toys-10',letter:'P',a:'placing',b:'playing'}]);
  assert.deepEqual(normalize('THE MÍCE'),{norm:'mice',compact:'mice'});
});
