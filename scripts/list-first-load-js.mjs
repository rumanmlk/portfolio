import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const html = fs.readFileSync('.next/server/app/index.html', 'utf8');
const srcs = [
  ...new Set(
    [...html.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g)]
      .filter((m) => !/nomodule/i.test(m[0]))
      .map((m) => m[1]),
  ),
];
let rawTotal = 0;
let gzTotal = 0;
for (const src of srcs) {
  const file = path.join('.next', src.replace('/_next/', ''));
  const raw = fs.readFileSync(file);
  const gz = zlib.gzipSync(raw).length;
  rawTotal += raw.length;
  gzTotal += gz;
  console.log(
    `${String(raw.length).padStart(8)} raw  ${String(gz).padStart(6)} gz  ${path.basename(file)}`,
  );
}
console.log(
  `TOTAL ${rawTotal} raw  ${gzTotal} gz  (${(gzTotal / 1024).toFixed(1)} KB)  files ${srcs.length} (excl. nomodule)`,
);
