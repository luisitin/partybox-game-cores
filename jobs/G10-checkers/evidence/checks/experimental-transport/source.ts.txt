import type {Piece,Side} from './types.js';
import {legalMoves} from './moves.js';

export interface InternationalFile {name:string;data:Uint8Array;indexText:string}
export interface InternationalEncodedFile {name:string;byteLength:number;chunks:readonly string[];indexText:string}
export interface InternationalBlockFile {name:string;byteLength:number;blocks:readonly {offset:number;data:Uint8Array}[];indexText:string}
interface Bytes {length:number;range:(start:number,end:number)=>Uint8Array}
interface IndexFile {name:string;bytes:Bytes;indexText:string}
interface Mark {ordinal:number;catalogue:number;permutation:number}
interface Slice {bytes:Bytes;start:number;end:number;uniform:-1|0|1|null|undefined;marks:Mark[];positions:number}
const blockSize=4096,subsliceSize=2**31;
const combinations=Object.freeze(Array.from({length:51},(_,n)=>Object.freeze(Array.from({length:7},(_,k)=>{
  if(k>n)return 0;let result=1;for(let i=1;i<=k;i++)result=result*(n-k+i)/i;return Math.round(result);
}))));
const choose=(n:number,k:number)=>n<0||k<0||k>6||n>50?0:combinations[n][k];
const colex=(cells:readonly number[])=>cells.reduce((sum,square,index)=>sum+choose(square,index+1),0);
const parts=(board:readonly Piece[])=>{
  const groups:{bm:number[];bk:number[];wm:number[];wk:number[]}={bm:[],bk:[],wm:[],wk:[]};
  for(let square=0;square<board.length;square++){const piece=board[square];if(piece===-1)groups.bm.push(square);else if(piece===-2)groups.bk.push(square);else if(piece===1)groups.wm.push(square);else if(piece===2)groups.wk.push(square);}return groups;
};
const materialSize=(bm:number,bk:number,wm:number,wk:number)=>{
  let men=0;for(let back=0;back<=Math.min(bm,5);back++)men+=choose(5,back)*choose(40,bm-back)*choose(45-bm+back,wm);
  return men*choose(50-bm-wm,bk)*choose(50-bm-wm-bk,wk);
};
function valid(board:readonly Piece[],side:Side):boolean{
  return Array.isArray(board)&&board.length===50&&(side===1||side===-1)&&board.every((piece,square)=>
    Number.isInteger(piece)&&piece>=-2&&piece<=2&&!(piece===1&&square<5)&&!(piece===-1&&square>=45));
}
export function internationalRank(source:readonly Piece[],side:Side){
  if(!valid(source,side))return null;
  let board=source,group=parts(board),black=group.bm.length+group.bk.length,white=group.wm.length+group.wk.length;
  if(black===0||white===0||black+white>6||black>5||white>5)return null;
  const reversed=white>black||(white===black&&(group.wk.length>group.bk.length||(group.wk.length===group.bk.length&&side===1)));
  if(reversed){board=source.map((_,square)=>-source[49-square] as Piece);side=-side as Side;group=parts(board);black=group.bm.length+group.bk.length;white=group.wm.length+group.wk.length;}
  const {bm,bk,wm,wk}=group,bmCount=bm.length,bkCount=bk.length,wmCount=wm.length,wkCount=wk.length;
  const back=bm.filter(square=>square<5),forward=bm.filter(square=>square>=5),backCount=back.length;
  let groupBase=0;
  for(let count=Math.min(bmCount,5);count>backCount;count--)groupBase+=choose(5,count)*choose(40,bmCount-count)*choose(45-bmCount+count,wmCount);
  const reversedWhite=wm.map(square=>49-square-bm.filter(other=>other>square).length).reverse();
  const men=groupBase+colex(back)+choose(5,backCount)*(colex(forward.map(square=>square-5))+choose(40,bmCount-backCount)*colex(reversedWhite));
  const occupied=[...bm,...wm].sort((a,b)=>a-b);
  const blackKing=colex(bk.map(square=>square-occupied.filter(other=>other<square).length));
  const occupiedWithKings=[...occupied,...bk].sort((a,b)=>a-b);
  const whiteKing=colex(wk.map(square=>square-occupiedWithKings.filter(other=>other<square).length));
  const index=whiteKing+choose(50-bmCount-wmCount-bkCount,wkCount)*(blackKing+choose(50-bmCount-wmCount,bkCount)*men);
  const positions=materialSize(bmCount,bkCount,wmCount,wkCount);
  if(!Number.isSafeInteger(index)||index<0||index>=positions)return null;
  const subslice=Math.floor(index/subsliceSize),ordinal=index%subsliceSize;
  const key=`BASE${bmCount},${bkCount},${wmCount},${wkCount},${subslice},${side===-1?'b':'w'}`;
  return {key,file:black+white<=5?'db'+(black+white):`db6-${bmCount}${bkCount}${wmCount}${wkCount}`,index,ordinal,subslice,positions,reversed,side,material:[bmCount,bkCount,wmCount,wkCount]};
}

