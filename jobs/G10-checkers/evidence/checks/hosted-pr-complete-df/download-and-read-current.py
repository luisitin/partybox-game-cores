from pathlib import Path
from datetime import datetime, timezone
import hashlib,json,subprocess,zipfile,posixpath,time,sys,os
base=Path(".work/hosted-df-final")
def utc():return datetime.now(timezone.utc).isoformat()
def sha(path):
 h=hashlib.sha256()
 with Path(path).open("rb") as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
for job in ["113626410585","113626410633","113626410721","113631344599"]:
 data=json.loads((base/("job-"+job+".raw.json")).read_text())
 (base/("job-"+job+".log")).write_bytes(data["content"].encode())
ref=json.loads((base/"official-df-reference.private.json").read_text())
meta=ref["officialMetadata"]
assert meta["id"]==11590387621 and meta["expired"] is False
started=utc()
with (base/"download.stderr").open("wb") as err:
 child=subprocess.Popen(["curl","--silent","--show-error","--fail","--location","--max-time","120","--output",str(base/"complete.zip"),ref["reference"]["file_uri"]["download_url"]],stderr=err)
 try: result=child.wait(timeout=130)
 finally:
  if child.poll() is None:
   child.terminate()
  child.wait()
assert result==0
assert (base/"complete.zip").stat().st_size==meta["size_in_bytes"]
assert "sha256:"+sha(base/"complete.zip")==meta["digest"]
with zipfile.ZipFile(base/"complete.zip") as z:
 entries=z.infolist()
 assert len({x.filename for x in entries})==len(entries)
 for x in entries:
  assert not x.filename.startswith("/") and not x.filename.startswith("\\\\")
  assert posixpath.normpath(x.filename)==x.filename and ".." not in x.filename.split("/")
  assert x.file_size>=0 and (x.external_attr>>16)&0o170000 != 0o120000
  with z.open(x) as f:
   total=0
   while b:=f.read(1<<20):total+=len(b)
   assert total==x.file_size
 z.extractall(base/"extracted")
report={"status":"PASS","startedAt":started,"closedAt":utc(),"sourceHead":"df123c797b226c479b50a998011c1ea6d0157391","workflowRunId":37870240814,"artifactId":meta["id"],"zipBytes":meta["size_in_bytes"],"zipSha256":sha(base/"complete.zip"),"safeUniqueMembers":len(entries),"uncompressedBytes":sum(x.file_size for x in entries),"allMemberCRC":"PASS","scope":"Actual currentdf officialZIP all bytes/SHA/safeunique paths/CRC EOF; independent full reader remains separate"}
(base/"zip-integrity.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report),flush=True)
assert subprocess.run([sys.executable,str(base/"audit-git-guards.py")]).returncode==0
node=Path(".work/memory-json-private/node22/runtime/bin/node")
before=sha(node)
assert before=="8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d"
started=utc();ts=time.monotonic();child=None;natural=False;code=None
(base/"reader-controller.json").write_text(json.dumps({"status":"RUNNING","startedAt":started,"readerSha256":sha(base/"validate-complete.mjs"),"head":"df123c797b226c479b50a998011c1ea6d0157391"},indent=2)+"\n")
try:
 with (base/"independent-complete.stdout").open("wb") as out,(base/"independent-complete.stderr").open("wb") as err:
  child=subprocess.Popen([str(node),str(base/"validate-complete.mjs")],stdout=out,stderr=err,start_new_session=True)
  code=child.wait(timeout=180)
  natural=True
finally:
 if child is not None:
  if child.poll() is None:
   os.killpg(child.pid,15)
  child.wait()
 report={"status":"CLOSED","startedAt":started,"closedAt":utc(),"exitCode":code,"natural":natural,"actualWallSeconds":time.monotonic()-ts,"readerSha256":sha(base/"validate-complete.mjs"),"nodeBeforeSha256":before,"nodeAfterSha256":sha(node),"scope":"Exactcurrentdf independent full artifact acceptance reader; all native source/raw games/media and physicalb4 current page checks; no candidate adoption"}
 (base/"reader-controller.json").write_text(json.dumps(report,indent=2)+"\n");print(json.dumps(report),flush=True)
assert code==0

