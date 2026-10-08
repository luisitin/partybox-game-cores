export interface Bid {kind:'number'|'nil'|'blind';value:number;}
export interface ScoreSeat {bid:Bid;won:number;}
export interface ScoreResult {bid:number;won:number;contractTricks:number;contract:number;nil:number;newBags:number;penalty:number;score:number;bags:number;}
/** Award contracts and nil independently; carry every complete ten-bag penalty. */
export function scoreSide(seats:readonly ScoreSeat[],before:number,beforeBags:number,nilValue=100,failedNilCounts=false):ScoreResult{
 const normal=seats.filter(p=>p.bid.kind==='number'),nils=seats.filter(p=>p.bid.kind!=='number');
 const bid=normal.reduce((n,p)=>n+p.bid.value,0),won=seats.reduce((n,p)=>n+p.won,0),nilWon=nils.reduce((n,p)=>n+p.won,0);
 const contractTricks=normal.reduce((n,p)=>n+p.won,0)+(failedNilCounts?nilWon:0);
 const made=contractTricks>=bid,contract=normal.length?(made?10*bid:-10*bid):0;
 const extra=normal.length&&made?contractTricks-bid:0;
 const newBags=extra+(!failedNilCounts||!normal.length?nilWon:0);
 const nil=nils.reduce((n,p)=>n+(p.won===0?1:-1)*nilValue*(p.bid.kind==='blind'?2:1),0);
 const penalty=100*Math.floor((beforeBags+newBags)/10),bags=(beforeBags+newBags)%10;
 return {bid,won,contractTricks,contract,nil,newBags,penalty,score:before+contract+nil+newBags-penalty,bags};
}
