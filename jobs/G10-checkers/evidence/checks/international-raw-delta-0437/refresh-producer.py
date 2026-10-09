"""Freeze a new doc-only head for the already reviewed, unexecuted producer."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import difflib,json,os,posixpath,subprocess,sys
JOB=Path.cwd();BASE=JOB/'.work/international-ready-private'
CURRENT='4369bbdd1f71f34960893afd1ba456fee8e24ecd'
ACCEPTED='474c1a64b3a8f69b81b3bd60f0a55f2782dc8d1f'
def digest(p):
 h=sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def row(p):
 p=p.absolute();s=p.stat();return {'path':str(p),'resolved':str(p.resolve()),'sha256':digest(p),'identity':{'dev':s.st_dev,'ino':s.st_ino,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}}
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],text=True).strip()==CURRENT
basecode=(BASE/'produce-bounded.py').read_text();assert sha256(basecode.encode()).hexdigest()=='1005f05771f90eeae6902d2739e6b3d7bd7f763f302a85eb8ed1c8c5b5acbfc5'
currentcode=basecode.replace("HEAD='"+ACCEPTED+"'","HEAD='"+CURRENT+"'").replace("SPEC=BASE/'producer-spec.json'","SPEC=BASE/'producer-spec-current-4369.json'")
assert currentcode!=basecode
controller=BASE/'produce-bounded-current-4369.py';assert not controller.exists(),'Preserve prior prepared sources/attempts'
controller.write_text(currentcode)
(BASE/'produce-bounded-current-4369.diff').write_text(''.join(difflib.unified_diff(basecode.splitlines(True),currentcode.splitlines(True),fromfile='fully-reviewed-unexecuted-1005.py',tofile='actual-current-head-4369.py')))
docs=['README.md','VERIFY.md','NEXT.md','LOOP.md','ASSUMPTIONS.md','SHA256SUMS.txt']
changed=subprocess.check_output(['/usr/bin/git','diff','--name-only',ACCEPTED,CURRENT],text=True).splitlines()
for name in changed:assert name in ['jobs/G10-checkers/'+n for n in docs] or name.startswith('jobs/G10-checkers/evidence/checks/hosted-pr-complete-474/') or name.startswith('jobs/G10-checkers/evidence/checks/international-bounded-proposal-0416/'),name
guards=json.loads((JOB/'.work/hosted-474-final/extracted/.work/checks/stage-browser.json').read_text())['sourceGuardsAfter'];assert len(guards)==349
tracked=set(subprocess.check_output(['/usr/bin/git','ls-tree','--full-tree','-r','--name-only',CURRENT],text=True).splitlines());original=generated=0
rows={}
for label,oldrow in json.loads((BASE/'producer-spec.json').read_text())['files'].items():
 p=controller if label=='controller' else Path(oldrow['path']);r=row(p)
 if label.startswith('guard:'):
  relative=label.removeprefix('guard:');assert r['sha256']==guards[relative],relative
  path=posixpath.normpath('jobs/G10-checkers/'+relative)
  if path in tracked:original+=1
  else:generated+=1
 rows[label]=r
assert original==206 and generated==143
for name in docs:assert (JOB/name).read_bytes()==subprocess.check_output(['/usr/bin/git','cat-file','blob',CURRENT+':jobs/G10-checkers/'+name])
installed=[]
for folder,dirs,names in os.walk(JOB/'node_modules',followlinks=True):
 for name in names:
  p=Path(folder)/name
  if p.is_file():installed.append(str(p))
oldinstalled=json.loads((BASE/'producer-spec.json').read_text())['installedLogicalFiles'];assert sorted(installed)==oldinstalled
rows['preparer']=row(Path(__file__))
spec={'head':CURRENT,'acceptedUnchangedRuntimeHead':ACCEPTED,'preparedAt':datetime.now(timezone.utc).isoformat(),'installedLogicalFiles':sorted(installed),'files':rows,'unchangedRuntimeGitProof':'All349 actual files match genuine accepted474 guards; complete immutable474-to4369 changed-path allowlist contains only sixdocs and these two proof archives; all206 original guard paths are immutable currentGit unchanged.','changedPaths':changed}
sp=BASE/'producer-spec-current-4369.json';assert not sp.exists();sp.write_text(json.dumps(spec,indent=2)+'\n')
subprocess.run([sys.executable,'-m','py_compile',str(controller)],check=True)
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],text=True).strip()==CURRENT
result={'status':'PREPARED_UNEXECUTED','closedAt':datetime.now(timezone.utc).isoformat(),'head':CURRENT,'reviewedBaseControllerSha256':sha256(basecode.encode()).hexdigest(),'currentControllerSha256':digest(controller),'currentSpecSha256':digest(sp),'producerSha256':digest(BASE/'build-candidate-bounded.mjs'),'sourceGuardCount':349,'currentImmutableOriginalFilesUnchanged':206,'generatedRuntimeFilesMatched':143,'currentDocs':6,'installedAliases':len(installed),'frozenFiles':len(rows),'allowedControllerDelta':'Only actual immutable HEAD and explicitly separate fresh spec filename; original code/gates/resource/deadline/reap/finally behavior unchanged.'}
(BASE/'fresh-4369-preparation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
