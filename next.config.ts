import type { NextConfig } from 'next';

import { assertSiteUrlForBuild } from './src/lib/site-url';

assertSiteUrlForBuild();

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
