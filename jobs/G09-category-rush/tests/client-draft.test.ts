import {test} from 'node:test';
import assert from 'node:assert/strict';
import {draftWarnings,normalizeDraftAnswer} from '../client-draft';
import {referenceSame} from './reference';
import {game} from '../src/index';
import {scoreCategory} from '../src/scoring';

test('writing hints distinguish blanks, initial articles, accents and numeric initials',()=>{
  assert.deepEqual(draftWarnings(['',' ','The Éclair','an eagle','eagle creative example'],'E'),['','','','','']);
  assert.match(draftWarnings(['The banana'],'E')[0],/Start with E/);
  assert.match(draftWarnings(['one plum'],'P')[0],/Start with P/);
  assert.equal(draftWarnings(['one plum'],'O')[0],'');
  assert.match(draftWarnings(['界'],'E')[0],/Start with E/);
});

test('every directly equivalent own row warns with exact category numbers and no semantic veto',()=>{
  const pairs=[['mouse','mice'],['The mouse','MOUSE'],['leaf','leaves'],['The café','cafe'],['a quiet garden','quietgarden'],['a forty two','42'],['suitcase','suitcases']];
  for(const [left,right] of pairs){
    assert(referenceSame(left,right),`${left}/${right}: independent matcher`);
    const draft=[left,...Array<string>(10).fill(''),right],warnings=draftWarnings(draft,'M');
    assert.match(warnings[0],/Also used in category 12/);assert.match(warnings[11],/Also used in category 1/);
    assert(warnings.slice(1,11).every(text=>text===''));
  }
  for(const [left,right] of [['news','new'],['axis','axe'],['12','13'],['mouse','moose'],['shell','shelf']]){
    assert(!referenceSame(left,right));assert(draftWarnings([left,right],'M').every(text=>!text.includes('Also used')));
  }
  assert.equal(draftWarnings(['M creative answer absent from any example bank'],'M')[0],'');
});

test('a fuzzy chain lists direct scoring pairs rather than inventing endpoint matches',()=>{
  const draft=['garden','gardens','gordens'];
  assert(referenceSame(draft[0],draft[1]));assert(referenceSame(draft[1],draft[2]));assert(!referenceSame(draft[0],draft[2]));
  const warnings=draftWarnings(draft,'G');
  assert.match(warnings[0],/category 2;/);assert(!warnings[0].includes('3'));
  assert.match(warnings[1],/categories 1, 3;/);assert.match(warnings[2],/category 2;/);
});

test('bounded own-draft advice is pure and matches independently enumerated pairs on varied full sheets',()=>{
  const atoms=['',' ','mouse','mice','leaf','leaves','The café','cafe','news','new','12','13','garden','gardens','gordens','M original idea','an eagle'];
  for(let seed=0;seed<240;seed++){
    const draft=Array.from({length:12},(_,n)=>atoms[(seed*7+n*3+Math.floor(seed/(n+1)))%atoms.length]),before=structuredClone(draft);
    const warnings=draftWarnings(draft,'M');assert.deepEqual(draft,before);assert.deepEqual(draftWarnings(draft,'M'),warnings);
    for(const [n,value] of draft.entries()){
      const expected=draft.flatMap((other,k)=>k!==n&&referenceSame(value,other)?[k+1]:[]);
      assert.equal(warnings[n].includes('Also used'),expected.length>0,`sheet${seed}/row${n}`);
      if(expected.length)assert(warnings[n].includes(`${expected.length===1?'category':'categories'} ${expected.join(', ')};`));
    }
  }
});

test('offline input preserves article boundaries through the unchanged reducer and actual scored groups',()=>{
  for(const count of [2,8])for(const separator of [' ','\t','\n','\r\n','\v','\x7f']){
    const players=Array.from({length:count},(_,n)=>({id:`p${n+1}`,name:`Person${n+1}`,avatarId:'',connected:true}));
    const initial=game.init({players,settings:{rounds:1,roundSeconds:180},seed:42,now:1000});
    assert.equal(initial.letter,'S');assert.equal(initial.categories[0].id,'school-08');
    const pasted=`The${separator}stapler`,answers=[normalizeDraftAnswer(pasted),...Array<string>(11).fill('')];
    const submitted=game.reduce(initial,{type:'input',now:1001,playerId:'p1',input:{type:'submit',answers}});
    assert.equal(scoreCategory(submitted,0).groups[0].points,1,'an unchallenged authored unique S answer retains its point');
    assert.equal(draftWarnings(answers,'S')[0],'');
    if(['\t','\v','\x7f'].includes(separator)){
      const old=game.reduce(initial,{type:'input',now:1001,playerId:'p1',input:{type:'submit',answers:[pasted,...Array<string>(11).fill('')]}});
      assert.equal(old.answers.p1[0],'Thestapler');assert.equal(scoreCategory(old,0).groups[0].points,0,'baseline defect remains reproducible in the untouched core');
    }
    const repeated=answers.map((value,n)=>n===1?'stapler':value),own=game.reduce(initial,{type:'input',now:1001,playerId:'p1',input:{type:'submit',answers:repeated}});
    assert.equal(scoreCategory(own,0).groups[0].points,0,'input cleanup cannot defeat own-repeat scoring');
    assert.match(draftWarnings(repeated,'S')[0],/category 2;/);assert.match(draftWarnings(repeated,'S')[1],/category 1;/);
  }
});

test('bounded input and advice agree on what is submitted without changing ordinary or creative text',()=>{
  for(const text of ['stapler','The stapler','  The café  ','S creative example','shelf','shell','news','new'])assert.equal(normalizeDraftAnswer(text),text);
  assert.equal(normalizeDraftAnswer('The\u0000stapler'),'The stapler');
  assert.equal(normalizeDraftAnswer(' \t\v\x7f '),'     ');
  assert.equal(draftWarnings([' \t\v\x7f '],'S')[0],'');
  assert.match(draftWarnings(['The\tzebra'],'S')[0],/Start with S/);
  const prefix='M'+ 'x'.repeat(79);assert.equal(normalizeDraftAnswer(prefix+'different suffix'),prefix);
  const hints=draftWarnings([prefix+'suffix1',prefix+'suffix2'],'M');
  assert.match(hints[0],/category 2;/);assert.match(hints[1],/category 1;/);
  assert(!draftWarnings(['news','new'],'N').some(text=>text.includes('Also used')));
});
