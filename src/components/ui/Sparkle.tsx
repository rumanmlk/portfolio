type Props = {
  size?: number;
  fill?: 'yellow' | 'sky' | 'pink';
  className?: string;
  style?: React.CSSProperties;
};

const fills = { yellow: 'var(--yellow)', sky: 'var(--sky-deep)', pink: 'var(--pink)' } as const;

/** Decorative 4-point star. Always aria-hidden. */
export function Sparkle({ size = 28, fill = 'yellow', className = '', style }: Props) {
  return (
    <svg
      className={`sparkle ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path
        d="M12 1 C12.6 7.4 16.6 11.4 23 12 C16.6 12.6 12.6 16.6 12 23 C11.4 16.6 7.4 12.6 1 12 C7.4 11.4 11.4 7.4 12 1 Z"
        fill={fills[fill]}
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
