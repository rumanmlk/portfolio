import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { splitHeadline } from '@/components/sections/Hero';
import { content } from '@/content/content';

export const alt = `${content.site.name}, ${content.site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Read once at module scope: the assets do not depend on the request.
const anton = await readFile(join(process.cwd(), 'src/assets/fonts/Anton-Regular.ttf'));
const mono = await readFile(join(process.cwd(), 'src/assets/fonts/JetBrainsMono-Regular.woff'));

const C = {
  bg: '#FFFBF2',
  dots: '#F3E7CC',
  ink: '#14121F',
  accent: '#FF4B3E',
  yellow: '#FFD93D',
  sky: '#BFE6FF',
  surface: '#FFFFFF',
  muted: '#4A4660',
};

/** B16: share image in the site style, rendered at build time. */
export default async function Image() {
  const { lines, lastLead, lastWord } = splitHeadline(content.hero.lines);
  const headline = [...lines, lastLead].filter(Boolean).join(' ').toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(circle, ${C.dots} 2px, transparent 2.4px)`,
        backgroundSize: '14px 14px',
        color: C.ink,
        fontFamily: 'Anton',
        position: 'relative',
      }}
    >
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        style={{ position: 'absolute', top: 56, right: 72 }}
      >
        <path
          d="M12 1 C12.6 7.4 16.6 11.4 23 12 C16.6 12.6 12.6 16.6 12 23 C11.4 16.6 7.4 12.6 1 12 C7.4 11.4 11.4 7.4 12 1 Z"
          fill={C.yellow}
          stroke={C.ink}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '8px 18px',
            border: `3px solid ${C.ink}`,
            backgroundColor: C.yellow,
            boxShadow: `5px 5px 0 ${C.ink}`,
            fontFamily: 'JetBrains Mono',
            fontSize: 24,
            letterSpacing: 1,
          }}
        >
          {content.ui.pressStart}
        </div>
        <div style={{ display: 'flex', fontSize: 132, lineHeight: 0.95, marginTop: 10 }}>
          {headline}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            position: 'relative',
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -8,
              right: -8,
              bottom: 2,
              height: 46,
              backgroundColor: C.yellow,
            }}
          />
          <div style={{ display: 'flex', fontSize: 132, lineHeight: 0.95, color: C.accent }}>
            {lastWord.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 30px',
            border: `3px solid ${C.ink}`,
            backgroundColor: C.surface,
            boxShadow: `9px 9px 0 ${C.accent}`,
          }}
        >
          <div style={{ display: 'flex', fontSize: 54, lineHeight: 1 }}>
            {content.site.name.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: 24,
              color: C.muted,
              marginTop: 10,
            }}
          >
            {content.ui.classLabel} · {content.site.location.toUpperCase()}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            color: C.muted,
          }}
        >
          {content.site.url.replace(/^https?:\/\//, '')}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Anton', data: anton, style: 'normal', weight: 400 },
        { name: 'JetBrains Mono', data: mono, style: 'normal', weight: 400 },
      ],
    },
  );
}
