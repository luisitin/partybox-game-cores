import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const paths=[];
async function walk(dir='.'){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(['.git','.work','dist','node_modules'].includes(entry.name))continue;
    const path=dir==='.'?entry.name:dir+'/'+entry.name;
    if(entry.isDirectory())await walk(path);else if(entry.isFile()&&path!=='SHA256SUMS.txt')paths.push(path);
  }
}
await walk();paths.sort();
const sums=await Promise.all(paths.map(async path=>createHash('sha256').update(await readFile(path)).digest('hex')+'  '+path));
await writeFile('SHA256SUMS.txt',sums.join('\n')+'\n');
