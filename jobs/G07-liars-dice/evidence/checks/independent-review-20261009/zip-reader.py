from pathlib import Path,PurePosixPath
import json,hashlib,math,datetime,argparse,zipfile,stat
parser=argparse.ArgumentParser();parser.add_argument('--base',required=True);parser.add_argument('--local-repository',required=True);parser.add_argument('--head',required=True);parser.add_argument('--run-id',type=int,required=True);parser.add_argument('--job-id',type=int,required=True);parser.add_argument('--artifact-id',type=int,required=True);parser.add_argument('--zip-bytes',type=int,required=True);parser.add_argument('--zip-sha256',required=True);args=parser.parse_args()
base=Path(args.base);repo=base/'source';job=repo/'jobs/G07-liars-dice';local=Path(args.local_repository)/'jobs/G07-liars-dice'
archive=base/'artifact.zip';archiveBytes=archive.read_bytes();assert len(archiveBytes)==args.zip_bytes;assert hashlib.sha256(archiveBytes).hexdigest()==args.zip_sha256
# Always decode the genuine ZIP, even when an extracted cache exists.
# Original semantic/clock/600-interval acceptance checks below are unchanged.
archiveAssertions=0
with zipfile.ZipFile(archive) as z:
 infos=z.infolist();assert len(infos)<3000 and sum(x.file_size for x in infos)<100*1024*1024;assert z.testzip() is None
 assert len({x.filename for x in infos})==len(infos);archiveAssertions+=3
 for info in infos:
  path=PurePosixPath(info.filename);assert not path.is_absolute() and '..' not in path.parts and chr(92) not in info.filename;assert not stat.S_ISLNK(info.external_attr>>16);archiveAssertions+=2
 if not repo.exists():z.extractall(repo)
 for info in infos:
  if not info.is_dir():assert (repo/info.filename).read_bytes()==z.read(info);archiveAssertions+=1
r=json.loads((job/'.work/browser/report.json').read_text());count=0

def require(ok,message):
 global count
 count+=1
 assert ok,message

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def near(a,b,message):require(isinstance(a,(int,float)) and math.isfinite(a) and abs(a-b)<1e-7,message)
paths=['play.html','manifest.json','src/core.ts','src/rules.ts','src/probability.ts','src/session.ts','src/browser.ts','src/play.template.html','scripts/build.mjs','scripts/browser-check.mjs','scripts/browser-evidence.mjs','scripts/frame-coordination.mjs','scripts/clock-observation.mjs','scripts/clock-observation-diagnostic.mjs','package.json','package-lock.json','evidence/browser/required-check-names.json','scripts/integrity.mjs','tests/browser-evidence.test.mjs','tests/frame-coordination.test.mjs','../../contract/constants.ts','../../contract/contract.ts','../../contract/minigame-schema.ts','../../contract/rng.ts','../../contract/player-count-schema.ts','../../contract/package.json','dist/core.mjs','dist/session.mjs','dist/probability.mjs','dist/rules.mjs','dist/contract.mjs','../../.github/workflows/G07.yml']
require(len(paths)==32,'32 exact guards');require((base/'artifact.zip').stat().st_size==args.zip_bytes,'official artifact ZIP length');require(sha(base/'artifact.zip')==args.zip_sha256,'official artifact ZIP SHA');expected={p:sha(job/p) for p in paths}
for p,h in expected.items():require(h==sha(local/p),'actual hosted/local source bytes '+p)
for key in ['sourceGuardHashes','sourceGuardHashesAfter']:require(r[key]==expected,'actual report source binding '+key)
require(r['passed'] is True and r['scope']=='full','fresh complete positive')
require(r['runId']==''.join(c for c in r['startedAt'] if c.isdigit()),'actual run ID/start')
require(r['finishedAt']>=r['startedAt'],'completion after actual start')
require(r['htmlSha256']==expected['play.html'],'actual HTML');require(r['coreModuleSha256']==expected['dist/core.mjs'],'actual compiled core');require(r['sessionModuleSha256']==expected['dist/session.mjs'],'actual compiled session')
require(r['physicalPhoneTested'] is False and r['performanceWhileRecording'] is False,'emulated unrecorded scope')
require(r['performanceRequirements']=={'intervals':600,'minimumMeanFps':59,'maximumP99Ms':17},'original strict gates')
require(r['frameFiltering']=='none: all 600 consecutive requestAnimationFrame intervals retained','no trimming')
require(r['seed']==7199,'actual seed');require(r['benchmark']=={'players':8,'existingBid':{'quantity':8,'face':3},'openPrivateDice':5,'interaction':'change quantity and face every 30 intervals, including exact controller odds','isolation':'fresh browser context; functional test navigation history is not retained'},'complete original workload')
require(sha(job/'evidence/browser/required-check-names.json')=='a20ed00ea0f50ae799098520b71d7bf71474e50b0c87b7993c88296a341fa17d','fixed actual original names')
names=json.loads((job/'evidence/browser/required-check-names.json').read_text());require(len(r['checks'])==94,'full94')
for label,wanted in names.items():
 checks=[c for c in r['checks'] if c['profile']==label];require(sorted(c['name'] for c in checks)==sorted(wanted),'all exact names '+label);require(all(c['passed'] is True and not c.get('error') for c in checks),'all pass '+label)
