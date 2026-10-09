from pathlib import Path, PurePosixPath
import argparse, datetime, hashlib, io, json, math, os, posixpath, re, shutil, stat, subprocess, zipfile

parser=argparse.ArgumentParser(description='Read-only independent audit of genuine current G05 source/raw/capture evidence; never launches a browser.')
parser.add_argument('--head',required=True)
parser.add_argument('--run-id',required=True,type=int)
parser.add_argument('--evidence-dir',required=True,type=Path)
parser.add_argument('--package-license',type=Path,help='Pinned Zod4.6.5 MIT file; defaults to the checked-out job npm installation')
args=parser.parse_args()
repo=Path(__file__).resolve().parents[3]
root=args.evidence_dir.resolve()
head=args.head
assert re.fullmatch(r'[a-f0-9]{40}',head),'full immutable source commit required'
assert root.is_relative_to(repo/'.work'),'all auditor writes must remain private'
count=0

def check(ok,message):
 global count
 assert ok,message
 count+=1

def sha(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
def git_bytes(path):return subprocess.check_output(['git','show',head+':'+path],cwd=repo)
def git_text(path):return git_bytes(path).decode()
def json_list(source,name):
 match=re.search(r'export const '+name+r'=(\[[^;]+\]);',source)
 check(match is not None,'immutable '+name+' declaration exists')
 return json.loads(match.group(1).replace("'",'"'))

run=load(root/'workflow-run.json')
meta=load(root/'artifact-metadata.json')
check(run['id']==args.run_id and run['head_sha']==head and run['status']=='completed' and run['conclusion']=='success','actual full current hosted run accepted')
check(meta['workflow_run']['id']==args.run_id and meta['workflow_run']['head_sha']==head and meta['name']=='G05-check-evidence' and not meta['expired'],'actual native current artifact/head/run binding')
zb=(root/'actual.zip').read_bytes()
check(len(zb)==meta['size_in_bytes'] and sha(zb)==meta['digest'].removeprefix('sha256:'),'actual official complete ZIP bytes and digest')
out=root/'extracted'
with zipfile.ZipFile(io.BytesIO(zb)) as z:
 check(z.testzip() is None,'actual ZIP CRCs')
 seen=set()
 for entry in z.infolist():
  p=PurePosixPath(entry.filename)
  check(not p.is_absolute() and '..' not in p.parts and '\\' not in entry.filename and entry.filename not in seen and not stat.S_ISLNK(entry.external_attr>>16),'safe unique non-link entry')
  seen.add(entry.filename)
 out.mkdir(parents=True,exist_ok=True)
 z.extractall(out)
base=out/'visual'
report=load(base/'current-report.json')
current=load(base/'current-run.json')
checker=git_text('jobs/G05-hearts/scripts/check-visual.mjs')
guarded=json_list(checker,'guardedFiles')
required_new={'scripts/check-capture.mjs','scripts/capture.mjs','tests/capture-decoding.test.mjs','../../.github/workflows/G05.yml'}
check(len(guarded)==30 and len(set(guarded))==30 and required_new.issubset(guarded) and 'scripts/check-visual.mjs' in guarded,'all current30 original and self-binding names')
lock=json.loads(git_bytes('jobs/G05-hearts/package-lock.json'))
check(lock['packages']['node_modules/zod']['version']=='4.6.5','actual immutable pinned public package version')
notice=(args.package_license or repo/'jobs/G05-hearts/node_modules/zod/LICENSE').read_bytes()
check(sha(notice)=='3f1189b28e3866e0d979968d466b78f813f76827cfdca1fbb124cc0a5c8841f8','actual independently archived public pinned package MIT bytes')
expected={}
for name in guarded:
 data=notice if name=='node_modules/zod/LICENSE' else git_bytes(posixpath.normpath('jobs/G05-hearts/'+name))
 expected[name]=sha(data)
 check(report['sourceStart'].get(name)==expected[name],'current immutable actual guarded input '+name)
check(report['sourceStart']==expected and report['sourceEnd']==expected and current['sourceStart']==expected,'complete exact current before/after source maps')
check(current['runId']==report['runId'],'fresh current browser attempt binding')
sampler=git_bytes('jobs/G05-hearts/scripts/visual.mjs')
old_sampler=subprocess.check_output(['git','show','3c28358a576fdd65226f1bbd0ef47abd574add6b:jobs/G05-hearts/scripts/visual.mjs'],cwd=repo)
check(sampler==old_sampler,'entire native sampler unchanged from genuine original')
sampler_text=sampler.decode()
check("'-c:v','libvpx-vp9'" in sampler_text and "'-framerate','10'" in sampler_text and 'frame<36' in sampler_text and 'if(++n<60)' in sampler_text,'actual originalVP9/10FPS/36frames and60native warmup instructions')
check(report['kind']=='full' and report['passed'] is True and report['schemaVersion']==1 and report['fileOpened'] is True and report['serving']=='disk','actual full offline current browser report')
check(report['externalRequests']==0 and report['runtimeExceptions']==0 and report['completedPlayerCounts']==[3,4,5,6],'actual original zero network/errors and full rosters')
check(isinstance(report['chrome'],str) and report['chrome'].startswith('Chrome/'),'actual recorded browser identity')
check(datetime.datetime.fromisoformat(report['completedAt'].replace('Z','+00:00'))>=datetime.datetime.fromisoformat(report['startedAt'].replace('Z','+00:00')),'actual chronology')
flags=json_list(checker,'functionalFlags')
check(len(flags)==20 and len(set(flags))==20,'exact immutable original20 functional names')
for name in flags:check(report[name] is True,'actual current functional '+name)
check(report['minimumTapHeight']>=44 and report['controlBoundaryContrast']>=3 and report['footerContrast']>=4.5,'unchanged original accessibility thresholds')
folder=base/'runs'/expected['play.html']/report['runId']
attempt=load(folder/'attempt.json')
check(attempt['runId']==report['runId'] and attempt['sourceStart']==expected and attempt['sourceEnd']==expected and attempt['passed'] is True and attempt['failure'] is None,'actual full current attempt closure')
check(load(folder/'report.json')==report and load(base/'visual-measurements-01.json')==report,'all actual complete current report copies')
check((folder/'visual.mjs').read_bytes()==sampler,'actual archived sampler equals current immutable full native code')
profiles=[]
for name,width,height,cpu in [('desktop',1920,1080,1),('phone',390,844,4)]:
 p=report[name];raw=load(folder/(name+'-frames.json'))
 check(raw['runId']==report['runId'] and raw['sourceStart']==expected,'actual separate current raw source binding')
 check({k:v for k,v in raw.items() if k not in ['runId','sourceStart']}==p,'all actual separately retained raw fields identical')
 check(p['width']==width and p['height']==height and p['cpu']==cpu and p['warmupFrames']==60 and p['frames']==600 and p['overflow'] is False,'actual current unaltered steady-state profile')
 check(p['interaction']=='17-card private pass selection at10Hz; retained card controls','actual original untimed private selection workload')
 iv=p['rawIntervals']
 check(len(iv)==600 and all(type(v) in [int,float] and math.isfinite(v) and v>0 for v in iv),'all600 actual finite positive retained intervals')
 ordered=sorted(iv);mean=sum(iv)/600
 stats={'meanMs':mean,'fps':1000/mean,'p95Ms':ordered[570],'p99Ms':ordered[594],'maxMs':ordered[599]}
 for key,value in stats.items():check(math.isclose(value,p[key],rel_tol=1e-12,abs_tol=1e-9),'independent current '+key)
 check(stats['fps']>=59 and stats['p95Ms']<=18,'unchanged original59FPS/18ms current gate')
 profiles.append({'profile':name,'width':width,'height':height,'cpu':cpu,'retainedIntervals':600,'warmupFrames':60,**stats})

def identity(name):
 path=Path(shutil.which(name)).resolve()
 version=subprocess.run([str(path),'-version'],capture_output=True,text=True,check=True).stdout.splitlines()[0]
 return {'name':name,'realPath':str(path),'version':version,'sha256':sha(path.read_bytes())}
before={name:identity(name) for name in ['ffprobe','ffmpeg']}
actual_commands=[]
def inspect_clip(path,prefix,strict=True):
 probe_args=[before['ffprobe']['realPath'],'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(path)]
 probe=subprocess.run(probe_args,capture_output=True,text=True)
 (root/(prefix+'-probe.stdout')).write_text(probe.stdout);(root/(prefix+'-probe.stderr')).write_text(probe.stderr)
 actual_commands.append({'purpose':prefix+' probe','argv':probe_args,'exit':probe.returncode})
 if probe.returncode:raise ValueError('actual probe refuses media: '+prefix)
 pd=json.loads(probe.stdout)
 if len(pd['streams'])!=1:raise ValueError('actual one video stream required: '+prefix)
 s=pd['streams'][0]
 if s.get('codec_type')!='video' or s.get('codec_name') not in ['vp8','vp9']:raise ValueError('actual video codec required: '+prefix)
 decode_args=[before['ffmpeg']['realPath'],'-nostdin','-v','error','-xerror','-err_detect','explode','-i',str(path),'-map','0:v:0','-an','-f','framehash','-hash','sha256','-']
 decoded=subprocess.run(decode_args,capture_output=True,text=True)
 (root/(prefix+'-decode.stdout')).write_text(decoded.stdout);(root/(prefix+'-decode.stderr')).write_text(decoded.stderr)
 actual_commands.append({'purpose':prefix+' full decode','argv':decode_args,'exit':decoded.returncode})
 if decoded.returncode or decoded.stderr:raise ValueError('actual full decoder refuses media: '+prefix)
 rows=[line.split(',') for line in decoded.stdout.splitlines() if line.strip() and not line.startswith('#')]
 previous=None
 for fields in rows:
  if len(fields)!=6 or int(fields[0])!=0 or int(fields[4])<=0 or not re.fullmatch(r'[a-f0-9]{64}',fields[5].strip()):raise ValueError('invalid actual decoded framehash row: '+prefix)
  pts=int(fields[2])
  if previous is not None and pts<=previous:raise ValueError('actual decoded PTS fails monotonicity: '+prefix)
  previous=pts
 if strict and (s['width']!=1920 or s['height']!=1080):raise ValueError('actual strict milestone dimensions: '+prefix)
 if strict and (len(rows)!=36 or int(s['nb_read_frames'])!=36):raise ValueError('actual strict milestone requires36decoded frames: '+prefix)
 if strict and (s['r_frame_rate']!='10/1' or abs(float(pd['format']['duration'])-3.6)>=0.001):raise ValueError('actual strict milestone cadence/duration: '+prefix)
 if not rows:raise ValueError('actual decoded frames missing: '+prefix)
 return {'bytes':path.stat().st_size,'sha256':sha(path.read_bytes()),'stream':s,'format':pd['format'],'decodedFrames':len(rows),'fullDecodeExit':decoded.returncode,'framehashSha256':sha(decoded.stdout.encode()),'strictMilestone':strict}

path=report['videoPath'];check(bool(re.fullmatch(r'(?:media|\.tmp/visual)/[A-Za-z0-9_.-]+\.webm',path)),'actual original safe report video path')
clip=base/PurePosixPath(path).name
check(clip.name=='milestone-01.webm','actual original fullCI capture name')
bytes_=clip.read_bytes()
check(len(bytes_)==report['videoBytes'] and 0<len(bytes_)<10000000 and sha(bytes_)==report['videoSha256'],'actual current complete capture bytes and SHA')
check((folder/'capture.webm').read_bytes()==bytes_,'actual current full capture copies identical')
current_clip=inspect_clip(clip,'actual-current')
check(current_clip['stream']['codec_name']=='vp9' and current_clip['decodedFrames']==36,'actual current original-source VP9 and all36decoded frames')
for name,width,height in [('hearts-desktop-01.png',1920,1080),('hearts-phone-01.png',390,844)]:
 b=(base/name).read_bytes();check(b[:8]==b'\x89PNG\r\n\x1a\n' and int.from_bytes(b[16:20],'big')==width and int.from_bytes(b[20:24],'big')==height,'actual current screenshot dimensions')
controls=load(base/'capture-controls.json')
negative_names=['coherent hash of non-video rejected','coherent hash of truncated genuine video rejected','real complete one-frame video rejected for current milestone','coherently hashed full phone-shaped video rejected for TV milestone']
check(controls['kind']=='actual-media-verifier-controls' and controls['purpose']=='not current browser or FPS evidence' and controls['inherited']=='media/milestone-16.webm' and controls['negativeControls']==negative_names and controls['passed'] is True,'actual four hosted coherent-media controls receipt')
positive=controls['positive']
check(positive['videoPath']==controls['inherited'] and positive['strictMilestone'] is True and positive['codec']=='vp9' and positive['width']==1920 and positive['height']==1080 and positive['encodedFrameRate']=='10/1' and positive['decodedFrames']==36 and abs(positive['durationSeconds']-3.6)<0.001,'actual full original inherited positive media control')
for key in ['probe','decoder']:
 tool=positive[key];check(bool(re.fullmatch('[a-f0-9]{64}',tool['sha256'])) and bool(tool['executable']) and tool['version'].startswith('ff'+('probe' if key=='probe' else 'mpeg')+' version '),'actual hosted control tool path/version/SHA '+key)
check('-xerror' in positive['decoder']['args'] and 'explode' in positive['decoder']['args'] and 'framehash' in positive['decoder']['args'] and 'sha256' in positive['decoder']['args'],'actual hosted control full-decode command')
decoder=git_text('jobs/G05-hearts/scripts/check-capture.mjs')
test=git_text('jobs/G05-hearts/tests/capture-decoding.test.mjs')
workflow=git_text('.github/workflows/G05.yml')
check('realpathSync' in decoder and "sha256(readFileSync(executable))" in decoder and "frames.length, 36" in decoder and "'-xerror'" in decoder,'actual immutable full decoder source self-binding inspected')
check('original.subarray(0,Math.floor(original.length/2))' in test and "'-frames:v','1'" in test and "'scale=390:844'" in test and "assert.throws(()=>validateCapture({...receipt(path),kind:'full'}))" in test,'actual immutable coherent controls recipe inspected')
check('ffmpeg -version' in workflow and 'ffprobe -version' in workflow and 'install -y --no-install-recommends ffmpeg' in workflow and 'include-hidden-files: true' in workflow,'actual explicit hosted system tool and raw artifact workflow inspected')
hosted_current=None
if 'current-capture-decoding.json' in checker:
 hosted_current=load(base/'current-capture-decoding.json')
 check(hosted_current['kind']=='current-capture-decoding' and hosted_current['runId']==report['runId'],'actual current hosted decode receipt/run binding')
 check(hosted_current['sourceStart']==expected and hosted_current['sourceEnd']==expected,'actual current hosted decoder30-source binding')
 check(all(hosted_current[key]==report[key] for key in ['videoPath','videoBytes','videoSha256']),'actual current hosted clip receipt binding')
 node=hosted_current['node']
 check(node['version'].startswith('v24.') and Path(node['executable']).is_absolute() and bool(re.fullmatch('[a-f0-9]{64}',node['sha256'])),'actual current hosted Node identity declaration')
 hd=hosted_current['decoded']
 check(hd['videoPath']==report['videoPath'] and hd['strictMilestone'] is True and hd['codec']=='vp9' and hd['width']==1920 and hd['height']==1080 and hd['decodedFrames']==36 and hd['encodedFrameRate']=='10/1' and abs(hd['durationSeconds']-3.6)<0.001,'actual current hosted full36-frame VP9 metadata')
 raw=hd['frameHashOutput']
 check(sha(raw.encode())==hd['frameHashSha256'],'actual complete hosted framehash bytes and digest')
 def normalized_rows(output):return [[v.strip() for v in line.split(',')] for line in output.splitlines() if line.strip() and not line.startswith('#')]
 check(normalized_rows(raw)==normalized_rows((root/'actual-current-decode.stdout').read_text()),'all36 hosted decoded hashes/PTS/bytes equal actual independent full decode')
 for key in ['probe','decoder']:
  t=hd[key]; prior=positive[key]
  check(all(t[name]==prior[name] for name in ['executable','version','sha256']),'actual unchanged hosted current versus earlier control tool identity '+key)
 check(hd['probe']['args']==['-v','error','-show_streams','-show_format','-of','json',report['videoPath']],'actual current hosted probe command')
 check(hd['decoder']['args']==['-v','error','-xerror','-err_detect','explode','-i',report['videoPath'],'-map','0:v:0','-an','-f','framehash','-hash','sha256','-'],'actual current hosted full-decode command')
 check('probe executable changed during decode' in decoder and 'decoder executable changed during decode' in decoder,'actual immutable before/after tool guard source')

check(before=={name:identity(name) for name in ['ffprobe','ffmpeg']},'actual independent full decoder identities unchanged before/after')

summary={'observedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':head,'runId':args.run_id,'event':run['event'],'artifactId':meta['id'],'artifactBytes':len(zb),'artifactSha256':sha(zb),'safeEntries':len(seen),'independentAssertions':count,'currentGuardedSources':30,'sourceIdentity':expected,'rawIntervals':1200,'originalFunctionalFlags':20,'profiles':profiles,'steadyStateScope':'original sampler records600consecutive native intervals per profile AFTER explicit60-frame warmup; no first-frame/startup claim','nativeWitnessScope':'original untimed clock0 private17card selection at~10Hz; original sampler has no per-frame native-API or phase witnesses, none claimed','actualCurrentCapture':current_clip,'independentSystemTools':before,'actualDecodeCommands':actual_commands,'actualHostedMediaControls':controls,'hostedCurrentCaptureReceipt':hosted_current,'hostedControlToolScope':'earlier inherited control and, when required by exact checker, separate current clip receipt; independent host identities are not assumed equal','samplerSourceUnchanged':True,'newBrowserOrPerformanceRun':False,'trackedSourceOrGitMutatedByAuditor':False,'verificationReaderSha256':sha(Path(__file__).read_bytes()),'passed':True}
(root/'independent-current-receipt.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
