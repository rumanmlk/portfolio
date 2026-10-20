import type { ReactNode } from 'react';

export type StickerFill = 'yellow' | 'sky' | 'pink' | 'pixel' | 'surface' | 'accent';
export type StickerTilt = -3 | -2 | -1 | 0 | 2;

type Props = {
  children: ReactNode;
  fill?: StickerFill;
  tilt?: StickerTilt;
  className?: string;
  as?: 'span' | 'div';
  id?: string;
};

const fillClass: Record<StickerFill, string> = {
  yellow: 'fill-yellow',
  sky: 'fill-sky',
  pink: 'fill-pink',
  accent: 'fill-accent',
  surface: 'fill-surface',
  pixel: 'sticker-pixel',
};

const tiltClass: Record<StickerTilt, string> = {
  '-3': 'tilt-3',
  '-2': 'tilt-2',
  '-1': 'tilt-1',
  '0': '',
  '2': 'tilt-2-cw',
};

/** A small label with a 2px ink border and a hard 2px shadow. Only stickers may tilt. */
export function Sticker({
  children,
  fill = 'yellow',
  tilt = 0,
  className = '',
  as = 'span',
  id,
}: Props) {
  const Tag = as;
  const cls = ['sticker', fillClass[fill], tiltClass[tilt], className].filter(Boolean).join(' ');
  return (
    <Tag id={id} className={cls}>
      {children}
    </Tag>
  );
}
