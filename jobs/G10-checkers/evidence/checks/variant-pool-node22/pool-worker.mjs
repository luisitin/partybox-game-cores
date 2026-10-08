import {parentPort,workerData} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';

const began=performance.now();
await import(new URL('../dist/core-'+workerData.variant+'.mjs',import.meta.url));
await import('../scripts/league-worker.mjs');
parentPort.postMessage({kind:'ready',variant:workerData.variant,index:workerData.index,
  importSeconds:(performance.now()-began)/1000,memory:process.memoryUsage()});
