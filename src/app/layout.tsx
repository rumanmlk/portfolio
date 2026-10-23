import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

import { Boot } from '@/components/shell/Boot';
import { Enhancements } from '@/components/shell/Enhancements';
import { JsonLd } from '@/components/shell/JsonLd';
import { content } from '@/content/content';
import { SITE_URL } from '@/lib/env';
import { getIntroScript, themeScript } from '@/lib/head-scripts';
import { THEME_COLORS } from '@/lib/theme';

import './globals.css';

/** Self-hosted latin slices (no build- or dev-time font download). */
const anton = localFont({
  src: '../assets/fonts/Anton-latin.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-anton',
  adjustFontFallback: 'Arial',
});

/** Variable font: one file covers 400 and 500. */
const plex = localFont({
  src: '../assets/fonts/IBMPlexSans-latin.woff2',
  weight: '400 500',
  style: 'normal',
  display: 'swap',
  variable: '--font-plex',
  adjustFontFallback: 'Arial',
});

/** Variable font: one file covers 400 and 500. */
const jetbrains = localFont({
  src: '../assets/fonts/JetBrainsMono-latin.woff2',
  weight: '400 500',
  style: 'normal',
  display: 'swap',
  variable: '--font-jetbrains',
  adjustFontFallback: false,
});

/**
 * DotGothic16 is a CJK family; Google splits it into 120+ unicode-range slices
 * and next/font/google would emit an @font-face for each (100KB of CSS). The
 * pixel font only ever renders tiny latin tags, so we self-host the latin slice.
 */
const dotgothic = localFont({
  src: '../assets/fonts/DotGothic16-latin.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-dotgothic',
  adjustFontFallback: 'Arial',
  preload: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

const title = `${content.site.name} | ${content.site.title}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${content.site.name}` },
  description: content.site.description,
  keywords: [...content.site.keywords],
  authors: [{ name: content.site.name, url: SITE_URL }],
  creator: content.site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title,
    description: content.site.description,
    siteName: content.site.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: content.site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: THEME_COLORS.light,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${anton.variable} ${plex.variable} ${jetbrains.variable} ${dotgothic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: getIntroScript(content.features.intro) }} />
        <noscript>
          <style>{`.intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="halftone themed min-h-dvh">
        <a href="#main" className="skip-link">
          {content.ui.skipToContent}
        </a>
        <Boot introEnabled={content.features.intro} />
        {children}
        <Enhancements />
        <JsonLd />
        <Analytics />
      </body>
    </html>
  );
}
