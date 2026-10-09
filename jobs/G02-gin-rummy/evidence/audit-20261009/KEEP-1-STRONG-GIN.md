# First renewed KEEP audit after accepted availability repair

The original full G02 job passed at72d0f3f4ad4f6b70a8ac6b0ed81121300aa54c1f,
run37879398204/job113655347858. Its complete867-entry native log and actual
official13-member ZIP were independently validated at03:38:27.480158Z,
all86 guards unchanged. All55 tests, six1000-game replay matrices, both2000-game
leagues,26 compiled mutants and original414-file/live35-source integrity passed.
README.md, binding RULES.md/JOBS.md and the G02 rule/bot/scoring code were reread.

Five ranked weaknesses in that accepted program:

1. **A guaranteed Gin loses to an ordinary knock in Strong's discard ranking.**
   The complete valid52-card fixture in strong-gin-unfixed.json gives Strong
   a1-point knock while a legal22-point Gin is available. Its public pickup
   caution outweighs zero deadwood. This is the worst material player issue.
2. **The bot's winning finish is not directly asserted.** Existing end-rule
   tests prove Gin scoring but do not force Strong to select it. Random game
   leagues did not catch the accepted fixture above. Add a failure on current
   actual code before repairing it.
3. **Guaranteed Gin's scoring advantage lacks an adversarial regression.**
   A normal knock permits layoffs and can be undercut; Gin keeps the defender's
   no-layoff deadwood and earns a positive bonus. Verify actual legal alternative
   outcomes across disjoint defenders/profiles, rather than claiming global bot
   strength from one example.
4. **Priority boundaries need targeted coverage.** Immediate-return prohibition,
   legal eleven-card Big Gin, Oklahoma limits/doubling and rotation counts must
   retain their behavior. Existing reducer tests cover rules but not this
   proposed bot-ranking repair. This is a verification gap, not a second proven
   scoring defect.
5. **The narrow change needs a behavior-preservation baseline.** Existing
   secrecy tests are broad but do not compare30,000 observed bot choices with
   the accepted program on10,000 generated observations with no Gin opportunity.
   Record that baseline before changing code and retain hidden-info controls.

Fix only the first ranked defect: lexicographically prefer an eligible zero-
deadwood discard. Preserve the existing heuristic/tie ordering within both
groups, legal filtering, Big Gin's existing earlier branch, seeded RNG and all
printed scoring. The four other observations define meaningful regression
checks for that repair; they are not claimed as four player fixes. The renewed
streak remains0 until its actual new full acceptance and measured gain are read.
