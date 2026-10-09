"""Test-only bridge to dominoes 6.1.0. No source code from the package copied.
Only own hand, public played tiles/counts/endpoints/pass constraints reach Python.
"""
import sys,json,random
import dominoes

PAIRS=[(a,b) for a in range(7) for b in range(a,7)]
INDEX={d:i for i,d in enumerate(PAIRS)}
class ObservedGame(dominoes.Game):
    def missing_values(self):
        return [{n for n in range(7) if mask & (1<<n)} for mask in self.masks]

for line in sys.stdin:
    request=json.loads(line);o=request['observation'];random.seed(request['seed'])
    moves=o['legal']
    if len(moves)<=1 or moves[0]['type']!='play':
        print(json.dumps(moves[0] if moves else None),flush=True);continue
    unknown=[i for i in range(28) if i not in o['hand'] and i not in o['played']]
    assert sum(o['counts'])==len(unknown)+len(o['hand']), 'baseline requires zero-stock partnerships'
    hands=[];offset=0
    for seat,count in enumerate(o['counts']):
        ids=o['hand'] if seat==o['seat'] else unknown[offset:offset+count]
        if seat!=o['seat']:offset+=count
        hands.append(dominoes.Hand([dominoes.Domino(*PAIRS[t]) for t in ids]))
    ends=o['ends'];board=dominoes.SkinnyBoard() if ends is None else dominoes.SkinnyBoard(*ends,len(o['played']))
    legal=tuple((dominoes.Domino(*PAIRS[m['tile']]),m['side']=='left') for m in moves)
    g=ObservedGame(board,hands,[],o['seat'],legal,o['seat'],None);g.masks=o['missed']
    # The live package's documented greedy opening and 16-sample exact PIMC
    # endgame policy. Omniscient hands are never supplied.
    if sum(o['counts'])<=9:
        dominoes.players.probabilistic_alphabeta(sample_size=16)(g)
    else:
        dominoes.players.bota_gorda(g)
    d,left=g.valid_moves[0]
    pair=tuple(sorted((d.first,d.second)))
    print(json.dumps({'type':'play','tile':INDEX[pair],'side':'left' if left else 'right'}),flush=True)
