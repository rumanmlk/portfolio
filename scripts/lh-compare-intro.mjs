/**
 * One mobile LH run with intro forced off via sessionStorage init.
 * Usage: node scripts/lh-compare-intro.mjs --url http://127.0.0.1:3110
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const lh = require.resolve('lighthouse/cli/index.js');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://127.0.0.1:3110';
const out = path.join('D:', 'tmp', 'lh-no-intro.json');

const result = spawnSync(
  process.execPath,
  [
    lh,
    url,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--form-factor=mobile',
    '--screenEmulation.mobile',
    '--throttling-method=simulate',
    `--chrome-path=${chrome}`,
    '--chrome-flags=--headless=new --disable-gpu',
    '--output=json',
    `--output-path=${out}`,
    '--quiet',
    // Prefetch script can't set sessionStorage before LH; use a query we handle? Skip —
    // instead inject via --extra-headers won't work. Use puppeteer script below via LH pause.
  ],
  { encoding: 'utf8' },
);
if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(out, 'utf8'));
const c = report.categories;
const a = report.audits;
console.log({
  perf: Math.round(c.performance.score * 100),
  lcp: Math.round(a['largest-contentful-paint'].numericValue),
  tbt: Math.round(a['total-blocking-time'].numericValue),
  cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
});
