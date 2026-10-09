import {resolve} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
export function evidence(name,value){const directory=process.env.G10_EVIDENCE_DIR?resolve(process.env.G10_EVIDENCE_DIR):new URL('../evidence/checks/',import.meta.url);mkdirSync(directory,{recursive:true});const path=typeof directory==='string'?resolve(directory,name):new URL(name,directory);writeFileSync(path,JSON.stringify(value,null,2)+'\n');}
