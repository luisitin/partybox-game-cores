# Resume G01

Branch: job/G01-dominoes. Work in the existing isolated checkout; no worktree.
Core, tests, bot policies and standalone HTML are implemented. Initial source
403 blockers were superseded by the web fallback added to RULES.md on main.

Outstanding:
- Finish the running full simulation/property test suite, leagues and browser
  checks, investigate failures and record actual results in VERIFY.md.
- Compare strong play against the researched probabilistic alpha-beta baseline;
  measured comparison is required, not just shared algorithm terminology.
- Validate all fixtures, manifest equality, state-size limits and bot outputs.
- Run 25 one-at-a-time mutants against a PASSING baseline (the initial attempt
  was discarded because a test fixture was still failing).
- Update checksums for all shipped JSON and milestone captures.
- Push milestones and refresh the claim on main, preserving other agents.
- PR/CI through api.github.com currently returns proxy CONNECT 403. Network
  additions are saved to the cloud draft; saving has not applied or published.
- Open a PR only after checks pass; then confirm green CI before KEEP GOING.
  No KEEP GOING rounds have executed; three no-player-gain rounds are required.

## Re-verify when web works

Read the blocked Pagat Draw/Block pages and Bicycle rules. Confirm hand sizes,
stock reserve, first/future-round opener conventions and individual blocked
scoring. Expand the variant survey; distinguish official and regional rules.
Knowledge-only details are labelled in RULES.md and SOURCES.md.

Environment: Node 24.19.0/npm 11.9.0; cache /workspace/.npm-cache. Shared
contract remains unchanged. Chromium and ffmpeg are installed. Browser tooling
is in /workspace/.browser-tools; no application services are required.
