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
 return Math.max(0,1000-250*Math.abs(guess-row.correct)/(row.kind==='decade'?10:1));
}
export function normalize(text:string):string{return text.normalize('NFKC').replace(/[\p{Cc}\p{Cf}]/gu,' ').trim().replace(/\s+/gu,' ').toLowerCase();}
