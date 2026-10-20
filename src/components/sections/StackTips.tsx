'use client';

import { useEffect } from 'react';

const TIP_MS = 2500;

/**
 * Touch keycap + tooltip. Desktop hover is CSS. Loaded after idle.
 * Sets `.is-active` on one cell at a time (cleared on outside tap, scroll, Escape, or 2.5s).
 */
export default function StackTips() {
  useEffect(() => {
    const root = document.getElementById('stack');
    if (!root) return;

    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    let timer = 0;

    const clearTips = () => {
      window.clearTimeout(timer);
      root.querySelectorAll('.stack-tool.is-active').forEach((node) => {
        node.classList.remove('is-active');
      });
    };

    const clamp = (tool: HTMLElement) => {
      const tip = tool.querySelector<HTMLElement>('.stack-tip');
      const slab = root.querySelector('.stack-slab');
      if (!tip || !slab) return;
      tip.style.setProperty('--tip-shift', '0px');
      const slabBox = slab.getBoundingClientRect();
      const tipBox = tip.getBoundingClientRect();
      let shift = 0;
      if (tipBox.left < slabBox.left + 4) shift = slabBox.left + 4 - tipBox.left;
      else if (tipBox.right > slabBox.right - 4) shift = slabBox.right - 4 - tipBox.right;
      tip.style.setProperty('--tip-shift', `${Math.round(shift)}px`);
    };

    const onOver = (event: PointerEvent) => {
      const tool = (event.target as Element | null)?.closest?.('.stack-tool');
      if (tool instanceof HTMLElement && root.contains(tool)) clamp(tool);
    };

    const onDown = (event: PointerEvent) => {
      if (!coarse) return;
      const tool = (event.target as Element | null)?.closest?.('.stack-tool');
      if (!(tool instanceof HTMLElement) || !root.contains(tool)) {
        clearTips();
        return;
      }
      const open = tool.classList.contains('is-active');
      clearTips();
      if (!open) {
        tool.classList.add('is-active');
        clamp(tool);
        timer = window.setTimeout(clearTips, TIP_MS);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      clearTips();
      document.documentElement.classList.add('stack-tips-off');
    };

    const onMove = () => {
      document.documentElement.classList.remove('stack-tips-off');
    };

    const onScroll = () => {
      if (coarse) clearTips();
    };

    root.addEventListener('pointerover', onOver);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      window.clearTimeout(timer);
      root.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  return null;
}
