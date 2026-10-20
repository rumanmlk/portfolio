import fs from 'node:fs';

const h = fs.readFileSync('.next/server/app/index.html', 'utf8');
const idx = h.indexOf('0cz1d0mv5g_q7');
console.log('index', idx);
console.log(h.slice(Math.max(0, idx - 200), idx + 120));
