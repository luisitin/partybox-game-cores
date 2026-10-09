import type {ScoreSeat,ScoreResult} from './scoring.ts';
import type {Play} from './cards.ts';
/** Independent imperative ledger: no production scoring/card helper imports. */
export function ledger(seats:readonly ScoreSeat[],startingScore:number,carried:number,bonus:number,countNil:boolean):ScoreResult{
 let bid=0,won=0,normalWon=0,nilWon=0,nil=0,normalSeats=0;
 for(const seat of seats){
  won+=seat.won;
  if(seat.bid.kind==='number'){bid+=seat.bid.value;normalWon+=seat.won;normalSeats++;}
  else {nilWon+=seat.won;let award=bonus;if(seat.bid.kind==='blind')award+=bonus;nil+=seat.won===0?award:-award;}
 }
 const contractTricks=normalWon+(countNil?nilWon:0);let contract=0,newBags=0;
 if(normalSeats){if(contractTricks<bid)contract=-10*bid;else {contract=10*bid;newBags=contractTricks-bid;}}
 if(!countNil||normalSeats===0)newBags+=nilWon;
 let bags=carried,score=startingScore+contract+nil,penalty=0;
 for(let i=0;i<newBags;i++){score++;bags++;if(bags===10){bags=0;score-=100;penalty+=100;}}
 return {bid,won,contractTricks,contract,nil,newBags,penalty,score,bags};
}
/** Independent max-key ordering over the original led suit and trump. */
export function orderedWinner(trick:readonly Play[]):Play|null{
 if(trick.length===0)return null;
 const led=Math.trunc(trick[0]!.card/13);
 const key=(play:Play)=>{const color=Math.trunc(play.card/13);return (color===3?1000:color===led?100:0)+play.card%13;};
 let best=trick[0]!;
 for(let i=1;i<trick.length;i++)if(key(trick[i]!)>key(best))best=trick[i]!;
 return {playerId:best.playerId,card:best.card};
}
