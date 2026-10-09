"""Finite zero-payload lifecycle controls; never game/artifact/FPS acceptance."""
from pathlib import Path
from datetime import datetime,timezone
from hashlib import sha256
import ctypes,importlib.util,json,os,selectors,signal,subprocess,sys,time,traceback
BASE=Path(__file__).resolve().parent
SOURCE=BASE/'receive.py'
EXPECTED='59e2445d18de22f39356ea6b45f9c5ce97dcb1d5319104aad38f8336ed71b4e5'
def utc():return datetime.now(timezone.utc).isoformat()
if len(sys.argv)>1:
 signal.signal(signal.SIGTERM,signal.SIG_IGN)
 if sys.argv[1]=='grand':
  print('GRANDREADY',flush=True)
 else:
  grand=subprocess.Popen([sys.executable,str(Path(__file__).resolve()),'grand'],stdout=subprocess.PIPE)
  assert grand.stdout.readline()==b'GRANDREADY\n'
  print('READY',flush=True)
 while True:time.sleep(.1)
assert sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED
spec=importlib.util.spec_from_file_location('private_receiver_controls',SOURCE);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
assert ctypes.CDLL(None).prctl(36,1,0,0,0)==0
started=utc();rows=[];owned=[];status='FAILED'
try:
 natural=subprocess.Popen([sys.executable,'-c','pass'],start_new_session=True);owned.append(natural);assert natural.wait(timeout=5)==0
 result=module.close_worker_group(natural,False);assert result['natural'] is True and result['actualRemainingGroup']==[] and result['groupSignals']==[] and result['actualExitCode']==0
 rows.append({'control':'naturally closed worker stays natural, no signals','result':result})
 failed=subprocess.Popen([sys.executable,str(Path(__file__).resolve()),'worker'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True);owned.append(failed)
 os.set_blocking(failed.stdout.fileno(),False);ready=b'';deadline=time.monotonic()+5
 with selectors.DefaultSelector() as selector:
  selector.register(failed.stdout,selectors.EVENT_READ)
  while b'READY\n' not in ready:
   remaining=deadline-time.monotonic();assert remaining>0,'Lifecycle fixture readiness timeout'
   for key,mask in selector.select(timeout=min(.2,remaining)):
    block=os.read(key.fd,1024);assert block;ready+=block
 before=module.group_members(failed.pid);assert len(before)==2 and all(x['state']!='Z' for x in before)
 result=module.close_worker_group(failed,True)
 assert result['natural'] is False and result['actualRemainingGroup']==[] and result['actualExitCode']==-signal.SIGKILL
 assert [x['signal'] for x in result['groupSignals']]==['SIGTERM','SIGKILL']
 assert len(result['reapedAdoptedDescendants'])==1
 rows.append({'control':'failed worker and grandchild ignore SIGTERM; bounded SIGKILL and actual adopted-descendant reap','actualMembersBefore':before,'result':result})
 assert sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED
 status='PASS'
except BaseException as error:
 (BASE/'lifecycle-controls-failure.json').write_text(json.dumps({'status':'FAILED','at':utc(),'errorType':type(error).__name__,'error':str(error),'traceback':traceback.format_exc()},indent=2)+'\n');raise
finally:
 cleanup=[]
 for child in owned:
  cleanup.append(module.close_worker_group(child,True))
  if child.stdout is not None:child.stdout.close()
  if child.stderr is not None:child.stderr.close()
 assert all(x['actualRemainingGroup']==[] for x in cleanup)
 receipt={'status':status,'startedAt':started,'closedAt':utc(),'sourceSha256BeforeAfter':EXPECTED,'controls':rows,'actualFinalGroups':[x['actualRemainingGroup'] for x in cleanup],'payloadAllocationBytes':0,'scope':'Actual private process-lifecycle controls only: naturally exited worker remains natural; own failed finite TERM-ignoring worker plus descendant are bounded-killed/reaped. No artifact download/ZIP allocation/current game/FPS/KEEP/nativeCI acceptance.'};(BASE/'lifecycle-controls.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
