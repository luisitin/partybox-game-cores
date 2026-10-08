import {referenceGroups} from './reference';

export interface SelectionCard {
  id:string;theme:string;answers:Readonly<Record<string,readonly string[]>>;
}
/** Indexed partitions and lexicographic ranking, independent of production. */
export function referenceSelection<T extends SelectionCard>(deck:readonly T[],letter:string,presentCount:number):T[] {
  const partitions=new Map<string,{position:number;card:T}[]>();
  deck.forEach((card,position)=>{
    const group=partitions.get(card.theme)??[];group.push({position,card});partitions.set(card.theme,group);
  });
  const ordered=[...partitions.values()].sort((a,b)=>a[0].position-b[0].position);
  const leaders=ordered.slice(0,12).map(group=>group[0].card);
  if(presentCount<4||ordered.length<12){
    const chosen=new Set(leaders);
    const extras=deck.filter(card=>!chosen.has(card));
    return [...leaders,...extras].slice(0,12);
  }
  return ordered.slice(0,12).map((group,slot)=>{
    if([0,4,8].includes(slot))return group[0].card;
    const ranked=group.slice(0,3).map(item=>({
      ...item,quality:Math.min(presentCount,referenceGroups(item.card.answers[letter]??[]).length),
    })).sort((a,b)=>b.quality-a.quality||a.position-b.position);
    return ranked[0].card;
  });
}
