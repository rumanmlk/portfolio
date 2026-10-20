import type { Ref } from 'react';

export type AvatarParts = {
  head: SVGGElement | null;
  eyes: SVGGElement | null;
  eyeL: SVGEllipseElement | null;
  eyeR: SVGEllipseElement | null;
  pupilL: SVGCircleElement | null;
  pupilR: SVGCircleElement | null;
};

type Props = {
  size: number;
  label: string;
  /** Decorative copies (mobile header, intro) can hide from assistive tech. */
  decorative?: boolean;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  partRefs?: {
    head?: Ref<SVGGElement>;
    eyeL?: Ref<SVGEllipseElement>;
    eyeR?: Ref<SVGEllipseElement>;
    pupilL?: Ref<SVGCircleElement>;
    pupilR?: Ref<SVGCircleElement>;
  };
};

/**
 * B9 base geometry, verbatim. Original character, inline SVG, no requests.
 * Hair uses --accent and outlines use --ink so it follows the tokens.
 */
export function AvatarSvg({
  size,
  label,
  decorative = false,
  className = '',
  svgRef,
  partRefs,
}: Props) {
  const a11y = decorative
    ? { 'aria-hidden': true as const, focusable: 'false' as const }
    : { role: 'img', 'aria-label': label };
  return (
    <svg
      ref={svgRef}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{ display: 'block', overflow: 'visible' }}
      {...a11y}
    >
      <path
        d="M16 120 Q18 92 60 90 Q102 92 104 120 Z"
        fill="#FFFFFF"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
      <g ref={partRefs?.head} style={{ transformOrigin: '60px 70px', transformBox: 'view-box' }}>
        <rect
          x="34"
          y="28"
          width="52"
          height="60"
          rx="22"
          fill="#FFF4E6"
          stroke="var(--ink)"
          strokeWidth="2.5"
        />
        <path
          d="M30 54 Q26 20 60 16 Q94 20 90 54 L84 38 L76 50 L67 34 L58 50 L48 36 L42 52 L36 40 Z"
          fill="var(--accent)"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M42 52 L54 50" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M66 50 L78 52" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <g>
          <ellipse
            ref={partRefs?.eyeL}
            cx="48"
            cy="63"
            rx="7.5"
            ry="8.5"
            fill="#fff"
            stroke="var(--ink)"
            strokeWidth="2.5"
            style={{ transformOrigin: '48px 63px', transformBox: 'view-box' }}
          />
          <ellipse
            ref={partRefs?.eyeR}
            cx="72"
            cy="63"
            rx="7.5"
            ry="8.5"
            fill="#fff"
            stroke="var(--ink)"
            strokeWidth="2.5"
            style={{ transformOrigin: '72px 63px', transformBox: 'view-box' }}
          />
          <circle ref={partRefs?.pupilL} cx="48" cy="63" r="3.6" fill="var(--ink)" />
          <circle ref={partRefs?.pupilR} cx="72" cy="63" r="3.6" fill="var(--ink)" />
        </g>
        <path
          d="M54 77 Q60 80 66 77"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
