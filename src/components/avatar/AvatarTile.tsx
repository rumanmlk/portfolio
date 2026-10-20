import type { ReactNode } from 'react';

type Props = {
  /** Outer tile size in px (border included). */
  size: number;
  children: ReactNode;
  className?: string;
  /** Hard red shadow offset; 5px by default. */
  shadow?: number;
};

/**
 * The avatar always sits in this tile: 3px --line border, --avatar-frame
 * background (white in both themes) and a hard red shadow.
 */
export function AvatarTile({ size, children, className = '', shadow = 5 }: Props) {
  return (
    <div
      className={`avatar-tile ${className}`.trim()}
      style={{
        width: `var(--avatar-size, ${size}px)`,
        height: `var(--avatar-size, ${size}px)`,
        border: '3px solid var(--line)',
        background: 'var(--avatar-frame)',
        boxShadow: `${shadow}px ${shadow}px 0 var(--accent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
