from pathlib import Path,PurePosixPath
import json,zipfile,hashlib,subprocess,stat,math,re,sys,datetime,argparse
parser=argparse.ArgumentParser(description='Independently verify genuine G04 hosted source/raw/capture evidence without a new frame run.')
parser.add_argument('--head',required=True);parser.add_argument('--run-id',required=True,type=int);parser.add_argument('--evidence-dir',required=True,type=Path);args=parser.parse_args()
job=Path.cwd();head=args.head;run_id=args.run_id;assert re.fullmatch('[a-f0-9]{40}',head),'exact full commit required'
base=args.evidence_dir.resolve();zpath=base/'actual.zip';output=base/'extracted';metadata=json.loads((base/'artifact-metadata.json').read_text());assertions=0

def check(value,message):
 global assertions
 assert value,message
 assertions+=1

def digest(b):return hashlib.sha256(b).hexdigest()

def load(path):return json.loads(path.read_text())
check(metadata['workflow_run']['id']==run_id and metadata['workflow_run']['head_sha']==head,'actual native artifact run/head binding');check(metadata['name']=='G04-browser-evidence-'+head,'actual exact-head artifact name')
bytes_=zpath.read_bytes();check(len(bytes_)==metadata['size_in_bytes'],'genuine archive byte count');check(digest(bytes_)==metadata['digest'].removeprefix('sha256:'),'genuine archive SHA')
with zipfile.ZipFile(zpath) as archive:
 check(archive.testzip() is None,'all CRCs');seen=set()
 for entry in archive.infolist():
  p=PurePosixPath(entry.filename);check(not p.is_absolute() and '..' not in p.parts and '\\' not in entry.filename,'safe path');check(entry.filename not in seen,'unique entry');check(not stat.S_ISLNK(entry.external_attr>>16),'no links');seen.add(entry.filename)
 output.mkdir(parents=True,exist_ok=True);archive.extractall(output)

# Genuine installed public module bytes are independently captured in the
# original source archive. Current repository inputs come from this exact Git
# commit; the corrected --no-save step must preserve the tracked package.
source_map=load(job/'results/reverify-2019/local-be30189/source-file-map.json'); expected={}
with zipfile.ZipFile(job/'results/reverify-2019/local-be30189/source-bytes.zip') as sources:
 for name,entry in source_map.items():
  if 'node_modules/' in name:
   content=sources.read(entry['archivedPath']);check(digest(content)==entry['sha256'],'copied public module bytes '+name)
  else:
   rel=str((job/name).resolve().relative_to(job.parent.parent));content=subprocess.check_output(['git','show',head+':'+rel],cwd=job.parent.parent)
  expected[name]=digest(content)
check(len(expected)==1034,'complete current inventory')
report=load(output/'.work/strict/report.json');runtime=report['runtimeIdentity'];check(report['passed'] is True and report['failure'] is None,'strict complete report passes');check(report['scope']=='current native workload and separately decoded captures','full scope');check(report['profiles']==['tv','phone'],'both native profiles');check(report['sourceStart']==expected and report['sourceEnd']==expected,'actual current full source maps');check(report['physicalPhoneTested'] is False,'honest emulation')
check(runtime['versions']=={'zod':'4.6.5','playwright':'1.56.1','playwright-core':'1.56.1'},'pinned installed versions');check(runtime['zodModuleSha256']==expected[runtime['zodModule']],'actual loaded module hash');check(runtime['nodeVersion'].startswith('v24.'),'actual node24');check(bool(runtime['v8Version']),'actual V8 identity')
for name in ['captureDecoder','captureEncoder']:
 check(bool(re.fullmatch('[a-f0-9]{64}',runtime[name]['sha256'])),'actual binary digest '+name);check(bool(runtime[name]['realPath']),'actual binary path '+name)
