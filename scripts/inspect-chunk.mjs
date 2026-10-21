import fs from 'node:fs';

const file = process.argv[2] || '.next/static/chunks/0cz1d0mv5g_q7.js';
const s = fs.readFileSync(file, 'utf8');
const keys = [
  'Ruman',
  'FastAPI',
  'PythinQ',
  'DeepD2V',
  'Experience',
  'Inventory',
  'PRESS',
  'SKIP',
  'clipboard',
  'phone',
  'stackIcons',
  'SITE_URL',
  'example.com',
  'lenis',
  'three',
  'COPY EMAIL',
  'Skip to content',
  'NEXT_PUBLIC',
];
for (const k of keys) console.log(String(s.includes(k)).padEnd(5), k);
const quoted = [...s.matchAll(/"((?:[^"\\]|\\.){10,80})"/g)]
  .map((m) => m[1])
  .filter((t) => /[A-Za-z]{4}/.test(t) && !t.includes('function'));
console.log('\nquoted sample:');
console.log([...new Set(quoted)].slice(0, 50).join('\n'));
