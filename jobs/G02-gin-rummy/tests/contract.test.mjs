import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from '../dist/core.mjs';
import {initial,rng,invariant,play,freeze} from './helpers.mjs';
test('1000 finished seeded bot games at EACH valid count/edition, hash replay after EVERY event',()=>{
 for(const variant of ['standard','oklahoma'])for(const count of [2,3,4]) {
  let totalEvents=0,maxEvents=0,replayChecks=0;
  for(let seed=1;seed<=1000;seed++){
   const a=play(seed,count,['sharp','normal','easy','normal'],{variant},seed<=3,true);
   assert.equal(a.replayChecks,a.steps);totalEvents+=a.steps;replayChecks+=a.replayChecks;maxEvents=Math.max(maxEvents,a.steps);
  }
  console.log(JSON.stringify({suite:'bot-contract',variant,players:count,games:1000,replays:1000,totalEvents,maxEvents,replayChecks,comparison:'every-event SHA256 and bytes; JSON-roundtrip replay'}));
 }
});
test('property seeds 1,2,3 plus 1000 random seeds: adversarial event sequences and immutability',()=>{
 const generator=rng(332299);const seeds=[1,2,3,...Array.from({length:1000},()=>generator.int(0,0xffffffff))];
 let events=0;
 for(const seed of seeds){let s=initial(seed,seed%3+2),r=rng(seed),now=0;
  for(let i=0;i<60;i++) {
   invariant(s);freeze(s);const before=JSON.stringify(s);
   for(const id of ['watcher','__proto__','constructor']) {
    assert.doesNotThrow(()=>game.tvView(s));assert.doesNotThrow(()=>game.controllerView(s,id));
    assert.equal(game.reduce(s,{type:'input',playerId:id,now:++now,input:{type:'pass'}}),s);events++;
   }
   for(const e of [{type:'timer',phaseId:s.phase.id,startedAt:-1,now:++now},{type:'speech',key:'noop',ms:100,now:++now},{type:'speechStart',key:'noop',now:++now}]){
    assert.equal(game.reduce(s,e),s);events++;
   }
   const input=game.bot.sampleInput(s,s.turn,r,'sharp');if(!input)break;
   assert(game.inputSchema.safeParse(input).success);const next=game.reduce(s,{type:'input',playerId:s.turn,input,now:++now});events++;
   assert.equal(JSON.stringify(s),before);s=next;
   const view=game.controllerView(s,s.turn);assert.deepEqual(JSON.parse(JSON.stringify(view)),view);
   if(s.finished)break;
  }
 }console.log(JSON.stringify({suite:'properties',seeds:seeds.length,events}));
});
test('hidden-card/order perturbations never change TV, another controller or bot decisions',()=>{
 let comparisons=0;
 for(let seed=1;seed<=1000;seed++) {
  let s=initial(seed,seed%3+2),r=rng(seed);
  for(let k=0;k<8;k++){
   if(['layoff','round-end','done'].includes(s.phase.id))break;
   const viewer=s.turn,opp=s.active.find(id=>id!==viewer),changed=structuredClone(s);
   [changed.hands[opp][0],changed.stock[0]]=[changed.stock[0],changed.hands[opp][0]];
   changed.stock.reverse();changed.rng={seed:seed^0x12345678,step:700};
   assert.deepEqual(game.tvView(changed),game.tvView(s));
   assert.deepEqual(game.controllerView(changed,viewer),game.controllerView(s,viewer));
   for(const id of [...s.waiting,'spectator','__proto__'])assert.deepEqual(game.controllerView(changed,id),game.controllerView(s,id));
   for(const skill of ['easy','normal','sharp'])assert.deepEqual(game.bot.sampleInput(changed,viewer,rng(77),skill),game.bot.sampleInput(s,viewer,rng(77),skill));
   const own=game.controllerView(s,viewer),other=game.controllerView(s,opp);
   assert.deepEqual(own.handCards,s.hands[viewer]);assert.deepEqual(other.handCards,s.hands[opp]);
   assert(!Object.hasOwn(own,'stock'));assert(!Object.hasOwn(own,'rng'));assert(!Object.hasOwn(own,'hands'));
   const input=game.bot.sampleInput(s,viewer,r,'normal');s=game.reduce(s,{type:'input',now:k+1,playerId:viewer,input});comparisons++;
  }
 }console.log(JSON.stringify({suite:'secrecy',comparisons}));
});
test('idle/no-clock matches remain until explicit end, every phase can exit via VIP',()=>{
 let s=initial(5),now=0;
 for(let i=0;i<100;i++){assert.equal(game.reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:10000000+i}),s);}
 const phases=new Set([s.phase.id]);
 for(let i=0;i<10000&&!s.finished;i++){s=game.reduce(s,{type:'vip',action:'skip',now:++now});phases.add(s.phase.id);}
 assert(s.finished);assert(game.results(s));assert(phases.has('discard'));assert(phases.has('draw'));assert(phases.has('done'));
 const ended=game.reduce(initial(5),{type:'vip',action:'end',now:5});assert(game.results(ended));
});
