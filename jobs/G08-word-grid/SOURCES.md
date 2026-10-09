# G08 sources

Live receipts with pinned commits, byte counts and SHA-256: [source-receipts.json](start/research/source-receipts.json). Facts only are taken from the game repositories; no third-party code, art, dictionary or media is copied.

- Princeton-style BoggleBoard (BIG and MASTER tables), independently compared with pf-boggle, Taylor Scafe and plettj. BIG agrees with the owner; Master/Deluxe differs on CCNSTW, DDLNOR, DHHNOT and HIPRRY. Shared BGG ancestry of pf/plett/Taylor is explicit: they are not three independent physical-box observations.
- pf-boggle's table links Hasbro 4x4/5x5 manuals; Taylor's scoring and the FiveThirtyEight quote agree on 1,1,2,3,5,11. Clifford Thompson and the independent classroom descriptions corroborate diagonal adjacency/no reuse. Boggle Party and Taylor corroborate duplicate cancellation. Variant disagreements are in CONFLICTS.md.
- `an-array-of-english-words@2.0.0`, `an-array-of-spanish-words@2.0.0`: live npm tarballs, MIT; existing owner packs retained until regeneration verification.
- `wordlist-english@1.2.1`: live npm tarball, wrapper MIT, bundled SCOWL Copyright governs word data. SCOWL <=70 intersection is optional; 70 itself includes uncommon words, so it is a smaller dictionary rather than a promise that every word is familiar.
- Existing Spanish bot vocabularies cite FrequencyWords/CC-BY-SA-4.0; fresh pinned upstream525f9b560de45753a5ea01069454e72e9aa541c6 verified: README distinguishes MIT code from CC-BY-SA-4.0 content. Unchanged es_50k input and adaptation attribution in start/research/inputs and licences.
- Owner source, original CSS, five GLB models and film source: preserved baseline hashes in start/research/original-files.json. No owner model, art, film look or name changes.

Canonical Hasbro and Winning Moves requests were denied at the earlier 07:52 UTC managed-proxy attempt. Later, at about 21:20 UTC on 2026-10-08, both actual primary PDFs returned HTTP 200 and were read. [Primary receipts and variant decisions](review/keep11/PRIMARY-MANUALS.md) record exact bytes/digests and actual visual/text inspection. Those later reads corroborate ordinary mechanics; neither PDF supplies complete cube-face tables, so physical edition/Spanish face authentication stays unresolved. Independent GitHub/registry sources and their ancestry caveats remain valid; no earlier denial is rewritten as a successful read.

- Build bindings bundle original client dependencies react/react-dom18.3.1, zod3.25.76 and retained three0.171.0 under MIT; their complete installed-package notices are copied into `start/research/licences/` and inline HTML credits. No downloaded art/font/avatar assets are used by the flat offline host.

- `start/offline/strings.ts`: original Spanish translations of the offline host controls/help authored for this verification. Mechanics remain the independently sourced owner rules; user names and dependency legal notices are not translated.

## Pinned live source links and uses

