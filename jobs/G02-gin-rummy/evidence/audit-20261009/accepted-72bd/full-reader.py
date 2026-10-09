import json,hashlib,subprocess,math,re,datetime
from pathlib import Path
base=Path('/tmp/G02-full-72bd-artifact-20261009');art=base/'extracted'
owner=Path('/tmp/G02-source-93f0f58-20261009');job=owner/'jobs/G02-gin-rummy'
mirror=Path('/tmp/G02-current-1478-artifact-20261009/proof-mirror/repo/jobs/G02-gin-rummy')
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
head='72bd30595c1b18346c31f0192691c3fede309cef'
artifact=read(base/'official-artifact-metadata.json');zipreceipt=read(base/'full-zip-reader-CLOSED.json');assert zipreceipt['allMembersCrcRead'] and zipreceipt['allMembers']==13 and zipreceipt['wholeBytes']==artifact['size_in_bytes'] and zipreceipt['wholeSha256']==artifact['digest'].removeprefix('sha256:')
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=owner,text=True).strip()==head
run=read(base/'official-run-37906194509.json');assert run['head_sha']==head and run['id']==37906194509 and run['run_attempt']==1 and run['conclusion']=='success'
log=(base/'official-verify-113740122349-success.log').read_text();lines=log.split('\n');transport=read(base/'native-log-transport.json');assert len(log)==transport['characters'] and len(lines)==transport['entries'] and sha(base/'official-verify-113740122349-success.log')==transport['sha256']
assert 'Merge '+head+' into d5fbb39746f8f7900bee57506e8133e8675f48ed' in log
assert len(re.findall(r'Z ok \d+ - ',log))==77 and 'Z not ok ' not in log
for marker in ['# tests 77','# pass 77','# fail 0','# cancelled 0','# skipped 0','# todo 0']:
 assert marker in log,marker
for n in range(1,27):assert f'M{n:02d} caught ' in log
assert 'COMPILE FAILURE' not in log and 'SURVIVED' not in log
records=[]
for line in lines:
 match=re.search(r'Z (?:# )?(\{.*\})$',line)
 if match:
  try:records.append(json.loads(match.group(1)))
  except json.JSONDecodeError:pass
contracts=[r for r in records if r.get('suite')=='bot-contract'];assert len(contracts)==6
assert {(r['variant'],r['players']) for r in contracts}=={(v,n) for v in ['standard','oklahoma'] for n in [2,3,4]}
assert all(r['games']==r['replays']==1000 and r['replayChecks']==r['totalEvents'] and r['comparison']=='every-event SHA256 and bytes; JSON-roundtrip replay' for r in contracts)
leagues=[r for r in records if r.get('games')==2000];assert len(leagues)==2
assert [(r['stronger'],r['weaker'],r['wins']) for r in leagues]==[('sharp','normal',1166),('normal','easy',1743)]
assert all(r['winRate']>=.55 and r['wilsonLower']>.5 and r['pairedSeeds'] for r in leagues)
integrity=[r for r in records if r.get('suite')=='integrity'];assert len(integrity)==1 and integrity[0]=={'suite':'integrity','fileHashes':1132,'regenerationRuns':2,'byteIdentical':True,'coreNoIo':True,'mediaUnder10MB':True}
guardsPaths=[owner/'.github/workflows/G02.yml']+[mirror/p for p in read(art/'.work/browser/report.json')['sourceStart']]+[job/p for p in read(art/'.work/browser/report.json')['sourceStart'] if not p.startswith('dist/')]+[p for p in art.rglob('*') if p.is_file()]+[base/'official-full.zip',base/'official-verify-113740122349-success.log',base/'official-run-37906194509.json',base/'full-zip-reader-CLOSED.json',base/'validate-strict-original.mjs',base/'full-reader.py']
guards={str(p.resolve()):sha(p) for p in guardsPaths}
report=read(art/'.work/browser/report.json');captures=read(art/'.work/browser/captures.json')
assert len(report['sourceStart'])==35 and report['sourceStart']==report['sourceEnd']==captures['sourceStart']==captures['sourceEnd']
for p,h in report['sourceStart'].items():
 assert sha(mirror/p)==h,p
 if not p.startswith('dist/'):assert (job/p).read_bytes()==(mirror/p).read_bytes(),p
rebuild=read(Path('/tmp/G02-current-1478-artifact-20261009/exact-source-rebuild-CLOSED.json'));assert len(rebuild['all3BundlesAndHtmlReproduced'])==4 and all(r['byteIdentical'] for r in rebuild['all3BundlesAndHtmlReproduced']) and rebuild['originalBuildExit']==0
for row in rebuild['all3BundlesAndHtmlReproduced']:assert sha(mirror/row['path'])==row['sha256']
for p in [p for p in art.rglob('*') if p.is_file() and not p.relative_to(art).as_posix().startswith('.work/')]:
 assert p.read_bytes()==(job/p.relative_to(art)).read_bytes(),'historical artifact member '+str(p)
