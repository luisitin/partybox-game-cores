from pathlib import Path, PurePosixPath
import datetime, hashlib, json, subprocess, sys, termios, zipfile

base=Path('/tmp/G02-full-f46153e-artifact-20261009')
attributes=termios.tcgetattr(sys.stdin.fileno())
attributes[3]&=~termios.ECHO
termios.tcsetattr(sys.stdin.fileno(),termios.TCSANOW,attributes)
print('PRIVATE_STDIN_READY',flush=True)
url=json.loads(sys.stdin.readline())
artifact=json.loads((base/'official-artifact-metadata.json').read_text())
target=base/'official-full.zip'
config='url = "'+url.replace('\\','\\\\').replace('"','\\"')+'"\n'
result=subprocess.run(['curl','--config','-','--fail','--silent','--show-error','--location','--retry','0','--connect-timeout','15','--max-time','60','--output',str(target)],input=config,capture_output=True,text=True)
(base/'actual-curl.stderr').write_text(result.stderr)
receipt={'artifactId':artifact['id'],'curlExitCode':result.returncode,'closedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'signedReferenceFedViaPrivateStdin':True,'nativeSamplerRerun':False}
(base/'download-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
assert result.returncode==0,(artifact['id'],result.returncode,result.stderr)
raw=target.read_bytes()
assert len(raw)==artifact['size_in_bytes']
assert 'sha256:'+hashlib.sha256(raw).hexdigest()==artifact['digest']
out=base/'extracted'
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
receipt.update({'wholeBytes':len(raw),'wholeSha256':hashlib.sha256(raw).hexdigest(),'allMembersCrcRead':True,'allMembers':len(members),'members':members,'readerClosedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
(base/'full-zip-reader-CLOSED.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='members'}),flush=True)
