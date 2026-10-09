import {readdir,stat,mkdir,copyFile,open,writeFile,readFile} from 'node:fs/promises';
import {createReadStream,createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const start=Date.now(), source=resolve('dist'),out=resolve('.work/memory-json-private/shadow-dist');
await mkdir(out,{recursive:true});
const modules=['core.mjs','bots.mjs','endgame.mjs','international-search.mjs'],records=[];
for(const name of modules)await copyFile(resolve(source,name),resolve(out,name));
for(const name of (await readdir(source)).filter(name=>/^intl-.*\.mjs$/.test(name)).sort()){
 const path=resolve(source,name),size=(await stat(path)).size,h=await open(path,'r');
 const first=Buffer.alloc(15),last=Buffer.alloc(3);
 await h.read(first,0,15,0);await h.read(last,0,3,size-3);await h.close();
 if(first.toString()!=='export default '||last.toString()!=='";\n')throw new Error('Unexpected immutable module shape: '+name);
 const nativeHash=createHash('sha256').update(first),jsonHash=createHash('sha256');
 const jsonName=name.replace(/\.mjs$/,'.json');
 await pipeline(createReadStream(path,{start:15,end:size-3}),new Transform({transform(bytes,encoding,done){nativeHash.update(bytes);jsonHash.update(bytes);done(null,bytes);}}),createWriteStream(resolve(out,jsonName)));
 nativeHash.update(';\n');
 await writeFile(resolve(out,name),`export {default} from './${jsonName}' with {type:'json'};\n`);
 records.push({name,jsonName,nativeModuleBytes:size,jsonBytes:size-17,nativeModuleSha256:nativeHash.digest('hex'),jsonSha256:jsonHash.digest('hex'),change:'Identical existing quoted base64 primitive, copied byte-for-byte; only source container/loader changes.'});
}
const expected=JSON.parse(await readFile('evidence/checks/international-default-full/combined-proof.json','utf8')).unchangedProductionAndOracleSha256;
const cloneHashes={};
for(const name of modules){const hash=createHash('sha256');for await(const bytes of createReadStream(resolve(out,name)))hash.update(bytes);cloneHashes[name]=hash.digest('hex');if(cloneHashes[name]!==expected['dist/'+name])throw new Error('Public production module changed since proof: '+name);}
await writeFile(resolve('.work/memory-json-private/preparation.json'),JSON.stringify({status:'PASS',preparedAt:new Date().toISOString(),wallSeconds:(Date.now()-start)/1000,node:process.version,source,out,modules:cloneHashes,chunks:records,chunkCount:records.length,scope:'Private static JSON shadow; tracked source/build/default dist unchanged. This does not yet establish import/probe/search equivalence.'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',chunks:records.length,wallSeconds:(Date.now()-start)/1000,out}));
