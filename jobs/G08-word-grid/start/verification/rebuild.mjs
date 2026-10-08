import {readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='start/games/shake-up/content';
const files=(await readdir(dir)).filter(f=>/^(words|bot-words|blocked|common-words).*\.json$/.test(f)).sort();
async function hashes(){return Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(`${dir}/${f}`)).digest('hex')])));}
const before=await hashes();
execFileSync('npm',['run','build:words'],{stdio:'pipe'});const first=await hashes();
execFileSync('npm',['run','build:words'],{stdio:'pipe'});const second=await hashes();
assert.deepEqual(first,second,'two rebuilds differ');assert.deepEqual(before,second,'committed packs differ from reproducible source build');
await writeFile('start/verification/rebuild-report.json',JSON.stringify({version:1,command:'npm run build:words',runs:2,byteIdentical:true,matchesCommitted:true,files:second},null,2)+'\n');
console.log(JSON.stringify({rebuilds:2,files:files.length,byteIdentical:true,matchesCommitted:true}));
