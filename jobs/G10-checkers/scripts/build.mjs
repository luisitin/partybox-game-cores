import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('dist',{recursive:true});
const alias={zod:resolve('node_modules/zod')};
const loader={'.bin':'binary','.idx':'text'};
const externalEndgame={name:'shared-node-endgame',setup(api){api.onResolve({filter:/endgame\.js$/},()=>({path:'./endgame.mjs',external:true}));}};
for(const name of ['core','moves','draws','bots','endgame','retrograde','schema','chinook']){
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'.mjs',alias,loader,define:{G10_CORPUS_ENABLED:'true'},plugins:name==='endgame'?[]:[externalEndgame]});
}
await build({entryPoints:['../../contract/contract.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/contract.mjs',alias});
const worker=await build({entryPoints:['src/bot-worker.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,define:{G10_CORPUS_ENABLED:'true'}});
const hostCorpusStub={name:'human-host-corpus-stub',setup(api){api.onLoad({filter:/data\/chinook\/(DB6\.bin|DB6\.idx)$/},()=>({contents:'export default null;',loader:'js'}));}};
const browser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,loader,plugins:[hostCorpusStub],define:{G10_CORPUS_ENABLED:'false',G10_WORKER_SOURCE:JSON.stringify(worker.outputFiles[0].text)}});
const template=await readFile('src/play.template.html','utf8'),license=await readFile('node_modules/zod/LICENSE','utf8'),ownLicense=await readFile('LICENSE','utf8'),corpusTerms=await readFile('data/chinook/LICENSE.txt','utf8');
const script=browser.outputFiles[0].text.replaceAll('</script','<\\/script');
await writeFile('play.html',template.replace('<!--G10_SCRIPT-->',()=>'<script>'+script+'</script>')+
  '\n<!-- Bundled Zod MIT license:\n'+license+'\n-->\n<!-- Original game code/CSS/SVG MIT license:\n'+ownLicense+'\n-->\n<!-- Chinook endgame data terms and acknowledgement:\n'+corpusTerms+'\n-->\n');
await writeFile('THIRD-PARTY-LICENSES.txt','Runtime bundle contains Zod4.6.5 under MIT.\n\n'+license+'\n\nChinook database has separate terms:\n'+corpusTerms);
