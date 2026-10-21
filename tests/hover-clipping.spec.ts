import { expect, test, type Locator } from '@playwright/test';

import { skipIntro } from './helpers';

type Clip = { el: string; reason: string; rect: { l: number; t: number; r: number; b: number } };

/**
 * Hover shifts an element 3px up/left and grows its shadow up to 10px right/bottom.
 * Returns every ancestor that would clip that visual rectangle, plus whether the
 * target is the topmost element 2px inside its left edge (i.e. nothing covers it).
 */
async function inspectHover(target: Locator) {
  return target.evaluate((el) => {
    const b = el.getBoundingClientRect();
    const visual = { l: b.left - 3, t: b.top - 3, r: b.right + 10, b: b.bottom + 10 };
    const clips: Clip[] = [];
    for (let a = el.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const reasons: string[] = [];
      const clipsX = cs.overflowX !== 'visible';
      const clipsY = cs.overflowY !== 'visible';
      if (clipsX) reasons.push(`overflow-x:${cs.overflowX}`);
      if (clipsY) reasons.push(`overflow-y:${cs.overflowY}`);
      if (cs.contentVisibility !== 'visible')
        reasons.push(`content-visibility:${cs.contentVisibility}`);
      if (/paint|content|strict/.test(cs.contain)) reasons.push(`contain:${cs.contain}`);
      if (cs.clipPath !== 'none') reasons.push(`clip-path:${cs.clipPath}`);
      if (!reasons.length) continue;
      const r = a.getBoundingClientRect();
      const full = cs.contentVisibility !== 'visible' || /paint|content|strict/.test(cs.contain);
      // The document scroller clips only along its own axes and is the viewport edge.
      const isRoot = a === document.documentElement || a === document.body;
      clips.push({
        el:
          a.tagName.toLowerCase() +
          (a.id ? `#${a.id}` : '') +
          `.${String(a.className).split(' ')[0]}`,
        reason: reasons.join(' '),
        rect: {
          l: clipsX || full ? r.left + parseFloat(cs.borderLeftWidth) : -Infinity,
          r: clipsX || full ? r.right - parseFloat(cs.borderRightWidth) : Infinity,
          t: !isRoot && (clipsY || full) ? r.top + parseFloat(cs.borderTopWidth) : -Infinity,
          b: !isRoot && (clipsY || full) ? r.bottom - parseFloat(cs.borderBottomWidth) : Infinity,
        },
      });
    }
    const hit = document.elementFromPoint(b.left + 2, b.top + b.height / 2);
    return { visual, clips, covered: !(hit && el.contains(hit)), hit: hit?.className ?? null };
  });
}

const TARGETS: Record<string, string> = {
  'project card': '.project-card',
  'hero primary button': '.hero-actions .btn >> nth=0',
  'hero resume button': '.hero-actions .btn >> nth=1',
  'stack cell': '.stack-tool',
  'sidebar nav link': '.sidebar .nav-link >> nth=1',
  'resume folder': '#contact .resume-folder',
  'copy email button': '#contact .copy-email button',
};

for (const width of [1280, 1440, 1920]) {
  test.describe(`hover is never clipped at ${width}px`, () => {
    for (const [name, selector] of Object.entries(TARGETS)) {
      test(name, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'chromium', 'desktop hover only');
        await skipIntro(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');
        await page.evaluate(() => document.fonts.ready);
        const target = page.locator(selector).first();
        await target.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await target.hover();
        await page.waitForTimeout(500);
        const { visual, clips, covered, hit } = await inspectHover(target);
        for (const c of clips) {
          const inside =
            visual.l >= c.rect.l - 0.5 &&
            visual.r <= c.rect.r + 0.5 &&
            visual.t >= c.rect.t - 0.5 &&
            visual.b <= c.rect.b + 0.5;
          expect(
            inside,
            `${c.el} (${c.reason}) clips ${JSON.stringify({ visual, rect: c.rect })}`,
          ).toBe(true);
        }
        expect(covered, `target covered by ${hit}`).toBe(false);
      });
    }
  });
}
