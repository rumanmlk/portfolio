import type { RefObject } from 'react';

import { AvatarSvg } from '@/components/avatar/AvatarSvg';
import { AvatarTile } from '@/components/avatar/AvatarTile';
import { chrome } from '@/content/chrome';

type Props = {
  barRef: RefObject<HTMLDivElement | null>;
  labelRef: RefObject<HTMLSpanElement | null>;
};

/** Screen 1 (B11): avatar tile, name, segmented progress bar. Server rendered. */
export function IntroLoading({ barRef, labelRef }: Props) {
  return (
    <div className="intro-screen intro-loading">
      <AvatarTile size={192} shadow={5}>
        <AvatarSvg size={180} label={chrome.ui.avatarAlt} decorative />
      </AvatarTile>
      <p className="intro-loading-name display">{chrome.siteName}</p>
      <div
        className="intro-progress"
        role="progressbar"
        aria-label={chrome.ui.intro.loading}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div
          ref={barRef}
          className="intro-progress-fill"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
        />
      </div>
      <p className="intro-progress-label mono">
        {chrome.ui.intro.loading}{' '}
        <span ref={labelRef} aria-hidden="true">
          0%
        </span>
      </p>
    </div>
  );
}
