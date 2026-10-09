import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readdir,writeFile} from 'node:fs/promises';
import {gameInputHashes} from '../../scripts/game-inputs.mjs';

async function files(root){
  const output=[];
  for(const entry of await readdir(root,{withFileTypes:true})){
    const path=root+'/'+entry.name;
    if(entry.isDirectory())output.push(...await files(path));
    else if(entry.isFile())output.push(path);
  }
  return output;
}
const gameInputs=await gameInputHashes();
const modulePaths=(await Promise.all(['src','dist','tests','scripts'].map(files))).flat().sort();
const modules={};
for(const path of modulePaths){
  const digest=createHash('sha256');
  for await(const bytes of createReadStream(path))digest.update(bytes);
  modules[path]=digest.digest('hex');
}
await writeFile(process.argv[2],JSON.stringify({gameInputs,modules},null,2)+'\n');
