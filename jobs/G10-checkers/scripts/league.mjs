import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import * as core from '../dist/core.mjs';
const arg=name=>{const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:null;};
const games=Number(arg('--games')??2000),selected=arg('--variant'),variants=selected?[selected]:['american','international'];
assert(Number.isInteger(games)&&games>0&&games%2===0);assert(variants.every(value=>['american','international'].includes(value)));
const report={command:'node scripts/league.mjs'+process.argv.slice(2).map(value=>' '+value).join(''),gamesPerComparison:games,opening:'Standard starting board; paired identical seed with stronger side alternated. No outcome-based opening selection.',startAt:new Date().toISOString(),comparisons:[],botSourceSha256:createHash('sha256').update(await readFile('src/bots.ts')).digest('hex')};
for(const variant of variants)for(const [higher,lower] of [['sharp','normal'],['normal','easy']]){
  const beginning=performance.now(),transcript=createHash('sha256');let wins=0,draws=0,losses=0,moves=0,maximum=0;
  for(let n=0;n<games;n++){
    const seed=(0xC10B0700+(n>>1)+(variant==='international'?200000:0)+(higher==='normal'?100000:0))>>>0;
    const stronger=n%2===0?'light':'dark',skills=Object.fromEntries(['light','dark'].map(id=>[id,id===stronger?higher:lower]));
    const cursors={light:core.createRng(seed^0x11A1),dark:core.createRng(seed^0xD4A4)};
    let state=core.init({players:[{id:'light',name:'Light',avatarId:'light',connected:true,bot:true},{id:'dark',name:'Dark',avatarId:'dark',connected:true,bot:true}],settings:{variant},seed,now:1000});
    for(let ply=0;state.phase.id==='move'&&ply<2400;ply++){
      const id=core.turnId(state),input=core.sampleInput(state,id,cursors[id],skills[id]);assert(input&&core.inputSchema.safeParse(input).success);const next=core.reduce(state,{type:'input',playerId:id,input,now:2000+ply});assert.notEqual(next,state);state=next;moves++;
    }
    assert.equal(state.phase.id,'done','Active bots must reach a real terminal result');assert(core.results(state));maximum=Math.max(maximum,state.ply);
    if(state.winner===stronger)wins++;else if(state.winner===null)draws++;else losses++;
    transcript.update(JSON.stringify([variant,higher,lower,seed,stronger,state.winner,state.endReason,state.ply,state.board]));
    if((n+1)%100===0)process.stdout.write(JSON.stringify({variant,higher,lower,completed:n+1,wins,draws,losses,elapsedSeconds:Math.round((performance.now()-beginning)/1000)})+'\n');
  }
  const score=(wins+draws/2)/games,decisive=wins+losses,p=decisive?wins/decisive:0,z=1.96,denom=1+z*z/Math.max(1,decisive),center=(p+z*z/(2*Math.max(1,decisive)))/denom,margin=z*Math.sqrt((p*(1-p)+z*z/(4*Math.max(1,decisive)))/Math.max(1,decisive))/denom;
  const outcome={variant,higher,lower,games,wins,draws,losses,scoreShare:score,decisiveWinRate:p,decisiveWilson95:[center-margin,center+margin],moves,maximumPlies:maximum,elapsedSeconds:(performance.now()-beginning)/1000,transcriptSha256:transcript.digest('hex')};report.comparisons.push(outcome);process.stdout.write(JSON.stringify(outcome)+'\n');
}
await mkdir('evidence/checks',{recursive:true});const canonical=games===2000&&variants.length===2;await writeFile('evidence/checks/'+(canonical?'league':'league-smoke-'+games+(selected?'-'+selected:''))+'.json',JSON.stringify(report,null,2)+'\n');
if(canonical)for(const row of report.comparisons){assert(row.scoreShare>.55,JSON.stringify(row));assert(row.decisiveWilson95[0]>.5,'Stronger bot advantage must be clear in actual games');}
