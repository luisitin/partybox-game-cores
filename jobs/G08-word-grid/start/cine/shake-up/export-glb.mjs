import { build } from 'esbuild';
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const nm = '/home/claude/pb/node_modules';
const r = await build({ entryPoints: ['/home/claude/pb/cine/shake-up/export-glb.js'], bundle: true, format: 'esm', write: false, logLevel: 'error',
  alias: { 'three/addons': `${nm}/three/examples/jsm`, three: `${nm}/three/build/three.module.js` } });
writeFileSync('/tmp/claude-0/-home-claude/b0149710-8741-5b0b-be67-3e17e52eb6f4/scratchpad/glb.html', `<body><script type="module">${r.outputFiles[0].text}</script></body>`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
await p.goto('file:///tmp/claude-0/-home-claude/b0149710-8741-5b0b-be67-3e17e52eb6f4/scratchpad/glb.html');
await p.waitForSelector('body[data-ready="1"]');
const files = await p.evaluate(() => window.bake());
for (const [k, v] of Object.entries(files)) { const buf = Buffer.from(v, 'base64'); writeFileSync(`/home/claude/pb/games/shake-up/client/station/${k}.glb`, buf); console.log(k, (buf.length / 1024).toFixed(0), 'KB'); }
await b.close();
