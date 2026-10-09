from pathlib import Path
import hashlib, json, datetime, os, shutil, subprocess, sys

root=Path('/workspace/game-cores-G02-audit-source-20261009')
job=root/'jobs/G02-gin-rummy'
base=Path('/tmp/G02-current-407e528-artifact-20261009')
out=Path('/tmp/G02-saved-knock-proof-407e528-fixture-updated-20261009')
out.mkdir(exist_ok=False)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
files=set()
for d in [job,root/'contract',base/'extracted']:
 for p in d.rglob('*'):
  if d==job and any(x in ['.work','node_modules','.git'] for x in p.relative_to(d).parts):continue
  if p.is_file():files.add(p)
dep=(job/'node_modules').resolve()
for dp,dirs,names in os.walk(dep,followlinks=False):
 for n in names:
  p=Path(dp)/n
  if p.is_file():files.add(p)
for p in [Path(__file__),Path(sys.executable).resolve(),Path(shutil.which('node')).resolve(),root/'.github/workflows/G02.yml']:files.add(p)
freeze=lambda:{str(p):sha(p) for p in sorted(files)}
before=freeze()
(out/'READY.json').write_text(json.dumps({'createdUtc':now(),'kind':'saved-only proof and integrity','samplerExecuted':False,'sourceStart':before},indent=2)+'\n')
rows=[];error=None
try:
 live=job/'.work/browser'
 if live.exists():
  archived=job/'.work/browser-before-knock-saved-reader-407e528-fixture-updated-20261009'
  assert not archived.exists();live.rename(archived)
 shutil.copytree(base/'extracted/browser',live)
 commands=[['node','evidence/audit-20261009/bootstrap-407e528-current/validate-projections.mjs','--strict'],['node','--test','tests/browser-proof.test.mjs','tests/strict-browser-proof.test.mjs'],['node','scripts/integrity.mjs']]
 for i,cmd in enumerate(commands):
  start=now()
  with (out/('command-'+str(i)+'.stdout')).open('wb') as so,(out/('command-'+str(i)+'.stderr')).open('wb') as se:
   child=subprocess.Popen(cmd,cwd=job,stdout=so,stderr=se)
   try:rc=child.wait(timeout=180)
   except subprocess.TimeoutExpired:
    child.kill();rc=child.wait();raise RuntimeError('finite saved-only command timed out')
  rows.append({'command':cmd,'startedUtc':start,'closedUtc':now(),'exit':rc,'stdoutSha256':sha(out/('command-'+str(i)+'.stdout')),'stderrSha256':sha(out/('command-'+str(i)+'.stderr'))})
  if rc:raise RuntimeError('saved-only original check failed '+str(cmd))
except BaseException as e:error=repr(e)
finally:
 after=freeze()
 changed=[p for p in before if before[p]!=after[p]]
 rec={'closedUtc':now(),'kind':'saved-only projection original controls and integrity','sourceHead':'407e528d3008b3dff9f3304b9b3b6ecfffe4a916','nativeBootstrapAcceptedHistoricalHead':True,'samplerExecuted':False,'fullOriginalNpmTestAccepted':False,'commands':rows,'error':error,'sourceStart':before,'sourceEnd':after,'changedInputs':changed,'result':'PASS' if error is None and not changed else 'FAIL'}
 (out/'CLOSED.json').write_text(json.dumps(rec,indent=2)+'\n')
 print(json.dumps({'closedUtc':rec['closedUtc'],'result':rec['result'],'commands':rows,'frozenFiles':len(before),'changedInputs':changed,'error':error,'samplerExecuted':False}))
 sys.exit(0 if rec['result']=='PASS' else 1)
