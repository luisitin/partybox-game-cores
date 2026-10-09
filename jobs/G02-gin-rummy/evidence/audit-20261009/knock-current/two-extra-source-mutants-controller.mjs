import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {build} from 'esbuild';

const sha=b=>createHash('sha256').update(b).digest('hex');
const out=resolve('.work/knock-extra-mutants-20261009');
await mkdir(out,{recursive:false});
const inputs=['src/core.ts','src/cards.ts','scripts/build.mjs','tests/knock-layout-priority.test.mjs','tests/helpers.mjs','tests/gin-cases.mjs','tests/layoff-reference.mjs','dist/cards.mjs','dist/contract.mjs','../../.github/workflows/G02.yml'];
const freeze=async()=>Object.fromEntries(await Promise.all(inputs.map(async p=>[p,sha(await readFile(p))])));
const before=await freeze(),source=await readFile('src/core.ts','utf8');
await writeFile(out+'/READY.json',JSON.stringify({createdUtc:new Date().toISOString(),sourceStart:before,samplerExecuted:false},null,2)+'\n');
const cases=[
 ['K01',"if(skill==='sharp'&&v.phaseId==='discard'&&best.deadwood>0&&best.deadwood<=v.knockLimit)","if(false&&skill==='sharp'&&v.phaseId==='discard'&&best.deadwood>0&&best.deadwood<=v.knockLimit)",'disable the complete finishing dominance step'],
 ['K02','if(card!==forbidden&&solution.deadwood>0&&solution.deadwood<best.deadwood&&meldKey(solution.melds)===key)','if(solution.deadwood>0&&solution.deadwood<best.deadwood&&meldKey(solution.melds)===key)','return a just-picked-up discard during final dominance selection']
];
const reports=[];let failure=null;
try{
 const baseline=spawnSync(process.execPath,['--test','tests/knock-layout-priority.test.mjs'],{encoding:'utf8',timeout:120000});
 await writeFile(out+'/baseline.stdout',baseline.stdout);await writeFile(out+'/baseline.stderr',baseline.stderr);assert.equal(baseline.status,0);
 for(const [id,from,to,description] of cases){
  assert.equal(source.split(from).length,2);const mutated=source.replace(from,to),folder=out+'/'+id;
  await mkdir(folder+'/tests',{recursive:true});await mkdir(folder+'/dist');
  for(const file of ['knock-layout-priority.test.mjs','helpers.mjs','gin-cases.mjs','layoff-reference.mjs'])await copyFile('tests/'+file,folder+'/tests/'+file);
  for(const file of ['cards.mjs','contract.mjs'])await copyFile('dist/'+file,folder+'/dist/'+file);
  await writeFile(folder+'/mutated-core.ts',mutated);
  const plugin={name:'actual-one-source-edit',setup(b){b.onLoad({filter:/\/src\/core\.ts$/},()=>({contents:mutated,loader:'ts'}));}};
  await build({entryPoints:['src/core.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:folder+'/dist/core.mjs',alias:{zod:resolve('node_modules/zod')},plugins:[plugin],logLevel:'silent'});
  const run=spawnSync(process.execPath,['--test',folder+'/tests/knock-layout-priority.test.mjs'],{encoding:'utf8',timeout:120000});
  await writeFile(folder+'/stdout',run.stdout);await writeFile(folder+'/stderr',run.stderr);
  const killed=run.status!==0&&run.signal===null&&/AssertionError|ERR_ASSERTION/.test(run.stdout+run.stderr)&&!/SyntaxError|ERR_MODULE_NOT_FOUND/.test(run.stdout+run.stderr);
  reports.push({id,from,to,description,compiled:true,nativeExitCode:run.status,signal:run.signal,actualAssertionFailure:killed,mutatedSourceSha256:sha(Buffer.from(mutated)),compiledSha256:sha(await readFile(folder+'/dist/core.mjs'))});assert(killed,id+' survived');
 }
}catch(e){failure=String(e);}
const after=await freeze();assert.deepEqual(after,before);
const result={closedUtc:new Date().toISOString(),method:'two additional actual single-source edits, compiled independently and killed by the baseline-passing production reducer score tests',reports,sourceStart:before,sourceEnd:after,sourceUnchanged:true,samplerExecuted:false,error:failure,result:failure===null&&reports.length===2?'PASS':'FAIL'};
await writeFile(out+'/CLOSED.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,sourceStart:undefined,sourceEnd:undefined}));assert.equal(result.result,'PASS');
