import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
const p=(name:string)=>fileURLToPath(new URL(name,import.meta.url));
export default defineConfig({resolve:{alias:[{find:'zod',replacement:p('./node_modules/zod/index.js')},{find:'@partybox/game-sdk/ui/table3d',replacement:p('./start/test-support/table3d.tsx')},{find:'@partybox/game-sdk/ui',replacement:p('./start/test-support/ui.tsx')},{find:'@partybox/game-sdk/speech',replacement:p('./start/test-support/speech.ts')},{find:'@partybox/game-sdk',replacement:p('./start/test-support/sdk.ts')}]},test:{setupFiles:['start/test-support/yield.ts'],include:['start/**/*.test.ts','start/**/*.test.js'],pool:'forks',maxWorkers:2,testTimeout:120000}});
