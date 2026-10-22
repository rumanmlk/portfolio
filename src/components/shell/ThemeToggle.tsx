'use client';

import { chrome } from '@/content/chrome';
import { toggleTheme } from '@/lib/theme';
import { useTheme } from '@/lib/use-theme';

type Props = { className?: string; size?: 'default' | 'small' };

/**
 * Labeled switch ("DARK MODE" + track). A real button with role=switch, so the
 * state is announced and Space/Enter work natively. Light is the default, dark
 * is opt-in (B13).
 */
export function ThemeToggle({ className = '', size = 'default' }: Props) {
  const dark = useTheme() === 'dark';
  const copy = chrome.ui.themeToggle;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={copy.label}
      data-size={size}
      className={`theme-toggle themed ${className}`.trim()}
      onClick={() => toggleTheme()}
    >
      <span className="theme-toggle-full">{copy.label}</span>
      <span className="theme-toggle-short" aria-hidden="true">
        {copy.short}
      </span>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
