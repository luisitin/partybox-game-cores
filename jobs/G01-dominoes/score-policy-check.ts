// Compare search rewards to the game's actual configured terminal scoring.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import * as old from './study-baseline.ts';
import * as production from './core.ts';
export function scoreAwareSource(source:string):string{
 const from=' const points=totals.reduce((n,v,i)=>n+(group(i)!==winning?v:0),0);';
 const to=` const opponents=totals.reduce((n,v,i)=>n+(group(i)!==winning?v:0),0);
 const own=totals.reduce((n,v,i)=>n+(group(i)===winning?v:0),0);
 const points=p.partners&&p.teamPoints==='all'?opponents+own:!p.partners&&empty<0&&p.blocked==='difference'?Math.max(0,opponents-own):opponents;`;
 assert(source.includes(from));return source.replace(from,to).replace('partners:boolean;stock?:number[];', "partners:boolean;blocked?:'difference'|'opponents';teamPoints?:'opponents'|'all';stock?:number[];").replace('partners:o.settings.partners,stock,reserve:o.settings.reserve','partners:o.settings.partners,blocked:o.settings.blocked,teamPoints:o.settings.teamPoints,stock,reserve:o.settings.reserve');
}
const path='./mutant-score-policy.ts';writeFileSync(path,scoreAwareSource(readFileSync('study-baseline.ts','utf8')));
try{
 const candidate:typeof old=await import(path);const rng=createRng(0x5C0AE);let oldMismatches=0,modelMismatches=0,productionMismatches=0;
 for(let k=0;k<10000;k++){
  const n=rng.int(2,4),blocked=k%2===0;const partners=n===4&&k%3===0;
  const s=production.init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true})),seed:k,now:0,settings:{mode:'block',partners,blocked:k%3?'difference':'opponents',teamPoints:k%5?'all':'opponents'}});
  const deck=rng.shuffle(production.allTiles());let offset=0;const out=rng.int(0,n-1);
  s.hands=Array.from({length:n},(_,i)=>{const size=!blocked&&i===out?0:rng.int(1,3);const h=deck.slice(offset,offset+size);offset+=size;return h;});
  const p={hands:s.hands,ends:[rng.int(0,6),rng.int(0,6)] as const,turn:0,passes:blocked?n:0,partners,blocked:s.settings.blocked,teamPoints:s.settings.teamPoints};
  const scored=production.scoreRound(s,blocked?null:out);const root=rng.int(0,n-1);
  const expected=scored!.winner===null?0:(production.team(s,root)===production.team(s,scored!.winner)?1:-1)*(100+scored!.points);
  if(old.utility(p,root)!==expected)oldMismatches++;
  if(candidate.utility(p,root)!==expected)modelMismatches++;
  if(production.utility(p,root)!==expected)productionMismatches++;
 }
 assert.equal(modelMismatches,0);if(process.argv.includes('--production'))assert.equal(productionMismatches,0);
 const report={seed:0x5C0AE,cases:10000,oldMismatches,modelMismatches,productionMismatches};writeFileSync('score-policy-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{unlinkSync(path);}
