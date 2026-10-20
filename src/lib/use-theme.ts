'use client';

import { useSyncExternalStore } from 'react';

import { getTheme, subscribeTheme, type Theme } from '@/lib/theme';

/** Current theme as React state. The server snapshot is always light. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme, () => 'light');
}
