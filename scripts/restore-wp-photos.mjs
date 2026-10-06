// Copies the old WordPress photos into the private Blob store at
// wp-content/uploads/<path>, where app/wp-content/uploads serves them.
// Only photos the site content actually uses are copied, and ones already
// there are skipped, so it is safe to run again.
//
//   node scripts/restore-wp-photos.mjs ip:192.158.226.175 [--force]
//                                                       (straight from the old Appnet server by IP;
//                                                        --force replaces copies already there)
//   node scripts/restore-wp-photos.mjs archive          (Internet Archive copies)
//   node scripts/restore-wp-photos.mjs <folder>         (a downloaded wp-content/uploads folder,
//                                                         e.g. from the old host's backup zip)
// Needs BLOB_READ_WRITE_TOKEN (from .env.local).
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { put, head } from '@vercel/blob';

const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]; }));
const token = env.BLOB_READ_WRITE_TOKEN;
const source = process.argv[2];
if (!token || !source) { console.log('Usage: node scripts/restore-wp-photos.mjs archive|<uploads folder>'); process.exit(1); }

// Every /wp-content/uploads/... path in the content (live Blob copy, else data/).
async function usedPaths() {
  const { get } = await import('@vercel/blob');
  const found = new Set();
  for (const name of ['listings', 'posts', 'pages', 'brokers', 'developers', 'testimonials', 'faq', 'categories']) {
    let text;
    const res = await get(`content/${name}.json`, { access: 'private', token, useCache: false }).catch(() => null);
    if (res) text = await new Response(res.stream).text();
    else if (fs.existsSync(`data/${name}.json`)) text = fs.readFileSync(`data/${name}.json`, 'utf8');
    if (!text) continue;
    for (const m of text.matchAll(/wp-content\/uploads\/([^"'\s\\)<>?#]+\.(?:jpe?g|png|webp|gif|avif|pdf))/gi)) found.add(decodeURIComponent(m[1]));
  }
  return [...found];
}

const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', pdf: 'application/pdf' };
const typeOf = (p) => TYPES[p.split('.').pop().toLowerCase()] || 'application/octet-stream';

// Internet Archive index of what it holds for the old uploads folder.
let archived;
async function fromArchive(rel) {
  if (!archived) {
    const txt = await (await fetch('https://web.archive.org/cdx/search/cdx?url=rvparksales.com/wp-content/uploads/&matchType=prefix&fl=timestamp,original,statuscode&collapse=urlkey&limit=20000')).text();
    archived = new Map();
    for (const line of txt.trim().split('\n')) {
      const [ts, orig, status] = line.split(' ');
      if (status !== '200') continue;
      const m = orig.match(/wp-content\/uploads\/(.+)$/);
      if (m) archived.set(decodeURIComponent(m[1]), { ts, orig });
    }
  }
  // The exact file, else the largest resized copy WordPress made of it (name-WxH.ext).
  let hit = archived.get(rel);
  if (!hit) {
    const base = rel.replace(/\.[^.]+$/, '');
    const ext = rel.split('.').pop();
    const sizes = [...archived.keys()].filter((k) => k.startsWith(`${base}-`) && k.endsWith(`.${ext}`) && /-\d+x\d+\.[^.]+$/.test(k))
      .sort((a, b) => Number(b.match(/-(\d+)x\d+\./)[1]) - Number(a.match(/-(\d+)x\d+\./)[1]));
    if (sizes.length) hit = archived.get(sizes[0]);
  }
  if (!hit) return null;
  const r = await fetch(`https://web.archive.org/web/${hit.ts}id_/${hit.orig}`, { signal: AbortSignal.timeout(60000) });
  return r.ok && /image|pdf/.test(r.headers.get('content-type') || '') ? Buffer.from(await r.arrayBuffer()) : null;
}

// The old server still answers for www.rvparksales.com when asked by IP.
function fromServer(ip, rel) {
  const urlPath = '/wp-content/uploads/' + rel.split('/').map(encodeURIComponent).join('/');
  return new Promise((resolve) => {
    const req = https.get({ host: ip, servername: 'www.rvparksales.com', path: urlPath, headers: { Host: 'www.rvparksales.com', 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false, timeout: 60000 }, (res) => {
      if (res.statusCode !== 200 || !/image|pdf/.test(res.headers['content-type'] || '')) { res.resume(); return resolve(null); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function fromFolder(rel) {
  const f = path.join(source, rel);
  return fs.existsSync(f) ? fs.readFileSync(f) : null;
}

const paths = await usedPaths();
console.log(`${paths.length} old photos used by the site`);
let copied = 0, had = 0;
const missing = [];
for (let i = 0; i < paths.length; i += 8) {
  await Promise.all(paths.slice(i, i + 8).map(async (rel) => {
    const key = `wp-content/uploads/${rel}`;
    if (!process.argv.includes('--force') && await head(key, { token }).catch(() => null)) { had++; return; }
    const body = source === 'archive' ? await fromArchive(rel).catch(() => null)
      : source.startsWith('ip:') ? await fromServer(source.slice(3), rel)
      : fromFolder(rel);
    if (!body) { missing.push(rel); return; }
    await put(key, body, { access: 'private', token, contentType: typeOf(rel), addRandomSuffix: false, allowOverwrite: true });
    copied++;
  }));
  process.stdout.write(`\r${Math.min(i + 8, paths.length)}/${paths.length}  copied ${copied}  already there ${had}  missing ${missing.length}`);
}
console.log('');
fs.writeFileSync('scripts/missing-wp-photos.txt', missing.sort().join('\n'));
console.log(`Done. Still missing: ${missing.length} (listed in scripts/missing-wp-photos.txt)`);
