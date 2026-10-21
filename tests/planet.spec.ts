import { expect, test, type Page } from '@playwright/test';

import { skipIntro } from './helpers';

const CANVAS = '.planet-canvas canvas';

/** Capable desktop: seen intro, plenty of cores and memory. */
const capable = (page: Page) =>
  skipIntro(page, () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    // Vercel Analytics script 404s outside Vercel; unrelated to the scene.
    if (m.type() === 'error' && !/_vercel|Failed to load resource/.test(m.text()))
      errors.push(m.text());
  });
  return errors;
}

// Re-enable WebGL (the default config disables it to keep other tests light).
test.use({ launchOptions: { args: [] } });

test.describe('halftone planet', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop WebGL once on chromium');
  });

  test('mounts on desktop after the intro with no console errors', async ({ page }) => {
    const errors = trackErrors(page);
    await capable(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator(CANVAS)).toBeAttached({ timeout: 15_000 });
    await expect(page.locator('.hero-planet .planet-static')).toHaveCount(0);
    const box = await page.locator('.hero-planet').boundingBox();
    expect(box!.width).toBeGreaterThan(300);
    expect(errors).toEqual([]);
  });

  test('is absent below 1024px and keeps the CSS planet', async ({ page }) => {
    await capable(page);
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(3500);
    await expect(page.locator(CANVAS)).toHaveCount(0);
    await expect(page.locator('.hero-planet .planet-static')).toHaveCount(1);
  });

  test('is absent on low-end devices', async ({ page }) => {
    await skipIntro(page, () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(3500);
    await expect(page.locator(CANVAS)).toHaveCount(0);
  });

  test('reduced motion renders a still frame and no loop', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await capable(page);
    await page.goto('/');
    await expect(page.locator(CANVAS)).toBeAttached({ timeout: 15_000 });
    await page.waitForTimeout(500);
    const first = Number(await page.locator(CANVAS).getAttribute('data-frames'));
    await page.waitForTimeout(1500);
    const later = Number(await page.locator(CANVAS).getAttribute('data-frames'));
    expect(later).toBe(first);
    expect(first).toBeLessThanOrEqual(3);
    await context.close();
  });

  test('theme toggle recolors the same canvas without remounting', async ({ page }) => {
    await capable(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const canvas = page.locator(CANVAS);
    await expect(canvas).toBeAttached({ timeout: 15_000 });
    await canvas.evaluate((el) => {
      (window as unknown as { __planet: Element }).__planet = el;
    });
    const before = await canvas.getAttribute('data-base');
    await page.locator('.sidebar .theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(canvas).not.toHaveAttribute('data-base', before!);
    const same = await canvas.evaluate(
      (el) => (window as unknown as { __planet: Element }).__planet === el,
    );
    expect(same).toBe(true);
  });
});
