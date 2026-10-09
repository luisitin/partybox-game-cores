import {game} from '../dist/core.mjs';
import {discardSolutions,rank,suit,value} from '../dist/cards.mjs';
import {initial,rng,invariant} from './helpers.mjs';

export const ginHand=[1,2,3,4,14,15,16,27,28,29,39];
export const lowDefender=[8,9,10,11,12,21,22,23,24,40];
export function arranged(hand=ginHand,defender=lowDefender,settings={},count=2,phase='discard'){
 const s=initial(1,count,{bigGin:false,...settings});
 s.turn='p0';s.phase={id:phase,startedAt:0,deadline:null};s.phaseClock=0;
 s.hands={...s.hands,p0:[...hand],p1:[...defender]};s.drawnDiscard=null;
 s.pending=null;s.roundResult=null;s.mustStock=false;
 const used=new Set([...hand,...defender]);
 const free=Array.from({length:52},(_,i)=>i).filter(c=>!used.has(c));
 s.discard=[free.pop()];s.stock=free;
 // An earlier public pickup is still in the defender's hand. This also gives
 // Oklahoma a consistent non-ace initial upcard for its limit/doubling.
 s.initialUpcard=defender.at(-1);
 s.knockLimit=s.config.variant==='oklahoma'?(rank(s.initialUpcard)===1&&s.config.aceGin?0:value(s.initialUpcard)):10;
 s.multiplier=s.config.variant==='oklahoma'&&s.config.spadeDouble&&suit(s.initialUpcard)===3?2:1;
 s.publicLog=[{player:'p1',action:'take-discard',card:defender.at(-1)}];
 invariant(s);return s;
}
export function hasGinOpportunity(s){
 const v=game.controllerView(s,'p0');
 if(v.phaseId==='discard')return discardSolutions(v.handCards).some(({card,solution})=>card!==v.forbiddenDiscard&&solution.deadwood===0);
 if(!v.legal.some(x=>x.type==='draw'&&x.source==='discard'))return false;
 const top=v.discard.at(-1);
 return discardSolutions([...v.handCards,top]).some(({card,solution})=>card!==top&&solution.deadwood===0);
}
export function* nonGinCases(count=10000){
 const r=rng(776331);let emitted=0,attempt=0;
 while(emitted<count){
  const deck=r.shuffle(Array.from({length:52},(_,i)=>i));
  const phase=['discard','draw','upcard'][attempt%3],size=phase==='discard'?11:10;
  const s=arranged(deck.slice(0,size),deck.slice(size,size+10),{
   variant:attempt%2?'standard':'oklahoma',
   bonusProfile:['classic','northAmerican','rubl'][attempt%3],
   bigGin:!!(attempt%2),spadeDouble:!!(attempt%3)},2+attempt%3,phase);
  if(phase==='discard'&&attempt%5===0)s.drawnDiscard=s.hands.p0.at(-1);
  if(phase==='draw'&&attempt%7===0)s.mustStock=true;
  s.publicLog=Array.from({length:3},(_,j)=>({player:'p1',action:'take-discard',card:s.hands.p1[j]}));
  attempt++;
  if(hasGinOpportunity(s))continue;
  yield {state:s,seed:12345+emitted};emitted++;
 }
}
