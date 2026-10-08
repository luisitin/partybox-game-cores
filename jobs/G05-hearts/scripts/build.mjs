import {build} from 'esbuild';
await build({entryPoints:['../../contract/contract.ts'],bundle:true,format:'esm',platform:'node',target:'es2022',external:['zod'],outfile:'.build/contract-validation.mjs'});
