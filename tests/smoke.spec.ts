import { devices, expect, test, type Page } from '@playwright/test';

import { content } from '../src/content/content';

import { skipIntro } from './helpers';

const INTRO = '.intro';

async function waitForScene(page: Page) {
  await expect(page.locator('.intro-scene')).toBeVisible({ timeout: 10_000 });
}

test.describe('content without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('renders every section, light theme, no intro', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /i build ai/i })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('article.project-card')).toHaveCount(content.projects.length);
    await expect(page.locator('.experience-row')).toHaveCount(content.experience.length);
    await expect(page.locator('#stack')).toBeVisible();
    for (const group of content.stack) {
      for (const item of group.items) {
        await expect(page.locator('#stack .stack-name').filter({ hasText: item.name })).toHaveCount(
          1,
        );
      }
    }
    await expect(page.locator('#contact')).toBeVisible();
    await expect(page.locator(INTRO)).toBeHidden();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    // Reveal wrappers must not hide content when scripts never run.
    const hidden = await page.locator('[style*="opacity: 0"]').count();
    expect(hidden).toBe(0);
  });
});

test.describe('entry sequence', () => {
  test('shows once per session and Escape skips it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(INTRO)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'on');
    await page.keyboard.press('Escape');
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 10_000 });
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'done');
    await expect(page.locator('#site')).not.toHaveAttribute('inert', '');
    const overflow = await page.evaluate(() => document.documentElement.style.overflow);
    expect(overflow).toBe('');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'off');
    // Head script flips data-intro immediately; React may take a tick to unmount.
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 10_000 });
  });

  test('Tab stays inside the intro overlay', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(INTRO)).toBeVisible();
    await waitForScene(page);
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const intro = document.querySelector('.intro');
        return Boolean(intro && document.activeElement && intro.contains(document.activeElement));
      });
      expect(inside).toBe(true);
    }
  });

  test('Enter advances the dialogue and then enters the site', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);
    for (let i = 0; i < content.intro.lines.length * 2 + 1; i += 1) {
      if ((await page.locator(INTRO).count()) === 0) break;
      await page.keyboard.press('Enter');
      await page.waitForTimeout(150);
    }
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 10_000 });
    await expect(page.locator('h1')).toBeFocused();
  });

  test('clicking anywhere advances and the Skip button leaves', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page);
    await page.mouse.click(200, 200);
    // The click can already finish the intro, so Skip may be gone by the time it is actionable
    // (WebKit's stability check is slower than the exit). Either way the intro must end.
    await page
      .getByRole('button', { name: content.ui.intro.skip })
      .click({ timeout: 3000 })
      .catch(() => undefined);
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 10_000 });
    await expect(page.locator('.avatar-landing svg:visible').first()).toBeVisible();
  });

  test('is skipped under prefers-reduced-motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'off');
    await expect(page.locator(INTRO)).toHaveCount(0);
    await context.close();
  });
});

