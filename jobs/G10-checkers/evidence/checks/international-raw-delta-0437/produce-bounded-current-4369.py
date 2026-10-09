"""One finite private full raw generation. No browser/timing/physical HTML/gzip."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import ctypes,importlib.util,json,os,resource,subprocess,sys,time,traceback
BASE=Path(__file__).resolve().parent
JOB=BASE.parent.parent
REPO=JOB.parent.parent
HEAD='4369bbdd1f71f34960893afd1ba456fee8e24ecd'
SPEC=BASE/'producer-spec-current-4369.json'
NODE=JOB/'.work/memory-json-private/node22/runtime/bin/node'
HELPER=JOB/'.work/hosted-df-memory-parts-cd9/receive.py'
WALL_SECONDS=180
RSS_ENVELOPE=768*1024*1024
SHARED_RESERVE=1536*1024*1024
DISK_RESERVE=256*1024*1024
def utc():return datetime.now(timezone.utc).isoformat()
def write(name,value):(BASE/name).write_text(json.dumps(value,indent=2)+'\n')
def digest(path):
 h=sha256()
 with path.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def identity(path):
 s=path.stat();return {'dev':s.st_dev,'ino':s.st_ino,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def freeze():
 raw=SPEC.read_bytes();spec=json.loads(raw);assert spec['head']==HEAD
 assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=REPO,timeout=10).decode().strip()==HEAD
 observed={}
 for label,row in spec['files'].items():
  p=Path(row['path']);actual={'path':str(p),'resolved':str(p.resolve()),'sha256':digest(p),'identity':identity(p)}
  assert actual==row and identity(p)==row['identity'],'Frozen producer code/source/runtime drift: '+label
  observed[label]=actual
 assert observed['controller']['path']==str(Path(__file__).resolve())
 assert observed['node']['sha256']=='8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d'
 assert observed['helper']['sha256']=='dc9b18ff9f62430b51538c96f82cf691813f0ef3ff28a88112a70e67736fc241'
 assert observed['python']['resolved']==str(Path(sys.executable).resolve())
 installed=[]
 for folder,dirs,names in os.walk(JOB/'node_modules',followlinks=True):
  for name in names:
   p=Path(folder)/name
   if p.is_file():installed.append(str(p))
 assert sorted(installed)==spec['installedLogicalFiles'],'Installed package/alias inventory drift'
 return {'specSha256':sha256(raw).hexdigest(),'specIdentity':identity(SPEC),'files':observed}
def memory():
 p=Path('/sys/fs/cgroup');maximum=int((p/'memory.max').read_text());current=int((p/'memory.current').read_text())
 return {'maxBytes':maximum,'currentBytes':current,'headroomBytes':maximum-current}
def group_rss(group):
 rows=[]
 for p in Path('/proc').glob('[0-9]*/stat'):
  try:
   text=p.read_text();fields=text[text.rfind(')')+2:].split()
   if int(fields[2])!=group or fields[0]=='Z':continue
   values=(p.parent/'status').read_text().splitlines();rss=next(int(v.split()[1])*1024 for v in values if v.startswith('VmRSS:'))
   rows.append({'pid':int(p.parent.name),'rssBytes':rss})
  except (OSError,ValueError,IndexError,StopIteration):pass
 return {'at':utc(),'processes':rows,'observedTotalRssBytes':sum(r['rssBytes'] for r in rows)}
def main():
 assert ctypes.CDLL(None).prctl(36,1,0,0,0)==0,'Subreaping unavailable'
 started=utc();before=freeze();write('producer-freeze-before.json',before)
 mem=memory();assert mem['headroomBytes']>RSS_ENVELOPE+SHARED_RESERVE,'Fresh shared memory reserve unavailable'
 v=os.statvfs(BASE);free=v.f_bavail*v.f_frsize;assert free>DISK_RESERVE+80*1024*1024,'Private small-output disk reserve unavailable'
 assert not (BASE/'generated/raw-output.json').exists(),'Do not overwrite a retained actual attempt'
 child=None;failed=False;closure=None;samples=[];code=None
 write('producer-controller.json',{'status':'RUNNING','startedAt':started,'head':HEAD,'memoryBefore':mem,'diskFreeBefore':free,'frozenSpecSha256':before['specSha256']})
 try:
  with (BASE/'producer.stdout').open('wb') as out,(BASE/'producer.stderr').open('wb') as err:
   env={'PATH':'/usr/bin:/bin','TZ':'UTC','LANG':'C.UTF-8','G10_BUILD_BROWSER_ONLY':'1','G10_HTML_OUT':str(BASE/'generated/not-written.html')}
   child=subprocess.Popen([str(NODE),str(BASE/'build-candidate-bounded.mjs')],cwd=JOB,env=env,stdout=out,stderr=err,start_new_session=True)
   deadline=time.monotonic()+WALL_SECONDS
   while child.poll() is None:
    sample=group_rss(child.pid);samples.append(sample)
    assert sample['observedTotalRssBytes']<=RSS_ENVELOPE,'Observed owned group RSS envelope exceeded'
    if time.monotonic()>deadline:raise TimeoutError('Declared finite raw producer wall exceeded')
    time.sleep(.05)
   code=child.wait(timeout=3)
  assert code==0,'Canonical raw producer failed'
 except BaseException:failed=True;raise
 finally:
  if child is not None:closure=group_helper.close_worker_group(child,failed)
  write('producer-child-closure.json',{'startedAt':started,'closedAt':utc(),'wallLimitSeconds':WALL_SECONDS,'readerException':failed,'closure':closure,'actualExitCode':code})
  write('producer-rss-samples.json',{'samples':samples,'observedPeakGroupRssBytes':max((s['observedTotalRssBytes'] for s in samples),default=0),'scope':'Actual sampled owned-group RSS every50ms; not an invented exact simultaneous peak or performance result.'})
 assert closure['natural'] and not closure['actualRemainingGroup']
 raw=json.loads((BASE/'generated/raw-output.json').read_text());assert raw['status']=='GENERATED_FULL_RAW_UNADOPTED'
 assert raw['originalFiles']==41 and raw['originalParts']==1304 and raw['originalDataBytes']==1006478762
 assert raw['canonicalCandidateBuilderSha256']=='4d1ce03c9c546dac6d0763aca705f2555c638234f820f71dc5f93c1837c53885'
 assert raw['candidateBrowserSourceSha256']=='bf8b12c6a389daa050f70f602e53480b506c0f4810288c24ebb6810a6aa477cf'
 assert (BASE/'producer.stderr').stat().st_size==0
 after=freeze();assert after==before;write('producer-freeze-after.json',after)
 write('producer-controller.json',{'status':'CLOSED_GENERATED','startedAt':started,'closedAt':utc(),'head':HEAD,'actualExitCode':0,'natural':True,'closure':closure,'rawOutput':raw,'memoryBefore':mem,'memoryAfter':memory(),'maxChildRssBytes':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss*1024,'scope':'One actual finite full canonical private candidate raw EOF generation, all349/sixdocs/fullinstalledaliases/self/code/source/runtime frozen unchanged. No full HTML/gzip allocated, no native timing, game/FPS acceptance or production/playergain/KEEP adoption. Independent complete source-byte/delta comparison still required.'})
 print(json.dumps({'status':'CLOSED_GENERATED','closedAt':utc(),'outputBytes':raw['outputBytes'],'outputSha256':raw['outputSha256'],'actualRemainingGroup':closure['actualRemainingGroup']}),flush=True)
if __name__=='__main__':
 assert digest(HELPER)=='dc9b18ff9f62430b51538c96f82cf691813f0ef3ff28a88112a70e67736fc241'
 helper_spec=importlib.util.spec_from_file_location('approved_group_helper',HELPER);group_helper=importlib.util.module_from_spec(helper_spec);helper_spec.loader.exec_module(group_helper)
 try:main()
 except BaseException as e:
  write('producer-failure.json',{'status':'FAILED','closedAt':utc(),'errorType':type(e).__name__,'error':str(e),'traceback':traceback.format_exc()});write('producer-controller.json',{'status':'CLOSED_FAILED','closedAt':utc(),'head':HEAD,'errorType':type(e).__name__,'error':str(e)});raise
 finally:
  try:write('producer-freeze-finally.json',{'status':'PASS','closedAt':utc(),'actual':freeze()})
  except BaseException as e:
   write('producer-freeze-finally.json',{'status':'FAILED','closedAt':utc(),'error':str(e)});write('producer-failure.json',{'status':'FAILED','closedAt':utc(),'errorType':type(e).__name__,'error':str(e),'scope':'Whole failed even if raw generation saved earlier'});write('producer-controller.json',{'status':'CLOSED_FAILED','closedAt':utc(),'head':HEAD,'error':str(e),'reason':'Final freeze failed; no whole acceptance'});raise
