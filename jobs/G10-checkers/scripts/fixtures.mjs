import {writeFile,mkdir} from 'node:fs/promises';
import {z} from 'zod';
import {game,init,reduce,tvView,controllerView,results} from '../dist/core.mjs';
import {stateSchema,endgameDataSchema} from '../dist/schema.mjs';
const players=[{id:'light',name:'Light',avatarId:'light',connected:true},{id:'dark',name:'Dark',avatarId:'dark',connected:true}];
const first=init({players,settings:{},seed:1,now:1000});
const done=reduce(first,{type:'input',playerId:'light',input:{type:'resign'},now:2000});
await mkdir('fixtures',{recursive:true});await mkdir('data',{recursive:true});
for(const state of [first,done]){
  stateSchema.parse(state);
  await writeFile('fixtures/'+state.phase.id+'.json',JSON.stringify(state,null,2)+'\n');
  await writeFile('fixtures/'+state.phase.id+'.views.json',JSON.stringify({tv:tvView(state),controllers:state.order.map(id=>controllerView(state,id)),results:results(state)},null,2)+'\n');
}
await writeFile('fixtures/schema.json',JSON.stringify(z.toJSONSchema(stateSchema),null,2)+'\n');
await writeFile('data/schema.json',JSON.stringify(z.toJSONSchema(endgameDataSchema),null,2)+'\n');
await writeFile('manifest.json',JSON.stringify(game.manifest,null,2)+'\n');
process.stdout.write('Two phase fixtures, projections, schemas and manifest generated.\n');
