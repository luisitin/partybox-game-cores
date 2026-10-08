# G08: mandatory source research blocked

Observed 2026-10-07T15:05:43Z. Required research: official dice/rule research and a verifiable licensed public-domain dictionary.

- `https://www.hasbro.com/common/instruct/Boggle.pdf`: curl exit 22; `curl: (22) The requested URL returned error: 403`.
- `https://www.gutenberg.org/ebooks/3201`: curl exit 22; `curl: (22) The requested URL returned error: 403`.

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
