import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const wt = process.argv[2];
if (!wt) {
  console.error('usage: node scripts/compare-worktree-bundle.mjs <worktree>');
  process.exit(1);
}

function measure(root) {
  const html = fs.readFileSync(path.join(root, '.next/server/app/index.html'), 'utf8');
  const srcs = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]))];
  let total = 0;
  const rows = [];
  for (const src of srcs) {
    const file = path.join(root, '.next', src.replace('/_next/', ''));
    const buf = fs.readFileSync(file);
    const gz = zlib.gzipSync(buf).length;
    total += gz;
    const s = buf.toString('utf8');
    const core = s.includes('__core-js_shared__') || s.includes('core-js');
    rows.push({ name: path.basename(file), gz, core });
  }
  return { total, rows };
}

const result = measure(wt);
for (const r of result.rows) console.log(r.name, r.gz, r.core ? 'COREJS' : '');
console.log('TOTAL_GZ', result.total);
