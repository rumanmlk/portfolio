'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AvatarSvg } from '@/components/avatar/AvatarSvg';
import { AvatarTile } from '@/components/avatar/AvatarTile';
import type { AvatarMotionOptions, AvatarPartRefs } from '@/components/avatar/useAvatarMotion';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { chrome } from '@/content/chrome';
import { whenIdle } from '@/lib/device';

/** Motion driver loads in its own chunk after hydration; the SVG itself is server rendered. */
const AvatarMotion = dynamic(() => import('@/components/avatar/AvatarMotion'), { ssr: false });

export type AvatarPlacement = 'sidebar' | 'mobile';

const SIZES: Record<AvatarPlacement, { tile: number; svg: number }> = {
  sidebar: { tile: 144, svg: 132 },
  mobile: { tile: 44, svg: 38 },
};

type Props = { placement: AvatarPlacement };

/** Avatar in its tile. Sidebar copy is animated; the 44px mobile copy is static (B9). */
export function Avatar({ placement }: Props) {
  const { tile, svg } = SIZES[placement];
  const animated = placement === 'sidebar';
  return (
    <AvatarTile size={tile} shadow={placement === 'mobile' ? 3 : 5} className="avatar-landing">
      {animated ? (
        <AnimatedAvatar size={svg} />
      ) : (
        <AvatarSvg size={svg} label={chrome.ui.avatarAlt} decorative />
      )}
    </AvatarTile>
  );
}

type AnimatedProps = {
  size: number;
  options?: AvatarMotionOptions;
  decorative?: boolean;
  className?: string;
};

/**
 * True only after the sidebar is actually on screen (1024px and up) and the
 * browser has gone idle. Below that width the sidebar is display:none, so
 * motion/react is never fetched.
 */
function useDesktopMotion() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    let cancelIdle = () => {};

    const sync = () => {
      cancelIdle();
      if (!mq.matches) {
        setReady(false);
        return;
      }
      cancelIdle = whenIdle(() => setReady(true), 3000);
    };

    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      cancelIdle();
    };
  }, []);

  return ready;
}

/** Avatar SVG plus the lazily loaded behavior driver. Used by the sidebar and the intro. */
export function AnimatedAvatar({ size, options, decorative = false, className }: AnimatedProps) {
  const motionReady = useDesktopMotion();
  const svg = useRef<SVGSVGElement>(null);
  const head = useRef<SVGGElement>(null);
  const eyeL = useRef<SVGEllipseElement>(null);
  const eyeR = useRef<SVGEllipseElement>(null);
  const pupilL = useRef<SVGCircleElement>(null);
  const pupilR = useRef<SVGCircleElement>(null);

  const parts = useMemo<AvatarPartRefs>(() => ({ svg, head, eyeL, eyeR, pupilL, pupilR }), []);

  return (
    <>
      <AvatarSvg
        size={size}
        label={chrome.ui.avatarAlt}
        decorative={decorative}
        className={className}
        svgRef={svg}
        partRefs={{ head, eyeL, eyeR, pupilL, pupilR }}
      />
      {motionReady ? (
        <ErrorBoundary>
          <AvatarMotion parts={parts} options={options} />
        </ErrorBoundary>
      ) : null}
    </>
  );
}
