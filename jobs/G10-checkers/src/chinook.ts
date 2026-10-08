import type {Piece,Side} from './types.js';
import {legalMoves} from './moves.js';
type Outcome=-1|0|1;
interface Marker {ordinal:number;byte:number}
interface Slice {key:string;defaultValue:Outcome;uniform:Outcome|null;markers:Marker[];endByte:number;endOrdinal:number}
export interface ChinookLocation {slice:string;ordinal:number}
export interface ChinookDatabase {
  probe(board:readonly Piece[],side:Side):Outcome|null;
  locate(board:readonly Piece[],side:Side):ChinookLocation|null;
  coverage():{maximumPieces:6;slices:number;bytes:number;scope:string};
}
const runLengths=Object.freeze([10,15,20,25,30,40,50,60,100,200,400,800,1600]);
function binomials(){const rows:number[][]=[];for(let n=0;n<=32;n++){const row:number[]=[];for(let k=0;k<=6;k++)row.push(k===0?1:k>n?0:k===n?1:rows[n-1][k-1]+rows[n-1][k]);rows.push(Object.freeze(row) as unknown as number[]);}return Object.freeze(rows);}
const combinations=binomials();
const choose=(n:number,k:number)=>k<0||n<0||k>n||k>6?0:combinations[n][k];
const colex=(squares:readonly number[])=>squares.reduce((sum,square,index)=>sum+choose(square,index+1),0);
const symbol=(value:string):Outcome=>value==='+'?1:value==='-'?-1:0;

