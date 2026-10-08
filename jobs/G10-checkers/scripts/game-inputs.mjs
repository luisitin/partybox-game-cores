import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const paths=['src/types.ts','src/core.ts','src/moves.ts','src/draws.ts','src/bots.ts','src/endgame.ts','src/chinook.ts','src/chinook-corpus.ts','src/international.ts','src/international-corpus.ts',
  'data/endgames.json','data/chinook/DB6.bin','data/chinook/DB6.idx','data/international/tunstall-v2.bin',
  ...[2,3,4,5].flatMap(n=>['data/international/db'+n+'.bin','data/international/db'+n+'.idx'])];
export async function gameInputHashes(){
  const hashes={};for(const path of paths)hashes[path]=createHash('sha256').update(await readFile(path)).digest('hex');return hashes;
}
