from pathlib import Path
import hashlib,json,datetime,subprocess,sys
root=Path('/workspace/game-cores-G02-audit-source-20261009');job=root/'jobs/G02-gin-rummy';private=root/'.work/g02-audit-20261009'
stage=sys.argv[1];assert stage in ['leagues','mutants']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=[p for p in job.rglob('*') if p.is_file() and not any(x in ['.work','dist','node_modules','.git'] for x in p.relative_to(job).parts)]
if stage=='leagues':
 files=[p for p in files if str(p.relative_to(job))!='evidence/bot-league.json']
 (private/'bot-league-before3bf.json').write_bytes((job/'evidence/bot-league.json').read_bytes())
files+=sorted((job/'dist').glob('*.mjs'))+[root/'.github/workflows/G02.yml']
before={str(p):sha(p) for p in files}
command=['node','scripts/league.mjs' if stage=='leagues' else 'scripts/mutations.mjs']
with (private/('knock-original-'+stage+'.log')).open('w') as log:
 result=subprocess.run(command,cwd=job,stdout=log,stderr=subprocess.STDOUT)
after={str(p):sha(p) for p in files}
receipt={'closedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':' '.join(command),'exitCode':result.returncode,'actualGuards':len(before),'sourceStart':before,'sourceEnd':after,'sourceUnchanged':before==after,'samplerExecuted':False}
(private/('knock-original-'+stage+'-CLOSED.json')).write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k not in ['sourceStart','sourceEnd']}),flush=True)
print((private/('knock-original-'+stage+'.log')).read_text(),flush=True)
assert result.returncode==0 and before==after
