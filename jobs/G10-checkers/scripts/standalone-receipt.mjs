import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {mkdir,writeFile,stat,readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';

const page=resolve(process.env.G10_HTML_OUT??'.work/play.html');
const receipt=resolve(process.env.G10_STANDALONE_RECEIPT??'.work/standalone-delivery.json');
const sourceCommit=process.env.G10_SOURCE_COMMIT,checkoutCommit=process.env.GITHUB_SHA??sourceCommit;
assert(/^[a-f0-9]{40}$/.test(sourceCommit??''),'The delivery receipt requires an exact source commit');
assert(/^[a-f0-9]{40}$/.test(checkoutCommit??''),'The delivery receipt requires an exact checkout commit');
const digest=createHash('sha256');for await(const bytes of createReadStream(page))digest.update(bytes);
const manifest=JSON.parse(await readFile('manifest.json','utf8'));
await mkdir(dirname(receipt),{recursive:true});
await writeFile(receipt,JSON.stringify({schemaVersion:1,gameId:manifest.id??manifest.gameId,
  gameVersion:manifest.version,sourceCommit,checkoutCommit,page:'play.html',bytes:(await stat(page)).size,
  sha256:digest.digest('hex'),builtFrom:'Complete pinned source and original data in this exact checkout',
  checks:'This receipt is generated only after the complete npm test command succeeds in the workflow',
  publication:'GitHub Actions standalone artifact; seven-day retention; ZIP download and sign-in may be required; this is not a persistent Release asset'},null,2)+'\n');
process.stdout.write('Standalone page digest and exact-checkout receipt written.\n');
