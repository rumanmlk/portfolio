/**
 * Mobile Lighthouse x N → medians for perf/a11y/bp/seo + LCP/TBT/CLS.
 * Usage: node scripts/lh-mobile-medians.mjs --url http://localhost:3110 --runs 5
 * Optional: --throttling simulate|devtools|provided (default simulate)
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const lh = require.resolve('lighthouse/cli/index.js');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const url = arg('url', 'http://localhost:3110');
const runs = Number(arg('runs', '3'));
const throttling = arg('throttling', 'simulate');
const outDir = path.join('D:', 'tmp', 'lh-mobile');
fs.mkdirSync(outDir, { recursive: true });

function median(nums) {
  const a = [...nums].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
}

const rows = [];
for (let i = 1; i <= runs; i += 1) {
  const out = path.join(outDir, `run-${i}.json`);
  const result = spawnSync(
    process.execPath,
    [
      lh,
      url,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--form-factor=mobile',
      '--screenEmulation.mobile',
      `--throttling-method=${throttling}`,
      `--chrome-path=${chrome}`,
      '--chrome-flags=--headless=new --disable-gpu',
      '--output=json',
      `--output-path=${out}`,
      '--quiet',
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    console.error('FAIL run', i, result.stderr || result.stdout);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  const c = report.categories;
  const a = report.audits;
  rows.push({
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
  });
  console.log('run', i, rows[i - 1]);
}

const med = {
  perf: median(rows.map((r) => r.perf)),
  a11y: median(rows.map((r) => r.a11y)),
  bp: median(rows.map((r) => r.bp)),
  seo: median(rows.map((r) => r.seo)),
  lcp: median(rows.map((r) => r.lcp)),
  tbt: median(rows.map((r) => r.tbt)),
  cls: median(rows.map((r) => r.cls)),
};
const spread = {
  perfMin: Math.min(...rows.map((r) => r.perf)),
  perfMax: Math.max(...rows.map((r) => r.perf)),
  tbtMin: Math.min(...rows.map((r) => r.tbt)),
  tbtMax: Math.max(...rows.map((r) => r.tbt)),
};
console.log('MEDIAN', med);
console.log('SPREAD', spread);
