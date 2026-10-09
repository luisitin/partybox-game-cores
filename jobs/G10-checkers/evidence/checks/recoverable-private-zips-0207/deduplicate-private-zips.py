from pathlib import Path
from datetime import datetime,timezone
import os,json,hashlib,subprocess
P=Path(".work/proven-duplicate-zip-cleanup-0207/proposal.json");D=Path(".work/proven-duplicate-zip-cleanup-0207");D.mkdir(exist_ok=True)
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
 finally:c.stdout.close();rc=c.wait()
 assert rc==0
 return h.hexdigest()
def owners(s):
 result=[]
 for p in Path("/proc").iterdir():
  if not p.name.isdigit():continue
  try:
   for fd in (p/"fd").iterdir():
    try:
     x=fd.stat()
     if x.st_dev==s.st_dev and x.st_ino==s.st_ino:result.append({"pid":int(p.name),"fd":int(fd.name)})
    except (FileNotFoundError,PermissionError,ProcessLookupError):pass
  except (FileNotFoundError,PermissionError,ProcessLookupError):pass
 return result
proposal=json.loads(P.read_text());head=proposal["head"];assert subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip()==head
sourceGuards=json.loads(Path(".work/hosted-df-browser/extracted/.work/checks/stage-browser.json").read_text())["sourceGuardsAfter"]
started=utc();before=os.statvfs(".").f_bavail*os.statvfs(".").f_frsize;rows=[]
# Prove ALL recoverability before performing any private-cache mutation.
for row in proposal["candidates"]:
 private=Path(row["privatePath"]);public=Path(row["publicTrackedByteEqualCopies"][0]);a=private.stat();b=public.stat()
 assert row["privatePath"] not in sourceGuards and private.parts[0]==".work" and a.st_nlink==1 and a.st_size==row["bytes"]==b.st_size
 assert sha(private)==sha(public)==row["sha256"]
 gitPath="jobs/G10-checkers/"+str(public);assert blobsha(head,gitPath)==row["sha256"]
 with private.open("rb") as f,public.open("rb") as g:
  size=0
  while x:=f.read(1<<20):
   assert x==g.read(len(x));size+=len(x)
  assert not g.read(1) and size==row["bytes"]
 assert private.stat()==a and public.stat()==b
 assert not owners(a)
 rows.append({"privatePath":str(private),"publicPreservedPath":str(public),"bytes":row["bytes"],"sha256":row["sha256"],"immutableGitRef":head+":"+gitPath,"actualWholeStreamByteEqual":True,"allCurrentPublicGitBytesMatch":True,"privateStat":{"dev":a.st_dev,"ino":a.st_ino,"mtimeNs":a.st_mtime_ns,"ctimeNs":a.st_ctime_ns,"bytes":a.st_size},"publicStat":{"dev":b.st_dev,"ino":b.st_ino,"mtimeNs":b.st_mtime_ns,"ctimeNs":b.st_ctime_ns,"bytes":b.st_size},"fdOwners":[]})
report={"status":"RECOVERABILITY_ALL_PASS_NOT_YET_UNLINKED","startedAt":started,"at":utc(),"head":head,"freeBytesBefore":before,"rows":rows,"scope":"Onlytwo actualbyte-identical derivedprivateZIP copies, allpreserved in currentimmutableGit and publicworkingcopies; no uniqueinput/failedZIP/rawhistory/HTML/receipts/source/publiccopy deleted."}
(D/"receipt.json").write_text(json.dumps(report,indent=2)+"\n")
for row in rows:
 private=Path(row["privatePath"]);public=Path(row["publicPreservedPath"]);s=private.stat();assert {"dev":s.st_dev,"ino":s.st_ino,"mtimeNs":s.st_mtime_ns,"ctimeNs":s.st_ctime_ns,"bytes":s.st_size}==row["privateStat"]
 assert sha(private)==sha(public)==row["sha256"] and not owners(s)
 private.unlink();row["actualPrivateUnlinkedAt"]=utc();assert sha(public)==row["sha256"]
 report["at"]=utc();(D/"receipt.json").write_text(json.dumps(report,indent=2)+"\n")
report.update({"status":"CLOSED_PASS_TWO_PROVEN_DUPLICATES_REMOVED","closedAt":utc(),"exitCode":0,"freeBytesAfter":os.statvfs(".").f_bavail*os.statvfs(".").f_frsize,"removedBytes":sum(row["bytes"] for row in rows)})
(D/"receipt.json").write_text(json.dumps(report,indent=2)+"\n");print(json.dumps({k:report[k] for k in ["status","startedAt","closedAt","exitCode","freeBytesBefore","freeBytesAfter","removedBytes"]}))

