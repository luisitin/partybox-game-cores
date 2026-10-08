"""Independent complete HTTP-byte receiver; no browser or player-performance test."""
from datetime import datetime, timezone
from pathlib import Path
from hashlib import sha256
import json
import subprocess
import signal
import urllib.request

p=Path('.work/american-ready-private')
manifest=json.loads((p/'delta-controls.json').read_text())
node=Path('.work/memory-json-private/node22/runtime/bin/node')
started=datetime.now(timezone.utc).isoformat()
def digest_file(path):
    digest=sha256()
    with path.open('rb') as f:
        while block:=f.read(1048576):digest.update(block)
    return digest.hexdigest()
runtime=subprocess.check_output([str(node),'--version'],text=True).strip()
assert runtime=='v22.16.0'
binary=digest_file(node)
assert binary=='8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d'
source_sha=digest_file(p/'stream-server.mjs')
process=subprocess.Popen([str(node),str(p/'stream-server.mjs')],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
first=process.stdout.readline()
launch=json.loads(first)
assert launch['status']=='LISTENING'
assert launch['manifestSha256']==digest_file(p/'delta-controls.json')
report={'status':'RUNNING','startedAt':started,'runtime':runtime,'runtimeBinarySha256':binary,'serverSha256':source_sha,
        'deltaManifestSha256':launch['manifestSha256'],'requests':[],'scope':'Actual independent complete HTTP-byte receiver of both genuine full baseline/candidate emissions, hashes through EOF and final source identity. No browser/native player timing, cold-cache comparison or offline acceptance.'}
failure=None
try:
    for variant,expected_size,expected_sha in [('baseline',manifest['baseBytes'],manifest['baseSha256']),('candidate',manifest['resultBytes'],manifest['resultSha256'])]:
        digest=sha256();size=0
        with urllib.request.urlopen('http://127.0.0.1:'+str(launch['port'])+'/'+variant+'.html',timeout=120) as response:
            assert response.status==200 and int(response.headers['Content-Length'])==expected_size
            assert response.headers['Content-Type']=='text/html; charset=utf-8'
            assert response.headers.get('Content-Encoding') is None
            while chunk:=response.read(1048576):digest.update(chunk);size+=len(chunk)
        assert size==expected_size and digest.hexdigest()==expected_sha
        report['requests'].append({'variant':variant,'actualBytesReadThroughEOF':size,'actualSha256':digest.hexdigest(),'closedAt':datetime.now(timezone.utc).isoformat()})
except BaseException as error:
    failure=error;report['status']='FAIL';report['failure']=str(error)
finally:
    process.send_signal(signal.SIGTERM)
    remaining,stderr=process.communicate(timeout=120)
    (p/'http-server.stdout').write_text(first+remaining)
    (p/'http-server.stderr').write_text(stderr)
    report['serverExitCode']=process.returncode
    try:
        closed=json.loads(remaining.strip().splitlines()[-1]);assert closed['status']=='CLOSED'
        assert closed['finalSourceSha256']==manifest['baseSha256']
        assert len(closed['requests'])==2 and all(r['status']=='EMITTED_VERIFIED' for r in closed['requests'])
        assert [r['variant'] for r in closed['requests']]==['baseline','candidate']
        for row in closed['requests']:
            accepted=next(r for r in report['requests'] if r['variant']==row['variant'])
            assert row['bytes']==accepted['actualBytesReadThroughEOF'] and row['wholeSha256']==accepted['actualSha256']
        assert process.returncode==0 and stderr=='' and digest_file(node)==binary and digest_file(p/'stream-server.mjs')==source_sha
        if failure is None:report['status']='PASS'
    except BaseException as error:
        if failure is None:failure=error
        report['status']='FAIL';report['closureFailure']=str(error)
    report['closedAt']=datetime.now(timezone.utc).isoformat()
    (p/'http-byte-controls.json').write_text(json.dumps(report,indent=2)+'\n')
if failure is not None:raise failure
print(json.dumps(report))
