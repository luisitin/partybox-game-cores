import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {validMeld} from '../dist/cards.mjs';
import {bruteDefense} from './layoff-reference.mjs';
import {arranged,ginHand,lowDefender} from './gin-cases.mjs';
import {rng,invariant,freeze} from './helpers.mjs';
const hand=[2,15,28,3,16,29,0,1,13,14,26],defender=[4,5,6,7,8,17,18,19,40,41];
const rotate=(c,n)=>((Math.floor(c/13)+n)%4)*13+c%13;
const signed=r=>r.winner==='p0'?r.points:-r.points;
function fixture(settings={},count=2,rotation=0,hidden=defender,upcard=19){
 const s=arranged(hand.map(c=>rotate(c,rotation)),hidden.map(c=>rotate(c,rotation)),settings,count);s.discard=[rotate(51,rotation)];
 const used=new Set([...s.hands.p0,...s.hands.p1,...s.discard]);s.stock=Array.from({length:52},(_,c)=>c).filter(c=>!used.has(c));
 s.initialUpcard=rotate(upcard,rotation);s.knockLimit=s.config.variant==='oklahoma'?upcard%13+1:10;
 s.multiplier=s.config.variant==='oklahoma'&&s.config.spadeDouble&&Math.floor(s.initialUpcard/13)===3?2:1;
 s.publicLog=[upcard,41].map(c=>({player:'p1',action:'take-discard',card:rotate(c,rotation)}));s.phase.deadline=s.config.turnSeconds?s.config.turnSeconds*1000:null;invariant(s);return s;
}
function finish(s,card){let n=game.reduce(s,{type:'input',playerId:'p0',input:{type:'discard',card,knock:true},now:1});invariant(n);assert.equal(n.phase.id,'layoff');n=game.reduce(n,{type:'input',playerId:'p1',input:{type:'finishLayoff'},now:2});invariant(n);assert(n.roundResult);return n.roundResult;}
function liveTargets(s,melds){const unavailable=new Set([...s.hands.p0,...s.discard]);return melds.filter(m=>Array.from({length:52},(_,c)=>c).some(c=>!unavailable.has(c)&&validMeld([...m,c]))).map(m=>[...m].sort((a,b)=>a-b).join(',')).sort();}
test('Strong removes strictly unnecessary finishing layoff targets across every setting and suit',()=>{
 let cases=0,minGain=Infinity,maxGain=0;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const spadeDouble of [false,true])for(const bigGin of [false,true])for(const turnSeconds of [0,10])for(let rotation=0;rotation<4;rotation++)for(const upcard of [8,19]){
  const s=fixture({variant,bonusProfile,spadeDouble,bigGin,turnSeconds},count,rotation,defender,upcard),before=JSON.stringify(s);freeze(s);const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');
  assert.deepEqual(input,{type:'discard',card:rotate(28,rotation),knock:true});assert.equal(JSON.stringify(s),before);assert.equal(random.state().step,0);assert(game.controllerView(s,'p0').legal.some(x=>JSON.stringify(x)===JSON.stringify(input)));
  const improved=finish(s,input.card),old=finish(s,rotate(1,rotation)),a=liveTargets(s,improved.knockerLayout.melds),b=liveTargets(s,old.knockerLayout.melds);
  assert.equal(improved.knockerLayout.deadwood,1);assert.equal(old.knockerLayout.deadwood,2);assert(a.length<b.length&&a.every(k=>b.includes(k)));assert.equal(improved.defenderLayout.deadwood,5);assert.equal(old.defenderLayout.deadwood,2);assert.equal(improved.kind,'knock');assert.equal(old.kind,'undercut');
  const gain=signed(improved)-signed(old);assert(gain>0);minGain=Math.min(minGain,gain);maxGain=Math.max(maxGain,gain);cases++;
 }
 assert.equal(cases,1152);console.log(JSON.stringify({suite:'subset-finishing-knock-settings',cases,minGain,maxGain,classicSignedBefore:-10,classicSignedAfter:4}));
});
test('1000 identical public views prove defender opportunity inclusion with independent joint-defense scoring',()=>{
 const r=rng(792601),pool=Array.from({length:52},(_,c)=>c).filter(c=>!hand.includes(c)&&![19,41,51].includes(c));let reference=null,minGain=Infinity,maxGain=0,winningTransitions=0,strictDefenseImprovements=0;
 for(let i=0;i<1000;i++){
  const hidden=[...r.shuffle(pool).slice(0,8),19,41],s=fixture({},2,0,hidden),view=JSON.stringify(game.controllerView(s,'p0'));if(reference===null)reference=view;assert.equal(view,reference);
  const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');assert.deepEqual(input,{type:'discard',card:28,knock:true});assert.equal(random.state().step,0);
  const improved=finish(s,28),old=finish(s,1),a=bruteDefense(hidden,improved.knockerLayout.melds),b=bruteDefense(hidden,old.knockerLayout.melds);assert(a>=b);assert.equal(improved.defenderLayout.deadwood,a);assert.equal(old.defenderLayout.deadwood,b);
  for(const result of [improved,old]){const own=result.knockerLayout.deadwood,def=result===improved?a:b,expected=(def>own?def-own:-(s.config.undercutBonus+own-def))*s.multiplier;assert.equal(signed(result),expected);}
  const gain=signed(improved)-signed(old);assert(gain>=1);minGain=Math.min(minGain,gain);maxGain=Math.max(maxGain,gain);if(a>b)strictDefenseImprovements++;if(old.kind==='undercut'&&improved.kind==='knock')winningTransitions++;
 }
 console.log(JSON.stringify({suite:'subset-finishing-knock-independent-hidden-defenders',defenders:1000,publicViewsByteIdentical:true,minGain,maxGain,winningTransitions,strictDefenseImprovements}));
});
test('subset finishing preserves incomparable layouts, public uncertainty, forbidden discards, other skills and non-finishing boundaries',()=>{
 let controls=0;
 for(const variant of ['standard','oklahoma'])for(const count of [2,3,4])for(let rotation=0;rotation<4;rotation++){
  const s=fixture({variant},count,rotation),forbidden=structuredClone(s);forbidden.drawnDiscard=rotate(28,rotation);forbidden.publicLog.push({player:'p0',action:'take-discard',card:forbidden.drawnDiscard});assert.deepEqual(game.bot.sampleInput(forbidden,'p0',rng(7),'sharp'),{type:'discard',card:rotate(1,rotation),knock:true});controls++;
  const noKnock=structuredClone(s);noKnock.knockLimit=0;assert.deepEqual(game.bot.sampleInput(noKnock,'p0',rng(7),'sharp'),{type:'discard',card:rotate(1,rotation)});controls++;
  const paused=game.reduce(s,{type:'vip',action:'pause',now:1});assert.equal(game.bot.sampleInput(paused,'p0',rng(7),'sharp'),null);controls++;assert.equal(game.bot.sampleInput(s,'p1',rng(7),'sharp'),null);controls++;
  const incomparable=structuredClone(s);incomparable.publicLog.push({player:'p1',action:'take-discard',card:rotate(40,rotation)});assert.deepEqual(game.bot.sampleInput(incomparable,'p0',rng(7),'sharp'),{type:'discard',card:rotate(29,rotation),knock:true});controls++;
  const unobserved=structuredClone(s);unobserved.publicLog=unobserved.publicLog.filter(x=>x.card!==rotate(41,rotation));assert.deepEqual(game.bot.sampleInput(unobserved,'p0',rng(7),'sharp'),{type:'discard',card:rotate(28,rotation),knock:true});controls++;
  for(const skill of ['easy','normal']){assert.deepEqual(game.bot.sampleInput(s,'p0',rng(7),skill),{type:'discard',card:rotate(28,rotation),knock:true});controls++;}
  const gin=arranged(ginHand,lowDefender,{variant},count);assert.deepEqual(game.bot.sampleInput(gin,'p0',rng(7),'sharp'),{type:'discard',card:39,knock:true});controls++;
 }
 assert.equal(controls,216);console.log(JSON.stringify({suite:'subset-finishing-knock-boundaries',controls}));
});
