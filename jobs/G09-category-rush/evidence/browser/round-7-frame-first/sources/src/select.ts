import {groupAnswers} from './match';

/** Select from the core's already-supported, seeded shuffled pool. */
export function selectCategories<T extends {id:string;theme:string;answers:Readonly<Record<string,readonly string[]>>}>(deck:readonly T[],letter:string,presentCount:number):T[] {
  const leaders:T[]=[],firstThree=new Map<string,T[]>();
  for(const category of deck){
    const list=firstThree.get(category.theme);
    if(!list){firstThree.set(category.theme,[category]);if(leaders.length<12)leaders.push(category);}
    else if(list.length<3)list.push(category);
  }
  // Preserve the original whole result at small tables or scarce-theme inputs.
  if(presentCount<4||leaders.length<12){
    const legacy=[...leaders];
    for(const category of deck)if(legacy.length<12&&!legacy.includes(category))legacy.push(category);
    return legacy;
  }
  const widths=new Map<T,number>();
  const quality=(category:T):number=>{
    let width=widths.get(category);
    if(width===undefined){width=groupAnswers(category.answers[letter]??[]).length;widths.set(category,width);}
    return Math.min(width,presentCount);
  };
  return leaders.map((leader,slot)=>{
    // These are exploration positions, not a per-prompt exposure guarantee.
    if(slot%3===0)return leader;
    let best=leader;
    for(const candidate of firstThree.get(leader.theme)!)if(quality(candidate)>quality(best))best=candidate;
    return best;
  });
}
