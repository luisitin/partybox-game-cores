import type {Row} from './samples.ts';
/** Bounded, unit-invariant, reciprocal-symmetric numeric closeness. */
export function numberScore(guess:number,truth:number):number{
 if(!Number.isFinite(guess)||!Number.isFinite(truth)||guess<0||truth<0)return 0;
 if(guess===truth)return 1000;
 if(guess===0||truth===0)return 0;
 return Math.round(1000*(Math.min(guess,truth)/Math.max(guess,truth)));
}
export function quickScore(row:Row,guess:number):number{
 if(!Number.isFinite(guess)||row.kind==='bluff')return 0;
 if(row.kind==='number')return numberScore(guess,row.correct);
 if(row.kind==='choice')return guess===row.correct?1000:0;
 if(row.kind==='century'){
  if(!Number.isInteger(guess)||guess===0)return 0;
  const index=(century:number)=>century>0?century-1:century;
  return Math.max(0,1000-250*Math.abs(index(guess)-index(row.correct)));
 }
 return Math.max(0,1000-250*Math.abs(guess-row.correct)/10);
}
export function cleanText(text:string):string{return text.normalize('NFKC').replace(/[\p{Cc}\p{Cf}]/gu,' ').trim().replace(/\s+/gu,' ');}
export function normalize(text:string):string{return cleanText(text).toLowerCase();}
