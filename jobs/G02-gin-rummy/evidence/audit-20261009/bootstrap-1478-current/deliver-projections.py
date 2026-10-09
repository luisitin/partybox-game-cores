from pathlib import Path
import copy, hashlib, json, shutil, datetime

job=Path('/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy')
base=Path('/tmp/G02-current-1478-artifact-20261009')
ex=base/'extracted'
rel='evidence/audit-20261009/bootstrap-1478-current'
out=job/rel
out.mkdir(parents=True,exist_ok=False)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,d:p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
copied=[]
for src,name in [
 (base/'official-11602253768.zip','official-11602253768.zip'),
 (base/'official-job-113724387801.log','official-job-113724387801.log'),
 (base/'artifact-11602253768-CRC-CLOSED.json','full-zip-reader.json'),
 (base/'exact-source-rebuild-CLOSED.json','exact-source-rebuild.json'),
 (base/'full-original-artifact-reader-CLOSED.json','full-original-artifact-reader.json'),
 (ex/'browser/report.json','original-report35.json'),
 (ex/'browser/captures.json','original-captures35.json'),
 (ex/'browser/desktop-frames.json','desktop-frames.json'),
 (ex/'browser/phone4x-frames.json','phone4x-frames.json'),
 (ex/'initial-presence-bootstrap/CLOSED.json','native-CLOSED.json'),
 (ex/'initial-presence-bootstrap/run.json','native-run.json'),
 (ex/'initial-presence-bootstrap/source-copy-index.json','original-source-copy-index.json'),
 (ex/'initial-presence-bootstrap/bootstrap-request.json','executed-bootstrap-request.json')]:
 shutil.copyfile(src,out/name)
 assert (out/name).read_bytes()==src.read_bytes()
 copied.append({'path':name,'bytes':src.stat().st_size,'sha256':sha(src)})
report=json.loads((out/'original-report35.json').read_text())
caps=json.loads((out/'original-captures35.json').read_text())
five=['play.html','src/core.ts','src/cards.ts','src/browser.ts','src/play.template.html']
assert len(report['sourceStart'])==35
assert report['sourceStart']==report['sourceEnd']==caps['sourceStart']==caps['sourceEnd']
assert all(sha(job/p)==report['sourceStart'][p] for p in five)
delivery=copy.deepcopy(caps)
pathmap=[]
for row in delivery['rows']:
 old=row['path']; assert old.startswith('.work/browser/')
 source=ex/old.removeprefix('.work/')
 new='media/'+source.name
 target=job/new
 assert not target.exists()
 shutil.copyfile(source,target)
 assert target.read_bytes()==source.read_bytes()
 assert row['bytes']==target.stat().st_size and row['sha256']==sha(target)
 row['path']=new
 pathmap.append({'originalPath':old,'deliveryPath':new,'bytes':row['bytes'],'sha256':row['sha256'],'byteIdentical':True})
write(out/'delivery-captures35.json',delivery)
legacy=copy.deepcopy(report)
legacycaps=copy.deepcopy(delivery)
for d in [legacy,legacycaps]:
 for key in ['sourceStart','sourceEnd']:
  d[key]={p:d[key][p] for p in five}
write(out/'derived-legacy-report5.json',legacy)
write(out/'derived-legacy-captures5.json',legacycaps)
index={'version':2,'report':rel+'/original-report35.json',
 'raw':{p:rel+'/'+p+'-frames.json' for p in ['desktop','phone4x']},
 'captures':rel+'/delivery-captures35.json',
 'originalCaptures':rel+'/original-captures35.json',
 'nativeHead':'1478a93e36f9f6ddf88aad246083ab0c8e059cf4',
 'nativeRunId':37901344277,'nativeJobId':113724387801,
 'fullNpmTestAccepted':False,
 'derivation':'Only recording paths are rebased to media/; original full35 report/raw/capture metadata and ZIP are retained unchanged.'}
write(out/'current-proof35.json',index)
legacyindex={'version':1,'report':rel+'/derived-legacy-report5.json',
 'raw':index['raw'],'captures':rel+'/derived-legacy-captures5.json',
 'full35Index':rel+'/current-proof35.json',
 'derivation':'Compatibility projection of only sourceStart/sourceEnd to the original five paths, plus byte-identical delivery media path rebase. All other fields and all raw samples are unchanged.',
 'fullNpmTestAccepted':False}
write(job/'evidence/resume-20261008/current-proof.json',legacyindex)
requestpath=job/'evidence/audit-20261009/bootstrap-request.json'
request=json.loads(requestpath.read_text()); assert request['enabled'] is True
request['enabled']=False;write(requestpath,request)
bridge={'createdUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'nativeHead':index['nativeHead'],'nativeRunId':index['nativeRunId'],'nativeJobId':index['nativeJobId'],
 'artifactId':11602253768,'officialZipBytes':1775665,
 'officialZipSha256':'5641f2e2c18cf273fa9a9738a3ed964008d84b5a5783956769aa2c9293cfaaea',
 'originalGuardedSourceCount':35,'legacySourcePaths':five,
 'allowedLegacyChanges':['sourceStart','sourceEnd','captures.rows[].path'],
 'allowedFull35DeliveryChanges':['captures.rows[].path'],
 'mediaPaths':pathmap,'immutableCopiedFiles':copied,
 'all1200RawIntervalsUnchanged':True,'all1202NativeTimestampsUnchanged':True,
 'all1208ActiveHandWitnessesUnchanged':True,'samplerRerun':False,
 'bootstrapDisabledForFuturePushes':True,
 'executedRequestRetained':rel+'/executed-bootstrap-request.json',
 'executedAdditionalRequestIsHistorical':True,
 'fullNpmTestAccepted':False}
write(out/'projection-and-path-bridge.json',bridge)
print(json.dumps({'closedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'copiedOriginalFiles':len(copied),'mediaBytes':sum(x['bytes'] for x in pathmap),'bootstrapEnabled':False,'samplerExecuted':False,'destination':str(out)}))
