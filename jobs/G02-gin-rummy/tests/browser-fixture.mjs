import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {initial,invariant} from './helpers.mjs';
export const declaredRuns=[[3,4,5],[16,17,18],[29,30,31]];
export function knockFixture(){
 const s=initial(7);s.turn='p0';s.dealer='p1';s.phase={id:'discard',startedAt:0,deadline:null};s.phaseClock=0;
 s.players.p0={...s.players.p0,bot:false,name:'Knocker'};s.players.p1={...s.players.p1,bot:false,name:'Defender'};
 s.hands={p0:[3,16,29,4,17,30,5,18,31,39,40],p1:[0,1,2,6,7,13,14,15,19,20]};
 s.discard=[26];s.initialUpcard=26;s.stock=Array.from({length:52},(_,i)=>i).filter(c=>!Object.values(s.hands).flat().includes(c)&&c!==26);
 s.drawnDiscard=null;s.mustStock=false;s.openingPasses=2;s.publicLog=[];invariant(s);return s;
}
export async function fixturePage(fixture,tag='knock-fixture'){
 assert(/^[a-z-]+$/.test(tag));invariant(fixture);await mkdir('.work',{recursive:true});
 const anchor="openFor=null;selected=null;$('setup').hidden=true;$('table').hidden=false;render();";
 const output=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',write:false,
  alias:{zod:resolve('node_modules/zod')},plugins:[{name:'initial-state-fixture-only',setup(build){
   build.onLoad({filter:/\/src\/browser\.ts$/},async args=>{
    const source=await readFile(args.path,'utf8');assert.equal(source.split(anchor).length,2,'fixture must change only the start-state anchor');
    return {contents:source.replace(anchor,()=>`state=${JSON.stringify(fixture)};\n  ${anchor}`),loader:'ts',resolveDir:dirname(args.path)};
   });
  }}]});
 const template=await readFile('src/play.template.html','utf8'),path=resolve('.work/'+tag+'.html');
 await writeFile(path,template.replace('/* INLINE_CORE */',()=>output.outputFiles[0].text.replaceAll('</script','<\\/script')));return path;
}
