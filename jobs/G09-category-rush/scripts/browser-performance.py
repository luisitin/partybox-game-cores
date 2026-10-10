import json,hashlib,os,statistics
from glob import glob
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent; html=root/'play.html'; digest=hashlib.sha256(html.read_bytes()).hexdigest()
(root/'media').mkdir(exist_ok=True)
(root/'evidence/browser').mkdir(parents=True,exist_ok=True)
print('PGID',os.getpgrp(),'SHA',digest,flush=True)
results=[]
with sync_playwright() as p:
 candidates=glob(str(Path.home()/'.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell'))
 executable=os.environ.get('CHROMIUM_PATH') or (candidates[-1] if candidates else None)
 browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox'])
 browser_version=browser.version
 for label,w,h,rate in [('desktop',1920,1080,1),('phone4x',390,844,4)]:
  context=browser.new_context(viewport={'width':w,'height':h},offline=True,record_video_dir=str(root/'media'),record_video_size={'width':min(w,1280),'height':min(h,720)})
  page=context.new_page(); errors=[]; requests=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:requests.append(r.url))
  cdp=context.new_cdp_session(page);cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate})
  page.goto(html.as_uri()); page.locator('#rounds').select_option('1');page.locator('#seconds').select_option('60')
  page.get_by_role('button',name='Let’s play').click();page.locator('#ready').click();page.wait_for_timeout(250)
  frame=page.evaluate('''async()=>{const times=[];await new Promise(resolve=>{let previous=null;function sample(now){if(previous!==null)times.push(now-previous);previous=now;if(times.length===600)resolve();else requestAnimationFrame(sample);}requestAnimationFrame(sample);});return {times};}''')
  times=frame['times']; ordered=sorted(times);total=sum(times)
  item={'profile':label,'viewport':{'width':w,'height':h},'cpuThrottle':rate,'sourceSha256':digest,'sampleMethod':'601 consecutive actual requestAnimationFrame timestamps, 600 adjacent deltas; no sleeps, filtering or synthetic timestamps','frames':times,'count':len(times),'totalMs':total,'meanMs':statistics.mean(times),'fps':600000/total,'p95Ms':ordered[569],'p99Ms':ordered[593],'maxMs':max(times),'networkRequests':requests,'pageErrors':errors}
  item['passed']=len(times)==600 and item['fps']>=59 and item['p99Ms']<=17 and not errors and all(u.startswith('file:') for u in requests)
  (root/'evidence/browser'/f'{label}-frames.json').write_text(json.dumps(item,indent=2)+'\n')
  page.screenshot(path=str(root/'evidence/browser'/f'{label}-active.png'),full_page=True)
  video=page.video;context.close();video.save_as(str(root/'media'/f'milestone-{label}.webm'));(Path(video.path())).unlink(missing_ok=True)
  item.pop('frames');item['video']=f'media/milestone-{label}.webm';item['videoBytes']=(root/item['video']).stat().st_size;results.append(item)
  print(json.dumps(item),flush=True)
 browser.close()
assert hashlib.sha256(html.read_bytes()).hexdigest()==digest
(root/'evidence/browser/performance-report.json').write_text(json.dumps({'sourceSha256':digest,'browser':browser_version,'profiles':results,'passed':all(r['passed'] and r['videoBytes']<10000000 for r in results)},indent=2)+'\n')
assert all(r['passed'] for r in results)