source=next(c for c in r['checks'] if c['profile']=='runner')
for a,b,p in [('initialHtmlSha256','finalHtmlSha256','play.html'),('initialCoreModuleSha256','finalCoreModuleSha256','dist/core.mjs'),('initialSessionModuleSha256','finalSessionModuleSha256','dist/session.mjs')]:require(source[a]==source[b]==expected[p],'start/end actual source '+p)
observations=r['clockObservations'];require(len(observations)==4,'four genuine click observations')
for label in ['desktop','phone4x']:
 for kind in ['pause-resume','saved-resume']:
  rows=[o for o in observations if o['profile']==label and o['kind']==kind];require(len(rows)==1,'distinct click '+label+' '+kind);o=rows[0]
  require(o['eventTrusted'] is True and o['selector']==('#resume' if kind=='pause-resume' else '#resume-saved'),'actual trusted control')
  for key in ['clickHostBefore','clickHostAfter','nativeBeforeMs','nativeAfterMs','nativeEventTimeStampMs','afterDeadline']:require(isinstance(o[key],(int,float)) and math.isfinite(o[key]) and o[key]>=0,'finite actual clock '+key)
  require(o['clickHostAfter']>=o['clickHostBefore'] and o['nativeAfterMs']>=o['nativeBeforeMs'],'real click task ordering')
  if kind=='pause-resume':require(o['limitMs']==200 and abs((o['afterDeadline']-o['beforeDeadline'])-(o['clickHostBefore']-o['pausedAt']))<200,'original pause clock gate')
  else:
   remaining=o['savedDeadline']-o['savedHostNow'];require(o['limitMs']==250 and o['fullClockMs']==3000,'original saved fixture/gate');require(o['elapsedBeforeCheckpointMs']>=600 and 0<remaining<=2400,'real saved clock consumption');near(remaining+o['elapsedBeforeCheckpointMs'],3000,'original exact saved duration');require(abs((o['afterDeadline']-o['clickHostBefore'])-remaining)<250,'original saved clock gate')
