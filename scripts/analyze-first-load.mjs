import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const html = fs.readFileSync('.next/server/app/index.html', 'utf8');
const srcs = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]))];
const keys = [
  'Ruman Malik',
  'FastAPI',
  'PythinQ',
  'PRESS START',
  'stackIcons',
  'NEXT_PUBLIC_SITE_URL',
  'site-url',
  'lenis',
  'three',
  'OPEN TO ROLES',
  'DeepD2V',
  'clipboard',
  'Skip to content',
];

for (const src of srcs) {
  const file = path.join('.next', src.replace('/_next/', ''));
  const s = fs.readFileSync(file, 'utf8');
  const gz = zlib.gzipSync(s).length;
  const hits = keys.filter((k) => s.includes(k));
  console.log(`${path.basename(file)}  gz=${gz}  hits=${hits.join('|') || '-'}`);
}
