# Executed checks (2026-10-07T15:05:58Z)

From /workspace/partybox-game-cores, for each URL below:
`curl --silent --show-error --fail --location --max-time 20 --output
/tmp/G10-source-<index> <URL>`

- `https://www.wcdf.net/rules.htm`: curl exit 22; `curl: (22) The requested URL returned error: 403`.
- `https://www.fmjd.org/docs/Annex%201%20official%20FMJD%20rules%20of%20international%20draughts.doc`: curl exit 22; `curl: (22) The requested URL returned error: 403`.

These checks catch inability to obtain source contents; they do not verify
source rules, licences or factual claims. All candidates were denied.
The claim push succeeded. No npm test suite exists for this job yet.
Game tests, simulations, mutation testing, bot leagues, HTML validation,
performance/captures, job-specific checks and CI are UNRUN (zero game tests).
