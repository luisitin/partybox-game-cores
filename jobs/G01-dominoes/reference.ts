// Independently structured exhaustive game-tree evaluator. No production
// transition, move generation, pip function or terminal evaluator is reused.
import type {Position} from './core.ts';
const pairs=()=>{const a:number[][]=[];for(let i=0;i<7;i++)for(let j=i;j<7;j++)a.push([i,j]);return a;};
export function reference(p:Position,root:number):number {
 const values=pairs();const seats=p.hands.length;const groups=p.hands.map((_,i)=>p.partners?i%2:i);
 const go=(hands:number[][],left:number|null,right:number|null,turn:number,passes:number):number=>{
  const totals=hands.map(h=>h.reduce((sum,t)=>sum+values[t]![0]!+values[t]![1]!,0));
  const exhausted=hands.findIndex(h=>h.length===0);
  if(exhausted>=0||passes===seats){
   let winner:number;
   if(exhausted>=0)winner=groups[exhausted]!;
   else {
    const candidates=[...new Set(groups)].map(g=>({g,total:totals.reduce((sum,v,i)=>sum+(groups[i]===g?v:0),0)}));
    candidates.sort((a,b)=>a.total-b.total);
    if(candidates[0]!.total===candidates[1]!.total)return 0;
    winner=candidates[0]!.g;
   }
   let value=100;for(let i=0;i<seats;i++)if(groups[i]!==winner)value+=totals[i]!;
   return groups[root]===winner?value:-value;
  }
  const children:number[]=[];
  for(let index=0;index<hands[turn]!.length;index++){
   const t=hands[turn]![index]!;const [a,b]=values[t]!;const reduced=hands.map((h,i)=>i===turn?h.filter((_,j)=>j!==index):[...h]);
   if(left===null)children.push(go(reduced,a!,b!,(turn+1)%seats,0));
   else {
    if(a===left||b===left)children.push(go(reduced,a===left?b!:a!,right,(turn+1)%seats,0));
    if(a===right||b===right)children.push(go(reduced,left,a===right?b!:a!,(turn+1)%seats,0));
   }
  }
  if(children.length===0)return go(hands,left,right,(turn+1)%seats,passes+1);
  return groups[turn]===groups[root]?Math.max(...children):Math.min(...children);
 };
 return go(p.hands,p.ends?.[0]??null,p.ends?.[1]??null,p.turn,p.passes);
}
