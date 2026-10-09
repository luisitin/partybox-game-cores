# Exact negative-control procedure

Operate only on `.work/proof-freshness-negative`, an ignored copied job. Copy the delivered job while excluding `.work`, `.git`, `dist` and `node_modules`; link its dependency/build directories to the unchanged delivered ones. Append `\n<!-- isolated freshness negative control; no gameplay edit -->\n` to the copied play.html. Run copied `node scripts/hashes.mjs`, then the archived old `node scripts/integrity.mjs`: exit 0 despite mismatched accepted-report/page hashes.

Copy only the new integrity script, proof module and current-proof index into that ignored copy, refresh copied hashes, and run new `node scripts/integrity.mjs`: expected exit 1, `AssertionError: accepted proof has stale source hashes`. The test does not change delivered HTML, core or old evidence, and claims a provenance-gate gap rather than changed game behavior. Exact before/after scripts, stdout and hashes are adjacent.
