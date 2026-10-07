# Choices requiring attention

abw333's live code awards all remaining pips to a winning partnership, including
its partner's remaining hand. The shipped default awards opposing-team pips;
the `teamPoints=all` setting selects the live-source variant. Both are explicit
in the UI and tested. The claimed general draw/individual rules are knowledge
fallbacks, not independently verified official rules. Read official sources
when web access permits; do not silently describe one regional rule as universal.

The strong bot uses win-prioritized adversarial minimax, whereas abw333 maximizes
signed final pip scores. Those objectives differ: emptying a hand for few pips
can be preferable here. Draw lookahead approximates future drawing as blocked
play; this is a disclosed strategy limitation, not a reducer rule change.

Live source recovery: Pagat's main Draw convention deals 7/7/6, allows voluntary
drawing, reserves two stock tiles and rotates the leader. Current selected
Draw uses Block-sized 7/5/5, must-play, zero reserve and winner-leads conventions.
This is an explicit regional/house-rule combination, not the page's default.
Pagat lists these dimensions as variants. Its Block deal 7/5/5 matches this
core. The setting suite should make the Draw deal convention selectable during
KEEP GOING. Wikipedia's rules section flags its own verification gaps and uses
other tie/stock conventions; do not silently override the stronger specific
rules descriptions. The requested 150/250 targets are intentional game settings,
not a claim that Pagat's page prescribes those targets.
