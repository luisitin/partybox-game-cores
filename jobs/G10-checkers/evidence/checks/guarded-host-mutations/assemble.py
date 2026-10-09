import hashlib,json,pathlib,datetime
root=pathlib.Path.cwd(); original=root/'.work/play-full-early.html'; output=root/'.work/play-full-guarded.html'; host=(root/'.work/host-write-private/host.js').read_bytes()
with original.open('rb') as source:
    prefix=source.read(1024*1024); start=prefix.index(b'<script>')+len(b'<script>'); end=prefix.find(b'</script>',start)
    while end<0:
        more=source.read(1024*1024);assert more and len(prefix)<64*1024*1024,'Inline host boundary missing';prefix+=more;end=prefix.find(b'</script>',start)
    original_host=prefix[start:end]; initial=prefix[:start]+host+prefix[end:]; tail_hash=hashlib.sha256(); tail_hash.update(prefix[end:]); source_hash=hashlib.sha256(prefix); output_hash=hashlib.sha256(initial)
    with output.open('wb') as target:
        target.write(initial)
        for block in iter(lambda:source.read(1024*1024),b''):
            source_hash.update(block);tail_hash.update(block);output_hash.update(block);target.write(block)
with output.open('rb') as target:
    rebuilt_prefix=target.read(start+len(host)); assert rebuilt_prefix==prefix[:start]+host
    verified_tail=hashlib.sha256()
    for block in iter(lambda:target.read(1024*1024),b''):verified_tail.update(block)
assert verified_tail.digest()==tail_hash.digest()
report={'status':'PASS','assembledAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'original':str(original.relative_to(root)),'output':str(output.relative_to(root)),'originalSha256':source_hash.hexdigest(),'outputSha256':output_hash.hexdigest(),'outputBytes':output.stat().st_size,'originalHostSha256':hashlib.sha256(original_host).hexdigest(),'guardedHostSha256':hashlib.sha256(host).hexdigest(),'allPayloadAndSuffixSha256':tail_hash.hexdigest(),'allPayloadAndSuffixIndependentlyReReadIdentical':True,'change':'Only compiled host guarded disabled/aria-label/hidden writes; all original payload, worker, template and licence bytes remain identical.'}
(root/'.work/host-write-private/assembly.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
