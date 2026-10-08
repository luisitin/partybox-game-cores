import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,unlinkSync,writeFileSync} from 'node:fs';
import {basename,join} from 'node:path';
import {spawnSync} from 'node:child_process';

type Case={name:string;status:string};
type RunReport={passed:boolean;cases:Case[];sourceGuardsMatch:boolean;sourceHashesAtStart:Record<string,string>;sourceHashesAtEnd:Record<string,string>;externalRequests:string[];errors:string[];failures:string[]};
const hash=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
const files=['ui.ts','play.html','core.ts','bots.ts','samples.ts','samples.json','manifest.json','scoring.ts','estimates.ts','late-input.ts','build.ts','host-deadline-equality-old-six-runner.txt','host-deadline-mutation.ts'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,hash(readFileSync(f))]));
const initial=hashes(),originalUi=readFileSync('ui.ts'),originalHtml=readFileSync('play.html');
mkdirSync('.work',{recursive:true});
const directory=mkdtempSync('.work/host-deadline-mutation-');
const oldRunner=`.mutation-host-${process.pid}.ts`;
const oldReport=join(directory,'old-six.json'),newReport=join(directory,'new-eight.json');
const run=(file:string,log:string,env:NodeJS.ProcessEnv=process.env)=>{
 const result=spawnSync(process.execPath,[file],{env,encoding:'utf8',timeout:90000,maxBuffer:4*1024*1024});
 writeFileSync(join(directory,log),result.stdout+'\n'+result.stderr);
 assert.equal(result.error,undefined,`${file}: subprocess failed or timed out`);
 assert.equal(result.signal,null,`${file}: unexpected termination`);
 return result.status;
};
const readReport=(path:string):RunReport=>JSON.parse(readFileSync(path,'utf8')) as RunReport;
const checkGuards=(r:RunReport,htmlSha:string,uiSha:string)=>{
 assert.equal(r.sourceGuardsMatch,true);
 assert.deepEqual(r.sourceHashesAtEnd,r.sourceHashesAtStart);
 assert.equal(r.sourceHashesAtStart['play.html'],htmlSha);
 assert.equal(r.sourceHashesAtStart['ui.ts'],uiSha);
 assert.deepEqual(r.externalRequests,[]);assert.deepEqual(r.errors,[]);
};
const boundary=['exact-deadline correct quick answer','exact-deadline human bluff write'].sort();
let mutantHtmlSha='',mutantUiSha='',oldStatus:number|null=null,newStatus:number|null=null;
let oldResult:RunReport|undefined,newResult:RunReport|undefined;
const startedAt=new Date().toISOString();
try{
 const needle='now<state.phase.deadline';
 const ui=originalUi.toString('utf8');assert.equal(ui.split(needle).length,2,'exactly one host deadline comparison');
 const oldText=readFileSync('host-deadline-equality-old-six-runner.txt','utf8');
 assert.equal(oldText.split("'.mutation-old-six.ts'").length,2);
 assert.equal(oldText.split("'.work/deadline-mutation-old-six.json'").length,2);
 writeFileSync(oldRunner,oldText.replace("'.mutation-old-six.ts'",JSON.stringify(basename(oldRunner))).replace("'.work/deadline-mutation-old-six.json'",JSON.stringify(oldReport)));
 writeFileSync('ui.ts',ui.replace(needle,'now<=state.phase.deadline'));
 assert.equal(run('build.ts','build.log'),0,'compile the actual mutant page');
 mutantHtmlSha=hash(readFileSync('play.html'));mutantUiSha=hash(readFileSync('ui.ts'));
 assert.notEqual(mutantHtmlSha,initial['play.html']);assert.notEqual(mutantUiSha,initial['ui.ts']);
 oldStatus=run(oldRunner,'old-six.log');oldResult=readReport(oldReport);
 checkGuards(oldResult,mutantHtmlSha,mutantUiSha);
 assert.equal(oldStatus,0);assert.equal(oldResult.passed,true);assert.equal(oldResult.cases.length,6);
 assert(oldResult.cases.every(c=>c.status==='passed'));assert.deepEqual(oldResult.failures,[]);
 newStatus=run('late-input.ts','new-eight.log',{...process.env,G04_LATE_REPORT:newReport});newResult=readReport(newReport);
 checkGuards(newResult,mutantHtmlSha,mutantUiSha);
 assert.equal(newStatus,1,'current real-file tests must kill the compiled mutant');
 assert.equal(newResult.passed,false);assert.equal(newResult.cases.length,8);
 assert.deepEqual(newResult.cases.filter(c=>c.status==='failed').map(c=>c.name).sort(),boundary);
 assert.deepEqual(newResult.cases.filter(c=>c.status==='passed').map(c=>c.name).sort(),oldResult.cases.map(c=>c.name).sort());
 assert.equal(newResult.failures.length,2);
}finally{
 writeFileSync('ui.ts',originalUi);writeFileSync('play.html',originalHtml);
 try{unlinkSync(oldRunner);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 assert.deepEqual(hashes(),initial,'restore original playable and every guarded source even on failure');
}
assert(oldResult&&newResult);
for(const [from,to] of [[oldReport,'host-deadline-automated-old-six-report.json'],[newReport,'host-deadline-automated-new-eight-report.json'],[join(directory,'old-six.log'),'host-deadline-automated-old-six-log.txt'],[join(directory,'new-eight.log'),'host-deadline-automated-new-eight-log.txt']])copyFileSync(from!,to!);
writeFileSync('host-deadline-automated-mutation-report.json',JSON.stringify({startedAt,finishedAt:new Date().toISOString(),command:'node host-deadline-mutation.ts',scope:'Actual compiled host comparator mutant, actual file:// controls; verification only, no FPS or player-gain claim',mutation:'now < deadline changed to now <= deadline',mutantHtmlSha,mutantUiSha,oldExit:oldStatus,oldCases:oldResult.cases.length,newExit:newStatus,newCases:newResult.cases.length,killedBy:boundary,restored:true,sourceHashesAtStart:initial,sourceHashesAtEnd:hashes()},null,2)+'\n');
console.log('Actual compiled host mutant: old6 PASS, current8 kills exactly2 deadline-boundary cases; original UI/HTML and all guarded sources restored');
