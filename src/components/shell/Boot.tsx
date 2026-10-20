'use client';

import { useEffect, useLayoutEffect } from 'react';

import { features } from '@/content/features';
import { schedulePreloadAnimate } from '@/lib/animate';
import { markIntroDone } from '@/lib/intro-state';
import { scrollToSection } from '@/lib/scroll';
import { applyTheme, readStoredTheme } from '@/lib/theme';

type Props = { introEnabled?: boolean };

/**
 * Runs once per page load:
 * - re-applies the stored theme (React's dev remount clears <html> attributes),
 * - enables color transitions only after the first paint (`theme-ready`),
 * - re-aligns a deep link once web fonts have swapped in (the browser jumps
 *   to the hash before fonts load, and the swap can move the section).
 */
export function Boot({ introEnabled = features.intro }: Props) {
  useLayoutEffect(() => {
    applyTheme(readStoredTheme());
    // Head script cannot read content.features; clear a stuck data-intro=on.
    if (!introEnabled) markIntroDone();
  }, [introEnabled]);

  useEffect(() => schedulePreloadAnimate(), []);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        document.documentElement.classList.add('theme-ready');
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const raw = decodeURIComponent(window.location.hash.slice(1));
    const id = raw === 'inventory' ? 'stack' : raw;
    if (!id || !document.getElementById(id)) return;
    let cancelled = false;
    const realign = () => {
      if (!cancelled) scrollToSection(id, { updateHash: false, focus: false });
    };
    const fonts = document.fonts?.ready;
    if (fonts && typeof fonts.then === 'function') fonts.then(realign, () => {});
    else realign();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
