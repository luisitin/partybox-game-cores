import assert from 'node:assert/strict';
export const players=(ids=['light','dark'])=>ids.map((id,index)=>({id,name:index?'Dark':'Light',avatarId:'original-'+index,connected:true}));
export const context=(settings={},seed=1,ids)=>({players:players(ids),settings,seed,now:1000});
export function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;}
export function assertJson(value){const raw=JSON.stringify(value);assert(raw.length<=256*1024);assert.deepEqual(JSON.parse(raw),value);function visit(node){if(typeof node==='number')assert(Number.isFinite(node));if(node&&typeof node==='object')for(const child of Object.values(node))visit(child);}visit(value);}
export function positionState(core,board,variant='american',side=1,extra={}){
  const first=core.init(context({variant}));const key=`${variant}:${side}:${board.map(piece=>piece+2).join('')}`;
  return {...first,board:[...board],side,repetition:{[key]:1},quietPlies:0,ply:0,drawWindows:[],...extra};
}
