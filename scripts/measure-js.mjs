import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const html = fs.readFileSync('.next/server/app/index.html', 'utf8');
/** Modern first-load: skip legacy `nomodule` polyfills (not executed by Chrome 111+). */
const srcs = [...html.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g)]
  .filter((m) => !/nomodule/i.test(m[0]))
  .map((m) => m[1]);
const uniq = [...new Set(srcs)];
let total = 0;
for (const src of uniq) {
  const file = path.join('.next', src.replace('/_next/', ''));
  const gz = zlib.gzipSync(fs.readFileSync(file)).length;
  total += gz;
  console.log(gz, path.basename(file));
}
console.log('FIRST_LOAD_GZIP', total, 'files', uniq.length);
