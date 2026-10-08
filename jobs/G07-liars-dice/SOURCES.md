# Sources and originality

Research on 2026-10-08: six searches, 36 returned results reviewed, twelve distinct
URL extractions read. `evidence/research-sources.json` records extraction sizes
and SHA-256 hashes. These are fetched text hashes, not origin HTTP responses;
the Soar paper extraction was capped at 40,000 body characters. Full downloaded
copyrighted text stays in ignored `.work/`, never in the public delivery.

| ID | URL | Facts or ideas used |
| --- | --- | --- |
| Z | https://www.zygomatic-games.com/wp-content/uploads/2019/09/perudoclassic_en_rules_compressed.pdf | Publisher's modern five-dice rules, wild ones, half/double raises, dudo, palifico, calza. |
| P | https://cdn.1j1ju.com/medias/f4/4f/09-perudo-rulebook.pdf | Older publisher edition; experienced one-die exemption, interrupt calza, initial high die. |
| B | https://en.doc.boardgamearena.com/Gamehelpdudo | Independently authored online implementation: strict palifico, visible counts option, caller starts after calza. |
| T | https://tallyandtable.com/liars-dice/ | Independent playable implementation; ordinary raises, nonwild option, strict palifico, optional calza restrictions. |
| W | https://en.wikipedia.org/wiki/Dudo | Folk variants: obliga, palofijo, palociego, pass and reroll variants; not normative. |
| N | http://cs.gettysburg.edu/~tneller/papers/acg2011.pdf | FSICFR research, information sets and strategy mixing; different simplified Dudo variant, no code copied. |
| S | https://web.stanford.edu/class/cs109l/unrestricted/assignments/assn1a/liarsdice.pdf | Independent probability derivation and early/late bluff strategy. |
| U | https://www.ucd.ie/mathstat/t4media/8.%20Liar's%20dice%20and%20binomial%20random%20variables.pdf | Independent binomial derivation and challenge examples; its spot-on rules differ. |
| L | https://raw.githubusercontent.com/SoarGroup/website-downloads/main/pubs/aaai2011fss_dice.pdf | Probability, expected-count heuristics and opponent modeling; no claim to match the paper's agents. |
| A | https://github.com/kamdolla/liars-dice | Readme of open-source student probability-agent project; approach reviewed, no code copied or dependency used. |
| G | https://gamerules.com/rules/perudo/ | Independently authored strict palifico, calza exclusions, recovery cap and caller-start explanation; second corroboration. |
| D | https://dudodice.com/rules | Independent implementation with conflicting ones-switch threshold and palifico/calza variants; differences rejected explicitly. |

Independent corroboration: ordinary turns/counting/dudo use Z+B and Z+T;
strict palifico uses B+T, with edition differences confirmed Z+P;
conditional binomial probabilities use S+U, with independent executable oracle;
calza exclusions/caller-start/recovery cap also use G+T/B. The optional
experienced exemptions are edition-specific publisher wordings, not claimed
independently corroborated universal rules; the chosen strict profile has B+T+G.
P and Z are distinct editions of the same commercial rules, not independently
authored corroboration. Other mirrors of P were excluded. T's quotation of W
is not counted as independent evidence for that quotation.

All prose, CSS, dice SVG and application code are newly authored. No publisher
text, artwork, logos, audio, or assets are embedded. Game facts are paraphrased.
Code is MIT under the repository license. Bundled Zod's MIT notice is retained.
Historical research failures are preserved under `evidence/historical-blocker/`;
they do not describe today's successful access. No game uses runtime networking.
