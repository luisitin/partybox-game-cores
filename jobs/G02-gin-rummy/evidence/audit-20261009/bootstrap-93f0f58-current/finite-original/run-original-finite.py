from pathlib import Path
import datetime, hashlib, json, subprocess, sys, zipfile

root=Path('/tmp/G02-source-93f0f58-20261009')
job=root/'jobs/G02-gin-rummy'
out=root/'FINITE-KEEP16'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
for stage in ['leagues','mutants']:
    files=[p for p in job.rglob('*') if p.is_file() and not any(x in ['.work','dist','node_modules','.git'] for x in p.relative_to(job).parts)]
    if stage=='leagues':
        files=[p for p in files if str(p.relative_to(job))!='evidence/bot-league.json']
        (out/'bot-league-before93f0.json').write_bytes((job/'evidence/bot-league.json').read_bytes())
    files+=sorted((job/'dist').glob('*.mjs'))+[root/'.github/workflows/G02.yml',Path(__file__)]
    before={str(p):sha(p) for p in files}
    command=['node','scripts/league.mjs' if stage=='leagues' else 'scripts/mutations.mjs']
    (out/(stage+'-READY.json')).write_text(json.dumps({'startedUtc':now(),'command':command,'sourceHead':'93f0f58284f3c0df6c6e4c8e055d208845748f15','sourceStart':before},indent=2)+'\n')
    with (out/(stage+'.stdout')).open('wb') as stdout,(out/(stage+'.stderr')).open('wb') as stderr:
        child=subprocess.Popen(command,cwd=job,stdout=stdout,stderr=stderr)
        result=child.wait()
    after={str(p):sha(p) for p in files}
    receipt={'closedUtc':now(),'command':command,'nativeExitCode':result,'actualBeforeAfterGuards':len(before),'sourceStart':before,'sourceEnd':after,'sourceUnchanged':before==after,'nativeSamplerExecuted':False}
    (out/(stage+'-CLOSED.json')).write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({k:v for k,v in receipt.items() if k not in ['sourceStart','sourceEnd']}),flush=True)
    print((out/(stage+'.stdout')).read_text(),flush=True)
    assert result==0 and before==after
    if stage=='mutants':
        directory=job/'.work/mutants'
        entries=[p for p in directory.rglob('*') if p.is_file()]
        target=out/'original26-compiled-mutants.zip'
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
            for p in sorted(entries):archive.write(p,p.relative_to(directory).as_posix())
        with zipfile.ZipFile(target) as archive:
            assert archive.testzip() is None
            for p in entries:assert archive.read(p.relative_to(directory).as_posix())==p.read_bytes()
        (out/'original26-archive-CLOSED.json').write_text(json.dumps({'closedUtc':now(),'archiveBytes':target.stat().st_size,'sha256':sha(target),'members':len(entries),'allMembersByteEqualAndFullCrcRead':True,'originalMutationsCommandUnchanged':True},indent=2)+'\n')
