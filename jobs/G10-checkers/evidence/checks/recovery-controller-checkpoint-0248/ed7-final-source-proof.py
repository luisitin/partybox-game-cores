from pathlib import Path
from datetime import datetime,timezone
from hashlib import sha256
import subprocess,json,os,traceback
base=Path('.work/checksum-correction-0208');node=Path('.work/memory-json-private/node22/runtime/bin/node')
def utc():return datetime.now(timezone.utc).isoformat()
def digest(path):
 h=sha256()
 with path.open('rb') as source:
  while b:=source.read(1<<20):h.update(b)
 return h.hexdigest()
started=utc();before=digest(node);assert before=='8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d';children=[];status='CLOSED_FAILED'
try:
 env=os.environ.copy();env['G10_HTML_PATH']='.work/play-full-candidate-b4.html'
 for name,args in [('hashes-final',[str(node),'scripts/hashes.mjs']),('integrity-final',[str(node),'scripts/integrity.mjs','--sources'])]:
  record={'name':name,'startedAt':utc()};children.append(record)
  with (base/(name+'.stdout')).open('wb') as out,(base/(name+'.stderr')).open('wb') as err:
   child=subprocess.Popen(args,env=env,stdout=out,stderr=err,start_new_session=True)
   try:code=child.wait(timeout=120);record['natural']=True
   finally:
    if child.poll() is None:os.killpg(child.pid,15);record['natural']=False
    child.wait();record.update({'closedAt':utc(),'exitCode':child.returncode})
  assert code==0 and record['natural']
 assert (base/'integrity-final.stdout').read_text().startswith('PASS: checksums, authoritative schemas/manifest')
 assert (base/'integrity-final.stderr').stat().st_size==0 and digest(node)==before
 guards=json.loads(Path('.work/hosted-df-browser/extracted/.work/checks/stage-browser.json').read_text())['sourceGuardsAfter'];assert len(guards)==349
 for relative,expected in guards.items():assert digest(Path(relative))==expected,relative
 changed=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines();assert all(x.removeprefix('jobs/G10-checkers/') in ['ASSUMPTIONS.md','LOOP.md','NEXT.md','SHA256SUMS.txt','VERIFY.md'] for x in changed)
 status='CLOSED_PASS'
except BaseException as error:
 (base/'final-source-failure.json').write_text(json.dumps({'status':'FAILED','at':utc(),'type':type(error).__name__,'error':str(error),'traceback':traceback.format_exc()},indent=2)+'\n');raise
finally:
 r={'status':status,'startedAt':started,'closedAt':utc(),'children':children,'nodeBeforeSha256':before,'nodeAfterSha256':digest(node),'finalManifestSha256':digest(Path('SHA256SUMS.txt')),'originalDfActualRuntimeSourceGuardCount':349,'originalImplementationUnchanged':status=='CLOSED_PASS','scope':'Final original checksum generator after every document/evidence write; then exact supported original --sources proof and all349 actual df runtime/source hashes, changed tracked paths are checksum/handoff docs only. Original allchecks/current-head CI and standalone reception remain separate.'};(base/'final-source-proof.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r),flush=True)
