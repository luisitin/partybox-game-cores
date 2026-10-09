import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

export async function checkEvidenceLinks(){
 const root=resolve('.'),index=resolve('evidence/resume-20261008/INDEX.md');
 const text=await readFile(index,'utf8');let localLinks=0,externalLinks=0;
 for(const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){
  const href=match[1];if(/^https?:\/\//.test(href)){externalLinks++;continue;}
  const target=resolve(dirname(index),href),inside=relative(root,target);
  assert(!inside.startsWith('..')&&!inside.startsWith('/'),'index link leaves the job');
  assert((await stat(target)).isFile(),'index link must name an existing file: '+href);localLinks++;
 }
 assert(localLinks>0,'proof index has no local links');
 return {suite:'evidence-links',localLinks,allLocalFilesExist:true,externalLinks,externalLinksFetched:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await checkEvidenceLinks()));
