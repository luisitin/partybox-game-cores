"""Finite reception of one exact current hosted complete evidence archive.
Only reads actual hosted native checks; it never runs a browser/FPS experiment.
The exact original full reader inventory is unchanged. Provider URL is private
curl stdin, receipts are bounded, and all child groups close/reap before PASS.
"""
from pathlib import Path,PurePosixPath
from datetime import datetime,timezone
from hashlib import sha256
from zipfile import ZipFile
import ctypes,importlib.util,json,os,signal,stat,subprocess,sys,time,traceback,shutil
BASE=Path(__file__).resolve().parent
JOB=BASE.parent.parent
REPO=JOB.parent.parent
HEAD='cd9c554133769c264e0157c298d0bdc682d87b27'
RUN=37876461892
NODE=JOB/'.work/memory-json-private/node22/runtime/bin/node'
HELPER=JOB/'.work/hosted-df-memory-parts-cd9/receive.py'
CURL=Path('/usr/bin/curl')
ARTIFACT_LIMIT=20*1024*1024
EXTRACTED_LIMIT=128*1024*1024
DISK_RESERVE=256*1024*1024
WHOLE_WALL_SECONDS=600
CHILD_PATH='/usr/bin:/bin'
BLOCK=1024*1024
def utc():return datetime.now(timezone.utc).isoformat()
def write(name,value):(BASE/name).write_text(json.dumps(value,indent=2)+'\n')
def digest(path):
 h=sha256()
 with path.open('rb') as source:
  while b:=source.read(BLOCK):h.update(b)
 return h.hexdigest()
