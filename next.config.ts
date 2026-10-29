import type { NextConfig } from 'next';

import { assertSiteUrlForBuild } from './src/lib/site-url';

assertSiteUrlForBuild();

const isDev = process.env.NODE_ENV === 'development';

/**
 * Nonce-based CSP would force dynamic rendering and break the static shell, and inline
 * scripts (theme/intro, React flight payload) cannot be hashed ahead of time. So scripts and
 * styles keep 'unsafe-inline'; the policy still pins every other source to same-origin and
 * blocks framing, plugins, base-tag injection and form posts. Vercel Analytics loads from
 * /_vercel/insights on this origin. Dev needs eval (React stacks) and ws (HMR).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // Evaluated once at build time so the footer year never reads the clock during prerender.
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  turbopack: {
    // Tiny modern polyfill-module (Array.at, Object.hasOwn, …) is enough for
    // our browserslist; alias away the default require so it is not duplicated.
    resolveAlias: {
      '../build/polyfills/polyfill-module': './src/lib/empty-polyfill.js',
      'next/dist/build/polyfills/polyfill-module': './src/lib/empty-polyfill.js',
    },
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        ],
      },
      {
        source: '/resume.pdf',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

export default nextConfig;
