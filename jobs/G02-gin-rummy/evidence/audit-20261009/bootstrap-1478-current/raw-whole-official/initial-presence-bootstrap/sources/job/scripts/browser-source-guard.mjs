import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Production/bundled outputs, every local transitive browser-check dependency,
// and the build/dependency/workflow inputs that define this exact proof.
export const browserSourcePaths=[
 'play.html','src/core.ts','src/cards.ts','src/browser.ts','src/play.template.html',
 '../../contract/contract.ts','../../contract/constants.ts','../../contract/rng.ts',
 '../../contract/minigame-schema.ts','../../contract/player-count-schema.ts',
 'dist/core.mjs','dist/cards.mjs','dist/contract.mjs',
 'scripts/browser-check.mjs','scripts/clock-check.mjs','scripts/meld-check.mjs',
 'scripts/results-check.mjs','scripts/name-check.mjs','scripts/host-check.mjs',
 'scripts/public-history-check.mjs','tests/browser-fixture.mjs','tests/helpers.mjs',
 'scripts/browser-source-guard.mjs','scripts/frame-coordination.mjs',
 'scripts/strict-browser-proof.mjs','scripts/browser-proof.mjs','scripts/capture.mjs',
 'scripts/build.mjs','scripts/integrity.mjs','scripts/check-evidence-links.mjs',
 'package.json','package-lock.json','tsconfig.json','manifest.json',
 '../../.github/workflows/G02.yml'
];
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function browserSourceHashes(){
 return Object.fromEntries(await Promise.all(browserSourcePaths.map(async path=>[path,sha256(await readFile(path))])));
}
