from pathlib import Path
import json,hashlib,zipfile,subprocess,sys,shutil,datetime

here=Path(__file__).resolve().parent
job=here.parents[2]
base=job/'.work/G07-independent-audit/genuine-earlier-cache'
base.mkdir(parents=True,exist_ok=True)
earlier=job/'evidence/browser/hosted-41f6226/artifact.zip'
current=here/'hosted-canonical-final/artifact.zip'
assert hashlib.sha256(earlier.read_bytes()).hexdigest()=='87a98e203ec7f2b5bac369258e52a9d51081f0184861963d23a0f324c834f739'
assert hashlib.sha256(current.read_bytes()).hexdigest()=='b0765a5995d353f111d5019034bbc300f378dd20956a57e0f61a9278f9c916fd'
# Both sets of intervals are real, previously accepted native recordings.
# The only invalid combination is claiming the earlier cache belongs to the
# different current official ZIP. No sample, source or timing value is edited.
with zipfile.ZipFile(earlier)as archive:
 assert archive.testzip()is None
 archive.extractall(base/'source')
shutil.copyfile(current,base/'artifact.zip')
cached=json.loads((base/'source/jobs/G07-liars-dice/.work/browser/report.json').read_text())
with zipfile.ZipFile(current)as archive:
 actual=json.loads(archive.read('jobs/G07-liars-dice/.work/browser/report.json'))
assert cached['runId']!=actual['runId']
common=['--base',str(base),'--local-repository',str(job.parents[1]),
 '--head','1cc4a9709a60783ecad45476c02668d62f4c8a4a',
 '--run-id','37835172268','--job-id','113510247997','--artifact-id','11575897174',
 '--zip-bytes','1249263','--zip-sha256','b0765a5995d353f111d5019034bbc300f378dd20956a57e0f61a9278f9c916fd']
rows=[]
for name,reader in [('original',job/'evidence/checks/resume-audit-13-independent-hosted-reader.py'),
                    ('repaired',here/'zip-reader.py')]:
 result=subprocess.run([sys.executable,str(reader),*common],capture_output=True,text=True,timeout=10)
 (base/f'{name}.stdout').write_text(result.stdout)
 (base/f'{name}.stderr').write_text(result.stderr)
 rows.append({'reader':name,'exitCode':result.returncode,
  'stdoutSha256':hashlib.sha256(result.stdout.encode()).hexdigest(),
  'stderrSha256':hashlib.sha256(result.stderr.encode()).hexdigest()})
assert rows[0]['exitCode']==0,'Original cache weakness did not reproduce'
assert rows[1]['exitCode']!=0,'New ZIP/cache binding failed to reject the genuine mismatched cache'
report={'passed':True,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'scope':'Negative provenance control only; original acceptance of a mismatched genuine cache is invalid evidence, never a current positive',
 'expectedCurrentHead':'1cc4a9709a60783ecad45476c02668d62f4c8a4a',
 'actualCurrentReportRunId':actual['runId'],'genuineEarlierCachedReportRunId':cached['runId'],
 'currentArtifactSha256':hashlib.sha256(current.read_bytes()).hexdigest(),
 'earlierArtifactSha256':hashlib.sha256(earlier.read_bytes()).hexdigest(),
 'originalIncorrectlyAcceptedMismatchedCache':True,'repairedRejectsMismatchedCache':True,
 'timingValuesEdited':False,'gameplayChanged':False,'rows':rows}
(here/'cache-control.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
