from pathlib import Path
import json,hashlib,datetime,subprocess
base=Path('/tmp/G02-KEEP19-draw-boundary-20261009');owner=Path('/tmp/G02-source-93f0f58-20261009');job=owner/'jobs/G02-gin-rummy'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
paths=[job/p for p in ['src/core.ts','src/cards.ts','dist/core.mjs','dist/cards.mjs','play.html','package.json','package-lock.json','tests/gin-cases.mjs','tests/helpers.mjs']]+[owner/'.github/workflows/G02.yml',base/'corrected-production-probe.mjs',base/'rank-five.json',base/'tests-controller.py',job/'tests/draw-subset-boundary.test.mjs']
before={str(p):sha(p) for p in paths};started=now();(base/'tests-READY.json').write_text(json.dumps({'startedUtc':started,'sourceStart':before},indent=2)+'\n')
r=subprocess.run(['node','--test',str(job/'tests/draw-subset-boundary.test.mjs')],cwd=job,capture_output=True,text=True);(base/'tests.stdout').write_text(r.stdout);(base/'tests.stderr').write_text(r.stderr);after={str(p):sha(p) for p in paths}
receipt={'closedUtc':now(),'startedUtc':started,'nativeChildReturnCode':r.returncode,'naturalChildClosure':True,'guardedInputs':len(before),'sourceStart':before,'sourceEnd':after,'sourceUnchanged':before==after,'pass':r.returncode==0 and before==after,'candidateAdopted':False,'noLocalSampler':True}
(base/'tests-CLOSED.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k not in ['sourceStart','sourceEnd']}));print(r.stdout+r.stderr);raise SystemExit(0 if receipt['pass'] else 1)

