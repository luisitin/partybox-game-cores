// Bundles each film into ONE self-contained preview HTML (three inlined, stand-in room).
// In the repo the films ship as ES modules with an import map (opening.html / outro.html).
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const nm = join(here, '..', '..', 'node_modules');
mkdirSync(join(here, 'dist'), { recursive: true });
for (const [name, fade] of [['opening', '#1f5c48'], ['outro', '#0b0c1a']]) {
  const r = await build({
    entryPoints: [join(here, `${name}.js`)], bundle: true, minify: true, format: 'esm', write: false, logLevel: 'error',
    alias: { 'three/addons': join(nm, 'three', 'examples', 'jsm'), three: join(nm, 'three', 'build', 'three.module.js') },
  });
  const js = r.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shake Up ${name === 'opening' ? 'Opening' : 'Outro'}</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap" rel="stylesheet">
<style>html,body{margin:0;height:100%;background:#0b0c1a;overflow:hidden}canvas{display:block;width:100vw;height:100vh}#fade{position:fixed;inset:0;background:${fade};opacity:0;pointer-events:none}</style></head>
<body><canvas></canvas><div id="fade"></div><script type="module">${js}</script></body></html>`;
  writeFileSync(join(here, 'dist', `shake-up-${name}.html`), html);
  console.log(name, (html.length / 1024).toFixed(0), 'KB');
}
