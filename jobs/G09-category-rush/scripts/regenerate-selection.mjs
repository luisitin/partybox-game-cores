/** Reproduce the actual registered baseline and candidate in isolated source trees. */
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,mkdirSync,symlinkSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const job=resolve(dirname(fileURLToPath(import.meta.url)),'..'),temporary=mkdtempSync(join(tmpdir(),'g09-selection-'));
try{
  cpSync(resolve(job,'../../contract'),join(temporary,'contract'),{recursive:true});
  for(const mode of ['baseline','candidate']){
    const isolated=join(temporary,'jobs',mode);mkdirSync(isolated,{recursive:true});
    for(const name of ['src','content'])cpSync(join(job,name),join(isolated,name),{recursive:true});
    for(const name of ['scripts','evidence'])mkdirSync(join(isolated,name));
    cpSync(join(job,'package.json'),join(isolated,'package.json'));
    cpSync(join(job,'scripts/selection-revision-experiment.ts'),join(isolated,'scripts/selection-revision-experiment.ts'));
    cpSync(join(job,'evidence/selection-revision-seeds.json'),join(isolated,'evidence/selection-revision-seeds.json'));
    if(mode==='baseline')cpSync(join(job,'evidence/breadth-lexical-core.ts'),join(isolated,'src/index.ts'));
    symlinkSync(join(job,'node_modules'),join(isolated,'node_modules'),'dir');
    execFileSync(process.execPath,['--import','tsx','scripts/selection-revision-experiment.ts',mode],{cwd:isolated,stdio:'ignore'});
    const name=`evidence/selection-revision-${mode}.json`,actual=readFileSync(join(isolated,name));
    if(process.argv.includes('--check'))assert.deepEqual(actual,readFileSync(join(job,name)),`${mode}: actual study byte identity`);
    else writeFileSync(join(job,name),actual);
    console.log(`${mode}: 3,000 actual games and 3,000 restored replays reproduced byte-identically`);
  }
}finally{rmSync(temporary,{recursive:true,force:true});}
