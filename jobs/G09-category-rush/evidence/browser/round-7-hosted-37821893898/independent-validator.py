from pathlib import Path
import hashlib,json,subprocess,math
root=Path.cwd(); base=root/'.work/round-7-hosted-37821893898/files'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
head='3f6d467c029cbb718b27c39ed26b3f6f2a64793a';run='37821893898'
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
 clip=summary['clipContext'];assert clip['sourceSha256']==html and clip['separateFromSampling'] is True and clip['cpuThrottle']==rate and clip['viewport']==raw['viewport']
 assert clip['pageErrors']==[] and all(s.startswith('file:') for s in clip['networkRequests']) and clip['privateWarningRows']==3
 paste=clip['nativePasteWordBoundary'];assert paste['pasted']=='The\t'+paste['noun'] and paste['visible']=='The '+paste['noun'] and paste['method']=='native Chromium clipboard'
 pack=json.loads((root/'content/categories.json').read_text());category=next(c for c in pack['categories'] if c['id']==paste['categoryId']);assert category['prompt']==paste['prompt'] and paste['noun'] in category['answers'][paste['letter']]
 video=base/summary['video'];assert 0<video.stat().st_size==summary['videoBytes']<10000000
 decode=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_read_frames','-show_entries','format=duration,size','-of','json',str(video)],text=True))
 assert decode['streams'][0]['codec_name']=='vp8' and int(decode['streams'][0]['nb_read_frames'])>0
 assert int(decode['format']['size'])==video.stat().st_size
 profiles.append({'profile':label,'fps':fps,'p99Ms':ordered[593],'maxMs':ordered[-1],'rawCount':len(values),'videoBytes':video.stat().st_size,'videoSha256':sha(video),'decoder':decode,'activePhaseWitness':'not present in this original runner; no new corrected-workload proof claimed'})
receipt={'scope':'Actual exact3f6 hosted original-runner proof only; corrected active-phase witness/current test helper are pending','headSha':head,'runId':run,'jobId':113464750151,'artifactId':11568969406,'zipBytes':1153457,'zipSha256':'7a2d5b73a30c399558e6f34fa1b59e776e9d41f6052748ddb5b8466777040ff6','htmlSha256':html,'uploadedFiles':uploaded,'sourceGuards':guards,'profiles':profiles,'passed':True}
(base.parent/'independent-validation.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'uploadedFiles':len(uploaded),'sourceGuards':len(guards),'rawCount':sum(p['rawCount'] for p in profiles),'profiles':[{k:p[k] for k in ['profile','fps','p99Ms','maxMs','videoBytes']} for p in profiles]}))
