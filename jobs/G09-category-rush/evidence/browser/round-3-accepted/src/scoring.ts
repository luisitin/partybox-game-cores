import {firstLetter,groupAnswers,sameAnswer} from './match';
import type {CategoryResult,Group,State} from './model';

export function groupsFor(s:State,index:number):Group[] {
  const entries=s.order.map(id=>({id,text:s.answers[id]?.[index]??''})).filter(x=>x.text.trim().length>0);
  return groupAnswers(entries.map(x=>x.text)).map((indexes,i)=>{
    const owners=indexes.map(n=>entries[n].id),text=entries[indexes[0]].text;
    return {id:`r${s.round}-c${index}-g${i}`,text,owners,duplicate:owners.length>1,
      eligible:firstLetter(text)===s.letter};
  });
}
export function ballotAccepts(owners:readonly string[],votes:Record<string,(boolean|null)[]>,index:number):boolean {
  const ballots=Object.entries(votes).map(([id,v])=>({id,v:v[index]})).filter(x=>typeof x.v==='boolean');
  if(ballots.length===0)return true; // an unchallenged answer stands
  const sum=(items:typeof ballots)=>items.reduce((n,x)=>n+(x.v?1:-1),0);
  const all=sum(ballots);
  return all===0?sum(ballots.filter(x=>!owners.includes(x.id)))>0:all>0;
}
export function scoreCategory(s:State,index:number):CategoryResult {
  return {categoryId:s.categories[index].id,groups:groupsFor(s,index).map((group,i)=>{
    // Repeated-own-answer adjudication stays private until scoring. Publishing
    // this flag during review, or letting bots read it, would reveal future rows.
    const ownRepeated=group.owners.some(id=>s.answers[id].some((value,n)=>n!==index&&sameAnswer(value,s.answers[id][index])));
    const eligible=group.eligible&&!ownRepeated;
    const accepted=eligible&&ballotAccepts(group.owners,s.votes,i);
    return {...group,eligible,accepted,points:accepted&&!group.duplicate?1:0};
  })};
}