check(runtime['captureDecoder']['path']=='/usr/bin/ffmpeg','declared supported decoder');check(runtime['captureDecoder']['version'].startswith('ffmpeg version '),'actual decoder version')
profiles=[]
for profile,viewport,cpu in [('tv',{'width':1920,'height':1080},1),('phone',{'width':390,'height':844},4)]:
 raw=load(output/'.work/strict'/f'{profile}-raw.json');check(raw['runId']==report['runId'],'fresh run binding');check(raw['profile']==profile and raw['viewport']==viewport and raw['cpuThrottle']==cpu,'real profile/throttle');check(raw['sourceStart']==expected and raw['sourceAfterSample']==expected,'all current before/after inputs');check(raw['runtimeIdentity']==runtime,'actual loaded runtime same');check(raw['sourceSha256']==expected['play.html'],'current offline page');check(raw['transport']=='file:' and raw['rawFiltering']=='none' and raw['performanceWhileRecording'] is False,'actual unrecorded offline frames');check(raw['nativeClock']=={'requestAnimationFrame':True,'performanceNow':True,'dateNow':True,'setTimeout':True,'setInterval':True},'native timing APIs')
 ts=raw['timestamps'];iv=raw['intervals'];ws=raw['witnesses'];check(len(ts)==601 and len(iv)==600 and len(ws)==601,'all consecutive raw samples')
 check(all(isinstance(n,(int,float)) and math.isfinite(n) and n>=0 for n in ts),'finite native timestamps');check(all(isinstance(n,(int,float)) and math.isfinite(n) and n>0 for n in iv),'positive finite intervals')
 for i,dt in enumerate(iv):check(dt==ts[i+1]-ts[i],'unfiltered native difference')
 ordered=sorted(iv);mean=sum(iv)/600; stats={'meanMs':mean,'fps':1000/mean,'p95Ms':ordered[570],'p99Ms':ordered[594],'maxMs':ordered[-1]}
 for k,v in stats.items():check(math.isclose(raw[k],v,rel_tol=1e-13,abs_tol=1e-11),'independent statistic '+k)
 check(stats['fps']>=59 and stats['p95Ms']<=18,'unchanged original native acceptance')
 before=raw['beforeGrant'];check(before['phase']=='write' and before['pauseButton']=='Resume' and before['countdown']=='Paused' and before['inputCount']==0,'actual paused setup')
 for w in [raw['afterGrant'],*ws,raw['afterSample']]:
  check(w['phase']=='write' and w['setupHidden'] is True and w['matchHidden'] is False,'active gameplay phase');check(w['pauseButton']=='Pause' and w['privateOpen']=='true' and w['inputCount']==1,'real unpaused private controller');check(w['fakeValue']=='My harbour bluff' and w['fakeDisabled'] is False and bool(w['question']),'actual retained private draft');check(bool(re.fullmatch(r'\d+ s',w['countdown'] or '')) and int(w['countdown'].split()[0])>0 and w['controllerCountdown']==w['countdown'],'actual live countdown');check(isinstance(w['received'],int) and 0<=w['received']<=7,'actual bot progress');check(math.isfinite(w['nativeNowMs']) and math.isfinite(w['wallUtcMs']),'native wall/monotonic witnesses')
 for i in range(1,len(ws)):check(ws[i]['nativeNowMs']>=ws[i-1]['nativeNowMs'] and ws[i]['wallUtcMs']>=ws[i-1]['wallUtcMs'],'every native witness advances')
 check(raw['afterGrant']['received']<7 and raw['afterSample']['received']==7,'seven actual bot callbacks');check(raw['afterSample']['nativeNowMs']-raw['afterGrant']['nativeNowMs']>=9000,'real elapsed gameplay');check(int(raw['afterGrant']['countdown'].split()[0])-int(raw['afterSample']['countdown'].split()[0])>=8,'actual game timer advances');check(raw['errors']==[] and raw['externalRequests']==[],'no runtime requests or errors')
 closed=raw['window'];check(closed['status']=='samples-written' and closed['rawIntervals']==600 and closed['attemptNonce']==raw['attemptNonce'] and closed['sourceSha256']==expected['play.html'],'actual raw closure');check(closed['coordination']=='uncoordinated','fresh independent hosted run, no local grant transfer');profiles.append({'profile':profile,**stats,'attemptNonce':raw['attemptNonce']})
check(profiles[0]['attemptNonce']!=profiles[1]['attemptNonce'],'different actual attempts')

