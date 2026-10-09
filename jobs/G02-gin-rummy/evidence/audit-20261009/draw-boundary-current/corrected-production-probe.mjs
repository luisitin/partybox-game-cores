import assert from 'node:assert/strict';
import {game} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/dist/core.mjs';
import {minimizeDeadwood} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/dist/cards.mjs';
import {arranged} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/gin-cases.mjs';
import {rng,invariant,freeze} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/helpers.mjs';
const hand=[2,15,28,3,16,29,0,1,13,26],defender=[4,5,6,7,8,17,18,19,40,41];
const s=arranged(hand,defender,{},2,'draw');s.discard=[51,14];s.initialUpcard=19;s.publicLog=[19,41].map(card=>({player:'p1',action:'take-discard',card}));
const used=new Set([...hand,...defender,...s.discard]);s.stock=Array.from({length:52},(_,c)=>c).filter(c=>!used.has(c));s.stock=[39,...s.stock.filter(c=>c!==39)];invariant(s);
const frozen=JSON.stringify(s);freeze(s);const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');assert.equal(JSON.stringify(s),frozen);assert.equal(random.state().step,0);
function route(source){let n=game.reduce(s,{type:'input',playerId:'p0',input:{type:'draw',source},now:1});invariant(n);const action=game.bot.sampleInput(n,'p0',rng(7),'sharp');const own=minimizeDeadwood(n.hands.p0.filter(c=>c!==action.card));n=game.reduce(n,{type:'input',playerId:'p0',input:action,now:2});invariant(n);if(n.phase.id==='layoff'){n=game.reduce(n,{type:'input',playerId:'p1',input:{type:'finishLayoff'},now:3});invariant(n);}assert(n.roundResult);return {source,action,ownDeadwood:own.deadwood,result:n.roundResult,signed:n.roundResult.winner==='p0'?n.roundResult.points:-n.roundResult.points};}
const stock=route('stock'),pickup=route('discard');
console.log(JSON.stringify({acceptedHead:'e5423c811bc24cbed443f0d0e0e65947f67a8fe2',input,currentDeadwood:minimizeDeadwood(hand).deadwood,stock,pickup,signedStockAdvantage:stock.signed-pickup.signed,unchangedState:true,rngStep:random.state().step}));
assert.deepEqual(input,{type:'draw',source:'stock'});assert.equal(pickup.action.card,28);assert.equal(pickup.ownDeadwood,1);assert.equal(stock.ownDeadwood,0);assert(stock.signed>pickup.signed);

