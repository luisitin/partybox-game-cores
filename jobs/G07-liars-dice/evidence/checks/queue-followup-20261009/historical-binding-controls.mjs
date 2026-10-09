import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {readReportAndRaw,readSourceGuards,validateBrowserEvidence,validateHistoricalBrowserEvidence,LEGACY_RUNNER_SHA256} from '../../../scripts/browser-evidence.mjs';

// Only genuine saved measurements are positive controls. This is a read-only
// cross-source check; it never runs a browser or creates replacement frames.
const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];}));
assert(args['--historical-source']&&args['--first-current-report']);
const root=resolve(args['--historical-source']),first=await readReportAndRaw(resolve(args['--first-current-report']));
const historical=await readReportAndRaw('evidence/browser/historical-runner-f8a8d602/report.json');
const sha=b=>createHash('sha256').update(b).digest('hex');
const pins={
 'play.html':'33f5e801d975192c26fd6eaf297086a81d828f7a1074b8b4328e20baf6c7d37a',
 'dist/core.mjs':'947f4f6fabf7d6eb0264a7175df2bb4003e918be7fa4dda1fc23acee83d5c076',
 'dist/session.mjs':'d636bfba62a0854a9d5dfff51b5f0915a8bc76f58f4c32885c89ebb8a47fe2e8',
};
for(const [p,h] of Object.entries(pins))assert.equal(sha(await readFile(resolve(root,p))),h,'actual original source '+p);
const pass=validateHistoricalBrowserEvidence(historical.report,historical.raw,pins,LEGACY_RUNNER_SHA256);
const current={};for(const p of Object.keys(pins))current[p]=sha(await readFile(p));
assert.throws(()=>validateHistoricalBrowserEvidence(historical.report,historical.raw,current,LEGACY_RUNNER_SHA256),/report belongs to the actual page/);
for(const p of Object.keys(pins))assert.throws(()=>validateHistoricalBrowserEvidence(historical.report,historical.raw,{...pins,[p]:'0'.repeat(64)},LEGACY_RUNNER_SHA256));
const guards=await readSourceGuards();
assert.throws(()=>validateBrowserEvidence(historical.report,historical.raw,guards));
// Changing integrity itself changes a current source guard. The genuine f123
// packet must not certify this corrected checker; its new full CI is required.
assert.throws(()=>validateBrowserEvidence(first.report,first.raw,guards));
const receipt={passed:true,checkedAt:new Date().toISOString(),historicalGuards:pins,genuineHistoricalChecks:pass.checks,genuineHistoricalRawIntervals:pass.rawIntervals,oldIncorrectCurrentBindingRejected:true,allThreeWrongHistoricalIdentitiesRejected:true,historicalCannotCertifyCurrent:true,firstCurrentPacketCannotCertifyChangedChecker:true,nativeSamplerRerun:false};
await writeFile('evidence/checks/queue-followup-20261009/historical-binding-controls.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
