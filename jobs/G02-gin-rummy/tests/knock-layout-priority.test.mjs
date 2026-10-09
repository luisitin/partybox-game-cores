import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
import {minimizeDeadwood} from '../dist/cards.mjs';
import {bruteDefense} from './layoff-reference.mjs';
import {rng,invariant,freeze} from './helpers.mjs';
import {arranged,ginHand,lowDefender} from './gin-cases.mjs';

const hand=[2,3,4,15,16,17,28,29,30,13,40];
const defender=[8,9,10,11,12,21,22,23,24,41];
const rotate=(c,n)=>((Math.floor(c/13)+n)%4)*13+c%13;
const meldsKey=melds=>melds.map(m=>[...m].sort((a,b)=>a-b).join(',')).sort().join(';');
function fixture(settings={},count=2,rotation=0,hidden=defender){
 const s=arranged(hand.map(c=>rotate(c,rotation)),hidden.map(c=>rotate(c,rotation)),settings,count);
 s.phase.deadline=s.config.turnSeconds?s.config.turnSeconds*1000:null;
 return s;
}
function finish(s,input){
 let next=game.reduce(s,{type:'input',playerId:'p0',input,now:1});invariant(next);
 assert.equal(next.phase.id,'layoff');
 next=game.reduce(next,{type:'input',playerId:next.turn,input:{type:'finishLayoff'},now:2});invariant(next);
 assert(next.roundResult);return next.roundResult;
}
const signed=result=>result.winner==='p0'?result.points:-result.points;

test('Strong takes the strictly better same-meld knock in all editions, profiles, rosters and suits',()=>{
 let cases=0,minGain=Infinity;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const spadeDouble of [false,true])for(const bigGin of [false,true])for(const turnSeconds of [0,10])for(let rotation=0;rotation<4;rotation++){
  const s=fixture({variant,bonusProfile,spadeDouble,bigGin,turnSeconds},count,rotation),before=JSON.stringify(s);freeze(s);
  const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');
  assert.deepEqual(input,{type:'discard',card:rotate(40,rotation),knock:true});
  assert.equal(JSON.stringify(s),before);assert.equal(random.state().step,0);
  assert(game.controllerView(s,'p0').legal.some(x=>JSON.stringify(x)===JSON.stringify(input)));
  const improved=finish(s,input),prior=finish(s,{type:'discard',card:rotate(13,rotation),knock:true});
  assert.equal(improved.knockerLayout.deadwood,1);assert.equal(prior.knockerLayout.deadwood,2);
  assert.equal(meldsKey(improved.knockerLayout.melds),meldsKey(prior.knockerLayout.melds));
  assert.equal(improved.defenderLayout.deadwood,prior.defenderLayout.deadwood);
  const gain=signed(improved)-signed(prior);assert.equal(gain,s.multiplier);minGain=Math.min(minGain,gain);cases++;
 }
 assert.equal(cases,576);console.log(JSON.stringify({suite:'same-meld-knock-configurations',cases,minGain,classicPointsBefore:1,classicPointsAfter:2}));
});

test('the same public decision dominates against 1000 hidden defenders with independent joint layoff scoring',()=>{
 const r=rng(790319),available=Array.from({length:52},(_,i)=>i).filter(c=>!hand.includes(c)&&c!==41),checksum=createHash('sha256');
 let minGain=Infinity,maxGain=0,positiveKnocks=0,undercuts=0;
 for(let i=0;i<1000;i++){
  const hidden=[...r.shuffle(available).slice(0,9),41];
  const s=fixture({variant:i%2?'standard':'oklahoma',bonusProfile:['classic','northAmerican','rubl'][i%3],spadeDouble:!!(i%3)},2+i%3,0,hidden);
  const input=game.bot.sampleInput(s,'p0',rng(i+1),'sharp');assert.deepEqual(input,{type:'discard',card:40,knock:true});
  const improved=finish(s,input),prior=finish(s,{type:'discard',card:13,knock:true});
  const targetKey=meldsKey(improved.knockerLayout.melds);assert.equal(targetKey,meldsKey(prior.knockerLayout.melds));
  const independent=bruteDefense(hidden,improved.knockerLayout.melds);
  for(const result of [improved,prior]){
   assert.equal(result.defenderLayout.deadwood,independent);
   const own=result.knockerLayout.deadwood,expected=(independent>own?independent-own:-(s.config.undercutBonus+own-independent))*s.multiplier;
   assert.equal(signed(result),expected);
  }
  const gain=signed(improved)-signed(prior);assert(gain>=s.multiplier);minGain=Math.min(minGain,gain);maxGain=Math.max(maxGain,gain);
  if(improved.kind==='undercut')undercuts++;else positiveKnocks++;
  checksum.update(JSON.stringify({i,hidden,input,independent,priorSigned:signed(prior),improvedSigned:signed(improved),gain})+'\n');
 }
 assert.equal(positiveKnocks+undercuts,1000);
 console.log(JSON.stringify({suite:'same-meld-knock-hidden-defenders',defenders:1000,minGain,maxGain,positiveKnocks,undercuts,sha256:checksum.digest('hex')}));
});

