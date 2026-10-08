import type { BotSkill } from '../../../contract/constants.js';
import type { Rng } from '../../../contract/rng.js';
import { deckFor, penalty, rank, suit, trickWinner } from './rules.js';
import type { Card, HeartsController, Input } from './types.js';

const highest = (cards: readonly Card[]): Card => cards.reduce((a,b) => rank(a) >= rank(b) ? a : b);
const lowest = (cards: readonly Card[]): Card => cards.reduce((a,b) => rank(a) <= rank(b) ? a : b);
function passRisk(card: Card, hand: readonly Card[], jack: boolean): number {
  if (jack && card === 22) return -30;
  if (card === 36) return 100;
  if (suit(card) === 2 && rank(card) >= 11) return 90 + rank(card);
  return rank(card) + (suit(card) === 3 ? 25 : 0) + (hand.filter(c=>suit(c)===suit(card)).length <= 3 ? 10 : 0);
}
function retainedDanger(hand: readonly Card[], jack: boolean): number {
  let total = 0;
  for (let color=0;color<4;color++) {
    const cards=hand.filter(c=>suit(c)===color).sort((a,b)=>rank(a)-rank(b));
    if (cards.length===0) { total-=2.5; continue; }
    cards.forEach((card,i) => {
      total+=0.05*(rank(card)+1)**2/(i+1);
      if (card===36) total+=13/(1+cards.filter(c=>rank(c)<10).length);
      if (color===2 && rank(card)>=11) total+=5/(1+cards.filter(c=>rank(c)<10).length);
      if (color===3) total+=(rank(card)+1)/12;
      if (jack && card===22) total-=4;
    });
  }
  return total;
}
function strongPass(view: HeartsController, rng: Rng): Card[] {
  const hand=rng.shuffle(view.hand);
  let best=Infinity; let chosen:Card[]=[];
  for (let a=0;a<hand.length-2;a++) for(let b=a+1;b<hand.length-1;b++) for(let c=b+1;c<hand.length;c++) {
    const rest=hand.filter((_,i)=>i!==a&&i!==b&&i!==c);
    const cost=retainedDanger(rest,view.settings.jack);
    if(cost<best){best=cost;chosen=[hand[a]!,hand[b]!,hand[c]!];}
  }
  return chosen.sort((a,b)=>a-b);
}
function mediumCard(view: HeartsController): Card {
  const legal=view.legal;
  const queenOut=!view.played.some(p=>p.card===36)&&!view.hand.includes(36);
  if(!view.trick.length) {
    const cost=(c:Card)=>c===36?100:suit(c)===2&&rank(c)>=11&&queenOut?90+rank(c):rank(c)+(suit(c)===3?4:0);
    return legal.reduce((a,b)=>cost(a)<=cost(b)?a:b);
  }
  const led=suit(view.trick[0]!.card);
  if(suit(legal[0]!)!==led) {
    if(legal.includes(36))return 36;
    const hearts=legal.filter(c=>suit(c)===3);
    if(hearts.length)return highest(hearts);
    const other=view.settings.jack?legal.filter(c=>c!==22):legal;
    return highest(other.length?other:legal);
  }
  const winner=trickWinner(view.trick)!;
  const top=rank(view.trick.find(p=>p.playerId===winner)!.card);
  const under=legal.filter(c=>rank(c)<top);
  if(under.length)return highest(under);
  const safe=legal.filter(c=>c!==36);
  const choices=safe.length?safe:legal;
  const last=view.trick.length===view.players.length-1;
  return last&&!view.trick.some(p=>penalty(p.card)>0)?highest(choices):lowest(choices);
}
/** Exact no-success probability for uniform sampling without replacement. */
function avoidProbability(total:number,success:number,draws:number):number {
  if(success<=0)return 1;
  if(total-success<draws)return 0;
  let p=1;
  for(let i=0;i<draws;i++)p*=(total-success-i)/(total-i);
  return p;
}
function strongCard(view: HeartsController): Card {
  const fallback=mediumCard(view);
  const legal=view.legal;
  const queenPlayed=view.played.some(p=>p.card===36);
  const jackPlayed=view.played.some(p=>p.card===22);
  const leader=view.trick[0];
  const led=leader?suit(leader.card):null;
  const current=leader?view.trick.find(p=>p.playerId===trickWinner(view.trick))!.card:null;
  const last=view.trick.length===view.players.length-1;
  const pointTotal=view.trick.reduce((n,p)=>n+penalty(p.card)-(view.settings.jack&&p.card===22?10:0),0);
  const moonThreat=view.players.find(p=>p.id!==view.me.id&&(view.takenPoints[p.id]??0)>=10&&view.players.every(q=>q.id===p.id||(view.takenPoints[q.id]??0)===0));
  if(led!==null&&suit(legal[0]!)!==led) {
    if(moonThreat && view.trick.some(p=>penalty(p.card)>0) && trickWinner(view.trick)===moonThreat.id) {
      const clean=legal.filter(c=>penalty(c)===0&&(!view.settings.jack||c!==22));
      if(clean.length)return highest(clean);
    }
    if(legal.includes(36))return 36;
    const danger=(c:Card)=>view.settings.jack&&c===22?-100:suit(c)===2&&rank(c)>=11&&!queenPlayed?40+rank(c):penalty(c)*10+rank(c);
    return legal.reduce((a,b)=>danger(a)>=danger(b)?a:b);
  }
  if(led!==null && last) {
    const wins=legal.filter(c=>rank(c)>rank(current!));
    if(wins.length&&(pointTotal<0||(moonThreat&&trickWinner(view.trick)===moonThreat.id&&pointTotal>0))) {
      const safe=wins.filter(c=>c!==36);
      if(safe.length)return highest(safe);
    }
    return fallback;
  }
  const seen=new Set([...view.hand,...view.played.map(p=>p.card)]);
  const unknown=deckFor(view.players.length,view.settings.threeDeck).filter(c=>!seen.has(c));
  const voids=new Map<string,Set<number>>(view.players.map(p=>[p.id,new Set<number>()]));
  // Public trick order reveals suit voids; no private hand is consulted.
  let first:Card|null=null; let n=0;
  for(const play of view.played) {
    if(n===0)first=play.card;
    else if(suit(play.card)!==suit(first!))voids.get(play.playerId)!.add(suit(first!));
    n=(n+1)%view.players.length;
  }
  const sent=new Set(view.sentCards??[]);
  const cost=(card:Card):number=>{
    const color=suit(card);
    if(card===36)return 100;
    const top=current===null?rank(card):Math.max(rank(card),rank(current));
    if(current!==null&&rank(card)<rank(current))return -rank(card)/20;
    let keeps=1; let exposure=penalty(card)+Math.max(0,pointTotal);
    for(const p of view.players) {
      if(p.id===view.me.id||view.trick.some(t=>t.playerId===p.id))continue;
      if(voids.get(p.id)!.has(color)){exposure+=2;continue;}
      const known=p.id===view.sentTo?[...sent].filter(c=>!view.played.some(t=>t.card===c)):[];
      const higher=unknown.filter(c=>suit(c)===color&&rank(c)>top).length;
      const lower=unknown.filter(c=>suit(c)===color&&rank(c)<top).length;
      const count=Math.min(unknown.length,view.handCounts[p.id]??0);
      const forced=known.some(c=>suit(c)===color&&rank(c)<top)?0:Math.max(0,avoidProbability(unknown.length,lower,count)-avoidProbability(unknown.length,lower+higher,count));
      keeps*=1-forced;
      const same=unknown.filter(c=>suit(c)===color).length;
      const voidChance=avoidProbability(unknown.length,same,count);
      exposure+=voidChance*(queenPlayed?1.5:4);
    }
    if(color===2&&rank(card)>=11&&!queenPlayed)exposure+=10;
    if(view.settings.jack&&!jackPlayed&&color===1)exposure-=1.5;
    const shedding=rank(card)/25+(view.hand.filter(c=>suit(c)===color).length===1?0.4:0);
    return keeps*exposure-shedding;
  };
  return legal.reduce((a,b)=>cost(a)<=cost(b)?a:b);
}
export function chooseBot(view: HeartsController,rng:Rng,skill:BotSkill):Input|null {
  if(view.paused||view.me.role!=='player')return null;
  if(view.phaseId==='pass'&&view.canPass&&view.actor===view.me.id) {
    if(skill==='sharp')return {type:'pass',cards:strongPass(view,rng)};
    const hand=rng.shuffle(view.hand);
    const cards=hand.sort((a,b)=>skill==='easy'?rank(b)-rank(a):passRisk(b,view.hand,view.settings.jack)-passRisk(a,view.hand,view.settings.jack)).slice(0,3).sort((a,b)=>a-b);
    return {type:'pass',cards};
  }
  if(view.phaseId!=='play'||view.actor!==view.me.id||!view.legal.length)return null;
  const card=skill==='easy'?lowest(view.legal):skill==='sharp'?strongCard(view):mediumCard(view);
  return {type:'play',card};
}
