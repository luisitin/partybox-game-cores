# Assumptions

- Follow the user’s blocked-source rule and move to the next eligible job.
- Unread source URLs are candidates, never evidence or completed research.
- No game checks, bot results or CI outcomes can be claimed yet.
- Preserve the shared contract and unrelated repositories.
- No credentials are needed for public source pages. Do not request tokens
  merely because gh reports an unusable token; native Git access works.

## Resumed implementation (2026-10-08)

- Prior research-only stopping assumptions are historical. Current main's
  GitHub→registry→knowledge fallback governs; no current BLOCKED.md is asserted.
- Both requested official games use exactly two seats. The test matrix will cover
  seven1,000-game rules/settings configurations at that valid player count.
- FMJD2024 International draw allowances are the default; a selectable forty-move
  house option is distinct from the official twenty-five-move/ending rules.
- Preserve activated ending allowances across captures/promotions; when a new
  shorter allowance applies, intersect its expiry with older active allowances.
  Long-diagonal withdrawal/reentry behavior is explicitly a documented assumption.
- A bounded bot search is approximate. Database coverage/provenance and unresolved
  material classes will be disclosed rather than represented as global six-piece
  coverage. Externally published data require an actual redistribution permission.
- The shared SDK is absent; the local reducer adapter follows the exact contract's
  event order and retains shared contract types and seeded RNG helpers unchanged.
# Implementation checkpoint assumptions

The bot host runs its pure alpha-beta computation in an inline Blob worker so
thinking does not block interaction. Worker construction is part of the local
offline host, not network access. The bounded node search is not a tablebase.

The generated database has complete one-vs-one material classes and exact closed
forced-capture proofs containing up to six pieces. Unknown three-to-six quiet
positions return null. Full-six-piece coverage is still required before G10 can
be marked complete. No external binary with unconfirmed data-use permission is
redistributed. Kingsrow's original author statement is a live confirmed lead,
and selective installer extraction is still being investigated.

- JOBS.md requires2,000 Strong/Medium games and2,000 Medium/Easy games without
  saying per variant. The canonical league balances1,000 American and1,000
  International per comparison,4,000 total; each variant must separately pass
  the clear-advantage threshold. The earlier8,000-game default was an added scope.
- Full International corpus availability is confirmed; its1.009GB compressed
  payload exceeds GitHub's100MiB single-blob limit. This is portable-probe and
  offline-delivery engineering, not unavailable-source grounds for BLOCKED.
