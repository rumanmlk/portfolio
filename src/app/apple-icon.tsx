import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Avatar head on cream for iOS home screens; generated at build time. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFBF2',
      }}
    >
      <svg width="150" height="150" viewBox="26 10 68 84">
        <rect
          x="34"
          y="28"
          width="52"
          height="60"
          rx="22"
          fill="#FFF4E6"
          stroke="#14121F"
          strokeWidth="3"
        />
        <path
          d="M30 54 Q26 20 60 16 Q94 20 90 54 L84 38 L76 50 L67 34 L58 50 L48 36 L42 52 L36 40 Z"
          fill="#FF4B3E"
          stroke="#14121F"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M42 52 L54 50" stroke="#14121F" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 50 L78 52" stroke="#14121F" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="48" cy="63" rx="7.5" ry="8.5" fill="#fff" stroke="#14121F" strokeWidth="3" />
        <ellipse cx="72" cy="63" rx="7.5" ry="8.5" fill="#fff" stroke="#14121F" strokeWidth="3" />
        <circle cx="48" cy="63" r="3.8" fill="#14121F" />
        <circle cx="72" cy="63" r="3.8" fill="#14121F" />
        <path
          d="M54 77 Q60 80 66 77"
          fill="none"
          stroke="#14121F"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    size,
  );
}
