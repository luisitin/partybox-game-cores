import {writeFile} from 'node:fs/promises';

export async function beginTrace(page, context, output) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  const before = await cdp.send('Performance.getMetrics');
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', {interval: 1000});
  await cdp.send('Tracing.start', {categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8,disabled-by-default-v8.gc,blink.user_timing', transferMode: 'ReturnAsStream'});
  await cdp.send('Profiler.start');
  return {cdp, output, before};
}
export async function endTrace(session) {
  const {cdp, output, before} = session;
  const cpu = await cdp.send('Profiler.stop');
  const after = await cdp.send('Performance.getMetrics');
  const completed = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
  await cdp.send('Tracing.end');
  const {stream} = await completed;
  let raw = '';
  for (;;) {
    const chunk = await cdp.send('IO.read', {handle: stream});
    raw += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString('utf8') : chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send('IO.close', {handle: stream});
  await writeFile(`${output}-trace.json`, raw);
  await writeFile(`${output}-cpu.cpuprofile`, JSON.stringify(cpu.profile) + '\n');
  const trace = JSON.parse(raw).traceEvents ?? [];
  const marker = trace.find(event => event.name === 'G07_DIAGNOSTIC_SAMPLE_BEGIN');
  const end = trace.find(event => event.name === 'G07_DIAGNOSTIC_SAMPLE_END');
  const events = trace.filter(event => event.ph === 'X' && event.dur > 0 &&
    (!marker || event.ts >= marker.ts) && (!end || event.ts <= end.ts));
  const grouped = new Map();
  for (const event of events) {
    const row = grouped.get(event.name) ?? {name: event.name, count: 0, totalMs: 0, maximumMs: 0};
    row.count++; row.totalMs += event.dur / 1000; row.maximumMs = Math.max(row.maximumMs, event.dur / 1000);
    grouped.set(event.name, row);
  }
  const summary = {diagnosticOnly: true, tracingAndCpuSamplingAddOverhead: true,
    sampleMarkerTraceUs: marker?.ts ?? null, endMarkerTraceUs: end?.ts ?? null,
    metricsBefore: before.metrics, metricsAfter: after.metrics,
    eventTotals: [...grouped.values()].sort((a,b) => b.totalMs-a.totalMs),
    longestEvents: events.sort((a,b) => b.dur-a.dur).slice(0,40).map(event => ({name:event.name,
      category:event.cat, relativeToSampleMs: marker ? (event.ts-marker.ts)/1000 : null,
      durationMs:event.dur/1000, pid:event.pid, tid:event.tid, args:event.args})),
    gcEvents: events.filter(event => /gc|garbage|scavenge|markcompact/i.test(event.name)).map(event => ({name:event.name,
      relativeToSampleMs:marker ? (event.ts-marker.ts)/1000 : null,durationMs:event.dur/1000,args:event.args}))};
  await writeFile(`${output}-trace-summary.json`, JSON.stringify(summary,null,2)+'\n');
  return summary;
}
