import json,os,subprocess,sys
from datetime import datetime,timezone
from pathlib import Path

base=Path('.work/search-memo-private');node='.work/memory-json-private/node22/runtime/bin/node'
record={'status':'RUNNING','startedAt':datetime.now(timezone.utc).isoformat(),'pgid':os.getpgrp(),'phases':[]}
for phase,script in [('prepare','prepare.mjs'),('equivalence','full-equivalence.mjs'),('pilot','pilot.mjs')]:
    command=[node,str(base/script)]
    with (base/(phase+'.stdout.jsonl')).open('wb') as stdout,(base/(phase+'.stderr.log')).open('wb') as stderr:
        result=subprocess.run(['python3','.work/run-resource.py',str(base/(phase+'-resources.json')),*command],stdout=stdout,stderr=stderr)
    record['phases'].append({'phase':phase,'command':command,'exitCode':result.returncode,'closedAt':datetime.now(timezone.utc).isoformat()})
    (base/'run-report.json').write_text(json.dumps(record,indent=2)+'\n')
    if result.returncode:break
record['status']='PASS' if len(record['phases'])==3 and all(r['exitCode']==0 for r in record['phases']) else 'INCOMPLETE';record['closedAt']=datetime.now(timezone.utc).isoformat()
(base/'run-report.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record),flush=True)
sys.exit(0 if record['status']=='PASS' else 2)