def identity(path):
 s=path.stat();return {'dev':s.st_dev,'ino':s.st_ino,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def freeze():
 raw=(BASE/'execution-freeze.json').read_bytes();expected=json.loads(raw)
 assert expected['head']==HEAD and expected['workflowRunId']==RUN
 observed={}
 for label,row in expected['files'].items():
  path=Path(row['path']);assert path.is_absolute()
  actual={'path':str(path),'sha256':digest(path),'identity':identity(path)}
  assert actual==row and identity(path)==row['identity'],'Frozen code/input/runtime drift: '+label
  observed[label]=actual
 assert observed['controller']['path']==str(Path(__file__).resolve())
 assert observed['python']['path']==str(Path(sys.executable).resolve())
 assert observed['node']['sha256']=='8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d'
 assert observed['groupHelper']['sha256']=='dc9b18ff9f62430b51538c96f82cf691813f0ef3ff28a88112a70e67736fc241'
 for binary in ['git','curl','ffmpeg','ffprobe']:assert shutil.which(binary,path=CHILD_PATH)==observed[binary]['path'],'Unfrozen child binary alias: '+binary
 return {'executionFreezeSha256':sha256(raw).hexdigest(),'executionFreezeIdentity':identity(BASE/'execution-freeze.json'),'files':observed}
def launch(name,args,bound,input_bytes=None):
 started=utc();child=None;failed=False;closure=None;code=None
 with (BASE/(name+'.stdout')).open('wb') as out,(BASE/(name+'.stderr')).open('wb') as err:
  try:
   child_env=os.environ.copy();child_env['PATH']=CHILD_PATH
   child=subprocess.Popen(args,cwd=JOB,env=child_env,stdin=subprocess.PIPE if input_bytes is not None else subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True)
   if input_bytes is not None:child.stdin.write(input_bytes);child.stdin.close()
   code=child.wait(timeout=bound)
  except BaseException:failed=True;raise
  finally:
   if child is not None:
    try:
     if child.stdin is not None and not child.stdin.closed:child.stdin.close()
    finally:
     closure=group_helper.close_worker_group(child,failed);write(name+'-closure.json',{'startedAt':started,'closedAt':utc(),'pid':child.pid,'wallLimitSeconds':bound,'readerException':failed,**closure})
 assert code==0 and closure['natural'] and not closure['actualRemainingGroup'],name
 return closure

def main():
 def deadline(signum,frame):raise TimeoutError('Declared finite complete-artifact whole deadline exceeded')
 signal.signal(signal.SIGALRM,deadline);signal.alarm(WHOLE_WALL_SECONDS)
 assert ctypes.CDLL(None).prctl(36,1,0,0,0)==0,'Cannot enable actual descendant subreaping'
 started=utc();before=freeze();write('execution-freeze-before.json',before)
 assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=REPO,timeout=10).decode().strip()==HEAD
 run=json.loads((BASE/'run-native.json').read_text());jobs=json.loads((BASE/'jobs-native.json').read_text());artifacts=json.loads((BASE/'artifacts-native.json').read_text())
 assert run['id']==RUN and run['head_sha']==HEAD and run['run_attempt']==1 and run['event']=='pull_request' and run['status']=='completed' and run['conclusion']=='success'
 assert len(jobs['jobs'])==5 and all(j['status']=='completed' and j['conclusion']=='success' for j in jobs['jobs'])
 private=json.loads((BASE/'official-reference.private.json').read_text());meta=private['officialMetadata'];reference=private['reference']
 assert meta in artifacts['artifacts'] and meta['name']=='G10-check-evidence-'+HEAD and not meta['expired'] and meta['workflow_run']['id']==RUN and meta['workflow_run']['head_sha']==HEAD
 assert datetime.fromisoformat(meta['expires_at'].replace('Z','+00:00'))>datetime.now(timezone.utc)
 assert type(meta['size_in_bytes']) is int and 0<meta['size_in_bytes']<ARTIFACT_LIMIT
 for job in jobs['jobs']:assert (BASE/f"job-{job['id']}.log").is_file()
 v=os.statvfs(BASE);free=v.f_bavail*v.f_frsize;assert free>DISK_RESERVE,'Insufficient finite archive disk reserve'
 physical=JOB/'.work/play-full-candidate-b4.html';physical_stat=identity(physical);assert physical_stat['bytes']==1390846291 and digest(physical)=='b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb' and identity(physical)==physical_stat
 zip_path=BASE/'complete.zip';extracted=BASE/'extracted';assert not zip_path.exists() and not extracted.exists(),'Do not overwrite a retained actual artifact/attempt'
 url=reference['file_uri']['download_url'];assert url.startswith('https://') and url.isascii() and all(ord(c)>=32 and ord(c)!=127 for c in url)
 config=('url = "'+url.replace('\\','\\\\').replace('"','\\"')+'"\n').encode('ascii')
 write('controller.json',{'status':'RUNNING','startedAt':started,'head':HEAD,'workflowRunId':RUN,'artifactId':meta['id'],'diskFreeBeforeBytes':free,'physicalIdentity':physical_stat,'executionFreezeSha256':before['executionFreezeSha256']})
 launch('download',[str(CURL),'--silent','--show-error','--fail','--location','--connect-timeout','15','--max-time','120','--retry','0','--max-filesize',str(meta['size_in_bytes']),'--write-out','%{stderr}\nG10_HTTP_STATUS:%{http_code}\n','--output',str(zip_path),'--config','-'],130,config)
 statuses=[line.removeprefix('G10_HTTP_STATUS:') for line in (BASE/'download.stderr').read_text().splitlines() if line.startswith('G10_HTTP_STATUS:')];assert statuses==['200']
 assert zip_path.stat().st_size==meta['size_in_bytes'] and meta['digest']=='sha256:'+digest(zip_path)
 assert freeze()==before
 with ZipFile(zip_path) as archive:
  entries=archive.infolist();assert 0<len(entries)<500 and len({i.filename for i in entries})==len(entries)
  assert sum(i.file_size for i in entries)<EXTRACTED_LIMIT
  for info in entries:
   member=PurePosixPath(info.filename)
   assert not member.is_absolute() and '..' not in member.parts and '\\' not in info.filename and str(member)==info.filename and not stat.S_ISLNK(info.external_attr>>16)
   assert 0<=info.file_size<EXTRACTED_LIMIT
   count=0
   with archive.open(info) as source:
    while b:=source.read(BLOCK):count+=len(b);assert count<=info.file_size
   assert count==info.file_size
  archive.extractall(extracted)
 write('zip-integrity.json',{'status':'PASS','startedAt':started,'closedAt':utc(),'sourceHead':HEAD,'workflowRunId':RUN,'artifactId':meta['id'],'zipBytes':meta['size_in_bytes'],'zipSha256':digest(zip_path),'safeUniqueMembers':len(entries),'uncompressedBytes':sum(i.file_size for i in entries),'allMemberCRC':'PASS','scope':'Actual exact current-cd9 official complete ZIP full size/SHA/safe unique paths/all CRC through EOF; exact independent native/source/raw/clip reader follows. No metadata-only acceptance.'})
 assert freeze()==before
 launch('audit-git-guards',[sys.executable,str(BASE/'audit-git-guards.py')],120)
 assert freeze()==before
 launch('independent-complete',[str(NODE),str(BASE/'validate-complete.mjs')],180)
 actual=json.loads((BASE/'independent-complete-evidence.json').read_text());assert actual['status']=='PASS' and actual['head']==HEAD and actual['workflowRunId']==str(RUN) and actual['stageGuardCount']==349
 assert digest(physical)=='b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb' and identity(physical)==physical_stat
 after=freeze();assert after==before;write('execution-freeze-after.json',after)
 write('controller.json',{'status':'CLOSED_PASS','exitCode':0,'startedAt':started,'closedAt':utc(),'head':HEAD,'workflowRunId':RUN,'artifactId':meta['id'],'readerSha256':digest(BASE/'validate-complete.mjs'),'physicalBeforeAfterIdentity':physical_stat,'frozenCodeInputsRuntimeBeforeAfter':after,'scope':'Genuine whole current-CD9 complete hosted native/game/raw/browser/clip acceptance through the unchanged original full reader. Historical df actual four-part byte acceptance with explicit current349 bridge is separate; no native FPS rerun or player gain/KEEP completion.'})
 print(json.dumps({'status':'CLOSED_PASS','closedAt':utc(),'head':HEAD,'artifactId':meta['id'],'all349NativeRawClipReaderPassed':True}),flush=True)

if __name__=='__main__':
 helper_spec=importlib.util.spec_from_file_location('bounded_group_helper',HELPER);group_helper=importlib.util.module_from_spec(helper_spec);helper_spec.loader.exec_module(group_helper)
 try:main()
 except BaseException as error:
  write('failure.json',{'status':'FAILED','closedAt':utc(),'errorType':type(error).__name__,'error':str(error),'traceback':traceback.format_exc(),'scope':'Actual failed finite original current-CD9 complete reception/reader preserved; no native performance trial/source gate mutation.'});raise
 finally:
  signal.alarm(0)
  try:write('execution-freeze-finally.json',{'status':'PASS','closedAt':utc(),'actual':freeze()})
  except BaseException as error:
   write('execution-freeze-finally.json',{'status':'FAILED','closedAt':utc(),'errorType':type(error).__name__,'error':str(error)});raise
