import {test} from 'node:test';
import assert from 'node:assert/strict';
import {draftWarnings} from '../client-draft';
import {referenceSame} from './reference';

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
