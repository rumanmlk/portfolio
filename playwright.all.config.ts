import { defineConfig, devices } from '@playwright/test';

import base from './playwright.config';

/**
 * Best-effort full browser matrix (Chromium + mobile + Firefox + WebKit).
 * Single worker and longer timeouts — WebKit/Firefox can be flaky on Windows hosts.
 */
export default defineConfig({
  ...base,
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    ...base.use,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    ...(base.projects ?? []),
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 800 },
        launchOptions: { timeout: 90_000 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 800 },
        launchOptions: { timeout: 90_000 },
      },
    },
  ],
});
