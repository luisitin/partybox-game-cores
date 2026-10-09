import json,hashlib,subprocess,datetime,sys
from pathlib import Path
base=Path('/tmp/G02-full-72bd-artifact-20261009');owner=Path('/tmp/G02-source-93f0f58-20261009');job=owner/'jobs/G02-gin-rummy';mirror=Path('/tmp/G02-current-1478-artifact-20261009/proof-mirror/repo/jobs/G02-gin-rummy')
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
jobs=json.loads((base/'official-jobs.json').read_text());assert [(j['name'],j['conclusion']) for j in jobs]==[('verify','success'),('browser-bootstrap','success')]
assert all(s['conclusion']=='skipped' for s in jobs[1]['steps'] if 5<=s['number']<=15)
log=(base/'official-disabled-bootstrap-113740122978-success.log').read_text();t=json.loads((base/'disabled-bootstrap-native-transport.json').read_text());assert len(log)==t['characters'] and len(log.split('\n'))!=0 and sha(base/'official-disabled-bootstrap-113740122978-success.log')==t['sha256']
report=json.loads((base/'extracted/.work/browser/report.json').read_text())
tracked=subprocess.check_output(['git','ls-files','--','jobs/G02-gin-rummy'],cwd=owner,text=True).splitlines();assert len(tracked)==1133
paths=[owner/p for p in tracked]+[mirror/p for p in report['sourceStart']]+[p for p in base.rglob('*') if p.is_file()]+[owner/'.github/workflows/G02.yml',Path('/tmp/G02-current-1478-artifact-20261009/exact-source-rebuild-CLOSED.json')]
paths=list(dict.fromkeys(str(p.resolve()) for p in paths));before={p:sha(Path(p)) for p in paths};started=now();ready={'startedUtc':started,'allInputGuards':len(before),'sourceStart':before,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=owner,text=True).strip(),'samplerExecutedLocally':False};(base/'full-reader-controller-READY.json').write_text(json.dumps(ready,indent=2)+'\n')
print(json.dumps({'state':'READY','startedUtc':started,'guards':len(before)}),flush=True)
child=subprocess.Popen([sys.executable,str(base/'full-reader.py')],cwd=owner,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
out,err=child.communicate();(base/'full-reader-controller.stdout').write_text(out);(base/'full-reader-controller.stderr').write_text(err);after={p:sha(Path(p)) for p in paths};result={'closedUtc':now(),'startedUtc':started,'nativeChildPid':child.pid,'nativeChildReturnCode':child.returncode,'naturalChildClosure':True,'guards':len(before),'sourceStart':before,'sourceEnd':after,'sourceUnchanged':before==after,'pass':child.returncode==0 and before==after,'noLocalSampler':True};(base/'full-reader-controller-CLOSED.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['sourceStart','sourceEnd']}),flush=True)
if result['pass']:
 proof=json.loads((base/'full-original-artifact-reader-CLOSED.json').read_text());print(json.dumps({k:v for k,v in proof.items() if k not in ['sourceStart','sourceEnd','functionalOutputs']}),flush=True)
else:print(out+err,flush=True)
raise SystemExit(0 if result['pass'] else 1)
