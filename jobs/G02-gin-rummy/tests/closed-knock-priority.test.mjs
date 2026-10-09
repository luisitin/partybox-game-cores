import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {discardSolutions,validMeld} from '../dist/cards.mjs';
import {bruteDefense} from './layoff-reference.mjs';
import {arranged,ginHand,lowDefender} from './gin-cases.mjs';
import {rng,invariant,freeze} from './helpers.mjs';

const hand=[2,15,28,41,3,16,29,0,1,13,14];
const defender=[4,5,6,17,18,19,30,31,32,27];
const rotate=(c,n)=>((Math.floor(c/13)+n)%4)*13+c%13;
const signed=r=>r.winner==='p0'?r.points:-r.points;
const fullKey=melds=>melds.map(m=>[...m].sort((a,b)=>a-b).join(',')).sort().join(';');
function fixture(settings={},count=2,rotation=0,hidden=defender,upcard=31){
 const s=arranged(hand.map(c=>rotate(c,rotation)),hidden.map(c=>rotate(c,rotation)),settings,count);
 s.initialUpcard=rotate(upcard,rotation);
 s.knockLimit=s.config.variant==='oklahoma'?upcard%13+1:10;
 s.multiplier=s.config.variant==='oklahoma'&&s.config.spadeDouble&&Math.floor(s.initialUpcard/13)===3?2:1;
 s.drawnDiscard=rotate(1,rotation);
 s.publicLog=[{player:'p1',action:'take-discard',card:rotate(27,rotation)},{player:'p1',action:'take-discard',card:rotate(31,rotation)},{player:'p0',action:'take-discard',card:s.drawnDiscard}];
 s.phase.deadline=s.config.turnSeconds?s.config.turnSeconds*1000:null;
 invariant(s);return s;
}
function finish(s,card){
 let n=game.reduce(s,{type:'input',playerId:'p0',input:{type:'discard',card,knock:true},now:1});invariant(n);assert.equal(n.phase.id,'layoff');
 n=game.reduce(n,{type:'input',playerId:'p1',input:{type:'finishLayoff'},now:2});invariant(n);assert(n.roundResult);return n.roundResult;
}
function liveTargets(s,melds){
 const own=new Set(s.hands.p0);
 return melds.filter(m=>Array.from({length:52},(_,c)=>c).some(c=>!own.has(c)&&validMeld([...m,c])));
}
test('Strong improves a finishing knock across different closed melds in every setting and suit',()=>{
 let cases=0,minGain=Infinity,maxGain=0;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const spadeDouble of [false,true])for(const bigGin of [false,true])for(const turnSeconds of [0,10])for(let rotation=0;rotation<4;rotation++)for(const upcard of [27,31]){
  const s=fixture({variant,bonusProfile,spadeDouble,bigGin,turnSeconds},count,rotation,defender,upcard),before=JSON.stringify(s);freeze(s);
  const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');
  assert.deepEqual(input,{type:'discard',card:rotate(14,rotation),knock:true});
  assert.equal(JSON.stringify(s),before);assert.equal(random.state().step,0);
  assert(game.controllerView(s,'p0').legal.some(x=>JSON.stringify(x)===JSON.stringify(input)));
  const improved=finish(s,input.card),old=finish(s,rotate(s.knockLimit===2?0:2,rotation));
  assert.equal(improved.knockerLayout.deadwood,1);assert.equal(old.knockerLayout.deadwood,s.knockLimit===2?2:6);
  assert.notEqual(fullKey(improved.knockerLayout.melds),fullKey(old.knockerLayout.melds));
  assert.equal(fullKey(liveTargets(s,improved.knockerLayout.melds)),fullKey(liveTargets(s,old.knockerLayout.melds)));
  assert.equal(improved.defenderLayout.deadwood,old.defenderLayout.deadwood);
  assert.equal(improved.kind,'knock');assert.equal(old.kind,'undercut');
  const gain=signed(improved)-signed(old);assert(gain>0);minGain=Math.min(minGain,gain);maxGain=Math.max(maxGain,gain);cases++;
 }
 assert.equal(cases,1152);console.log(JSON.stringify({suite:'closed-meld-knock-settings',cases,minGain,maxGain,classicSignedBefore:-14,classicSignedAfter:1}));
});
test('1000 identical public views keep the same safe choice and independent joint-defense score',()=>{
 const r=rng(791601),pool=Array.from({length:52},(_,i)=>i).filter(c=>!hand.includes(c)&&![27,31,51].includes(c));
 let reference=null,minGain=Infinity,maxGain=0,winningTransitions=0;
 for(let i=0;i<1000;i++){
  const hidden=[...r.shuffle(pool).slice(0,8),31,27],s=fixture({},2,0,hidden);
  const view=JSON.stringify(game.controllerView(s,'p0'));if(reference===null)reference=view;assert.equal(view,reference);
  const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');assert.deepEqual(input,{type:'discard',card:14,knock:true});assert.equal(random.state().step,0);
  const improved=finish(s,14),old=finish(s,2),a=bruteDefense(hidden,improved.knockerLayout.melds),b=bruteDefense(hidden,old.knockerLayout.melds);
  assert.equal(a,b);assert.equal(improved.defenderLayout.deadwood,a);assert.equal(old.defenderLayout.deadwood,b);
  for(const result of [improved,old]){
   const own=result.knockerLayout.deadwood,expected=(a>own?a-own:-(s.config.undercutBonus+own-a))*s.multiplier;
   assert.equal(signed(result),expected);
  }
  const gain=signed(improved)-signed(old);assert(gain>=5);minGain=Math.min(minGain,gain);maxGain=Math.max(maxGain,gain);
  if(old.kind==='undercut'&&improved.kind==='knock')winningTransitions++;
 }
 console.log(JSON.stringify({suite:'closed-meld-knock-independent-hidden-defenders',defenders:1000,publicViewsByteIdentical:true,minGain,maxGain,winningTransitions}));
});
test('closed-target dominance preserves forbidden returns, no-knock, Gin and inactive boundaries',()=>{
 let controls=0;
 for(const variant of ['standard','oklahoma'])for(const count of [2,3,4])for(let rotation=0;rotation<4;rotation++){
  const s=fixture({variant},count,rotation),other=structuredClone(s);other.drawnDiscard=rotate(14,rotation);
  other.publicLog.push({player:'p0',action:'take-discard',card:other.drawnDiscard});
  assert.deepEqual(game.bot.sampleInput(other,'p0',rng(7),'sharp'),{type:'discard',card:rotate(1,rotation),knock:true});controls++;
  const closed=structuredClone(s);closed.knockLimit=0;
  assert.deepEqual(game.bot.sampleInput(closed,'p0',rng(7),'sharp'),{type:'discard',card:rotate(2,rotation)});controls++;
  const paused=game.reduce(s,{type:'vip',action:'pause',now:1});assert.equal(game.bot.sampleInput(paused,'p0',rng(7),'sharp'),null);controls++;
  assert.equal(game.bot.sampleInput(s,'p1',rng(7),'sharp'),null);controls++;
  const gin=arranged(ginHand,lowDefender,{variant},count);assert.deepEqual(game.bot.sampleInput(gin,'p0',rng(7),'sharp'),{type:'discard',card:39,knock:true});controls++;
 }
 assert.equal(controls,120);console.log(JSON.stringify({suite:'closed-meld-knock-boundaries',controls}));
});
