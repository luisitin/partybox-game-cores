import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir,rename,open} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {once} from 'node:events';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {rawZipMember,pack,workerBootstrap,workerParts,sha256} from './corpus-pack.mjs';
await mkdir('dist',{recursive:true});
const alias={zod:resolve('node_modules/zod')},loader={'.bin':'binary','.idx':'text','.chunk':'base64'};
const chunkExternal={name:'immutable-international-node-chunks',setup(api){
  api.onResolve({filter:/\.chunk$/},args=>({path:'./intl-'+args.path.split('/').at(-1).replace(/\.chunk$/,'.mjs'),external:true}));
}};
const browserOnly=process.env.G10_BUILD_BROWSER_ONLY==='1';
if(!browserOnly)for(const name of (await readdir('data/international/six')).filter(name=>name.endsWith('.chunk')).sort()){
  const encoded=(await readFile('data/international/six/'+name)).toString('base64');
  await writeFile('dist/intl-'+name.replace(/\.chunk$/,'.mjs'),'export default "'+encoded+'";\n');
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
  await writeFile('dist/worker-'+variant+'.mjs',workerSources[variant]);
}
const browser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[stub(false,false)],define:{...flags(false,false),G10_WORKER_PARTS:JSON.stringify(partsByVariant),G10_INTERNATIONAL_PARTS:JSON.stringify(internationalParts)}});
const template=await readFile('src/play.template.html','utf8'),license=await readFile('node_modules/zod/LICENSE','utf8'),ownLicense=await readFile('LICENSE','utf8'),corpusTerms=await readFile('data/chinook/LICENSE.txt','utf8'),internationalTerms=await readFile('data/international/LICENSE.md','utf8'),boost=await readFile('data/international/BOOST-LICENSE.txt','utf8');
const script=browser.outputFiles[0].text.replaceAll('</script','<\\/script');
const notices='\n<!-- Bundled Zod MIT license:\n'+license+'\n-->\n<!-- Original game code/CSS/SVG MIT license:\n'+ownLicense+'\n-->\n<!-- Chinook endgame data terms and acknowledgement:\n'+corpusTerms+'\n-->\n<!-- International endgame data and dictionary terms:\n'+internationalTerms+'\n'+boost+'\n-->\n';
const htmlOut=resolve(process.env.G10_HTML_OUT??'play.html'),temporary=htmlOut+'.tmp';await mkdir(dirname(htmlOut),{recursive:true});
const destination=createWriteStream(temporary);const append=async value=>{if(!destination.write(value))await once(destination,'drain');};
const [before,after]=template.split('<!--G10_SCRIPT-->');assert(after!==undefined);
await append(before+'<script>'+script+'</script>\n');
for(const {name,compressed} of Object.values(payloads).flat())await append('<script type="application/octet-stream" id="g10-corpus-'+name+'">'+compressed.toString('base64')+'</script>\n');
for(const part of sourceParts){
  await append('<script type="application/octet-stream" id="'+part.id+'">');
  const bytes=Buffer.alloc(part.bytes),source=await open(part.path,'r');let count=0;
  try{while(count<bytes.length){const read=await source.read(bytes,count,bytes.length-count,part.fileOffset+count);assert(read.bytesRead>0,'Original source part truncated');count+=read.bytesRead;}}
  finally{await source.close();}
  // Encoding one exact bounded part avoids padding inside a short file-system
  // read, while preserving original extent and canonical byte boundaries.
  await append(bytes.toString('base64'));await append('</script>\n');
}
await append(after+notices);destination.end();await once(destination,'finish');await rename(temporary,htmlOut);
await writeFile('THIRD-PARTY-LICENSES.txt','Runtime bundle contains Zod4.6.5 under MIT.\n\n'+license+'\n\nChinook database has separate terms:\n'+corpusTerms+'\n\nInternational database/dictionary terms:\n'+internationalTerms+'\n'+boost);
await writeFile('dist/corpus-pack.json',JSON.stringify({variants:Object.fromEntries(Object.entries(payloads).map(([variant,entries])=>[variant,entries.map(({name,report})=>({name,...report}))])),internationalOriginal:{maximumPieces:6,files:Object.keys(internationalParts).sort(),dataBytes:Object.values(internationalParts).reduce((total,file)=>total+file.byteLength,0),parts:sourceParts.length},workers:Object.fromEntries(Object.entries(workerSources).map(([variant,source])=>[variant,{bytes:Buffer.byteLength(source),sha256:sha256(source)}]))},null,2)+'\n');
process.stdout.write('PASS: complete offline single-page game written to '+htmlOut+'; original six-piece data is read in bounded blocks.\n');

}
