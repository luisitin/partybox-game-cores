# Independent G04 contract audit, 2026-10-09

The original core incorrectly declared noCards:true despite 160 English prompts.
The shared contract reserves that optional literal-true flag for games without
cards, prompts or language text. Omitting it retains default English metadata.
The original reducer, views, bots, timer, sampler and seven fixtures are unchanged.
No player-visible SDK picker or performance gain has been observed or claimed.

manifest-before.stdout.log contains the genuine one-test failure before the fix.
The first controller misclassified Node's default spec output as TAP; its original
EXIT1/CLOSED receipt remains here. The distinct independent reader accepted the
actual assertion failure without rerunning the test or rewriting that receipt.

manifest-fixed-checks-CLOSED.json records strict types, two identical fixture
regenerations, two identical builds, build freshness, 29 focused tests, all 160
sample rows and the original four strict proof/refusal tests, all naturally EXIT0.
FAST_TEST=1 applies only to that bounded local pipeline. Full npm test was not
executed locally. Original checker/host workflow gates remain unchanged.

source-scope-proof.json compares 229 canonical job/contract/workflow files before
this documentation checkpoint: 225 identical and exactly four manifest/test/build
changes. It is deliberately scoped before docs and is not a whole final-tree map.

canonical-baseline contains the genuine official artifact11580178889 for exact
original c81b0b7e69b19782613debbc1296c6d56f556927/run37846802513.
The archive is1444862 bytes, SHA256
56f9427d827bd42cb74b5656842e75dc1fb30402281fd1a15e80607756944a3c.
The unchanged original public reader passed10862 assertions, 1034 source identities,
all3000 native intervals,66 functional checks and full decoding of allfive clips.
Those old results are historical baseline evidence, not current corrected-source
acceptance. The new draft PR requires its own complete workflow/log/official ZIP
and original reader before Ready. Existing failures and KEEP12–14 are preserved.