# Recompute all six original consecutive profiles independently as well.
original=[]
for i in range(1,4):
 file=output/('browser-report.json' if i==1 else f'browser-repeat-{i}.json');r=load(file)
 check(len(r['functional'])==22,'all original functional controls');check(r['evidenceScope']=='full browser suite' and 'file://' in r['navigationMode'],'actual full offline original suite');check(r['htmlSha256']==expected['play.html'] and r['htmlSha256AtEnd']==expected['play.html'],'actual original current page');check(r['sourceUnchanged'] is True and r['sourceHashesAtStart']==r['sourceHashesAtEnd'],'actual original source stable');check(r['errors']==[] and r['externalRequests']==[],'actual original zero errors/requests')
 for key,value in r['sourceHashesAtStart'].items():check(expected[key]==value,'actual original current input '+key)
 content=(output/r['capture']).read_bytes();check(len(content)==r['captureBytes'] and digest(content)==r['captureSha256'],'actual original capture SHA/size')
 for p in r['performance']:
  check(p['frameFiltering']=='none' and p['frames']==300 and p['viewport']==({'width':1920,'height':1080} if p['name']=='tv' else {'width':390,'height':844}) and p['throttle']==(1 if p['name']=='tv' else 4),'actual original profile/throttle');iv=p['intervalsMs'];separate=load(output/f'browser-raw-{i}-{p["name"]}.json');check(separate['performance']['intervalsMs']==iv,'separate original raw array');check(separate['htmlSha256']==expected['play.html'] and separate['htmlSha256AtEnd']==expected['play.html'] and separate['sourceHashesAtStart']==r['sourceHashesAtStart'] and separate['sourceHashesAtEnd']==r['sourceHashesAtEnd'],'separate original actual source maps');check(len(iv)==300,'all original unfiltered samples');v=sorted(iv);mean=sum(iv)/300;fps=1000/mean;check(fps>=59 and v[285]<=18,'unchanged original profile gate');check(math.isclose(fps,p['fps'],rel_tol=1e-12),'original FPS recomputed');original.append({'sample':i,'profile':p['name'],'fps':fps,'p95Ms':v[285],'p99Ms':v[297]})

clips=[]
for c in report['captures']:
 path=output/c['path'];b=path.read_bytes();check(len(b)==c['bytes'] and 0<len(b)<10*1024*1024 and digest(b)==c['sha256'],'actual clip SHA/size');check(c['sourceStart']==expected and c['sourceEnd']==expected,'current capture source identity');check(c['decoded'] is True and c['decodeExit']==0 and c['frames']==24 and c['encodedFps']==12 and c['performanceMeasurement'] is False,'honest functional clip scope');check(len(c['witnesses'])==24 and any(w['inputCount']==0 and w['privateOpen']!='true' for w in c['witnesses']) and any(w['inputCount']==1 and w['fakeValue']=='My harbour bluff' for w in c['witnesses']) and all(w['phase']=='write' for w in c['witnesses']),'actual private conceal/reopen capture');check(c['errors']==[] and c['externalRequests']==[],'actual capture zero errors/requests')
 probe=subprocess.run(['/usr/bin/ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_read_frames,r_frame_rate','-of','json',str(path)],capture_output=True,text=True,check=True);stream=json.loads(probe.stdout)['streams'][0];want=(1920,1080) if c['profile']=='tv' else (390,844);check(stream['codec_name']=='vp8' and (stream['width'],stream['height'])==want and int(stream['nb_read_frames'])==24,'actual independently decoded capture');decoded=subprocess.run(['/usr/bin/ffmpeg','-v','error','-i',str(path),'-f','null','-'],capture_output=True,text=True);check(decoded.returncode==0,'actual full decode exits zero');clips.append({'profile':c['profile'],'path':c['path'],'bytes':len(b),'sha256':digest(b),'stream':stream})
for i in range(1,4):
 p=output/'media'/('milestone-15-browser.webm' if i==1 else f'milestone-15-browser-repeat-{i}.webm');probe=subprocess.run(['/usr/bin/ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_read_frames','-of','json',str(p)],capture_output=True,text=True,check=True);s=json.loads(probe.stdout)['streams'][0];check(s['codec_name']=='vp8' and s['width']==1920 and s['height']==1080 and int(s['nb_read_frames'])==36,'actual original current clip');decoded=subprocess.run(['/usr/bin/ffmpeg','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True);check(decoded.returncode==0,'actual original clip fully decoded');clips.append({'sample':i,'path':str(p.relative_to(output)),'bytes':p.stat().st_size,'sha256':digest(p.read_bytes()),'stream':s})
summary={'observedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':head,'runId':run_id,'artifactId':metadata['id'],'artifactBytes':len(bytes_),'artifactSha256':digest(bytes_),'safeEntries':len(seen),'independentAssertions':assertions,'sourceGuards':1034,'nativeRawIntervals':1200,'nativeTimestamps':1202,'activeFrameWitnesses':1202,'originalRawIntervals':1800,'originalFunctionalControls':66,'runtimeIdentity':runtime,'strictProfiles':profiles,'originalProfiles':original,'actualCurrentDecodedClips':clips,'physicalPhoneTested':False,'readerSha256':digest(Path(__file__).read_bytes()),'passed':True}
(base/'independent-current-host-validation.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
