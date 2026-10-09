"""Finite untimed reader; full source/output/self freezes and group closure."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import ctypes,importlib.util,json,os,subprocess,sys,traceback
BASE=Path(__file__).resolve().parent;JOB=BASE.parent.parent
def load(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
assert sha256((BASE/'produce-bounded-current-4369.py').read_bytes()).hexdigest()=='dff43b06a3f515492d7759d1ae18e55d41cb3a3574a9f118f63aef219600b7bb'
assert sha256((BASE/'verify-delta-4369.py').read_bytes()).hexdigest()=='d1fae9fcd2f6d76c0639505754b305712f8dcffb939bd14b5dc9a4e351b02bdc'
producer=load('frozen_producer',BASE/'produce-bounded-current-4369.py')
helper=JOB/'.work/hosted-df-memory-parts-cd9/receive.py';assert sha256(helper.read_bytes()).hexdigest()=='dc9b18ff9f62430b51538c96f82cf691813f0ef3ff28a88112a70e67736fc241'
groups=load('approved_groups',helper)
extra=[Path(__file__),BASE/'verify-delta-4369.py',BASE/'generated/raw-output.json',BASE/'generated/candidate-bootstrap.js',BASE/'generated/international-parts.json',BASE/'generated/THIRD-PARTY-LICENSES.txt',BASE/'generated/dist/worker-american.mjs',BASE/'generated/dist/worker-international.mjs',BASE/'generated/dist/corpus-pack.json',BASE/'producer-controller.json',BASE/'producer-freeze-finally.json']
def freeze():return {'originalSourceSelfRuntimeAliases':producer.freeze(),'readerAndActualGeneratedInputs':{str(p):{'sha256':producer.digest(p),'identity':producer.identity(p)} for p in extra}}
def utc():return datetime.now(timezone.utc).isoformat()
def write(name,value):(BASE/name).write_text(json.dumps(value,indent=2)+'\n')
assert ctypes.CDLL(None).prctl(36,1,0,0,0)==0
started=utc();child=None;failed=False;before=None;closure=None
try:
 before=freeze();write('delta-freeze-before-4369.json',before)
 assert not (BASE/'delta-controls-4369.json').exists(),'No overwrite/retry of saved actual outcome'
 with (BASE/'delta-reader-4369.stdout').open('wb') as out,(BASE/'delta-reader-4369.stderr').open('wb') as err:
  child=subprocess.Popen([sys.executable,str(BASE/'verify-delta-4369.py')],cwd=JOB,env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','TZ':'UTC'},stdout=out,stderr=err,start_new_session=True)
  code=child.wait(timeout=180)
 assert code==0,'Independent source/delta reader failed'
except BaseException as e:
 failed=True;write('delta-failure-4369.json',{'status':'FAILED','at':utc(),'errorType':type(e).__name__,'error':str(e),'traceback':traceback.format_exc()});raise
finally:
 if child is not None:closure=groups.close_worker_group(child,failed)
 write('delta-controller-4369.json',{'status':'CLOSED_FAILED' if failed else 'CLOSED_PENDING_FINAL_FREEZE','startedAt':started,'closedAt':utc(),'wallLimitSeconds':180,'closure':closure})
 try:
  after=freeze();assert before is not None and after==before
  write('delta-freeze-finally-4369.json',{'status':'PASS','closedAt':utc(),'actual':after})
  if not failed:
   assert closure['natural'] and not closure['actualRemainingGroup']
   proof=json.loads((BASE/'delta-controls-4369.json').read_text());assert proof['status']=='PASS' and proof['resultSha256']=='b85a8288345c8e0040d523e3998d31216aa61b6872c8e3bc76313944802dd1b2'
   write('delta-controller-4369.json',{'status':'CLOSED_PASS','startedAt':started,'closedAt':utc(),'wallLimitSeconds':180,'closure':closure,'fullBeforeAfterFinallyFrozen':True,'scope':'Read-only actual wholeoriginaldata/canonicalraw/delta proof; not physical/offline/HTTP/browser/timing/gain acceptance.'})
   print(json.dumps({'status':'CLOSED_PASS','closedAt':utc(),'closure':closure}),flush=True)
 except BaseException as e:
  write('delta-controller-4369.json',{'status':'CLOSED_FAILED','startedAt':started,'closedAt':utc(),'closure':closure,'error':str(e),'reason':'Whole failed if final frozen source/output/self check fails'});write('delta-freeze-finally-4369.json',{'status':'FAILED','closedAt':utc(),'error':str(e)});raise