// Count white placements while summing a colex prefix of black placements.
// Partitioning the remaining black squares by the white-region boundary
// avoids an enumerated mutable secondary-index cache.
function weighted(lowerSquares:number,remaining:number,fixed:readonly number[],whiteThreshold:number,whiteCount:number):number{
  const high=Math.max(0,lowerSquares-whiteThreshold),low=lowerSquares-high;
  const whiteAvailable=32-whiteThreshold-fixed.filter(square=>square>=whiteThreshold).length;
  let total=0;for(let hits=0;hits<=remaining;hits++)total+=choose(high,hits)*choose(low,remaining-hits)*choose(whiteAvailable-hits,whiteCount);
  return total;
}
function pawnPrefix(black:readonly number[],whiteCount:number,blackRank:number,whiteRank:number):number{
  if(!black.length)return 0;
  const upper=32-4*(whiteRank+1),lower=32-4*whiteRank;
  const value=(threshold:number)=>{
    let prefix=0;for(let i=0;i<black.length;i++)prefix+=weighted(black[i],i+1,black.slice(i+1),threshold,whiteCount);
    return prefix-weighted(4*blackRank,black.length,[],threshold,whiteCount);
  };
  return whiteCount?value(upper)-value(lower):colex(black)-choose(4*blackRank,black.length);
}
export function createChinookDatabase(source:Readonly<Uint8Array>,indexText:string):ChinookDatabase{
  const bytes=Uint8Array.from(source),slices=new Map<string,Slice>();let current:Slice|null=null;
  for(const line of indexText.split(/\r?\n/)){
    if(!line.trim())continue;
    const header=/^BASE([0-6])([0-6])([0-6])([0-6])\.([0-6])([0-6]) ([=+-])([=+-])?$/.exec(line.trim());
    if(header){
      if(current&&current.uniform===null&&(!current.markers.length||current.endByte<0))throw new RangeError('Incomplete database slice');
      const counts=header.slice(1,5).map(Number),ranks=header.slice(5,7).map(Number),total=counts.reduce((a,b)=>a+b,0);
      if(total<2||total>6||counts[0]+counts[2]===0||counts[1]+counts[3]===0||(!counts[2]&&ranks[0]!==0)||(!counts[3]&&ranks[1]!==0))throw new RangeError('Invalid database material');
      const key=counts.join('')+'.'+ranks.join('');if(slices.has(key)||header[8]&&header[7]!==header[8])throw new RangeError('Invalid database header');
      current={key,defaultValue:symbol(header[7]),uniform:header[8]?symbol(header[8]):null,markers:[],endByte:-1,endOrdinal:-1};slices.set(key,current);continue;
    }
    if(!current||current.uniform!==null)throw new RangeError('Unexpected database index line');
    const endpoint=/^([SE])\s*(\d+)\s+(\d+)\/(\d+)$/.exec(line.trim()),block=/^\.\s*(\d+)\s+(\d+)$/.exec(line.trim());
    if(endpoint){const ordinal=Number(endpoint[2]),byte=Number(endpoint[3])*1024+Number(endpoint[4]);if(!Number.isSafeInteger(ordinal)||!Number.isSafeInteger(byte)||Number(endpoint[4])>=1024||byte>bytes.length)throw new RangeError('Invalid database endpoint');
      if(endpoint[1]==='S'){if(current.markers.length||ordinal!==0||byte>=bytes.length)throw new RangeError('Invalid database start');current.markers.push({ordinal,byte});}
      else{const previous=current.markers.at(-1);if(!previous||current.endByte>=0||byte<=previous.byte||ordinal<=previous.ordinal)throw new RangeError('Invalid database end');current.endByte=byte;current.endOrdinal=ordinal;}
    }else if(block){const ordinal=Number(block[1]),byte=Number(block[2])*1024,previous=current.markers.at(-1);if(!previous||current.endByte>=0||!Number.isSafeInteger(ordinal)||ordinal<=previous.ordinal||byte<=previous.byte||byte>=bytes.length)throw new RangeError('Invalid database block');current.markers.push({ordinal,byte});}
    else throw new RangeError('Invalid database index syntax');
  }
  if(!slices.size||current&&current.uniform===null&&current.endByte<0)throw new RangeError('Incomplete database');
  function locate(board:readonly Piece[],side:Side):ChinookLocation|null{
    if(board.length!==32||(side!==1&&side!==-1)||board.some((piece,square)=>!Number.isInteger(piece)||Math.abs(piece)>2||(piece===1&&square<4)||(piece===-1&&square>=28)))return null;
    const bp:number[]=[],wp:number[]=[],bk:number[]=[],wk:number[]=[];
    for(let square=0;square<32;square++){const piece=board[square];if(!piece)continue;const target=side===1?(31-square)^3:square^3;
      (Math.sign(piece)===side?(Math.abs(piece)===1?bp:bk):(Math.abs(piece)===1?wp:wk)).push(target);
    }
    for(const group of [bp,wp,bk,wk])group.sort((a,b)=>a-b);
    const total=bp.length+wp.length+bk.length+wk.length;if(total>6||!bp.length&&!bk.length||!wp.length&&!wk.length)return null;
    const br=bp.length?Math.floor(bp.at(-1)!/4):0,wr=wp.length?Math.floor((31-wp[0])/4):0;
    const key=''+bk.length+wk.length+bp.length+wp.length+'.'+br+wr,slice=slices.get(key);if(!slice)return null;
    const reversed=wp.map(square=>31-square-bp.filter(black=>black>square).length).sort((a,b)=>a-b);
    const firstWhite=wp.length?choose(4*wr-bp.filter(square=>square>=32-4*wr).length,wp.length):0;
    const pair=pawnPrefix(bp,wp.length,br,wr)+colex(reversed)-firstWhite;
    const occupied=[...bp,...wp],blackKing=bk.map(square=>square-occupied.filter(other=>other<square).length);
    const whiteOccupied=[...occupied,...bk],whiteKing=wk.map(square=>square-whiteOccupied.filter(other=>other<square).length);
    const rangeBK=choose(32-bp.length-wp.length,bk.length),rangeWK=choose(32-bp.length-wp.length-bk.length,wk.length);
    const ordinal=(pair*rangeBK+colex(blackKing))*rangeWK+colex(whiteKing);
    return Number.isSafeInteger(ordinal)&&ordinal>=0&&(slice.uniform!==null||ordinal<slice.endOrdinal)?{slice:key,ordinal}:null;
  }
  function probe(board:readonly Piece[],side:Side):Outcome|null{
    const location=locate(board,side);if(!location)return null;
    if(legalMoves(board,'american',side)[0]?.captures.length||legalMoves(board,'american',-side as Side)[0]?.captures.length)return null;
    const slice=slices.get(location.slice)!;if(slice.uniform!==null)return slice.uniform;
    let low=0,high=slice.markers.length;while(low+1<high){const mid=(low+high)>>>1;if(slice.markers[mid].ordinal<=location.ordinal)low=mid;else high=mid;}
    const marker=slice.markers[low],stop=Math.min(slice.endByte,slice.markers[low+1]?.byte??bytes.length);let ordinal=marker.ordinal;
    for(let offset=marker.byte;offset<stop;offset++){
      const code=bytes[offset],length=code>242?runLengths[code-243]:5;
      if(location.ordinal<ordinal+length){if(code>242)return slice.defaultValue;const value=Math.floor(code/(3**(4-(location.ordinal-ordinal))))%3;return value===2?-1:value as 0|1;}
      ordinal+=length;
    }
    return null;
  }
  return Object.freeze({probe,locate,coverage:()=>({maximumPieces:6 as const,slices:slices.size,bytes:bytes.length,scope:'American board-plus-side WDL for all2–6 material splits; raw data excludes captures for either side'})});
}
