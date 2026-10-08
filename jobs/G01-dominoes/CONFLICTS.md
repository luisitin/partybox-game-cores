# Choices requiring attention

abw333's live code awards all remaining pips to a winning partnership, including
its partner's remaining hand. The shipped default awards opposing-team pips;
the `teamPoints=all` setting selects the live-source variant. Both are explicit
in the UI and tested. Pagat and Wikipedia later corroborated the general Draw/Block family; the
exact stable opener tie break and later tied-round rotation remain selected
house conventions. Do not describe one regional rule as universal.

The strong bot uses win-prioritized adversarial minimax, whereas abw333 maximizes
signed final pip scores. Those objectives differ: emptying a hand for few pips
can be preferable here. Draw lookahead now samples unknown stock and models forced draws and reserve.
Its shallow horizon and incomplete inference from past actions remain strategy
approximations; it never uses the actual stock order.

Live source recovery: Pagat's main Draw convention deals 7/7/6, allows voluntary
drawing, reserves two stock tiles and rotates the leader. Current selected
Draw uses Block-sized 7/5/5, must-play, zero reserve and winner-leads conventions.
This is an explicit regional/house-rule combination, not the page's default.
Pagat lists these dimensions as variants. Its Block deal 7/5/5 matches this
core. The Draw deal setting now selects either7/5/5 or7/7/6, with partners always
receiving seven. Wikipedia's rules section flags its own verification gaps and uses
other tie/stock conventions; do not silently override the stronger specific
rules descriptions. The requested 150/250 targets are intentional game settings,
not a claim that Pagat's page prescribes those targets.
