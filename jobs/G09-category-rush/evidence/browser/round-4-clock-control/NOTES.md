These are independent diagnostics, not gameplay or frame acceptance.
Both evaluate or use the pinned Playwright 1.56.0 dependency unchanged.
The generated dependency source remains installed and is not copied here.

The VM control ran 14:25:43.616–14:25:43.622 UTC. Controlled continuation
resolvers force a newer explicit advance to complete before an older yielded
advance: actual shipped ClockController callbacks observe 100 then 10,100 ms,
the newer completion observes 10,100 ms, and the older completion rewinds to
100 ms. Sequential completion remains at 10,100 ms. This demonstrates a
possible scheduler mechanism, not the exact schedule in every old failure.

The independent actual Chromium empty-page control ran
14:25:45.102–14:25:48.779 UTC. Default auto clock and explicitly paused clock
each execute 40 awaited fastForward(10000) calls with native Node 25 ms gaps.
All 161 callback/before/after samples per profile are retained unfiltered.
The auto clock has 21 backward steps, the largest 9,991 ms; paused has zero.
The empty page loads no game code, records no frames, and makes no requests.
The game HTML and dependency hashes match before and after.

The observed 709 host-pause clock discontinuity plus these independent controls
support explicitly pausing the functional-test clock before app timers exist.
Recovery will retain every original public action, elapsed advance and exact
privacy/timer assertion. Production code and the strict frame sampler are
unchanged. Older unobserved recovery and local frame failures remain unresolved.
