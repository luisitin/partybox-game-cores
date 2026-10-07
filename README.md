# PartyBox game cores

Public workshop for whole party games written as pure, deterministic state machines. Each game lives in jobs/<ID>-<slug>/ and follows the game contract in contract/ (GAME_CONTRACT.md explains it; the .ts files are the exact types).

- RUN-ALL.md: the message that starts an agent working the queue.
- RULES.md: binding rules for every job.
- JOBS.md: the queue.
- CLAIMS.md: who is working on what.

Licence: MIT for code. Data and art: see each job's SOURCES.md.
