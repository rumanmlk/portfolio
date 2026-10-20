import { STAGGER } from '@/lib/motion';

/**
 * Reveals that fire in the same frame get incremental delays (60ms stagger);
 * a lone reveal further down the page starts immediately.
 */
let count = 0;
let reset = 0;

export function nextStagger(): number {
  if (typeof window === 'undefined') return 0;
  const delay = count * STAGGER;
  count += 1;
  if (!reset) {
    reset = window.requestAnimationFrame(() => {
      reset = 0;
      count = 0;
    });
  }
  return delay;
}

/** Viewport check with a -10% margin, matching `viewport={{ margin: '-10%' }}`. */
export function isInView(el: Element, margin = 0.1): boolean {
  const r = el.getBoundingClientRect();
  const h = window.innerHeight;
  const w = window.innerWidth;
  return r.bottom > h * margin && r.top < h * (1 - margin) && r.right > 0 && r.left < w;
}
