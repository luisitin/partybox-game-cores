from pathlib import Path, PurePosixPath
import datetime, hashlib, json, subprocess, sys, termios, zipfile

base=Path('/tmp/G02-current-1478-artifact-20261009')
attributes=termios.tcgetattr(sys.stdin.fileno())
attributes[3]&=~termios.ECHO
termios.tcsetattr(sys.stdin.fileno(),termios.TCSANOW,attributes)
print('PRIVATE_STDIN_READY',flush=True)
urls=json.loads(sys.stdin.readline())
artifacts=json.loads((base/'failed-artifacts.json').read_text())
for i,artifact in enumerate(artifacts):
    target=base/('official-'+str(artifact['id'])+'.zip')
    config='url = "'+urls[i].replace('\\','\\\\').replace('"','\\"')+'"\n'
    result=subprocess.run(['curl','--config','-','--fail','--silent','--show-error','--location','--retry','0','--connect-timeout','15','--max-time','60','--output',str(target)],input=config,capture_output=True,text=True)
    (base/('artifact-'+str(artifact['id'])+'-proxy-curl.stderr')).write_text(result.stderr)
    receipt={'artifactId':artifact['id'],'curlExitCode':result.returncode,'closedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'signedReferenceFedViaPrivateStdin':True,'nativeSamplerRerun':False}
    (base/('artifact-'+str(artifact['id'])+'-transport-CLOSED.json')).write_text(json.dumps(receipt,indent=2)+'\n')
    assert result.returncode==0,(artifact['id'],result.returncode,result.stderr)
    raw=target.read_bytes()
    assert len(raw)==artifact['size_in_bytes']
    assert 'sha256:'+hashlib.sha256(raw).hexdigest()==artifact['digest']
    out=base/'failed-original-verify-extracted'
    out.mkdir()
    members=[]
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        for member in archive.infolist():
            name=PurePosixPath(member.filename)
            assert not name.is_absolute() and '..' not in name.parts and '\\' not in member.filename
            assert (member.external_attr>>16)&0o170000!=0o120000
            assert not member.is_dir()
            data=archive.read(member)
            assert len(data)==member.file_size
            path=out/name
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(data)
            members.append({'path':member.filename,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    receipt.update({'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'allSafeMembersFullCrcRead':True,'memberCount':len(members),'members':members,'readerClosedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
    (base/('artifact-'+str(artifact['id'])+'-CRC-CLOSED.json')).write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({k:v for k,v in receipt.items() if k!='members'}),flush=True)
