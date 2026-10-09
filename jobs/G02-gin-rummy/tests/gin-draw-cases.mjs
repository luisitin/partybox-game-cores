import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {rank,suit,value} from '../dist/cards.mjs';
import {initial,invariant} from './helpers.mjs';

// Valid complete-deck starting fixtures; draw-phase fixtures below are reached
// only through actual legal production events, including retained pickup bans.
export function ginOpening(suitIndex=0,endpoint='high',settings={},count=2){
 const s=initial(1,count,settings),offset=13*suitIndex;
 const hand=Array.from({length:10},(_,i)=>offset+i+(endpoint==='low'?1:0));
 const top=offset+(endpoint==='low'?0:10);
 const remaining=Array.from({length:52},(_,i)=>i).filter(c=>!hand.includes(c)&&c!==top);
 const defender=remaining.slice(9,19);
 s.dealer='p1';s.turn='p0';s.phaseClock=0;
 s.phase={id:'upcard',startedAt:0,deadline:s.config.turnSeconds?s.config.turnSeconds*1000:null};
 s.hands={...s.hands,p0:hand,p1:defender};s.discard=[top];
 s.stock=remaining.filter(c=>!defender.includes(c));s.initialUpcard=top;
 s.knockLimit=s.config.variant==='oklahoma'?(rank(top)===1&&s.config.aceGin?0:value(top)):10;
 s.multiplier=s.config.variant==='oklahoma'&&s.config.spadeDouble&&suit(top)===3?2:1;
 s.openingPasses=0;s.mustStock=false;s.drawnDiscard=null;
 s.pending=null;s.roundResult=null;s.publicLog=[];invariant(s);
 return s;
}
export function step(s,input,now){
 const before=s,next=game.reduce(s,{type:'input',playerId:s.turn,input,now});
 assert.notEqual(next,before,'fixture transition must be legal');invariant(next);return next;
}
export function normalGinDraw(s){
 const top=s.initialUpcard,defenderDiscard=s.hands.p1[0];
 let next=step(s,{type:'pass'},1);
 next=step(next,{type:'draw',source:'discard'},2);
 next=step(next,{type:'discard',card:defenderDiscard},3);
 const firstStock=next.stock[0];next=step(next,{type:'draw',source:'stock'},4);
 next=step(next,{type:'discard',card:firstStock},5);
 next=step(next,{type:'draw',source:'stock'},6);
 next=step(next,{type:'discard',card:top},7);
 assert.equal(next.phase.id,'draw');assert.equal(next.turn,'p0');
 assert.equal(next.mustStock,false);assert.equal(next.discard.at(-1),top);
 return next;
}