test.describe('layout', () => {
  for (const width of [320, 768, 1280]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await skipIntro(page);
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('desktop sidebar keeps the avatar and name in view', async ({ page }) => {
    await skipIntro(page);
    const sizes = [
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 1280, height: 720 },
      { width: 1024, height: 640 },
      { width: 1024, height: 500 },
    ];
    for (const viewport of sizes) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      for (const sel of ['.sidebar .avatar-tile', '.sidebar-name']) {
        const box = await page.locator(sel).boundingBox();
        expect(box, `${sel} ${JSON.stringify(viewport)}`).toBeTruthy();
        expect(box!.y).toBeGreaterThanOrEqual(-1);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
      }
      if (viewport.height >= 600) {
        const scrolls = await page.evaluate(() => {
          const nodes = ['.sidebar', '.sidebar-rest', '.sidebar-pin']
            .map((sel) => document.querySelector(sel))
            .filter((node): node is HTMLElement => node instanceof HTMLElement);
          return nodes.some((node) => node.scrollHeight > node.clientHeight + 1);
        });
        expect(scrolls, JSON.stringify(viewport)).toBe(false);
      }
    }
  });

  test('no horizontal overflow at 320px with 200% zoom', async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto('/');
    await page.evaluate(() => {
      (document.documentElement.style as unknown as { zoom: string }).zoom = '2';
    });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('theme', () => {
  test('first visit is light even with a dark system preference; toggle persists', async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await skipIntro(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#FFFBF2');

    const toggle = page
      .getByRole('switch', { name: content.ui.themeToggle.label })
      .locator('visible=true')
      .first();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await toggle.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0B0B0C');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await context.close();
  });
});

test.describe('stack', () => {
  test('lists all tools under six group labels in order, names always visible', async ({
    page,
  }) => {
    await skipIntro(page);
    await page.goto('/');
    const section = page.locator('#stack');
    await section.scrollIntoViewIfNeeded();
    await expect(
      section.getByRole('heading', { level: 2, name: content.ui.sections.stack }),
    ).toBeVisible();
    const labels = content.stack.map((g) => g.group);
    await expect(section.locator('.stack-label')).toHaveText(labels);
    const names = content.stack.flatMap((g) => g.items.map((i) => i.name));
    await expect(section.locator('.stack-name')).toHaveText(names);
    await expect(page.getByText('NOW BUILDING', { exact: true })).toHaveCount(0);
    await expect(page.getByText('USE DAILY', { exact: true })).toHaveCount(0);
    await expect(page.getByText('USED SOMETIMES', { exact: true })).toHaveCount(0);
    await expect(page.getByText('LEARNING', { exact: true })).toHaveCount(0);
  });

  test('desktop hover lifts the FastAPI keycap', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'hover tooltips are desktop-only');
    await skipIntro(page);
    await page.goto('/');
    const cell = page.locator('#stack .stack-tool').filter({ hasText: 'FastAPI' });
    await cell.scrollIntoViewIfNeeded();
    await cell.hover();
    await expect
      .poll(async () => {
        await cell.hover();
        return cell.evaluate((el) => {
          const t = getComputedStyle(el).transform;
          if (!t || t === 'none') return NaN;
          const m = t.match(/matrix(?:3d)?\(([^)]+)\)/);
          if (!m) return NaN;
          const parts = m[1]!.split(',').map((v) => Number(v.trim()));
          return t.startsWith('matrix3d') ? parts[13]! : parts[5]!;
        });
      })
      .toBeCloseTo(-4, 0);
  });

  test('touch tap toggles is-active', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 7'],
      hasTouch: true,
    });
    const page = await context.newPage();
    await skipIntro(page);
    await page.goto('/');
    await page.evaluate(() => document.getElementById('stack')?.scrollIntoView());
    const cell = page.locator('#stack .stack-tool').filter({ hasText: 'Python' });
    // StackTips is a lazy chunk mounted after idle; retry the tap until its handler is attached.
    await expect(async () => {
      await cell.tap();
      await expect(cell).toHaveClass(/is-active/, { timeout: 1000 });
    }).toPass({ timeout: 20_000 });
    await page.locator('#stack-title').tap();
    await expect(cell).not.toHaveClass(/is-active/);
    await context.close();
  });

  test('deep link /#inventory lands on Stack', async ({ page }) => {
    await page.goto('/#inventory');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'off');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const top = await page.evaluate(
      () => document.getElementById('stack')!.getBoundingClientRect().top,
    );
    expect(top).toBeGreaterThanOrEqual(-2);
    expect(top).toBeLessThanOrEqual(160);
  });
});

test.describe('navigation', () => {
  test('deep link /#work skips the intro and lands on the section', async ({ page }) => {
    await page.goto('/#work');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'off');
    await expect(page.locator(INTRO)).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const top = await page.evaluate(
      () => document.getElementById('work')!.getBoundingClientRect().top,
    );
    expect(top).toBeGreaterThanOrEqual(-2);
    expect(top).toBeLessThanOrEqual(160);
  });

  test('nav click scrolls, updates the hash and moves focus', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/');
    const link = page
      .getByRole('link', { name: content.ui.navLabels.experience })
      .locator('visible=true')
      .first();
    await link.click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator('#experience-title')).toBeFocused();
    // Lenis may re-aim once after content-visibility sections resolve their real height.
    await expect
      .poll(
        () =>
          page.evaluate(() => document.getElementById('experience')!.getBoundingClientRect().top),
        { timeout: 8000 },
      )
      .toBeGreaterThanOrEqual(-2);
    await expect
      .poll(
        () =>
          page.evaluate(() => document.getElementById('experience')!.getBoundingClientRect().top),
        { timeout: 8000 },
      )
      .toBeLessThanOrEqual(160);
  });

  test('skip link is the first focusable element', async ({ page, isMobile }, testInfo) => {
    test.skip(!!isMobile, 'mobile browsers keep chrome UI in the tab order');
    test.skip(testInfo.project.name !== 'chromium', 'skip-link tab order checked on chromium');
    await skipIntro(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'off');
    // Wait until intro client teardown is done so it cannot steal first Tab.
    await expect(page.locator(INTRO)).toHaveCount(0);
    await page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null;
      a?.blur?.();
    });
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: content.ui.skipToContent });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    // SmoothScroll lands focus on the first heading inside main (not #main itself).
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const main = document.getElementById('main');
          const active = document.activeElement;
          return Boolean(main && active && main.contains(active));
        }),
      )
      .toBe(true);
  });
});

