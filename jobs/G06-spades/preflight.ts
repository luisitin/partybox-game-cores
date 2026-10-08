import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const result=await build({stdin:{contents:"export {gameManifestSchema as manifestSchema} from '../../contract/contract.ts';",resolveDir:fileURLToPath(new URL('.',import.meta.url))},bundle:true,write:false,platform:'node',format:'esm',target:'es2022'});
export const manifestSchema=(await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0]!.text).toString('base64'))).manifestSchema as typeof import('../../contract/contract.ts').gameManifestSchema;
