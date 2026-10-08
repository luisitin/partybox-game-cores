# International endgame data and dictionary terms

Position outcomes are Ed Gilbert's Kingsrow International databases. His
2021-01-15 author statement says the databases are available without
restrictions, including WLD through eight pieces:
https://damforum.nl/bb3/viewtopic.php?t=8341

Original payload download page:
http://edgilbert.org/InternationalDraughts/endgame_database_downloads.htm
Public installer folder:
https://mega.nz/folder/vRhFgSjR#bqlaniDcxC65fZWpnovROA

The decompression dictionary is derived from eygilbert/egdb_intl at pinned
commit eacf10797e8f6c81d618caa7af1eba05df139ac7, distributed under the Boost
Software License 1.0. Preserve the complete BOOST-LICENSE.txt and attached
source/dictionary provenance. The position-data grant is separate from the
driver/dictionary licence. Our production reader and independent tests are
original MIT code; no original engine/driver source is bundled.

Only the actual two-piece payload is installed at this checkpoint. The
constructor/rank supports up to six; that is not a claim that missing
three-to-six outcomes are present, or that board-only WLD proves a win
under accumulated repetition and move-count history.
