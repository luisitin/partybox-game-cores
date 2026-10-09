import assert from 'node:assert/strict';
import {build} from 'esbuild';
import type {z} from 'zod';
import type {GameManifest} from '../../contract/contract.ts';
import {manifest} from './core.ts';
// Shared sources use bundler resolution. Keep them byte-identical and bundle
// their actual schema for Node's verification runtime, rather than copy it.
const compiled=await build({entryPoints:['../../contract/contract.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',write:false});
const schemas=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles![0]!.text).toString('base64'));
export const manifestSchema=schemas.gameManifestSchema as z.ZodType<GameManifest>;
assert(manifestSchema.safeParse(manifest).success,'actual shared manifest schema must accept the game');
