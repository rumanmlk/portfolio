// Renders src/content/resume.json to public/resume-generated.pdf in the site's
// visual style. Uses the Chromium that Playwright already installed for the tests.
// Never writes public/resume.pdf — that file is the resume visitors download.
//
//   pnpm resume:pdf                 # writes public/resume-generated.pdf
//   pnpm resume:pdf -- --png out.png  # also writes a PNG preview of the page

import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(join(root, 'src/content/resume.json'), 'utf8'));
const anton = (await readFile(join(root, 'src/assets/fonts/Anton-Regular.ttf'))).toString('base64');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const dates = (a, b) => `${esc(a)} – ${esc(b)}`;
const bullets = (items = []) =>
  items.length ? `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';

const { basics: b } = data;
const site = b.website ? `<a href="https://${esc(b.website)}">${esc(b.website)}</a> · ` : '';
const contact = [
  esc(b.location),
  b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : '',
  b.linkedin ? `<a href="https://${esc(b.linkedin)}">${esc(b.linkedin)}</a>` : '',
  b.github ? `<a href="https://${esc(b.github)}">${esc(b.github)}</a>` : '',
]
  .filter(Boolean)
  .join(' · ');

const experience = data.experience
  .map(
    (job) => `
    <article class="job">
      <header class="row">
        <div>
          <h3>${esc(job.company)}</h3>
          <p class="role">${esc(job.role)}</p>
        </div>
        <div class="meta">
          <div>${dates(job.start, job.end)}</div>
          <div>${esc(job.location)}</div>
        </div>
      </header>
      ${bullets(job.bullets)}
      ${(job.projects ?? [])
        .map(
          (p) => `
        <section class="project">
          <div class="row">
            <p class="pname">${esc(p.name)} <span class="stack">| ${esc(p.stack)}</span></p>
            <div class="meta">${dates(p.start, p.end)}</div>
          </div>
          ${bullets(p.bullets)}
        </section>`,
        )
        .join('')}
    </article>`,
  )
  .join('');

const projects = data.projects
  .map(
    (p) => `
    <section class="project">
      <div class="row">
        <p class="pname">${esc(p.name)} <span class="stack">| ${esc(p.stack)}</span></p>
        <div class="meta">${dates(p.start, p.end)}</div>
      </div>
      ${bullets(p.bullets)}
    </section>`,
  )
  .join('');

const education = data.education
  .map(
    (e) => `
    <div class="row">
      <div>
        <h3>${esc(e.school)}</h3>
        <p class="role">${esc(e.degree)}</p>
      </div>
      <div class="meta">
        <div>${dates(e.start, e.end)}</div>
        <div>${esc(e.location)}</div>
      </div>
    </div>`,
  )
  .join('');

const skills = data.skills
  .map(
    (s) => `<div class="skill"><span class="label">${esc(s.label)}:</span> ${esc(s.items)}</div>`,
  )
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(b.name)} – Resume</title>
<style>
  @font-face { font-family: 'Anton'; src: url(data:font/ttf;base64,${anton}) format('truetype'); font-weight: 400; }
  @page { size: A4; margin: 14mm 14mm 16mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: 'IBM Plex Sans', 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10.2pt; line-height: 1.38; color: #14121F; }
  a { color: inherit; text-decoration: none; }
  h1 { font-family: Anton, Impact, sans-serif; font-weight: 400; font-size: 30pt; line-height: 1; letter-spacing: 0.01em; text-transform: uppercase; margin: 0; }
  h2 { font-family: Anton, Impact, sans-serif; font-weight: 400; font-size: 13.5pt; letter-spacing: 0.03em; text-transform: uppercase; margin: 13pt 0 5pt; padding-bottom: 3pt; border-bottom: 2.2pt solid #14121F; }
  h3 { font-size: 11pt; font-weight: 600; margin: 0; }
  p { margin: 0; }
  ul { margin: 2pt 0 0; padding-left: 13pt; }
  li { margin: 1.2pt 0; }
  li::marker { color: #FF4B3E; }
  .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14pt; }
  .tag { display: inline-block; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 8pt; font-weight: 600; letter-spacing: 0.05em; background: #FFD93D; border: 1.4pt solid #14121F; box-shadow: 2pt 2pt 0 #14121F; padding: 1.5pt 6pt; margin-bottom: 5pt; }
  .title { font-size: 11.5pt; font-weight: 600; margin-top: 3pt; }
  .contact { font-size: 9pt; margin-top: 4pt; color: #2B2838; }
  .summary { margin-top: 8pt; padding: 6pt 9pt; border: 1.8pt solid #14121F; box-shadow: 4pt 4pt 0 #FF4B3E; background: #FFFBF2; }
  .row { display: flex; justify-content: space-between; gap: 12pt; align-items: baseline; }
  .meta { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 8.2pt; color: #4A4660; text-align: right; white-space: nowrap; }
  .role { font-weight: 500; color: #2B2838; }
  .job { margin-bottom: 7pt; break-inside: avoid; }
  .project { margin-top: 4pt; break-inside: avoid; }
  .pname { font-weight: 600; }
  .stack { font-weight: 400; color: #4A4660; font-size: 9pt; }
  .skill { margin: 1.5pt 0; }
  .label { font-weight: 600; }
</style>
</head>
<body>
  <header class="head">
    <div>
      <div class="tag">&gt; PRESS START</div>
      <h1>${esc(b.name)}</h1>
      <p class="title">${esc(b.title)}</p>
      <p class="contact">${site}${contact}</p>
    </div>
  </header>
  <p class="summary">${esc(data.summary)}</p>

  <h2>Experience</h2>
  ${experience}

  <h2>Projects</h2>
  ${projects}

  <h2>Education</h2>
  ${education}

  <h2>Technical Skills</h2>
  ${skills}
</body>
</html>`;

await mkdir(join(root, 'public'), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(root, 'public/resume-generated.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(`Wrote ${out}`);
  const pngIndex = process.argv.indexOf('--png');
  if (pngIndex !== -1 && process.argv[pngIndex + 1]) {
    await page.setViewportSize({ width: 794, height: 1123 }); // A4 at 96dpi
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: process.argv[pngIndex + 1], fullPage: true });
    console.log(`Wrote ${process.argv[pngIndex + 1]}`);
  }
} finally {
  await browser.close();
}
