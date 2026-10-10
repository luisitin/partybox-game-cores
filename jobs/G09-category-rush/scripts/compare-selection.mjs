/** Compare registered actual-core reports without changing their outcomes. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const sha=name=>createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex');
const basePath='evidence/selection-revision-baseline.json',afterPath='evidence/selection-revision-candidate.json';
const baseline=read(basePath),candidate=read(afterPath),plan=read('evidence/selection-revision-seeds.json');
assert.equal(baseline.fixtureSha256,candidate.fixtureSha256);
assert.deepEqual(baseline.guards,plan.guards);assert.deepEqual(candidate.guards,plan.guards);
const guards=plan.guards,comparisons=[];
for(const before of baseline.cohorts){
  const after=candidate.cohorts.find(row=>row.cohort===before.cohort&&row.players===before.players);
  assert(after);assert.equal(before.rows.length,after.rows.length);
  let improved=0,worsened=0;
  for(let i=0;i<before.rows.length;i++){
    const a=before.rows[i],b=after.rows[i];
    assert.equal(a.seed,b.seed);assert.equal(a.letter,b.letter);
    assert.deepEqual(a.themes,b.themes);assert.deepEqual(a.initialRng,b.initialRng);
    if(before.players===2)assert.deepEqual(a,b);
    improved+=Number(b.points>a.points);worsened+=Number(b.points<a.points);
  }
  const a=before.summary,b=after.summary;
  const bankCoverageRelativeLoss=(a.bankCoverage-b.bankCoverage)/a.bankCoverage;
  const promptCoverageRelativeLoss=(a.promptCoverage-b.promptCoverage)/a.promptCoverage;
  const meanGain=b.meanPoints-a.meanPoints;
  const zeroTableReductionPercentagePoints=100*(a.zeroTableRate-b.zeroTableRate);
  const checks={
    coverage:bankCoverageRelativeLoss<=guards.maximumRelativeBankCoverageLoss,
    prompts:promptCoverageRelativeLoss<=guards.maximumRelativePromptCoverageLoss,
    entropy:b.entropyBits>=a.entropyBits*guards.minimumEntropyRatio,
    blanks:100*(b.blankRate-a.blankRate)<=guards.maximumBlankRateIncreasePercentagePoints,
    ownRepeat:b.repeatedOwn-a.repeatedOwn<=guards.maximumNewOwnRepeats,
    gain:before.players!==8||meanGain>=guards.minimumEightSeatMeanGain||zeroTableReductionPercentagePoints>=guards.alternativeZeroTableReductionPercentagePoints,
  };
  comparisons.push({cohort:before.cohort,players:before.players,meanBefore:a.meanPoints,meanAfter:b.meanPoints,meanGain,zeroTableReductionPercentagePoints,bankCoverageBefore:a.bankCoverage,bankCoverageAfter:b.bankCoverage,bankCoverageRelativeLoss,promptCoverageRelativeLoss,entropyRatio:b.entropyBits/a.entropyBits,blankRateChangePercentagePoints:100*(b.blankRate-a.blankRate),improved,worsened,checks,perLetter:before.perLetter.map((row,i)=>{const next=after.perLetter[i];assert.equal(row.letter,next.letter);assert.equal(row.games,next.games);return {letter:row.letter,games:row.games,pointsBefore:row.points,pointsAfter:next.points,pointsChange:next.points-row.points,zeroTablesBefore:row.zeroTables,zeroTablesAfter:next.zeroTables,blankBefore:row.blank,blankAfter:next.blank};})});
}
assert.equal(comparisons.length,6);
const result={protocol:'theme-window-k3-exploration4-comparison-v2',pilotGuardsPass:comparisons.every(row=>Object.values(row.checks).every(Boolean)),deliveryComplete:false,note:'Passing registered pilot guards does not establish completed player gain; full changed-source checks and exact-source browser proof remain required.',sourceHashes:{baseline:sha(basePath),candidate:sha(afterPath),fixture:sha('evidence/selection-revision-seeds.json'),comparator:sha('scripts/compare-selection.mjs')},comparisons};
const output=JSON.stringify(result,null,2)+'\n',target=new URL('evidence/selection-revision-comparison.json',root);
if(process.argv.includes('--check'))assert.equal(readFileSync(target,'utf8'),output);else writeFileSync(target,output);
console.log(JSON.stringify({pilotGuardsPass:result.pilotGuardsPass,deliveryComplete:false,comparisons:comparisons.map(({cohort,players,meanGain,bankCoverageRelativeLoss,worsened})=>({cohort,players,meanGain,bankCoverageRelativeLoss,worsened}))}));
assert(result.pilotGuardsPass,'Registered limits failed; retain the attempted policy as a rejected study');
