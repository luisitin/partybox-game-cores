# G08 sources

Live receipts with pinned commits, byte counts and SHA-256: [source-receipts.json](start/research/source-receipts.json). Facts only are taken from the game repositories; no third-party code, art, dictionary or media is copied.

- Princeton-style BoggleBoard (BIG and MASTER tables), independently compared with pf-boggle, Taylor Scafe and plettj. BIG agrees with the owner; Master/Deluxe differs on CCNSTW, DDLNOR, DHHNOT and HIPRRY. Shared BGG ancestry of pf/plett/Taylor is explicit: they are not three independent physical-box observations.
- pf-boggle's table links Hasbro 4x4/5x5 manuals; Taylor's scoring and the FiveThirtyEight quote agree on 1,1,2,3,5,11. Clifford Thompson and the independent classroom descriptions corroborate diagonal adjacency/no reuse. Boggle Party and Taylor corroborate duplicate cancellation. Variant disagreements are in CONFLICTS.md.
- `an-array-of-english-words@2.0.0`, `an-array-of-spanish-words@2.0.0`: live npm tarballs, MIT; existing owner packs retained until regeneration verification.
- `wordlist-english@1.2.1`: live npm tarball, wrapper MIT, bundled SCOWL Copyright governs word data. SCOWL <=70 intersection is optional; 70 itself includes uncommon words, so it is a smaller dictionary rather than a promise that every word is familiar.
- Existing Spanish bot vocabularies cite FrequencyWords/CC-BY-SA-4.0; fresh pinned upstream verification and full licence notices still pending.
- Owner source, original CSS, five GLB models and film source: preserved baseline hashes in start/research/original-files.json. No owner model, art, film look or name changes.

Canonical Hasbro and Winning Moves requests were denied by the managed HTTPS proxy; they are candidates, not read evidence. RULES.md permits the live GitHub/registry fallbacks. Physical-box edition labels remain secondary reports; re-verify with the manufacturer when reachable.
