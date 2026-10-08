/** Run the identical protocol under the retained actual pre-fix core/reference. */
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,mkdirSync,symlinkSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const job=resolve(dirname(fileURLToPath(import.meta.url)),'..'),temporary=mkdtempSync(join(tmpdir(),'g09-plural-'));
try{
 cpSync(resolve(job,'../../contract'),join(temporary,'contract'),{recursive:true});
 symlinkSync(join(job,'node_modules'),join(temporary,'node_modules'),'dir');
 const isolated=join(temporary,'jobs','baseline');mkdirSync(isolated,{recursive:true});
 for(const folder of ['src','tests','content'])cpSync(join(job,'evidence/browser/round-3-accepted',folder),join(isolated,folder),{recursive:true});
 cpSync(join(job,'content/plural-schema.ts'),join(isolated,'content/plural-schema.ts'));
 cpSync(join(job,'content/lexical-schema.ts'),join(isolated,'content/lexical-schema.ts'));
 mkdirSync(join(isolated,'scripts'));mkdirSync(join(isolated,'evidence'));
 cpSync(join(job,'scripts/plural-protocol.ts'),join(isolated,'scripts/plural-protocol.ts'));
 cpSync(join(job,'scripts/lexical-audit.ts'),join(isolated,'scripts/lexical-audit.ts'));
 cpSync(join(job,'package.json'),join(isolated,'package.json'));symlinkSync(join(job,'node_modules'),join(isolated,'node_modules'),'dir');
 execFileSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/plural-protocol.ts','--baseline'],{cwd:isolated,stdio:'inherit'});
 if(process.argv.includes('--oracle')){
  const output=execFileSync(process.execPath,['--import','tsx','--test','--test-name-pattern=independent hardest-function oracle','tests/core.test.ts'],{cwd:isolated,encoding:'utf8'});
  writeFileSync(join(job,'evidence/plural-oracle-baseline.txt'),output);process.stdout.write(output);
 }
 const actual=readFileSync(join(isolated,'evidence/plural-protocol-baseline.json')),target=join(job,'evidence/plural-protocol-baseline.json');
 if(process.argv.includes('--check'))assert.deepEqual(actual,readFileSync(target));else writeFileSync(target,actual);
 execFileSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/lexical-audit.ts','--baseline'],{cwd:isolated,stdio:'ignore'});
 const audit=readFileSync(join(isolated,'evidence/lexical-audit-baseline.json')),auditTarget=join(job,'evidence/lexical-audit-baseline.json');
 if(process.argv.includes('--check'))assert.deepEqual(audit,readFileSync(auditTarget));else writeFileSync(auditTarget,audit);
}finally{rmSync(temporary,{recursive:true,force:true});}
