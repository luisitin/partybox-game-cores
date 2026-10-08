import {readdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
const dataPaths=[
  'data/endgames.json','data/chinook/DB6.bin','data/chinook/DB6.idx','data/international/tunstall-v2.bin',
  ...[2,3,4,5].flatMap(n=>['data/international/db'+n+'.bin','data/international/db'+n+'.idx'])];
export async function gameInputHashes(){
  const sourcePaths=(await readdir('src')).filter(name=>name.endsWith('.ts')&&!name.endsWith('.d.ts')&&!['browser.ts','bot-worker.ts'].includes(name)).map(name=>'src/'+name);
  const sixPaths=(await readdir('data/international/six')).filter(name=>name.endsWith('.chunk')||name.endsWith('.idx')||name==='manifest.json').map(name=>'data/international/six/'+name);
  const hashes={};for(const path of [...sourcePaths,...dataPaths,...sixPaths].sort()){
    const digest=createHash('sha256');for await(const bytes of createReadStream(path))digest.update(bytes);hashes[path]=digest.digest('hex');
  }
  return hashes;
}
