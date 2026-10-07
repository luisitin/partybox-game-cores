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
