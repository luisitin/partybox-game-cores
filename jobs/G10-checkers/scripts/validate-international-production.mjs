import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createInternationalDatabase} from '../dist/international.mjs';
const option=name=>{const n=process.argv.indexOf(name);assert(n>=0&&process.argv[n+1],'Missing '+name);return resolve(process.argv[n+1]);};
const directory=option('--data'),expectedPath=option('--expected'),output=option('--out');
const digest=data=>createHash('sha256').update(data).digest('hex'),files=[],sourceFiles={};
for(const name of (await readdir(directory)).sort()){
  const match=/^(db(?:[2-5]|6-\d{4}))\.cpr1$/.exec(name);if(!match)continue;
  const data=await readFile(directory+'/'+name),index=await readFile(directory+'/'+match[1]+'.idx1');
  files.push({name:match[1],data:new Uint8Array(data),indexText:index.toString('ascii')});
  sourceFiles[match[1]]={bytes:data.length,sha256:digest(data),indexBytes:index.length,indexSha256:digest(index)};
}
assert(files.length>0);const dictionary=await readFile('data/international/tunstall-v2.bin'),database=createInternationalDatabase(files,new Uint8Array(dictionary));
const raw=await readFile(expectedPath),rows=raw.toString('utf8').trim().split('\n').map(line=>JSON.parse(line));assert.equal(rows.length,10000);
let wins=0,losses=0,draws=0;const material=new Set(),transcript=createHash('sha256');
for(const row of rows){
  const location=database.locate(row.board,row.side);assert(location);assert.equal(location.key,row.key);assert.equal(location.ordinal,row.ordinal);assert.equal(location.index,row.index);
  const expected=row.value==='win'?1:row.value==='loss'?-1:row.value==='draw'?0:null;assert.notEqual(expected,null);
  const actual=database.probe(row.board,row.side);assert.equal(actual,expected,JSON.stringify(row));assert.equal(row.originalCpp,expected===1?1:expected===-1?2:3);
  material.add(location.material.join(','));if(actual===1)wins++;else if(actual===-1)losses++;else draws++;
  transcript.update(JSON.stringify([row.id,location.key,location.ordinal,actual]));
}
const report={command:'node scripts/validate-international-production.mjs --data '+directory+' --expected '+expectedPath+' --out '+output,status:'PASS',cases:rows.length,wins,losses,draws,materials:[...material].sort(),sourceFiles,
  inputSha256:digest(raw),productionSourceSha256:digest(await readFile('src/international.ts')),dictionarySha256:digest(dictionary),transcriptSha256:transcript.digest('hex'),coverage:database.coverage(),
  fullSixPieceCoverage:false,scope:'Actual supplied direct queries only; missing material remains unknown. This adapter does not install these payloads in the game/browser or establish complete6 coverage or draw-history conversion.'};
await mkdir(output,{recursive:true});await writeFile(output+'/international-production-comparison.json',JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report)+'\n');
