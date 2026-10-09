from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,hashlib,posixpath
BASE=Path(".work/american-ready-physical")
ACCEPTED="8b4bf64639d690247cb1929a0ad0ae25af11de70";CURRENT="4bfa6e0f41a3b860131fa227378f649766f99a43"
def utc():return datetime.now(timezone.utc).isoformat()
def sha(path):
 h=hashlib.sha256()
 with Path(path).open("rb") as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def blobsha(ref,path):
 h=hashlib.sha256();c=subprocess.Popen(["git","cat-file","blob",ref+":"+path],stdout=subprocess.PIPE)
 try:
  while b:=c.stdout.read(1<<20):h.update(b)
 finally:
  c.stdout.close();rc=c.wait()
 assert rc==0
 return h.hexdigest()
started=utc()
assert subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip()==CURRENT
native=json.loads(Path(".work/hosted-8b4-final/extracted/.work/checks/stage-node.json").read_text())
assert native["sourceCommit"]==ACCEPTED and native["workflowRunId"]=="37865331876" and native["sourceGuardsBefore"]==native["sourceGuardsAfter"]
guards=native["sourceGuardsAfter"];assert len(guards)==349
tracked=set(subprocess.check_output(["git","ls-tree","--full-tree","-r","--name-only",ACCEPTED],text=True).splitlines());original=[];generated=[]
for rel,expected in guards.items():
 path=posixpath.normpath("jobs/G10-checkers/"+rel)
 if path in tracked:
  assert blobsha(CURRENT,path)==expected,path
  original.append(path)
 else:generated.append(rel)
 assert sha(rel)==expected,rel
assert len(original)==206 and len(generated)==143
docs=[]
for name in ["README.md","VERIFY.md","NEXT.md","LOOP.md","ASSUMPTIONS.md","SHA256SUMS.txt"]:
 path="jobs/G10-checkers/"+name;a=blobsha(ACCEPTED,path);b=blobsha(CURRENT,path);assert sha(name)==b
 docs.append({"path":path,"immutableAccepted8b4Sha256":a,"immutableCurrent4bSha256":b,"currentWorkingMatchesGit":True,"equalToAccepted":a==b})
baseline=Path(".work/play-full-guarded.html");p=json.loads(Path(".work/baseline-cache-recovery-proposal-0045.json").read_text());s=baseline.stat()
def statrow(s):return {"dev":s.st_dev,"ino":s.st_ino,"bytes":s.st_size,"mtimeNs":s.st_mtime_ns,"ctimeNs":s.st_ctime_ns}
assert statrow(s)==p["actualStat"]
actual=sha(baseline);assert actual==p["actualWholeSha256"]=="5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801";assert statrow(baseline.stat())==statrow(s)
owners=[]
for proc in Path("/proc").iterdir():
 if not proc.name.isdigit():continue
 try:
  for fd in (proc/"fd").iterdir():
   try:
    fs=fd.stat()
    if fs.st_dev==s.st_dev and fs.st_ino==s.st_ino:owners.append({"pid":int(proc.name),"fd":int(fd.name),"comm":(proc/"comm").read_text().strip()})
   except (FileNotFoundError,PermissionError,ProcessLookupError):pass
 except (FileNotFoundError,PermissionError,ProcessLookupError):pass
assert not owners
assert subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip()==CURRENT
report={"status":"PASS_READONLY_PROPOSAL_NOT_DELETED","startedAt":started,"closedAt":utc(),"accepted8b4Head":ACCEPTED,"currentEvidenceOnlyHead":CURRENT,"sourceGuards":349,"currentGitSourceFilesMatchAccepted8b4":206,"exactGeneratedRuntimeGuards":143,"sixCurrentDocumentationGitBridge":docs,"baselineActualWholeSha256":actual,"baselineActualStat":statrow(s),"baselineStatUnchangedAfterActualFullRead":True,"baselineOpenFdOwners":owners,"physicalWriterSha256":sha(BASE/"build-physical-candidate.mjs"),"strictTypecheckSha256":sha(BASE/"candidate-strict-typecheck.json"),"scope":"Actual current4b immutable-source/runtime equality bridge to genuineaccepted8b4 completeartifact, fullimmediatebaseline5ed SHA/samestat/zeroFD; no unlink/write/adoption/timing occurred. Rootfreshglobal guard still required."}
(BASE/"source-baseline-proposal.json").write_text(json.dumps(report,indent=2)+"\n");print(json.dumps({k:report[k] for k in ["status","startedAt","closedAt","sourceGuards","currentGitSourceFilesMatchAccepted8b4","exactGeneratedRuntimeGuards","baselineActualWholeSha256","baselineActualStat","baselineOpenFdOwners","physicalWriterSha256"]}),flush=True)

