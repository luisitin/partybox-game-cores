import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
import {minimizeDeadwood} from '../dist/cards.mjs';
import {bruteDeadwood} from './brute-reference.mjs';
import {rng,invariant,freeze} from './helpers.mjs';
import {arranged,ginHand,lowDefender,nonGinCases} from './gin-cases.mjs';

test('Strong takes guaranteed Gin despite public discard danger in every edition/profile/rotation',()=>{
 let cases=0;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const spadeDouble of [false,true])for(const bigGin of [false,true]){
  const s=arranged(ginHand,lowDefender,{variant,bonusProfile,spadeDouble,bigGin},count),before=JSON.stringify(s);
  freeze(s);const input=game.bot.sampleInput(s,'p0',rng(1),'sharp');
  assert.deepEqual(input,{type:'discard',card:39,knock:true});
  assert.equal(JSON.stringify(s),before);assert.equal(minimizeDeadwood(ginHand.filter(c=>c!==input.card)).deadwood,0);
  const result=game.reduce(s,{type:'input',playerId:'p0',input,now:1});invariant(result);
  assert.equal(result.roundResult.kind,'gin');assert.equal(result.roundResult.winner,'p0');
  const bonus=bonusProfile==='classic'?20:25;
  assert.equal(result.roundResult.points,(bonus+2)*s.multiplier);
  assert.deepEqual(result.roundResult.defenderLayout.laid,[]);cases++;
 }
 assert.equal(cases,72);console.log(JSON.stringify({suite:'strong-guaranteed-gin',cases,knownClassicPoints:22}));
});

test('actual Gin scoring dominates every legal ordinary knock against 1000 disjoint hidden defenders',()=>{
 const r=rng(139177),available=Array.from({length:52},(_,i)=>i).filter(c=>!ginHand.includes(c));
 const checksum=createHash('sha256');let ordinaryComparisons=0,minGain=Infinity;
 for(let i=0;i<1000;i++){
  const defender=r.shuffle(available).slice(0,10),bonusProfile=['classic','northAmerican','rubl'][i%3];
  const s=arranged(ginHand,defender,{variant:i%2?'standard':'oklahoma',bonusProfile,spadeDouble:!!(i%3)});
  const input=game.bot.sampleInput(s,'p0',rng(7),'sharp');
  assert.deepEqual(input,{type:'discard',card:39,knock:true});
  const gin=game.reduce(s,{type:'input',playerId:'p0',input,now:1});invariant(gin);
  const bonus=bonusProfile==='classic'?20:25,independent=bruteDeadwood(defender);
  assert.equal(gin.roundResult.kind,'gin');assert.equal(gin.roundResult.points,(bonus+independent)*s.multiplier);
  for(const alternative of game.controllerView(s,'p0').legal.filter(x=>x.type==='discard'&&x.knock&&x.card!==39)){
   if(minimizeDeadwood(ginHand.filter(c=>c!==alternative.card)).deadwood===0)continue;
   let normal=game.reduce(s,{type:'input',playerId:'p0',input:alternative,now:1});
   assert.equal(normal.phase.id,'layoff');
   normal=game.reduce(normal,{type:'input',playerId:normal.turn,input:{type:'finishLayoff'},now:2});invariant(normal);
   const signed=normal.roundResult.winner==='p0'?normal.roundResult.points:-normal.roundResult.points;
   const gain=gin.roundResult.points-signed;
   assert(gain>=bonus*s.multiplier,'positive Gin bonus and no layoffs must dominate the alternative');
   minGain=Math.min(minGain,gain);ordinaryComparisons++;
   checksum.update(JSON.stringify({i,alternative,gin:gin.roundResult.points,normal:normal.roundResult,gain})+'\n');
  }
 }
 assert(ordinaryComparisons>=1000);
 console.log(JSON.stringify({suite:'gin-actual-score-dominance',defenders:1000,ordinaryComparisons,minGain,sha256:checksum.digest('hex')}));
});

test('Gin priority respects immediate-return prohibition and preserves the existing Big Gin branch',()=>{
 let forbiddenCases=0,bigGinCases=0;
 for(let publicCard=0;publicCard<52;publicCard++){
  const s=arranged();s.drawnDiscard=39;s.publicLog=[{player:'p1',action:'take-discard',card:publicCard},{player:'p0',action:'take-discard',card:39}];
  const input=game.bot.sampleInput(s,'p0',rng(4),'sharp');assert.equal(input.type,'discard');assert.notEqual(input.card,39);
  assert(game.controllerView(s,'p0').legal.some(legal=>JSON.stringify(legal)===JSON.stringify(input)));
  assert.notEqual(game.reduce(s,{type:'input',playerId:'p0',input,now:1}),s);forbiddenCases++;
 }
 const eleven=[0,1,2,3,4,5,6,13,14,15,16],defender=[8,9,10,11,12,21,22,23,24,40];
 for(const bonusProfile of ['classic','northAmerican','rubl'])for(const bigGinBonus of ['31','50'])for(const variant of ['standard','oklahoma']){
  const s=arranged(eleven,defender,{bigGin:true,bigGinBonus,bonusProfile,variant});s.drawnDiscard=6;
  const input=game.bot.sampleInput(s,'p0',rng(6),'sharp');assert.deepEqual(input,{type:'bigGin'});
  const result=game.reduce(s,{type:'input',playerId:'p0',input,now:1});invariant(result);
  assert.equal(result.roundResult.kind,'bigGin');assert.equal(result.hands.p0.length,11);
  assert.equal(result.roundResult.points,(Number(bigGinBonus)+2)*s.multiplier);bigGinCases++;
 }
 assert.equal(forbiddenCases,52);assert.equal(bigGinCases,12);
 console.log(JSON.stringify({suite:'gin-policy-boundaries',forbiddenCases,bigGinCases}));
});

test('all 30000 non-Gin bot choices retain the accepted pre-repair behavior',async()=>{
 const baseline=JSON.parse(await readFile('evidence/audit-20261009/non-gin-policy-baseline.json','utf8'));
 const hash=createHash('sha256');let states=0,decisions=0;
 for(const {state,seed} of nonGinCases()){
  for(const skill of ['easy','normal','sharp']){
   hash.update(JSON.stringify(game.bot.sampleInput(state,'p0',rng(seed),skill))+'\n');decisions++;
  }states++;
 }
 assert.equal(states,baseline.states);assert.equal(decisions,baseline.decisions);
 assert.equal(hash.digest('hex'),baseline.inputJsonSha256);
 console.log(JSON.stringify({suite:'non-gin-policy-byte-equivalence',states,decisions,baselineHead:baseline.head}));
});
