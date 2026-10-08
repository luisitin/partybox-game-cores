import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const paths:string[]=[];
for(const entry of await readdir('.',{withFileTypes:true})){
 if(entry.isFile()&&entry.name.endsWith('.json')&&!['package.json','package-lock.json','tsconfig.json'].includes(entry.name))paths.push(entry.name);
 if(entry.isFile()&&entry.name==='play.html')paths.push(entry.name);
 if(entry.isDirectory()&&['fixtures','media'].includes(entry.name))for(const file of await readdir(entry.name,{withFileTypes:true}))if(file.isFile())paths.push(`${entry.name}/${file.name}`);
}
const lines=await Promise.all(paths.sort().map(async path=>`${createHash('sha256').update(await readFile(path)).digest('hex')}  ${path}`));
const output=lines.join('\n')+'\n';
if(process.argv.includes('--check'))assert.equal(await readFile('SHA256SUMS.txt','utf8'),output,'data/media path set and every hash must match');
else await writeFile('SHA256SUMS.txt',output);
console.log(`${paths.length} data/media/artifact hashes ${process.argv.includes('--check')?'verified':'written'}`);
