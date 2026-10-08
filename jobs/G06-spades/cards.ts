export const suits=['♣','♦','♥','♠'] as const;
export const rank=(card:number)=>card%13+2;
export const suit=(card:number)=>Math.floor(card/13);
export const deck:readonly number[]=Object.freeze(Array.from({length:52},(_,i)=>i));
export const cardName=(card:number)=>`${rank(card)>10?['J','Q','K','A'][rank(card)-11]:rank(card)}${suits[suit(card)]}`;
export interface Play {playerId:string;card:number;}
export function legalCards(hand:readonly number[],trick:readonly Play[],broken:boolean,forced:number|null=null):number[]{
 if(!trick.length){if(forced!==null&&hand.includes(forced))return [forced];const normal=hand.filter(c=>suit(c)!==3);return broken||!normal.length?[...hand]:normal;}
 const followed=hand.filter(c=>suit(c)===suit(trick[0]!.card));return followed.length?followed:[...hand];
}
export function winningPlay(trick:readonly Play[]):Play|null{
 if(!trick.length)return null;let winner=trick[0]!;
 for(const play of trick.slice(1))if((suit(play.card)===3&&suit(winner.card)!==3)||(suit(play.card)===suit(winner.card)&&rank(play.card)>rank(winner.card)))winner=play;
 return {...winner};
}
