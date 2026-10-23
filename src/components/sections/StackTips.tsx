'use client';

import { useEffect } from 'react';

const TIP_MS = 2500;

/**
 * Touch keycap lift (names are always visible). Desktop hover is CSS. Loaded after idle.
 * Sets `.is-active` on one cell at a time (cleared on outside tap, scroll, Escape, or 2.5s).
 */
export default function StackTips() {
  useEffect(() => {
    const root = document.getElementById('stack');
    if (!root) return;

    if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    let timer = 0;

    const clearTips = () => {
      window.clearTimeout(timer);
      root.querySelectorAll('.stack-tool.is-active').forEach((node) => {
        node.classList.remove('is-active');
      });
    };

    const onDown = (event: PointerEvent) => {
      const tool = (event.target as Element | null)?.closest?.('.stack-tool');
      if (!(tool instanceof HTMLElement) || !root.contains(tool)) {
        clearTips();
        return;
      }
      const open = tool.classList.contains('is-active');
      clearTips();
      if (!open) {
        tool.classList.add('is-active');
        timer = window.setTimeout(clearTips, TIP_MS);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearTips();
    };

    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', clearTips, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', clearTips, true);
    };
  }, []);

  return null;
}
