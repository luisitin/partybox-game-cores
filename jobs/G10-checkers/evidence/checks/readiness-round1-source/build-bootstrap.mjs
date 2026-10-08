import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir,rename,open} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {once} from 'node:events';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {rawZipMember,pack,workerBootstrap,workerParts,sha256} from '../../scripts/corpus-pack.mjs';
await mkdir('.work/american-ready-private/dist',{recursive:true});
const alias={zod:resolve('node_modules/zod')},loader={'.bin':'binary','.idx':'text','.chunk':'base64'};
const chunkExternal={name:'immutable-international-node-chunks',setup(api){
  api.onResolve({filter:/\.chunk$/},args=>({path:'./intl-'+args.path.split('/').at(-1).replace(/\.chunk$/,'.mjs'),external:true}));
}};
const browserOnly=true;
if(!browserOnly)for(const name of (await readdir('data/international/six')).filter(name=>name.endsWith('.chunk')).sort()){
  const encoded=(await readFile('data/international/six/'+name)).toString('base64');
  const moduleName='intl-'+name.replace(/\.chunk$/,'');
  await writeFile('dist/'+moduleName+'.json',JSON.stringify(encoded)+'\n');
  await writeFile('dist/'+moduleName+'.mjs','export {default} from "./'+moduleName+'.json" with {type:"json"};\n');
}
const flags=(american,international)=>({G10_CHINOOK_ENABLED:String(american),G10_INTERNATIONAL_ENABLED:String(international)});
const sharedEndgame=path=>({name:'shared-node-endgame',setup(api){api.onResolve({filter:/endgame\.js$/},()=>({path,external:true}));}});
const stub=(american,international)=>({name:'unused-corpus-stub',setup(api){
  if(!international){
    api.onLoad({filter:/international-six-data\.ts$/},()=>({contents:'export const internationalSixFiles=[];',loader:'js'}));
    api.onLoad({filter:/international-six-indexes\.ts$/},()=>({contents:'export const internationalSixIndexes=[];',loader:'js'}));
  }
  api.onLoad({filter:/data\/(chinook|international)\/.*\.(bin|idx|chunk)$/},args=>{
    if((args.path.includes('/chinook/')&&!american)||(args.path.includes('/international/')&&!international))return {contents:'export default null;',loader:'js'};
  });
}});
if(!browserOnly)for(const name of ['core','moves','draws','bots','endgame','retrograde','schema','chinook','international','international-search']){
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'.mjs',alias,loader,define:flags(true,true),plugins:[chunkExternal,...(name==='endgame'?[]:[sharedEndgame('./endgame.mjs')])]});
}
if(!browserOnly)for(const variant of ['american','international'])for(const name of ['endgame','core','bots']){
  const american=variant==='american';
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'-'+variant+'.mjs',alias,loader,define:flags(american,!american),plugins:[stub(american,!american),chunkExternal,...(name==='endgame'?[]:[sharedEndgame('./endgame-'+variant+'.mjs')])]});
}
if(!browserOnly)await build({entryPoints:['../../contract/contract.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/contract.mjs',alias});
if(process.env.G10_BUILD_NODE_ONLY==='1'){process.stdout.write('PASS: strict Node full-corpus bundles; standalone HTML not rebuilt.\n');}else{
const archive=await readFile('data/chinook/DB6.zip');assert.equal(sha256(archive),'35835dae65a962eafdf5cde290bce380117445acb21819dd0e266b3b0efab3b3');
const original=rawZipMember(archive,'DB6'),americanBytes=await readFile('data/chinook/DB6.bin');assert.equal(original.uncompressed,americanBytes.length);
const payloads={american:[{name:'chinook',...pack(americanBytes,original.compressed)}],international:[{name:'tunstall-v2',...pack(await readFile('data/international/tunstall-v2.bin'))}]};
const rawPartBytes=3*262144,internationalParts={},sourceParts=[];
function addSource(name,byteLength,extents){
  const parts=[];let offset=0,index=0;
  for(const extent of extents){
    for(let position=0;position<extent.bytes;position+=rawPartBytes){
      const bytes=Math.min(rawPartBytes,extent.bytes-position),id='g10-intl-'+name+'-'+index++;
      const part={id,offset,bytes,encodedLength:4*Math.ceil(bytes/3)};parts.push(part);sourceParts.push({...part,path:extent.path,fileOffset:position});offset+=bytes;
    }
  }
  assert.equal(offset,byteLength);internationalParts[name]={byteLength,parts};
}
const lowerManifest=JSON.parse(await readFile('data/international/manifest.json','utf8'));
for(const name of ['db2','db3','db4','db5']){const bytes=lowerManifest.files[name+'.bin'].bytes;addSource(name,bytes,[{path:'data/international/'+name+'.bin',bytes}]);}
const sixManifest=JSON.parse(await readFile('data/international/six/manifest.json','utf8'));
for(const file of sixManifest.files)addSource(file.name,file.bytes,file.chunks.map(chunk=>({path:'data/international/six/'+chunk.file,bytes:chunk.bytes})));
const workerSources={},partsByVariant={};
for(const variant of ['american','international']){
  const american=variant==='american',compressedData={name:'worker-injected-bytes',setup(api){
    api.onLoad({filter:/international-corpus\.ts$/},()=>({contents:'export const internationalCorpus=null;',loader:'js'}));
    api.onLoad({filter:/data\/(chinook|international)\/[^/]+\.bin$/},args=>{
      const section=args.path.includes('/chinook/')?'chinook':'international';
      if((section==='chinook')!==american)return {contents:'export default null;',loader:'js'};
      const name=section==='chinook'?'chinook':args.path.split('/').at(-1).replace(/\.bin$/,'');
      return {contents:'export default G10_DATABASE_BYTES['+JSON.stringify(name)+'];',loader:'js'};
    });
  }};
  const worker=await build({entryPoints:['src/bot-worker.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[compressedData,stub(american,!american)],define:{...flags(american,!american),G10_BLOCK_INTERNATIONAL:String(!american)}});
  workerSources[variant]=workerBootstrap(worker.outputFiles[0].text,payloads[variant]);
  partsByVariant[variant]=workerParts(worker.outputFiles[0].text,payloads[variant].map(value=>value.name));
  await writeFile('.work/american-ready-private/dist/worker-'+variant+'.mjs',workerSources[variant]);
}
const originalBrowser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[stub(false,false)],define:{...flags(false,false),G10_WORKER_PARTS:JSON.stringify(partsByVariant),G10_INTERNATIONAL_PARTS:JSON.stringify(internationalParts)}});

const originalScript=originalBrowser.outputFiles[0].text.replaceAll('</script','<\\/script');
const prefixBytes=Buffer.byteLength(originalScript)+131072;assert(prefixBytes<32*1024*1024,'Private bounded bootstrap reader exceeds32MiB');const file=await open('.work/play-full-guarded.html','r'),prefix=Buffer.alloc(prefixBytes);const first=await file.read(prefix,0,prefix.length,0);await file.close();
const head=prefix.subarray(0,first.bytesRead),start=head.indexOf(Buffer.from('<script>'))+8,end=head.indexOf(Buffer.from('</script>'),start);assert(start>=8&&end>start);
const oldScript=head.subarray(start,end);assert.equal(Buffer.compare(oldScript,Buffer.from(originalScript)),0,'Fresh original compiler must exactly reproduce accepted canonical bootstrap');
const source=await readFile('.work/american-ready-private/candidate-browser.ts','utf8');
const overlay={name:'private-variant-ready',setup(api){api.onLoad({filter:/src\/browser\.ts$/},()=>({contents:source,loader:'ts',resolveDir:resolve('src')}));}};
const candidateBrowser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[overlay,stub(false,false)],define:{...flags(false,false),G10_WORKER_PARTS:JSON.stringify(partsByVariant),G10_INTERNATIONAL_PARTS:JSON.stringify(internationalParts)}});
const candidateScript=candidateBrowser.outputFiles[0].text.replaceAll('</script','<\\/script');
const baselineManifest=JSON.parse(await readFile('dist/corpus-pack.json','utf8'));
for(const variant of ['american','international'])assert.equal(sha256(workerSources[variant]),baselineManifest.workers[variant].sha256,'Private candidate changes no bot worker bytes');
const americanHeader=Buffer.from('<script type="application/octet-stream" id="g10-corpus-chinook">'),americanStart=head.indexOf(americanHeader);assert(americanStart>end);
const americanEnd=americanStart+americanHeader.length+4*Math.ceil(payloads.american[0].compressed.length/3),sourceFile=await open('.work/play-full-guarded.html','r'),closing=Buffer.alloc(10);await sourceFile.read(closing,0,10,americanEnd);await sourceFile.close();assert.equal(closing.toString(),'</script>\n');
await writeFile('.work/american-ready-private/original-bootstrap.js',oldScript);await writeFile('.work/american-ready-private/candidate-bootstrap.js',candidateScript);
await writeFile('.work/american-ready-private/international-parts.json',JSON.stringify(internationalParts));
await writeFile('.work/american-ready-private/bootstrap-controls.json',JSON.stringify({status:'PASS',closedAt:new Date().toISOString(),acceptedBaselineHead:'491f82f6a99c992faca4a26acf8b80dc4ecc67a1',canonicalBytes:1390845993,canonicalSha256:'5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801',bootstrap:{start,end,originalBytes:oldScript.length,originalSha256:sha256(oldScript),candidateBytes:Buffer.byteLength(candidateScript),candidateSha256:sha256(candidateScript)},american:{payloadStart:americanStart+americanHeader.length,payloadEncodedBytes:4*Math.ceil(payloads.american[0].compressed.length/3),compressedSha256:sha256(payloads.american[0].compressed),markerInsertionOffset:americanEnd+10},internationalOriginal:{files:Object.keys(internationalParts).length,parts:sourceParts.length,dataBytes:Object.values(internationalParts).reduce((n,x)=>n+x.byteLength,0)},workers:baselineManifest.workers,scope:'Private compiler/source-bound controls only. Exact accepted bootstrap rebuild and both original workers match. Complete corpus metadata is unchanged. No full-page clone or native parser/browser timing yet.'},null,2)+'\n');
console.log('PASS private strict compiler/bootstrap controls; no browser or timing');
}
