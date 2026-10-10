Failed acceptance preserved unchanged: frozen be311 page, sampler1ac, actual12:39:55.643–12:40:22.683 UTC under explicit root quiet grant. Desktop passed59.8036fps/p99=16.8/max50ms; phone failed58.4444fps/p99=16.8/max133.3ms; all600 actual intervals/profile retained. Desktop separateclip301876B is media/round-4-frame-first-desktop.webm; no new phoneclip was collected after its failure. Previous phoneclip remains old084 evidence only. Both contexts had zero errors/nonfile requests and all source/license guards matched. No causal conclusion or game optimization is justified yet.

Phone gaps over25ms (diagnostic index listing; no samples removed):

[
  {
    "index": 406,
    "intervalMs": 83.30000000000018,
    "elapsedStartMs": 6766.376,
    "elapsedEndMs": 6849.676
  },
  {
    "index": 433,
    "intervalMs": 99.89999999999964,
    "elapsedStartMs": 7282.976,
    "elapsedEndMs": 7382.875999999999
  },
  {
    "index": 439,
    "intervalMs": 133.29999999999927,
    "elapsedStartMs": 7466.276000000001,
    "elapsedEndMs": 7599.576
  }
]

The failed sampler exits before its final source guards. Independent manual readback at 2026-10-08T12:41:58.445+00:00 verifies the HTML hash and every captured source fingerprint still match exactly. License presence was checked at runner start. No cause for the three late phone gaps is established.
