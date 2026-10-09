"""Independent, sequential official ZIP receiver; no import of the production join helper.

The parent keeps the joined standard-library SHA state. Each download and raw
member reader is a finite child and must naturally close before verified duplicate
ZIP cleanup. The full parent closes after all four and final read-only source hash.
Signed URLs live only in ignored private-spec.json and are never written to receipts.
"""
from datetime import datetime, timezone
from hashlib import sha256
import json, os, shutil, stat, subprocess, sys, traceback
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

DIRECTORY = Path(__file__).resolve().parent
JOB = DIRECTORY.parent.parent
REPOSITORY = JOB.parent.parent
HEAD = '21770325250068d5a2fb05a8c31209894ca806d2'
CURRENT = '0718272a91bfda8749c7e4df25ce22c5c578d7fd'
RUN = 37857480233
HTML_BYTES = 1390845993
HTML_SHA = '5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801'
PART_BYTES = 384 * 1024 * 1024
STAGES = ['node', 'league-american', 'league-international', 'browser']

def utc(): return datetime.now(timezone.utc).isoformat()
def write(path, value): path.write_text(json.dumps(value, indent=2) + '\n')
def digest_file(path):
    result = sha256()
    with path.open('rb') as source:
        while block := source.read(1024 * 1024): result.update(block)
    return result.hexdigest()
