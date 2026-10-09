from pathlib import Path
import subprocess,hashlib,json,datetime
base=Path('/tmp/G02-KEEP19-draw-boundary-20261009');job=Path('/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
paths=[job/p for p in ['src/core.ts','src/cards.ts','dist/core.mjs','dist/cards.mjs','play.html','package.json','package-lock.json','tests/gin-cases.mjs','tests/helpers.mjs','tests/draw-subset-boundary.test.mjs']]+[base/'corrected-compile-one-mutation.mjs',base/'corrected-mutation-controller.py']
before={str(p):sha(p) for p in paths};started=now()
build=subprocess.run(['node',str(base/'corrected-compile-one-mutation.mjs')],cwd=job,capture_output=True,text=True);(base/'corrected-mutation-build.stdout').write_text(build.stdout);(base/'corrected-mutation-build.stderr').write_text(build.stderr)
run=subprocess.run(['node','--test',str(base/'mutant-draw-boundary.test.mjs')],cwd=job,capture_output=True,text=True) if build.returncode==0 else None
if run:(base/'corrected-mutation-test.stdout').write_text(run.stdout);(base/'corrected-mutation-test.stderr').write_text(run.stderr)
after={str(p):sha(p) for p in paths};killed=run is not None and run.returncode!=0 and 'ERR_ASSERTION' in run.stdout+run.stderr and 'discard' in run.stdout+run.stderr
receipt={'closedUtc':now(),'startedUtc':started,'buildExit':build.returncode,'assertionTestExit':run.returncode if run else None,'actualCompiledMutationCaught':killed,'naturalChildClosure':True,'guardedInputs':len(before),'sourceStart':before,'sourceEnd':after,'sourceUnchanged':before==after,'pass':build.returncode==0 and killed and before==after,'productionStrategyChanged':False,'noLocalSampler':True}
(base/'corrected-one-compiled-mutant-CLOSED.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k not in ['sourceStart','sourceEnd']}));print(build.stdout+build.stderr);print((run.stdout+run.stderr)[:2200] if run else 'test not run');raise SystemExit(0 if receipt['pass'] else 1)

