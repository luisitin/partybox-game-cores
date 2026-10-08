import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {deflateRawSync,inflateRawSync} from 'node:zlib';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function rawZipMember(archive,name){
  let footer=archive.length-22;
  while(footer>=Math.max(0,archive.length-65557)&&archive.readUInt32LE(footer)!==0x06054b50)footer--;
  assert(footer>=0,'ZIP footer absent');assert.equal(archive.readUInt16LE(footer+4),0);assert.equal(archive.readUInt16LE(footer+6),0);
  const count=archive.readUInt16LE(footer+10);let cursor=archive.readUInt32LE(footer+16);
  for(let n=0;n<count;n++){
    assert.equal(archive.readUInt32LE(cursor),0x02014b50);const compressed=archive.readUInt32LE(cursor+20),uncompressed=archive.readUInt32LE(cursor+24);
    const nameLength=archive.readUInt16LE(cursor+28),extraLength=archive.readUInt16LE(cursor+30),commentLength=archive.readUInt16LE(cursor+32);
    const entry=archive.toString('utf8',cursor+46,cursor+46+nameLength);
    if(entry===name){
      assert.equal(archive.readUInt16LE(cursor+10),8,'Only original ZIP deflate members are supported');assert.equal(archive.readUInt16LE(cursor+8)&1,0);
      const local=archive.readUInt32LE(cursor+42);assert.equal(archive.readUInt32LE(local),0x04034b50);
      const start=local+30+archive.readUInt16LE(local+26)+archive.readUInt16LE(local+28);assert(start+compressed<=cursor);
      return {compressed:archive.subarray(start,start+compressed),uncompressed};
    }
    cursor+=46+nameLength+extraLength+commentLength;
  }
  throw new Error('Original ZIP member missing: '+name);
}
export function pack(bytes,precompressed=null){
  const compressed=precompressed??deflateRawSync(bytes,{level:9});
  assert(inflateRawSync(compressed).equals(bytes),'Compression changed source bytes');
  return {compressed,report:{rawBytes:bytes.length,compressedBytes:compressed.length,rawSha256:sha256(bytes),compressedSha256:sha256(compressed)}};
}
export function workerParts(script,names){
  const prefix='const queued=[];self.onmessage=event=>queued.push(event);\n'+
    '(async()=>{const G10_DATABASE_BYTES=Object.create(null);\n'+
    'async function unpack(encoded){const bytes=Uint8Array.from(atob(encoded),value=>value.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));return new Uint8Array(await new Response(stream).arrayBuffer());}\n';
  const suffix=script+'\n'+
    'self.postMessage({ready:true});for(const event of queued)self.onmessage(event);})().catch(()=>self.postMessage({error:"The offline endgame database could not be prepared in this browser."}));\n';
  return {prefix,suffix,payloads:names.map(name=>({name,before:'G10_DATABASE_BYTES['+JSON.stringify(name)+']=await unpack("',after:'");\n'}))};
}
export function workerBootstrap(script,payloads){
  const parts=workerParts(script,payloads.map(value=>value.name));
  return parts.prefix+parts.payloads.map((value,index)=>value.before+payloads[index].compressed.toString('base64')+value.after).join('')+parts.suffix;
}
