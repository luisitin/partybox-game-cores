"""Actual sequential official ZIP bodies in bounded RAM; no disk ZIP/raw temporary.
Derived acceptance inventory from the original independent217 receiver.
Each finite worker naturally closes before the next ZIP is allocated. Signed URL
configuration stays ignored/private. No timing, FPS, adoption or KEEP assertion.
"""
from datetime import datetime,timezone
from hashlib import sha256
from pathlib import Path,PurePosixPath
from zipfile import ZipFile
import io,json,os,resource,stat,subprocess,sys,traceback,urllib.request
BASE=Path(__file__).resolve().parent
JOB=BASE.parent.parent
REPOSITORY=JOB.parent.parent
HEAD='df123c797b226c479b50a998011c1ea6d0157391'
RUN=37870240814
HTML_BYTES=1390846291
HTML_SHA='b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb'
PART_BYTES=384*1024*1024
BLOCK=1024*1024
RAM_LIMIT=768*1024*1024
RAM_RESERVE=1536*1024*1024
STAGES=['node','league-american','league-international','browser']
def utc():return datetime.now(timezone.utc).isoformat()
def write(path,value):path.write_text(json.dumps(value,indent=2)+'\n')
def digest_file(path):
 result=sha256()
 with path.open('rb') as source:
  while block:=source.read(BLOCK):result.update(block)
 return result.hexdigest()
