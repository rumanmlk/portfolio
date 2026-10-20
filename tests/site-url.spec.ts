import { expect, test } from '@playwright/test';

import { isValidProductionSiteUrl, resolveSiteUrl } from '../src/lib/site-url';

test.describe('site URL validator', () => {
  test('accepts a clean https origin', () => {
    expect(isValidProductionSiteUrl('https://rumanmalik.com')).toBe(true);
    expect(
      resolveSiteUrl({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://rumanmalik.com' }),
    ).toBe('https://rumanmalik.com');
  });

  test('rejects missing, http, trailing slash, path, and localhost', () => {
    expect(isValidProductionSiteUrl('')).toBe(false);
    expect(isValidProductionSiteUrl('http://rumanmalik.com')).toBe(false);
    expect(isValidProductionSiteUrl('https://rumanmalik.com/')).toBe(false);
    expect(isValidProductionSiteUrl('https://rumanmalik.com/portfolio')).toBe(false);
    expect(isValidProductionSiteUrl('https://localhost:3000')).toBe(false);
    expect(isValidProductionSiteUrl('http://localhost:3000')).toBe(false);

    expect(() => resolveSiteUrl({ VERCEL_ENV: 'production' })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(() =>
      resolveSiteUrl({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://rumanmalik.com/' }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  test('preview falls back to VERCEL_URL; local uses localhost', () => {
    expect(resolveSiteUrl({ VERCEL_ENV: 'preview', VERCEL_URL: 'my-app.vercel.app' })).toBe(
      'https://my-app.vercel.app',
    );
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
  });
});
