import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function files(dir='.') {
 const result=[];
 for(const e of await readdir(dir,{withFileTypes:true})){
  if(['.work','dist','node_modules','.git'].includes(e.name))continue;
  const p=dir==='.'?e.name:dir+'/'+e.name;
  if(e.isDirectory())result.push(...await files(p));else if(e.isFile()&&p!=='SHA256SUMS.txt')result.push(p);
 }return result;
}
const entries=await Promise.all((await files()).sort().map(async p=>createHash('sha256').update(await readFile(p)).digest('hex')+'  '+p));
await writeFile('SHA256SUMS.txt',entries.join('\n')+'\n');console.log('Hashed '+entries.length+' delivered files.');
