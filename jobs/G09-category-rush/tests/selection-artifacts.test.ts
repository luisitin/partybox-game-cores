import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CATEGORIES,LETTERS} from '../content/categories';
import {nextInt,seedRng,shuffle} from '../../../contract/rng';
import {validateJsonSchema} from '../scripts/json-schema-validator';

const root=new URL('../',import.meta.url);
const read=<T>(path:string):T=>JSON.parse(readFileSync(new URL(path,root),'utf8')) as T;
const hash=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');
const fixtureHash='ff2ba2d81fb1e48b8b75bcd4b810b0dc26fa53b53de9510a634e133ef5642366';
const registeredGuards={minimumEightSeatMeanGain:1,alternativeZeroTableReductionPercentagePoints:10,
  maximumRelativeBankCoverageLoss:0.1,maximumRelativePromptCoverageLoss:0.1,minimumEntropyRatio:0.9,
  maximumBlankRateIncreasePercentagePoints:0.5,maximumNewOwnRepeats:0,
  smallRosterExactStateIdentity:true,letterAndThemeSchedulesUnchanged:true};
interface Row {seed:number;letter:string;layout:string[];themes:string[];initialRng:{seed:number;step:number};
  points:number;scores:number[];submitted:number;duplicates:number;blank:number;exhaustedBlanks:number;
  availablePoolBlanks:number;repeatedOwn:number;steps:number;eventHash:string;stateHash:string;}
interface Summary {points:number;meanPoints:number;zeroTables:number;zeroTableRate:number;zeroSeats:number;
  submitted:number;duplicates:number;duplicateOwnerRate:number;blank:number;blankRate:number;exhaustedBlanks:number;
  availablePoolBlanks:number;repeatedOwn:number;replays:number;bankCoverage:number;promptCoverage:number;
  entropyBits:number;maxBankShare:number;}
interface LetterResult {letter:string;games:number;points:number;zeroTables:number;blank:number;}
interface Exposure {bank:string;count:number;}
interface Cohort {cohort:'pilot'|'heldout';players:2|4|8;games:number;summary:Summary;perLetter:LetterResult[];exposures:Exposure[];rows:Row[];}
interface Report {protocol:string;mode:'baseline'|'candidate';sourceHashes:{core:string;matcher:string;scoring:string;data:string;experiment:string;selection:string|null};fixtureSha256:string;guards:typeof registeredGuards;cohorts:Cohort[];}
interface Plan {protocol:string;baselineCoreSha256:string;matcherSha256:string;dataSha256:string;sampler:string;
  rosters:number[];primaryWindow:number;explorationSlots:number[];pilotSeeds:number[];heldout:{seed:number;letter:string}[];guards:typeof registeredGuards;}
interface PairedLetter {letter:string;games:number;pointsBefore:number;pointsAfter:number;pointsChange:number;
  zeroTablesBefore:number;zeroTablesAfter:number;blankBefore:number;blankAfter:number;}
interface Paired {cohort:string;players:number;meanBefore:number;meanAfter:number;meanGain:number;
  zeroTableReductionPercentagePoints:number;bankCoverageBefore:number;bankCoverageAfter:number;
  bankCoverageRelativeLoss:number;promptCoverageRelativeLoss:number;entropyRatio:number;
  blankRateChangePercentagePoints:number;improved:number;worsened:number;checks:Record<string,boolean>;perLetter:PairedLetter[];}
interface Comparison {protocol:string;pilotGuardsPass:boolean;deliveryComplete:boolean;note:string;
  sourceHashes:{baseline:string;candidate:string;fixture:string;comparator:string};comparisons:Paired[];}
