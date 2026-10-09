import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {build} from '/tmp/G02-source-93f0f58-20261009/node_modules/esbuild/lib/main.js';
const base='/tmp/G02-KEEP19-draw-boundary-20261009',job='/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy';
const source=await readFile(job+'/src/core.ts','utf8'),needle="skill==='sharp'&&v.phaseId==='discard'&&best.deadwood>0";assert.equal(source.split(needle).length,2);
const mutant=source.replace(needle,"skill==='sharp'&&best.deadwood>0");await writeFile(base+'/mutant-core.ts',mutant);
await build({stdin:{contents:mutant,resolveDir:job+'/src',sourcefile:'core.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'es2022',outfile:base+'/mutant-core.mjs'});
let test=await readFile(job+'/tests/draw-subset-boundary.test.mjs','utf8');
test=test.replace("'../dist/core.mjs'","'"+base+"/mutant-core.mjs'").replace("'./gin-cases.mjs'","'"+job+"/tests/gin-cases.mjs'").replace("'./helpers.mjs'","'"+job+"/tests/helpers.mjs'");
await writeFile(base+'/mutant-draw-boundary.test.mjs',test);console.log('One actual phase-guard source mutation compiled; original core unchanged.');