export function createInternationalDatabase(sources:readonly InternationalFile[],dictionarySource:Uint8Array){
  return createDatabase(sources.map(source=>{
    if(!(source.data instanceof Uint8Array))throw new RangeError('Invalid International bytes');
    const data=new Uint8Array(source.data);
    return {name:source.name,indexText:source.indexText,bytes:{length:data.length,range:(start:number,end:number)=>data.subarray(start,end)}};
  }),dictionarySource);
}

export class MissingInternationalBlock extends Error {
  constructor(readonly file:string,readonly offset:number,readonly length:number){super('Missing International block '+file+':'+offset);this.name='MissingInternationalBlock';}
}

// Each supplied block is copied. Missing bytes are explicit and never decoded
// as a synthetic outcome; adapters may acquire them and restart a calculation.
export function createInternationalBlockDatabase(sources:readonly InternationalBlockFile[],dictionarySource:Uint8Array){
  return createDatabase(sources.map(source=>{
    if(!Number.isSafeInteger(source.byteLength)||source.byteLength<0||!Array.isArray(source.blocks))throw new RangeError('Invalid International block file');
    const blocks=new Map<number,Uint8Array>(),length=source.byteLength,name=source.name;
    for(const block of source.blocks){
      if(!Number.isSafeInteger(block.offset)||block.offset<0||block.offset%blockSize!==0||block.offset>=length||blocks.has(block.offset)||
        !(block.data instanceof Uint8Array)||block.data.length!==Math.min(blockSize,length-block.offset))throw new RangeError('Invalid International supplied block');
      blocks.set(block.offset,new Uint8Array(block.data));
    }
    return {name,indexText:source.indexText,bytes:{length,range:(start:number,end:number)=>{
      const offset=Math.floor(start/blockSize)*blockSize,block=blocks.get(offset);
      if(end>offset+blockSize)throw new RangeError('International block read crosses its boundary');
      if(!block)throw new MissingInternationalBlock(name,offset,Math.min(blockSize,length-offset));
      return block.subarray(start-offset,end-offset);
    }}};
  }),dictionarySource);
}

