import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';

// Validate shipped bytes BEFORE a build or generator can overwrite them.
const expected=['play.html','src/tiers.ts','THIRD_PARTY_NOTICES.md','manifest.json','research-access.json'];
for(const dir of ['data','fixtures','schemas','media'])for(const file of readdirSync(dir)){
  if(dir==='media'?!/\.(json|png|webm|mp4)$/.test(file):!file.endsWith('.json'))continue;
  expected.push(`${dir}/${file}`);
}
const entries=readFileSync('SHA256SUMS.txt','utf8').trim().split('\n').map(line=>{
  const match=/^([a-f0-9]{64})  (.+)$/.exec(line);assert(match,`malformed checksum: ${line}`);return {hash:match[1],path:match[2]};
});
assert.deepEqual(entries.map(e=>e.path).sort(),expected.sort(),'checksum coverage must include every delivered data/media file');
for(const entry of entries)assert.equal(createHash('sha256').update(readFileSync(entry.path)).digest('hex'),entry.hash,`committed bytes differ: ${entry.path}`);
console.log(`Committed artifacts verified: ${entries.length} hashes`);