const total=(values:readonly number[])=>values.reduce((sum,value)=>sum+value,0);
function close(actual:number,expected:number,label:string){
  assert(Number.isFinite(actual)&&Number.isFinite(expected),label);
  assert(Math.abs(actual-expected)<=1e-12,`${label}: ${actual} != ${expected}`);
}
const scheduleCache=new Map<number,ReturnType<typeof expectedSchedule>>();
function expectedSchedule(seed:number){
  const [position,afterLetter]=nextInt(seedRng(seed+65536),0,LETTERS.length-1),letter=LETTERS[position];
  const pool=CATEGORIES.filter(category=>(category.answers[letter]?.length??0)>0),[deck,rng]=shuffle(afterLetter,pool);
  // Recover original leader order by first occurrence positions, without the production selector.
  const themeNames=deck.map(category=>category.theme);
  const leaders=deck.filter((category,index)=>themeNames.indexOf(category.theme)===index).slice(0,12);
  return {letter,deck,rng,leaders};
}
function schedule(seed:number){
  let expected=scheduleCache.get(seed);if(!expected){expected=expectedSchedule(seed);scheduleCache.set(seed,expected);}return expected;
}
function recompute(cohort:Cohort){
  const rows=cohort.rows,seatScores=rows.flatMap(row=>row.scores),games=rows.length;
  // Sorting and run-length counting differs from the producer's incremental coverage Map.
  const banks=rows.flatMap(row=>row.layout.map(id=>`${id}/${row.letter}`)).sort(),exposures:Exposure[]=[];
  for(const bank of banks){const previous=exposures.at(-1);if(previous?.bank===bank)previous.count++;else exposures.push({bank,count:1});}
  const perLetter=LETTERS.map(letter=>({letter,games:0,points:0,zeroTables:0,blank:0}));
  for(const row of rows){const bucket=perLetter.find(item=>item.letter===row.letter)!;
    bucket.games++;bucket.points+=total(row.scores);bucket.zeroTables+=Number(total(row.scores)===0);bucket.blank+=row.blank;}
  const points=total(seatScores),submitted=total(rows.map(row=>row.submitted)),blank=total(rows.map(row=>row.blank));
  // Algebraically independent Shannon expression; guard comparisons never round its value.
  const entropyBits=Math.log2(banks.length)-total(exposures.map(({count})=>count*Math.log2(count)))/banks.length;
  const summary:Summary={points,meanPoints:points/games,zeroTables:rows.filter(row=>total(row.scores)===0).length,
    zeroTableRate:rows.filter(row=>total(row.scores)===0).length/games,zeroSeats:seatScores.filter(score=>score===0).length,
    submitted,duplicates:total(rows.map(row=>row.duplicates)),duplicateOwnerRate:total(rows.map(row=>row.duplicates))/submitted,
    blank,blankRate:blank/(games*cohort.players*12),exhaustedBlanks:total(rows.map(row=>row.exhaustedBlanks)),
    availablePoolBlanks:total(rows.map(row=>row.availablePoolBlanks)),repeatedOwn:total(rows.map(row=>row.repeatedOwn)),replays:games,
    bankCoverage:exposures.length,promptCoverage:new Set(rows.flatMap(row=>row.layout)).size,entropyBits,
    maxBankShare:Math.max(...exposures.map(({count})=>count))/banks.length};
  return {summary,exposures,perLetter};
}
function verifyReport(report:Report,mode:Report['mode'],plan:Plan,schema:unknown){
  assert.deepEqual(validateJsonSchema(schema,report),[],`${mode} report schema`);
  assert.equal(report.mode,mode);assert.equal(report.fixtureSha256,fixtureHash);assert.deepEqual(report.guards,registeredGuards);
  const expectedSources={core:hash(mode==='baseline'?'evidence/breadth-lexical-core.ts':'src/index.ts'),
    matcher:hash(mode==='baseline'?'evidence/breadth-lexical-match.ts':'src/match.ts'),scoring:hash('src/scoring.ts'),
    data:hash('content/categories.json'),experiment:hash('scripts/selection-revision-experiment.ts'),
    selection:mode==='baseline'?null:hash('src/select.ts')};
  assert.deepEqual(report.sourceHashes,expectedSources,`${mode} actual source binding`);
  assert.equal(report.sourceHashes.matcher,plan.matcherSha256);assert.equal(report.sourceHashes.data,plan.dataSha256);
  if(mode==='baseline')assert.equal(report.sourceHashes.core,plan.baselineCoreSha256);
  const statistics:ReturnType<typeof recompute>[]=[];
  for(const cohort of report.cohorts){
    const seeds=cohort.cohort==='pilot'?plan.pilotSeeds:plan.heldout.map(row=>row.seed);
    assert.equal(cohort.games,seeds.length);assert.deepEqual(cohort.rows.map(row=>row.seed),seeds);
    const sourceById=new Map(CATEGORIES.map(category=>[category.id,category]));
    for(const row of cohort.rows){
      assert.equal(row.scores.length,cohort.players);assert.equal(total(row.scores),row.points);
      assert.equal(row.submitted+row.blank,cohort.players*12);
      assert.equal(row.blank,row.exhaustedBlanks+row.availablePoolBlanks);
      assert(row.duplicates<=row.submitted);assert(row.repeatedOwn<=row.submitted);
      assert(row.points<=row.submitted-row.duplicates);
      assert.equal(row.steps,13*cohort.players+1,'one submission and twelve ballots per actual seat, then score timer');
      assert.equal(new Set(row.layout).size,12);assert.equal(new Set(row.themes).size,12);
      const expected=schedule(row.seed);assert.equal(row.letter,expected.letter);assert.deepEqual(row.initialRng,expected.rng);
      assert.deepEqual(row.themes,expected.leaders.map(category=>category.theme));
      row.layout.forEach((id,slot)=>{
        const category=sourceById.get(id);assert(category,`${mode} unknown category ${id}`);
        assert.equal(category.theme,row.themes[slot]);assert((category.answers[row.letter]?.length??0)>0);
        if(mode==='baseline'||cohort.players===2||[0,3,6,9].includes(slot))assert.equal(id,expected.leaders[slot].id);
        else assert(expected.deck.filter(card=>card.theme===category.theme).slice(0,3).some(card=>card.id===id));
      });
      if(cohort.cohort==='heldout')assert.equal(row.letter,plan.heldout.find(item=>item.seed===row.seed)!.letter);
      assert.match(row.eventHash,/^[0-9a-f]{64}$/);assert.match(row.stateHash,/^[0-9a-f]{64}$/);
    }
    const computed=recompute(cohort);
    for(const key of Object.keys(computed.summary) as (keyof Summary)[]){
      if(key==='entropyBits')close(cohort.summary[key],computed.summary[key],`${mode}/${cohort.cohort}/${cohort.players}/${key}`);
      else assert.equal(cohort.summary[key],computed.summary[key],`${mode}/${cohort.cohort}/${cohort.players}/${key}`);
    }
    assert.deepEqual(cohort.exposures,computed.exposures);assert.deepEqual(cohort.perLetter,computed.perLetter);
    if(cohort.cohort==='heldout')assert(cohort.perLetter.every(row=>row.games===40));
    statistics.push(computed);
  }
  return statistics;
}
function guardChecks(before:Summary,after:Summary,games:number,players:number){
  // Integer numerator comparisons retain exact boundary outcomes instead of rounded displayed rates.
  return {coverage:after.bankCoverage*100>=before.bankCoverage*(100-registeredGuards.maximumRelativeBankCoverageLoss*100),
    prompts:after.promptCoverage*100>=before.promptCoverage*(100-registeredGuards.maximumRelativePromptCoverageLoss*100),
    entropy:after.entropyBits>=before.entropyBits*registeredGuards.minimumEntropyRatio,
    blanks:(after.blank-before.blank)*100<=games*players*12*registeredGuards.maximumBlankRateIncreasePercentagePoints,
    ownRepeat:after.repeatedOwn-before.repeatedOwn<=registeredGuards.maximumNewOwnRepeats,
    gain:players!==8||(after.points-before.points)>=games*registeredGuards.minimumEightSeatMeanGain||
      (before.zeroTables-after.zeroTables)*100>=games*registeredGuards.alternativeZeroTableReductionPercentagePoints};
}

