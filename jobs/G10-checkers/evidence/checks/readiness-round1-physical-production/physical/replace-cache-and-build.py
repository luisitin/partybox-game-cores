from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess,os,sys,time,signal
D=Path(".work/american-ready-physical");BASE=Path(".work/play-full-guarded.html");OUT=Path(".work/play-full-candidate-b4.html");NODE=Path(".work/memory-json-private/node22/runtime/bin/node")
CURRENT="4bfa6e0f41a3b860131fa227378f649766f99a43";EXPECTED="b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb";BYTES=1390846291
def utc():return datetime.now(timezone.utc).isoformat()
def write(name,obj):(D/name).write_text(json.dumps(obj,indent=2)+"\n")
def sha(path):
 h=hashlib.sha256()
 with Path(path).open("rb") as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def statrow(s):return {"dev":s.st_dev,"ino":s.st_ino,"bytes":s.st_size,"mtimeNs":s.st_mtime_ns,"ctimeNs":s.st_ctime_ns}
def fdowners(stat):
 result=[]
 for proc in Path("/proc").iterdir():
  if not proc.name.isdigit():continue
  try:
   for fd in (proc/"fd").iterdir():
    try:
     s=fd.stat()
     if s.st_dev==stat.st_dev and s.st_ino==stat.st_ino:result.append({"pid":int(proc.name),"fd":int(fd.name),"comm":(proc/"comm").read_text().strip()})
    except (FileNotFoundError,PermissionError,ProcessLookupError):pass
  except (FileNotFoundError,PermissionError,ProcessLookupError):pass
 return result
proposal=json.loads((D/"source-baseline-proposal.json").read_text());strict=json.loads((D/"candidate-strict-typecheck.json").read_text())
accepted=json.loads(Path(".work/hosted-8b4-final/reader-controller.json").read_text())
assert proposal["status"]=="PASS_READONLY_PROPOSAL_NOT_DELETED" and proposal["sourceGuards"]==349 and proposal["currentGitSourceFilesMatchAccepted8b4"]==206 and proposal["exactGeneratedRuntimeGuards"]==143
assert strict["status"]=="PASS" and strict["diagnosticCount"]==0
assert accepted["status"]=="CLOSED" and accepted["exitCode"]==0 and accepted["natural"] is True
assert subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip()==CURRENT
assert sha(NODE)=="8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d"
assert sha(D/"build-physical-candidate.mjs")==proposal["physicalWriterSha256"]=="06ece5e34ad7aad1f1b293042407f6c877dbcb04bc75494bb61a1b28e1e54b05"
assert not OUT.exists() and not Path(str(OUT)+".tmp").exists()
assert not (D/"deletion.json").exists(),"Never repeat an already executed unlink/build"
started=utc();t=time.monotonic();s=BASE.stat();assert s.st_nlink==1 and statrow(s)==proposal["baselineActualStat"]
actual=sha(BASE);assert actual==proposal["baselineActualWholeSha256"]=="5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801"
assert statrow(BASE.stat())==statrow(s);owners=fdowners(s);assert not owners
deletion={"status":"GUARDED_ONE_UNLINK_AUTHORIZED","checkedAt":utc(),"exactDeletionPath":str(BASE.resolve()),"actualImmediateWholeSha256":actual,"actualSameStat":statrow(s),"actualOpenFdOwners":owners,"currentHead":CURRENT,"accepted8b4ReaderClosure":"2026-10-09T01:05:40.428234+00:00","sourceBridgeSha256":sha(D/"source-baseline-proposal.json"),"previous217All4ActualRecoveryReceiptSha256":sha(Path(".work/hosted-217-sequential/independent-downloaded-parts.json")),"freeBytesBefore":os.statvfs(".").f_bavail*os.statvfs(".").f_frsize,"scope":"Only root-authorized provenrecoverable derived5ed baseline. Every other unique older physical HTML/source/failedreceipt/raw history preserved; no production adoption/no benchmark/no gzipallocation."}
write("deletion.json",deletion)
BASE.unlink();deletion["actualUnlinkedAt"]=utc();deletion["freeBytesAfter"]=os.statvfs(".").f_bavail*os.statvfs(".").f_frsize;deletion["status"]="ONE_APPROVED_DERIVED_BASELINE_UNLINKED";write("deletion.json",deletion)
assert not BASE.exists() and deletion["freeBytesAfter"]>BYTES+64*1024*1024
env=dict(os.environ);env["G10_BUILD_BROWSER_ONLY"]="1";env["G10_HTML_OUT"]=".work/play-full-candidate-b4.html"
child=None;code=None;natural=False;error=None;group=[];report={"status":"RUNNING","startedAt":started,"physicalWriterSha256":proposal["physicalWriterSha256"],"currentHead":CURRENT};write("controller.json",report)
try:
 with (D/"build.stdout").open("wb") as out,(D/"build.stderr").open("wb") as err:
  child=subprocess.Popen([str(NODE),str(D/"build-physical-candidate.mjs")],env=env,stdout=out,stderr=err,start_new_session=True)
  write("child-start.json",{"status":"RUNNING","startedAt":utc(),"pid":child.pid,"pgid":child.pid,"command":[str(NODE),str(D/"build-physical-candidate.mjs")],"scope":"Actual genuine original physical writer, privatecandidate; no timing or product adoption"})
  code=child.wait(timeout=180);natural=True
