import hashlib,json,os,resource,signal,subprocess,sys,threading,time
from datetime import datetime,timezone
from pathlib import Path
from identity import compare

root=Path.cwd(); out=root/'.work/template-cost-private'; out.mkdir(parents=True,exist_ok=True)
command=['node','.work/template-cost-private/profile.mjs']; record={'status':'RUNNING','startedAt':datetime.now(timezone.utc).isoformat(),'pgid':os.getpgrp(),'order':['outside-body','template-fragment'],'profiles':[]}
interrupted=False; child=None
def interrupt(signum,frame):
    global interrupted
    interrupted=True
    if child is not None and child.poll() is None: child.send_signal(signal.SIGTERM)
signal.signal(signal.SIGTERM,interrupt)

def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()

def owned_rows(pid):
    rows={}
    for entry in Path('/proc').iterdir():
        if not entry.name.isdigit(): continue
        try:
            stat=(entry/'stat').read_text(); tail=stat[stat.rfind(')')+2:].split(); ppid=int(tail[1]); rss=int(tail[21])*os.sysconf('SC_PAGE_SIZE')//1024
            rows[int(entry.name)]={'pid':int(entry.name),'ppid':ppid,'state':tail[0],'rssKiB':rss}
        except (FileNotFoundError,ProcessLookupError,PermissionError,IndexError,ValueError): pass
    owned={pid}; previous=0
    while len(owned)!=previous:
        previous=len(owned);owned.update(key for key,row in rows.items() if row['ppid'] in owned)
    return [rows[key] for key in owned if key in rows and rows[key]['state']!='Z']

inputs=['.work/template-cost-private/profile.mjs','.work/template-cost-private/run.py','.work/template-cost-private/identity.py','.work/profile-full-host.mjs','dist/worker-american.mjs','dist/worker-international.mjs','dist/corpus-pack.json','.work/template-experiment/proof/report.json']
record['inputsBefore']=[{'path':path,'sha256':digest(root/path),'bytes':(root/path).stat().st_size} for path in inputs]
identity=compare(root/'.work/play-full-early.html',root/'.work/play-full-template.html')
(out/'payload-identity.json').write_text(json.dumps(identity,indent=2)+'\n')
record['payloadIdentitySha256']=digest(out/'payload-identity.json');record['allEncodedDataTagsIdentical']=identity['allEncodedDataTagsIdentical'];record['dataTagCount']=identity['dataTagCount']
for label,file in [('outside-body','.work/play-full-early.html'),('template-fragment','.work/play-full-template.html')]:
    if interrupted: break
    directory=out/label;directory.mkdir(exist_ok=True)
    exact=[*command,file,str(directory),label];started=datetime.now(timezone.utc).isoformat();began=time.perf_counter();samples=[];stop=threading.Event()
    with (directory/'stdout.jsonl').open('wb') as stdout,(directory/'stderr.log').open('wb') as stderr:
        child=subprocess.Popen(exact,stdout=stdout,stderr=stderr)
        def observe():
            while not stop.is_set():
                rows=owned_rows(child.pid)
                try:phase=json.loads((directory/'phase.json').read_text())['phase']
                except (FileNotFoundError,json.JSONDecodeError):phase='hash-input/launch'
                samples.append({'seconds':time.perf_counter()-began,'phase':phase,'rssSumKiB':sum(row['rssKiB'] for row in rows),'processes':rows})
                stop.wait(.25)
        observer=threading.Thread(target=observe,daemon=True);observer.start()
        code=child.wait();stop.set();observer.join()
    resources={'command':exact,'startedAt':started,'closedAt':datetime.now(timezone.utc).isoformat(),'exitCode':code,'elapsedSeconds':time.perf_counter()-began,
      'ownedTreePeakRssSumKiB':max((row['rssSumKiB'] for row in samples),default=0),'ownedTreePeakNote':'250ms sum of RSS of active Node/Chromium descendant processes. Shared pages may be counted more than once; not PSS or exclusive physical memory.','sampleCount':len(samples)}
    (directory/'resources.json').write_text(json.dumps(resources,indent=2)+'\n');(directory/'owned-rss-samples.json').write_text(json.dumps(samples,indent=2)+'\n')
    record['profiles'].append(resources);(out/'comparison.json').write_text(json.dumps(record,indent=2)+'\n')
    if code:break
record['inputsAfter']=[{'path':path,'sha256':digest(root/path),'bytes':(root/path).stat().st_size} for path in inputs]
record['allInputsUnchanged']=record['inputsBefore']==record['inputsAfter'];record['closedAt']=datetime.now(timezone.utc).isoformat();record['interrupted']=interrupted
record['status']='COMPLETE_DIAGNOSTIC' if len(record['profiles'])==2 and all(row['exitCode']==0 for row in record['profiles']) and record['allInputsUnchanged'] and not interrupted else 'INCOMPLETE'
record['maxChildRssKiB']=resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
(out/'comparison.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record),flush=True)
sys.exit(0 if record['status']=='COMPLETE_DIAGNOSTIC' else 2)
