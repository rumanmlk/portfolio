// Renders page 1 of public/resume.pdf to public/resume-preview.webp (1600px wide).
// Usage: pnpm resume:preview
// Read-only on resume.pdf: the only file written is resume-preview.webp.
// Refuses to write when the page text looks like it contains a phone number.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import sharp from 'sharp';

import { PHONE_PATTERNS } from './phone-patterns.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PDF = join(root, 'public/resume.pdf');
const OUT = join(root, 'public/resume-preview.webp');
const WIDTH = 1600;
const MAX_BYTES = 300 * 1024;

// pdfjs draws glyphs with Path2D; install the ones matching this canvas before it loads.
Object.assign(globalThis, { Path2D, DOMMatrix, ImageData });
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const data = new Uint8Array(await readFile(PDF));
const pdf = await pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
const page = await pdf.getPage(1);

const text = (await page.getTextContent()).items.map((i) => i.str ?? '').join(' ');
if (PHONE_PATTERNS.some((re) => re.test(text))) {
  console.error('resume.pdf page 1 appears to contain a phone number; not writing a preview.');
  process.exit(1);
}

// Rendered at 2x the target width, then downscaled by sharp for a crisp image.
const base = page.getViewport({ scale: 1 });
const viewport = page.getViewport({ scale: (WIDTH * 2) / base.width });
const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
await page.render({ canvasContext: ctx, viewport, canvas }).promise;

// Encode the PNG and downscale once; only the WebP step repeats while the size is over budget.
const scaled = await sharp(canvas.toBuffer('image/png')).resize({ width: WIDTH }).png().toBuffer();
let quality = 82;
let out;
do {
  out = await sharp(scaled).webp({ quality, effort: 6 }).toBuffer();
  quality -= 6;
} while (out.length > MAX_BYTES && quality > 30);

await writeFile(OUT, out);
console.log(`wrote public/resume-preview.webp (${(out.length / 1024).toFixed(1)} KB)`);
