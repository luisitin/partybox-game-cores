import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {relative,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),paths:string[]=[];
function walk(folder:string):void {
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name.startsWith('.')||entry.name==='SHA256SUMS.txt')continue;
    const path=join(folder,entry.name);
    if(entry.isDirectory())walk(path);
    else if(entry.name==='LICENSE'||entry.name==='THIRD_PARTY_NOTICES.txt'||/^(?:content|evidence|media)\//.test(relative(root,path))||/\.(json|jsonl|html|svg|png|webp|webm|mp4)$/.test(entry.name))paths.push(path);
  }
}
walk(root);
const result=paths.sort().map(path=>`${createHash('sha256').update(readFileSync(path)).digest('hex')}  ${relative(root,path)}`).join('\n')+'\n';
const target=join(root,'SHA256SUMS.txt');
if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==result)throw new Error('Data/media checksum drift');}
else writeFileSync(target,result);
console.log(`Checksummed ${paths.length} data/media files`);
