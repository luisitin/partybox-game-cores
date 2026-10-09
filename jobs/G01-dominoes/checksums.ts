import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const files=['play.html','THIRD-PARTY-LICENSES.txt','manifest.json',...readdirSync('fixtures').filter(n=>n.endsWith('.json')).map(n=>'fixtures/'+n),...readdirSync('.').filter(n=>n.endsWith('.json')&&!['manifest.json','package.json','package-lock.json','tsconfig.json'].includes(n)),...(readdirSync('media').filter(n=>/\.(png|webm|zip)$/.test(n)).map(n=>'media/'+n))].sort();
const output=files.map(f=>`${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`).join('\n')+'\n';
if(process.argv.includes('--check'))assert.equal(readFileSync('SHA256SUMS.txt','utf8'),output);else writeFileSync('SHA256SUMS.txt',output);