strictRun=subprocess.run(['node',str(base/'validate-strict-original.mjs')],cwd=mirror,capture_output=True,text=True)
(base/'strict-original-reader.log').write_text(strictRun.stdout+strictRun.stderr);assert strictRun.returncode==0,strictRun.stdout+strictRun.stderr;strict=json.loads(strictRun.stdout)
independent=[]
for row in report['rows']:
 sample=read(art/'.work/browser'/f"{row['label']}-frames.json");frames=sample['frames'];timestamps=sample['timestamps']
 assert len(frames)==600 and len(timestamps)==601 and frames==[timestamps[i+1]-timestamps[i] for i in range(600)]
 assert all(math.isfinite(x) and x>0 for x in frames)
 total=0.0
 for interval in frames:total+=interval
 mean=total/600;ordered=sorted(frames);stats={'meanMs':mean,'p99Ms':ordered[math.floor(599*.99)],'maxMs':ordered[-1],'fps':1000/mean}
 for k,v in stats.items():assert v==row[k]==sample[k]
 assert stats['fps']>=59 and stats['p99Ms']<=17;independent.append({'profile':row['label'],**stats})
assert report['extra']['host']['passed']==5 and len(report['extra']['publicHistory'])==2
videos=[]
for row in captures['rows']:
 p=art/row['path'];b=p.read_bytes();assert len(b)==row['bytes'] and len(b)<10*1024*1024 and hashlib.sha256(b).hexdigest()==row['sha256']
 probe=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],capture_output=True,text=True);assert probe.returncode==0;meta=json.loads(probe.stdout);streams=meta['streams'];assert len(streams)==1 and streams[0]['codec_name']=='vp8'
 assert (streams[0]['width'],streams[0]['height'])==((1280,844) if row['cpuThrottle']==1 else (390,844))
 decode=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True);assert decode.returncode==0,decode.stderr
 videos.append({'path':row['path'],'bytes':len(b),'sha256':row['sha256'],'codec':streams[0]['codec_name'],'width':streams[0]['width'],'height':streams[0]['height'],'duration':meta['format']['duration'],'fullDecodeExit':decode.returncode})
after={p:sha(Path(p)) for p in guards};assert guards==after
manifestRows=(job/'SHA256SUMS.txt').read_text().strip().splitlines();assert len(manifestRows)==1132
manifestRecords=[line.split('  ') for line in manifestRows];rawGit=subprocess.check_output(['git','cat-file','--batch'],cwd=owner,input=''.join(head+':jobs/G02-gin-rummy/'+path+'\n' for h,path in manifestRecords).encode());offset=0
for h,path in manifestRecords:
 end=rawGit.index(b'\n',offset);header=rawGit[offset:end].split();assert header[1]==b'blob';size=int(header[2]);body=rawGit[end+1:end+1+size];assert hashlib.sha256(body).hexdigest()==h and body==(job/path).read_bytes();offset=end+1+size+1
assert offset==len(rawGit)
functional={p:read(art/'.work'/p) for p in ['clock-after.json','custom-meld-after.json','results-after.json','name-check.json']}
proof={'closedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'runId':37906194509,'jobId':113740122349,'artifactId':artifact['id'],'artifactBytes':artifact['size_in_bytes'],'artifactSha256':artifact['digest'].removeprefix('sha256:'),'all13ZipMembersCrcRead':True,'nativeLogEntries':len(lines),'nativeLogCharacters':len(log),'allOriginal77TestsPassed':True,'allSix1000EveryEventMatches':contracts,'both2000GameLeagues':leagues,'all26CompiledMutantsCaught':True,'original1132IntegrityAndTwoRegenerationsPassed':True,'strictOriginalReader':strict,'independentEveryNativeIntervalStatistics':independent,'videosFullyDecoded':videos,'functionalOutputs':functional,'historicalIncludedMembersByteIdenticalToHead':True,'beforeAfterGuards':len(guards),'sourceStart':guards,'sourceEnd':after,'sourceUnchanged':True,'all1132ImmutableGitManifestFilesVerified':True,'samplerExecutedLocally':False,'independentStatisticsUseOriginalSequentialIEEE754Accumulation':True,'previousNumericReaderCorrectionAppliedBeforeExecution':True,'fullOriginalHostedAcceptance':True}
# Bind the merge SHA to GitHub's actual PR checkout log, without guessed suffixes.
match=re.search(r"Z ([0-9a-f]{40})\n",log);assert match;proof['checkoutMergeSha']=match.group(1)
(base/'full-original-artifact-reader-CLOSED.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps({k:v for k,v in proof.items() if k not in ['sourceStart','sourceEnd']}))
