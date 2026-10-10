from pathlib import Path
import hashlib,json,subprocess,math,re
root=Path.cwd(); base=root/'.work/round-7-hosted-37830364323/files'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
head='17c0d3009e09d671db0b3d45719b3d927ed44038';run='37830364323'
read=lambda p:json.loads((base/p).read_text())
report=read('evidence/browser/performance-report.json');origin=read('evidence/browser/hosted-run.json')
assert origin['origin']=='github-actions' and origin['headSha']==head and origin['runId']==run
html=sha(base/'play.html');assert html=='91a0c95d5680c1e691a9206ee13252d2d312439e3086e4aed24c4ba4ac10e236'
assert report['sourceSha256']==html==origin['htmlSha256'];assert report['passed'] is True
assert report['recordingDuringMeasurement'] is False and report['samplingRecording'] is False
manifest={line.split('  ',1)[1]:line.split('  ',1)[0] for line in (base/'SHA256SUMS.txt').read_text().splitlines()}
uploaded=[]
for p in sorted(base.rglob('*')):
 if p.is_file():
  path=p.relative_to(base).as_posix()
  if path!='SHA256SUMS.txt':assert sha(p)==manifest[path],path
  uploaded.append({'path':path,'bytes':p.stat().st_size,'sha256':sha(p)})
assert len(uploaded)==8
guards=[]
assert len(report['sourceFingerprints'])==18
for path,digest in report['sourceFingerprints'].items():
 if path=='node_modules/zod/LICENSE':contents=(root/path).read_bytes()
 else:
  gitpath=(root/path).resolve().relative_to(root.parents[1]).as_posix()
  contents=subprocess.check_output(['git','show',head+':'+gitpath],cwd=root)
 assert hashlib.sha256(contents).hexdigest()==digest,path
 assert hashlib.sha256((root/path).read_bytes()).hexdigest()==digest,path+' current source'
 guards.append({'path':path,'sha256':digest})
assert report['sourceFingerprints']['scripts/browser-performance.mjs']==origin['runnerSha256']
assert len(report['profiles'])==2
profiles=[]
for label,width,height,rate in [('desktop',1920,1080,1),('phone4x',390,844,4)]:
 raw=read(f'evidence/browser/{label}-frames.json');summary=next(s for s in report['profiles'] if s['profile']==label)
 values=raw['frames'];assert len(values)==raw['count']==600 and all(isinstance(x,(int,float)) and math.isfinite(x) and x>0 for x in values)
 total=sum(values);ordered=sorted(values);fps=600000/total
 for key,value in [('totalMs',total),('meanMs',total/600),('fps',fps),('p95Ms',ordered[569]),('p99Ms',ordered[593]),('maxMs',ordered[-1])]:
  assert abs(raw[key]-value)<1e-6,key
  assert abs(summary[key]-value)<1e-6,key
 assert fps>=59 and ordered[593]<=17 and raw['passed'] is summary['passed'] is True
 assert raw['viewport']=={'width':width,'height':height} and raw['cpuThrottle']==rate
 assert raw['sourceSha256']==html and raw['pageErrors']==[] and all(s.startswith('file:') for s in raw['networkRequests'])
 assert raw['samplingRecording'] is False and raw['recordingDuringMeasurement'] is False
 witnesses=raw['witnesses'];assert len(witnesses)==601 and raw['nativeDate'] is True
 seconds=[]
 for row in witnesses:
  assert row['answerFormVisible'] is True and row['modalAbsent'] is True
  assert type(row['wallMs'])==int and row['wallMs']>=0
  match=re.fullmatch(r'(\d+):([0-5]\d)',row['timerText']);assert match
  seconds.append(int(match[1])*60+int(match[2]))
 first=witnesses[0]['wallMs'];last=witnesses[-1]['wallMs'];deadline=first+seconds[0]*1000
 for n,row in enumerate(witnesses):
  assert 0<seconds[n]<=60 and (n==0 or seconds[n]<=seconds[n-1])
  assert row['wallMs']>=first and (n==0 or row['wallMs']>=witnesses[n-1]['wallMs'])
  assert abs(seconds[n]*1000-(deadline-row['wallMs']))<=1200
 assert last-first>=1000 and seconds[0]>seconds[-1]
 assert abs((last-first)-total)<10,'observed wall/RAF elapsed agreement'
 for scope in [raw['workload'],summary['workload']]:
  assert scope['passed'] is True and scope['nativeDate'] is True and scope['witnessCount']==601
  for key in ['validWalls','visibleAnswerEveryCallback','liveTimerEveryCallback','timerAdvanced','deadlineConsistent']:assert scope[key] is True,key
  assert scope['wallElapsedMs']==last-first and scope['firstWallMs']==first and scope['lastWallMs']==last
  assert scope['timerStartSeconds']==seconds[0] and scope['timerEndSeconds']==seconds[-1] and scope['deadlineUpperMs']==deadline
 clip=summary['clipContext'];assert clip['sourceSha256']==html and clip['separateFromSampling'] is True and clip['cpuThrottle']==rate and clip['viewport']==raw['viewport']
 assert clip['pageErrors']==[] and all(s.startswith('file:') for s in clip['networkRequests']) and clip['privateWarningRows']==3
 paste=clip['nativePasteWordBoundary'];assert paste['pasted']=='The\t'+paste['noun'] and paste['visible']=='The '+paste['noun'] and paste['method']=='native Chromium clipboard'
 pack=json.loads((root/'content/categories.json').read_text());category=next(c for c in pack['categories'] if c['id']==paste['categoryId']);assert category['prompt']==paste['prompt'] and paste['noun'] in category['answers'][paste['letter']]
 video=base/summary['video'];assert 0<video.stat().st_size==summary['videoBytes']<10000000
 decode=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_read_frames','-show_entries','format=duration,size','-of','json',str(video)],text=True))
 assert decode['streams'][0]['codec_name']=='vp8' and int(decode['streams'][0]['nb_read_frames'])>0
 assert int(decode['format']['size'])==video.stat().st_size
 profiles.append({'profile':label,'fps':fps,'p99Ms':ordered[593],'maxMs':ordered[-1],'rawCount':len(values),'activeWitnesses':len(witnesses),'wallElapsedMs':last-first,'timerStartSeconds':seconds[0],'timerEndSeconds':seconds[-1],'videoBytes':video.stat().st_size,'videoSha256':sha(video),'decoder':decode})
receipt={'scope':'Actual exact17c hosted corrected-runner active-answer proof; separate from old local failure and rejected-grant pre-sample timeout','headSha':head,'runId':run,'jobId':113493816334,'artifactId':11572918105,'zipBytes':1301965,'zipSha256':'33c83ffe5cb74da63ae3377226d5fd0dc13a4a83b0e214dc6bb4c8f7a3f931e3','htmlSha256':html,'uploadedFiles':uploaded,'sourceGuards':guards,'profiles':profiles,'passed':True}
(base.parent/'independent-validation.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'uploadedFiles':len(uploaded),'sourceGuards':len(guards),'rawCount':sum(p['rawCount'] for p in profiles),'phaseWitnessCount':sum(p['activeWitnesses'] for p in profiles),'profiles':[{k:p[k] for k in ['profile','fps','p99Ms','maxMs','wallElapsedMs','timerStartSeconds','timerEndSeconds','videoBytes']} for p in profiles]}))