profiles=[{'label':'desktop','width':1920,'height':1080,'cpuThrottle':1},{'label':'phone4x','width':390,'height':844,'cpuThrottle':4}];require([p['label'] for p in r['profiles']]==['desktop','phone4x'],'exact two distinct profiles');metrics=[]
for profile,row in zip(profiles,r['profiles']):
 label=profile['label'];raw=json.loads((job/'.work/browser'/f'{label}-frames.json').read_text());require(all(row[k]==raw[k]==v for k,v in profile.items()),'actual exact profile '+label)
 require(row['frameFile']==f'{label}-frames.json' and row['archivedFrameFile']==f"runs/{r['htmlSha256']}/{r['runId']}/{label}-frames.json",'actual raw filenames '+label)
 require(raw['runId']==r['runId'] and raw['htmlSha256']==r['htmlSha256'],'actual raw run/source '+label)
 require(raw['sourceGuardHashes']==raw['sourceGuardHashesAfter']==expected,'actual raw 32 guards '+label)
 require(raw['workload']==row['workload'],'same actual workload in raw/report '+label);workload=raw['workload'];require(sorted(workload)==['atEnd','atStart','beforeReady'],'three real sampling boundaries')
 for observed in workload.values():
  require(observed['phase']=='bid' and observed['deadline'] is None and observed['turnSeconds']==0,'active untimed fixture');require(observed['players']==8 and observed['totalDice']==40 and observed['openPrivateDice']==5,'complete real eight-seat/private-cup workload');require(observed['bid']=={'quantity':8,'face':3} and observed['oddsAvailable'] is True,'existing real bid/exact odds');require(len(observed['stateSha256'])==64 and all(c in '0123456789abcdef' for c in observed['stateSha256']),'actual core-state digest')
 require(workload['beforeReady']==workload['atStart']==workload['atEnd'],'grant and all callbacks retain complete actual fixture')
 require(raw['sampleCount']==row['sampleCount']==600 and raw['filtering']=='none' and raw['recordedVideo'] is False,'all unrecorded600 '+label)
 ts,dt=raw['timestampsMs'],raw['intervalsMs'];require(len(ts)==601 and len(dt)==600,'full actual timestamps/intervals '+label)
 require(all(math.isfinite(t) and t>=0 for t in ts) and all(math.isfinite(t) and t>0 for t in dt),'genuine finite positive values '+label)
 for i,x in enumerate(dt):near(x,ts[i+1]-ts[i],f'{label} consecutive interval {i}')
 total=sum(dt);values={'totalMs':total,'meanMs':total/600,'fps':600000/total,'p99Ms':sorted(dt)[math.ceil(600*.99)-1],'maxMs':max(dt),'droppedIntervalsOver17Ms':sum(x>17 for x in dt)}
 for k,v in values.items():near(raw[k],v,'actual raw recomputation '+label+' '+k);near(row[k],v,'actual report recomputation '+label+' '+k)
 require(values['fps']>=59 and values['p99Ms']<=17,'unaltered strict gate '+label)
 offline=next(c for c in r['checks'] if c['profile']==label and c['name'].startswith('self-contained'))
 for key in ['networkRequests','additionalResources','pageErrors','dialogs']:require(offline[key]==[],'actual offline '+label+' '+key)
 metrics.append({'profile':label,'intervals':600,**values})
old=(local/'evidence/browser/historical-runner-f8a8d602/browser-check.observed.txt').read_bytes();new=(job/'scripts/browser-check.mjs').read_bytes();marker=b'const timestamps = [], intervals = [];';end=b'\n          requestAnimationFrame(frame);\n        });'
def body(text):s=text.index(marker);e=text.index(end,s)+len(end);return text[s:e]
require(hashlib.sha256(old).hexdigest()=='f8a8d602885ee9cd15a91860196a4841dd3ef21b310d319908c374bdd5bcba77','actual original runner identity');require(body(old)==body(new),'byte-identical actual native timed callback')
receipt={'passed':True,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Actual specified current hosted source/raw bytes; specific successful run, not a universal timing guarantee or replacement for retained local failures','head':args.head,'runId':args.run_id,'jobId':args.job_id,'artifactId':args.artifact_id,'zipBytes':(base/'artifact.zip').stat().st_size,'zipSha256':sha(base/'artifact.zip'),'independentAssertions':count,'additionalZipCacheAssertions':archiveAssertions,'sourceGuards':expected,'reportRunId':r['runId'],'checks':94,'rawIntervals':1200,'metrics':metrics,'originalTimedCallbackBytes':len(body(old)),'originalTimedCallbackSha256':hashlib.sha256(body(old)).hexdigest(),'gameplayUnchanged':True}
(base/'independent-current-hosted-validation.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k!='sourceGuards'},indent=2))
