import assert from 'node:assert/strict';
export function guardHost(source){
  const changes=[
    ["const show=(id:string,visible:boolean)=>{el(id).hidden=!visible;};", "const show=(id:string,visible:boolean)=>{const node=el(id);if(node.hidden!==!visible)node.hidden=!visible;};"],
    ["button.disabled=!enabled;button.setAttribute('aria-label','Square '+(index+1)+(piece?' · '+(piece>0?'light':'dark')+' '+(Math.abs(piece)===2?'king':'man'):' · empty')+(targets.has(index)?' · legal landing':''));", "if(button.disabled!==!enabled)button.disabled=!enabled;const label='Square '+(index+1)+(piece?' · '+(piece>0?'light':'dark')+' '+(Math.abs(piece)===2?'king':'man'):' · empty')+(targets.has(index)?' · legal landing':'');if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);"],
  ];
  for(const [before,after] of changes){assert.equal(source.split(before).length-1,1,'Unexpected original host shape');source=source.replace(before,after);}
  return source;
}