test('selection artifacts: complete canonical rows schema source hashes independent statistics and exact paired guards',()=>{
  const schema=read<unknown>('evidence/selection-report.schema.json'),plan=read<Plan>('evidence/selection-revision-seeds.json');
  assert.equal(hash('evidence/selection-revision-seeds.json'),fixtureHash);
  assert.equal(plan.protocol,'theme-window-k3-exploration4-v2');assert.equal(plan.sampler,'actual unmodified sharp bot');
  assert.deepEqual(plan.rosters,[2,4,8]);assert.equal(plan.primaryWindow,3);assert.deepEqual(plan.explorationSlots,[0,3,6,9]);
  assert.deepEqual(plan.guards,registeredGuards);assert.deepEqual(plan.pilotSeeds,Array.from({length:200},(_,i)=>i+1));
  assert.equal(plan.heldout.length,800);assert.equal(new Set(plan.heldout.map(row=>row.seed)).size,800);
  assert(plan.heldout.every((row,i)=>row.seed>=2000001&&(i===0||row.seed>plan.heldout[i-1].seed)));
  for(const letter of LETTERS)assert.equal(plan.heldout.filter(row=>row.letter===letter).length,40);
  const pack=read<{letters:string[];categories:unknown[]}>('content/categories.json');
  assert.deepEqual(pack.letters,LETTERS);assert.deepEqual(pack.categories,CATEGORIES);
  const baseline=read<Report>('evidence/selection-revision-baseline.json'),candidate=read<Report>('evidence/selection-revision-candidate.json');
  const beforeStats=verifyReport(baseline,'baseline',plan,schema),afterStats=verifyReport(candidate,'candidate',plan,schema);
  const comparison=read<Comparison>('evidence/selection-revision-comparison.json');
  assert.equal(comparison.protocol,'theme-window-k3-exploration4-comparison-v2');assert.equal(comparison.deliveryComplete,false);
  assert.deepEqual(comparison.sourceHashes,{baseline:hash('evidence/selection-revision-baseline.json'),
    candidate:hash('evidence/selection-revision-candidate.json'),fixture:fixtureHash,comparator:hash('scripts/compare-selection.mjs')});
  assert.equal(comparison.comparisons.length,6);const allChecks:boolean[]=[];
  for(let index=0;index<6;index++){
    const before=baseline.cohorts[index],after=candidate.cohorts[index],paired=comparison.comparisons[index];
    assert.equal(before.cohort,after.cohort);assert.equal(before.players,after.players);
    assert.equal(paired.cohort,before.cohort);assert.equal(paired.players,before.players);
    let improved=0,worsened=0;
    before.rows.forEach((row,i)=>{const next=after.rows[i];
      assert.equal(row.seed,next.seed);assert.equal(row.letter,next.letter);assert.deepEqual(row.themes,next.themes);
      assert.deepEqual(row.initialRng,next.initialRng);
      if(before.players===2)assert.deepEqual(row,next,'small-roster complete row, event hash and state hash identity');
      improved+=Number(total(next.scores)>total(row.scores));worsened+=Number(total(next.scores)<total(row.scores));
    });
    const a=beforeStats[index].summary,b=afterStats[index].summary,games=before.rows.length;
    const expected={meanBefore:a.points/games,meanAfter:b.points/games,meanGain:(b.points-a.points)/games,
      zeroTableReductionPercentagePoints:100*(a.zeroTables-b.zeroTables)/games,
      bankCoverageBefore:a.bankCoverage,bankCoverageAfter:b.bankCoverage,bankCoverageRelativeLoss:(a.bankCoverage-b.bankCoverage)/a.bankCoverage,
      promptCoverageRelativeLoss:(a.promptCoverage-b.promptCoverage)/a.promptCoverage,entropyRatio:b.entropyBits/a.entropyBits,
      blankRateChangePercentagePoints:100*(b.blank-a.blank)/(games*before.players*12),improved,worsened};
    for(const key of Object.keys(expected) as (keyof typeof expected)[])close(paired[key],expected[key],`${before.cohort}/${before.players}/${key}`);
    const checks=guardChecks(a,b,games,before.players);assert.deepEqual(paired.checks,checks);allChecks.push(...Object.values(checks));
    assert.deepEqual(paired.perLetter,beforeStats[index].perLetter.map((row,i)=>{const next=afterStats[index].perLetter[i];
      assert.equal(row.games,next.games);return {letter:row.letter,games:row.games,pointsBefore:row.points,pointsAfter:next.points,
        pointsChange:next.points-row.points,zeroTablesBefore:row.zeroTables,zeroTablesAfter:next.zeroTables,blankBefore:row.blank,blankAfter:next.blank};}));
  }
  assert.equal(comparison.pilotGuardsPass,allChecks.every(Boolean));assert(allChecks.every(Boolean),'registered revision guard failure');

  // Negative examples demonstrate structural, source and raw-statistic checks fail independently.
  const badRow=(changes:Partial<Row>)=>({...candidate,cohorts:candidate.cohorts.map((cohort,i)=>i?cohort:
    {...cohort,rows:cohort.rows.map((row,j)=>j?row:{...row,...changes})})});
  for(const changes of [{letter:'Q'},{points:0.5},{stateHash:'short'},{scores:[0]},{steps:201}])
    assert(validateJsonSchema(schema,badRow(changes)).length>0,`schema accepted ${JSON.stringify(changes)}`);
  assert(validateJsonSchema(schema,{...candidate,cohorts:candidate.cohorts.slice(1)}).length>0);
  assert(validateJsonSchema(schema,{...candidate,sourceHashes:{...candidate.sourceHashes,selection:null}}).length>0);
  assert.throws(()=>verifyReport({...candidate,sourceHashes:{...candidate.sourceHashes,core:'0'.repeat(64)}},'candidate',plan,schema),/source binding/);
  assert.throws(()=>verifyReport(badRow({points:candidate.cohorts[0].rows[0].points+1}),'candidate',plan,schema));
  const badEntropy={...candidate,cohorts:candidate.cohorts.map((cohort,i)=>i?cohort:
    {...cohort,summary:{...cohort.summary,entropyBits:cohort.summary.entropyBits+1e-6}})};
  assert.throws(()=>verifyReport(badEntropy,'candidate',plan,schema),/entropyBits/);
  const summary=beforeStats[5].summary,constant={...summary,bankCoverage:100,promptCoverage:100,entropyBits:10};
  assert.equal(guardChecks(constant,{...constant,bankCoverage:90},800,8).coverage,true);
  assert.equal(guardChecks(constant,{...constant,bankCoverage:89},800,8).coverage,false);
  assert.equal(guardChecks(constant,{...constant,promptCoverage:89},800,8).prompts,false);
  assert.equal(guardChecks(constant,{...constant,entropyBits:8.999999999999},800,8).entropy,false);
  assert.equal(guardChecks(constant,{...constant,blank:constant.blank+384},800,8).blanks,true);
  assert.equal(guardChecks(constant,{...constant,blank:constant.blank+385},800,8).blanks,false);
  assert.equal(guardChecks(constant,{...constant,repeatedOwn:constant.repeatedOwn+1},800,8).ownRepeat,false);
  assert.equal(guardChecks(constant,{...constant,points:constant.points+799},800,8).gain,false);
  assert.equal(guardChecks(constant,{...constant,points:constant.points+800},800,8).gain,true);
  assert.equal(guardChecks(constant,{...constant,zeroTables:constant.zeroTables-79},800,8).gain,false);
  assert.equal(guardChecks(constant,{...constant,zeroTables:constant.zeroTables-80},800,8).gain,true);
});
