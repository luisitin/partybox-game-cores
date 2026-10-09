from datetime import datetime,timezone
from pathlib import Path
from hashlib import sha256
import subprocess,json,time,os,traceback
base=Path('.work/hosted-df-browser'); node=Path('.work/memory-json-private/node22/runtime/bin/node');html=Path('.work/play-full-candidate-b4.html')
def utc():return datetime.now(timezone.utc).isoformat()
def digest(p):
 h=sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def identity(p):
 s=p.stat();return {'dev':s.st_dev,'ino':s.st_ino,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
started=utc(); initial=identity(html); before=digest(node);assert before=='8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d';children=[]; child=None
try:
 for name,args,timeout in [('git-guards',['python3',str(base/'audit-git-guards.py')],60),('browser',[str(node),str(base/'validate-browser.mjs')],180)]:
  record={'name':name,'startedAt':utc(),'status':'RUNNING'};children.append(record)
  with (base/(name+'.stdout')).open('wb') as out,(base/(name+'.stderr')).open('wb') as err:
   child=subprocess.Popen(args,stdout=out,stderr=err,start_new_session=True);record['pid']=child.pid
   try:code=child.wait(timeout=timeout);record['natural']=True
   finally:
    if child.poll() is None:os.killpg(child.pid,15);record['natural']=False
    child.wait();record.update({'closedAt':utc(),'exitCode':child.returncode,'status':'CLOSED'})
  assert code==0 and record['natural'];child=None
 assert identity(html)==initial and digest(html)=='b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb' and identity(html)==initial
 assert digest(node)==before
 status='CLOSED_PASS'
except BaseException as error:
 status='CLOSED_FAILED';(base/'failure.json').write_text(json.dumps({'at':utc(),'errorType':type(error).__name__,'error':str(error),'traceback':traceback.format_exc()},indent=2)+'\n');raise
finally:
 receipt={'status':status,'startedAt':started,'closedAt':utc(),'children':children,'nodeBeforeSha256':before,'nodeAfterSha256':digest(node),'physicalBeforeAfterIdentity':initial,'readerSha256':digest(base/'validate-browser.mjs'),'scope':'Finite independent actual current browser proof; no local native timing trial and no inferred full completion'};(base/'reader-controller.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
