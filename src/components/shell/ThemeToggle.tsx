'use client';

import { chrome } from '@/content/chrome';
import { toggleTheme } from '@/lib/theme';
import { useTheme } from '@/lib/use-theme';

type Props = { className?: string; size?: 'default' | 'small' };

/** Real button with aria-pressed; light is the default, dark is opt-in (B13). */
export function ThemeToggle({ className = '', size = 'default' }: Props) {
  const theme = useTheme();
  const dark = theme === 'dark';
  const box = size === 'small' ? 40 : 44;

  return (
    <button
      type="button"
      className={`theme-toggle frame themed inline-flex shrink-0 items-center justify-center ${className}`.trim()}
      style={{ width: box, height: box, boxShadow: 'var(--shadow-small)' }}
      aria-pressed={dark}
      onClick={() => toggleTheme()}
    >
      <span className="sr-only">{chrome.ui.themeToggle.label}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          fill={dark ? 'var(--yellow)' : 'var(--ink)'}
          stroke="var(--line)"
          strokeWidth="2"
        />
        {dark ? <rect x="5" y="5" width="6" height="6" fill="var(--ink)" /> : null}
      </svg>
    </button>
  );
}
