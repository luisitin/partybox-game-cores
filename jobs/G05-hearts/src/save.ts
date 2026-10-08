import {object,number,array,string,literal,enum as enumeration} from 'zod';
import {stateSchema} from './schema.js';
import {deckFor,legalCards,passingOffset,trickWinner} from './rules.js';
import type {HeartsState} from './types.js';
export type Mode='human'|'easy'|'normal'|'sharp';
export interface SeatPref{name:string;mode:Mode}
export interface SavedGame{version:1;savedAt:number;state:HeartsState;seats:SeatPref[]}
export const saveSchema=object({version:literal(1),savedAt:number().int().min(0).max(Number.MAX_SAFE_INTEGER),state:stateSchema,seats:array(object({name:string().max(24),mode:enumeration(['human','easy','normal','sharp'])}).strict()).min(3).max(6)}).strict();
const same=(a:readonly number[],b:readonly number[]):boolean=>{const x=[...a].sort((i,j)=>i-j),y=[...b].sort((i,j)=>i-j);return x.length===y.length&&x.every((c,i)=>c===y[i]);};
/** Snapshot data only: holding a saved clock never mutates the live game. */
export function makeSave(s:HeartsState,seats:readonly SeatPref[],at:number):SavedGame{
 const phase=s.phase.id==='done'||s.phase.paused?{...s.phase}:{...s.phase,paused:{at}};
 return {version:1,savedAt:at,state:{...s,phase},seats:seats.map(p=>({...p}))};
}
/** Validate only snapshots this standalone table can emit; reject corrupt data. */
export function parseSave(value:unknown):SavedGame|null{
 const checked=saveSchema.safeParse(value);if(!checked.success)return null;
 // Canonical JSON eliminates optional undefined and negative-zero values.
 const record=JSON.parse(JSON.stringify(checked.data)) as SavedGame;
 const s=record.state,n=s.order.length,ids=new Set(s.order),deck=deckFor(n,s.settings.threeDeck);
 if(record.seats.length!==n||s.left.length||s.dealer>=n||s.order.some((id,i)=>id!==`p${i}`)||!ids.has(s.actor))return null;
 for(const map of [s.players,s.hands,s.captured,s.scores])if(Object.keys(map).length!==n||s.order.some(id=>!Object.hasOwn(map,id)))return null;
 for(const map of [s.passes,s.sent,s.received])if(Object.keys(map).some(id=>!ids.has(id)))return null;
 if(s.order.some((id,i)=>s.players[id]!.id!==id||!s.players[id]!.connected||Boolean(s.players[id]!.bot)!==(record.seats[i]!.mode!=='human')))return null;
 if(s.settings.target%25||s.passOffset!==passingOffset(s.handNumber,n,s.settings.noPass)||s.phase.deadline!==null&&s.phase.deadline<s.phase.startedAt)return null;
 const remaining=Object.values(s.hands).flat(),played=s.played.map(p=>p.card);
 if(!same([...remaining,...played],deck)||new Set([...remaining,...played]).size!==deck.length)return null;
 if(s.played.some(p=>!ids.has(p.playerId))||s.trick.some(p=>!ids.has(p.playerId))||s.lastTrick.some(p=>!ids.has(p.playerId)))return null;
 const expected=Object.fromEntries(s.order.map(id=>[id,[] as number[]]));
 for(let i=0;i<s.played.length;i+=n){const trick=s.played.slice(i,i+n);if(new Set(trick.map(p=>p.playerId)).size!==trick.length)return null;if(trick.length===n)expected[trickWinner(trick)!]!.push(...trick.map(p=>p.card));}
 if(s.order.some(id=>!same(s.captured[id]!,expected[id]!)||s.hands[id]!.length!==deck.length/n-s.played.filter(p=>p.playerId===id).length))return null;
 if(s.lastWinner!==null&&!ids.has(s.lastWinner)||s.phase.id==='trick'&&(s.lastWinner===null||s.trick.length!==n))return null;
 if(s.phase.id==='hand'&&(!s.handScored||remaining.length)||s.phase.id==='done'&&!s.handScored)return null;
 if(s.phase.id==='play'&&(!s.hands[s.actor]!.length||!legalCards(s.hands[s.actor]!,s.trick,s.trickNumber===0,s.heartsBroken,s.opening).length))return null;
 if(s.phase.id==='pass'&&(s.passOffset===0||s.played.length||s.order.some(id=>Object.hasOwn(s.passes,id)&&(s.passes[id]!.length!==3||new Set(s.passes[id]).size!==3||s.passes[id]!.some(c=>!s.hands[id]!.includes(c))))))return null;
 if(s.history.some(h=>h.moon!==null&&!ids.has(h.moon)||Object.keys(h.points).length!==n||s.order.some(id=>!Object.hasOwn(h.points,id))))return null;
 return record;
}
