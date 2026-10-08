import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('dist',{recursive:true});
const alias={zod:resolve('node_modules/zod')};
for(const name of ['core','probability','rules']) {
 await build({entryPoints:['src/'+name+'.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/'+name+'.mjs',alias});
}
await build({entryPoints:['../../contract/contract.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:'dist/contract.mjs',alias});
const browser=await build({entryPoints:['src/browser.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,write:false,alias});
const template=await readFile('src/play.template.html','utf8');
const script=browser.outputFiles[0].text.replaceAll('</script','<\\/script');
const license=await readFile('node_modules/zod/LICENSE','utf8');
const html=template.replace('<!--G07_SCRIPT-->',()=>'<script>'+script+'</script>');
await writeFile('play.html',html.includes(license)?html:html+'\n<!-- Bundled Zod MIT license:\n'+license+'\n-->\n');
await writeFile('THIRD-PARTY-LICENSES.txt','Runtime bundle contains Zod 4.6.5, under the following MIT notice.\n\n'+license);
