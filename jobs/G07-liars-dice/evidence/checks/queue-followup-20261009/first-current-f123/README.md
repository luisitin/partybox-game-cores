# First genuine changed-source run — failure retained

Head f123cd8b9c0cc1aa0baaa4517e98b26f8e641577; original run37913827444,
verify113765092874, official artifact11608627454. The entire immutable official
ZIP and lossless full native log are saved here. The whole workflow FAILED;
passing runtime checks do not change that conclusion. The later corrected
historical binding must pass its own whole original workflow.

The ZIP reader's semantic/source/clock/frame acceptance is unchanged. Its only
metadata correction says gameplayUnchanged=false for the real init change;
reader-provenance.json and the exact one-line diff document this distinction.
Recreate `source/` by extracting this genuine ZIP, then run current-zip-reader.py
with the matching f123 checkout, physical pinned build and official IDs/digest.
It always re-reads every ZIP entry and checks any extracted cache byte for byte.

The whole143,417-byte UTF-8 native log is `whole-original-native.txt.gz`; gzip is
lossless, with a deterministic header. Native receipt records its actual SHA,
210 passing tests,25 genuine compiled assertion kills,91 individual logged
checks matching the full94-row report, and the final historical-page assertion.
Actual first403 and same-artifact transfer recovery are retained. Neither a
fresh download reference nor saved-proof inspection ran a timing sampler again.