test('ordinary-knock priority retains immediate-return, Gin, no-knock and unavailable-player boundaries',()=>{
 let controls=0;
 for(const variant of ['standard','oklahoma'])for(const count of [2,3,4])for(let rotation=0;rotation<4;rotation++){
  const s=fixture({variant},count,rotation),forbidden=structuredClone(s);forbidden.drawnDiscard=rotate(40,rotation);
  forbidden.publicLog.push({player:'p0',action:'take-discard',card:forbidden.drawnDiscard});
  assert.deepEqual(game.bot.sampleInput(forbidden,'p0',rng(7),'sharp'),{type:'discard',card:rotate(13,rotation),knock:true});controls++;
  const closed=structuredClone(s);closed.knockLimit=0;
  assert.deepEqual(game.bot.sampleInput(closed,'p0',rng(7),'sharp'),{type:'discard',card:rotate(13,rotation)});controls++;
  const paused=game.reduce(s,{type:'vip',action:'pause',now:1});assert.equal(game.bot.sampleInput(paused,'p0',rng(7),'sharp'),null);controls++;
  assert.equal(game.bot.sampleInput(s,'p1',rng(7),'sharp'),null);controls++;
  const gin=arranged(ginHand,lowDefender,{variant},count);assert.deepEqual(game.bot.sampleInput(gin,'p0',rng(7),'sharp'),{type:'discard',card:39,knock:true});controls++;
 }
 assert.equal(controls,120);console.log(JSON.stringify({suite:'same-meld-knock-boundaries',controls}));
});

test('same-meld lower deadwood improves both undercuts and the transition from undercut to winning knock',()=>{
 const completions=[
  {deadwood:0,cards:[42,43,8,9,10,21,22,23,1,41]},
  {deadwood:1,cards:[42,43,8,9,10,21,22,23,0,41]},
  {deadwood:2,cards:[42,43,44,8,9,10,11,0,26,41]},
  {deadwood:3,cards:defender}
 ];
 let cases=0,minGain=Infinity,maxGain=0,winningTransitions=0;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const spadeDouble of [false,true])for(const completion of completions){
  const s=fixture({variant,bonusProfile,spadeDouble},count,0,completion.cards),input=game.bot.sampleInput(s,'p0',rng(7),'sharp');
  assert.deepEqual(input,{type:'discard',card:40,knock:true});
  const improved=finish(s,input),prior=finish(s,{type:'discard',card:13,knock:true});
  assert.equal(meldsKey(improved.knockerLayout.melds),meldsKey(prior.knockerLayout.melds));
  assert.equal(bruteDefense(completion.cards,improved.knockerLayout.melds),completion.deadwood);
  assert.equal(improved.defenderLayout.deadwood,completion.deadwood);assert.equal(prior.defenderLayout.deadwood,completion.deadwood);
  const gain=signed(improved)-signed(prior);
  if(completion.deadwood===2){assert.equal(prior.kind,'undercut');assert.equal(improved.kind,'knock');assert.equal(gain,(s.config.undercutBonus+1)*s.multiplier);winningTransitions++;}
  else assert.equal(gain,s.multiplier);
  minGain=Math.min(minGain,gain);maxGain=Math.max(maxGain,gain);cases++;
 }
 assert.equal(cases,144);assert.equal(winningTransitions,36);
 console.log(JSON.stringify({suite:'same-meld-knock-score-boundaries',cases,winningTransitions,minGain,maxGain,defenderDeadwoods:[0,1,2,3]}));
});
