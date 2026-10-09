import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateCapture} from '../scripts/check-visual.mjs';
import {decodeCapture} from '../scripts/check-capture.mjs';

// Genuine inherited media exercises the verifier; it is not current browser/FPS acceptance.
const inherited = 'media/milestone-16.webm';
const receipt = videoPath => {const bytes=readFileSync(videoPath);return {videoPath,videoBytes:bytes.length,videoSha256:createHash('sha256').update(bytes).digest('hex')};};
test('fully decode genuine capture and reject coherently hashed invalid, truncated and partial videos', () => {
  mkdirSync('.tmp/visual',{recursive:true});
  const path=`.tmp/visual/capture-control-${process.pid}.webm`;
  const original=readFileSync(inherited);
  const actual=decodeCapture(inherited,{strictMilestone:true});
  assert.equal(actual.decodedFrames,36);
  assert.equal(validateCapture({...receipt(inherited),kind:'full'}),true);
  const results=[];
  try {
    writeFileSync(path,'This is not video. Its coherent receipt must not accept it.\n');
    assert.throws(()=>validateCapture({...receipt(path),kind:'full'}));results.push('coherent hash of non-video rejected');
    writeFileSync(path,original.subarray(0,Math.floor(original.length/2)));
    assert.throws(()=>validateCapture({...receipt(path),kind:'full'}));results.push('coherent hash of truncated genuine video rejected');
    execFileSync('ffmpeg',['-y','-v','error','-i',inherited,'-frames:v','1','-c:v','copy',path],{timeout:30_000});
    assert.equal(decodeCapture(path).decodedFrames,1,'real complete one-frame video is decodable');
    assert.throws(()=>validateCapture({...receipt(path),kind:'full'}),/all 36/);results.push('real complete one-frame video rejected for current milestone');
    execFileSync('ffmpeg',['-y','-v','error','-i',inherited,'-vf','scale=390:844','-c:v','libvpx-vp9','-threads','1','-crf','45','-b:v','0',path],{timeout:30_000});
    assert.equal(decodeCapture(path).decodedFrames,36,'real phone-shaped video fully decodes');
    assert.throws(()=>validateCapture({...receipt(path),kind:'full'}),/current capture width/);results.push('coherently hashed full phone-shaped video rejected for TV milestone');
  } finally {rmSync(path,{force:true});}
  writeFileSync('.tmp/visual/capture-controls.json',JSON.stringify({kind:'actual-media-verifier-controls',purpose:'not current browser or FPS evidence',inherited,positive:actual,negativeControls:results,passed:true},null,2)+'\n');
});
