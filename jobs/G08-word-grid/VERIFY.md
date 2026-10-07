# Executed checks (2026-10-07T15:05:43Z)

From /workspace/partybox-game-cores, for each URL below:
`curl --silent --show-error --fail --location --max-time 20 --output
/tmp/G08-source-<index> <URL>`

- `https://www.hasbro.com/common/instruct/Boggle.pdf`: curl exit 22; `curl: (22) The requested URL returned error: 403`.
- `https://www.gutenberg.org/ebooks/3201`: curl exit 22; `curl: (22) The requested URL returned error: 403`.

These checks catch inability to obtain source contents; they do not verify
source rules, licences or factual claims. All candidates were denied.
The claim push succeeded. No npm test suite exists for this job yet.
Game tests, simulations, mutation testing, bot leagues, HTML validation,
performance/captures, job-specific checks and CI are UNRUN (zero game tests).
