from pathlib import Path
import subprocess,json,hashlib,datetime
root=Path('/workspace/game-cores-G02-audit-source-20261009');job=root/'jobs/G02-gin-rummy';workflow=root/'.github/workflows/G02.yml'
base=root/'.work/g02-audit-20261009/knock-bootstrap-reason-controls';base.mkdir(exist_ok=False)
actual=workflow.read_bytes();old=subprocess.check_output(['git','show','cab97d5449e1e7a2442cf589039f697ddb5638dc:.github/workflows/G02.yml'],cwd=root)
literal=b",'verified material same-meld finishing knock repair; first capture for changed game source'"
assert actual.replace(literal,b'')==old
assert actual.split(b'  browser-bootstrap:',1)[0]==old.split(b'  browser-bootstrap:',1)[0]
text=actual.decode();block=text.split("        node --input-type=module <<'JS'\n",1)[1].split("        JS\n",1)[0]
lines=block.splitlines();assert all(line.startswith('        ') for line in lines);js='\n'.join(line[8:] for line in lines)+'\n'
(base/'exact-request-reader.mjs').write_text(js)
request=json.loads((job/'evidence/audit-20261009/bootstrap-request.json').read_text())
assert request['coreSha256']==hashlib.sha256((job/'src/core.ts').read_bytes()).hexdigest()
assert request['htmlSha256']==hashlib.sha256((job/'play.html').read_bytes()).hexdigest()
cases=[('current-enabled',{},0,'true'),('disabled-even-with-unknown-label',{'enabled':False,'reason':'invalid future label','coreSha256':'0'*64,'htmlSha256':'0'*64},0,'false'),('reject-unknown-label',{'reason':'unapproved unchanged timing retry'},1,None),('reject-core-pin',{'coreSha256':'0'*64},1,None),('reject-html-pin',{'htmlSha256':'0'*64},1,None),('reject-version',{'version':2},1,None),('reject-nonboolean',{'enabled':'true'},1,None)]
for i,reason in enumerate(['mandatory one-workflow correction; first capture binding the corrected G02 workflow','verified material Strong Gin-priority repair; first capture for changed game source','verified material Gin draw repair; first capture for changed game source']):
 cases.append(('previous-approved-label-'+str(i+1),{'reason':reason},0,'true'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=[p for p in job.rglob('*') if p.is_file() and not any(s in ['.work','dist','node_modules','.git'] for s in p.relative_to(job).parts)]
files+=sorted((job/'dist').glob('*.mjs'))+[workflow,Path(__file__),base/'exact-request-reader.mjs']
before={str(p):sha(p) for p in files};reports=[]
for name,changes,code,out in cases:
 case=base/name;(case/'evidence/audit-20261009').mkdir(parents=True);(case/'src').mkdir()
 (case/'src/core.ts').write_bytes((job/'src/core.ts').read_bytes());(case/'play.html').write_bytes((job/'play.html').read_bytes())
 supplied={**request,**changes};(case/'evidence/audit-20261009/bootstrap-request.json').write_text(json.dumps(supplied,indent=2)+'\n')
 output=case/'github-output.txt';env=dict(__import__('os').environ,GITHUB_OUTPUT=str(output))
 result=subprocess.run(['node',str(base/'exact-request-reader.mjs')],cwd=case,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 (case/'native.stdout.log').write_bytes(result.stdout);(case/'native.stderr.log').write_bytes(result.stderr)
 assert result.returncode==code,(name,result.returncode,result.stderr.decode())
 if out is not None:assert output.read_text()=='bootstrap='+out+'\n'
 else:assert not output.exists();assert b'AssertionError' in result.stderr;assert b'ERR_MODULE_NOT_FOUND' not in result.stderr
 report={'case':name,'nativeExitCode':result.returncode,'expectedExitCode':code,'nativeSignal':None,'assertionFailure':code==1,'bootstrapOutput':out,'samplersExecuted':False}
 (case/'CLOSED.json').write_text(json.dumps(report,indent=2)+'\n');reports.append(report)
after={str(p):sha(p) for p in files};assert before==after
receipt={'status':'EXACT_EXISTING_REQUEST_READER_TEN_CONTROLS_PASS','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':'node exact extracted existing once-only request reader (10 controlled private requests)','oldSourceHead':'cab97d5449e1e7a2442cf589039f697ddb5638dc','oldWorkflowSha256':hashlib.sha256(old).hexdigest(),'newWorkflowSha256':hashlib.sha256(actual).hexdigest(),'soleWorkflowChange':'one additional finite truthful material-repair reason literal','originalFullVerifyBytesUnchanged':True,'samplersExecuted':False,'actualGuards':len(before),'sourceStart':before,'sourceEnd':after,'sourceUnchanged':before==after,'cases':reports}
(base/'CLOSED.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k not in ['sourceStart','sourceEnd','cases']}),flush=True)
