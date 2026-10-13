// Checks every internal link and asset reference in the built site (dist/).
// Usage: npm run build && npm run check:links
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

/** Map a URL path to a file in dist, or null. */
function resolve(pathname) {
  let p = decodeURIComponent(pathname);
  const candidates = [join(dist, p), join(dist, p, 'index.html'), join(dist, `${p}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const idCache = new Map();
function ids(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const attr = /\s(?:href|src|srcset)="([^"]+)"/g;
const problems = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pageUrl = '/' + relative(dist, file).split(sep).join('/').replace(/index\.html$/, '');
  for (const m of html.matchAll(attr)) {
    for (let raw of m[1].split(',').map((s) => s.trim().split(/\s+/)[0])) {
      if (!raw || /^(https?:|mailto:|tel:|data:|javascript:|#$)/.test(raw)) continue;
      raw = raw.replaceAll('&amp;', '&');
      const url = new URL(raw, `http://site${pageUrl}`);
      if (url.host !== 'site') continue;
      checked++;
      const target = resolve(url.pathname);
      if (!target) {
        problems.push(`${pageUrl} -> ${raw} (missing)`);
        continue;
      }
      if (url.hash && target.endsWith('.html')) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (id && !ids(target).has(id)) problems.push(`${pageUrl} -> ${raw} (no #${id})`);
      }
    }
  }
}

if (problems.length) {
  console.error(`Broken links: ${problems.length} (of ${checked} checked in ${htmlFiles.length} pages)`);
  for (const p of [...new Set(problems)]) console.error('  ' + p);
  process.exit(1);
}
console.log(`All ${checked} internal links and assets in ${htmlFiles.length} pages resolve.`);
