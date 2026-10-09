// Independent packing formulation: own melds and entire target extensions
// compete as weighted subsets, with at most one extension subset per target.
// Does not import the primary candidate finder, recursion or meld validator.
export function bruteDefense(hand,targets) {
 const value=c=>Math.min(c%13+1,10);
 const legal=cards=>{
  if(cards.length<3||new Set(cards).size!==cards.length)return false;
  const ranks=cards.map(c=>c%13+1).sort((a,b)=>a-b);
  return cards.length<=4&&ranks.every(r=>r===ranks[0])||
   cards.every(c=>Math.floor(c/13)===Math.floor(cards[0]/13))&&ranks.every((r,i)=>r===ranks[0]+i);
 };
 const candidates=[];
 for(let mask=1;mask<(1<<hand.length);mask++) {
  const cards=hand.filter((_,i)=>mask&(1<<i)),points=cards.reduce((a,c)=>a+value(c),0);
  if(legal(cards))candidates.push({mask,points,target:-1});
  for(let t=0;t<targets.length;t++)if(legal([...targets[t],...cards]))candidates.push({mask,points,target:t});
 }
 let saved=0;
 function pack(index,used,usedTargets,points) {
  saved=Math.max(saved,points);
  for(let j=index;j<candidates.length;j++) {
   const c=candidates[j],targetBit=c.target<0?0:1<<c.target;
   if(!(used&c.mask)&&!(usedTargets&targetBit))pack(j+1,used|c.mask,usedTargets|targetBit,points+c.points);
  }
 }
 pack(0,0,0,0);return hand.reduce((a,c)=>a+value(c),0)-saved;
}
