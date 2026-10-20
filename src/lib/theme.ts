import { readStorage, writeStorage } from '@/lib/storage';

export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';
export const THEME_COLORS: Record<Theme, string> = { light: '#FFFBF2', dark: '#0B0B0C' };

const EVENT = 'portfolio:themechange';

function isTheme(v: unknown): v is Theme {
  return v === 'light' || v === 'dark';
}

/** Stored choice wins; otherwise light. Never reads prefers-color-scheme. */
export function readStoredTheme(): Theme {
  const v = readStorage('local', THEME_KEY);
  return isTheme(v) ? v : 'light';
}

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const v = document.documentElement.getAttribute('data-theme');
  return isTheme(v) ? v : 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.getAttribute('data-theme') !== theme) root.setAttribute('data-theme', theme);
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (meta) meta.content = THEME_COLORS[theme];
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function setTheme(theme: Theme): void {
  writeStorage('local', THEME_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Subscribe to theme changes from this tab or another one. Returns an unsubscribe. */
export function subscribeTheme(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}
