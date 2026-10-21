import { expect, test } from '@playwright/test';

import { skipIntro } from './helpers';

for (const width of [1280, 1440, 1920, 2560, 3440]) {
  test(`wide layout at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop widths only');
    await skipIntro(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const m = await page.evaluate(() => {
      const rect = (sel: string) => {
        const r = document.querySelector(sel)?.getBoundingClientRect();
        return r ? { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width } : null;
      };
      const root = document.documentElement;
      const lines = Array.from(document.querySelectorAll<HTMLElement>('.hero-line')).map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().right;
      });
      return {
        overflow: root.scrollWidth - root.clientWidth,
        viewport: root.clientWidth,
        sidebar: rect('.sidebar'),
        main: rect('#main'),
        content: rect('.hero-content'),
        planet: rect('.hero-planet'),
        planetDisplay: getComputedStyle(document.querySelector('.hero-planet')!).display,
        titleRight: Math.max(...lines),
        contentWidth: (() => {
          const cs = getComputedStyle(document.querySelector('#main')!);
          return parseFloat(cs.width) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        })(),
      };
    });

    expect(m.overflow).toBeLessThanOrEqual(0);
    expect(m.main!.w).toBeLessThanOrEqual(width >= 2200 ? 1400 : 1240);

    if (width >= 1600) {
      const left = m.main!.l - m.sidebar!.r;
      const right = m.viewport - m.main!.r;
      expect(Math.abs(left - right), `gutters ${left} / ${right}`).toBeLessThanOrEqual(2);
    }

    // Hero text must never reach the planet column.
    if (m.planetDisplay !== 'none' && m.planet!.t < m.content!.b - 1) {
      expect(m.titleRight, 'headline vs planet').toBeLessThanOrEqual(m.planet!.l);
      expect(m.content!.r).toBeLessThanOrEqual(m.planet!.l);
    }
    const twoColumn = m.contentWidth >= 880;
    if (twoColumn) expect(m.planet!.l).toBeGreaterThanOrEqual(m.content!.r);

    for (const sel of ['.sidebar .avatar-tile', '.sidebar-name']) {
      await expect(page.locator(sel).first()).toBeInViewport();
    }
  });
}
