import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {mkdir,writeFile,stat,readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {sourceCommit as actualSourceCommit,stageGuards} from './check-stages.mjs';

const page=resolve(process.env.G10_HTML_OUT??'.work/play.html');
const receipt=resolve(process.env.G10_STANDALONE_RECEIPT??'.work/standalone-delivery.json');
const sourceCommit=process.env.G10_SOURCE_COMMIT,checkoutCommit=actualSourceCommit();
assert(/^[a-f0-9]{40}$/.test(sourceCommit??''),'The delivery receipt requires an exact source commit');
assert(/^[a-f0-9]{40}$/.test(checkoutCommit??''),'The delivery receipt requires an exact checkout commit');
assert.equal(checkoutCommit,sourceCommit,'Delivery must use the exact source head, not a merge or stale checkout');
const digest=createHash('sha256');for await(const bytes of createReadStream(page))digest.update(bytes);
const manifest=JSON.parse(await readFile('manifest.json','utf8'));
const acceptance=JSON.parse(await readFile(resolve(process.env.G10_EVIDENCE_DIR??'.work/checks','complete-acceptance.json'),'utf8'));
assert.equal(acceptance.status,'PASS');assert(['full','final'].includes(acceptance.stage));assert.equal(acceptance.sourceCommit,sourceCommit);
assert.equal(acceptance.workflowRunId,process.env.GITHUB_RUN_ID??null);assert.equal(acceptance.workflowRunAttempt,process.env.GITHUB_RUN_ATTEMPT??null);
assert.deepEqual(acceptance.sourceGuardsAfter,await stageGuards(),'No source/runtime/test change after complete acceptance');
const sha256=digest.digest('hex'),bytes=(await stat(page)).size;assert.equal(acceptance.htmlSha256,sha256);assert.equal(acceptance.htmlBytes,bytes);
await mkdir(dirname(receipt),{recursive:true});
await writeFile(receipt,JSON.stringify({schemaVersion:1,gameId:manifest.id??manifest.gameId,
  gameVersion:manifest.version,sourceCommit,checkoutCommit,page:'play.html',bytes,
  sha256,builtFrom:'Complete pinned source and original data in this exact checkout',
  checks:'Complete local npm test or all source-bound current workflow stages plus final independent validation passed',acceptedStages:acceptance.acceptedStages,
  publication:'GitHub Actions standalone artifact; seven-day retention; ZIP download and sign-in may be required; this is not a persistent Release asset'},null,2)+'\n');
process.stdout.write('Standalone page digest and exact-checkout receipt written.\n');
