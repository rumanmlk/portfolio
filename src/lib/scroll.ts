/**
 * Scroll utilities shared by the nav, Lenis and the intro. Lenis registers
 * itself here (phase 5) so other modules never import it directly.
 */

import { prefersReducedMotion } from '@/lib/device';

export type LenisLike = {
  scrollTo: (
    target: HTMLElement | number | string,
    options?: {
      offset?: number;
      immediate?: boolean;
      lock?: boolean;
      duration?: number;
      onComplete?: () => void;
    },
  ) => void;
  stop: () => void;
  start: () => void;
};

let lenis: LenisLike | null = null;

export function registerLenis(instance: LenisLike | null): void {
  lenis = instance;
}

export function getLenis(): LenisLike | null {
  return lenis;
}

/**
 * The gap above a section comes from its CSS `scroll-margin-top`
 * (24px on desktop, header + nav strip + 16px on mobile), so deep links,
 * Lenis and the native fallback all land in the same place (B6, B17).
 */
export function sectionMargin(el: Element): number {
  const v = parseFloat(getComputedStyle(el).scrollMarginTop);
  return Number.isNaN(v) ? 24 : v;
}

/**
 * Scroll to a section, update the hash without a jump, and move focus to the
 * section heading so keyboard and screen reader users land in the right place.
 */
export function scrollToSection(
  id: string,
  opts: { updateHash?: boolean; focus?: boolean } = {},
): void {
  if (typeof document === 'undefined') return;
  const { updateHash = true, focus = true } = opts;
  const target = document.getElementById(id);
  if (!target) return;

  const reduced = prefersReducedMotion();

  if (lenis && !reduced) {
    // Lenis 1.3 subtracts the target's scroll-margin-top itself. Sections use
    // content-visibility: auto, so their real height can differ from the intrinsic
    // estimate (WebKit lands ~450px short); re-aim until the heading is in place.
    const instance = lenis;
    let retries = 2;
    const settle = () => {
      const drift = target.getBoundingClientRect().top - sectionMargin(target);
      if (Math.abs(drift) <= 2 || retries-- <= 0) return;
      instance.scrollTo(target, { offset: 0, onComplete: settle });
    };
    instance.scrollTo(target, { offset: 0, onComplete: settle });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - sectionMargin(target);
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }

  if (updateHash) {
    try {
      history.replaceState(history.state, '', `#${id}`);
    } catch {
      /* ignore */
    }
  }

  if (focus) {
    const heading = target.querySelector<HTMLElement>('h2, h1, [data-section-heading]') ?? target;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}
