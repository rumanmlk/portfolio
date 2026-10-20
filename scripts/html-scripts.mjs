import fs from 'node:fs';

const h = fs.readFileSync('.next/server/app/index.html', 'utf8');
console.log('has polyfill id', h.includes('0cz1d0mv5g_q7'));
const srcs = [...new Set([...h.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]))];
for (const s of srcs) console.log(s);
