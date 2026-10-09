"""Read-only complete original-data / canonical raw-output delta proof."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import base64,json,subprocess
JOB=Path.cwd();PRIVATE=JOB/'.work/international-ready-private'
BASE=JOB/'.work/play-full-candidate-b4.html'
HEAD='4369bbdd1f71f34960893afd1ba456fee8e24ecd'
BASE_BYTES=1390846291
BASE_SHA='b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb'
OLD_BOOTSTRAP_BYTES=12220037
OLD_BOOTSTRAP_SHA='540f2ce80f80725961657adce212d084b1d9cbb56b0138bb976b63d4273ab15d'
started=datetime.now(timezone.utc).isoformat()
def digest(path):
 h=sha256()
 with path.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def blob(relative):return subprocess.check_output(['/usr/bin/git','cat-file','blob',HEAD+':jobs/G10-checkers/'+relative],timeout=15)
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],text=True).strip()==HEAD
raw=json.loads((PRIVATE/'generated/raw-output.json').read_text());assert raw['status']=='GENERATED_FULL_RAW_UNADOPTED'
assert raw['canonicalCandidateBuilderSha256']=='4d1ce03c9c546dac6d0763aca705f2555c638234f820f71dc5f93c1837c53885'
assert raw['candidateBrowserSourceSha256']=='bf8b12c6a389daa050f70f602e53480b506c0f4810288c24ebb6810a6aa477cf'
assert raw['outputBytes']==1390847100 and raw['outputSha256']=='b85a8288345c8e0040d523e3998d31216aa61b6872c8e3bc76313944802dd1b2'
assert raw['originalFiles']==41 and raw['originalParts']==1304 and raw['originalDataBytes']==1006478762
assert digest(PRIVATE/'browser-candidate.ts')==raw['candidateBrowserSourceSha256']
assert digest(JOB/'src/browser.ts')=='1f2aeb8f075d4310e92b22c9e800ed0792822172da8adfc7b238e9b91f741d81'
stat_before=BASE.stat();assert stat_before.st_size==BASE_BYTES and digest(BASE)==BASE_SHA
candidate=(PRIVATE/'generated/candidate-bootstrap.js').read_bytes()
assert len(candidate)==raw['bootstrapBytes'] and sha256(candidate).hexdigest()==raw['bootstrapSha256']
bootstrap_start=raw['bootstrapStart'];assert bootstrap_start==12092
delta=len(candidate)-OLD_BOOTSTRAP_BYTES
signals={r['name']:r for r in raw['signals']};assert set(signals)=={'chinook','tunstall-v2'}
marker=b"<script>document.dispatchEvent(new Event('g10-international-worker-ready'));</script>\n"
american_marker=b"<script>document.dispatchEvent(new Event('g10-american-corpus-ready'));</script>\n"
assert len(marker)==86 and len(american_marker)==81
(PRIVATE/'international-ready-marker.html').write_bytes(marker)
with BASE.open('rb') as f:
 f.seek(bootstrap_start);old=f.read(OLD_BOOTSTRAP_BYTES);assert sha256(old).hexdigest()==OLD_BOOTSTRAP_SHA
 payload_proofs=[]
 for name in ['chinook','tunstall-v2']:
  signal=signals[name];start=signal['payloadStart']-delta
  header=('<script type="application/octet-stream" id="g10-corpus-'+name+'">').encode()
  f.seek(start);assert f.read(len(header))==header
  encoded_bytes=4*((signal['compressedBytes']+2)//3);encoded=f.read(encoded_bytes)
  compressed=base64.b64decode(encoded,validate=True)
  assert len(compressed)==signal['compressedBytes'] and sha256(compressed).hexdigest()==signal['compressedSha256']
  assert f.read(10)==b'</script>\n' and f.tell()==signal['afterCompletePayloadOffset']-delta
  payload_proofs.append({'name':name,'actualBaseStart':start,'afterCompletePayloadOffset':f.tell(),'compressedBytes':len(compressed),'compressedSha256':sha256(compressed).hexdigest()})
  if name=='chinook':assert f.read(len(american_marker))==american_marker
 dictionary_end=f.tell()
del old,encoded,compressed
assert dictionary_end==signals['tunstall-v2']['afterCompletePayloadOffset']-delta
parts=json.loads((PRIVATE/'generated/international-parts.json').read_text())
lower=json.loads(blob('data/international/manifest.json'));six=json.loads(blob('data/international/six/manifest.json'))
files=[]
for name in ['db2','db3','db4','db5']:
 size=lower['files'][name+'.bin']['bytes'];files.append((name,size,[(JOB/('data/international/'+name+'.bin'),size)]))
for item in six['files']:files.append((item['name'],item['bytes'],[(JOB/('data/international/six/'+c['file']),c['bytes']) for c in item['chunks']]))
assert len(files)==len(parts)==41 and [n for n,_,_ in files]==list(parts)
actual_parts=[];raw_part_bytes=3*262144
with BASE.open('rb') as f:
 f.seek(dictionary_end)
 for name,size,extents in files:
  offset=index=0;assert parts[name]['byteLength']==size
  for path,extent_size in extents:
   assert path.stat().st_size==extent_size
   with path.open('rb') as source:
    for extent_offset in range(0,extent_size,raw_part_bytes):
     count=min(raw_part_bytes,extent_size-extent_offset);part=parts[name]['parts'][index]
     expected={'id':'g10-intl-'+name+'-'+str(index),'offset':offset,'bytes':count,'encodedLength':4*((count+2)//3)};assert part==expected
     header=('<script type="application/octet-stream" id="'+part['id']+'">').encode();at=f.tell();assert f.read(len(header))==header
     encoded=f.read(part['encodedLength']);decoded=base64.b64decode(encoded,validate=True);assert len(decoded)==count
     source.seek(extent_offset);assert decoded==source.read(count)
     assert f.read(10)==b'</script>\n'
     actual_parts.append({'id':part['id'],'headerOffset':at,'bytes':count,'sourcePath':str(path.relative_to(JOB)),'sourceOffset':extent_offset,'decodedSha256':sha256(decoded).hexdigest(),'encodedSha256':sha256(encoded).hexdigest()});offset+=count;index+=1
  assert offset==size and index==len(parts[name]['parts'])
 data_end=f.tell();tail=f.read();assert tail
assert len(actual_parts)==1304 and sum(p['bytes'] for p in actual_parts)==1006478762
assert (PRIVATE/'generated/THIRD-PARTY-LICENSES.txt').read_bytes()==(JOB/'THIRD-PARTY-LICENSES.txt').read_bytes()
for variant in ['american','international']:assert digest(PRIVATE/('generated/dist/worker-'+variant+'.mjs'))==digest(JOB/('dist/worker-'+variant+'.mjs'))
assert (PRIVATE/'generated/dist/corpus-pack.json').read_bytes()==(JOB/'dist/corpus-pack.json').read_bytes()
operations=[{'kind':'copy','start':0,'end':bootstrap_start},{'kind':'insert','path':'generated/candidate-bootstrap.js'},{'kind':'copy','start':bootstrap_start+OLD_BOOTSTRAP_BYTES,'end':dictionary_end},{'kind':'insert','path':'international-ready-marker.html'},{'kind':'copy','start':dictionary_end,'end':BASE_BYTES}]
whole=sha256();count=0
with BASE.open('rb') as f:
 for operation in operations:
  h=sha256();size=0
  if operation['kind']=='copy':
   f.seek(operation['start']);remaining=operation['end']-operation['start']
   while remaining:
    block=f.read(min(1<<20,remaining));assert block;whole.update(block);h.update(block);size+=len(block);remaining-=len(block)
  else:
   block=(PRIVATE/operation['path']).read_bytes();whole.update(block);h.update(block);size=len(block)
  operation.update({'bytes':size,'sha256':h.hexdigest(),'outputOffset':count});count+=size
assert count==BASE_BYTES-OLD_BOOTSTRAP_BYTES+len(candidate)+len(marker)==raw['outputBytes']
assert whole.hexdigest()==raw['outputSha256']
assert digest(BASE)==BASE_SHA and BASE.stat()==stat_before
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],text=True).strip()==HEAD
result={'status':'PASS','startedAt':started,'closedAt':datetime.now(timezone.utc).isoformat(),'head':HEAD,'basePath':str(BASE),'baseBytes':BASE_BYTES,'baseSha256':BASE_SHA,'bootstrap':{'start':bootstrap_start,'end':bootstrap_start+OLD_BOOTSTRAP_BYTES,'originalBytes':OLD_BOOTSTRAP_BYTES,'originalSha256':OLD_BOOTSTRAP_SHA,'candidateBytes':len(candidate),'candidateSha256':sha256(candidate).hexdigest()},'completedPrerequisitePayloads':payload_proofs,'internationalSignalInsertionOffset':dictionary_end,'newMarkerBytes':len(marker),'newMarkerSha256':sha256(marker).hexdigest(),'international':{'files':41,'actualDecodedParts':1304,'originalBytesCompared':1006478762,'parts':actual_parts},'originalWorkersLicensesCorpusMetadataUnchanged':True,'originalTailBytes':len(tail),'originalTailSha256':sha256(tail).hexdigest(),'operations':operations,'resultBytes':count,'resultSha256':whole.hexdigest(),'canonicalRawProducerReportSha256':digest(PRIVATE/'generated/raw-output.json'),'scope':'Complete independent source-byte/delta proof: accepted physical b4 fullSHA/stat beforeafter, actual complete prerequisite payloads/retained81B American marker, all1304 actual parts decoded vs every originalsource extent, original worker/license/corpus metadata unchanged, all copiedprefix/suffix and new86B marker after genuine dictionary; full streamed candidateEOF SHA equals ONE actual canonical bounded production output. No physical copy/gzip/HTTP/browser/native timing/gain/adoption/KEEP acceptance.'}
(PRIVATE/'delta-controls-4369.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['status','closedAt','baseBytes','baseSha256','resultBytes','resultSha256','scope']}))
