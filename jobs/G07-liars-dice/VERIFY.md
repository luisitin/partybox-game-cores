# Verification log

## Research milestone (2026-10-08)
Four Exa searches returned 24 results; ten unique source extractions were read.
Exact URLs, coverage, extraction hashes: evidence/research-sources.json.
No origin HTTP status is inferred from Exa success. Full texts remain ignored.
Historical 403 observations are preserved, not current blockers.

`node tests/probability-reference.mjs`: PASS; 21 hand cases, 714 exhaustive cases
(111,974 full rolls), 4,182 identity cases, 105,264 conditional comparisons
(133,644 hidden completions), 13 invalid calls. This runs only the independent
oracle, not a differential against the as-yet-unwritten primary implementation.
`node --check tests/probability-reference.mjs`: PASS. Method and independent
review scope are recorded in evidence/independent-reference.md.

Core, fixtures, matrix, mutations, leagues, browser and hosted CI are pending.
Actual commands/results will replace this pending section as they run.

Primary milestone: esbuild-bundled src/probability.ts compared against the
independently authored convolution reference using seed 1799. 10,000 direct
and 10,000 own-cup-conditioned random cases passed with exact integer strings
and floating ratios equal. The first inline runner failed before comparisons
because G02 does not re-export createRng; bundling the unchanged shared RNG
fixed the runner. The reproducible npm-test differential is being added.