except BaseException as e:
 error={"type":type(e).__name__,"message":str(e)}
finally:
 if child is not None:
  if child.poll() is None:
   try:os.killpg(child.pid,signal.SIGTERM)
   except ProcessLookupError:pass
  child.wait()
  for proc in Path("/proc").iterdir():
   if not proc.name.isdigit():continue
   try:
    fields=(proc/"stat").read_text().split(") ",1)[1].split()
    if int(fields[2])==child.pid and fields[0]!="Z":group.append(int(proc.name))
   except (FileNotFoundError,PermissionError,ProcessLookupError,IndexError,ValueError):pass
  for pid in group:
   try:os.kill(pid,signal.SIGTERM)
   except ProcessLookupError:pass
 report={"status":"CLOSED","startedAt":started,"closedAt":utc(),"exitCode":code,"natural":natural,"error":error,"liveGroupBeforeExceptionalCleanup":group,"actualWallSeconds":time.monotonic()-t,"physicalWriterSha256":sha(D/"build-physical-candidate.mjs"),"nodeSha256":sha(NODE),"currentHead":CURRENT,"scope":"Actual physical writer must naturallyEXIT0/reap everygroup before any fileSHA/archive/adoption; no timing gain or player acceptance inferred"}
 write("controller.json",report);print(json.dumps(report),flush=True)
assert code==0 and natural and not group and error is None
# File integrity is read only AFTER actual natural writer closure.
s=OUT.stat();assert s.st_size==BYTES;actual=sha(OUT);assert actual==EXPECTED;assert statrow(OUT.stat())==statrow(s)
inputs=json.loads(Path(".work/hosted-8b4-final/extracted/.work/checks/stage-node.json").read_text())["sourceGuardsAfter"]
for path,expected in inputs.items():assert sha(path)==expected,path
assert subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip()==CURRENT and sha(NODE)=="8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d"
pack=json.loads((D/"dist/corpus-pack.json").read_text());assert pack["internationalOriginal"]["files"] and len(pack["internationalOriginal"]["files"])==41 and pack["internationalOriginal"]["parts"]==1304 and pack["internationalOriginal"]["dataBytes"]==1006478762
assert (D/"THIRD-PARTY-LICENSES.txt").read_bytes()==Path("THIRD-PARTY-LICENSES.txt").read_bytes()
receipt={"status":"PASS_PHYSICAL_FILE_NOT_ADOPTED","startedAt":started,"closedAt":utc(),"sourceHead":CURRENT,"physicalCandidatePath":str(OUT.resolve()),"actualPhysicalBytes":s.st_size,"actualPhysicalWholeSha256":actual,"actualPhysicalStat":statrow(s),"writerNaturallyClosedAt":report["closedAt"],"writerExitCode":0,"all349OriginalSourceRuntimeGuardsUnchanged":True,"fullOriginalInternationalFiles":41,"fullOriginalInternationalParts":1304,"fullOriginalInternationalBytes":1006478762,"originalLicenseBytesEqual":True,"noAdditionalGzipFileAllocated":True,"scope":"Actual genuine physical1.39GB candidateb4 now exists after approvedrecoverablederivedcache replacement; fullSHA/samestat/alloriginalsources/data/licenses checked after naturalwriter/reapedgroup. CandidateUNADOPTED; actualdisk/browser/FPS/currentnewsourceCI/renewedKEEP remain separate requirements."}
write("physical-file-proof.json",receipt);print(json.dumps(receipt),flush=True)

