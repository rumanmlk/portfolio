/**
 * Sum gzip sizes of first-document script tags (approximation of first-load JS).
 * Usage: node scripts/measure-js-gzip.mjs http://localhost:3110
 */
import { gzipSync } from 'node:zlib';

const base = (process.argv[2] || 'http://localhost:3110').replace(/\/$/, '');
const res = await fetch(`${base}/`);
const html = await res.text();
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
const abs = scripts.map((s) => (s.startsWith('http') ? s : new URL(s, base).href));
let total = 0;
const rows = [];
for (const url of abs) {
  const r = await fetch(url, { headers: { 'Accept-Encoding': 'identity' } });
  const buf = Buffer.from(await r.arrayBuffer());
  const gz = gzipSync(buf).length;
  total += gz;
  rows.push({ path: url.replace(base, ''), gzipKB: +(gz / 1024).toFixed(2) });
}
console.log(JSON.stringify({ totalGzipKB: +(total / 1024).toFixed(1), scripts: rows }, null, 2));
