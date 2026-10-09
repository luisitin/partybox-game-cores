import type {Rng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
import type {Input,PhoneView} from './core.ts';
import {rank,suit,deck,winningPlay} from './cards.ts';
function strength(hand:readonly number[],sharp:boolean):number{
 const spades=hand.filter(c=>suit(c)===3);let value=0;
 if(!sharp)return hand.filter(c=>rank(c)===14).length+.5*hand.filter(c=>rank(c)===13).length+.5*Math.max(0,spades.length-2);
 for(let color=0;color<3;color++){
  const cards=hand.filter(c=>suit(c)===color),ranks=cards.map(rank),long=Math.max(.5,1-.12*Math.max(0,cards.length-4));
  if(ranks.includes(14))value+=long;
  if(ranks.includes(13))value+=(ranks.includes(14)?.9:.5)*long;
  if(ranks.includes(12))value+=(ranks.includes(14)&&ranks.includes(13)?.8:.15)*long;
  if(cards.length<=1&&spades.length>=3)value+=.35;
 }
 for(const card of spades)value+=rank(card)>=12?.9:rank(card)>=9?.55:.25;
 return value+.4*Math.max(0,spades.length-4);
}
function nilSafe(v:PhoneView,skill:BotSkill):boolean{
 const spades=v.hand.filter(c=>suit(c)===3),partner=v.partner?v.bids[v.partner]:null;
 return v.hand.every(c=>rank(c)<13)&&spades.length<=2&&Math.max(0,...spades.map(rank))<=(skill==='sharp'?7:5)
  &&[0,1,2].every(color=>{const cards=v.hand.filter(c=>suit(c)===color);return cards.length!==1||rank(cards[0]!)<=8;})
  &&(v.mode==='cutthroat'||!partner||partner.kind!=='number'||partner.value>=4);
}
function danger(card:number):number{return (suit(card)===3?30:0)+rank(card);}
function play(v:PhoneView,rng:Rng,skill:BotSkill):number{
 const legal=[...v.legal],mine=v.bids[v.me.id],current=winningPlay(v.trick);
 if(skill==='easy')return rng.pick(legal);
 const winning=legal.filter(card=>winningPlay([...v.trick,{playerId:v.me.id,card}])?.playerId===v.me.id);
 const losing=legal.filter(card=>!winning.includes(card)),low=(cards:number[])=>[...cards].sort((a,b)=>danger(a)-danger(b))[0]!,high=(cards:number[])=>[...cards].sort((a,b)=>danger(b)-danger(a))[0]!;
 if(mine?.kind!=='number'&&!(v.settings.failedNilCounts&&v.won[v.me.id]!>0))return losing.length?high(losing):low(legal);
 const mySide=v.sides.find(side=>side.ids.includes(v.me.id))!,contract=mySide.ids.reduce((n,id)=>n+(v.bids[id]?.kind==='number'?v.bids[id]!.value:0),0);
 const taken=mySide.ids.reduce((n,id)=>n+((v.settings.failedNilCounts||v.bids[id]?.kind==='number')?v.won[id]!:0),0),needed=taken<contract;
 if(current&&v.partner===current.playerId&&v.bids[current.playerId]?.kind!=='number'&&!(v.settings.failedNilCounts&&v.won[current.playerId]!>0&&v.trick.length===3&&v.hand.length===2&&contract-taken>=2))return winning.length?low(winning):low(legal);
 if(current&&current.playerId!==v.me.id&&current.playerId!==v.partner&&v.bids[current.playerId]?.kind!=='number'&&losing.length)return high(losing);
 if(current?.playerId===v.partner)return losing.length?high(losing):low(legal);
 if(v.trick.length){if(needed&&winning.length)return skill==='sharp'?low(winning):high(winning);return losing.length?high(losing):low(legal);}
 if(!needed)return low(legal);
 if(skill==='normal')return high(legal);
 const seen=new Set([...v.hand,...v.completed.flatMap(t=>t.cards.map(p=>p.card)),...v.trick.map(p=>p.card)]);
 const guaranteed=legal.filter(card=>!deck.some(other=>!seen.has(other)&&suit(other)===suit(card)&&rank(other)>rank(card)));
 const normalGuaranteed=guaranteed.filter(c=>suit(c)!==3);if(normalGuaranteed.length)return low(normalGuaranteed);
 if(v.broken&&guaranteed.length)return low(guaranteed);
 const voids=v.completed.flatMap(t=>t.cards.filter(p=>suit(p.card)!==suit(t.cards[0]!.card)).map(p=>({id:p.playerId,color:suit(t.cards[0]!.card)})));
 const safe=legal.filter(card=>!voids.some(p=>p.id!==v.me.id&&p.id!==v.partner&&p.color===suit(card)));
 return high(safe.length?safe:legal);
}
/** Public/own projection is the complete information boundary, including blind decisions. */
export function fromView(v:PhoneView,rng:Rng,skill:BotSkill='normal'):Input|null{
 if(!v.inputType||v.inputType==='next')return null;
 if(v.inputType==='blind'){
  const own=v.sides.find(side=>side.ids.includes(v.me.id))!,top=Math.max(...v.sides.map(s=>s.score));
  const take=v.blindEligible&&(skill==='easy'?rng.chance(.03):skill==='sharp'&&top>=400&&top-own.score>=200&&rng.chance(.05));
  return take?{type:'blind-nil'}:{type:'look'};
 }
 if(v.inputType==='bid'){
  if(skill==='easy'&&rng.chance(.04)||skill!=='easy'&&nilSafe(v,skill))return {type:'nil'};
  const base=strength(v.hand,skill==='sharp'),noise=skill==='easy'?rng.int(-1,3):0;
  let value=Math.round(base+noise);const partner=v.partner?v.bids[v.partner]:null;
  if(skill==='sharp'&&partner?.kind==='number')value=Math.min(value,Math.max(1,v.tricksPerHand-partner.value-1));
  return {type:'bid',value:Math.max(1,Math.min(v.tricksPerHand,value))};
 }
 if(v.inputType==='exchange'){
  const nil=v.bids[v.me.id]?.kind!=='number',cards=skill==='easy'?rng.shuffle(v.hand):[...v.hand].sort((a,b)=>nil?danger(b)-danger(a):danger(a)-danger(b));
  return {type:'exchange',cards:cards.slice(0,2)};
 }
 return v.legal.length?{type:'play',card:play(v,rng,skill)}:null;
}
