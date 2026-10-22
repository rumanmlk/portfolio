import type { Page } from '@playwright/test';

import { INTRO_SEEN_KEY } from '../src/lib/head-scripts';

/** Mark the entry sequence as already seen, plus optional extra init code. */
export async function skipIntro(page: Page, extra?: () => void) {
  await page.addInitScript(
    ({ key }) => {
      try {
        localStorage.setItem(key, '1');
      } catch {
        /* ignore */
      }
    },
    { key: INTRO_SEEN_KEY },
  );
  if (extra) await page.addInitScript(extra);
}