def identity(path):
    s = path.stat()
    return {'dev':s.st_dev,'ino':s.st_ino,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def git(args): return subprocess.check_output(['git'] + args, cwd=REPOSITORY)

def worker(index):
    started = utc()
    spec = json.loads((DIRECTORY/'private-spec.json').read_text())
    item = spec['parts'][index]
    artifact = item['artifact']
    assert spec['sourceHead'] == HEAD and spec['workflowRunId'] == RUN
    assert artifact['name'] == f'G10-standalone-part-{index:02d}-{HEAD}'
    assert artifact['expired'] is False
    assert artifact['workflow_run']['head_sha'] == HEAD
    assert artifact['workflow_run']['id'] == RUN
    path = DIRECTORY / f'part-{index:02d}.zip'
    zipped_bytes = path.stat().st_size
    assert zipped_bytes == artifact['size_in_bytes'] < 536870912
    zipped_sha = digest_file(path)
    assert artifact['digest'] == 'sha256:' + zipped_sha
    helper = git(['cat-file','blob',HEAD+':jobs/G10-checkers/scripts/standalone-parts.py'])
    helper_sha = sha256(helper).hexdigest()
    with ZipFile(path) as archive:
        infos = archive.infolist()
        assert len(infos) == 4
        names, basenames = set(), {}
        for info in infos:
            member = PurePosixPath(info.filename)
            assert not member.is_absolute() and '..' not in member.parts
            assert '\\' not in info.filename and not stat.S_ISLNK(info.external_attr >> 16)
            assert info.filename not in names and member.name not in basenames
            names.add(info.filename); basenames[member.name] = info
        assert set(basenames) == {f'play.html.part-{index:02d}', 'standalone-parts.json',
                                  'standalone-delivery.json', 'standalone-parts.py'}
        manifest_bytes = archive.read(basenames['standalone-parts.json'])
        receipt_bytes = archive.read(basenames['standalone-delivery.json'])
        actual_helper = archive.read(basenames['standalone-parts.py'])
        assert actual_helper == helper
        manifest, receipt = json.loads(manifest_bytes), json.loads(receipt_bytes)
        assert manifest['schemaVersion'] == receipt['schemaVersion'] == 1
        assert manifest['deliveryReceipt'] == receipt
        assert manifest['helper'] == 'standalone-parts.py' and manifest['helperSha256'] == helper_sha
        assert manifest['partBytes'] == PART_BYTES and len(manifest['parts']) == 4
        assert receipt['sourceCommit'] == receipt['checkoutCommit'] == HEAD
        assert receipt['bytes'] == HTML_BYTES and receipt['sha256'] == HTML_SHA
        assert receipt['page'] == 'play.html' and receipt['acceptedStages'] == STAGES
        expected_offset = index * PART_BYTES
        expected_size = min(PART_BYTES, HTML_BYTES - expected_offset)
        row = manifest['parts'][index]
        assert row['name'] == f'play.html.part-{index:02d}' and row['offset'] == expected_offset
        assert row['bytes'] == expected_size > 0
        for prior, previous in enumerate(manifest['parts']):
            assert previous['name'] == f'play.html.part-{prior:02d}'
            assert previous['offset'] == prior * PART_BYTES
            assert previous['bytes'] == min(PART_BYTES, HTML_BYTES-prior*PART_BYTES)
        for name, raw in [('standalone-parts.json',manifest_bytes),('standalone-delivery.json',receipt_bytes),('standalone-parts.py',actual_helper)]:
            (DIRECTORY / f'part-{index:02d}-{name}').write_bytes(raw)
        info = basenames[row['name']]
        assert info.file_size == expected_size
        count, digest = 0, sha256()
        with archive.open(info) as source:
            while block := source.read(1024*1024):
                count += len(block); digest.update(block)
                sys.stdout.buffer.write(block)
        sys.stdout.buffer.flush()
        assert count == expected_size and digest.hexdigest() == row['sha256']
    result = {'status':'PASS','startedAt':started,'closedAt':utc(),'artifactId':artifact['id'],
              'head':HEAD,'workflowRunId':RUN,'index':index,'zipBytes':zipped_bytes,'zipSha256':zipped_sha,
              'memberBytes':count,'memberSha256':digest.hexdigest(),'offset':expected_offset,
              'members':4,'safeUniqueMembers':True,'allMemberCRC':'PASS','helperGitSha256':helper_sha}
    write(DIRECTORY/f'part-{index:02d}-worker.json',result)

def receiver():
    started = utc()
    assert git(['rev-parse','HEAD']).decode().strip() == CURRENT
    spec = json.loads((DIRECTORY/'private-spec.json').read_text())
    assert spec['sourceHead'] == HEAD and spec['workflowRunId'] == RUN and spec['currentCheckpoint'] == CURRENT
    assert [r['index'] for r in spec['parts']] == list(range(4))
    baseline = Path(spec['baseline']); initial = identity(baseline)
    assert initial['bytes'] == HTML_BYTES
    assert digest_file(baseline) == HTML_SHA
    write(DIRECTORY/'controller.json',{'status':'STARTED','startedAt':started,'head':HEAD,'currentCheckout':CURRENT,'baselineIdentity':initial,'scope':'Historical217 actual official delivery recovery, current071 preserved read-only. Not current acceptance or KEEP result.'})
    joined, total, results = sha256(), 0, []
    manifest_bytes = receipt_bytes = helper_bytes = None
    with baseline.open('rb') as original:
        for item in spec['parts']:
            index, artifact = item['index'], item['artifact']
            path = DIRECTORY / f'part-{index:02d}.zip'
            assert not path.exists()
            assert shutil.disk_usage(DIRECTORY).free > artifact['size_in_bytes'] + 128*1024*1024
            assert artifact['expired'] is False and datetime.fromisoformat(artifact['expires_at'].replace('Z','+00:00')) > datetime.now(timezone.utc)
            download_start = utc()
            with (DIRECTORY/f'part-{index:02d}-download.stderr').open('wb') as stderr:
                download = subprocess.run(['curl','--silent','--show-error','--fail','--location','--max-time','180','--output',str(path),item['downloadUrl']],stdout=subprocess.DEVNULL,stderr=stderr)
            download_closed = utc()
            write(DIRECTORY/f'part-{index:02d}-download.json',{'startedAt':download_start,'closedAt':download_closed,'exitCode':download.returncode,'artifactId':artifact['id'],'fileServiceFileId':item['fileServiceFileId']})
            assert download.returncode == 0
            worker_start = utc()
            mismatches, received = [], 0
            with (DIRECTORY/f'part-{index:02d}-worker.stderr').open('wb') as stderr:
                child = subprocess.Popen([sys.executable,str(Path(__file__).resolve()),'worker',str(index)],stdout=subprocess.PIPE,stderr=stderr)
                assert child.stdout is not None
                while block := child.stdout.read(1024*1024):
                    expected = original.read(len(block))
                    if expected != block and len(mismatches) < 10: mismatches.append(total+received)
                    joined.update(block); received += len(block)
                child.stdout.close()
                exit_code = child.wait()
            worker_closed = utc()
            assert exit_code == 0 and not mismatches
            result = json.loads((DIRECTORY/f'part-{index:02d}-worker.json').read_text())
            assert result['status'] == 'PASS' and received == result['memberBytes']
            assert result['offset'] == total
            raw_manifest=(DIRECTORY/f'part-{index:02d}-standalone-parts.json').read_bytes()
            raw_receipt=(DIRECTORY/f'part-{index:02d}-standalone-delivery.json').read_bytes()
            raw_helper=(DIRECTORY/f'part-{index:02d}-standalone-parts.py').read_bytes()
            if index == 0: manifest_bytes,receipt_bytes,helper_bytes=raw_manifest,raw_receipt,raw_helper
            else: assert (raw_manifest,raw_receipt,raw_helper)==(manifest_bytes,receipt_bytes,helper_bytes)
            total += received
            # Actual copy digest again after natural worker closure, before deletion.
            assert path.stat().st_size == artifact['size_in_bytes']
            assert digest_file(path) == result['zipSha256'] == artifact['digest'].removeprefix('sha256:')
            # Prove this exact remote file copy remains recoverable now; private signed URL never leaves private spec.
            recover_start = utc()
            with (DIRECTORY/f'part-{index:02d}-recoverability.stderr').open('wb') as stderr:
                remote = subprocess.run(['curl','--silent','--show-error','--fail','--location','--head','--max-time','45',item['downloadUrl']],capture_output=False,stdout=subprocess.PIPE,stderr=stderr)
            recover_closed = utc()
            assert remote.returncode == 0
            lengths=[];statuses=[]
            for line in remote.stdout.decode(errors='strict').splitlines():
                if line.lower().startswith('content-length:'): lengths.append(int(line.split(':',1)[1].strip()))
                if line.startswith('HTTP/'): statuses.append(int(line.split()[1]))
            assert statuses and statuses[-1] == 200 and lengths and lengths[-1] == artifact['size_in_bytes']
            recovery={'status':'VERIFIED_RECOVERABLE_DUPLICATE','artifactId':artifact['id'],'workflowRunId':RUN,'sourceHead':HEAD,
                      'officialArchiveDownloadUrl':artifact['archive_download_url'],'expiresAt':artifact['expires_at'],
                      'fileServiceFileId':item['fileServiceFileId'],'zipBytes':artifact['size_in_bytes'],'zipSha256':result['zipSha256'],
                      'metadataReadAt':spec['metadataReadAt'],'downloadNaturallyClosedAt':download_closed,
                      'readerProcessStartedAt':worker_start,'readerNaturallyClosedAt':worker_closed,'readerExitCode':exit_code,
                      'actualRawBaselineRangeByteEqual':True,'recoverabilityStartedAt':recover_start,'recoverabilityNaturallyClosedAt':recover_closed,
                      'recoverabilityExitCode':remote.returncode,'remoteHTTPStatus':statuses[-1],'remoteContentLength':lengths[-1],
                      'cleanupScope':'Only this newly downloaded duplicate ZIP; baseline and unique raw/source/history unchanged.'}
            write(DIRECTORY/f'part-{index:02d}-recoverability.json',recovery)
            # No child/process/ZIP reader remains alive, and recovery receipt writer is closed.
            path.unlink()
            recovery['duplicateZipRemovedAt']=utc()
            write(DIRECTORY/f'part-{index:02d}-recoverability.json',recovery)
            results.append({**result,'readerNaturallyClosedAt':worker_closed,'downloadNaturallyClosedAt':download_closed,'recoverability':recovery})
            write(DIRECTORY/'progress.json',{'status':'RUNNING','partsNaturallyClosed':len(results),'totalReceivedBytes':total,'parts':results})
            print(json.dumps({'part':index,'status':'CLOSED_PASS','receivedBytes':received,'total':total}),flush=True)
        assert not original.read(1)
    assert total == HTML_BYTES and joined.hexdigest() == HTML_SHA
    assert identity(baseline) == initial
    assert digest_file(baseline) == HTML_SHA and identity(baseline) == initial
    assert git(['rev-parse','HEAD']).decode().strip() == CURRENT
    result={'status':'PASS','startedAt':started,'closedAt':utc(),'head':HEAD,'workflowRunId':RUN,'currentCheckoutPreserved':CURRENT,
            'parts':results,'totalBytes':total,'wholeReceivedSha256':joined.hexdigest(),'baselineBeforeAfterSha256':HTML_SHA,
            'baselineBeforeAfterIdentity':initial,'identicalAllFourManifestReceiptHelperBytes':True,
            'scope':'Actual four official historical217 ZIP size/SHA/safe paths/all-member CRC, exact original Git helper/manifest/source receipt/contiguous range sizes and hashes. Raw streamed complete HTML joined SHA and byte equality to read-only baseline; final full baseline hash/stat. Proven remote duplicate ZIP cleanup only. Not current071 CI/offline/FPS/KEEP acceptance.'}
    write(DIRECTORY/'independent-downloaded-parts.json',result)
    write(DIRECTORY/'controller.json',{'status':'CLOSED','exitCode':0,'startedAt':started,'closedAt':utc(),'result':'independent-downloaded-parts.json'})
    print(json.dumps({'status':'PASS','parts':4,'bytes':total,'sha256':joined.hexdigest(),'closedAt':result['closedAt']}),flush=True)

if __name__ == '__main__':
    try:
        if len(sys.argv)==3 and sys.argv[1]=='worker': worker(int(sys.argv[2]))
        else: receiver()
    except BaseException as error:
        write(DIRECTORY/('worker-'+sys.argv[2]+'-failure.json' if len(sys.argv)==3 else 'failure.json'),
              {'status':'FAILED','closedAt':utc(),'errorType':type(error).__name__,'error':str(error),'traceback':traceback.format_exc(),'scope':'Original failure retained; no PASS, no baseline mutation.'})
        raise
