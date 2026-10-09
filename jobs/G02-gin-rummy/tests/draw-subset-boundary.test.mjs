import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {arranged} from './gin-cases.mjs';
import {rng,invariant,freeze} from './helpers.mjs';
const hand=[2,15,28,3,16,29,0,1,13,26],defender=[4,5,6,7,8,17,18,19,40,41];
const rotate=(c,n)=>((Math.floor(c/13)+n)%4)*13+c%13;
function fixture(settings,count,rotation,stockCard){
 const s=arranged(hand.map(c=>rotate(c,rotation)),defender.map(c=>rotate(c,rotation)),settings,count,'draw');
 s.discard=[51,14].map(c=>rotate(c,rotation));s.initialUpcard=rotate(19,rotation);
 s.knockLimit=s.config.variant==='oklahoma'?7:10;
 s.multiplier=s.config.variant==='oklahoma'&&s.config.spadeDouble&&Math.floor(s.initialUpcard/13)===3?2:1;
 s.publicLog=[19,41].map(c=>({player:'p1',action:'take-discard',card:rotate(c,rotation)}));
 const used=new Set([...s.hands.p0,...s.hands.p1,...s.discard]),top=rotate(stockCard,rotation);
 s.stock=[top,...Array.from({length:52},(_,c)=>c).filter(c=>!used.has(c)&&c!==top)];
 s.phase.deadline=s.config.turnSeconds?s.config.turnSeconds*1000:null;invariant(s);return s;
}
function route(s,source){
 let n=game.reduce(s,{type:'input',playerId:'p0',input:{type:'draw',source},now:1});invariant(n);
 const action=game.bot.sampleInput(n,'p0',rng(7),'sharp');assert(n.phase.id==='discard');
 n=game.reduce(n,{type:'input',playerId:'p0',input:action,now:2});invariant(n);
 if(n.phase.id==='layoff'){n=game.reduce(n,{type:'input',playerId:'p1',input:{type:'finishLayoff'},now:3});invariant(n);}
 assert(n.roundResult);return {action,result:n.roundResult,signed:n.roundResult.winner==='p0'?n.roundResult.points:-n.roundResult.points};
}
test('draw evaluation retains public-information policy when finishing-subset pickup trades a larger hidden Gin for a small knock',()=>{
 let cases=0,minGinAdvantage=Infinity,maxGinAdvantage=0,minMissAdvantage=Infinity;
 for(const variant of ['standard','oklahoma'])for(const bonusProfile of ['classic','northAmerican','rubl'])for(const count of [2,3,4])for(const spadeDouble of [false,true])for(const bigGin of [false,true])for(const turnSeconds of [0,10])for(let rotation=0;rotation<4;rotation++){
  const settings={variant,bonusProfile,spadeDouble,bigGin,turnSeconds},gin=fixture(settings,count,rotation,39),miss=fixture(settings,count,rotation,9);
  assert.equal(JSON.stringify(game.controllerView(gin,'p0')),JSON.stringify(game.controllerView(miss,'p0')));
  for(const s of [gin,miss]){
   const before=JSON.stringify(s);freeze(s);const random=rng(7);
   assert.deepEqual(game.bot.sampleInput(s,'p0',random,'sharp'),{type:'draw',source:'stock'});
   assert.equal(random.state().step,0);assert.equal(JSON.stringify(s),before);
  }
  const g=route(gin,'stock'),m=route(miss,'stock'),p=route(gin,'discard'),q=route(miss,'discard');
  assert.deepEqual(p,q);assert.equal(g.result.kind,'gin');assert.equal(g.result.knockerLayout.deadwood,0);
  assert.equal(m.result.kind,'undercut');assert.equal(m.result.knockerLayout.deadwood,2);
  assert.equal(p.result.kind,'knock');assert.equal(p.result.knockerLayout.deadwood,1);
  assert.equal(p.action.card,rotate(28,rotation));assert.equal(p.signed,4*gin.multiplier);
  assert.equal(g.signed,(gin.config.ginBonus+5)*gin.multiplier);
  assert.equal(m.signed,-gin.config.undercutBonus*gin.multiplier);
  const ginAdvantage=g.signed-p.signed,missAdvantage=p.signed-m.signed;
  assert(ginAdvantage>0&&missAdvantage>0);minGinAdvantage=Math.min(minGinAdvantage,ginAdvantage);maxGinAdvantage=Math.max(maxGinAdvantage,ginAdvantage);minMissAdvantage=Math.min(minMissAdvantage,missAdvantage);cases++;
 }
 assert.equal(cases,576);console.log(JSON.stringify({suite:'draw-subset-public-information-boundary',pairedIdenticalPublicViews:cases,productionDrawChoices:cases*2,minGinAdvantage,maxGinAdvantage,minMissAdvantage,classicGin:25,classicPickup:4,classicStockMiss:-10}));
});

