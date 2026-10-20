'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

import { features } from '@/content/features';
import { hasFinePointer, onReducedMotionChange, prefersReducedMotion } from '@/lib/device';
import { introIsPending, onIntroDone } from '@/lib/intro-state';
import { registerLenis, scrollToSection } from '@/lib/scroll';

type Props = { enabled?: boolean };

/**
 * Lenis smooth scrolling (B10): fine pointers only, motion allowed only, one
 * requestAnimationFrame loop, destroyed on unmount, reacts to live
 * prefers-reduced-motion changes. Also upgrades every in-page anchor click.
 */
export default function SmoothScroll({ enabled = features.smoothScroll }: Props) {
  useEffect(() => {
    if (!enabled) return;

    let lenis: Lenis | null = null;
    let raf = 0;
    let offIntro: (() => void) | null = null;

    const start = () => {
      if (lenis || !hasFinePointer() || prefersReducedMotion()) return;
      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        autoRaf: false,
        anchors: false,
      });
      registerLenis(lenis);
      if (introIsPending()) {
        // Scroll stays locked while the entry sequence runs (B11).
        lenis.stop();
        offIntro = onIntroDone(() => lenis?.start());
      }
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = window.requestAnimationFrame(loop);
      };
      raf = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      window.cancelAnimationFrame(raf);
      raf = 0;
      offIntro?.();
      offIntro = null;
      lenis?.destroy();
      lenis = null;
      registerLenis(null);
    };

    start();
    const offReduced = onReducedMotionChange((reduced) => (reduced ? stop() : start()));

    return () => {
      offReduced();
      stop();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const id = decodeURIComponent(anchor.getAttribute('href')?.slice(1) ?? '');
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToSection(id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [enabled]);

  return null;
}