// Strings are immutable. Copying the chunk list preserves a defensive snapshot
// without allocating a second complete decoded database.
export function createInternationalEncodedDatabase(sources:readonly InternationalEncodedFile[],dictionarySource:Uint8Array){
  const digit=(code:number)=>code>=65&&code<=90?code-65:code>=97&&code<=122?code-71:code>=48&&code<=57?code+4:code===43?62:code===47?63:-1;
  return createDatabase(sources.map(source=>{
    if(!Number.isSafeInteger(source.byteLength)||source.byteLength<0||!Array.isArray(source.chunks))throw new RangeError('Invalid International encoded file');
    const chunks=[...source.chunks],starts:number[]=[];let encodedLength=0;
    for(let i=0;i<chunks.length;i++){
      const chunk=chunks[i];if(typeof chunk!=='string'||chunk.length===0||chunk.length%4!==0||
        !(i===chunks.length-1?/^[A-Za-z0-9+/]*(?:={1,2})?$/:/^[A-Za-z0-9+/]+$/).test(chunk))throw new RangeError('Invalid International encoded chunk');
      starts.push(encodedLength);encodedLength+=chunk.length;
    }
    const length=source.byteLength,last=chunks.at(-1)??'',padding=last.endsWith('==')?2:last.endsWith('=')?1:0;
    if(!Number.isSafeInteger(encodedLength)||encodedLength!==4*Math.ceil(length/3)||encodedLength/4*3-padding!==length)throw new RangeError('Invalid International encoded extent');
    if(padding&&((digit(last.charCodeAt(last.length-padding-1))&((1<<(padding===2?4:2))-1))!==0))throw new RangeError('Noncanonical International encoding');
    return {name:source.name,indexText:source.indexText,bytes:{length,range:(start:number,end:number)=>{
      const output=new Uint8Array(end-start);let chunkIndex=0;
      const first=Math.floor(start/3)*4;
      let upper=starts.length;while(chunkIndex+1<upper){const middle=Math.floor((chunkIndex+upper)/2);if(starts[middle]<=first)chunkIndex=middle;else upper=middle;}
      for(let byte=start;byte<end;){
        const character=Math.floor(byte/3)*4;
        while(chunkIndex+1<starts.length&&starts[chunkIndex+1]<=character)chunkIndex++;
        const chunk=chunks[chunkIndex],at=character-starts[chunkIndex];
        const a=digit(chunk.charCodeAt(at)),b=digit(chunk.charCodeAt(at+1)),c=digit(chunk.charCodeAt(at+2)),d=digit(chunk.charCodeAt(at+3));
        const triple=[a*4+(b>>4),(b&15)*16+((c<0?0:c)>>2),((c<0?0:c)&3)*64+(d<0?0:d)];
        for(let within=byte%3;within<3&&byte<end;within++)output[byte++-start]=triple[within];
      }
      return output;
    }}};
  }),dictionarySource);
}

