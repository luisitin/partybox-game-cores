import datetime
import glob
import json
import os
from pathlib import Path
import shlex
import signal
import subprocess
import sys
import time

root = Path('.work/current91-resumed')
root.mkdir(exist_ok=True)
(root / 'checks').mkdir(exist_ok=True)
node = '.work/memory-json-private/node22/runtime/bin/node'
tests = sorted(glob.glob('tests/*.test.mjs'))
command = [node, '--test', '--experimental-test-isolation=none', '--test-reporter=tap', '--test-concurrency=1', *tests]
environment = os.environ.copy()
environment['G10_EVIDENCE_DIR'] = '.work/current91-resumed/checks'
environment['G10_TEST_COMMAND'] = shlex.join(command)
removed = {key: environment.pop(key) for key in ['G10_INTERNATIONAL_SOURCE', 'G10_EXPECTED_CHECKS'] if key in environment}
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
save = lambda name, value: (root / name).write_text(json.dumps(value, indent=2) + '\n')
node_version = subprocess.check_output([node, '--version'], text=True).strip()
metadata = {'command':command, 'shellCommand':shlex.join(command), 'wrapperCommand':['python3','.work/run-resource.py',str(root/'resource.json'),*command], 'nodeVersion':node_version, 'testFiles':tests, 'cwd':str(Path.cwd()), 'environment':{'G10_EVIDENCE_DIR':environment['G10_EVIDENCE_DIR'],'G10_TEST_COMMAND':environment['G10_TEST_COMMAND'],'NODE_OPTIONS':environment.get('NODE_OPTIONS')}, 'removedOverrideKeys':sorted(removed), 'createdAt':now(), 'memoryLimitKiB':4718592, 'browserOwned':False}
save('invocation.json', metadata)
subprocess.run([node,str(root/'input-guards.mjs'),str(root/'guards-before.json')],check=True)
start = time.perf_counter()
with (root/'stdout.tap').open('w') as stdout, (root/'stderr.log').open('w') as stderr:
    process = subprocess.Popen(metadata['wrapperCommand'],env=environment,stdout=stdout,stderr=stderr,start_new_session=True)
    metadata.update({'startedAt':now(),'pgid':process.pid,'resourceWrapperPid':process.pid,'orchestratorPid':os.getpid(),'status':'RUNNING'})
    save('invocation.json',metadata)
    print(json.dumps({'status':'RUNNING','pgid':process.pid,'browserOwned':False,'nodeVersion':node_version,'testFiles':len(tests),'startedAt':metadata['startedAt']}),flush=True)
    max_group_rss = 0
    max_with_monitor_rss = 0
    killed = False
    samples = 0
    def rss_for_group():
        members=[]
        for path in Path('/proc').glob('[0-9]*/stat'):
            try:
                fields=path.read_text().rsplit(')',1)[1].split()
                if int(fields[2])==process.pid:
                    members.append({'pid':int(path.parent.name),'rssKiB':int(fields[21])*os.sysconf('SC_PAGE_SIZE')//1024,'state':fields[0]})
            except (FileNotFoundError,ProcessLookupError,PermissionError):
                pass
        return members
    while process.poll() is None:
        members=rss_for_group()
        rss=sum(item['rssKiB'] for item in members)
        own_fields=Path('/proc/self/stat').read_text().rsplit(')',1)[1].split()
        own_rss=int(own_fields[21])*os.sysconf('SC_PAGE_SIZE')//1024
        max_group_rss=max(max_group_rss,rss)
        max_with_monitor_rss=max(max_with_monitor_rss,rss+own_rss)
        samples+=1
        if samples%10==1:
            save('live-resource.json',{'at':now(),'pgid':process.pid,'members':members,'groupRssKiB':rss,'maxGroupRssKiB':max_group_rss,'maxWithMonitorRssKiB':max_with_monitor_rss,'elapsedSeconds':time.perf_counter()-start,'samples':samples})
        if rss+own_rss>metadata['memoryLimitKiB']:
            save('memory-cap-exceeded.json',{'at':now(),'members':members,'groupRssKiB':rss,'monitorRssKiB':own_rss,'limitKiB':metadata['memoryLimitKiB']})
            os.killpg(process.pid,signal.SIGTERM)
            killed=True
            break
        time.sleep(0.1)
    exit_code=process.wait()
    closed=now()
save('observed-resource.json',{'startedAt':metadata['startedAt'],'closedAt':closed,'elapsedSeconds':time.perf_counter()-start,'exitCode':exit_code,'maxGroupRssKiB':max_group_rss,'maxWithMonitorRssKiB':max_with_monitor_rss,'memoryLimitKiB':metadata['memoryLimitKiB'],'memoryCapExceeded':killed,'samples':samples})
subprocess.run([node,str(root/'input-guards.mjs'),str(root/'guards-after.json')],check=True)
before=json.loads((root/'guards-before.json').read_text())
after=json.loads((root/'guards-after.json').read_text())
changes={kind:[path for path in sorted(set(before[kind])|set(after[kind])) if before[kind].get(path)!=after[kind].get(path)] for kind in before}
guard_result={'unchanged':before==after,'counts':{kind:len(hashes) for kind,hashes in before.items()},'changedPaths':changes}
save('guards-result.json',guard_result)
metadata.update({'status':'CLOSED','closedAt':closed,'exitCode':exit_code,'guardsUnchanged':before==after,'memoryCapExceeded':killed})
save('invocation.json',metadata)
print(json.dumps({'status':'CLOSED','exitCode':exit_code,'guards':guard_result,'maxGroupRssKiB':max_group_rss,'maxWithMonitorRssKiB':max_with_monitor_rss,'memoryCapExceeded':killed}),flush=True)
sys.exit(exit_code if exit_code else (0 if before==after else 1))
