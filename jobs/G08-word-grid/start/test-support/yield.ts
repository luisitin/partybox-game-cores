// The supplied choreography tests contain long synchronous frame sweeps. Let the test worker
// receive its IPC acknowledgements between cases, rather than timing out queued RPC updates.
// This changes no assertion, sample count, frame spacing, or test timeout.
import { afterEach } from 'vitest';
afterEach(async () => { await new Promise<void>(resolve => setTimeout(resolve, 0)); });
