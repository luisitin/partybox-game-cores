export type Card=number;
export const rank=(c:Card):number=>c%13+1;
export const suit=(c:Card):number=>Math.floor(c/13);
export const value=(c:Card):number=>Math.min(rank(c),10);
export const cardName=(c:Card):string=>['A','2','3','4','5','6','7','8','9','10','J','Q','K'][rank(c)-1]+['♣','♦','♥','♠'][suit(c)];
export function validMeld(cards:readonly Card[]):boolean {
  if(cards.length<3||new Set(cards).size!==cards.length)return false;
  const ranks=cards.map(rank).sort((a,b)=>a-b);
  return (cards.length<=4&&ranks.every(r=>r===ranks[0])) ||
    (cards.every(c=>suit(c)===suit(cards[0]))&&ranks.every((r,i)=>r===ranks[0]+i));
}
export interface MeldSolution {deadwood:number; melds:Card[][]; loose:Card[]}
export function meldCandidates(hand:readonly Card[]):number[] {
  const result:number[]=[];
  for(let r=1;r<=13;r++) {
    const indices=hand.map((c,i)=>rank(c)===r?i:-1).filter(i=>i>=0);
    if(indices.length>=3) {
      if(indices.length===4)result.push(indices.reduce((a,i)=>a|(1<<i),0));
      for(let a=0;a<indices.length;a++)for(let b=a+1;b<indices.length;b++)for(let c=b+1;c<indices.length;c++)
        result.push((1<<indices[a])|(1<<indices[b])|(1<<indices[c]));
    }
  }
  for(let s=0;s<4;s++) {
    const byRank=new Map(hand.flatMap((c,i)=>suit(c)===s?[[rank(c),i] as const]:[]));
    for(let start=1;start<=11;start++) {
      let mask=0;
      for(let r=start;r<=13&&byRank.has(r);r++) {
        mask|=1<<byRank.get(r)!;
        if(r-start>=2)result.push(mask);
      }
    }
  }
  return result.sort((a,b)=>a-b);
}
// Weighted exact cover: the first remaining card is deadwood or lies in one legal meld.
export function minimizeDeadwood(hand:readonly Card[]):MeldSolution {
  if(hand.length>11||new Set(hand).size!==hand.length||hand.some(c=>!Number.isInteger(c)||c<0||c>51))
    throw new Error('Expected distinct cards, maximum eleven');
  const candidates=meldCandidates(hand), size=1<<hand.length;
  const cost=new Int16Array(size).fill(-1), choice=new Int32Array(size);
  cost[0]=0;
  function solve(mask:number):number {
    if(cost[mask]>=0)return cost[mask];
    const bit=mask&-mask, i=31-Math.clz32(bit);
    let best=value(hand[i])+solve(mask^bit), selected=0;
    for(const meld of candidates)if((meld&bit)&&((mask&meld)===meld)) {
      const score=solve(mask^meld);
      if(score<best){best=score;selected=meld;}
    }
    cost[mask]=best;choice[mask]=selected;return best;
  }
  let mask=size-1;
  const deadwood=solve(mask),melds:Card[][]=[],loose:Card[]=[];
  while(mask) {
    const meld=choice[mask];
    if(meld){melds.push(hand.filter((_,i)=>Boolean(meld&(1<<i))));mask^=meld;}
    else {const bit=mask&-mask;loose.push(hand[31-Math.clz32(bit)]);mask^=bit;}
  }
  return {deadwood,melds,loose};
}
export function declaredSolution(hand:readonly Card[],melds:readonly Card[][]):MeldSolution|null {
  const used=melds.flat();
  if(melds.some(m=>!validMeld(m))||new Set(used).size!==used.length||used.some(c=>!hand.includes(c)))return null;
  const loose=hand.filter(c=>!used.includes(c));
  return {melds:melds.map(m=>[...m]),loose,deadwood:loose.reduce((a,c)=>a+value(c),0)};
}
export interface Defense extends MeldSolution {laid:{card:Card;target:number}[]}
export function optimalDefense(hand:readonly Card[],targets:readonly Card[][],canLayOff=true):Defense {
  if(!canLayOff)return {...minimizeDeadwood(hand),laid:[]};
  const candidates=meldCandidates(hand);
  let best:Defense={...minimizeDeadwood(hand),laid:[]};
  function layoffs(loose:Card[],board:Card[][],laid:{card:Card;target:number}[],own:Card[][]):void {
    const deadwood=loose.reduce((a,c)=>a+value(c),0);
    if(deadwood<best.deadwood)best={deadwood,loose:[...loose],melds:own.map(m=>[...m]),laid:[...laid]};
    for(let i=0;i<loose.length;i++)for(let t=0;t<board.length;t++) {
      const extended=[...board[t],loose[i]];
      if(validMeld(extended))layoffs(loose.filter((_,j)=>i!==j),board.map((m,j)=>j===t?extended:m),[...laid,{card:loose[i],target:t}],own);
    }
  }
  function partitions(mask:number,loose:Card[],own:Card[][]):void {
    if(!mask){layoffs(loose,targets.map(m=>[...m]),[],own);return;}
    const bit=mask&-mask,i=31-Math.clz32(bit);
    partitions(mask^bit,[...loose,hand[i]],own);
    for(const meld of candidates)if((meld&bit)&&((mask&meld)===meld))
      partitions(mask^meld,loose,[...own,hand.filter((_,i)=>Boolean(meld&(1<<i)))]);
  }
  partitions((1<<hand.length)-1,[],[]);
  return best;
}
