import AxeBuilder from '@axe-core/playwright';
import { devices, expect, test, type Page } from '@playwright/test';

import { skipIntro } from './helpers';

async function audit(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .exclude('nextjs-portal')
    .analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

test.describe('accessibility (axe-core)', () => {
  test('home page, light theme', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'axe color-contrast is flaky in Firefox headless',
    );
    test.skip(testInfo.project.name === 'mobile', 'touch keycap covered separately');
    await skipIntro(page);
    await page.goto('/');
    await page.locator('#stack').scrollIntoViewIfNeeded();
    await expect(page.locator('#stack .stack-slab')).toBeVisible();
    const cell = page.locator('#stack .stack-tool').first();
    await cell.hover();
    await expect(cell.locator('.stack-tip')).toBeVisible();
    await page.waitForTimeout(400);
    await audit(page);
  });

  test('home page, dark theme', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'axe color-contrast is flaky in Firefox headless',
    );
    test.skip(testInfo.project.name === 'mobile', 'touch keycap covered separately');
    await skipIntro(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('#stack').scrollIntoViewIfNeeded();
    await expect(page.locator('#stack .stack-slab')).toBeVisible();
    const cell = page.locator('#stack .stack-tool').first();
    await cell.hover();
    await expect(cell.locator('.stack-tip')).toBeVisible();
    await page.waitForTimeout(400);
    await audit(page);
  });

  test('stack keycap is-active under touch', async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'touch keycap axe once on chromium');
    const context = await browser.newContext({
      ...devices['Pixel 7'],
      hasTouch: true,
    });
    const page = await context.newPage();
    await skipIntro(page);
    await page.goto('/');
    await page.evaluate(() => document.getElementById('stack')?.scrollIntoView());
    // StackTips mounts after idle; match the smoke touch wait.
    await page.waitForTimeout(3500);
    const cell = page.locator('#stack .stack-tool').filter({ hasText: 'Python' });
    await cell.tap();
    await expect(cell).toHaveClass(/is-active/);
    await expect(cell.locator('.stack-tip')).toBeVisible();
    await audit(page);
    await context.close();
  });

  test('entry sequence dialog', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro')).toBeVisible({ timeout: 10_000 });
    // Loading screen is 0.9–1.8s; Firefox/WebKit can need longer before the scene mounts.
    await expect(page.locator('.intro-scene')).toBeVisible({ timeout: 20_000 });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('.intro')
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('404 page', async ({ page }) => {
    await page.goto('/missing-page');
    await audit(page);
  });
});
