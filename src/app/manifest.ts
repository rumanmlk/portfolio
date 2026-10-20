import type { MetadataRoute } from 'next';

import { content } from '@/content/content';
import { THEME_COLORS } from '@/lib/theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${content.site.name} | ${content.site.title}`,
    short_name: content.site.shortName,
    description: content.site.description,
    start_url: '/',
    display: 'browser',
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
