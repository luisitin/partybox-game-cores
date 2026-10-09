import sys,json,subprocess,resource,time,datetime
from pathlib import Path
out=Path(sys.argv[1]);command=sys.argv[2:];started=datetime.datetime.now(datetime.timezone.utc).isoformat();began=time.perf_counter()
result=subprocess.run(command)
r=resource.getrusage(resource.RUSAGE_CHILDREN)
out.write_text(json.dumps({'command':command,'startedAt':started,'closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':result.returncode,'elapsedSeconds':time.perf_counter()-began,'maxRssKiB':r.ru_maxrss,'userCpuSeconds':r.ru_utime,'systemCpuSeconds':r.ru_stime},indent=2)+'\n')
sys.exit(result.returncode)