test.describe('work', () => {
  test('lists all projects in order with kind chips and no filters', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'All' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Company' })).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'Filter projects' })).toHaveCount(0);
    const cards = page.locator('article.project-card');
    await expect(cards).toHaveCount(content.projects.length);
    const featuredCount = content.projects.filter((p) => p.featured).length;
    expect(content.projects.slice(0, featuredCount).every((p) => p.featured)).toBe(true);
    await page.locator('.work-more-summary').click();
    for (let i = 0; i < content.projects.length; i += 1) {
      const project = content.projects[i]!;
      const card = cards.nth(i);
      await expect(card.getByRole('heading', { level: 3 })).toContainText(project.title);
      await expect(card.locator('.project-number')).toHaveText(String(i + 1).padStart(2, '0'));
      await expect(card.getByText(content.ui.kinds[project.kind], { exact: true })).toBeVisible();
      await expect(card.locator('.project-headline')).toHaveText(project.headline);
    }
  });

  test('every role project resolves to a Work project title', () => {
    const titles = new Set(content.projects.map((p) => p.title));
    for (const role of content.experience) {
      for (const name of role.projects ?? []) expect(titles.has(name), name).toBe(true);
    }
  });

  test('extra projects are collapsed until opened and EP. wording is gone', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/');
    const more = page.locator('details.work-more');
    await expect(more).not.toHaveAttribute('open', '');
    const featuredCount = content.projects.filter((p) => p.featured).length;
    await expect(page.locator('article.project-card:visible')).toHaveCount(featuredCount);
    await page.locator('.work-more-summary').click();
    await expect(page.locator('article.project-card:visible')).toHaveCount(content.projects.length);
    await expect(page.getByText('EP.', { exact: true })).toHaveCount(0);
  });

  test('print shows every project even while the extras are collapsed', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/');
    await expect(page.locator('details.work-more')).not.toHaveAttribute('open', '');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('article.project-card:visible')).toHaveCount(content.projects.length);
  });
});

test.describe('contact', () => {
  test('copy email announces and reverts', async ({ page, context }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'webkit',
      'clipboard permissions are Chromium-only',
    );
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {
      /* mobile Chromium may reject clipboard grants */
    });
    await skipIntro(page);
    await page.goto('/');
    const button = page.getByRole('button', { name: content.ui.copyEmail });
    await button.scrollIntoViewIfNeeded();
    await button.click();
    // Copied when clipboard works; fallback selects the address when it does not.
    await expect(
      page
        .getByRole('button', { name: content.ui.copied })
        .or(page.getByRole('button', { name: content.ui.copyFailed })),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: content.ui.copyEmail })).toBeVisible({
      timeout: 4000,
    });
  });
});

test.describe('seo', () => {
  test('metadata, JSON-LD, OG image, sitemap, robots, manifest, 404', async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'firefox', 'SEO asset fetches are flaky under Firefox');
    await skipIntro(page);
    await page.goto('/');
    await expect(page).toHaveTitle(`${content.site.name} | ${content.site.title}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(ld ?? '{}')['@type']).toBe('Person');

    const og = await request.get('/opengraph-image');
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type']).toContain('image/png');
    expect((await request.get('/sitemap.xml')).status()).toBe(200);
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect((await request.get('/manifest.webmanifest')).status()).toBe(200);
    expect((await request.get('/icon.svg')).status()).toBe(200);

    const missing = await page.goto('/definitely-missing');
    expect(missing?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { level: 1, name: content.ui.notFound.title }),
    ).toBeVisible();
  });
});
