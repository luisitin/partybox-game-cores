# Assumptions

- G03 is original. The prompt defines its rules; two independent live sources
  substantiate geometry/search facts rather than purported official rules.
- Hot-seat players get equal timed turns and the same puzzle. A hand-off
  overlay pauses the core clock until the next person starts.
- Difficulty measures a named reproducible greedy policy; human solve rates
  remain unknown and will not be represented as measured.
- Public contract authoritative; private SDK unavailable. Equivalent event
  ordering is implemented locally and tested.
- Preserve the shared contract, unrelated jobs, HTTPS proxy and TLS trust.
  Never print or commit credentials.
- Historical source failures no longer block reachable-source research.
- Strict TypeScript remains enabled. exactOptionalPropertyTypes is omitted
  because the supplied shared contract itself is incompatible with that optional
  extra compiler mode; the shared files are preserved unchanged.
- The private reading helper is unavailable. Reveal has a conservative120-second
  fallback and an explicit Next control, rather than duplicating that SDK helper.
- The local managed file-navigation restriction is checked separately from
  allowed HTTP; a normal GitHub runner performs the mandatory actual disk test.