def identity(path):
 s=path.stat();return {'dev':s.st_dev,'ino':s.st_ino,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def git(args):return subprocess.check_output(['git']+args,cwd=REPOSITORY)
def unique_object(pairs):
 result={}
 for key,value in pairs:
  assert key not in result,'Duplicate JSON key';result[key]=value
 return result
def json_bytes(raw):return json.loads(raw,object_pairs_hook=unique_object)
def memory_budget():
 available=int(next(line.split()[1] for line in Path('/proc/meminfo').read_text().splitlines() if line.startswith('MemAvailable:')))*1024
 maximum=Path('/sys/fs/cgroup/memory.max').read_text().strip();current=int(Path('/sys/fs/cgroup/memory.current').read_text())
 headroom=available if maximum=='max' else min(available,int(maximum)-current)
 assert headroom>RAM_LIMIT+RAM_RESERVE,'Insufficient bounded RAM headroom'
 return {'memAvailableBytes':available,'cgroupMax':maximum,'cgroupCurrentBytes':current,'effectiveHeadroomBytes':headroom,'workerAddressSpaceLimitBytes':RAM_LIMIT,'sharedReserveBytes':RAM_RESERVE}
def guard_sources(spec):
 assert git(['rev-parse','HEAD']).decode().strip()==HEAD
 stage=json_bytes((JOB/'.work/hosted-df-browser/extracted/.work/checks/stage-browser.json').read_bytes())
 assert stage['sourceCommit']==HEAD and stage['workflowRunId']==str(RUN) and stage['workflowRunAttempt']=='1'
 guards=stage['sourceGuardsBefore'];assert stage['sourceGuardsAfter']==guards and len(guards)==349
 for relative,expected in guards.items():assert digest_file(JOB/relative)==expected,relative
 proof=json_bytes((JOB/'.work/hosted-df-browser/historical-git-guards.json').read_bytes())
 assert proof['status']=='PASS' and proof['acceptedHead']==HEAD and len(proof['gitTrackedOriginalBytes'])==206 and len(proof['generatedRuntimePathsRequireCurrentByteMatch'])==143
 for doc in proof['sixCurrentDocumentationGitBridge']:
  actual=(REPOSITORY/doc['path']).read_bytes();assert sha256(actual).hexdigest()==doc['currentGitSha256'];assert actual==git(['cat-file','blob',HEAD+':'+doc['path']])
 return sha256(json.dumps(guards,sort_keys=True).encode()).hexdigest()
def worker(index):
 resource.setrlimit(resource.RLIMIT_AS,(RAM_LIMIT,RAM_LIMIT))
 started=utc();spec=json_bytes((BASE/'private-spec.json').read_bytes());item=spec['parts'][index];artifact=item['artifact']
 assert spec['sourceHead']==HEAD and spec['workflowRunId']==RUN and artifact['name']==f'G10-standalone-part-{index:02d}-{HEAD}'
 assert artifact['expired'] is False and artifact['workflow_run']['head_sha']==HEAD and artifact['workflow_run']['id']==RUN
 assert datetime.fromisoformat(artifact['expires_at'].replace('Z','+00:00'))>datetime.now(timezone.utc)
 expected_zip_bytes=artifact['size_in_bytes'];assert type(expected_zip_bytes) is int and 0<expected_zip_bytes<310*1024*1024
 with io.BytesIO() as body:
  body.seek(expected_zip_bytes-1);body.write(b'\0');body.seek(0)
  downloaded=0;download_hash=sha256();download_started=utc()
  with urllib.request.urlopen(item['downloadUrl'],timeout=60) as response:
   assert response.status==200
   length=response.headers.get('Content-Length')
   if length is not None:assert int(length)==expected_zip_bytes
   while block:=response.read(BLOCK):
    downloaded+=len(block);assert downloaded<=expected_zip_bytes;download_hash.update(block);body.write(block)
  assert downloaded==expected_zip_bytes and artifact['digest']=='sha256:'+download_hash.hexdigest()
  download_closed=utc();view=body.getbuffer()
  try:assert sha256(view).hexdigest()==download_hash.hexdigest()
  finally:view.release()
  body.seek(0)
  helper=git(['cat-file','blob',HEAD+':jobs/G10-checkers/scripts/standalone-parts.py']);helper_sha=sha256(helper).hexdigest()
  with ZipFile(body) as archive:
   infos=archive.infolist();assert len(infos)==4
   names=set();basenames={}
   for info in infos:
    member=PurePosixPath(info.filename)
    assert not member.is_absolute() and '..' not in member.parts and '\\' not in info.filename and not stat.S_ISLNK(info.external_attr>>16)
    assert info.filename not in names and member.name not in basenames
    names.add(info.filename);basenames[member.name]=info
   assert set(basenames)=={f'play.html.part-{index:02d}','standalone-parts.json','standalone-delivery.json','standalone-parts.py'}
   for name in ['standalone-parts.json','standalone-delivery.json','standalone-parts.py']:assert 0<basenames[name].file_size<64*1024
   manifest_bytes=archive.read(basenames['standalone-parts.json']);receipt_bytes=archive.read(basenames['standalone-delivery.json']);actual_helper=archive.read(basenames['standalone-parts.py']);assert actual_helper==helper
   manifest=json_bytes(manifest_bytes);receipt=json_bytes(receipt_bytes)
   assert manifest['schemaVersion']==receipt['schemaVersion']==1 and manifest['deliveryReceipt']==receipt
   assert manifest['helper']=='standalone-parts.py' and manifest['helperSha256']==helper_sha and manifest['partBytes']==PART_BYTES and len(manifest['parts'])==4
   assert receipt['sourceCommit']==receipt['checkoutCommit']==HEAD and receipt['bytes']==HTML_BYTES and receipt['sha256']==HTML_SHA and receipt['page']=='play.html' and receipt['acceptedStages']==STAGES
   for prior,previous in enumerate(manifest['parts']):
    assert set(previous)=={'name','offset','bytes','sha256'} and previous['name']==f'play.html.part-{prior:02d}' and previous['offset']==prior*PART_BYTES and previous['bytes']==min(PART_BYTES,HTML_BYTES-prior*PART_BYTES)
    assert isinstance(previous['sha256'],str) and len(previous['sha256'])==64 and all(x in '0123456789abcdef' for x in previous['sha256'])
   row=manifest['parts'][index];info=basenames[row['name']];assert info.file_size==row['bytes']>0
   for name,raw in [('standalone-parts.json',manifest_bytes),('standalone-delivery.json',receipt_bytes),('standalone-parts.py',actual_helper)]: (BASE/f'part-{index:02d}-{name}').write_bytes(raw)
   count=0;member_hash=sha256()
   with archive.open(info) as source:
    while block:=source.read(BLOCK):count+=len(block);member_hash.update(block);sys.stdout.buffer.write(block)
   sys.stdout.buffer.flush();assert count==row['bytes'] and member_hash.hexdigest()==row['sha256']
  result={'status':'PASS','startedAt':started,'closedAt':utc(),'artifactId':artifact['id'],'head':HEAD,'workflowRunId':RUN,'index':index,'zipBytes':downloaded,'zipSha256':download_hash.hexdigest(),'downloadResponseStartedAt':download_started,'downloadResponseEOFCLOSEDAt':download_closed,'memberBytes':count,'memberSha256':member_hash.hexdigest(),'offset':row['offset'],'members':4,'safeUniqueMembers':True,'allMemberCRC':'PASS','helperGitSha256':helper_sha,'peakResidentBytes':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss*1024,'addressSpaceLimitBytes':RAM_LIMIT,'zipStorage':'One official body in private BytesIO, fixed1MiB raw blocks, no disk temp or second whole ZIP/raw copy'}
 write(BASE/f'part-{index:02d}-worker.json',result)
def receiver():
 started=utc();spec=json_bytes((BASE/'private-spec.json').read_bytes());assert spec['sourceHead']==HEAD and spec['workflowRunId']==RUN and spec['currentCheckpoint']==HEAD and [r['index'] for r in spec['parts']]==list(range(4))
 guards_before=guard_sources(spec);physical=JOB/'.work/play-full-candidate-b4.html';initial=identity(physical);assert initial['bytes']==HTML_BYTES and digest_file(physical)==HTML_SHA and identity(physical)==initial
 joined=sha256();total=0;results=[];canonical=None
 write(BASE/'controller.json',{'status':'RUNNING','startedAt':started,'head':HEAD,'physicalIdentity':initial,'sourceGuardFingerprint':guards_before})
 with physical.open('rb') as original:
  for item in spec['parts']:
   index=item['index'];budget=memory_budget();record={'status':'RUNNING','startedAt':utc(),'index':index,'memoryBudgetBefore':budget};write(BASE/f'part-{index:02d}-start.json',record)
   received=0;mismatches=[];child=None;reader_exception=False;terminated=False
   with (BASE/f'part-{index:02d}-worker.stderr').open('wb') as stderr:
    try:
     child=subprocess.Popen([sys.executable,str(Path(__file__).resolve()),'worker',str(index)],stdout=subprocess.PIPE,stderr=stderr,start_new_session=True);record['pid']=child.pid
     while block:=child.stdout.read(BLOCK):
      if original.read(len(block))!=block and len(mismatches)<10:mismatches.append(total+received)
      joined.update(block);received+=len(block)
    except BaseException:reader_exception=True;raise
    finally:
     if child is not None:
      if child.stdout is not None:child.stdout.close()
      if reader_exception and child.poll() is None:os.killpg(child.pid,15);terminated=True
      code=child.wait();record.update({'status':'TERMINATED_REAPED_AFTER_EXCEPTION' if terminated else 'NATURALLY_CLOSED','closedAt':utc(),'exitCode':code,'readerException':reader_exception,'terminateSent':terminated,'bytesReceived':received,'mismatchOffsets':mismatches});write(BASE/f'part-{index:02d}-closure.json',record)
   assert code==0 and not reader_exception and not terminated and not mismatches
   result=json_bytes((BASE/f'part-{index:02d}-worker.json').read_bytes());assert result['status']=='PASS' and received==result['memberBytes'] and result['offset']==total
   sidecars=tuple((BASE/f'part-{index:02d}-{name}').read_bytes() for name in ['standalone-parts.json','standalone-delivery.json','standalone-parts.py'])
   if canonical is None:canonical=sidecars
   else:assert sidecars==canonical
   total+=received;results.append({**result,'naturalWorkerClosure':record});write(BASE/'progress.json',{'status':'RUNNING','partsNaturallyClosed':len(results),'totalBytes':total,'parts':results});print(json.dumps({'part':index,'status':'CLOSED_PASS','receivedBytes':received,'total':total}),flush=True)
  assert original.read(1)==b''
 assert total==HTML_BYTES and joined.hexdigest()==HTML_SHA and identity(physical)==initial and digest_file(physical)==HTML_SHA and identity(physical)==initial and guard_sources(spec)==guards_before
 result={'status':'PASS','startedAt':started,'closedAt':utc(),'head':HEAD,'workflowRunId':RUN,'parts':results,'totalBytes':total,'wholeReceivedSha256':joined.hexdigest(),'physicalBeforeAfterSha256':HTML_SHA,'physicalBeforeAfterIdentity':initial,'sourceGuardFingerprintBeforeAfter':guards_before,'identicalAllFourManifestReceiptHelperBytes':True,'scope':'Actual four exact df official ZIP bodies each complete size/SHA in boundedRAM/safeunique all-memberCRC/original immutableGit helper, identical manifest/source receipt, all contiguous raw ranges streamed through EOF and byte-compared to current immutable physicalb4, complete joined actualSHA/all349guards/six currentdocs/final whole physicalSHA/stat. No temp ZIP, no source/uniquehistory deletion, no timing/FPS or KEEP claim.'}
 write(BASE/'independent-downloaded-parts.json',result);write(BASE/'controller.json',{'status':'CLOSED_PASS','exitCode':0,'startedAt':started,'closedAt':utc(),'result':'independent-downloaded-parts.json'});print(json.dumps({'status':'PASS','parts':4,'bytes':total,'sha256':joined.hexdigest(),'closedAt':result['closedAt']}),flush=True)
if __name__=='__main__':
 try:
  if len(sys.argv)==3 and sys.argv[1]=='worker':worker(int(sys.argv[2]))
  else:receiver()
 except BaseException as error:
  name='worker-'+sys.argv[2]+'-failure.json' if len(sys.argv)==3 else 'failure.json'
  write(BASE/name,{'status':'FAILED','closedAt':utc(),'errorType':type(error).__name__,'error':str(error),'traceback':traceback.format_exc(),'scope':'Original finite RAM reception failure preserved, no PASS/source mutation/tempfile/unique history deletion. Official source artifact remains referenced for recovery.'});raise
