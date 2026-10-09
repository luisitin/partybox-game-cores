// Original acquisition-only public Mega file-key and AES-CTR helpers.
// Never used by the pure game or reference probe; temporary URLs stay in Python.
import { readFileSync, createReadStream, createWriteStream, openSync, ftruncateSync, closeSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { pipeline } from 'node:stream/promises';

const [mode, ...arguments_] = process.argv.slice(2);
if (mode === 'metadata') {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const folderKey = Buffer.from(input.folderKey, 'base64url');
  const files = input.nodes.filter(row => row.s).map(row => {
    const decipher = createDecipheriv('aes-128-ecb', folderKey, null);
    decipher.setAutoPadding(false);
    const parts = Buffer.concat([decipher.update(Buffer.from(row.k.split(':')[1], 'base64url')), decipher.final()]);
    const key = Buffer.from(parts.subarray(0, 16).map((value, index) => value ^ parts[16 + index]));
    const attribute = createDecipheriv('aes-128-cbc', key, Buffer.alloc(16));
    attribute.setAutoPadding(false);
    const json = Buffer.concat([attribute.update(Buffer.from(row.a, 'base64url')), attribute.final()]).toString().slice(4).replace(/\0+$/u, '');
    return { name: JSON.parse(json).n, bytes: row.s, handle: row.h, key: key.toString('hex'),
      iv: Buffer.concat([parts.subarray(16, 24), Buffer.alloc(8)]).toString('hex') };
  });
  process.stdout.write(JSON.stringify(files));
} else if (mode === 'decrypt') {
  const [metadataPath, encryptedPath, outputPath] = arguments_;
  if (!metadataPath || !encryptedPath || !outputPath) throw new Error('Expected metadata, encrypted and output paths');
  const info = JSON.parse(readFileSync(metadataPath, 'utf8'));
  const decipher = createDecipheriv('aes-128-ctr', Buffer.from(info.key, 'hex'), Buffer.from(info.iv, 'hex'));
  await pipeline(createReadStream(encryptedPath), decipher, createWriteStream(outputPath, { mode: 0o600 }));
  const descriptor = openSync(outputPath, 'r+');
  ftruncateSync(descriptor, info.bytes);
  closeSync(descriptor);
} else {
  throw new Error('Expected metadata or decrypt mode');
}
