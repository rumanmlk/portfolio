/**
 * Single source for the public site origin.
 * Used by metadata, sitemap, robots, JSON-LD and the OG image.
 */

export type SiteUrlEnv = Record<string, string | undefined>;

const LOCAL_DEV = 'http://localhost:3000';

const PROD_HINT =
  'Set NEXT_PUBLIC_SITE_URL to your production origin, e.g. https://example.com ' +
  '(https only, no trailing slash, no path, not localhost). ' +
  'Add it in the Vercel project Environment Variables for Production.';

/**
 * True when `raw` is a valid production site origin:
 * https, no trailing slash, no path, no localhost.
 */
export function isValidProductionSiteUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  if (value !== value.trim()) return false;
  if (!value.startsWith('https://')) return false;
  if (value.endsWith('/')) return false;
  if (/localhost/i.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.pathname !== '/' && url.pathname !== '') return false;
  if (url.search || url.hash || url.username || url.password) return false;
  if (url.href.replace(/\/$/, '') !== value) return false;
  return true;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

/**
 * Resolve the public site URL from environment.
 * - production (VERCEL_ENV=production): requires a valid NEXT_PUBLIC_SITE_URL or throws
 * - preview: falls back to https://${VERCEL_URL} when the variable is missing
 * - local / other: http://localhost:3000
 */
export function resolveSiteUrl(env: SiteUrlEnv = process.env): string {
  const vercelEnv = env.VERCEL_ENV;
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();

  if (vercelEnv === 'production') {
    if (!raw || !isValidProductionSiteUrl(raw)) {
      throw new Error(
        `[site-url] Invalid or missing NEXT_PUBLIC_SITE_URL for a production build` +
          (raw ? ` (got "${raw}")` : '') +
          `. ${PROD_HINT}`,
      );
    }
    return raw;
  }

  if (raw) {
    return stripTrailingSlash(raw);
  }

  if (vercelEnv === 'preview' && env.VERCEL_URL) {
    const host = stripTrailingSlash(env.VERCEL_URL.replace(/^https?:\/\//, ''));
    return `https://${host}`;
  }

  return LOCAL_DEV;
}

/** Call from next.config so a bad production URL fails the build early. */
export function assertSiteUrlForBuild(env: SiteUrlEnv = process.env): void {
  resolveSiteUrl(env);
}

/** Public origin with no trailing slash. */
export const SITE_URL = resolveSiteUrl();
