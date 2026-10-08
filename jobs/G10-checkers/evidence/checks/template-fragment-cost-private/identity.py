import hashlib,re
from pathlib import Path

def script_manifest(path):
    pending=b'';state='outside';entries=[];header=None;digest=None;count=0;capture=None;host=None
    with Path(path).open('rb') as source:
        done=False
        while not done:
            chunk=source.read(1024*1024);done=not chunk;pending+=chunk
            while True:
                if state=='outside':
                    start=pending.find(b'<script')
                    if start<0:
                        pending=pending[-7:] if not done else b'';break
                    pending=pending[start:];state='header'
                if state=='header':
                    end=pending.find(b'>')
                    if end<0:
                        if len(pending)>4096:raise ValueError('Unexpected oversized script header')
                        break
                    header=pending[:end+1];pending=pending[end+1:];digest=hashlib.sha256();count=0
                    capture=bytearray() if b'application/octet-stream' not in header else None;state='content'
                if state=='content':
                    end=pending.find(b'</script>');take=end if end>=0 else max(0,len(pending)-8)
                    part=pending[:take];digest.update(part);count+=len(part)
                    if capture is not None:
                        if len(capture)+len(part)>64*1024*1024:raise ValueError('Host script exceeds bounded capture')
                        capture.extend(part)
                    pending=pending[take:]
                    if end<0:break
                    match=re.search(rb'\bid="([^"]*)"',header)
                    entries.append({'id':match.group(1).decode() if match else None,'header':header.decode(),
                                    'bytes':count,'sha256':digest.hexdigest(),'data':b'application/octet-stream' in header})
                    if capture is not None:
                        if host is not None:raise ValueError('Unexpected multiple executable host scripts')
                        host=bytes(capture)
                    pending=pending[len(b'</script>'):];state='outside'
        if state!='outside':raise ValueError('Truncated script')
    return entries,host

def compare(first,second):
    a,host_a=script_manifest(first);b,host_b=script_manifest(second)
    data_a=sorted((entry for entry in a if entry['data']),key=lambda entry:entry['id'])
    data_b=sorted((entry for entry in b if entry['data']),key=lambda entry:entry['id'])
    if data_a!=data_b:raise ValueError('Original encoded data tags differ')
    prefix=0
    while prefix<min(len(host_a),len(host_b)) and host_a[prefix]==host_b[prefix]:prefix+=1
    suffix=0
    while suffix<min(len(host_a),len(host_b))-prefix and host_a[-suffix-1]==host_b[-suffix-1]:suffix+=1
    old=host_a[prefix:len(host_a)-suffix if suffix else len(host_a)]
    new=host_b[prefix:len(host_b)-suffix if suffix else len(host_b)]
    return {'allEncodedDataTagsIdentical':True,'dataTagCount':len(data_a),'encodedDataContentBytes':sum(entry['bytes'] for entry in data_a),
            'dataTags':data_a,'hostScripts':[entry for entry in a+b if not entry['data']],
            'hostDifference':{'commonPrefixBytes':prefix,'commonSuffixBytes':suffix,'oldSpanBytes':len(old),'newSpanBytes':len(new),
                              'oldSpanSha256':hashlib.sha256(old).hexdigest(),'newSpanSha256':hashlib.sha256(new).hexdigest(),
                              'oldText':old.decode() if len(old)<=4096 else None,'newText':new.decode() if len(new)<=4096 else None}}
