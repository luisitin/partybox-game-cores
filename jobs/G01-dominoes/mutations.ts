import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const source=readFileSync('core.ts','utf8');
const mutations:[string,string,string][]=[
 ['allow negative tile IDs','.int().min(0).max(27)','.int().min(-1).max(27)'],
 ['allow tile 28','.int().min(0).max(27)','.int().min(0).max(28)'],
 ['accept extra pass fields',"z.object({type:z.literal('pass')}).strict()","z.object({type:z.literal('pass')}).passthrough()"],
 ['deal six instead of seven','s.settings.partners?7:','s.settings.partners?6:'],
 ['deal six instead of five','(s.seats.length===3?7:6):5','(s.seats.length===3?7:6):6'],
 ['disable first double requirement',"s.round===1&&s.settings.opening==='highest-double'","false&&s.settings.opening==='highest-double'"],
 ['allow any opening tile','if(s.forced!==null&&t!==s.forced)continue;','if(false)continue;'],
 ['swap left orientation','if(right!==s.ends[0])','if(left!==s.ends[0])'],
 ['swap right orientation','else if(left!==s.ends[1])','else if(right!==s.ends[1])'],
 ['do not remove played tile','h.filter(t=>t!==i.tile)','h.filter(t=>t===i.tile)'],
 ['never reset passes after play','forced:null,passes:0,turn:','forced:null,passes:1,turn:'],
 ['reverse turn direction','turn:(s.turn+1)%s.seats.length','turn:s.turn'],
 ['draw ignores reserve','s.stock.length>s.settings.reserve','s.stock.length>0'],
 ['draw last instead of first','const t=s.stock[0]!','const t=s.stock.at(-1)!'],
 ['draw advances turn','return {...s,hands,stock:s.stock.slice(1)','return {...s,turn:(s.turn+1)%s.seats.length,hands,stock:s.stock.slice(1)'],
 ['keep invalid pass inference','j===s.turn?0:v','j===s.turn?v:v'],
 ['block one pass early','next.passes>=s.seats.length','next.passes>=s.seats.length-1'],
 ['gross partnership omits teammate pips',"s.settings.teamPoints==='all'?loser+mine:loser","s.settings.teamPoints==='all'?loser:loser"],
 ['award ties to first seat','if(wins.length!==1)return','if(wins.length===0)return'],
 ['break partner team membership','s.settings.partners?seat%2:seat','s.settings.partners?Math.floor(seat/2):seat'],
 ['target requires strict overshoot','Math.max(...scores)>=s.settings.target','Math.max(...scores)>s.settings.target'],
 ['spectator prototype membership','Object.hasOwn(s.players,id)','!!s.players[id]'],
 ['ignore paused guard',"if(s.phase.paused||s.phase.id==='done')", "if(s.phase.id==='done')"],
 ['omit timer instance guard','e.startedAt!==s.phase.startedAt||',''],
 ['TV leaks private hands','board:s.board.map(t=>({...t})),','hands:s.hands,board:s.board.map(t=>({...t})),']
];
const baseline=spawnSync(process.execPath,['--test','test.ts'],{encoding:'utf8',env:{...process.env,FAST_TEST:'1'},timeout:30000});
assert.equal(baseline.status,0,baseline.stdout+baseline.stderr);
const results=[];for(let index=0;index<mutations.length;index++){
 const [name,from,to]=mutations[index]!;assert(source.includes(from),name);const filename=`mutant-${index}.ts`;
 writeFileSync(filename,source.replace(from,to));
 const run=spawnSync(process.execPath,['--test','test.ts'],{encoding:'utf8',env:{...process.env,FAST_TEST:'1',CORE_PATH:`./${filename}`},timeout:30000});
 unlinkSync(filename);
 // Infrastructure crashes/timeouts do not count as assertion kills.
 const killed=run.status!==0&&/AssertionError|ERR_ASSERTION/.test(run.stdout+run.stderr);
 results.push({index:index+1,name,killed,exit:run.status});console.log(index+1,killed?'KILLED':'SURVIVED',name);
}
const report={mutants:results.length,killed:results.filter(r=>r.killed).length,results};writeFileSync('mutation-report.json',JSON.stringify(report,null,2)+'\n');assert(report.killed>=24,`${report.killed}/25 killed`);
