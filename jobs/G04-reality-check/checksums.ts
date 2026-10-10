import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const archived=(directory:string):string[]=>existsSync(directory)?readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?archived(directory+'/'+entry.name):entry.isFile()?[directory+'/'+entry.name]:[]):[];
const files=[...readdirSync('.').filter(n=>n.endsWith('.json')&&!['package.json','package-lock.json','tsconfig.json'].includes(n)),...(existsSync('fixtures')?readdirSync('fixtures').filter(n=>n.endsWith('.json')).map(n=>'fixtures/'+n):[]),...(existsSync('media')?readdirSync('media').map(n=>'media/'+n):[]),...archived('results')].sort();
const output=files.map(f=>`${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`).join('\n')+'\n';
if(process.argv.includes('--check'))assert.equal(readFileSync('SHA256SUMS.txt','utf8'),output);else writeFileSync('SHA256SUMS.txt',output);
console.log(`${files.length} data/media checksums ${process.argv.includes('--check')?'verified':'written'}`);
