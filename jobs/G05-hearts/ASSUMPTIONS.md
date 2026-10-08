# Assumptions

- The specific G05 roster of3–6 overrides the queue's general2–8 description.
  Test1,000 games at every valid count3,4,5,6; spectators are not extra seats.
- Standard Hearts here means the American Black Lady game: thirteen hearts
  plus Q♠,26 positive points. It is not the older hearts-only chip game.
- There is no single international sanctioning body for every regional Hearts
  convention. Record conflicts and expose selected house rules in settings.
- Use Arnold's published6-player cuts (2♣,3♣,2♦,2♠), not an invented3♦ cut.
  Exact6-player table is now corroborated by BGA and the Arnold/Wikipedia
  source family.
- Preserve the contract and unrelated jobs. Local build/dependency directories
  from completed G03 are retained and locally excluded; no source is removed.
- Research on GitHub/registries keeps the proxy and TLS verification. Blocked
  publisher pages are unread, not counted as sources.
- The private SDK is unavailable. Implement the public event ordering locally
  and test it; do not copy or fabricate private helper code.
- Core bot decisions may use only their own controller view and a passed RNG.
  No opponent hand, private pass or dealt deck may influence a decision.

- Strict ES2022 uses the supplied contract unchanged. The extra optional
  exactOptionalPropertyTypes mode is omitted because the shared contract
  fails that mode; strict itself remains enabled, as verified for G03.

- The exact six-player deck cuts are now corroborated by BGA and the independently
  published Arnold table captured in Wikipedia. The research-only blocker is closed.
- Research pilot seeds0–199 are developmental, not the final league seeds. Four-seat
  matches use one stronger player against three weaker ones; report both head-to-head
  wins against a rotating designated rival and first-place share, including ties.
- Explicit VIP end scores only completed tricks of the current hand. Pending cards
  and an unfinished trick are not silently awarded; completed hand scores are not
  counted twice. This administrative partial-hand policy is separate from normal play.

- Human tables have no automatic public trick/score advance: the explicit Continue
  control gives slow readers unlimited time. An unattended all-bot table has public
  timers and schema-valid Next bot inputs; the standalone page separately paces
  its display unless the user selects Fast. No private SDK reading helper is copied.

- Standalone default deals now draw a fresh uint32 from browser crypto outside the
  pure core; an entered seed remains reproducible. The core still uses only passed
  RNG/state. The active DOM clears the setup seed after dealing.
- The page autosaves only its own connected p0–p5 hot-seat roster to local storage,
  never a network service. Core JSON remains independently saveable by its host.
  Reload starts concealed and holds the saved clock until Resume/hand reveal.
  Save failure is shown only if the browser actually refuses storage. A malformed
  stored table is rejected without deleting it until Discard/new-table is chosen.

Manage temporarily owns a running optional clock. Closing it restores the same
actor's revealed hand and selected pass, while explicit Pause still conceals.
The UI uses existing pure VIP pause/resume; browser wall time stays outside core.
Starting a reveal or submitting input closes an old management menu.

Resumed verification uses≥59 measured mean FPS andp95≤18ms as the explicit
near60fps acceptance target, with600 consecutive positive RAF-to-RAF intervals
and no sample removed. These strengthen the former17.5ms/20ms tolerance.
The first RAF supplies only a timestamp; all600 subsequent intervals remain.
Clip encoding10fps is a separate capture workflow, never a FPS benchmark.
System Chromium returned ERR_BLOCKED_BY_ADMINISTRATOR for actual file opening;
the already-installed pinned Chromium1194 executable opens the same file
without a local HTTP server. That is a test-tool choice, not runtime network
or a copied private SDK helper. Current delivery still requires full disk CI.

Executable correction: Chromium's Playwright `executablePath()` points at
full Chrome, but default headless launch uses headless_shell. Full Chrome
remains policy-blocked; the actual file succeeds in the pinned headless_shell.
Local phone55.047fps remains an honest unresolved failure, not a runtime
causal diagnosis. Historical green metadata cannot satisfy this new strict gate.
