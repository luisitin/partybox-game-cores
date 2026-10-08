// Media verification only. Encoded video cadence never supplies browser FPS evidence.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const identities = new Map();
function tool(name) {
  if (!identities.has(name)) {
    const executable = realpathSync(execFileSync('which', [name], {encoding:'utf8', timeout:10_000}).trim());
    const version = execFileSync(executable, ['-version'], {encoding:'utf8', timeout:10_000}).split('\n')[0];
    identities.set(name, {executable, version, sha256:sha256(readFileSync(executable))});
  }
  return identities.get(name);
}

export function decodeCapture(videoPath, {strictMilestone=false}={}) {
  const probe = tool('ffprobe'), decoder = tool('ffmpeg');
  const probeArgs = ['-v','error','-show_streams','-show_format','-of','json',videoPath];
  const metadata = JSON.parse(execFileSync(probe.executable, probeArgs, {encoding:'utf8', timeout:30_000, maxBuffer:2_000_000}));
  assert.equal(metadata.streams.length, 1, 'capture must have one video stream');
  const stream = metadata.streams[0];
  assert.equal(stream.codec_type, 'video', 'actual video stream required');
  assert.ok(['vp8','vp9'].includes(stream.codec_name), 'actual WebM VP8/VP9 required');
  assert.ok(Number.isSafeInteger(stream.width) && stream.width>0 && Number.isSafeInteger(stream.height) && stream.height>0, 'actual video dimensions');
  const duration = Number(metadata.format.duration);
  assert.ok(Number.isFinite(duration) && duration>0, 'actual finite video duration');
  const decodeArgs = ['-v','error','-xerror','-err_detect','explode','-i',videoPath,'-map','0:v:0','-an','-f','framehash','-hash','sha256','-'];
  const raw = execFileSync(decoder.executable, decodeArgs, {encoding:'utf8', timeout:30_000, maxBuffer:2_000_000});
  const frames = raw.split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => line.split(',').map(field => field.trim()));
  assert.ok(frames.length>0, 'actual decoded frames required');
  for (const [index, fields] of frames.entries()) {
    assert.equal(fields.length, 6, 'actual framehash row');
    assert.equal(Number(fields[0]), 0, 'video stream index');
    assert.ok(Number.isFinite(Number(fields[2])), 'actual presentation timestamp');
    assert.ok(Number(fields[4])>0, 'actual decoded frame bytes');
    assert.match(fields[5], /^[a-f0-9]{64}$/, 'actual decoded frame SHA');
    if (index) assert.ok(Number(fields[2])>Number(frames[index-1][2]), 'strictly increasing decoded timestamps');
  }
  if (strictMilestone) {
    assert.equal(stream.width, 1920, 'current capture width');
    assert.equal(stream.height, 1080, 'current capture height');
    assert.equal(stream.r_frame_rate, '10/1', 'current encoded capture cadence');
    assert.equal(frames.length, 36, 'all 36 current capture frames must decode');
    assert.ok(Math.abs(duration-3.6)<0.001, 'current capture duration');
  }
  return {videoPath, strictMilestone, codec:stream.codec_name, width:stream.width, height:stream.height, encodedFrameRate:stream.r_frame_rate,
    durationSeconds:duration, decodedFrames:frames.length, frameHashSha256:sha256(Buffer.from(raw)),
    probe:{...probe,args:probeArgs}, decoder:{...decoder,args:decodeArgs}};
}
