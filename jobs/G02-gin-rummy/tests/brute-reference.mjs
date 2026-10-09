// Independent algorithm: enumerate every subset, then every disjoint subset packing.
// No imports from the core, no bitmask dynamic-programming recurrence shared with it.
export function bruteDeadwood(hand) {
  const n=hand.length;
  if(n>11 || new Set(hand).size!==n) throw new Error('reference expects distinct <=11 cards');
  const value=c=>Math.min(c%13+1,10);
  const candidates=[];
  for(let mask=1;mask<(1<<n);mask++) {
    const cards=hand.filter((_,i)=>mask&(1<<i));
    if(cards.length<3)continue;
    const ranks=cards.map(c=>c%13+1).sort((a,b)=>a-b);
    const set=cards.length<=4 && ranks.every(r=>r===ranks[0]);
    const run=cards.every(c=>Math.floor(c/13)===Math.floor(cards[0]/13)) && ranks.every((r,i)=>r===ranks[0]+i);
    if(set||run)candidates.push({mask,points:cards.reduce((a,c)=>a+value(c),0)});
  }
  let saved=0;
  function search(index,used,points) {
    saved=Math.max(saved,points);
    for(let j=index;j<candidates.length;j++) {
      const meld=candidates[j];
      if(!(used&meld.mask))search(j+1,used|meld.mask,points+meld.points);
    }
  }
  search(0,0,0);
  return hand.reduce((a,c)=>a+value(c),0)-saved;
}
