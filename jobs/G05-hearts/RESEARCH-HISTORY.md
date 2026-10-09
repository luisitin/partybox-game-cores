# Historical research checkpoint

The previous remote head75bf358 (2026-10-07) stopped at publisher/API access.
It is preserved by the merge. On2026-10-08 native GitHub/API and registry
operations work and27 pinned files were read; the updated root fallback rule
explicitly permits these sources. The old access block below is historical.
Exact6-player source corroboration remains a separate research task in NEXT.

# G05: mandatory source research blocked

Observed 2026-10-07T15:05:22Z. Required research: independent Hearts rules including player-count deck adjustments and moon/Jack variants.

- `https://www.pagat.com/reverse/hearts.html`: curl exit 22; `curl: (22) The requested URL returned error: 403`.
- `https://bicyclecards.com/how-to-play/hearts`: curl exit 22; `curl: (22) The requested URL returned error: 403`.

The enforced runtime egress allowlist excludes these source hosts. Requests
are denied at the HTTPS proxy; source contents have not been read. These
candidate URLs are not citations for rules or facts. Their content and
suitability must be checked once access works, including any redirects.

RULES.md requires deep research first and corroborated facts; JOBS.md also
requires full rules/variants from 2+ sources. For original-design jobs,
research algorithm/scoring claims and document the original rules separately.
No implementation based on remembered or invented source contents is shipped.

Native Git read/push and npm registry access work. API access to api.github.com
is separately denied, preventing verified gh PR/CI operations. This is an
external environment blocker, not a proven repository defect. Draft network
changes do not take effect until applied through environment settings.
