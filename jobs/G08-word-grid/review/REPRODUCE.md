# Reproduce play and verification

Open `jobs/G08-word-grid/play.html` from disk to play. Its existing code, dictionaries and notices are inline; playing needs no build, package installation or network.

For development checks, use a clean separate checkout of the tested commit, then work from `jobs/G08-word-grid`. Full checks use Node 24, the package-lock npm installation, locked Playwright Chromium headless shell, and both system `ffmpeg` and `ffprobe`.

```sh
npm ci --no-audit --no-fund
npx playwright-core install chromium --only-shell --with-deps
npm test
```

The exact Ubuntu CI tool setup, official mirror correction and fatal installation timeouts are in `.github/workflows/G08.yml`. A shared local full run needs the real `G08_FRAME_BARRIER_DIR` READY/grant/CLOSED coordination described in `README.md` and `NEXT.md`; CI's actual runner uses its own isolated acceptance path. `npm run test:unit` is the shorter regression suite. `npm run build:play` regenerates the existing page. Whole-job acceptance still requires every mandatory stage, both current push/PR events and actual downloaded artifact inspection.

The following two public integrity commands were actually exercised successfully on the genuine accepted push artifact for commit `8c9a9627c0bf2e66905f7e5c1341e293aeb4b27a`. Its run is 37850141206, artifact 11581758657. Use that exact clean checkout and the extracted archive in the stated directory; the ZIP byte/digest/path/CRC receipt is in `keep12/push-archive-receipt.txt`.

```sh
gh run download 37850141206 --repo luisitin/partybox-game-cores --name G08-check-evidence --dir .tmp/ci/8c9-push-artifact
node start/verification/verify-browser.mjs .tmp/ci/8c9-push-artifact/visual/frames-03d70161-e322-490b-907c-6e5b2baf1846/report.json --artifact
node start/verification/verify-capture.mjs .tmp/ci/8c9-push-artifact/visual/native-2053574c-9d44-452d-8f41-9ae6c46cdb91/browser-report.json
```

The frame command accepts the recorded runner's disk path via `--artifact` and still recomputes every current source digest and all 2400 unfiltered interval statistics, exact profiles and live hunt endpoints. The capture command checks all 22 gates, five rosters, real minimum two-second Pause receipt and hashes/metadata/full decode of all five actual clips. Both command processes actually exited 0. These read existing evidence and do not sample new frames or record a browser.

For another run, first bind the successful push/PR run heads to the exact tested Git commit and verify actual ZIP metadata/digest/size, safe paths and all CRCs before extraction. Locate the actual `visual/frames-*/report.json` and `visual/native-*/browser-report.json`, then supply those paths to the same readers. Keep the source checkout clean and matching that commit. Full acceptance uses disk, complete four-profile evidence and `nativeOnly:false`; partial historical diagnostics retain their own scope. Archive/provenance verification and immutable-Git independent receipts are retained in each accepted review directory.