function createDatabase(sources:readonly IndexFile[],dictionarySource:Uint8Array){
  if(!(dictionarySource instanceof Uint8Array)||dictionarySource.length!==61077)throw new RangeError('Invalid International v2 dictionary size');
  const dictionary=new Uint8Array(dictionarySource),view=new DataView(dictionary.buffer),runs=dictionary.subarray(51200);
  const lengths=Array.from({length:12800},(_,index)=>view.getUint16(index*2,true));
  const offsets=Array.from({length:12800},(_,index)=>view.getUint16(25600+index*2,true));
  for(let token=0;token<lengths.length;token++){
    let remaining=lengths[token],cursor=offsets[token];if(remaining===0)throw new RangeError('Zero International token extent');
    while(remaining>0){if(cursor+2>=runs.length||runs[cursor]>3)throw new RangeError('Invalid International value run');const count=runs[cursor+1]+256*runs[cursor+2];if(count===0)throw new RangeError('Zero International value run');remaining-=count;cursor+=3;}
  }
  const slices=new Map<string,Slice>(),names=new Set<string>();let totalBytes=0;
  const checkMark=(mark:Mark)=>{
    if(!Number.isSafeInteger(mark.ordinal)||mark.ordinal<0||mark.catalogue<0||mark.catalogue>=50||mark.permutation<0||mark.permutation>255)throw new RangeError('Invalid International block metadata');
    const values=Array.from({length:4},(_,i)=>(mark.permutation>>2*i)&3);if(new Set(values).size!==4)throw new RangeError('Invalid International outcome permutation');
  };
  for(const source of sources){
    if(!/^db(?:[2-5]|6-[0-5]{4})$/.test(source.name)||names.has(source.name)||typeof source.indexText!=='string')throw new RangeError('Invalid or repeated International file');
    names.add(source.name);const bytes=source.bytes;totalBytes+=bytes.length;let active:Slice|null=null;
    const local:Slice[]=[];
    for(const line of source.indexText.split(/\r?\n/).map(text=>text.trim()).filter(Boolean)){
      if(line.startsWith('BASE')){
        const match=/^BASE([0-5]),([0-5]),([0-5]),([0-5]),(\d+),([bw]):(.+)$/.exec(line);if(!match)throw new RangeError('Invalid International slice header');
        const [bm,bk,wm,wk,subslice]=match.slice(1,6).map(Number),pieces=bm+bk+wm+wk,positions=materialSize(bm,bk,wm,wk);
        const expected=pieces<=5?'db'+pieces:`db6-${bm}${bk}${wm}${wk}`;
        const key=line.slice(0,line.indexOf(':'));
        if(expected!==source.name||pieces<2||pieces>6||bm+bk===0||wm+wk===0||bm+bk>5||wm+wk>5||!Number.isSafeInteger(subslice)||subslice*subsliceSize>=positions||slices.has(key))throw new RangeError('Incompatible International slice material');
        const tail=match[7];active={bytes,start:0,end:bytes.length,uniform:undefined,marks:[],positions:Math.min(subsliceSize,positions-subslice*subsliceSize)};
        if(/^[+\-=.]$/.test(tail))active.uniform=tail==='+'?1:tail==='-'?-1:tail==='='?0:null;
        else{
          const first=/^(\d+)\/(\d+),(\d+),(\d+)$/.exec(tail);if(!first)throw new RangeError('Invalid International initial checkpoint');
          const [block,offset,catalogue,permutation]=first.slice(1).map(Number);
          if(!Number.isSafeInteger(block)||offset>=blockSize)throw new RangeError('Invalid International checkpoint offset');
          active.start=block*blockSize+offset;if(active.start>=bytes.length)throw new RangeError('International checkpoint outside bytes');
          const mark={ordinal:0,catalogue,permutation};checkMark(mark);active.marks.push(mark);local.push(active);
        }
        slices.set(key,active);
      }else{
        const checkpoint=/^(\d+),(\d+),(\d+)$/.exec(line);if(!checkpoint||!active||active.uniform!==undefined)throw new RangeError('Unexpected International checkpoint');
        const [ordinal,catalogue,permutation]=checkpoint.slice(1).map(Number),mark={ordinal,catalogue,permutation};checkMark(mark);
        if(ordinal<=active.marks.at(-1)!.ordinal||ordinal>=active.positions)throw new RangeError('Unordered International checkpoints');active.marks.push(mark);
      }
    }
    if(!source.indexText.trim())throw new RangeError('Empty International index');
    local.sort((a,b)=>a.start-b.start);
    for(let i=0;i<local.length;i++){
      const slice=local[i];slice.end=local[i+1]?.start??bytes.length;
      const lastBlock=Math.floor(slice.start/blockSize)+slice.marks.length-1;
      if(slice.end<=slice.start||lastBlock*blockSize>=slice.end)throw new RangeError('International slice extent exceeds bytes');
    }
  }
  function probe(board:readonly Piece[],side:Side):-1|0|1|null{
    const location=internationalRank(board,side);if(!location)return null;
    if(legalMoves(board,'international',side).some(move=>move.captures.length))return null;
    const slice=slices.get(location.key);if(!slice)return null;if(slice.uniform!==undefined)return slice.uniform;
    let block=0,upper=slice.marks.length;
    while(block+1<upper){const middle=Math.floor((block+upper)/2);if(slice.marks[middle].ordinal<=location.ordinal)block=middle;else upper=middle;}
    const mark=slice.marks[block],end=Math.min(slice.end,(Math.floor(slice.start/blockSize)+block+1)*blockSize);
    let cursor=block===0?slice.start:(Math.floor(slice.start/blockSize)+block)*blockSize,ordinal=mark.ordinal;
    const data=slice.bytes.range(cursor,end),first=cursor;
    while(cursor<end){
      const token=data[cursor++-first],entry=mark.catalogue*256+token,length=lengths[entry];
      if(ordinal+length>location.ordinal){
        let run=offsets[entry],within=location.ordinal-ordinal;
        while(run+2<runs.length){const value=runs[run],count=runs[run+1]+256*runs[run+2];if(within<count){const decoded=(mark.permutation>>2*value)&3;return decoded===1?1:decoded===2?-1:decoded===3?0:null;}within-=count;run+=3;}
        return null;
      }
      ordinal+=length;
    }
    return null;
  }
  return Object.freeze({probe,locate:internationalRank,coverage:()=>({files:[...names].sort(),slices:slices.size,bytes:totalBytes,maximumPieces:6,scope:'International theoretical board-only WLD v2; current-side captures require exact resolution; absent slices remain unknown'})});
}
