# G04 Reality Check

Original quiz/bluff core,2–8 players,with Quick/Mixed/Bluff modes.
Eight realms each use20 original fictional workshop rows; real content belongs
to partybox-content-packs. First appearance includes a10-second demo;
eight rounds by default,last round doubled.

Research is complete. Implementation and verification are in progress.
Do not call this job complete or its CI green. Read NEXT.md for the checkpoint.
Node24+,TypeScript strict/ES2022,zod-only runtime.

Once implementation exists: npm ci --ignore-scripts --cache /workspace/.npm-cache;
npm test runs all required checks. play.html must be self-contained/offline.
