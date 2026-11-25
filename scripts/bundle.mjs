// Production bundle: one minified JS file and one CSS file instead of ~20 separate requests.
// Writes public/dist/{app.js,app.css,index.html}. The server serves dist/index.html when FF_BUNDLE=1.
import { build, transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pub = new URL('../public/', import.meta.url);
mkdirSync(new URL('dist/', pub), { recursive: true });
await build({ entryPoints: [fileURLToPath(new URL('app.js', pub))], bundle: true, format: 'esm', minify: true, target: 'es2020',
  outfile: fileURLToPath(new URL('dist/app.js', pub)), legalComments: 'none' });
const html = readFileSync(new URL('index.html', pub), 'utf8');
const sheets = [...html.matchAll(/<link rel="stylesheet" href="\/([^"]+)">/g)].map(m => m[1]);
const css = sheets.map(f => readFileSync(new URL(f, pub), 'utf8')).join('\n');
writeFileSync(new URL('dist/app.css', pub), (await transform(css, { loader: 'css', minify: true })).code);
const stamp = Date.now().toString(36);
const out = html.replace(/(<link rel="stylesheet" href="\/[^"]+">)+/, `<link rel="stylesheet" href="/dist/app.css?v=${stamp}">`)
  .replace('<script defer type="module" src="/app.js"></script>', `<script defer type="module" src="/dist/app.js?v=${stamp}"></script>`);
writeFileSync(new URL('dist/index.html', pub), out);
console.log(`bundled ${sheets.length} stylesheets and the app into public/dist (${stamp})`);
