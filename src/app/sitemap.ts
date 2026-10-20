import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: process.env.NEXT_PUBLIC_BUILD_DATE ?? '2026-01-01',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
