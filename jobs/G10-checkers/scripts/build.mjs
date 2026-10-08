import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {rawZipMember,pack,workerBootstrap,workerParts,sha256} from './corpus-pack.mjs';
await mkdir('dist',{recursive:true});
const alias={zod:resolve('node_modules/zod')},loader={'.bin':'binary','.idx':'text'};
const flags=(american,international)=>({G10_CHINOOK_ENABLED:String(american),G10_INTERNATIONAL_ENABLED:String(international)});
const sharedEndgame=path=>({name:'shared-node-endgame',setup(api){api.onResolve({filter:/endgame\.js$/},()=>({path,external:true}));}});
const stub=(american,international)=>({name:'unused-corpus-stub',setup(api){
  api.onLoad({filter:/data\/(chinook|international)\/[^/]+\.(bin|idx)$/},args=>{
    if((args.path.includes('/chinook/')&&!american)||(args.path.includes('/international/')&&!international))return {contents:'export default null;',loader:'js'};
  });
}});
for(const name of ['core','moves','draws','bots','endgame','retrograde','schema','chinook','international']){
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'.mjs',alias,loader,define:flags(true,true),plugins:name==='endgame'?[]:[sharedEndgame('./endgame.mjs')]});
}
for(const variant of ['american','international'])for(const name of ['endgame','core','bots']){
  const american=variant==='american';
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'-'+variant+'.mjs',alias,loader,define:flags(american,!american),plugins:[stub(american,!american),...(name==='endgame'?[]:[sharedEndgame('./endgame-'+variant+'.mjs')])]});
}
await build({entryPoints:['../../contract/contract.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/contract.mjs',alias});
const archive=await readFile('data/chinook/DB6.zip');assert.equal(sha256(archive),'35835dae65a962eafdf5cde290bce380117445acb21819dd0e266b3b0efab3b3');
const original=rawZipMember(archive,'DB6'),americanBytes=await readFile('data/chinook/DB6.bin');assert.equal(original.uncompressed,americanBytes.length);
const payloads={american:[{name:'chinook',...pack(americanBytes,original.compressed)}],international:[]};
for(const name of ['db2','db3','db4','db5','tunstall-v2'])payloads.international.push({name,...pack(await readFile('data/international/'+name+'.bin'))});
const workerSources={},partsByVariant={};
for(const variant of ['american','international']){
  const american=variant==='american',compressedData={name:'worker-injected-bytes',setup(api){
    api.onLoad({filter:/data\/(chinook|international)\/[^/]+\.bin$/},args=>{
      const section=args.path.includes('/chinook/')?'chinook':'international';
      if((section==='chinook')!==american)return {contents:'export default null;',loader:'js'};
      const name=section==='chinook'?'chinook':args.path.split('/').at(-1).replace(/\.bin$/,'');
      return {contents:'export default G10_DATABASE_BYTES['+JSON.stringify(name)+'];',loader:'js'};
    });
  }};
  const worker=await build({entryPoints:['src/bot-worker.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[compressedData,stub(american,!american)],define:flags(american,!american)});
  workerSources[variant]=workerBootstrap(worker.outputFiles[0].text,payloads[variant]);
  partsByVariant[variant]=workerParts(worker.outputFiles[0].text,payloads[variant].map(value=>value.name));
  await writeFile('dist/worker-'+variant+'.mjs',workerSources[variant]);
}
const browser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[stub(false,false)],define:{...flags(false,false),G10_WORKER_PARTS:JSON.stringify(partsByVariant)}});
const template=await readFile('src/play.template.html','utf8'),license=await readFile('node_modules/zod/LICENSE','utf8'),ownLicense=await readFile('LICENSE','utf8'),corpusTerms=await readFile('data/chinook/LICENSE.txt','utf8'),internationalTerms=await readFile('data/international/LICENSE.md','utf8'),boost=await readFile('data/international/BOOST-LICENSE.txt','utf8');
const script=browser.outputFiles[0].text.replaceAll('</script','<\\/script');
const notices='\n<!-- Bundled Zod MIT license:\n'+license+'\n-->\n<!-- Original game code/CSS/SVG MIT license:\n'+ownLicense+'\n-->\n<!-- Chinook endgame data terms and acknowledgement:\n'+corpusTerms+'\n-->\n<!-- International endgame data and dictionary terms:\n'+internationalTerms+'\n'+boost+'\n-->\n';
const dataTags=Object.values(payloads).flat().map(({name,compressed})=>'<script type="application/octet-stream" id="g10-corpus-'+name+'">'+compressed.toString('base64')+'</script>').join('\n');
await writeFile('play.html',template.replace('<!--G10_SCRIPT-->',()=>'<script>'+script+'</script>\n'+dataTags)+notices);
await writeFile('THIRD-PARTY-LICENSES.txt','Runtime bundle contains Zod4.6.5 under MIT.\n\n'+license+'\n\nChinook database has separate terms:\n'+corpusTerms+'\n\nInternational database/dictionary terms:\n'+internationalTerms+'\n'+boost);
await writeFile('dist/corpus-pack.json',JSON.stringify({variants:Object.fromEntries(Object.entries(payloads).map(([variant,entries])=>[variant,entries.map(({name,report})=>({name,...report}))])),workers:Object.fromEntries(Object.entries(workerSources).map(([variant,source])=>[variant,{bytes:Buffer.byteLength(source),sha256:sha256(source)}]))},null,2)+'\n');
