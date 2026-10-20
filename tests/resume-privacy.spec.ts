import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const PHONE_PATTERNS = [
  /\+?92[\s-]?3\d\d[\s-]?\d{7}/,
  /\b03\d\d[\s-]?\d{7}\b/,
  /\+?\d[\d\s().-]{8,}\d/,
];

const FAIL_MSG = 'Replace public/resume.pdf with a version without your phone number.';

test.describe('resume privacy', () => {
  test('public resume PDF must not contain a phone number', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'PDF text check once on chromium');
    const req = createRequire(join(process.cwd(), 'package.json'));
    const pdfPath = req.resolve('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfjs = await import(pathToFileURL(pdfPath).href);
    const data = new Uint8Array(readFileSync(join(process.cwd(), 'public/resume.pdf')));
    const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
    const chunks: string[] = [];
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      chunks.push(content.items.map((item: { str?: string }) => item.str ?? '').join(' '));
    }
    const text = chunks.join('\n');
    const hit = PHONE_PATTERNS.some((re) => re.test(text));
    expect(hit, FAIL_MSG).toBe(false);
  });
});
