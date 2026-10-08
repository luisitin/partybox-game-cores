import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('dist',{recursive:true});
const alias={zod:resolve('node_modules/zod')};
for(const name of ['core','moves','draws','bots','endgame','retrograde']){
  await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'.mjs',alias});
}
await build({entryPoints:['../../contract/contract.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/contract.mjs',alias});
const worker=await build({entryPoints:['src/bot-worker.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias});
const browser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias,define:{G10_WORKER_SOURCE:JSON.stringify(worker.outputFiles[0].text)}});
const template=await readFile('src/play.template.html','utf8'),license=await readFile('node_modules/zod/LICENSE','utf8'),ownLicense=await readFile('LICENSE','utf8');
const script=browser.outputFiles[0].text.replaceAll('</script','<\\/script');
await writeFile('play.html',template.replace('<!--G10_SCRIPT-->',()=>'<script>'+script+'</script>')+
  '\n<!-- Bundled Zod MIT license:\n'+license+'\n-->\n<!-- Original game code/CSS/SVG MIT license:\n'+ownLicense+'\n-->\n');
await writeFile('THIRD-PARTY-LICENSES.txt','Runtime bundle contains Zod4.6.5 under MIT.\n\n'+license);
