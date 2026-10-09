import json,hashlib,subprocess,math
from pathlib import Path
from datetime import datetime,timezone
base=Path('/tmp/G02-current-93f0f58-artifact-20261009');art=base/'extracted';root=base/'proof-mirror/repo/jobs/G02-gin-rummy'
read=lambda p:json.loads(p.read_text())
index=read(art/'initial-presence-bootstrap/source-copy-index.json');before=read(art/'initial-presence-bootstrap/source-start.json');after=read(art/'initial-presence-bootstrap/source-end.json');closed=read(art/'initial-presence-bootstrap/CLOSED.json');identity=read(art/'initial-presence-bootstrap/run.json')
assert index['head']==closed['head']==identity['head']==identity['checkoutSha']=='93f0f58284f3c0df6c6e4c8e055d208845748f15'
assert identity['sourceBranch']=='job/G02-gin-rummy-audit-20261009'
assert identity['runId']==closed['runId']=='37894118428' and identity['runAttempt']==closed['runAttempt']=='1'
assert index['originalGuardedSources']==len(index['copied'])==len(before)==35
assert after['sources']==before and after['sourceError'] is None
assert len(index['additionalCopied'])==2 and after['additionalSources']==index['additionalSources'] and after['additionalSourceError'] is None and closed['additionalSourceUnchanged']
assert set(index['additionalSources'])=={'../../contract/package.json','evidence/audit-20261009/bootstrap-request.json'}
assert closed['statusBeforeClosure']=='success' and closed['sourceUnchanged'] and closed['bootstrapWorkflowUnchanged']
self_bytes=(art/'initial-presence-bootstrap/bootstrap-workflow.yml').read_bytes();self_sha=hashlib.sha256(self_bytes).hexdigest()
assert self_sha==index['bootstrapWorkflowSha256']==after['bootstrapWorkflowSha256']==closed['bootstrapWorkflowSha256']=='e9584c44b44c07248d36cbe71147b536f9a92756358c7bfa00495f6c975dce28'
source_paths=[]
for copy in index['copied']+index['additionalCopied']:
 name=copy['artifactPath'];assert name.startswith('.work/')
 b=(art/name[len('.work/'):]).read_bytes();assert len(b)==copy['bytes'] and hashlib.sha256(b).hexdigest()==copy['sha256']=={**before,**index['additionalSources']}[copy['originalPath']]
 actual=(root/copy['originalPath']).resolve().read_bytes();assert actual==b
 source_paths.append((root/copy['originalPath']).resolve())
assert len(set(source_paths))==37
actual_files={p.relative_to(art).as_posix() for p in art.rglob('*') if p.is_file()}
assert len(closed['files'])==59
assert actual_files=={f['path'][len('.work/'):] for f in closed['files']}|{'initial-presence-bootstrap/CLOSED.json'}
for f in closed['files']:
 assert f['path'].startswith('.work/');b=(art/f['path'][len('.work/'):]).read_bytes();assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256']
original=Path('/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy')
guard_paths=source_paths+[base/'official-11599895348.zip',base/'official-job-113701426182.log',base/'validate-strict-original.mjs',base/'full-reader.py',base/'proof-mirror/repo/contract/package.json',base/'exact-source-rebuild-CLOSED.json']+[p for p in art.rglob('*') if p.is_file()]+[original/'scripts/strict-browser-proof.mjs',original/'scripts/browser-source-guard.mjs']
guards={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in guard_paths}
r=subprocess.run(['node',str(base/'validate-strict-original.mjs')],cwd=root,capture_output=True,text=True);(base/'strict-original-reader.log').write_text(r.stdout+r.stderr);assert r.returncode==0,r.stderr;strict=json.loads(r.stdout)
report=read(art/'browser/report.json');attempt=art/'browser/attempts'/report['runId']
for name in ['report.json','desktop-frames.json','phone4x-frames.json']:assert (art/'browser'/name).read_bytes()==(attempt/name).read_bytes()
assert (attempt/'browser-check.mjs').read_bytes()==(root/'scripts/browser-check.mjs').read_bytes()
independent=[]
for row in report['rows']:
 sample=read(art/'browser'/f"{row['label']}-frames.json");frames=sample['frames'];timestamps=sample['timestamps']
 assert len(frames)==600 and len(timestamps)==601
 assert frames==[timestamps[i+1]-timestamps[i] for i in range(600)]
 assert all(math.isfinite(x) and x>0 for x in frames)
 total=0.0
 for nativeInterval in frames:total+=nativeInterval
 mean=total/600;ordered=sorted(frames);stats={'meanMs':mean,'p99Ms':ordered[math.floor(599*.99)],'maxMs':ordered[-1],'fps':1000/mean}
 for k,v in stats.items():assert v==row[k]==sample[k]
 assert stats['fps']>=59 and stats['p99Ms']<=17;independent.append({'profile':row['label'],**stats,'rawIntervals':600})
assert report['extra']['host']['passed']==5 and len(report['extra']['publicHistory'])==2
captures=read(art/'browser/captures.json');assert (art/'browser/capture-attempts'/captures['tag']/'captures.json').read_bytes()==(art/'browser/captures.json').read_bytes()
videos=[]
for row in captures['rows']:
 p=art/row['path'][len('.work/'):];b=p.read_bytes();assert len(b)==row['bytes'] and len(b)<10*1024*1024 and hashlib.sha256(b).hexdigest()==row['sha256']
 probe=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],capture_output=True,text=True);assert probe.returncode==0;meta=json.loads(probe.stdout);streams=meta['streams'];assert len(streams)==1 and streams[0]['codec_name']=='vp8';assert (streams[0]['width'],streams[0]['height'])==((1280,844) if row['cpuThrottle']==1 else (390,844))
 decode=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True);assert decode.returncode==0,decode.stderr
 videos.append({'path':row['path'],'bytes':len(b),'sha256':row['sha256'],'codec':streams[0]['codec_name'],'width':streams[0]['width'],'height':streams[0]['height'],'duration':meta['format']['duration'],'fullDecodeExit':decode.returncode})
after_guards={p:hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in guards};assert after_guards==guards
proof={'closedUtc':datetime.now(timezone.utc).isoformat(),'singleWorkflowCompliant':True,'fullOriginalVerifyNotYetAccepted':True,'head':closed['head'],'runId':37894118428,'jobId':113701426182,'artifactId':11599895348,'all60ZipMembersCrcRead':True,'original35CopiesByteEqual':True,'closedManifest59FilesExact':True,'workflowSelfSha256':self_sha,'strictOriginalReader':strict,'independentNativeStatistics':independent,'allAttemptCopiesIdentical':True,'videos':videos,'actualBeforeAfterGuards':len(guards),'sourceStart':guards,'sourceEnd':after_guards,'sourceUnchanged':True,'samplerRerun':False}
(base/'full-original-artifact-reader-CLOSED.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps({k:v for k,v in proof.items() if k not in ['sourceStart','sourceEnd']}))
