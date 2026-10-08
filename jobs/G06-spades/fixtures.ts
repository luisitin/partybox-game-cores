import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {game,init,reduce,type State,type Input} from './core.ts';
import {context} from './runner.ts';
import {stateSchema} from './data-schema.ts';
const states=new Map<string,State>();let s=init(context(4,17,{blindGap:0})),firstBlind=false,steps=0;
const rngs=s.seats.map((_,i)=>createRng(121+i));
while(s.phase.id!=='done'&&steps++<100000){
 if(!states.has(s.phase.id)||s.phase.id==='hand')states.set(s.phase.id,s);
 let id='',input:Input|null=null;
 if(s.phase.id==='blind'){id=s.seats[s.turn]!;input=firstBlind?{type:'look'}:{type:'blind-nil'};firstBlind=true;}
 else for(let i=0;i<s.seats.length;i++){const a=game.bot.sampleInput(s,s.seats[i]!,rngs[i]!,'normal');if(a){id=s.seats[i]!;input=a;break;}}
 assert(input);s=reduce(s,{type:'input',playerId:id,input,now:s.phase.startedAt+1});
}
assert.equal(s.phase.id,'done');states.set('done',s);mkdirSync('fixtures',{recursive:true});
for(const phase of game.phases){const state=states.get(phase);assert(state,phase);stateSchema.parse(state);writeFileSync(`fixtures/${phase}.json`,JSON.stringify(state,null,2)+'\n');}
assert.deepEqual(states.get('hand')!.scores,s.scores);console.log('all seven valid phase fixtures; done follows the last scored-hand fixture');
