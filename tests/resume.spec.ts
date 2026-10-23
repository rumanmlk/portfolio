import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { statSync } from 'node:fs';
import { join } from 'node:path';

import { skipIntro } from './helpers';

const DIALOG = 'dialog.resume-dialog';
const HERO_RESUME = '.hero-actions a[data-resume-trigger]';

async function ready(page: Page, theme?: 'dark') {
  await skipIntro(page);
  if (theme) await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await page.goto('/');
  // Hydration (and the click handler) must be in place before the first click.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('resume dialog', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop dialog flow once on chromium');
  });

  test('preview image is not in the initial HTML', async ({ page }) => {
    await ready(page);
    await expect(page.locator('img[src*="resume-preview"]')).toHaveCount(0);
  });

  test('hero button opens the dialog; Esc closes it and focus returns', async ({ page }) => {
    await ready(page);
    const trigger = page.locator(HERO_RESUME);
    await trigger.click();
    const dialog = page.locator(DIALOG);
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-labelledby', 'resume-dialog-title');
    await expect(page.locator('#resume-dialog-title')).toHaveText('RESUME.PDF');
    await expect(dialog.getByRole('img', { name: /preview of ruman malik/i })).toBeVisible();
    const inside = await page.evaluate(() => document.activeElement?.closest('dialog') !== null);
    expect(inside).toBe(true);
    // header/footer inside a dialog would be read as extra banner/contentinfo landmarks.
    await expect(dialog.getByRole('banner')).toHaveCount(0);
    await expect(dialog.getByRole('contentinfo')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    const overflow = await page.evaluate(() => document.documentElement.style.overflow);
    expect(overflow).toBe('');
  });

  test('close button and backdrop click close it', async ({ page }) => {
    await ready(page);
    await page.locator(HERO_RESUME).click();
    const dialog = page.locator(DIALOG);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /close preview/i }).click();
    await expect(dialog).toBeHidden();
    await page.locator(HERO_RESUME).click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
  });

  test('ctrl-click goes to the PDF instead of opening the dialog', async ({ page, context }) => {
    await ready(page);
    const popup = context.waitForEvent('page');
    await page.locator(HERO_RESUME).click({ modifiers: ['Control'] });
    await popup;
    await expect(page.locator(DIALOG)).toBeHidden();
  });

  test('download link has the download attribute and filename', async ({ page }) => {
    await ready(page);
    await page.locator(HERO_RESUME).click();
    const download = page.locator(`${DIALOG} a[download]`);
    await expect(download).toHaveAttribute('download', 'Ruman-Malik-Resume.pdf');
    await expect(download).toHaveAttribute('href', /\/resume\.pdf/);
    const tab = page.locator(`${DIALOG} a[target="_blank"]`);
    await expect(tab).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('failed preview shows a message and keeps the download button', async ({ page }) => {
    await page.route('**/resume-preview.webp', (route) => route.abort());
    await ready(page);
    await page.locator(HERO_RESUME).click();
    await expect(page.locator(`${DIALOG} .resume-dialog-error`)).toBeVisible();
    await expect(page.locator(`${DIALOG} a[download]`)).toBeVisible();
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`axe passes with the dialog open (${theme})`, async ({ page }) => {
      await ready(page, theme === 'dark' ? 'dark' : undefined);
      await page.locator(HERO_RESUME).click();
      await expect(page.locator(`${DIALOG} img`)).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .include(DIALOG)
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }

  test('the contact folder opens on keyboard focus', async ({ page }) => {
    await ready(page);
    const folder = page.locator('#contact .resume-folder');
    await folder.scrollIntoViewIfNeeded();
    const paper = folder.locator('.rf-paper');
    expect(await paper.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    await page.keyboard.press('Tab');
    await folder.focus();
    await expect(folder).toBeFocused();
    await expect
      .poll(() => paper.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe('none');
  });

  test('every resume link is a real anchor to the PDF', async ({ page }) => {
    await ready(page);
    const hrefs = await page
      .locator('a[data-resume-trigger]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const href of hrefs) expect(href).toBe('/resume.pdf?v=5');
  });
});

test('resume-preview.webp is not older than resume.pdf', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'file check once');
  const pdf = statSync(join(process.cwd(), 'public/resume.pdf')).mtimeMs;
  const preview = statSync(join(process.cwd(), 'public/resume-preview.webp')).mtimeMs;
  expect(
    preview,
    'Run `pnpm resume:preview` after changing public/resume.pdf',
  ).toBeGreaterThanOrEqual(pdf);
});
