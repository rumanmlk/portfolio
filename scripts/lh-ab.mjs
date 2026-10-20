/**
 * Mobile Lighthouse A/B runner. Usage:
 *   node scripts/lh-ab.mjs --label A --url http://localhost:3110 --scenario S1 --runs 5
 * Scenarios: S1=/  S2=/#work  S3=/ (caller must serve intro-disabled build)
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

const label = arg('label', 'X');
const base = arg('url', 'http://localhost:3100').replace(/\/$/, '');
const scenario = arg('scenario', 'S1');
const runs = Number(arg('runs', '5'));
const pathSuffix = scenario === 'S2' ? '/#work' : '/';
const url = `${base}${pathSuffix}`;
const outDir = path.join('D:', 'tmp', 'lh-ab', label, scenario);
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
      '--only-categories=performance',
      '--form-factor=mobile',
      '--screenEmulation.mobile',
      '--throttling-method=simulate',
      `--chrome-path=${chrome}`,
      '--chrome-flags=--headless=new --disable-gpu',
      '--output=json',
      `--output-path=${out}`,
      '--quiet',
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    console.error('FAIL', label, scenario, i, result.stderr || result.stdout);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  const a = report.audits;
  // LH 12.6+: largest-contentful-paint-element; older: lcp-breakdown-insight
  const legacy = a['lcp-breakdown-insight']?.details?.items ?? [];
  const modern = a['largest-contentful-paint-element']?.details?.items ?? [];
  const insightItems = modern.length ? modern : legacy;
  let node = insightItems.find((it) => it.type === 'node');
  if (!node) {
    const tableWithNode = insightItems.find((it) => it.type === 'table' && it.items?.[0]?.node);
    node = tableWithNode?.items?.[0]?.node;
  }
  const phaseTable = insightItems.find(
    (it) =>
      it.type === 'table' &&
      (it.items?.[0]?.phase || it.items?.[0]?.subpart || it.items?.[0]?.label),
  );
  let ttfb = null;
  let loadDelay = null;
  let loadTime = null;
  let renderDelay = null;
  for (const row of phaseTable?.items ?? []) {
    const ms = Math.round(row.duration ?? row.timing ?? 0);
    const key = String(row.subpart ?? row.phase ?? row.label ?? '');
    if (/timeToFirstByte|ttfb/i.test(key)) ttfb = ms;
    else if (/resourceLoadDelay|load delay/i.test(key)) loadDelay = ms;
    else if (/resourceLoadDuration|load time|resource load/i.test(key)) loadTime = ms;
    else if (/elementRenderDelay|render delay/i.test(key)) renderDelay = ms;
  }
  const row = {
    label,
    scenario,
    run: i,
    perf: Math.round(report.categories.performance.score * 100),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
    lcpSelector: node?.selector ?? '?',
    lcpType: node?.nodeLabel ?? node?.snippet ?? '?',
    ttfb,
    loadDelay,
    loadTime,
    renderDelay,
  };
  rows.push(row);
  console.log(JSON.stringify(row));
}

const keys = ['perf', 'lcp', 'fcp', 'tbt', 'cls', 'ttfb', 'loadDelay', 'loadTime', 'renderDelay'];
const med = { label, scenario, kind: 'median' };
for (const k of keys) {
  const vals = rows.map((r) => r[k]).filter((v) => v != null);
  med[k] = vals.length ? median(vals) : null;
}
med.lcpSelector = rows.map((r) => r.lcpSelector).sort()[Math.floor(rows.length / 2)];
med.lcpType = rows.map((r) => r.lcpType).sort()[Math.floor(rows.length / 2)];
console.log(JSON.stringify(med));
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ rows, median: med }, null, 2));
