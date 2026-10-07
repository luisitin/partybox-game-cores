# Assumptions

- Nickname: codex-domino. Claims use actual UTC time.
- Initial main and working checkout were clean; preserve all contract files.
- Do not implement remembered rules while the mandated research is blocked.
- AI strength must eventually be measured, not inferred from popularity.
- normal/sharp contract skills will correspond to medium/strong job labels.
- No game checks or KEEP GOING rounds count until a game exists and CI passes.

Update: main RULES.md gained an explicit web-blocked fallback during work.
The initial research-only stop is superseded; use inspected GitHub sources
and mark remaining knowledge conventions unverified. Exact adversarial search
is a strategy reference, not a claim to have solved imperfect information.
Bots approximate future draws in lookahead; the reducer implements actual draws.

- Baseline strength comparison uses an explicitly bounded 16-sample endgame
  configuration; do not claim a universal best-AI or unlimited-search result.
- Phone performance means a 390x844 Chromium viewport at 4x CPU throttle,
  not measurements collected on physical phone hardware.
- Managed Chromium forbids file:// navigation. Browser checks use the exact
  on-disk standalone HTML through setContent, with zero external requests.
  Direct file navigation is unverified in this managed instance.

First-round highest-double Block inference: no initially held tile can outrank the forced opener; no stock tile enters play. Therefore the maximum ranked played tile remains that opener, even after physical board reordering. Rank is the reducer's double-first ordering. Use only public played tiles and round/settings; leave stock unrestricted and disable for Draw, rotating openings and later rounds. This is a deduction from implemented rules, not a hidden-hand observation.

Untouched-stock Draw: public hand count plus played count conserves all28 tiles, so stock size is inferable. Stock never increases within a round. Equality with the initial deal stock proves no tile was drawn; then the original highest opener remains the maximum ranked played tile. After any draw, disable the inference for all seats rather than guess which hands can contain newly introduced higher tiles. This remains a partial-history Draw model.
