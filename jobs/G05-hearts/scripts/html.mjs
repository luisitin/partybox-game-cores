import {build} from 'esbuild';import assert from 'node:assert/strict';import {readFileSync,writeFileSync}from'node:fs';
const result=await build({entryPoints:['src/browser.ts'],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,write:false,legalComments:'inline'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');const template=readFileSync('ui/play.template.html','utf8');
if(!template.includes('/*__SCRIPT__*/'))throw new Error('missing script slot');
const license=readFileSync('node_modules/zod/LICENSE','utf8');
const page=template.replace('/*__SCRIPT__*/',()=>`/* Bundled dependency: zod4.6.5\n${license.replace(/\*\//g,'* /')} */\n${js}`);
assert.equal(page.split('id="start-table"').length-1,1,'script insertion must not expand replacement dollar tokens');
if(process.argv.includes('--check'))assert.equal(readFileSync('play.html','utf8'),page,'committed standalone page has drifted');else writeFileSync('play.html',page);
console.log(JSON.stringify({standaloneBytes:Buffer.byteLength(readFileSync('play.html')),inline:true}));
