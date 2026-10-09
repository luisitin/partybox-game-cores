from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess,time,os,signal,sys
D=Path(".work/american-ready-direct-output");NODE=Path(".work/memory-json-private/node22/runtime/bin/node")
def utc():return datetime.now(timezone.utc).isoformat()
def sha(path):
 h=hashlib.sha256()
 with Path(path).open("rb") as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
native=json.loads(Path(".work/hosted-8b4-final/extracted/.work/checks/stage-node.json").read_text())["sourceGuardsAfter"]
before={p:sha(p) for p in native};changes=[p for p in native if native[p]!=before[p]]
assert sorted(changes)==["scripts/build.mjs","src/browser.ts"]
assert before["src/browser.ts"]=="1f2aeb8f075d4310e92b22c9e800ed0792822172da8adfc7b238e9b91f741d81"
assert before["scripts/build.mjs"]=="37489e755e6ec672fd77b8b95a08afe50ce7e0c620554bccddb77ec46ec1f703"
assert sha(NODE)=="8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d"
started=utc();t=time.monotonic();reports=[];groups=[]
(D/"controller.json").write_text(json.dumps({"status":"RUNNING","startedAt":started,"workingSourceChangedFromAccepted8b4":changes,"sourceGuardsBefore":before},indent=2)+"\n")
env=dict(os.environ);env["G10_BUILD_BROWSER_ONLY"]="1";env["G10_BUILD_NODE_ONLY"]="0"
commands=[("actual-original-strict-tsc",[str(NODE),"node_modules/typescript/bin/tsc","--noEmit"]),("actual-direct-production-raw-output",[str(NODE),str(D/"direct-production-output.mjs")])]
for name,command in commands:
 child=None;code=None;natural=False;error=None;childStarted=utc()
 try:
  with (D/(name+".stdout")).open("wb") as out,(D/(name+".stderr")).open("wb") as err:
   child=subprocess.Popen(command,env=env,stdout=out,stderr=err,start_new_session=True);groups.append(child.pid)
   code=child.wait(timeout=120);natural=True
 except BaseException as e:error={"type":type(e).__name__,"message":str(e)}
 finally:
  if child is not None:
   if child.poll() is None:
    try:os.killpg(child.pid,signal.SIGTERM)
    except ProcessLookupError:pass
   child.wait()
  r={"name":name,"command":command,"startedAt":childStarted,"closedAt":utc(),"exitCode":code,"natural":natural,"error":error,"pgid":child.pid if child else None}
  reports.append(r);(D/(name+"-closure.json")).write_text(json.dumps(r,indent=2)+"\n");print(json.dumps(r),flush=True)
 assert code==0 and natural and error is None
after={p:sha(p) for p in native};assert after==before
live=[]
for p in Path("/proc").iterdir():
 if not p.name.isdigit():continue
 try:
  f=(p/"stat").read_text().split(") ",1)[1].split()
  if int(f[2]) in groups and f[0]!="Z":live.append(int(p.name))
 except (FileNotFoundError,PermissionError,ProcessLookupError,ValueError,IndexError):pass
assert not live
raw=json.loads((D/"raw-output.json").read_text());assert raw["status"]=="PASS" and raw["outputBytes"]==1390846291 and raw["outputSha256"]=="b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb"
assert (D/"THIRD-PARTY-LICENSES.txt").read_bytes()==Path("THIRD-PARTY-LICENSES.txt").read_bytes()
r={"status":"CLOSED_PASS","startedAt":started,"closedAt":utc(),"exitCode":0,"natural":True,"actualWallSeconds":time.monotonic()-t,"sourceGuardsBefore":before,"sourceGuardsAfter":after,"all349ActualSourceRuntimeGuardsUnchangedAcrossDirectChecks":True,"exactTwoWorkingSourceChangesVsAccepted8b4":changes,"allOther347OriginalSourceRuntimeGuardsMatchAccepted8b4":True,"children":reports,"remainingOwnedGroupPids":live,"pinnedNodeSha256":sha(NODE),"actualRawOutputBytes":raw["outputBytes"],"actualRawOutputSha256":raw["outputSha256"],"scope":"Newworkingdraftimplementation actualoriginalstrictCLI+directproductionfullrawEOFb4; everyother347originalinput unchanged. No fullHTML/gzipallocation, no originalwholegame/npmtest/fullCI/nativeFPS/KEEP acceptance inferred."}
(D/"controller.json").write_text(json.dumps(r,indent=2)+"\n");print(json.dumps({k:r[k] for k in ["status","startedAt","closedAt","exitCode","natural","actualWallSeconds","remainingOwnedGroupPids","actualRawOutputBytes","actualRawOutputSha256"]}),flush=True)