- [pillowfication/pf-boggle — src/dice-sets.js](https://github.com/pillowfication/pf-boggle/blob/bfe81ba0ddacaa9988e754fbf56e8686e57df6b1/src/dice-sets.js): Master/Deluxe cube-face facts and comparison Spanish published report.
- [phareskrad/algs4 — assignments/Boggle/BoggleBoard.java](https://github.com/phareskrad/algs4/blob/18abfcf9667d3ce67974f1628954cd6ea285c80d/assignments/Boggle/BoggleBoard.java): Distinct BIG and MASTER English sets; Q is two letters.
- [chrispiech/cs106b-fall-2016-website — assn/boggle.html](https://github.com/chrispiech/cs106b-fall-2016-website/blob/ab1ffc58cd3e51dfa78557839a906696431eee12/assn/boggle.html): Adjacency, non-reuse, board setup and classroom scoring variant.
- [mkonikov/WordCube — README.md](https://github.com/mkonikov/WordCube/blob/6a7ecadc7b597bbe258d7d4d441255e6527fe1e3/README.md): 5x5 four-letter minimum, adjacency and alternate 120-second round.
- [plettj/boggle — README.md](https://github.com/plettj/boggle/blob/8e57a04d0fa890c632ca9cb1eea0ec9983f5884f/README.md): Master/Deluxe face facts; BGG ancestry recorded.
- [taylor-scafe/Boggle-VB.NET — README.md](https://github.com/taylor-scafe/Boggle-VB.NET/blob/12897d38ababae182e01f02e320e0ab743bfda50/README.md): Duplicate cancellation; Q counts two; official-style scoring vs penalty/bonus house rules.
- [megulus/boggle — README.md](https://github.com/megulus/boggle/blob/d6ca286c0bccee5e88c0f77c2bb122fb9867e111/README.md): BIG cube facts, minimum lengths, non-reuse and wagering variants.
- [RobAWilkinson/boggle-react — README.md](https://github.com/RobAWilkinson/boggle-react/blob/851bd98a2a6b3abc563cee74fa6ce336ab516fb1/README.md): BIG faces, Qu, scoring and adjacency; classroom 5x5 three-letter variant.
- [nsnishant1/Boggle-Party — README.md](https://github.com/nsnishant1/Boggle-Party/blob/812fa852fbab43c0d0461e79bbf22c79fb13a532/README.md): Duplicate cancellation; Q-u and diagonal path rules.
- [cliffordthompson/boggle — README.md](https://github.com/cliffordthompson/boggle/blob/05b095d3abc78bdd4e13bfc27a81dd57f3a1816d/README.md): Independent diagonal/no-reuse explanation.
- [hturnbull93/boggle-in-ruby — README.md](https://github.com/hturnbull93/boggle-in-ruby/blob/be765166c396d3f27dfec52e1904f062ecad545f/README.md): Three-minute/three-letter rules; conflicting seven-letter score.
- [pillowfication/pf-boggle — README.md](https://github.com/pillowfication/pf-boggle/blob/bfe81ba0ddacaa9988e754fbf56e8686e57df6b1/README.md): Manufacturer-linked score/minimum table.
- [reallyasi9/riddlers — boggle/README.md](https://github.com/reallyasi9/riddlers/blob/d945efbe03914899aedbdf2c200dadb2b1cff896/boggle/README.md): FiveThirtyEight official-linked score/adjacency quote.
- [an-array-of-english-words@2.0.0](https://registry.npmjs.org/an-array-of-english-words/-/an-array-of-english-words-2.0.0.tgz): Full English word list (MIT).
- [an-array-of-spanish-words@2.0.0](https://registry.npmjs.org/an-array-of-spanish-words/-/an-array-of-spanish-words-2.0.0.tgz): Full Spanish word list (MIT).
- [wordlist-english@1.2.1](https://registry.npmjs.org/wordlist-english/-/wordlist-english-1.2.1.tgz): Optional SCOWL≤70 intersection; wrapper MIT, bundled word data uses its SCOWL Copyright notice.
- [hermitdave/FrequencyWords — content/2018/es/es_50k.txt](https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b560de45753a5ea01069454e72e9aa541c6/content/2018/es/es_50k.txt): Spanish frequency input; content CC-BY-SA-4.0, code MIT, attributions/notices retained.
- [hermitdave/FrequencyWords — LICENSE](https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b560de45753a5ea01069454e72e9aa541c6/LICENSE): Code licence; upstream README content/code distinction separately retained in content SOURCES.
- [naughty-words — 1.2.0](https://registry.npmjs.org/naughty-words/-/naughty-words-1.2.0.tgz): Existing family filter word list; CC-BY-4.0 attribution retained.

Later actually read primary sources: [Hasbro Boggle](https://www.hasbro.com/common/instruct/Boggle.pdf), two scanned pages visually inspected, 229431 bytes; [Winning Moves Big Boggle](https://winning-moves.com/images/bigboggle_rules.pdf), four pages of extracted text read, 230622 bytes. Their shared Hasbro/Parker ancestry is explicit, not two independent physical-box observations. Only facts, URLs and digests are published; commercial PDFs/art/logos remain private. Independent fallback evidence above still supplies the existing cross-checks.

Pinned installed runtime/build-package notices were inspected locally and included in HTML credits:

- [react@18.3.1](https://registry.npmjs.org/react/-/react-18.3.1.tgz): installed MIT notice retained in start/research/licences and the standalone page.
- [react-dom@18.3.1](https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz): installed MIT notice retained in start/research/licences and the standalone page.
- [zod@3.25.76](https://registry.npmjs.org/zod/-/zod-3.25.76.tgz): installed MIT notice retained in start/research/licences and the standalone page.
- [three@0.171.0](https://registry.npmjs.org/three/-/three-0.171.0.tgz): installed MIT notice retained in start/research/licences and the standalone page.
