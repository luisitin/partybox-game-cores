import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createRng, hashString } from '../../../../contract/rng';
import { game } from '../games/shake-up/server';
import { packFor } from '../games/shake-up/server/content';
import { solve } from '../games/shake-up/server/solver';
import { inputSchema, type Input, type State } from '../games/shake-up/server/types';
import { fire, input, room, T0 } from '../games/shake-up/__tests__/helpers';
type Skill='easy'|'normal'|'sharp';
const skills:Skill[]=['easy','normal','sharp'];
const out=new URL('./bot-study.json',import.meta.url);
function summarize(a:number[]) { const s=a.slice().sort((a,b)=>a-b); return { mean:a.reduce((x,y)=>x+y,0)/a.length,min:s[0],median:s[Math.floor(s.length/2)],p95:s[Math.ceil(s.length*.95)-1],max:s.at(-1) }; }
function play(seed:number,levels:Skill[],settings:Record<string,string|number>={rounds:3},lang='en') {
  let s=room(levels.length,settings,seed,{lang}),now=T0,events=0;
  for(let tick=1;tick<=6000&&s.phase.id!=='done';tick++) {
    now=T0+tick*1000;
    if(s.phase.deadline!==null&&now>=s.phase.deadline) {s=fire(s,now);events++;continue;}
    if(s.phase.id!=='hunt')continue;
    for(let p=0;p<levels.length;p++) {
      const id=s.order[p]!;const move=game.bot.sampleInput(s,id,createRng(hashString(`league:${seed}:${tick}:${id}`)),levels[p]);
      if(move){assert(inputSchema.safeParse(move).success);s=game.reduce(s,input(id,move,now));events++;}
    }
  }
  assert.equal(s.phase.id,'done');assert(now-T0<game.manifest.estimatedMinutes*3*60_000);
  return {s,events};
}
const calibration:unknown[]=[];
for(const lang of ['en','es'])for(const grid of ['4x4','5x5']) {
  const shares=Object.fromEntries(skills.map(s=>[s,[] as number[]])) as Record<Skill,number[]>;
  const counts=Object.fromEntries(skills.map(s=>[s,[] as number[]])) as Record<Skill,number[]>;
  let below=0;
  for(let k=1;k<=500;k++) {
    const seed=hashString(`bot-grid:${lang}:${grid}:${k}`);
    const base=fire(room(1,{grid,rounds:1,huntSeconds:'180'},seed,{lang}));
    const pack=packFor(base.cfg.lang,base.cfg.dictionary),blocked=new Set(pack.blocked);
    const full=solve(base.grid,base.cfg.size,pack.words,base.cfg.minLen).filter(f=>!blocked.has(f.w));
    const all=new Set(full.map(f=>f.w));
    let sharpCount=0;
    for(const skill of skills) {
      let s=base;
      for(let sec=1;sec<=180;sec++) {
        const move=game.bot.sampleInput(s,'p1',createRng(hashString(`calibration:${seed}:${sec}:${skill}`)),skill);
        if(move){assert(inputSchema.safeParse(move).success);s=game.reduce(s,input('p1',move,s.phase.startedAt+sec*1000));}
      }
      const found=(s.words.p1??[]).filter(e=>e.ok);assert(found.every(e=>all.has(e.w)));
      counts[skill].push(found.length);shares[skill].push(full.length?found.length/full.length:0);
      if(skill==='sharp')sharpCount=found.length;
    }
    if(sharpCount<full.length)below++;
  }
  const row={lang,grid,grids:500,clockSeconds:180,cadenceHz:1,sharpBelowFullSolver:below,levels:Object.fromEntries(skills.map(s=>[s,{found:summarize(counts[s]),foundShare:summarize(shares[s])}]))};
  calibration.push(row);console.log(JSON.stringify({calibration:row}));
}
const leagues:unknown[]=[];
for(const [better,worse] of [['sharp','normal'],['normal','easy']] as const) {
  let wins=0,losses=0,ties=0,totalBetter=0,totalWorse=0,events=0;
  for(let i=1;i<=2000;i++) {
    const swap=i%2===0,levels:Skill[]=swap?[worse,better]:[better,worse];
    const {s,events:n}=play(hashString(`strength:${better}:${worse}:${i}`),levels);events+=n;
    const a=s.scores[swap?'p2':'p1']!,b=s.scores[swap?'p1':'p2']!;totalBetter+=a;totalWorse+=b;
    if(a>b)wins++;else if(a<b)losses++;else ties++;
    if(i%500===0)console.log(JSON.stringify({league:`${better}/${worse}`,completed:i,wins,losses,ties}));
  }
  assert(wins/2000>.6,`${better} does not win clearly`);
  leagues.push({better,worse,games:2000,rounds:3,grid:'4x4',lang:'en',dictionary:'full',clockSeconds:180,cadenceHz:1,seatAlternated:true,wins,losses,ties,winRate:wins/2000,meanBetterScore:totalBetter/2000,meanWorseScore:totalWorse/2000,events});
}
const report={version:1,method:'Actual original reducer and seeded bot entry, 1 Hz clock. Found share against the unbounded family-mode solver on 2000 independent boards (500 each language/size). Leagues are complete default three-round games with alternating seats; ties count as non-wins.',calibrationGrids:2000,leagueGames:4000,calibration,leagues};
writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({report:'start/verification/bot-study.json',leagueGames:4000}));
