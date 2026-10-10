import {firstLetter,sameAnswer} from './src/match';

// Keep word boundaries visible before the core strips control characters.
// One replacement per UTF-16 code unit preserves the input's selection indexes.
export function normalizeDraftAnswer(answer:string):string {
  return answer.replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,80);
}

// Private writing advice reads only this person's draft and the public initial.
// It never reads another sheet, the category bank, ballots or bot state.
export function draftWarnings(answers:readonly string[],letter:string):string[] {
  const submitted=answers.map(normalizeDraftAnswer);
  return submitted.map((answer,index)=>{
    if(!answer.trim())return '';
    const parts:string[]=[];
    if(firstLetter(answer)!==letter)parts.push(`Start with ${letter} after ignoring A, An or The to score.`);
    const repeats=submitted.flatMap((other,n)=>n!==index&&sameAnswer(answer,other)?[n+1]:[]);
    if(repeats.length)parts.push(`Also used in ${repeats.length===1?'category':'categories'} ${repeats.join(', ')}; repeated answers score zero.`);
    return parts.join(' ');
  });
}
