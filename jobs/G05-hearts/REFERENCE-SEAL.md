# Independent reference seal

Written before any production game/scoring helper. It imports no production
module: scoring identifies every penalty card directly, legal moves filter
the raw encoded hand, and trick winners sort only the led suit.

SHA256: bba8c397fd1992273e0e14229d6955ad29062d36010d9327905e94866228f757

The differential suite must check at least10,000 random cases. Keep this file
unchanged while developing production. Both implementations were authored in
this chat; independent algorithm/code, not a claim of separate authors.
